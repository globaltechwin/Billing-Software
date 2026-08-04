import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();

    const [totalVendors, pendingPOs, pendingGRNs, lowStockProducts, pendingPayments] = await Promise.all([
      prisma.vendor.count({ where: { companyId, isActive: true } }),
      prisma.purchaseOrder.count({ where: { companyId, status: { in: ["DRAFT", "PENDING", "APPROVED", "PARTIALLY_RECEIVED"] } } }),
      prisma.goodsReceipt.count({ where: { companyId, status: { in: ["PENDING", "PARTIAL"] } } }),
      prisma.product.findMany({ where: { companyId, isActive: true }, select: { id: true, productName: true, currentStock: true, reorderLevel: true } }),
      prisma.purchaseInvoice.count({ where: { companyId, paymentStatus: { in: ["PENDING", "PARTIALLY_PAID"] } } }),
    ]);

    const lowStock = lowStockProducts.filter((p) => Number(p.currentStock) <= Number(p.reorderLevel) && Number(p.reorderLevel) > 0);

    const vendorBalances = await prisma.vendor.aggregate({
      where: { companyId, isActive: true },
      _sum: { currentBalance: true },
    });
    const totalOutstanding = Number(vendorBalances._sum.currentBalance || 0);

    return NextResponse.json({
      success: true,
      dashboard: {
        totalVendors,
        pendingPOs,
        pendingGRNs,
        lowStockCount: lowStock.length,
        totalOutstanding,
        pendingPayments,
      },
    });
  } catch (error) {
    console.error("Purchase dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
