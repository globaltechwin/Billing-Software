import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const where: Prisma.InventoryLedgerWhereInput = { companyId };
    if (productId) {
      const parsedProductId = Number.parseInt(productId, 10);
      if (Number.isInteger(parsedProductId) && parsedProductId > 0) where.productId = parsedProductId;
    }

    const ledger = await prisma.inventoryLedger.findMany({
      where,
      include: { product: { select: { productName: true, unit: true } } },
      orderBy: { movementDate: "desc" },
      take: 500,
    });

    return NextResponse.json({ success: true, ledger });
  } catch (error) {
    console.error("Inventory ledger error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
