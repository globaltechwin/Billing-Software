import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = await getCurrentCompanyId();

    const { id } = await params;
    const invoiceId = parseInt(id, 10);

    if (isNaN(invoiceId)) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
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

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    let gstBreakup = null;
    if (invoice.gstMode === "GST_VISIBLE") {
      const totalCgst = invoice.items.reduce(
        (sum, item) => sum + Number(item.cgstAmount),
        0
      );
      const totalSgst = invoice.items.reduce(
        (sum, item) => sum + Number(item.sgstAmount),
        0
      );
      const totalIgst = invoice.items.reduce(
        (sum, item) => sum + Number(item.igstAmount),
        0
      );

      gstBreakup = {
        subtotal: Number(invoice.subtotal),
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
        tax: Number(invoice.taxAmount),
        grandTotal: Number(invoice.grandTotal),
      };
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        subtotal: invoice.subtotal,
        discountAmount: invoice.discountAmount,
        taxAmount: invoice.taxAmount,
        grandTotal: invoice.grandTotal,
        gstMode: invoice.gstMode,
        paymentStatus: invoice.paymentStatus,
        invoiceStatus: invoice.invoiceStatus,
        createdAt: invoice.createdAt,
        company: {
          id: invoice.company.id,
          companyName: invoice.company.companyName,
          gstNumber: invoice.company.gstNumber,
          gstStateCode: invoice.company.gstStateCode,
          stateName: invoice.company.stateName,
          address: invoice.company.address,
          phone: invoice.company.phone,
          email: invoice.company.email,
          logo: invoice.company.logo,
          panNumber: invoice.company.panNumber,
          city: invoice.company.city,
          pincode: invoice.company.pincode,
          bankAccountHolder: invoice.company.bankAccountHolder,
          bankAccountNumber: invoice.company.bankAccountNumber,
          bankIfsc: invoice.company.bankIfsc,
          bankName: invoice.company.bankName,
          bankBranch: invoice.company.bankBranch,
        },
        customer: invoice.customer
          ? {
              id: invoice.customer.id,
              customerName: invoice.customer.customerName,
              phone: invoice.customer.phone,
              email: invoice.customer.email,
              address: invoice.customer.address,
              stateCode: invoice.customer.stateCode,
              stateName: invoice.customer.stateName,
              gstNumber: invoice.customer.gstNumber,
            }
          : null,
        createdBy: invoice.createdByUser,
        items: invoice.items.map((item) => ({
          id: item.id,
          productName: item.productNameSnapshot,
          hsnCode: item.product.hsnCode,
          unit: item.product.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          gstPercentage: item.gstPercentage,
          cgstPercentage: item.cgstPercentage,
          sgstPercentage: item.sgstPercentage,
          igstPercentage: item.igstPercentage,
          cgstAmount: item.cgstAmount,
          sgstAmount: item.sgstAmount,
          igstAmount: item.igstAmount,
          taxAmount: item.taxAmount,
          totalAmount: item.totalAmount,
        })),
        gstBreakup,
      },
    });
  } catch (error) {
    console.error("Invoice detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = await getCurrentCompanyId();
    const { id } = await params;
    const invoiceId = parseInt(id, 10);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const body = await request.json();
    const { action, invoiceStatus, paymentStatus, remarks } = body;

    const existing = await prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Restore a soft-deleted invoice
    if (action === "restore") {
      if (!existing.deletedAt) {
        return NextResponse.json({ error: "Invoice is not deleted" }, { status: 400 });
      }

      const restored = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          deletedAt: null,
          deletedByUserId: null,
          deleteReason: null,
        },
      });

      return NextResponse.json({ success: true, invoice: restored });
    }

    // Regular status update
    const updateData: Record<string, unknown> = {};
    if (invoiceStatus) updateData.invoiceStatus = invoiceStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (remarks !== undefined) updateData.remarks = remarks;

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
    });

    return NextResponse.json({ success: true, invoice: updated });
  } catch (error) {
    console.error("Invoice update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const { id } = await params;
    const invoiceId = parseInt(id, 10);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const existing = await prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (existing.deletedAt) {
      return NextResponse.json({ error: "Invoice is already deleted" }, { status: 400 });
    }

    let reason: string | undefined;
    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // No body provided
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        deletedAt: new Date(),
        deletedByUserId: userId,
        deleteReason: reason || null,
      },
    });

    return NextResponse.json({ success: true, invoice: updated });
  } catch (error) {
    console.error("Invoice delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
