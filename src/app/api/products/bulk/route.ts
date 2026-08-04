import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const body = await request.json();
    const { productIds, updates } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "Product IDs are required" }, { status: 400 });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "At least one field to update is required" }, { status: 400 });
    }

    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, companyId },
      select: { id: true },
    });

    if (existingProducts.length !== productIds.length) {
      return NextResponse.json({ error: "Some products were not found" }, { status: 404 });
    }

    if (updates.gstMasterId) {
      const gst = await prisma.gSTMaster.findFirst({ where: { id: updates.gstMasterId } });
      if (!gst) {
        return NextResponse.json({ error: "Invalid tax group" }, { status: 400 });
      }
    }

    const allowedFields = [
      "sellingPrice", "purchasePrice", "gstMasterId", "category",
      "unit", "barcode", "reorderLevel", "isActive",
    ];

    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    if (Object.keys(cleanUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    cleanUpdates.updatedAt = new Date();

    const result = await prisma.product.updateMany({
      where: { id: { in: productIds }, companyId },
      data: cleanUpdates,
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      message: `${result.count} product(s) updated successfully`,
    });
  } catch (error) {
    console.error("Bulk product update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
