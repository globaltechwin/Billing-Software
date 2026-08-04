import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GRNStatus, POStatus } from "@prisma/client";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateGRNNumber } from "@/lib/number-generators";

interface GrnItemInput {
  productId: number;
  receivedQty: number;
  batchNumber?: string | null;
  expiryDate?: string | null;
}

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();
    const receipts = await prisma.goodsReceipt.findMany({
      where: { companyId },
      include: {
        vendor: { select: { vendorName: true } },
        purchaseOrder: { select: { poNumber: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productName: true,
                unit: true,
                purchasePrice: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, receipts });
  } catch (error) {
    console.error("GRN list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { purchaseOrderId, items, notes } = body;

    if (!purchaseOrderId || !items || items.length === 0) {
      return NextResponse.json({ error: "purchaseOrderId and items are required" }, { status: 400 });
    }

    const po = await prisma.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, companyId },
      include: { items: true },
    });
    if (!po) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    if (po.status === "CANCELLED" || po.status === "COMPLETED") {
      return NextResponse.json({ error: `Cannot receive goods for ${po.status} PO` }, { status: 400 });
    }

    const grnNumber = await generateGRNNumber(companyId);

    let allComplete = true;
    const grnItems: Array<{
      productId: number; orderedQty: number; receivedQty: number; pendingQty: number;
      batchNumber: string | null; expiryDate: Date | null;
    }> = items.map((item: GrnItemInput) => {
      const poItem = po.items.find((pi) => pi.productId === item.productId);
      if (!poItem) throw new Error(`Product ${item.productId} not found in PO`);

      const receivedQty = item.receivedQty;
      const pendingQty = Number(poItem.quantity) - Number(poItem.receivedQty) - receivedQty;
      if (pendingQty < 0) throw new Error(`Cannot receive more than ordered for product ${item.productId}`);
      if (receivedQty > 0 && pendingQty > 0) allComplete = false;
      if (pendingQty === 0) allComplete = false;

      return {
        productId: item.productId,
        orderedQty: Number(poItem.quantity),
        receivedQty,
        pendingQty: Math.max(0, pendingQty),
        batchNumber: item.batchNumber || null,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      };
    });

    const grnStatus = grnItems.every((i) => i.receivedQty === 0) ? "PENDING" : allComplete ? "COMPLETED" : "PARTIAL";

    const result = await prisma.$transaction(async (tx) => {
      const grn = await tx.goodsReceipt.create({
        data: {
          grnNumber,
          companyId,
          purchaseOrderId,
          vendorId: po.vendorId,
          branchId: po.branchId,
          status: grnStatus as GRNStatus,
          notes: notes || null,
          createdByUserId: userId,
        },
      });

      await tx.goodsReceiptItem.createMany({
        data: grnItems.map((item) => ({ ...item, goodsReceiptId: grn.id })),
      });

      for (const item of grnItems) {
        if (item.receivedQty > 0) {
          await tx.purchaseOrderItem.updateMany({
            where: { purchaseOrderId, productId: item.productId },
            data: { receivedQty: { increment: item.receivedQty } },
          });

          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            const newBalance = Number(product.currentStock) + item.receivedQty;
            await tx.product.update({
              where: { id: item.productId },
              data: { currentStock: newBalance },
            });
            await tx.inventoryLedger.create({
              data: {
                companyId,
                productId: item.productId,
                quantityIn: item.receivedQty,
                quantityOut: 0,
                balance: newBalance,
                referenceType: "PURCHASE",
                referenceId: grn.id,
                referenceNumber: grnNumber,
                createdByUserId: userId,
              },
            });
          }
        }
      }

      const poItems = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId } });
      const totalReceived = poItems.every((pi) => Number(pi.receivedQty) >= Number(pi.quantity));
      const anyReceived = poItems.some((pi) => Number(pi.receivedQty) > 0);
      const newStatus = totalReceived ? POStatus.COMPLETED : anyReceived ? POStatus.PARTIALLY_RECEIVED : po.status;
      await tx.purchaseOrder.update({ where: { id: purchaseOrderId }, data: { status: newStatus } });

      return grn;
    });

    return NextResponse.json({ success: true, grn: result }, { status: 201 });
  } catch (error) {
    console.error("GRN creation error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
