import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateAccountingInvoiceNumber } from "@/lib/number-generators";

const A4_FIELDS = [
  "challanNo", "transportationMode", "vehicleNo", "placeOfSupply",
  "billedToName", "billedToAddress", "billedToGstin", "billedToState", "billedToStateCode",
  "shippedToName", "shippedToAddress", "shippedToState", "shippedToStateCode",
  "bankAccountHolder", "bankAccountNumber", "bankIfsc", "bankName", "bankBranch",
];

function serializeInvoice(inv: Record<string, unknown>): Record<string, unknown> {
  const items = (inv.items as Record<string, unknown>[] || []).map((item) => ({
    id: item.id,
    item: item.item,
    description: item.description || "",
    unit: item.unit || "",
    qty: Number(item.quantity),
    rate: Number(item.unitPrice),
    amount: Number(item.amount),
  }));

  const result: Record<string, unknown> = {
    id: inv.id,
    invoiceNo: inv.invoiceNumber,
    documentType: inv.documentType || "Invoice",
    gstType: inv.gstType || "CGST_SGST",
    customerName: inv.customerName,
    status: inv.status,
    issueDate: inv.invoiceDate ? (inv.invoiceDate as Date).toLocaleDateString("en-IN") : "",
    dueDate: inv.dueDate ? (inv.dueDate as Date).toLocaleDateString("en-IN") : "",
    subtotal: Number(inv.subtotal),
    discount: Number(inv.discountAmount),
    taxAmount: Number(inv.taxAmount),
    total: Number(inv.total),
    paid: Number(inv.paidAmount),
    items,
    discountType: inv.discountType || "%",
    taxRate: Number(inv.taxRate),
    notes: inv.notes || "",
    terms: inv.terms || "",
  };

  for (const field of A4_FIELDS) {
    result[field] = inv[field] || "";
  }
  result.dateOfSupply = inv.dateOfSupply
    ? (inv.dateOfSupply as Date).toLocaleDateString("en-IN")
    : "";

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

    const where: Record<string, unknown> = { companyId };

    if (status && status !== "All") where.status = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customerName: { contains: search } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.accountingInvoice.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { items: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.accountingInvoice.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      invoices: invoices.map(serializeInvoice),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Accounting invoice list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const { customerName, status, invoiceDate, dueDate, discount, discountType, taxRate, notes, terms, items, paid, documentType, gstType } = body;

    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ error: "Customer is required" }, { status: 400 });
    }

    const itemRows: { item: string; description: string | null; unit: string | null; quantity: number; unitPrice: number; amount: number }[] = (items || []).map((item: Record<string, unknown>) => {
      const qty = Number(item.qty) || 0;
      const unitPrice = Number(item.rate) || 0;
      return {
        item: String(item.item ?? ""),
        description: item.description ? String(item.description) : null,
        unit: item.unit ? String(item.unit) : null,
        quantity: qty,
        unitPrice,
        amount: qty * unitPrice,
      };
    });

    const subtotal = itemRows.reduce((sum, i) => sum + Number(i.amount), 0);
    const discountAmt = discountType === "₹"
      ? Number(discount) || 0
      : subtotal * ((Number(discount) || 0) / 100);
    const taxRateVal = Number(taxRate) || 0;
    const taxAmount = (subtotal - discountAmt) * (taxRateVal / 100);
    const total = subtotal - discountAmt + taxAmount;

    const invoiceNumber = await generateAccountingInvoiceNumber(companyId);

    const a4Data: Record<string, unknown> = {};
    for (const field of A4_FIELDS) {
      if (body[field] !== undefined) a4Data[field] = body[field] || null;
    }
    if (body.dateOfSupply) a4Data.dateOfSupply = new Date(body.dateOfSupply);

    const invoice = await prisma.accountingInvoice.create({
      data: {
        companyId,
        invoiceNumber,
        documentType: documentType || "Invoice",
        gstType: gstType || "CGST_SGST",
        customerName: customerName.trim(),
        status: status || "Unpaid",
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal,
        discountAmount: discountAmt,
        discountType: discountType || "%",
        taxRate: taxRateVal,
        taxAmount,
        total,
        paidAmount: Number(paid) || 0,
        notes: notes || null,
        terms: terms || null,
        ...a4Data,
        createdByUserId: userId,
        updatedByUserId: userId,
        items: { create: itemRows },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, invoice: serializeInvoice(invoice) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Accounting invoice create error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const id = parseInt(String(body.id), 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.accountingInvoice.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const data: Record<string, unknown> = { updatedByUserId: userId };

    if (body.customerName !== undefined) data.customerName = String(body.customerName).trim();
    if (body.documentType !== undefined) data.documentType = body.documentType;
    if (body.gstType !== undefined) data.gstType = body.gstType;
    if (body.status !== undefined) data.status = body.status;
    if (body.invoiceDate !== undefined) data.invoiceDate = body.invoiceDate ? new Date(body.invoiceDate) : null;
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.discountType !== undefined) data.discountType = body.discountType;
    if (body.taxRate !== undefined) data.taxRate = Number(body.taxRate);
    if (body.notes !== undefined) data.notes = body.notes || null;
    if (body.terms !== undefined) data.terms = body.terms || null;
    if (body.paid !== undefined) data.paidAmount = Number(body.paid) || 0;

    for (const field of A4_FIELDS) {
      if (body[field] !== undefined) data[field] = body[field] || null;
    }
    if (body.dateOfSupply !== undefined) data.dateOfSupply = body.dateOfSupply ? new Date(body.dateOfSupply) : null;

    if (body.items !== undefined) {
      const itemRows = (body.items as Record<string, unknown>[]).map((item) => {
        const qty = Number(item.qty) || 0;
        const unitPrice = Number(item.rate) || 0;
        return {
          item: String(item.item ?? ""),
          description: item.description ? String(item.description) : null,
          unit: item.unit ? String(item.unit) : null,
          quantity: qty,
          unitPrice,
          amount: qty * unitPrice,
        };
      });

      const subtotal = itemRows.reduce((sum: number, i: { amount: number }) => sum + Number(i.amount), 0);
      const discountAmt = data.discountType === "₹"
        ? Number(body.discount) || 0
        : subtotal * ((Number(body.discount) || 0) / 100);
      const taxRateVal = Number(data.taxRate) || 0;
      data.subtotal = subtotal;
      data.discountAmount = discountAmt;
      data.taxAmount = (subtotal - discountAmt) * (taxRateVal / 100);
      data.total = subtotal - discountAmt + Number(data.taxAmount);

      await prisma.accountingInvoiceItem.deleteMany({ where: { accountingInvoiceId: id } });
      await prisma.accountingInvoiceItem.createMany({
        data: itemRows.map((row) => ({ ...row, accountingInvoiceId: id })),
      });
    }

    const updated = await prisma.accountingInvoice.update({
      where: { id },
      data,
      include: { items: true },
    });

    return NextResponse.json({ success: true, invoice: serializeInvoice(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Accounting invoice update error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.accountingInvoice.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    await prisma.accountingInvoice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Accounting invoice delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
