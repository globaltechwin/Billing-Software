import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const where = {
      companyId,
      orderTime: { gte: start, lte: end },
    };

    const [pending, preparing, ready, served, total] = await Promise.all([
      prisma.kitchenOrder.count({ where: { ...where, orderStatus: "NEW" } }),
      prisma.kitchenOrder.count({ where: { ...where, orderStatus: { in: ["ACCEPTED", "PREPARING"] } } }),
      prisma.kitchenOrder.count({ where: { ...where, orderStatus: "READY" } }),
      prisma.kitchenOrder.count({ where: { ...where, orderStatus: "SERVED" } }),
      prisma.kitchenOrder.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      summary: {
        pending,
        preparing,
        ready,
        served,
        total,
        date,
      },
    });
  } catch (error) {
    console.error("Kitchen summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
