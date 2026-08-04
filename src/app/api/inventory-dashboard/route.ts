import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalProducts,
      totalVendors,
      pendingIndents,
      pendingPOs,
      todayStockIn,
      todayStockOut,
      lowStockProducts,
      outOfStockProducts,
      allProducts,
      recentStockIns,
      recentStockOuts,
      recentPOs,
      recentIndents,
      indentStatus,
    ] = await Promise.all([
      // Total Products
      prisma.product.count({ where: { companyId, isActive: true } }),

      // Total Vendors
      prisma.vendor.count({ where: { companyId, isActive: true } }),

      // Pending Indents
      prisma.indent.count({ where: { companyId, status: "PENDING" } }),

      // Pending Purchase Orders
      prisma.purchaseOrder.count({
        where: { companyId, status: { in: ["DRAFT", "PENDING", "APPROVED", "PARTIALLY_RECEIVED"] } },
      }),

      // Today's Stock In (sum of receivedQty across GRN items today)
      prisma.goodsReceiptItem.findMany({
        where: {
          goodsReceipt: {
            companyId,
            receiptDate: { gte: today, lt: tomorrow },
            status: { not: "CANCELLED" },
          },
        },
        select: { receivedQty: true },
      }).then((items) =>
        items.reduce((sum, item) => sum + Number(item.receivedQty), 0)
      ),

      // Today's Stock Out (sum of quantity across StockOut items today)
      prisma.stockOutItem.findMany({
        where: {
          stockOut: {
            companyId,
            stockOutDate: { gte: today, lt: tomorrow },
            status: { not: "CANCELLED" },
          },
        },
        select: { quantity: true },
      }).then((items) =>
        items.reduce((sum, item) => sum + Number(item.quantity), 0)
      ),

      // Low Stock Products (below reorder level)
      prisma.product.findMany({
        where: {
          companyId,
          isActive: true,
          reorderLevel: { gt: 0 },
        },
        select: { id: true, productName: true, currentStock: true, reorderLevel: true, unit: true },
      }).then((products) =>
        products.filter((p) => Number(p.currentStock) < Number(p.reorderLevel))
      ),

      // Out of Stock Products
      prisma.product.findMany({
        where: {
          companyId,
          isActive: true,
          currentStock: 0,
        },
        select: { id: true, productName: true, unit: true },
      }),

      // All Products for inventory value
      prisma.product.findMany({
        where: { companyId, isActive: true },
        select: { currentStock: true, purchasePrice: true },
      }),

      // Recent Stock In (last 5)
      prisma.goodsReceipt.findMany({
        where: { companyId },
        include: {
          vendor: { select: { vendorName: true } },
          createdByUser: { select: { name: true } },
          items: { select: { receivedQty: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Recent Stock Out (last 5)
      prisma.stockOut.findMany({
        where: { companyId },
        include: {
          createdByUser: { select: { name: true } },
          items: { select: { quantity: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Recent Purchase Orders (last 5)
      prisma.purchaseOrder.findMany({
        where: { companyId },
        include: {
          vendor: { select: { vendorName: true } },
          createdByUser: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Recent Indent Requests (last 5)
      prisma.indent.findMany({
        where: { companyId },
        include: {
          createdByUser: { select: { name: true } },
          items: { select: { requiredQty: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Indent Status breakdown for pie chart
      prisma.indent.groupBy({
        by: ["status"],
        where: { companyId },
        _count: { id: true },
      }),
    ]);

    // Calculate total inventory value
    const totalInventoryValue = allProducts.reduce(
      (sum, p) => sum + Number(p.currentStock) * Number(p.purchasePrice),
      0
    );

    // Map recent stock ins
    const mappedRecentStockIns = recentStockIns.map((grn) => ({
      id: grn.id,
      grnNumber: grn.grnNumber,
      vendorName: grn.vendor.vendorName,
      date: grn.receiptDate.toISOString(),
      totalQty: grn.items.reduce((s, item) => s + Number(item.receivedQty), 0),
      status: grn.status,
      createdBy: grn.createdByUser.name,
    }));

    // Map recent stock outs
    const mappedRecentStockOuts = recentStockOuts.map((so) => ({
      id: so.id,
      stockOutNumber: so.stockOutNumber,
      date: so.stockOutDate.toISOString(),
      totalQty: so.items.reduce((s, item) => s + Number(item.quantity), 0),
      type: so.stockOutType,
      status: so.status,
      createdBy: so.createdByUser.name,
    }));

    // Map recent POs
    const mappedRecentPOs = recentPOs.map((po) => ({
      id: po.id,
      poNumber: po.poNumber,
      vendorName: po.vendor.vendorName,
      date: po.createdAt.toISOString(),
      grandTotal: Number(po.grandTotal),
      status: po.status,
      createdBy: po.createdByUser.name,
    }));

    // Map recent indents
    const mappedRecentIndents = recentIndents.map((ind) => ({
      id: ind.id,
      indentNumber: ind.indentNumber,
      department: ind.department,
      priority: ind.priority,
      date: ind.indentDate.toISOString(),
      totalQty: ind.items.reduce((s, item) => s + Number(item.requiredQty), 0),
      status: ind.status,
      createdBy: ind.createdByUser.name,
    }));

    // Map indent status for pie chart
    const indentStatusMap: Record<string, string> = {
      PENDING: "Pending",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };
    const indentStatusColors: Record<string, string> = {
      PENDING: "#f59e0b",
      APPROVED: "#3d9a7e",
      REJECTED: "#ef4444",
      COMPLETED: "#3b82f6",
      CANCELLED: "#9ca3af",
    };
    const mappedIndentStatus = indentStatus.map((s) => ({
      name: indentStatusMap[s.status] || s.status,
      value: s._count.id,
      color: indentStatusColors[s.status] || "#6b7280",
    }));

    return NextResponse.json({
      success: true,
      dashboard: {
        summaryCards: {
          totalProducts,
          totalVendors,
          pendingIndents,
          pendingPOs,
          todayStockIn,
          todayStockOut,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          totalInventoryValue,
        },
        lowStockProducts,
        outOfStockProducts,
        recentStockIns: mappedRecentStockIns,
        recentStockOuts: mappedRecentStockOuts,
        recentPOs: mappedRecentPOs,
        recentIndents: mappedRecentIndents,
        indentStatus: mappedIndentStatus,
      },
    });
  } catch (error) {
    console.error("Inventory dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
