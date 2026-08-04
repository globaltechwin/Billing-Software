import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext, getUserRole } from "@/lib/company-context";

export async function GET() {
  try {
    const ctx = await getCompanyContext();
    const roleName = await getUserRole(ctx);
    const isSuperAdmin = ctx.username === "superadmin" || roleName === "Owner";

    const company = await prisma.company.findUnique({
      where: { id: ctx.companyId },
      select: {
        id: true,
        companyName: true,
        shortCode: true,
        logo: true,
        licenseDate: true,
        createdAt: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const branches = await prisma.branch.findMany({
      where: { companyId: ctx.companyId, isActive: true },
      select: { id: true, branchName: true, isDefault: true },
      orderBy: { isDefault: "desc" },
    });

    const defaultBranch =
      branches.length === 1
        ? branches[0]
        : branches.find((b) => b.isDefault) || branches[0] || null;

    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { name: true, username: true, profileImage: true },
    });

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    const baseInvoiceWhere = { companyId: ctx.companyId, deletedAt: null } as const;

    const [
      todayBills,
      todaySales,
      totalCustomers,
      totalProducts,
      totalSales,
      thisWeekSales,
      lastWeekSales,
      thisMonthSales,
      todayExpenses,
    ] = await Promise.all([
      prisma.invoice.count({
        where: { ...baseInvoiceWhere, createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.invoice.aggregate({
        where: { ...baseInvoiceWhere, createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { grandTotal: true },
      }),
      prisma.customer.count({ where: { companyId: ctx.companyId } }),
      prisma.product.count({ where: { companyId: ctx.companyId, isActive: true } }),
      prisma.invoice.aggregate({
        where: baseInvoiceWhere,
        _sum: { grandTotal: true },
      }),
      prisma.invoice.aggregate({
        where: { ...baseInvoiceWhere, createdAt: { gte: weekStart } },
        _sum: { grandTotal: true },
      }),
      prisma.invoice.aggregate({
        where: { ...baseInvoiceWhere, createdAt: { gte: lastWeekStart, lt: lastWeekEnd } },
        _sum: { grandTotal: true },
      }),
      prisma.invoice.aggregate({
        where: { ...baseInvoiceWhere, createdAt: { gte: monthStart } },
        _sum: { grandTotal: true },
      }),
      prisma.expense.aggregate({
        where: { companyId: ctx.companyId, createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      isSuperAdmin,
      company: {
        companyName: company.companyName,
        shortCode: company.shortCode || "",
        logo: company.logo,
        licenseDate: company.licenseDate?.toISOString() || null,
        registeredDate: company.createdAt.toISOString(),
      },
      branch: defaultBranch?.branchName || null,
      branchCount: branches.length,
      user: {
        name: user?.name || "",
        username: user?.username || "",
        profileImage: user?.profileImage || null,
      },
      stats: {
        todayBills,
        todaySales: Number(todaySales._sum.grandTotal || 0),
        totalCustomers,
        totalProducts,
        totalSales: Number(totalSales._sum.grandTotal || 0),
        thisWeekSales: Number(thisWeekSales._sum.grandTotal || 0),
        lastWeekSales: Number(lastWeekSales._sum.grandTotal || 0),
        thisMonthSales: Number(thisMonthSales._sum.grandTotal || 0),
        todayExpenses: Number(todayExpenses._sum.amount || 0),
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
