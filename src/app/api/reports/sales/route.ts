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

const ORDER_TYPE_SEARCH_TERMS: { label: string; value: string }[] = [
  { label: "dine in", value: "DINE_IN" },
  { label: "dinein", value: "DINE_IN" },
  { label: "take away", value: "TAKE_AWAY" },
  { label: "takeaway", value: "TAKE_AWAY" },
  { label: "delivery", value: "DELIVERY" },
];

const ALLOWED_SORT_FIELDS = ["invoiceDate", "invoiceNumber", "grandTotal", "createdAt"];

function buildInvoiceWhere(
  companyId: number,
  opts: {
    fromDate: string | null;
    fromTime: string;
    toDate: string | null;
    toTime: string;
    user: string;
    attender: string;
    customerType: string;
    orderType: string;
    branchId: number | null;
    search: string;
    includeDeleted?: boolean;
  }
): Prisma.InvoiceWhereInput {
  const where: Prisma.InvoiceWhereInput = {
    companyId,
    deletedAt: opts.includeDeleted ? { not: null } : null,
  };

  const dateRange = buildDateRange(opts.fromDate, opts.fromTime, opts.toDate, opts.toTime);
  if (dateRange.gte || dateRange.lte) {
    where.invoiceDate = dateRange;
  }

  if (opts.user) {
    where.createdByUser = {
      OR: [{ username: { contains: opts.user } }, { name: { contains: opts.user } }],
    };
  }

  if (opts.attender) {
    where.salesPerson = { contains: opts.attender };
  }

  if (opts.customerType === "With GST") {
    where.gstMode = { not: "NO_GST" };
  } else if (opts.customerType === "Without GST") {
    where.gstMode = "NO_GST";
  }

  if (opts.orderType && opts.orderType !== "All") {
    where.kitchenOrders = { some: { orderType: opts.orderType.toUpperCase().replace(" ", "_") as never } };
  }

  if (opts.branchId) {
    where.branchId = opts.branchId;
  }

  if (opts.search) {
    const lower = opts.search.toLowerCase();
    const or: Prisma.InvoiceWhereInput[] = [
      { invoiceNumber: { contains: opts.search } },
      { customer: { customerName: { contains: opts.search } } },
      { customer: { phone: { contains: opts.search } } },
      { paymentMode: { contains: opts.search } },
    ];
    for (const term of ORDER_TYPE_SEARCH_TERMS) {
      if (lower.includes(term.label)) {
        or.push({ kitchenOrders: { some: { orderType: term.value as never } } });
      }
    }
    where.OR = or;
  }

  return where;
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);

    const fromDate = searchParams.get("fromDate");
    const fromTime = searchParams.get("fromTime") || "00:00";
    const toDate = searchParams.get("toDate");
    const toTime = searchParams.get("toTime") || "23:59";
    const user = searchParams.get("user") || "";
    const attender = searchParams.get("attender") || "";
    const customerType = searchParams.get("customerType") || "All";
    const orderType = searchParams.get("orderType") || "All";
    const branchId = searchParams.get("branchId") ? parseInt(searchParams.get("branchId")!, 10) : null;
    const search = searchParams.get("search") || "";
    const format = searchParams.get("format") || "";
    const fetchAll = searchParams.get("fetchAll") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const sortField = ALLOWED_SORT_FIELDS.includes(searchParams.get("sortField") || "")
      ? searchParams.get("sortField")!
      : "invoiceDate";
    const sortDirection = searchParams.get("sortDirection") === "asc" ? "asc" : "desc";

    const whereAll = buildInvoiceWhere(companyId, {
      fromDate,
      fromTime,
      toDate,
      toTime,
      user,
      attender,
      customerType,
      orderType,
      branchId,
      search: "",
    });

    const where = buildInvoiceWhere(companyId, {
      fromDate,
      fromTime,
      toDate,
      toTime,
      user,
      attender,
      customerType,
      orderType,
      branchId,
      search,
    });

    const dateRange = buildDateRange(fromDate, fromTime, toDate, toTime);

    const fromStart = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const lastWeekStart = fromStart ? new Date(fromStart.getTime() - 7 * 24 * 60 * 60 * 1000) : null;
    const prevDayStart = fromStart ? new Date(fromStart.getTime() - 24 * 60 * 60 * 1000) : null;

    const [
      total,
      rows,
      totalsRows,
      paidAgg,
      expensesAgg,
      deletedAgg,
      lastWeekAgg,
      prevDayAgg,
    ] = await Promise.all([
      prisma.invoice.count({ where }),

      prisma.invoice.findMany({
        where,
        include: {
          customer: { select: { customerName: true, phone: true } },
          createdByUser: { select: { name: true, username: true } },
          kitchenOrders: { select: { orderType: true } },
        },
        orderBy: { [sortField]: sortDirection },
        skip: fetchAll ? undefined : (page - 1) * limit,
        take: fetchAll ? undefined : limit,
      }),

      prisma.invoice.findMany({
        where: whereAll,
        select: {
          id: true,
          subtotal: true,
          discountAmount: true,
          taxAmount: true,
          grandTotal: true,
          cashReceived: true,
          paymentStatus: true,
          invoiceStatus: true,
          paymentMode: true,
          kitchenOrders: { select: { orderType: true } },
        },
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

      prisma.invoice.aggregate({
        where: {
          companyId,
          deletedAt: { not: null },
          ...(dateRange.gte || dateRange.lte ? { invoiceDate: dateRange } : {}),
        },
        _sum: { grandTotal: true },
      }),

      prisma.invoice.aggregate({
        where: {
          companyId,
          deletedAt: null,
          ...(fromStart && lastWeekStart
            ? { invoiceDate: { gte: lastWeekStart, lt: fromStart } }
            : {}),
        },
        _sum: { grandTotal: true },
      }),

      prisma.invoice.aggregate({
        where: {
          companyId,
          deletedAt: null,
          ...(fromStart && prevDayStart
            ? { invoiceDate: { gte: prevDayStart, lt: fromStart } }
            : {}),
        },
        _sum: { grandTotal: true },
      }),
    ]);

    const paidMap = new Map<number, number>();
    for (const p of paidAgg) {
      paidMap.set(p.invoiceId, Number(p._sum?.amount || 0));
    }

    const computePaid = (row: { id: number; grandTotal: Prisma.Decimal; cashReceived: Prisma.Decimal; paymentStatus: string }): number => {
      const fromPayments = paidMap.get(row.id) || 0;
      if (fromPayments > 0) return fromPayments;
      if (row.paymentStatus === "PAID") return Number(row.grandTotal);
      return Number(row.cashReceived) || 0;
    };

    const totals = {
      bills: 0,
      subTotal: 0,
      tax: 0,
      discount: 0,
      grandTotal: 0,
      paidAmount: 0,
      amountDue: 0,
      expenses: Number(expensesAgg._sum.amount || 0),
      profitLoss: 0,
      returnAmt: Number(deletedAgg._sum.grandTotal || 0),
      lastWkSales: Number(lastWeekAgg._sum.grandTotal || 0),
      prevDayPay: Number(prevDayAgg._sum.grandTotal || 0),
      compliment: 0,
      cancelled: 0,
      runningOrder: 0,
      creditBills: 0,
      delivery: 0,
    };

    for (const row of totalsRows) {
      totals.bills += 1;
      totals.subTotal += Number(row.subtotal);
      totals.tax += Number(row.taxAmount);
      totals.discount += Number(row.discountAmount);
      totals.grandTotal += Number(row.grandTotal);
      const paid = computePaid(row);
      totals.paidAmount += paid;
      totals.amountDue += Math.max(0, Number(row.grandTotal) - paid);
      if (row.paymentMode?.toUpperCase() === "COMPLIMENT") totals.compliment += 1;
      if (row.invoiceStatus === "CANCELLED") totals.cancelled += 1;
      if (row.invoiceStatus === "DRAFT") totals.runningOrder += Number(row.grandTotal);
      if (row.paymentMode?.toUpperCase() === "CREDIT") totals.creditBills += Number(row.grandTotal);
      if (row.kitchenOrders.some((ko) => ko.orderType === "DELIVERY")) {
        totals.delivery += Number(row.grandTotal);
      }
    }
    totals.profitLoss = totals.grandTotal - totals.expenses;

    const resultRows = rows.map((inv) => {
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
        createdBy: inv.createdByUser?.name || inv.createdByUser?.username || "",
      };
    });

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
        "CREATED BY",
      ];
      const csvRows = resultRows.map((r) =>
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
          r.createdBy,
        ]
          .map((v) => (typeof v === "string" && /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v))
          .join(",")
      );
      const csv = [headers.join(","), ...csvRows].join("\n");
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sales-report-${fromDate || "all"}-${toDate || "all"}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      rows: resultRows,
      totals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Sales report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
