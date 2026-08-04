import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCompanyContext } from "@/lib/company-context";

const ALLOWED_SORT_FIELDS = ["id", "mappingType", "isActive", "createdAt", "updatedAt", "productName"];

function parseId(value: unknown): number | null {
  const num = parseInt(String(value), 10);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function serializeMapping(m: {
  item: { productName: string; productCode: string | null };
  product: { productName: string; productCode: string | null };
  [key: string]: unknown;
}) {
  return {
    ...m,
    itemName: m.item.productName,
    itemCode: m.item.productCode,
    productName: m.product.productName,
    productCode: m.product.productCode,
    quantity: Number(m.quantity),
    purchasePrice: Number(m.purchasePrice),
    cost: Number(m.cost),
  };
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const mappingType = searchParams.get("mappingType");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const where: Record<string, unknown> = { companyId };

    if (status === "active") where.isActive = true;
    else if (status === "inactive") where.isActive = false;
    if (mappingType) where.mappingType = mappingType;

    if (search) {
      where.OR = [
        { item: { productName: { contains: search } } },
        { product: { productName: { contains: search } } },
      ];
    }

    const orderField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder === "asc" ? "asc" : "desc";
    let orderBy: object;
    if (orderField === "productName") {
      orderBy = { product: { productName: orderDir } };
    } else if (orderField === "itemName") {
      orderBy = { item: { productName: orderDir } };
    } else {
      orderBy = { [orderField]: orderDir };
    }

    const [mappings, total] = await Promise.all([
      prisma.productionMapping.findMany({
        where,
        include: {
          item: { select: { productName: true, productCode: true } },
          product: { select: { productName: true, productCode: true } },
          createdByUser: { select: { id: true, name: true } },
          updatedByUser: { select: { id: true, name: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productionMapping.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      mappings: mappings.map(serializeMapping),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Production mapping list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();

    const mappingType = String(body.mappingType || "Production").trim();
    const itemId = parseId(body.itemId);
    const productId = parseId(body.productId);
    const quantity = Number(body.quantity);
    const unit = String(body.unit || "").trim();

    if (!itemId) return NextResponse.json({ error: "Item Name is required" }, { status: 400 });
    if (!productId) return NextResponse.json({ error: "Production Name is required" }, { status: 400 });
    if (!unit) return NextResponse.json({ error: "UOM is required" }, { status: 400 });
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be greater than zero" }, { status: 400 });
    }
    if (!["Production", "Recipes", "Modifier"].includes(mappingType)) {
      return NextResponse.json({ error: "Invalid mapping type" }, { status: 400 });
    }

    const [itemProduct, finishedProduct] = await Promise.all([
      prisma.product.findFirst({ where: { id: itemId, companyId }, select: { id: true, productName: true } }),
      prisma.product.findFirst({ where: { id: productId, companyId }, select: { id: true, productName: true } }),
    ]);
    if (!itemProduct) return NextResponse.json({ error: "Item does not exist in Product Master" }, { status: 400 });
    if (!finishedProduct) return NextResponse.json({ error: "Production product does not exist in Product Master" }, { status: 400 });

    const duplicate = await prisma.productionMapping.findFirst({
      where: { companyId, itemId, productId },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: `This mapping already exists (${itemProduct.productName} → ${finishedProduct.productName})` },
        { status: 409 }
      );
    }

    const purchasePrice = parseFloat(body.purchasePrice) || 0;
    const cost = parseFloat(body.cost) || (quantity * purchasePrice);

    const mapping = await prisma.productionMapping.create({
      data: {
        companyId,
        mappingType,
        itemId,
        productId,
        quantity,
        unit,
        purchasePrice,
        cost,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
      include: {
        item: { select: { productName: true, productCode: true } },
        product: { select: { productName: true, productCode: true } },
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, mapping: serializeMapping(mapping) }, { status: 201 });
  } catch (error) {
    console.error("Production mapping creation error:", error);
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

    const existing = await prisma.productionMapping.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Production mapping not found" }, { status: 404 });

    const updateData: Record<string, unknown> = { updatedByUserId: userId };

    if (body.mappingType !== undefined) updateData.mappingType = body.mappingType;
    if (body.itemId !== undefined) updateData.itemId = body.itemId;
    if (body.productId !== undefined) updateData.productId = body.productId;
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.purchasePrice !== undefined) updateData.purchasePrice = parseFloat(body.purchasePrice) || 0;
    if (body.cost !== undefined) updateData.cost = parseFloat(body.cost) || 0;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    if (updateData.itemId || updateData.productId) {
      const checkItemId = (updateData.itemId as number) || existing.itemId;
      const checkProductId = (updateData.productId as number) || existing.productId;
      const dup = await prisma.productionMapping.findFirst({
        where: { companyId, itemId: checkItemId, productId: checkProductId, id: { not: id } },
      });
      if (dup) return NextResponse.json({ error: "This mapping already exists" }, { status: 409 });
    }

    const mapping = await prisma.productionMapping.update({
      where: { id },
      data: updateData,
      include: {
        item: { select: { productName: true, productCode: true } },
        product: { select: { productName: true, productCode: true } },
        createdByUser: { select: { id: true, name: true } },
        updatedByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, mapping: serializeMapping(mapping) });
  } catch (error) {
    console.error("Production mapping update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseId(searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.productionMapping.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Production mapping not found" }, { status: 404 });

    await prisma.productionMapping.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Production mapping delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
