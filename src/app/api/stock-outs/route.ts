import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateStockOutNumber } from "@/lib/number-generators";

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();
    const stockOuts = await prisma.stockOut.findMany({
      where: { companyId },
      include: {
        createdByUser: { select: { name: true } },
        items: { include: { product: { select: { id: true, productName: true, unit: true, currentStock: true, purchasePrice: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, stockOuts });
  } catch (error) {
    console.error("Stock out list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { items, notes, stockOutType, referenceNumber } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    // Validate all products exist and have sufficient stock
    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, companyId },
      });
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
      }
      if (Number(product.currentStock) < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for ${product.productName}. Available: ${product.currentStock}, Requested: ${item.quantity}`,
        }, { status: 400 });
      }
    }

    const stockOutNumber = await generateStockOutNumber(companyId);

    const result = await prisma.$transaction(async (tx) => {
      const stockOut = await tx.stockOut.create({
        data: {
          stockOutNumber,
          companyId,
          stockOutType: stockOutType || "PRODUCTION",
          referenceNumber: referenceNumber || null,
          status: "COMPLETED",
          notes: notes || null,
          createdByUserId: userId,
        },
      });

      // Create stock out items and update inventory
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        const rate = Number(product.purchasePrice);
        const amount = item.quantity * rate;
        const newBalance = Number(product.currentStock) - item.quantity;

        await tx.stockOutItem.create({
          data: {
            stockOutId: stockOut.id,
            productId: item.productId,
            quantity: item.quantity,
            rate,
            amount,
          },
        });

        // Reduce product stock
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: newBalance },
        });

        // Create inventory ledger entry
        await tx.inventoryLedger.create({
          data: {
            companyId,
            productId: item.productId,
            quantityIn: 0,
            quantityOut: item.quantity,
            balance: newBalance,
            referenceType: "SALE",
            referenceId: stockOut.id,
            referenceNumber: stockOutNumber,
            createdByUserId: userId,
          },
        });
      }

      return stockOut;
    });

    return NextResponse.json({ success: true, stockOut: result }, { status: 201 });
  } catch (error) {
    console.error("Stock out creation error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
