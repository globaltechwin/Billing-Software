import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";
import {
  buildDateRange,
  formatDate,
  formatDateTime,
  orderTypeLabel,
  payModeLabel,
} from "@/lib/report-utils";

const ORDER_TYPE_FILTERS: Record<string, string> = {
  "Dine In": "DINE_IN",
  "Take Away": "TAKE_AWAY",
  Delivery: "DELIVERY",
};

const PAY_MODE_FILTERS: Record<string, string> = {
  Cash: "CASH",
  Card: "CARD",
  UPI: "UPI",
};

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);

    const fromDate = searchParams.get("fromDate");
    const fromTime = searchParams.get("fromTime") || "00:00";
    const toDate = searchParams.get("toDate");
    const toTime = searchParams.get("toTime") || "23:59";
    const payment = searchParams.get("payment") || "";
    const tax = searchParams.get("tax") || "";
    const orderType = searchParams.get("orderType") || "All";
    const format = searchParams.get("format") || "";

    const where: Prisma.InvoiceWhereInput = { companyId, deletedAt: null };

    const dateRange = buildDateRange(fromDate, fromTime, toDate, toTime);
    if (dateRange.gte || dateRange.lte) {
      where.invoiceDate = dateRange;
    }

    if (payment) {
      const upper = PAY_MODE_FILTERS[payment] || payment.toUpperCase();
      where.paymentMode = { equals: upper };
    }

    if (tax === "GST") {
      where.gstMode = { not: "NO_GST" };
    } else if (tax === "Non-GST") {
      where.gstMode = "NO_GST";
    }

    if (orderType && orderType !== "All") {
      const value = ORDER_TYPE_FILTERS[orderType];
      if (value) {
        where.kitchenOrders = { some: { orderType: value as never } };
      }
    }

    const [invoices, paidAgg, expensesAgg] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: { select: { customerName: true, phone: true } },
          createdByUser: { select: { name: true, username: true } },
          kitchenOrders: { select: { orderType: true } },
        },
        orderBy: { invoiceDate: "desc" },
      }),
      prisma.invoicePayment.groupBy({
        by: ["invoiceId"],
        where: {
          companyId,
          ...(dateRange.gte || dateRange.lte ? { paymentDate: dateRange } : {}),
        },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: {
          companyId,
          ...(dateRange.gte || dateRange.lte ? { expenseDate: dateRange } : {}),
        },
        _sum: { amount: true },
      }),
    ]);

    const paidMap = new Map<number, number>();
    for (const p of paidAgg) {
      paidMap.set(p.invoiceId, Number(p._sum?.amount || 0));
    }

    const computePaid = (inv: {
      id: number;
      grandTotal: Prisma.Decimal;
      cashReceived: Prisma.Decimal;
      paymentStatus: string;
    }): number => {
      const fromPayments = paidMap.get(inv.id) || 0;
      if (fromPayments > 0) return fromPayments;
      if (inv.paymentStatus === "PAID") return Number(inv.grandTotal);
      return Number(inv.cashReceived) || 0;
    };

    const rows = invoices.map((inv) => {
      const paid = computePaid(inv);
      return {
        id: String(inv.id),
        billId: `B${String(inv.id).padStart(3, "0")}`,
        billNo: inv.invoiceNumber,
        billDate: formatDate(inv.invoiceDate),
        printDate: formatDateTime(inv.invoiceDate),
        orderType: orderTypeLabel(inv.kitchenOrders[0]?.orderType),
        subTotal: Number(inv.subtotal),
        discount: Number(inv.discountAmount),
        grandTotal: Number(inv.grandTotal),
        paidAmount: paid,
        amountDue: Math.max(0, Number(inv.grandTotal) - paid),
        payModes: payModeLabel(inv.paymentMode),
        mobile: inv.customer?.phone || "",
        name: inv.customer?.customerName || "Walk-in",
      };
    });

    const totals = {
      bills: rows.length,
      subTotal: rows.reduce((s, r) => s + r.subTotal, 0),
      tax: rows.reduce((s, r) => s + Number(r.grandTotal) - Number(r.subTotal), 0),
      discount: rows.reduce((s, r) => s + r.discount, 0),
      grandTotal: rows.reduce((s, r) => s + r.grandTotal, 0),
      paidAmount: rows.reduce((s, r) => s + r.paidAmount, 0),
      amountDue: rows.reduce((s, r) => s + r.amountDue, 0),
      expenses: Number(expensesAgg._sum.amount || 0),
      complimentBills: invoices.filter((inv) => inv.paymentMode?.toUpperCase() === "COMPLIMENT").length,
      cancelledBills: invoices.filter((inv) => inv.invoiceStatus === "CANCELLED").length,
      runningOrder: invoices
        .filter((inv) => inv.invoiceStatus === "DRAFT")
        .reduce((s, inv) => s + Number(inv.grandTotal), 0),
      creditBills: invoices
        .filter((inv) => inv.paymentMode?.toUpperCase() === "CREDIT")
        .reduce((s, inv) => s + Number(inv.grandTotal), 0),
      deliveryCharge: invoices
        .filter((inv) => inv.kitchenOrders.some((ko) => ko.orderType === "DELIVERY"))
        .reduce((s, inv) => s + Number(inv.grandTotal), 0),
    };

    if (format === "csv") {
      const headers = [
        "BILLID",
        "BILL NO",
        "BILL DATE",
        "PRINT DATE",
        "ORDER TYPE",
        "SUB TOTAL",
        "DISCOUNT",
        "GRAND TOTAL",
        "PAID AMOUNT",
        "AMOUNT DUE",
        "PAY MODES",
        "MOBILE",
        "NAME",
      ];
      const csvRows = rows.map((r) =>
        [
          r.billId,
          r.billNo,
          r.billDate,
          r.printDate,
          r.orderType,
          r.subTotal,
          r.discount,
          r.grandTotal,
          r.paidAmount,
          r.amountDue,
          r.payModes,
          r.mobile,
          r.name,
        ]
          .map((v) => (typeof v === "string" && /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v))
          .join(",")
      );
      const csv = [headers.join(","), ...csvRows].join("\n");
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="cashier-report-${fromDate || "all"}-${toDate || "all"}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      rows,
      totals,
      total: rows.length,
    });
  } catch (error) {
    console.error("Cashier report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
