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
    const category = searchParams.get("category") || "";
    const productName = searchParams.get("product") || "";

    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    if (!start || !end) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    const [audits, products] = await Promise.all([
      prisma.stockAudit.findMany({
        where: { companyId, auditDate: { gte: start, lte: end } },
        include: {
          items: {
            include: { product: { select: { productName: true, productCode: true, category: true, unit: true, purchasePrice: true } } },
          },
        },
        orderBy: [{ auditDate: "desc" }],
      }),
      prisma.product.findMany({
        where: { companyId },
        select: { productName: true, category: true },
        orderBy: [{ productName: "asc" }],
      }),
    ]);

    let rows: {
      id: string;
      sNo: number;
      auditDate: string;
      productName: string;
      productCode: string;
      category: string;
      uom: string;
      systemQty: number;
      physicalQty: number;
      difference: number;
      unitPrice: number;
      stockValue: number;
      status: string;
    }[] = [];

    audits.forEach((audit) => {
      audit.items.forEach((item) => {
        const difference = Number(item.difference);
        const physicalQty = Number(item.physicalStock);
        const unitPrice = Number(item.product.purchasePrice);
        const status =
          difference > 0 ? "Excess" : difference < 0 ? "Shortage" : "Match";
        rows.push({
          id: String(item.id),
          sNo: 0,
          auditDate: formatDate(audit.auditDate),
          productName: item.product.productName,
          productCode: item.product.productCode || "",
          category: item.product.category || "",
          uom: item.product.unit,
          systemQty: Number(item.systemStock),
          physicalQty,
          difference,
          unitPrice,
          stockValue: physicalQty * unitPrice,
          status,
        });
      });
    });

    if (category) rows = rows.filter((r) => r.category === category);
    if (productName) rows = rows.filter((r) => r.productName === productName);

    rows = rows.map((r, index) => ({ ...r, sNo: index + 1 }));

    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort() as string[];

    return NextResponse.json({
      success: true,
      rows,
      categories,
      products: products.map((p) => p.productName),
    });
  } catch (error) {
    console.error("Stock audit report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
