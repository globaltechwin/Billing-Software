import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateVendorPaymentNumber } from "@/lib/number-generators";

const PAYMENT_METHODS = ["CASH", "BANK", "UPI", "CARD", "CHEQUE", "WALLET"] as const;
const TRANSACTION_TYPES = ["Credit", "Payment"] as const;
const NOTES_MAX = 500;

function isValidDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

function balanceEffect(type: string, amount: number): number {
  return type === "Credit" ? amount : -amount;
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const vendorId = searchParams.get("vendorId");
    const type = searchParams.get("type");
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const where: Record<string, unknown> = { companyId };

    if (fromDate && isValidDate(fromDate)) {
      where.paymentDate = {
        ...((where.paymentDate as Record<string, Date>) || {}),
        gte: new Date(`${fromDate}T00:00:00`),
      };
    }
    if (toDate && isValidDate(toDate)) {
      where.paymentDate = {
        ...((where.paymentDate as Record<string, Date>) || {}),
        lte: new Date(`${toDate}T23:59:59.999`),
      };
    }
    if (vendorId && !Number.isNaN(parseInt(vendorId, 10))) {
      where.vendorId = parseInt(vendorId, 10);
    }
    if (type && TRANSACTION_TYPES.includes(type as (typeof TRANSACTION_TYPES)[number])) {
      where.transactionType = type === "Credit" ? "CREDIT" : "PAYMENT";
    }
    if (search) {
      where.OR = [
        { paymentNumber: { contains: search } },
        { referenceNumber: { contains: search } },
        { notes: { contains: search } },
        { vendor: { vendorName: { contains: search } } },
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.vendorPayment.findMany({
        where,
        include: {
          vendor: { select: { id: true, vendorName: true } },
          purchaseInvoice: { select: { id: true, invoiceNumber: true } },
          createdByUser: { select: { id: true, name: true } },
          updatedByUser: { select: { id: true, name: true } },
        },
        orderBy: [{ paymentDate: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vendorPayment.count({ where }),
    ]);

    const result = payments.map((p) => ({
      id: p.id,
      paymentNumber: p.paymentNumber,
      vendorId: p.vendorId,
      vendorName: p.vendor.vendorName,
      purchaseInvoiceId: p.purchaseInvoiceId,
      purchaseInvoiceNumber: p.purchaseInvoice?.invoiceNumber || "",
      paymentDate: p.paymentDate,
      transactionType: p.transactionType === "CREDIT" ? "Credit" : "Payment",
      paymentMethod: p.paymentMethod,
      referenceNumber: p.referenceNumber || "",
      notes: p.notes || "",
      amount: Number(p.amount),
      createdBy: p.createdByUser.name,
      createdById: p.createdByUserId,
      createdDate: p.createdAt,
      updatedBy: p.updatedByUser?.name || "",
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      payments: result,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Vendor payment list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { vendorId, transactionDate, transactionType, paymentMethod, amount, referenceNumber, notes, purchaseInvoiceId } = body;

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor is required" }, { status: 400 });
    }
    if (!transactionDate || !isValidDate(transactionDate)) {
      return NextResponse.json({ error: "Transaction date is required" }, { status: 400 });
    }
    if (!transactionType || !TRANSACTION_TYPES.includes(transactionType)) {
      return NextResponse.json({ error: "Transaction type must be Credit or Payment" }, { status: 400 });
    }
    if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment mode" }, { status: 400 });
    }
    if (amount === undefined || amount === null || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "Amount is required and must be a positive number" }, { status: 400 });
    }
    if (notes && String(notes).length > NOTES_MAX) {
      return NextResponse.json({ error: `Remarks cannot exceed ${NOTES_MAX} characters` }, { status: 400 });
    }

    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, companyId } });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const paymentNumber = await generateVendorPaymentNumber(companyId);
    const type = transactionType === "Credit" ? "CREDIT" : "PAYMENT";
    const amt = Number(amount);

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.vendorPayment.create({
        data: {
          paymentNumber,
          companyId,
          vendorId,
          purchaseInvoiceId: purchaseInvoiceId || null,
          paymentDate: new Date(transactionDate),
          amount: amt,
          paymentMethod,
          transactionType: type,
          referenceNumber: referenceNumber?.trim() || null,
          notes: notes?.trim() || null,
          createdByUserId: userId,
        },
        include: {
          vendor: { select: { id: true, vendorName: true } },
          createdByUser: { select: { id: true, name: true } },
        },
      });

      await tx.vendor.update({
        where: { id: vendorId },
        data: { currentBalance: { increment: balanceEffect(transactionType, amt) } },
      });

      if (purchaseInvoiceId) {
        const invoice = await tx.purchaseInvoice.findUnique({ where: { id: purchaseInvoiceId } });
        if (invoice) {
          const totalPaid = await tx.vendorPayment.aggregate({
            where: { purchaseInvoiceId },
            _sum: { amount: true },
          });
          const paidAmount = Number(totalPaid._sum.amount || 0);
          const newStatus = paidAmount >= Number(invoice.grandTotal) ? "PAID" : "PARTIALLY_PAID";
          await tx.purchaseInvoice.update({
            where: { id: purchaseInvoiceId },
            data: { paymentStatus: newStatus },
          });
        }
      }

      return payment;
    });

    return NextResponse.json(
      {
        success: true,
        payment: {
          id: result.id,
          paymentNumber: result.paymentNumber,
          vendorId: result.vendorId,
          vendorName: result.vendor.vendorName,
          paymentDate: result.paymentDate,
          transactionType: result.transactionType === "CREDIT" ? "Credit" : "Payment",
          paymentMethod: result.paymentMethod,
          referenceNumber: result.referenceNumber || "",
          notes: result.notes || "",
          amount: Number(result.amount),
          createdBy: result.createdByUser.name,
          createdDate: result.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vendor payment creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.vendorPayment.findFirst({
      where: { id, companyId },
      include: { vendor: { select: { id: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (fields.transactionDate !== undefined && !isValidDate(fields.transactionDate)) {
      return NextResponse.json({ error: "Transaction date is required" }, { status: 400 });
    }
    if (fields.transactionType !== undefined && !TRANSACTION_TYPES.includes(fields.transactionType)) {
      return NextResponse.json({ error: "Transaction type must be Credit or Payment" }, { status: 400 });
    }
    if (fields.paymentMethod !== undefined && !PAYMENT_METHODS.includes(fields.paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment mode" }, { status: 400 });
    }
    if (
      fields.amount !== undefined &&
      (Number.isNaN(Number(fields.amount)) || Number(fields.amount) <= 0)
    ) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }
    if (fields.notes !== undefined && String(fields.notes).length > NOTES_MAX) {
      return NextResponse.json({ error: `Remarks cannot exceed ${NOTES_MAX} characters` }, { status: 400 });
    }

    let vendorId = existing.vendorId;
    if (fields.vendorId !== undefined) {
      const vendor = await prisma.vendor.findFirst({ where: { id: fields.vendorId, companyId } });
      if (!vendor) {
        return NextResponse.json({ error: "Vendor not found in your company" }, { status: 404 });
      }
      vendorId = fields.vendorId;
    }

    const newAmount = fields.amount !== undefined ? Number(fields.amount) : Number(existing.amount);
    const newType = fields.transactionType !== undefined ? fields.transactionType : existing.transactionType === "CREDIT" ? "Credit" : "Payment";
    const oldEffect = balanceEffect(existing.transactionType === "CREDIT" ? "Credit" : "Payment", Number(existing.amount));

    const data: Record<string, unknown> = {};
    if (fields.transactionDate !== undefined) data.paymentDate = new Date(fields.transactionDate);
    if (fields.transactionType !== undefined) data.transactionType = fields.transactionType === "Credit" ? "CREDIT" : "PAYMENT";
    if (fields.vendorId !== undefined) data.vendorId = vendorId;
    if (fields.paymentMethod !== undefined) data.paymentMethod = fields.paymentMethod;
    if (fields.amount !== undefined) data.amount = newAmount;
    if (fields.referenceNumber !== undefined) data.referenceNumber = fields.referenceNumber?.trim() || null;
    if (fields.notes !== undefined) data.notes = fields.notes?.trim() || null;
    data.updatedByUserId = userId;

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.vendorPayment.update({
        where: { id },
        data,
        include: {
          vendor: { select: { id: true, vendorName: true } },
          createdByUser: { select: { id: true, name: true } },
          updatedByUser: { select: { id: true, name: true } },
        },
      });

      const newEffect = balanceEffect(newType, newAmount);
      if (vendorId === existing.vendorId) {
        const delta = newEffect - oldEffect;
        if (delta !== 0) {
          await tx.vendor.update({
            where: { id: vendorId },
            data: { currentBalance: { increment: delta } },
          });
        }
      } else {
        await tx.vendor.update({
          where: { id: existing.vendorId },
          data: { currentBalance: { decrement: oldEffect } },
        });
        await tx.vendor.update({
          where: { id: vendorId },
          data: { currentBalance: { increment: newEffect } },
        });
      }

      return payment;
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: result.id,
        paymentNumber: result.paymentNumber,
        vendorId: result.vendorId,
        vendorName: result.vendor.vendorName,
        paymentDate: result.paymentDate,
        transactionType: result.transactionType === "CREDIT" ? "Credit" : "Payment",
        paymentMethod: result.paymentMethod,
        referenceNumber: result.referenceNumber || "",
        notes: result.notes || "",
        amount: Number(result.amount),
        createdBy: result.createdByUser.name,
        createdDate: result.createdAt,
        updatedBy: result.updatedByUser?.name || "",
        updatedAt: result.updatedAt,
      },
    });
  } catch (error) {
    console.error("Vendor payment update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.vendorPayment.findFirst({
      where: { id, companyId },
      include: { vendor: { select: { id: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.vendorPayment.delete({ where: { id } });
      await tx.vendor.update({
        where: { id: existing.vendorId },
        data: { currentBalance: { decrement: balanceEffect(existing.transactionType === "CREDIT" ? "Credit" : "Payment", Number(existing.amount)) } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vendor payment delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
