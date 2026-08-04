import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();

    const where = { companyId };

    const [
      outstandingResult,
      quotesPendingCount,
      acceptedQuotesCount,
      collectedResult,
      recentQuotes,
      recentInvoices,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: { ...where, paymentStatus: { in: ["PENDING", "PARTIAL"] } },
        _sum: { grandTotal: true },
      }),
      prisma.quote.count({ where: { ...where, status: "Sent" } }),
      prisma.quote.count({ where: { ...where, status: "Approved" } }),
      prisma.invoicePayment.aggregate({
        where,
        _sum: { amount: true },
      }),
      prisma.quote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          quoteNumber: true,
          customerName: true,
          status: true,
          items: { select: { amount: true } },
        },
      }),
      prisma.invoice.findMany({
        where: { ...where, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { select: { customerName: true } },
          payments: { select: { amount: true } },
        },
      }),
    ]);

    const totalOutstanding = Number(outstandingResult._sum.grandTotal) || 0;
    const totalCollected = Number(collectedResult._sum.amount) || 0;

    const quotes = recentQuotes.map((q) => {
      const amount = q.items.reduce((sum, item) => sum + Number(item.amount), 0);
      return {
        quoteNo: q.quoteNumber,
        customer: q.customerName,
        amount,
        status: q.status,
      };
    });

    const invoices = recentInvoices.map((inv) => {
      const totalPaid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const balance = Number(inv.grandTotal) - totalPaid;
      return {
        invoiceNo: inv.invoiceNumber,
        customer: inv.customer?.customerName || "Walk-in",
        balance,
        status: inv.paymentStatus,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        outstanding: totalOutstanding,
        quotesPending: quotesPendingCount,
        acceptedQuotes: acceptedQuotesCount,
        collected: totalCollected,
        recentQuotes: quotes,
        recentInvoices: invoices,
      },
    });
  } catch (error) {
    console.error("Accounting dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}