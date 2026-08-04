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

    const [salesAgg, purchaseAgg, expenseAgg, bills, itemRows] = await Promise.all([
      prisma.invoice.aggregate({
        where: { companyId, deletedAt: null, invoiceDate: { gte: start, lte: end } },
        _sum: { grandTotal: true },
      }),
      prisma.purchaseInvoice.aggregate({
        where: { companyId, invoiceDate: { gte: start, lte: end } },
        _sum: { grandTotal: true },
      }),
      prisma.expense.aggregate({
        where: { companyId, expenseDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.invoice.findMany({
        where: { companyId, deletedAt: null, invoiceDate: { gte: start, lte: end } },
        select: { id: true, customerId: true },
      }),
      prisma.invoiceItem.findMany({
        where: {
          invoice: { companyId, deletedAt: null, invoiceDate: { gte: start, lte: end } },
        },
        include: { product: { select: { productName: true, category: true } } },
        orderBy: [{ quantity: "desc" }],
      }),
    ]);

    const sales = Number(salesAgg._sum.grandTotal || 0);
    const purchases = Number(purchaseAgg._sum.grandTotal || 0);
    const expenses = Number(expenseAgg._sum.amount || 0);
    const grossProfit = sales - purchases;
    const netProfit = grossProfit - expenses;
    const totalBills = bills.length;
    const totalCustomers = new Set(bills.map((b) => b.customerId)).size;

    const ledger = await prisma.inventoryLedger.findMany({
      where: { movementDate: { lte: end } },
      orderBy: [{ productId: "asc" }, { movementDate: "asc" }],
    });
    const lastBalance = new Map<number, number>();
    for (const row of ledger) {
      lastBalance.set(row.productId, Number(row.balance));
    }
    const products = await prisma.product.findMany({
      where: { id: { in: [...lastBalance.keys()] } },
      select: { id: true, purchasePrice: true },
    });
    const stockValue = products.reduce(
      (sum, p) => sum + (lastBalance.get(p.id) || 0) * Number(p.purchasePrice),
      0
    );

    const rows = [
      { sNo: 1, particulars: "Total Sales", amount: sales },
      { sNo: 2, particulars: "Total Purchases", amount: purchases },
      { sNo: 3, particulars: "Total Expenses", amount: expenses },
      { sNo: 4, particulars: "Gross Profit", amount: grossProfit },
      { sNo: 5, particulars: "Net Profit", amount: netProfit },
      { sNo: 6, particulars: "Total Bills", amount: totalBills },
      { sNo: 7, particulars: "Total Customers", amount: totalCustomers },
      { sNo: 8, particulars: "Stock Value", amount: stockValue },
    ];

    const itemWise = itemRows.map((item, index) => ({
      sNo: index + 1,
      category: item.product?.category || "N/A",
      product: item.product?.productName || "",
      quantity: Number(item.quantity),
      amount: Number(item.totalAmount),
    }));

    return NextResponse.json({ success: true, rows, itemWise });
  } catch (error) {
    console.error("MIS report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
