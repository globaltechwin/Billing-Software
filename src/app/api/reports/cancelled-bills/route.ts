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

    const invoices = await prisma.invoice.findMany({
      where: { companyId, deletedAt: { not: null, gte: start, lte: end } },
      include: {
        customer: { select: { customerName: true, phone: true } },
        deletedByUser: { select: { name: true, username: true } },
      },
      orderBy: [{ deletedAt: "desc" }],
    });

    const rows = invoices.map((inv, index) => ({
      id: String(inv.id),
      sNo: index + 1,
      billNo: inv.invoiceNumber,
      billDate: formatDate(inv.invoiceDate),
      grandTotal: Number(inv.grandTotal),
      payMode: inv.paymentMode || "Cash",
      name: inv.customer?.customerName || "",
      mobile: inv.customer?.phone || "",
      remarks: inv.deleteReason || "",
      cancelledBy: inv.deletedByUser?.name || inv.deletedByUser?.username || "",
      cancelledDate: inv.deletedAt ? formatDate(inv.deletedAt) : "",
    }));

    return NextResponse.json({ success: true, rows });
  } catch (error) {
    console.error("Cancelled bills report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
