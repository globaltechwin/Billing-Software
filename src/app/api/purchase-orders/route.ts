import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generatePONumber } from "@/lib/number-generators";

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();
    const orders = await prisma.purchaseOrder.findMany({
      where: { companyId },
      include: {
        vendor: { select: { vendorName: true, vendorCode: true } },
        items: { include: { product: { select: { id: true, productName: true, currentStock: true, purchasePrice: true } } } },
        createdByUser: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("PO list error:", error);
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { vendorId, branchId, expectedDelivery, items, notes } = body;

    if (!vendorId || !items || items.length === 0) {
      return NextResponse.json({ error: "vendorId and items are required" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, companyId } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const poNumber = await generatePONumber(companyId);

    let subtotal = 0;
    let totalTax = 0;
    const poItems: Array<{
      productId: number; quantity: number; receivedQty: number; unit: string;
      purchasePrice: number; discount: number; gstPercentage: number;
      cgstAmount: number; sgstAmount: number; igstAmount: number;
      taxAmount: number; lineTotal: number;
    }> = items.map((item: any) => {
      const itemSubtotal = item.quantity * item.purchasePrice;
      const discount = item.discount || 0;
      const afterDiscount = itemSubtotal - discount;
      const cgst = afterDiscount * (item.gstPercentage / 200);
      const sgst = afterDiscount * (item.gstPercentage / 200);
      const igst = afterDiscount * (item.gstPercentage / 100);
      const tax = cgst + sgst;
      const lineTotal = afterDiscount + tax;
      subtotal += afterDiscount;
      totalTax += tax;
      return {
        productId: item.productId,
        quantity: item.quantity,
        receivedQty: 0,
        unit: item.unit || "NOS",
        purchasePrice: item.purchasePrice,
        discount,
        gstPercentage: item.gstPercentage,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        taxAmount: tax,
        lineTotal,
      };
    });

    const grandTotal = subtotal + totalTax;

    const order = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          poNumber,
          companyId,
          vendorId,
          branchId: branchId || null,
          expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
          status: "DRAFT",
          subtotal,
          taxAmount: totalTax,
          grandTotal,
          notes: notes || null,
          createdByUserId: userId,
        },
      });
      await tx.purchaseOrderItem.createMany({
        data: poItems.map((item) => ({ ...item, purchaseOrderId: po.id })),
      });
      return po;
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("PO creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { id, status } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const order = await prisma.purchaseOrder.findFirst({ where: { id, companyId } });
    if (!order) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (status === "APPROVED") {
      if (order.status !== "PENDING" && order.status !== "DRAFT") {
        return NextResponse.json({ error: `Cannot approve PO in ${order.status} status` }, { status: 400 });
      }
      updateData.status = "APPROVED";
      updateData.approvedByUserId = userId;
    } else if (status === "CANCELLED") {
      if (order.status === "COMPLETED") {
        return NextResponse.json({ error: "Cannot cancel a completed PO" }, { status: 400 });
      }
      updateData.status = "CANCELLED";
    } else if (status === "PENDING") {
      updateData.status = "PENDING";
    }

    const updated = await prisma.purchaseOrder.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("PO update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
