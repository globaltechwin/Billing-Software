import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generatePurchaseInvoiceNumber } from "@/lib/number-generators";

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();
    const invoices = await prisma.purchaseInvoice.findMany({
      where: { companyId },
      include: {
        vendor: { select: { vendorName: true } },
        purchaseOrder: { select: { poNumber: true } },
        grn: { select: { grnNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, invoices });
  } catch (error) {
    console.error("Purchase invoice list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const {
      vendorId, vendorInvoiceNo, purchaseOrderId, grnId,
      subtotal, taxAmount, grandTotal, notes,
    } = body;

    if (!vendorId || !subtotal || !grandTotal) {
      return NextResponse.json({ error: "vendorId, subtotal, and grandTotal are required" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, companyId } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const invoiceNumber = await generatePurchaseInvoiceNumber(companyId);

    const invoice = await prisma.purchaseInvoice.create({
      data: {
        invoiceNumber,
        vendorInvoiceNo: vendorInvoiceNo || null,
        companyId,
        vendorId,
        purchaseOrderId: purchaseOrderId || null,
        grnId: grnId || null,
        subtotal,
        taxAmount: taxAmount || 0,
        grandTotal,
        paymentStatus: "PENDING",
        notes: notes || null,
        createdByUserId: userId,
      },
    });

    await prisma.vendor.update({
      where: { id: vendorId },
      data: { currentBalance: { increment: grandTotal } },
    });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error) {
    console.error("Purchase invoice creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
