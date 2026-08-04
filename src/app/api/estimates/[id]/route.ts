import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = await getCurrentCompanyId();
    const { id } = await params;
    const estimateId = parseInt(id, 10);

    if (isNaN(estimateId)) {
      return NextResponse.json({ error: "Invalid estimate ID" }, { status: 400 });
    }

    const estimate = await prisma.estimate.findFirst({
      where: { id: estimateId, companyId },
      include: {
        company: true,
        customer: true,
        createdByUser: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { hsnCode: true, unit: true } },
          },
        },
      },
    });

    if (!estimate) {
      return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
    }

    const totalCgst = estimate.items.reduce((sum, i) => sum + Number(i.cgstAmount), 0);
    const totalSgst = estimate.items.reduce((sum, i) => sum + Number(i.sgstAmount), 0);
    const totalIgst = estimate.items.reduce((sum, i) => sum + Number(i.igstAmount), 0);

    return NextResponse.json({
      success: true,
      invoice: {
        id: estimate.id,
        invoiceNumber: estimate.estimateNumber,
        invoiceDate: estimate.estimateDate,
        subtotal: Number(estimate.subtotal),
        discountAmount: Number(estimate.discountAmount),
        taxAmount: Number(estimate.taxAmount),
        grandTotal: Number(estimate.grandTotal),
        gstMode: estimate.gstMode,
        paymentStatus: "PENDING",
        invoiceStatus: "QUOTATION",
        paymentMode: null,
        remarks: estimate.remarks,
        company: estimate.company,
        customer: estimate.customer,
        createdBy: estimate.createdByUser,
        items: estimate.items.map((item) => ({
          id: item.id,
          productName: item.productNameSnapshot,
          hsnCode: item.product?.hsnCode || null,
          unit: item.product?.unit || null,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
          gstPercentage: Number(item.gstPercentage),
          cgstPercentage: Number(item.cgstPercentage),
          sgstPercentage: Number(item.sgstPercentage),
          igstPercentage: Number(item.igstPercentage),
          cgstAmount: Number(item.cgstAmount),
          sgstAmount: Number(item.sgstAmount),
          igstAmount: Number(item.igstAmount),
          taxAmount: Number(item.taxAmount),
          totalAmount: Number(item.totalAmount),
        })),
        gstBreakup: {
          subtotal: Number(estimate.subtotal),
          cgst: totalCgst,
          sgst: totalSgst,
          igst: totalIgst,
          tax: Number(estimate.taxAmount),
          grandTotal: Number(estimate.grandTotal),
        },
      },
    });
  } catch (error) {
    console.error("Estimate fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
