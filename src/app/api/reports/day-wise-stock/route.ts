import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";
import { pad, formatDate } from "@/lib/report-utils";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const product = searchParams.get("product") || "";

    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    if (!start || !end) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: {
        companyId,
        ...(product ? { productName: { contains: product } } : {}),
      },
      select: { id: true, productName: true, purchasePrice: true },
      orderBy: { productName: "asc" },
    });

    if (products.length === 0) {
      return NextResponse.json({ success: true, rows: [] });
    }

    const productIds = products.map((p) => p.id);

    const openingRows = await prisma.inventoryLedger.findMany({
      where: { companyId, productId: { in: productIds }, movementDate: { lt: start } },
      orderBy: { movementDate: "desc" },
      distinct: ["productId"],
      select: { productId: true, balance: true },
    });
    const openingMap = new Map<number, number>(
      openingRows.map((r) => [r.productId, Number(r.balance)])
    );

    const ledger = await prisma.inventoryLedger.findMany({
      where: { companyId, productId: { in: productIds }, movementDate: { gte: start, lte: end } },
      select: { productId: true, quantityIn: true, quantityOut: true, movementDate: true },
      orderBy: [{ productId: "asc" }, { movementDate: "asc" }],
    });

    const dayMap = new Map<number, Map<string, { in: number; out: number }>>();
    for (const row of ledger) {
      const key = `${row.movementDate.getFullYear()}-${pad(row.movementDate.getMonth() + 1)}-${pad(row.movementDate.getDate())}`;
      let productDays = dayMap.get(row.productId);
      if (!productDays) {
        productDays = new Map();
        dayMap.set(row.productId, productDays);
      }
      const acc = productDays.get(key) || { in: 0, out: 0 };
      acc.in += Number(row.quantityIn);
      acc.out += Number(row.quantityOut);
      productDays.set(key, acc);
    }

    const days: string[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      days.push(`${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`);
      cursor.setDate(cursor.getDate() + 1);
    }

    const rows = [];
    for (const prod of products) {
      const productDays = dayMap.get(prod.id) || new Map<string, { in: number; out: number }>();
      let prevClose = openingMap.get(prod.id) ?? 0;
      for (const day of days) {
        const acc = productDays.get(day) || { in: 0, out: 0 };
        const closing = prevClose + acc.in - acc.out;
        rows.push({
          id: `${prod.id}-${day}`,
          sNo: rows.length + 1,
          date: formatDate(new Date(`${day}T12:00:00`)),
          productName: prod.productName,
          openingStock: prevClose,
          stockIn: acc.in,
          stockOut: acc.out,
          closingStock: closing,
          totalStockValue: closing * Number(prod.purchasePrice),
        });
        prevClose = closing;
      }
    }

    return NextResponse.json({
      success: true,
      rows,
    });
  } catch (error) {
    console.error("Day wise stock report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
