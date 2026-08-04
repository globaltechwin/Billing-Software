import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCompanyContext } from "@/lib/company-context";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { companyId };
    if (status === "active") where.isActive = true;
    else if (status === "inactive") where.isActive = false;
    if (search) {
      where.OR = [
        { categoryName: { contains: search } },
      ];
    }

    const categories = await prisma.expenseCategory.findMany({
      where,
      include: {
        createdByUser: { select: { id: true, name: true } },
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Expense category list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();
    const { categoryName, displayOrder } = body;

    if (!categoryName || !categoryName.trim()) {
      return NextResponse.json({ error: "Category Name is required" }, { status: 400 });
    }

    const existing = await prisma.expenseCategory.findFirst({
      where: { companyId, categoryName: categoryName.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Expense category already exists" }, { status: 409 });
    }

    const category = await prisma.expenseCategory.create({
      data: {
        companyId,
        categoryName: categoryName.trim(),
        displayOrder: parseInt(displayOrder) || 0,
        createdByUserId: userId,
      },
      include: {
        createdByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("Expense category creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.expenseCategory.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Expense category not found" }, { status: 404 });

    if (updateData.categoryName && updateData.categoryName !== existing.categoryName) {
      const dup = await prisma.expenseCategory.findFirst({
        where: { companyId, categoryName: updateData.categoryName.trim(), id: { not: id } },
      });
      if (dup) return NextResponse.json({ error: "Expense category already exists" }, { status: 409 });
      updateData.categoryName = updateData.categoryName.trim();
    }

    const category = await prisma.expenseCategory.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Expense category update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.expenseCategory.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Expense category not found" }, { status: 404 });

    await prisma.expenseCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Expense category delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
