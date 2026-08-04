import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCompanyContext } from "@/lib/company-context";

function parseId(value: unknown): number | null {
  const num = parseInt(String(value), 10);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function serializeConversion(c: {
  product: { productName: string; productCode: string | null };
  [key: string]: unknown;
}) {
  return {
    ...c,
    productName: c.product.productName,
    productCode: c.product.productCode,
    baseQty: Number(c.baseQty),
    portionQty: Number(c.portionQty),
  };
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const where: Record<string, unknown> = { companyId };
    if (status === "active") where.isActive = true;
    else if (status === "inactive") where.isActive = false;
    if (search) {
      where.OR = [
        { product: { productName: { contains: search } } },
        { baseUnit: { contains: search } },
      ];
    }

    const [conversions, total] = await Promise.all([
      prisma.productionConversion.findMany({
        where,
        include: {
          product: { select: { productName: true, productCode: true } },
          createdByUser: { select: { id: true, name: true } },
          updatedByUser: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productionConversion.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      conversions: conversions.map(serializeConversion),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Production conversion list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();

    const productId = parseId(body.productId);
    const baseQty = Number(body.baseQty);
    const baseUnit = String(body.baseUnit || "").trim();
    const portionQty = Number(body.portionQty);

    if (!productId) return NextResponse.json({ error: "Product is required" }, { status: 400 });
    if (!baseUnit) return NextResponse.json({ error: "Base Unit is required" }, { status: 400 });
    if (!Number.isFinite(baseQty) || baseQty <= 0) {
      return NextResponse.json({ error: "Base Quantity must be greater than zero" }, { status: 400 });
    }
    if (!Number.isFinite(portionQty) || portionQty <= 0) {
      return NextResponse.json({ error: "Portion Quantity must be greater than zero" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, companyId },
      select: { id: true, productName: true },
    });
    if (!product) return NextResponse.json({ error: "Product does not exist in Product Master" }, { status: 400 });

    const existing = await prisma.productionConversion.findFirst({
      where: { companyId, productId },
    });
    if (existing) {
      return NextResponse.json(
        { error: `A conversion already exists for "${product.productName}"` },
        { status: 409 }
      );
    }

    const conversion = await prisma.productionConversion.create({
      data: {
        companyId,
        productId,
        baseQty,
        baseUnit,
        portionQty,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
      include: {
        product: { select: { productName: true, productCode: true } },
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, conversion: serializeConversion(conversion) }, { status: 201 });
  } catch (error) {
    console.error("Production conversion creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();
    const id = parseId(body.id);
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.productionConversion.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Production conversion not found" }, { status: 404 });

    const updateData: Record<string, unknown> = { updatedByUserId: userId };

    if (body.productId !== undefined) {
      const productId = parseId(body.productId);
      if (!productId) return NextResponse.json({ error: "Product is required" }, { status: 400 });
      const product = await prisma.product.findFirst({ where: { id: productId, companyId } });
      if (!product) return NextResponse.json({ error: "Product does not exist in Product Master" }, { status: 400 });
      const dup = await prisma.productionConversion.findFirst({
        where: { companyId, productId, id: { not: id } },
      });
      if (dup) return NextResponse.json({ error: "A conversion already exists for this product" }, { status: 409 });
      updateData.productId = productId;
    }
    if (body.baseQty !== undefined) updateData.baseQty = body.baseQty;
    if (body.baseUnit !== undefined) updateData.baseUnit = body.baseUnit;
    if (body.portionQty !== undefined) updateData.portionQty = body.portionQty;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const conversion = await prisma.productionConversion.update({
      where: { id },
      data: updateData,
      include: {
        product: { select: { productName: true, productCode: true } },
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, conversion: serializeConversion(conversion) });
  } catch (error) {
    console.error("Production conversion update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseId(searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.productionConversion.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Production conversion not found" }, { status: 404 });

    await prisma.productionConversion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Production conversion delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
