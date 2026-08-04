import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCompanyContext } from "@/lib/company-context";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { companyId };
    if (activeOnly === "true") where.isActive = true;
    if (search) {
      where.OR = [
        { unitName: { contains: search } },
        { shortName: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const units = await prisma.unit.findMany({
      where,
      include: {
        createdByUser: { select: { id: true, name: true } },
      },
      orderBy: { unitName: "asc" },
    });

    return NextResponse.json({ success: true, units });
  } catch (error) {
    console.error("Unit list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();
    const { unitName, shortName, description, displayOrder } = body;

    if (!unitName || !shortName) {
      return NextResponse.json({ error: "Unit Name and Short Name are required" }, { status: 400 });
    }

    const existingName = await prisma.unit.findFirst({
      where: { companyId, unitName: unitName.trim().toUpperCase() },
    });
    if (existingName) {
      return NextResponse.json({ error: "Unit name already exists" }, { status: 409 });
    }

    const existingShort = await prisma.unit.findFirst({
      where: { companyId, shortName: shortName.trim().toUpperCase() },
    });
    if (existingShort) {
      return NextResponse.json({ error: "Unit short name already exists" }, { status: 409 });
    }

    const unit = await prisma.unit.create({
      data: {
        companyId,
        unitName: unitName.trim().toUpperCase(),
        shortName: shortName.trim().toUpperCase(),
        description: description?.trim() || null,
        displayOrder: displayOrder || 0,
        createdByUserId: userId,
      },
      include: {
        createdByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, unit }, { status: 201 });
  } catch (error) {
    console.error("Unit creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.unit.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Unit not found" }, { status: 404 });

    if (updateData.unitName && updateData.unitName !== existing.unitName) {
      const dup = await prisma.unit.findFirst({
        where: { companyId, unitName: updateData.unitName.trim().toUpperCase(), id: { not: id } },
      });
      if (dup) return NextResponse.json({ error: "Unit name already exists" }, { status: 409 });
      updateData.unitName = updateData.unitName.trim().toUpperCase();
    }

    if (updateData.shortName && updateData.shortName !== existing.shortName) {
      const dup = await prisma.unit.findFirst({
        where: { companyId, shortName: updateData.shortName.trim().toUpperCase(), id: { not: id } },
      });
      if (dup) return NextResponse.json({ error: "Unit short name already exists" }, { status: 409 });
      updateData.shortName = updateData.shortName.trim().toUpperCase();
    }

    const unit = await prisma.unit.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, unit });
  } catch (error) {
    console.error("Unit update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.unit.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Unit not found" }, { status: 404 });

    const productCount = await prisma.product.count({
      where: { companyId, unit: existing.shortName },
    });
    if (productCount > 0) {
      return NextResponse.json({
        error: `Cannot delete: ${productCount} product(s) use this unit`,
      }, { status: 409 });
    }

    await prisma.unit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unit delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
