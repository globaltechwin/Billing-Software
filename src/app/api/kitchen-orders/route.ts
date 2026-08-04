import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateKOTNumber } from "@/lib/number-generators";

const KITCHEN_CATEGORIES = ["Food", "Beverages", "Desserts", "Starters", "Main Course"];

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const search = searchParams.get("search") || "";
    const orderStatus = searchParams.get("orderStatus") || "";
    const orderType = searchParams.get("orderType") || "";
    const priority = searchParams.get("priority") || "";
    const date = searchParams.get("date") || "";
    const sortField = searchParams.get("sortField") || "orderTime";
    const sortDirection = searchParams.get("sortDirection") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = { companyId };

    if (search) {
      where.OR = [
        { kotNumber: { contains: search } },
        { invoiceNumber: { contains: search } },
        { customerName: { contains: search } },
        { tableNumber: { contains: search } },
        { tokenNumber: { contains: search } },
      ];
    }

    if (orderStatus) where.orderStatus = orderStatus;
    if (orderType) where.orderType = orderType;
    if (priority) where.priority = priority;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.orderTime = { gte: start, lte: end };
    }

    const allowedSortFields = ["orderTime", "createdAt", "kotNumber"];
    const orderBy = allowedSortFields.includes(sortField)
      ? { [sortField]: sortDirection }
      : { orderTime: "desc" as const };

    const [orders, total] = await Promise.all([
      prisma.kitchenOrder.findMany({
        where,
        include: {
          items: true,
          createdByUser: { select: { name: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.kitchenOrder.count({ where }),
    ]);

    const result = orders.map((order) => ({
      id: order.id,
      kotNumber: order.kotNumber,
      invoiceId: order.invoiceId,
      invoiceNumber: order.invoiceNumber,
      customerName: order.customerName || "Walk-in",
      orderType: order.orderType,
      orderStatus: order.orderStatus,
      priority: order.priority,
      tableNumber: order.tableNumber || "",
      tokenNumber: order.tokenNumber || "",
      orderTime: order.orderTime,
      acceptedTime: order.acceptedTime,
      preparingTime: order.preparingTime,
      readyTime: order.readyTime,
      servedTime: order.servedTime,
      notes: order.notes || "",
      createdBy: order.createdByUser?.name || "",
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productNameSnapshot,
        quantity: Number(item.quantity),
        unit: item.unit || "",
        specialInstructions: item.specialInstructions || "",
        itemStatus: item.itemStatus,
      })),
    }));

    return NextResponse.json({
      success: true,
      orders: result,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Kitchen order list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { invoiceId, orderType, priority, tableNumber, tokenNumber, notes } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
      include: {
        items: {
          include: {
            product: { select: { id: true, category: true, unit: true } },
          },
        },
        customer: { select: { customerName: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Filter items that belong to kitchen categories
    const kitchenItems = invoice.items.filter(
      (item) => item.product.category && KITCHEN_CATEGORIES.includes(item.product.category)
    );

    if (kitchenItems.length === 0) {
      return NextResponse.json(
        { error: "No kitchen items found in this invoice" },
        { status: 400 }
      );
    }

    // Check if kitchen order already exists for this invoice
    const existing = await prisma.kitchenOrder.findFirst({
      where: { invoiceId, companyId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Kitchen order already exists for this invoice" },
        { status: 409 }
      );
    }

    const kotNumber = await generateKOTNumber(companyId);

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.kitchenOrder.create({
        data: {
          kotNumber,
          companyId,
          invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          customerId: invoice.customerId,
          customerName: invoice.customer?.customerName || null,
          orderType: orderType || "DINE_IN",
          priority: priority || "NORMAL",
          tableNumber: tableNumber || null,
          tokenNumber: tokenNumber || null,
          notes: notes || null,
          createdByUserId: userId,
        },
      });

      await tx.kitchenOrderItem.createMany({
        data: kitchenItems.map((item) => ({
          kitchenOrderId: order.id,
          productId: item.productId,
          productNameSnapshot: item.productNameSnapshot,
          quantity: item.quantity,
          unit: item.product.unit || null,
          specialInstructions: null,
          itemStatus: "NEW",
        })),
      });

      return tx.kitchenOrder.findUnique({
        where: { id: order.id },
        include: { items: true },
      });
    });

    return NextResponse.json({ success: true, order: result }, { status: 201 });
  } catch (error) {
    console.error("Kitchen order creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
