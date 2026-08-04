import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateCashCategoryId } from "@/lib/number-generators";

function serializeCategory(c: Record<string, unknown>): Record<string, unknown> {
  return {
    id: c.id,
    categoryId: c.categoryId,
    categoryName: c.categoryName,
    categoryType: c.categoryType,
    displayOrder: c.displayOrder,
    status: (c.isActive as boolean) ? "Active" : "Inactive",
  };
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

    const where: Record<string, unknown> = { companyId };

    if (type && type !== "All") where.categoryType = type;
    if (search) {
      where.OR = [
        { categoryName: { contains: search } },
        { categoryId: { contains: search } },
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.cashCategory.findMany({
        where,
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cashCategory.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      categories: categories.map(serializeCategory),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Cash category list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const { categoryName, categoryType, displayOrder } = body;

    if (!categoryName || !categoryName.trim()) {
      return NextResponse.json({ error: "Category Name is required" }, { status: 400 });
    }
    if (!categoryType) {
      return NextResponse.json({ error: "Category Type is required" }, { status: 400 });
    }

    const categoryId = await generateCashCategoryId(companyId);

    const category = await prisma.cashCategory.create({
      data: {
        companyId,
        categoryId,
        categoryName: categoryName.trim(),
        categoryType,
        displayOrder: Number(displayOrder) || 0,
        isActive: true,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
    });

    return NextResponse.json({ success: true, category: serializeCategory(category) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Cash category create error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const id = parseInt(String(body.id), 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.cashCategory.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const data: Record<string, unknown> = { updatedByUserId: userId };

    if (body.categoryName !== undefined) data.categoryName = String(body.categoryName).trim();
    if (body.categoryType !== undefined) data.categoryType = body.categoryType;
    if (body.displayOrder !== undefined) data.displayOrder = Number(body.displayOrder);
    if (body.status !== undefined) data.isActive = body.status === "Active";

    const updated = await prisma.cashCategory.update({ where: { id }, data });

    return NextResponse.json({ success: true, category: serializeCategory(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Cash category update error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.cashCategory.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    await prisma.cashCategory.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cash category delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}