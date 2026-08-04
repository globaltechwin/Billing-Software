import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";
import { formatDate } from "@/lib/report-utils";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    if (!start || !end) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    const items = await prisma.invoiceItem.findMany({
      where: {
        invoice: { companyId, deletedAt: null, invoiceDate: { gte: start, lte: end } },
      },
      include: {
        product: { select: { productName: true, category: true, purchasePrice: true } },
        invoice: { select: { invoiceDate: true } },
      },
    });

    const grouped = new Map<string, {
      date: Date;
      category: string;
      productName: string;
      quantity: number;
      billValue: number;
      costValue: number;
    }>();

    for (const item of items) {
      const date = new Date(item.invoice.invoiceDate);
      const dayKey = date.toISOString().slice(0, 10);
      const key = `${item.productId}-${dayKey}`;
      const entry = grouped.get(key);
      const quantity = Number(item.quantity);
      const billValue = Number(item.totalAmount);
      const costValue = quantity * Number(item.product.purchasePrice);

      if (entry) {
        entry.quantity += quantity;
        entry.billValue += billValue;
        entry.costValue += costValue;
      } else {
        grouped.set(key, {
          date,
          category: item.product.category || "",
          productName: item.product.productName,
          quantity,
          billValue,
          costValue,
        });
      }
    }

    const rows = [...grouped.values()]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map((g, index) => {
        const profitValue = g.billValue - g.costValue;
        return {
          id: String(index + 1),
          sNo: index + 1,
          billDate: formatDate(g.date),
          category: g.category,
          productName: g.productName,
          quantity: g.quantity,
          billValue: g.billValue,
          costValue: g.costValue,
          profitValue,
          profitPercent: g.billValue > 0 ? (profitValue / g.billValue) * 100 : 0,
        };
      });

    return NextResponse.json({ success: true, rows });
  } catch (error) {
    console.error("Profit retail report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
