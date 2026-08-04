import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateWastageNumber } from "@/lib/number-generators";

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toBusinessDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

const itemsInclude = {
  items: {
    select: {
      id: true,
      productId: true,
      quantity: true,
      product: {
        select: { id: true, productName: true, unit: true, sellingPrice: true, currentStock: true },
      },
    },
  },
};

function serializeWastage(p: {
  id: number;
  wastageNo: string;
  productionCategory: string;
  remarks: string | null;
  numberOfProducts: number;
  createdAt: Date;
  createdByUser: { name: string | null } | null;
  items: {
    id: number;
    productId: number;
    quantity: { toString(): string };
    product: { productName: string; unit: string | null; currentStock: unknown };
  }[];
}) {
  return {
    id: p.id,
    wastageNo: p.wastageNo,
    productionCategory: p.productionCategory,
    entryDate: toISODate(p.createdAt),
    numberOfProducts: p.numberOfProducts,
    remarks: p.remarks || "",
    createdBy: p.createdByUser?.name || "",
    createdAt: p.createdAt,
    items: p.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.product.productName,
      uom: i.product.unit || "",
      currentStock: Number(i.product.currentStock),
      wastageQuantity: Number(i.quantity),
    })),
  };
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const where: Record<string, unknown> = { companyId };

    if (fromDate) where.createdAt = { ...((where.createdAt as Record<string, Date>) || {}), gte: toBusinessDate(fromDate) };
    if (toDate) {
      const end = new Date(toBusinessDate(toDate).getTime() + 86400000);
      where.createdAt = { ...((where.createdAt as Record<string, Date>) || {}), lte: end };
    }

    if (search) {
      where.OR = [
        { wastageNo: { contains: search } },
        { productionCategory: { contains: search } },
        { remarks: { contains: search } },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.wastage.findMany({
        where,
        include: {
          ...itemsInclude,
          createdByUser: { select: { id: true, name: true } },
        },
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.wastage.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      records: records.map(serializeWastage),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Wastage list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const productionCategory = String(body.productionCategory || "").trim();
    const remarks = body.remarks ? String(body.remarks).trim() : "";
    const items = body.items;

    if (!productionCategory) {
      return NextResponse.json({ error: "Production Category is required" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one product is required" }, { status: 400 });
    }

    const productIds = items.map((i: Record<string, unknown>) => parseInt(String(i.productId), 10));
    if (productIds.some((id) => !id)) {
      return NextResponse.json({ error: "Invalid product selected" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, companyId },
      select: { id: true, productName: true, currentStock: true },
    });
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more products not found" }, { status: 400 });
    }

    const wastageItems = items.map((i: Record<string, unknown>) => {
      const productId = parseInt(String(i.productId), 10);
      const quantity = Number(i.wastageQuantity) || 0;
      return { productId, quantity };
    });

    const wastageNo = await generateWastageNumber(companyId);

    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.wastage.create({
        data: {
          companyId,
          wastageNo,
          productionCategory,
          remarks: remarks || null,
          numberOfProducts: wastageItems.length,
          createdByUserId: userId,
          updatedByUserId: userId,
          items: {
            create: wastageItems.map((i) => ({
              companyId,
              productId: i.productId,
              quantity: i.quantity,
            })),
          },
        },
        include: {
          ...itemsInclude,
          createdByUser: { select: { id: true, name: true } },
        },
      });
      return created;
    });

    return NextResponse.json({ success: true, record: serializeWastage(record) }, { status: 201 });
  } catch (error) {
    console.error("Wastage creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const id = parseInt(String(body.id), 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.wastage.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Wastage record not found" }, { status: 404 });

    const data: Record<string, unknown> = { updatedByUserId: userId };

    if (body.productionCategory !== undefined) {
      const cat = String(body.productionCategory).trim();
      if (!cat) return NextResponse.json({ error: "Production Category is required" }, { status: 400 });
      data.productionCategory = cat;
    }
    if (body.remarks !== undefined) data.remarks = body.remarks ? String(body.remarks).trim() : null;

    await prisma.$transaction(async (tx) => {
      if (Array.isArray(body.items)) {
        if (body.items.length === 0) {
          throw new Error("At least one product is required");
        }
        const productIds = body.items.map((i: Record<string, unknown>) => parseInt(String(i.productId), 10));
        const products = await tx.product.findMany({
          where: { id: { in: productIds }, companyId },
          select: { id: true, productName: true },
        });
        if (products.length !== productIds.length) {
          throw new Error("One or more products not found");
        }
        const wastageItems = body.items.map((i: Record<string, unknown>) => ({
          productId: parseInt(String(i.productId), 10),
          quantity: Number(i.wastageQuantity) || 0,
        }));
        await tx.wastageItem.deleteMany({ where: { wastageId: id } });
        await tx.wastageItem.createMany({
          data: wastageItems.map((i: { productId: number; quantity: number }) => ({
            wastageId: id,
            companyId,
            productId: i.productId,
            quantity: i.quantity,
          })),
        });
        data.numberOfProducts = wastageItems.length;
      }

      await tx.wastage.update({ where: { id }, data });
    });

    const updated = await prisma.wastage.findUnique({
      where: { id },
      include: { ...itemsInclude, createdByUser: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, record: serializeWastage(updated!) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "At least one product is required" || message === "One or more products not found") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("Wastage update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.wastage.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Wastage record not found" }, { status: 404 });

    await prisma.wastage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wastage delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}