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

    // NOTE: KOT cancellation is not tracked in the schema yet (OrderStatus enum has no
    // CANCELLED; no cancelledAt/cancelReason fields). This returns rows only once such
    // tracking exists; until then the report is empty.
    const orders = await prisma.kitchenOrder.findMany({
      where: { companyId, orderTime: { gte: start, lte: end } },
      include: {
        items: true,
        createdByUser: { select: { name: true, username: true } },
      },
      orderBy: [{ orderTime: "desc" }],
    });

    const rows = [];
    for (const order of orders) {
      for (const item of order.items) {
        const cancelled =
          String(order.orderStatus) === "CANCELLED" ||
          String(item.itemStatus) === "CANCELLED";
        if (!cancelled) continue;
        rows.push({
          id: `${order.id}-${item.id}`,
          sNo: rows.length + 1,
          billNo: order.invoiceNumber,
          kotNo: order.kotNumber,
          billDate: formatDate(order.orderTime),
          category: "",
          productName: item.productNameSnapshot,
          quantity: Number(item.quantity),
          billAmount: 0,
          remarks: "",
          cancelledBy: order.createdByUser?.name || order.createdByUser?.username || "",
          cancelledDate: formatDate(order.updatedAt),
        });
      }
    }

    return NextResponse.json({ success: true, rows });
  } catch (error) {
    console.error("Cancelled KOT report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
