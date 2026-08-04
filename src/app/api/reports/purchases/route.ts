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
    const branchName = searchParams.get("branch") || "";
    const vendorName = searchParams.get("vendor") || "";
    const category = searchParams.get("category") || "";
    const productName = searchParams.get("product") || "";

    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    if (!start || !end) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    const [purchaseOrders, vendors, products, branches] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: { companyId, orderDate: { gte: start, lte: end } },
        include: {
          vendor: { select: { vendorName: true } },
          items: {
            include: { product: { select: { productName: true, productCode: true, category: true } } },
            orderBy: [{ id: "asc" }],
          },
        },
        orderBy: [{ orderDate: "desc" }],
      }),
      prisma.vendor.findMany({
        where: { companyId },
        select: { vendorName: true },
        orderBy: [{ vendorName: "asc" }],
      }),
      prisma.product.findMany({
        where: { companyId },
        select: { productName: true, category: true },
        orderBy: [{ productName: "asc" }],
      }),
      prisma.branch.findMany({
        where: { companyId },
        select: { id: true, branchName: true },
        orderBy: [{ branchName: "asc" }],
      }),
    ]);

    const branchMap = new Map(branches.map((b) => [b.id, b.branchName]));

    let rows: {
      id: string;
      sNo: number;
      poDate: string;
      poNo: string;
      branchName: string;
      category: string;
      vendorName: string;
      itemCode: string;
      itemName: string;
      uom: string;
      price: number;
      reqQuantity: number;
      appQuantity: number;
      grnQuantity: number;
      appQuantityAmount: number;
      grnQuantityAmount: number;
      requestStatus: string;
    }[] = [];

    purchaseOrders.forEach((po) => {
      po.items.forEach((item) => {
        const quantity = Number(item.quantity);
        const received = Number(item.receivedQty);
        const price = Number(item.purchasePrice);
        const status =
          received === 0
            ? "Pending"
            : received >= quantity
              ? "Approved"
              : "Partial";
        rows.push({
          id: `${po.id}-${item.id}`,
          sNo: 0,
          poDate: formatDate(po.orderDate),
          poNo: po.poNumber,
          branchName: po.branchId ? branchMap.get(po.branchId) || "" : "",
          category: item.product.category || "",
          vendorName: po.vendor.vendorName,
          itemCode: item.product.productCode || "",
          itemName: item.product.productName,
          uom: item.unit,
          price,
          reqQuantity: quantity,
          appQuantity: received,
          grnQuantity: received,
          appQuantityAmount: received * price,
          grnQuantityAmount: received * price,
          requestStatus: status,
        });
      });
    });

    if (branchName) rows = rows.filter((r) => r.branchName === branchName);
    if (vendorName) rows = rows.filter((r) => r.vendorName === vendorName);
    if (category) rows = rows.filter((r) => r.category === category);
    if (productName) rows = rows.filter((r) => r.itemName === productName);

    rows = rows.map((r, index) => ({ ...r, sNo: index + 1 }));

    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort() as string[];

    return NextResponse.json({
      success: true,
      rows,
      vendors: vendors.map((v) => v.vendorName),
      products: products.map((p) => p.productName),
      categories,
      branches: branches.map((b) => b.branchName),
    });
  } catch (error) {
    console.error("Purchases report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
