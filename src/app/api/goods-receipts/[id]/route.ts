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
    const { notes, items } = body;

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

    const isDirect = !grn.purchaseOrderId;

    if (isDirect) {
      // ──── Direct GRN edit (no PO) ────
      const oldByProduct = new Map(grn.items.map((i) => [i.productId, i]));
      const deltas = new Map<number, number>();
      for (const oldItem of grn.items) {
        deltas.set(oldItem.productId, -Number(oldItem.receivedQty));
      }

      const newItems: Array<{
        goodsReceiptId: number;
        productId: number;
        orderedQty: null;
        receivedQty: number;
        pendingQty: null;
        batchNumber: string | null;
        expiryDate: Date | null;
      }> = [];

      for (const item of items) {
        if (!item.productId || !item.receivedQty || item.receivedQty <= 0) {
          throw new Error("Each item needs productId and receivedQty > 0");
        }
        const old = oldByProduct.get(item.productId);
        const oldReceived = old ? Number(old.receivedQty) : 0;
        const receivedQty = Number(item.receivedQty);
        deltas.set(item.productId, receivedQty - oldReceived);

        newItems.push({
          goodsReceiptId: grnId,
          productId: item.productId,
          orderedQty: null,
          receivedQty,
          pendingQty: null,
          batchNumber: item.batchNumber || null,
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
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
        }

        await tx.goodsReceiptItem.createMany({ data: newItems });

        for (const item of newItems) {
          if (item.receivedQty <= 0) continue;
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          const balance = product ? Number(product.currentStock) : 0;
          await tx.inventoryLedger.create({
            data: {
              companyId,
              productId: item.productId,
              quantityIn: item.receivedQty,
              quantityOut: 0,
              balance,
              referenceType: "PURCHASE",
              referenceId: grnId,
              referenceNumber: grn.grnNumber,
              createdByUserId: userId,
            },
          });
        }

        const grnStatus = newItems.every((i) => i.receivedQty > 0) ? GRNStatus.COMPLETED : GRNStatus.PARTIAL;

        return tx.goodsReceipt.update({
          where: { id: grnId },
          data: { notes: notes || null, status: grnStatus },
        });
      });

      return NextResponse.json({ success: true, grn: updated });
    }

    // ──── PO-based GRN edit ────
    const { purchaseOrderId } = body;
    if (!purchaseOrderId) {
      return NextResponse.json({ error: "purchaseOrderId is required for PO mode" }, { status: 400 });
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

    const poOldByProduct = new Map(grn.items.map((i) => [i.productId, i]));

    const poDeltas = new Map<number, number>();
    for (const oldItem of grn.items) {
      poDeltas.set(oldItem.productId, -Number(oldItem.receivedQty));
    }

    const poNewItems: Array<{
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

      const old = poOldByProduct.get(item.productId);
      const oldReceived = old ? Number(old.receivedQty) : 0;
      const receivedQty = Number(item.receivedQty);

      const maxAllowed =
        Number(poItem.quantity) - (Number(poItem.receivedQty) - oldReceived);
      if (receivedQty > maxAllowed) {
        throw new Error(`Cannot receive more than ordered for product ${item.productId}`);
      }

      poDeltas.set(item.productId, receivedQty - oldReceived);

      poNewItems.push({
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
      await tx.goodsReceiptItem.deleteMany({ where: { goodsReceiptId: grnId } });
      await tx.inventoryLedger.deleteMany({
        where: { companyId, referenceType: "PURCHASE", referenceId: grnId },
      });

      for (const [productId, delta] of poDeltas) {
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

      await tx.goodsReceiptItem.createMany({ data: poNewItems });

      for (const item of poNewItems) {
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

      const affectedProducts = [...poDeltas.keys()];
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

      const allReceived = poNewItems.every((i) => i.receivedQty > 0);
      const anyReceived = poNewItems.some((i) => i.receivedQty > 0);
      const grnStatus = !anyReceived
        ? GRNStatus.PENDING
        : allReceived
          ? GRNStatus.COMPLETED
          : GRNStatus.PARTIAL;

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
