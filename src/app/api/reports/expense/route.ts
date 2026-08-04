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
    const vendor = searchParams.get("vendor") || "";

    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    if (!start || !end) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    const expenses = await prisma.expense.findMany({
      where: {
        companyId,
        expenseDate: { gte: start, lte: end },
        ...(vendor ? { vendor: { vendorName: { contains: vendor } } } : {}),
      },
      include: {
        expenseCategory: { select: { categoryName: true } },
        vendor: { select: { vendorName: true } },
      },
      orderBy: [{ expenseDate: "desc" }, { id: "desc" }],
    });

    const rows = expenses.map((e, index) => ({
      id: String(e.id),
      sNo: index + 1,
      receiptNo: e.expenseNumber,
      vendorName: e.vendor?.vendorName || "",
      expenseAmount: Number(e.amount),
      expenseDescription: e.description,
      categoryName: e.expenseCategory.categoryName,
      cancelledAmount: 0,
      expenseDate: formatDate(e.expenseDate),
      comments: e.comments || "",
      expensesStatus: "Approved",
    }));

    return NextResponse.json({ success: true, rows });
  } catch (error) {
    console.error("Expense report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
