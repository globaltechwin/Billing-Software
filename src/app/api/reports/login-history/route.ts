import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";
import { formatDateTime } from "@/lib/report-utils";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    if (!start || !end) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    const where: Record<string, unknown> = {
      loginAt: { gte: start, lte: end },
      user: { defaultCompanyId: companyId },
    };
    if (status === "success") where.success = true;
    if (status === "failed") where.success = false;
    if (search) {
      where.user = {
        defaultCompanyId: companyId,
        OR: [
          { username: { contains: search } },
          { name: { contains: search } },
        ],
      };
    }

    const entries = await prisma.loginHistory.findMany({
      where,
      include: { user: { select: { username: true, name: true } } },
      orderBy: [{ loginAt: "desc" }, { id: "desc" }],
    });

    const rows = entries.map((e, index) => ({
      id: String(e.id),
      sNo: index + 1,
      username: e.user.username,
      userName: e.user.name,
      loginTime: formatDateTime(e.loginAt),
      ipAddress: e.ipAddress || "",
      device: e.userAgent || "",
      status: e.success ? "Success" : "Failed",
    }));

    const successful = entries.filter((e) => e.success).length;
    const uniqueUsers = new Set(entries.map((e) => e.userId)).size;

    return NextResponse.json({
      success: true,
      rows,
      totals: {
        total: entries.length,
        successful,
        failed: entries.length - successful,
        uniqueUsers,
      },
    });
  } catch (error) {
    console.error("Login history report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
