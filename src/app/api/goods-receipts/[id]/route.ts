import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GRNStatus, POStatus } from "@prisma/client";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const companyId = await getCurrentCompanyId();
    const { id } = await context.params;
    const grnId = Number(id);

    const grn = await prisma.goodsReceipt.findFirst({
      where: { id: grnId, companyId },
      include: {
        vendor: { select: { id: true, vendorName: true, mobileNumber: true } },
        purchaseOrder: { select: { poNumber: true, status: true } },
        createdByUser: { select: { name: true, username: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productName: true,
                unit: true,
                purchasePrice: true,
                gstMaster: { select: { totalPercentage: true } },
                currentStock: true,
              },
            },
          },
        },
      },
    });

    if (!grn) {
      return NextResponse.json({ error: "Goods receipt not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, grn });
  } catch (error) {
    console.error("GRN detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const { id } = await context.params;
    const grnId = Number(id);
    const body = await request.json();
    const { purchaseOrderId, notes, items } = body;

    if (!purchaseOrderId) {
      return NextResponse.json({ error: "purchaseOrderId is required" }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "items are required" }, { status: 400 });
    }

    const grn = await prisma.goodsReceipt.findFirst({
      where: { id: grnId, companyId },
      include: { items: true },
    });
    if (!grn) {
      return NextResponse.json({ error: "Goods receipt not found" }, { status: 404 });
    }
    if (grn.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot edit a cancelled goods receipt" }, { status: 400 });
    }

    const po = await prisma.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, companyId },
      include: { items: true },
    });
    if (!po) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }
    if (po.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot edit goods receipt for a cancelled PO" }, { status: 400 });
    }

    const oldByProduct = new Map(grn.items.map((i) => [i.productId, i]));

    // Deltas start as full reversal for items that may be removed in this edit
    const deltas = new Map<number, number>();
    for (const oldItem of grn.items) {
      deltas.set(oldItem.productId, -Number(oldItem.receivedQty));
    }

    const newItems: Array<{
      goodsReceiptId: number;
      productId: number;
      orderedQty: number;
      receivedQty: number;
      pendingQty: number;
      batchNumber: string | null;
      expiryDate: Date | null;
    }> = [];

    for (const item of items) {
      const poItem = po.items.find((pi) => pi.productId === item.productId);
      if (!poItem) {
        throw new Error(`Product ${item.productId} not found in PO`);
      }

      const old = oldByProduct.get(item.productId);
      const oldReceived = old ? Number(old.receivedQty) : 0;
      const receivedQty = Number(item.receivedQty);

      // Max this GRN may receive = ordered - (qty received by OTHER grns on this PO)
      const maxAllowed =
        Number(poItem.quantity) - (Number(poItem.receivedQty) - oldReceived);
      if (receivedQty > maxAllowed) {
        throw new Error(`Cannot receive more than ordered for product ${item.productId}`);
      }

      deltas.set(item.productId, receivedQty - oldReceived);

      newItems.push({
        goodsReceiptId: grnId,
        productId: item.productId,
        orderedQty: Number(poItem.quantity),
        receivedQty,
        pendingQty: Math.max(0, maxAllowed - receivedQty),
        batchNumber: item.batchNumber || null,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Revert old GRN items + ledger, then re-apply the edited quantities
      await tx.goodsReceiptItem.deleteMany({ where: { goodsReceiptId: grnId } });
      await tx.inventoryLedger.deleteMany({
        where: { companyId, referenceType: "PURCHASE", referenceId: grnId },
      });

      for (const [productId, delta] of deltas) {
        if (delta === 0) continue;
        await tx.product.update({
          where: { id: productId },
          data: { currentStock: { increment: delta } },
        });
        await tx.purchaseOrderItem.updateMany({
          where: { purchaseOrderId, productId },
          data: { receivedQty: { increment: delta } },
        });
      }

      await tx.goodsReceiptItem.createMany({ data: newItems });

      for (const item of newItems) {
        if (item.receivedQty <= 0) continue;
        await tx.inventoryLedger.create({
          data: {
            companyId,
            productId: item.productId,
            quantityIn: item.receivedQty,
            quantityOut: 0,
            balance: 0,
            referenceType: "PURCHASE",
            referenceId: grnId,
            referenceNumber: grn.grnNumber,
            createdByUserId: userId,
          },
        });
      }

      // Recompute the balance chain for every affected product so reports stay consistent
      const affectedProducts = [...deltas.keys()];
      for (const productId of affectedProducts) {
        const entries = await tx.inventoryLedger.findMany({
          where: { companyId, productId },
          orderBy: [{ movementDate: "asc" }, { id: "asc" }],
        });
        let running = 0;
        for (const entry of entries) {
          running += Number(entry.quantityIn) - Number(entry.quantityOut);
          await tx.inventoryLedger.update({
            where: { id: entry.id },
            data: { balance: running },
          });
        }
        await tx.product.update({
          where: { id: productId },
          data: { currentStock: running },
        });
      }

      // Recompute GRN status
      const allReceived = newItems.every((i) => i.receivedQty > 0);
      const anyReceived = newItems.some((i) => i.receivedQty > 0);
      const grnStatus = !anyReceived
        ? GRNStatus.PENDING
        : allReceived
          ? GRNStatus.COMPLETED
          : GRNStatus.PARTIAL;

      // Recompute PO status
      const poItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId },
      });
      const poTotalReceived = poItems.every(
        (pi) => Number(pi.receivedQty) >= Number(pi.quantity)
      );
      const poAnyReceived = poItems.some((pi) => Number(pi.receivedQty) > 0);
      const poStatus = poTotalReceived
        ? POStatus.COMPLETED
        : poAnyReceived
          ? POStatus.PARTIALLY_RECEIVED
          : po.status;

      await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { status: poStatus },
      });

      return tx.goodsReceipt.update({
        where: { id: grnId },
        data: {
          purchaseOrderId,
          notes: notes || null,
          status: grnStatus,
        },
      });
    });

    return NextResponse.json({ success: true, grn: updated });
  } catch (error) {
    console.error("GRN update error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
