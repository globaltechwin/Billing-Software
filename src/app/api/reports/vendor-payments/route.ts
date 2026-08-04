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

    const payments = await prisma.vendorPayment.findMany({
      where: { companyId, paymentDate: { gte: start, lte: end } },
      select: {
        vendorId: true,
        amount: true,
        paymentMethod: true,
        transactionType: true,
        paymentDate: true,
        vendor: { select: { vendorName: true } },
      },
      orderBy: [{ vendorId: "asc" }, { paymentDate: "asc" }],
    });

    const byVendor = new Map<
      number,
      {
        vendorName: string;
        credit: number;
        cash: number;
        card: number;
        upi: number;
        wallet: number;
        payments: number;
        lastDate: Date;
      }
    >();

    for (const p of payments) {
      const acc = byVendor.get(p.vendorId) || {
        vendorName: p.vendor.vendorName,
        credit: 0,
        cash: 0,
        card: 0,
        upi: 0,
        wallet: 0,
        payments: 0,
        lastDate: p.paymentDate,
      };
      const amount = Number(p.amount);
      if (p.transactionType === "CREDIT") {
        acc.credit += amount;
      } else {
        acc.payments += amount;
        if (p.paymentMethod === "CASH") acc.cash += amount;
        else if (p.paymentMethod === "CARD") acc.card += amount;
        else if (p.paymentMethod === "UPI") acc.upi += amount;
        else if (p.paymentMethod === "WALLET") acc.wallet += amount;
      }
      if (p.paymentDate > acc.lastDate) acc.lastDate = p.paymentDate;
      byVendor.set(p.vendorId, acc);
    }

    const rows = Array.from(byVendor.entries()).map(([vendorId, acc], index) => {
      const curBalance = acc.credit - acc.payments;
      let balanceDesc = "Paid";
      if (curBalance > 0) {
        balanceDesc = acc.payments > 0 ? "Partial" : "Due";
      }
      return {
        id: String(vendorId),
        sNo: index + 1,
        vendorName: acc.vendorName,
        credit: acc.credit,
        cash: acc.cash,
        card: acc.card,
        upi: acc.upi,
        wallet: acc.wallet,
        curBalance,
        balanceDesc,
        date: formatDate(acc.lastDate),
      };
    });

    return NextResponse.json({ success: true, rows });
  } catch (error) {
    console.error("Vendor payments report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
