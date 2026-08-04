import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";

    const where: Record<string, unknown> = { companyId };

    if (fromDate && toDate) {
      where.transactionDate = {
        gte: new Date(fromDate),
        lte: new Date(toDate + "T23:59:59"),
      };
    } else if (fromDate) {
      where.transactionDate = { gte: new Date(fromDate) };
    } else if (toDate) {
      where.transactionDate = { lte: new Date(toDate + "T23:59:59") };
    }

    const [cashInResult, cashOutResult, totalCount, recentTxns] = await Promise.all([
      prisma.cashTransaction.aggregate({
        where: { ...where, transactionType: "Cash In" },
        _sum: { amount: true },
      }),
      prisma.cashTransaction.aggregate({
        where: { ...where, transactionType: "Cash Out" },
        _sum: { amount: true },
      }),
      prisma.cashTransaction.count({ where }),
      prisma.cashTransaction.findMany({
        where,
        include: {
          category: { select: { categoryName: true } },
          account: { select: { accountName: true } },
        },
        orderBy: { transactionDate: "desc" },
        take: 10,
      }),
    ]);

    const totalCashIn = Number(cashInResult._sum.amount) || 0;
    const totalCashOut = Number(cashOutResult._sum.amount) || 0;
    const netCashFlow = totalCashIn - totalCashOut;

    const recentTransactions = recentTxns.map((txn) => ({
      id: txn.id,
      date: txn.transactionDate.toLocaleDateString("en-IN"),
      type: txn.transactionType,
      category: txn.category?.categoryName || "-",
      account: txn.account?.accountName || "-",
      party: txn.partyName || "-",
      refNo: txn.referenceNo || "-",
      amount: Number(txn.amount),
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalCashIn,
        totalCashOut,
        netCashFlow,
        totalTransactions: totalCount,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Cash flow dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}