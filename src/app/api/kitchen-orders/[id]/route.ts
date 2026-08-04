import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = await getCurrentCompanyId();
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await prisma.kitchenOrder.findFirst({
      where: { id: orderId, companyId },
      include: {
        items: true,
        createdByUser: { select: { name: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Kitchen order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Kitchen order detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = await getCurrentCompanyId();
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await request.json();
    const { orderStatus, priority, notes } = body;

    const existing = await prisma.kitchenOrder.findFirst({
      where: { id: orderId, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Kitchen order not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const now = new Date();

    if (orderStatus) {
      updateData.orderStatus = orderStatus;
      // Auto-set timestamps based on status
      if (orderStatus === "ACCEPTED" && !existing.acceptedTime) {
        updateData.acceptedTime = now;
      } else if (orderStatus === "PREPARING" && !existing.preparingTime) {
        updateData.preparingTime = now;
      } else if (orderStatus === "READY" && !existing.readyTime) {
        updateData.readyTime = now;
      } else if (orderStatus === "SERVED" && !existing.servedTime) {
        updateData.servedTime = now;
      }

      // Update all items to the same status
      await prisma.kitchenOrderItem.updateMany({
        where: { kitchenOrderId: orderId },
        data: { itemStatus: orderStatus },
      });
    }

    if (priority) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.kitchenOrder.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Kitchen order update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
