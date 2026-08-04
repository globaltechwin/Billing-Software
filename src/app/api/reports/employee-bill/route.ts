import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";
import { formatDate, formatDateTimeSeconds, getSession } from "@/lib/report-utils";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const session = searchParams.get("session") || "All";

    const where: Prisma.InvoiceWhereInput = {
      companyId,
      deletedAt: null,
      customer: { walletTransactions: { some: {} } },
    };

    if (startDate || endDate) {
      const range: { gte?: Date; lte?: Date } = {};
      if (startDate) {
        const gte = new Date(`${startDate}T00:00:00`);
        if (!Number.isNaN(gte.getTime())) range.gte = gte;
      }
      if (endDate) {
        const lte = new Date(`${endDate}T23:59:59`);
        if (!Number.isNaN(lte.getTime())) range.lte = lte;
      }
      if (range.gte || range.lte) where.invoiceDate = range;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: {
            customerName: true,
            phone: true,
            customerCode: true,
            walletTransactions: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { employeeId: true, cardNumber: true },
            },
          },
        },
        createdByUser: { select: { name: true, username: true } },
      },
      orderBy: { invoiceDate: "desc" },
    });

    const bills = invoices
      .filter((inv) => session === "All" || getSession(inv.invoiceDate) === session)
      .map((inv) => {
        const employeeTx = inv.customer?.walletTransactions[0];
        return {
          id: String(inv.id),
          billNo: inv.invoiceNumber,
          grandTotal: Number(inv.grandTotal),
          billDate: formatDate(inv.invoiceDate),
          session: getSession(inv.invoiceDate),
          employeeId: employeeTx?.employeeId || inv.customer?.customerCode || "",
          employeeName: inv.customer?.customerName || "",
          mobile: inv.customer?.phone || "",
          department: "",
          cardNumber: employeeTx?.cardNumber || inv.customer?.customerCode || "",
          createdBy: inv.createdByUser?.name || inv.createdByUser?.username || "",
          createdDate: formatDateTimeSeconds(inv.invoiceDate),
        };
      });

    return NextResponse.json({
      success: true,
      bills,
      total: bills.length,
    });
  } catch (error) {
    console.error("Employee bill report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
