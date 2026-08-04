import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";
import { formatDate } from "@/lib/report-utils";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category") || "";
    const product = searchParams.get("product") || "";

    const products = await prisma.product.findMany({
      where: {
        companyId,
        ...(category ? { category: { contains: category } } : {}),
        ...(product ? { productName: { contains: product } } : {}),
      },
      select: {
        id: true,
        productName: true,
        productCode: true,
        category: true,
        unit: true,
        purchasePrice: true,
      },
      orderBy: { productName: "asc" },
    });

    if (products.length === 0) {
      return NextResponse.json({ success: true, rows: [] });
    }

    const productIds = products.map((p) => p.id);
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    const openingWhere: Prisma.InventoryLedgerWhereInput = {
      companyId,
      productId: { in: productIds },
    };
    if (start) openingWhere.movementDate = { lt: start };

    const openingRows = await prisma.inventoryLedger.findMany({
      where: openingWhere,
      orderBy: { movementDate: "desc" },
      distinct: ["productId"],
      select: { productId: true, balance: true },
    });
    const openingMap = new Map<number, number>(
      openingRows.map((r) => [r.productId, Number(r.balance)])
    );

    const closingWhere: Prisma.InventoryLedgerWhereInput = {
      companyId,
      productId: { in: productIds },
    };
    if (end) closingWhere.movementDate = { lte: end };

    const closingRows = await prisma.inventoryLedger.findMany({
      where: closingWhere,
      orderBy: { movementDate: "desc" },
      distinct: ["productId"],
      select: { productId: true, balance: true },
    });
    const closingMap = new Map<number, number>(
      closingRows.map((r) => [r.productId, Number(r.balance)])
    );

    const movementWhere: Prisma.InventoryLedgerWhereInput = {
      companyId,
      productId: { in: productIds },
    };
    if (start && end) {
      movementWhere.movementDate = { gte: start, lte: end };
    } else if (start) {
      movementWhere.movementDate = { gte: start };
    } else if (end) {
      movementWhere.movementDate = { lte: end };
    }

    const movementGroups = await prisma.inventoryLedger.groupBy({
      by: ["productId", "referenceType"],
      where: movementWhere,
      _sum: { quantityIn: true, quantityOut: true },
    });

    const inMap = new Map<number, number>();
    const outMap = new Map<number, number>();
    const billedMap = new Map<number, number>();

    for (const g of movementGroups) {
      const qIn = Number(g._sum.quantityIn || 0);
      const qOut = Number(g._sum.quantityOut || 0);
      inMap.set(g.productId, (inMap.get(g.productId) || 0) + qIn);
      if (g.referenceType === "SALE") {
        billedMap.set(g.productId, (billedMap.get(g.productId) || 0) + qOut);
      } else {
        outMap.set(g.productId, (outMap.get(g.productId) || 0) + qOut);
      }
    }

    const branch = await prisma.branch.findFirst({
      where: { companyId },
      select: { branchName: true },
    });

    const stockDate = endDate ? formatDate(new Date(`${endDate}T12:00:00`)) : formatDate(new Date());

    const rows = products.map((p, idx) => {
      const openingStock = openingMap.get(p.id) ?? 0;
      const closingStock = closingMap.get(p.id) ?? openingStock;
      const stockIn = inMap.get(p.id) || 0;
      const stockOut = outMap.get(p.id) || 0;
      const billed = billedMap.get(p.id) || 0;
      const totalStockOut = stockOut + billed;
      const stockUnitPrice = Number(p.purchasePrice);
      return {
        id: String(p.id),
        sNo: idx + 1,
        branchName: branch?.branchName || "",
        categoryName: p.category || "",
        productCode: p.productCode || "",
        productName: p.productName,
        uom: p.unit,
        stockDate,
        openingStock,
        stockIn,
        stockOut,
        billed,
        totalStockOut,
        closingStock,
        stockUnitPrice,
        totalPrice: closingStock * stockUnitPrice,
      };
    });

    return NextResponse.json({
      success: true,
      rows,
    });
  } catch (error) {
    console.error("Stock report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
