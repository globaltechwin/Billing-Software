import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext } from "@/lib/company-context";

function parseDate(s: string | null, fallback: Date): Date {
  if (!s) return fallback;
  const d = new Date(s);
  return isNaN(d.getTime()) ? fallback : d;
}

function fmtDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await getCompanyContext();
    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get("fromDate");
    const toParam = searchParams.get("toDate");

    const now = new Date();
    const defaultTo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const defaultFrom = new Date(defaultTo);
    defaultFrom.setDate(defaultFrom.getDate() - 13);
    defaultFrom.setHours(0, 0, 0, 0);

    const fromDate = parseDate(fromParam, defaultFrom);
    const toDate = parseDate(toParam, defaultTo);

    const baseWhere = { companyId: ctx.companyId, deletedAt: null } as const;

    const invoices = await prisma.invoice.findMany({
      where: { ...baseWhere, createdAt: { gte: fromDate, lte: toDate } },
      select: {
        grandTotal: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            totalAmount: true,
            product: { select: { productName: true, category: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const expenses = await prisma.expense.findMany({
      where: { companyId: ctx.companyId, createdAt: { gte: fromDate, lte: toDate } },
      select: { amount: true, createdAt: true },
    });

    const invoicePayments = await prisma.invoicePayment.findMany({
      where: { companyId: ctx.companyId, createdAt: { gte: fromDate, lte: toDate } },
      select: { amount: true, paymentMethod: true, createdAt: true },
    });

    const dailyBillMap = new Map<string, { date: string; count: number; amount: number }>();
    for (const inv of invoices) {
      const key = fmtDate(new Date(inv.createdAt));
      const existing = dailyBillMap.get(key);
      if (existing) {
        existing.count += 1;
        existing.amount += Number(inv.grandTotal);
      } else {
        dailyBillMap.set(key, { date: key, count: 1, amount: Number(inv.grandTotal) });
      }
    }

    const productMap = new Map<string, { name: string; count: number; amount: number }>();
    for (const inv of invoices) {
      for (const item of inv.items) {
        const name = item.product.productName;
        const existing = productMap.get(name);
        const qty = Number(item.quantity);
        if (existing) {
          existing.count += qty;
          existing.amount += Number(item.totalAmount);
        } else {
          productMap.set(name, { name, count: qty, amount: Number(item.totalAmount) });
        }
      }
    }
    const topProducts = [...productMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((p, i) => ({
        ...p,
        color: ["#3b82f6", "#8b5cf6", "#ef4444", "#22c55e", "#f59e0b"][i % 5],
      }));

    const dailySalesMap = new Map<string, number>();
    for (const inv of invoices) {
      const key = fmtDate(new Date(inv.createdAt));
      dailySalesMap.set(key, (dailySalesMap.get(key) || 0) + Number(inv.grandTotal));
    }

    const totalPayments = invoicePayments.reduce((s, p) => s + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

    return NextResponse.json({
      success: true,
      billSummary: [...dailyBillMap.values()],
      topProducts,
      salesSummary: [...dailySalesMap.entries()].map(([date, amount]) => ({ date, amount })),
      paymentsExpenses: {
        payments: totalPayments,
        expenses: totalExpenses,
      },
    });
  } catch (error) {
    console.error("Dashboard chart API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
