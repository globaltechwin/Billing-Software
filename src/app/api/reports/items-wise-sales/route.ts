import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";
import { buildDateRange } from "@/lib/report-utils";

const ORDER_TYPE_FILTERS: Record<string, string> = {
  "Dine In": "DINE_IN",
  "Take Away": "TAKE_AWAY",
  Delivery: "DELIVERY",
};

const ALLOWED_SORT_FIELDS = ["count", "totalPrice", "productName", "category"];

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);

    const fromDate = searchParams.get("fromDate");
    const fromTime = searchParams.get("fromTime") || "00:00";
    const toDate = searchParams.get("toDate");
    const toTime = searchParams.get("toTime") || "23:59";
    const orderType = searchParams.get("orderType") || "All";
    const product = searchParams.get("product") || "";
    const attender = searchParams.get("attender") || "";
    const user = searchParams.get("user") || "";
    const search = searchParams.get("search") || "";
    const format = searchParams.get("format") || "";
    const sortField = ALLOWED_SORT_FIELDS.includes(searchParams.get("sortField") || "")
      ? searchParams.get("sortField")!
      : "count";
    const sortDirection = searchParams.get("sortDirection") === "asc" ? "asc" : "desc";

    const invWhere: Prisma.InvoiceWhereInput = {
      companyId,
      deletedAt: null,
      invoiceStatus: { not: "CANCELLED" },
    };

    const dateRange = buildDateRange(fromDate, fromTime, toDate, toTime);
    if (dateRange.gte || dateRange.lte) {
      invWhere.invoiceDate = dateRange;
    }

    if (orderType && orderType !== "All") {
      const value = ORDER_TYPE_FILTERS[orderType];
      if (value) {
        invWhere.kitchenOrders = { some: { orderType: value as never } };
      }
    }

    if (attender) {
      invWhere.salesPerson = { contains: attender };
    }

    if (user) {
      invWhere.createdByUser = {
        OR: [{ username: { contains: user } }, { name: { contains: user } }],
      };
    }

    const invoiceIds = await prisma.invoice.findMany({
      where: invWhere,
      select: { id: true },
    });

    if (invoiceIds.length === 0) {
      return NextResponse.json({ success: true, items: [], totalCount: 0, totalPrice: 0 });
    }

    const itemWhere: Prisma.InvoiceItemWhereInput = {
      invoiceId: { in: invoiceIds.map((i) => i.id) },
    };

    const keyword = product || search;
    if (keyword) {
      itemWhere.OR = [
        { productNameSnapshot: { contains: keyword } },
        { product: { productName: { contains: keyword } } },
      ];
    }

    const grouped = await prisma.invoiceItem.groupBy({
      by: ["productId", "productNameSnapshot"],
      where: itemWhere,
      _sum: { quantity: true, totalAmount: true },
    });

    const productIds = [...new Set(grouped.map((g) => g.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, productName: true, category: true },
    });
    const productMap = new Map<number, { id: number; productName: string; category: string | null }>(
      products.map((p) => [p.id, p])
    );

    const items = grouped.map((g) => ({
      id: String(g.productId),
      sNo: 0,
      category: productMap.get(g.productId)?.category || "",
      productName: productMap.get(g.productId)?.productName || g.productNameSnapshot,
      count: Number(g._sum.quantity || 0),
      totalPrice: Number(g._sum.totalAmount || 0),
    }));

    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === "totalPrice") cmp = a.totalPrice - b.totalPrice;
      else if (sortField === "productName") cmp = a.productName.localeCompare(b.productName);
      else if (sortField === "category") cmp = a.category.localeCompare(b.category);
      else cmp = a.count - b.count;
      return sortDirection === "asc" ? cmp : -cmp;
    });

    items.forEach((item, idx) => {
      item.sNo = idx + 1;
    });

    const totalCount = items.reduce((sum, item) => sum + item.count, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

    if (format === "csv") {
      const headers = ["S.NO", "CATEGORY", "PRODUCT NAME", "COUNT", "TOTAL PRICE"];
      const csvRows = items.map((r) =>
        [r.sNo, r.category, r.productName, r.count, r.totalPrice.toFixed(2)]
          .map((v) => (typeof v === "string" && /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v))
          .join(",")
      );
      const csv = [headers.join(","), ...csvRows].join("\n");
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="items-wise-sales-${fromDate || "all"}-${toDate || "all"}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      items,
      totalCount,
      totalPrice,
    });
  } catch (error) {
    console.error("Items wise sales report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
