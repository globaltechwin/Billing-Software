import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateAdvanceOrderNumber } from "@/lib/number-generators";

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toBusinessDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const where: Record<string, unknown> = { companyId };

    if (status) where.orderStatus = status;
    if (fromDate) where.deliveryDate = { ...((where.deliveryDate as Record<string, Date>) || {}), gte: toBusinessDate(fromDate) };
    if (toDate) where.deliveryDate = { ...((where.deliveryDate as Record<string, Date>) || {}), lte: toBusinessDate(toDate) };

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerMobile: { contains: search } },
        { companyName: { contains: search } },
        { referenceNumber: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.advanceOrder.findMany({
        where,
        include: {
          items: true,
          createdByUser: { select: { id: true, name: true } },
          branch: { select: { id: true, branchName: true } },
        },
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.advanceOrder.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        orderDate: o.orderDate,
        deliveryDate: toISODate(o.deliveryDate),
        deliveryTime: o.deliveryTime || "",
        invoiceDate: toISODate(o.invoiceDate),
        noOfPax: o.noOfPax,
        categoryName: o.categoryName || "",
        serviceName: o.serviceName || "",
        customerMobile: o.customerMobile || "",
        customerName: o.customerName || "",
        address: o.address || "",
        landmark: o.landmark || "",
        additionalMobile: o.additionalMobile || "",
        customerGstNo: o.customerGstNo || "",
        companyName: o.companyName || "",
        referenceNumber: o.referenceNumber || "",
        remarks: o.remarks || "",
        subtotal: Number(o.subtotal),
        discountPercent: Number(o.discountPercent),
        discountAmount: Number(o.discountAmount),
        taxAmount: Number(o.taxAmount),
        grandTotal: Number(o.grandTotal),
        paidAmount: Number(o.paidAmount),
        dueAmount: Number(o.dueAmount),
        paymentMode: o.paymentMode,
        cashAmount: Number(o.cashAmount),
        cardAmount: Number(o.cardAmount),
        upiAmount: Number(o.upiAmount),
        walletAmount: Number(o.walletAmount),
        orderStatus: o.orderStatus,
        branchName: o.branch?.branchName || "",
        createdBy: o.createdByUser.name,
        createdAt: o.createdAt,
        items: o.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          discountPercent: Number(i.discountPercent),
          discountAmount: Number(i.discountAmount),
          taxPercent: Number(i.taxPercent),
          taxAmount: Number(i.taxAmount),
          totalAmount: Number(i.totalAmount),
        })),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Advance order list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const {
      deliveryDate, deliveryTime, invoiceDate, noOfPax,
      categoryName, serviceName,
      customerMobile, customerName, address, landmark,
      additionalMobile, customerGstNo, companyName, referenceNumber,
      remarks, items,
      discountPercent, discountAmount, taxAmount,
      paymentMode, cashAmount, cardAmount, upiAmount, walletAmount,
    } = body;

    if (!deliveryDate) return NextResponse.json({ error: "Delivery date is required" }, { status: 400 });
    if (!invoiceDate) return NextResponse.json({ error: "Invoice date is required" }, { status: 400 });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    const orderNumber = await generateAdvanceOrderNumber(companyId);

    const subtotal = items.reduce((sum: number, i: Record<string, unknown>) => sum + Number(i.unitPrice) * Number(i.quantity), 0);
    const effectiveDiscount = Number(discountAmount) || 0;
    const effectiveTax = Number(taxAmount) || 0;
    const grandTotal = subtotal - effectiveDiscount + effectiveTax;
    const effectiveCash = Number(cashAmount) || 0;
    const effectiveCard = Number(cardAmount) || 0;
    const effectiveUpi = Number(upiAmount) || 0;
    const effectiveWallet = Number(walletAmount) || 0;
    const paidAmount = effectiveCash + effectiveCard + effectiveUpi + effectiveWallet;
    const dueAmount = grandTotal - paidAmount;

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.advanceOrder.create({
        data: {
          companyId,
          orderNumber,
          deliveryDate: toBusinessDate(deliveryDate),
          deliveryTime: deliveryTime || null,
          invoiceDate: toBusinessDate(invoiceDate),
          noOfPax: noOfPax ? parseInt(String(noOfPax), 10) : null,
          categoryName: categoryName || null,
          serviceName: serviceName || null,
          customerMobile: customerMobile || null,
          customerName: customerName || null,
          address: address || null,
          landmark: landmark || null,
          additionalMobile: additionalMobile || null,
          customerGstNo: customerGstNo || null,
          companyName: companyName || null,
          referenceNumber: referenceNumber || null,
          remarks: remarks || null,
          subtotal,
          discountPercent: Number(discountPercent) || 0,
          discountAmount: effectiveDiscount,
          taxAmount: effectiveTax,
          grandTotal,
          paidAmount,
          dueAmount,
          paymentMode: paymentMode || "CASH",
          cashAmount: effectiveCash,
          cardAmount: effectiveCard,
          upiAmount: effectiveUpi,
          walletAmount: effectiveWallet,
          createdByUserId: userId,
          items: {
            create: items.map((i: Record<string, unknown>) => ({
              companyId,
              productId: i.productId ? parseInt(String(i.productId), 10) : null,
              productName: String(i.productName || ""),
              quantity: Number(i.quantity) || 1,
              unitPrice: Number(i.unitPrice) || 0,
              discountPercent: Number(i.discountPercent) || 0,
              discountAmount: Number(i.discountAmount) || 0,
              taxPercent: Number(i.taxPercent) || 0,
              taxAmount: Number(i.taxAmount) || 0,
              totalAmount: Number(i.totalAmount) || Number(i.unitPrice) * Number(i.quantity),
            })),
          },
        },
        include: {
          items: true,
          createdByUser: { select: { id: true, name: true } },
        },
      });
      return created;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        grandTotal: Number(order.grandTotal),
        dueAmount: Number(order.dueAmount),
        orderStatus: order.orderStatus,
        createdBy: order.createdByUser.name,
        createdAt: order.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Advance order creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.advanceOrder.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Advance order not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (fields.deliveryDate) data.deliveryDate = toBusinessDate(fields.deliveryDate);
    if (fields.deliveryTime !== undefined) data.deliveryTime = fields.deliveryTime || null;
    if (fields.invoiceDate) data.invoiceDate = toBusinessDate(fields.invoiceDate);
    if (fields.noOfPax !== undefined) data.noOfPax = fields.noOfPax ? parseInt(String(fields.noOfPax), 10) : null;
    if (fields.categoryName !== undefined) data.categoryName = fields.categoryName || null;
    if (fields.serviceName !== undefined) data.serviceName = fields.serviceName || null;
    if (fields.customerMobile !== undefined) data.customerMobile = fields.customerMobile || null;
    if (fields.customerName !== undefined) data.customerName = fields.customerName || null;
    if (fields.address !== undefined) data.address = fields.address || null;
    if (fields.landmark !== undefined) data.landmark = fields.landmark || null;
    if (fields.additionalMobile !== undefined) data.additionalMobile = fields.additionalMobile || null;
    if (fields.customerGstNo !== undefined) data.customerGstNo = fields.customerGstNo || null;
    if (fields.companyName !== undefined) data.companyName = fields.companyName || null;
    if (fields.referenceNumber !== undefined) data.referenceNumber = fields.referenceNumber || null;
    if (fields.remarks !== undefined) data.remarks = fields.remarks || null;
    if (fields.orderStatus !== undefined) data.orderStatus = fields.orderStatus;
    if (fields.discountPercent !== undefined) data.discountPercent = Number(fields.discountPercent) || 0;
    if (fields.discountAmount !== undefined) data.discountAmount = Number(fields.discountAmount) || 0;
    if (fields.taxAmount !== undefined) data.taxAmount = Number(fields.taxAmount) || 0;
    if (fields.paymentMode !== undefined) data.paymentMode = fields.paymentMode;
    if (fields.cashAmount !== undefined) data.cashAmount = Number(fields.cashAmount) || 0;
    if (fields.cardAmount !== undefined) data.cardAmount = Number(fields.cardAmount) || 0;
    if (fields.upiAmount !== undefined) data.upiAmount = Number(fields.upiAmount) || 0;
    if (fields.walletAmount !== undefined) data.walletAmount = Number(fields.walletAmount) || 0;
    data.updatedByUserId = userId;

    await prisma.$transaction(async (tx) => {
      await tx.advanceOrder.update({ where: { id }, data });

      if (fields.items && Array.isArray(fields.items)) {
        await tx.advanceOrderItem.deleteMany({ where: { advanceOrderId: id } });
        if (fields.items.length > 0) {
          await tx.advanceOrderItem.createMany({
            data: fields.items.map((i: Record<string, unknown>) => ({
              advanceOrderId: id,
              companyId,
              productId: i.productId ? parseInt(String(i.productId), 10) : null,
              productName: String(i.productName || ""),
              quantity: Number(i.quantity) || 1,
              unitPrice: Number(i.unitPrice) || 0,
              discountPercent: Number(i.discountPercent) || 0,
              discountAmount: Number(i.discountAmount) || 0,
              taxPercent: Number(i.taxPercent) || 0,
              taxAmount: Number(i.taxAmount) || 0,
              totalAmount: Number(i.totalAmount) || Number(i.unitPrice) * Number(i.quantity),
            })),
          });
        }
      }

      if (fields.subtotal !== undefined || fields.discountAmount !== undefined || fields.taxAmount !== undefined) {
        const ord = await tx.advanceOrder.findUnique({ where: { id }, select: { subtotal: true, discountAmount: true, taxAmount: true } });
        if (ord) {
          const total = Number(ord.subtotal) - Number(ord.discountAmount) + Number(ord.taxAmount);
          const paid = Number(data.cashAmount ?? existing.cashAmount) + Number(data.cardAmount ?? existing.cardAmount) + Number(data.upiAmount ?? existing.upiAmount) + Number(data.walletAmount ?? existing.walletAmount);
          await tx.advanceOrder.update({ where: { id }, data: { grandTotal: total, paidAmount: paid, dueAmount: total - paid } });
        }
      }
    });

    const updated = await prisma.advanceOrder.findUnique({
      where: { id },
      include: { items: true, createdByUser: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, order: { id: updated!.id, orderNumber: updated!.orderNumber, grandTotal: Number(updated!.grandTotal) } });
  } catch (error) {
    console.error("Advance order update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.advanceOrder.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Advance order not found" }, { status: 404 });

    await prisma.advanceOrder.update({
      where: { id },
      data: { orderStatus: "CANCELLED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Advance order cancel error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
