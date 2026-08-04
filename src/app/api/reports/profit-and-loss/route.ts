import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

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

    const [invoiceAgg, expenseAgg, stockRows] = await Promise.all([
      prisma.invoice.aggregate({
        where: { companyId, deletedAt: null, invoiceDate: { gte: start, lte: end } },
        _sum: { grandTotal: true },
      }),
      prisma.expense.aggregate({
        where: { companyId, expenseDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.inventoryLedger.findMany({
        where: { movementDate: { gte: start, lte: end } },
        include: { product: { select: { purchasePrice: true } } },
      }),
    ]);

    const sales = Number(invoiceAgg._sum.grandTotal || 0);
    const expenses = Number(expenseAgg._sum.amount || 0);
    const stockIn = stockRows.reduce(
      (sum, r) => sum + Number(r.quantityIn) * Number(r.product.purchasePrice),
      0
    );
    const stockOut = stockRows.reduce(
      (sum, r) => sum + Number(r.quantityOut) * Number(r.product.purchasePrice),
      0
    );

    const rows = [
      { id: "1", sNo: 1, particulars: "Total Sales", amount: sales, type: "income" as const },
      { id: "2", sNo: 2, particulars: "Stock IN", amount: stockIn, type: "income" as const },
      { id: "3", sNo: 3, particulars: "Total Expenses", amount: expenses, type: "expense" as const },
      { id: "4", sNo: 4, particulars: "Stock Out", amount: stockOut, type: "expense" as const },
    ];

    return NextResponse.json({ success: true, rows });
  } catch (error) {
    console.error("Profit and loss report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
