import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateProductionOutNumber } from "@/lib/number-generators";

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
      price: true,
      totalPrice: true,
      product: {
        select: { id: true, productName: true, unit: true, sellingPrice: true },
      },
    },
  },
};

function serializeProductionOut(p: {
  id: number;
  outNo: string;
  productionCategory: string;
  indentNo: string | null;
  branchId: number | null;
  remarks: string | null;
  numberOfProducts: number;
  grandTotal: { toString(): string };
  createdAt: Date;
  branch: { branchName: string } | null;
  createdByUser: { name: string | null } | null;
  items: {
    id: number;
    productId: number;
    quantity: { toString(): string };
    price: { toString(): string };
    totalPrice: { toString(): string };
    product: { productName: string; unit: string | null };
  }[];
}) {
  return {
    id: p.id,
    outNo: p.outNo,
    productionCategory: p.productionCategory,
    indentNo: p.indentNo || "",
    branchId: p.branchId,
    branch: p.branch?.branchName || "",
    productionDate: toISODate(p.createdAt),
    entryDate: toISODate(p.createdAt),
    numberOfProducts: p.numberOfProducts,
    grandTotal: Number(p.grandTotal),
    remarks: p.remarks || "",
    createdBy: p.createdByUser?.name || "",
    createdAt: p.createdAt,
    items: p.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.product.productName,
      uom: i.product.unit || "",
      quantity: Number(i.quantity),
      price: Number(i.price),
      totalPrice: Number(i.totalPrice),
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
    const branch = searchParams.get("branch") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const where: Record<string, unknown> = { companyId };

    if (fromDate) where.createdAt = { ...((where.createdAt as Record<string, Date>) || {}), gte: toBusinessDate(fromDate) };
    if (toDate) {
      const end = new Date(toBusinessDate(toDate).getTime() + 86400000);
      where.createdAt = { ...((where.createdAt as Record<string, Date>) || {}), lte: end };
    }
    if (branch) where.branchId = parseInt(branch, 10) || undefined;

    if (search) {
      where.OR = [
        { outNo: { contains: search } },
        { productionCategory: { contains: search } },
        { remarks: { contains: search } },
        { indentNo: { contains: search } },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.productionOut.findMany({
        where,
        include: {
          ...itemsInclude,
          branch: { select: { id: true, branchName: true } },
          createdByUser: { select: { id: true, name: true } },
        },
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productionOut.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      records: records.map(serializeProductionOut),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Production out list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const productionCategory = String(body.productionCategory || "").trim();
    const indentNo = body.indentNo ? String(body.indentNo).trim() : "";
    const branchId = body.branchId ? parseInt(String(body.branchId), 10) : null;
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
      select: { id: true, productName: true, sellingPrice: true },
    });
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more products not found" }, { status: 400 });
    }

    if (branchId) {
      const branch = await prisma.branch.findFirst({ where: { id: branchId, companyId } });
      if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 400 });
    }

    const outItems = items.map((i: Record<string, unknown>) => {
      const productId = parseInt(String(i.productId), 10);
      const product = products.find((p) => p.id === productId)!;
      const quantity = Number(i.quantity) || 1;
      const price = Number(i.price) > 0 ? Number(i.price) : Number(product.sellingPrice) || 0;
      return { productId, quantity, price, totalPrice: quantity * price };
    });

    const outNo = await generateProductionOutNumber(companyId);
    const grandTotal = outItems.reduce((sum: number, i) => sum + i.totalPrice, 0);

    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.productionOut.create({
        data: {
          companyId,
          outNo,
          productionCategory,
          indentNo: indentNo || null,
          branchId: branchId || null,
          remarks: remarks || null,
          numberOfProducts: outItems.length,
          grandTotal,
          createdByUserId: userId,
          updatedByUserId: userId,
          items: {
            create: outItems.map((i) => ({
              companyId,
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
              totalPrice: i.totalPrice,
            })),
          },
        },
        include: {
          ...itemsInclude,
          branch: { select: { id: true, branchName: true } },
          createdByUser: { select: { id: true, name: true } },
        },
      });
      return created;
    });

    return NextResponse.json({ success: true, record: serializeProductionOut(record) }, { status: 201 });
  } catch (error) {
    console.error("Production out creation error:", error);
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

    const existing = await prisma.productionOut.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Production out record not found" }, { status: 404 });

    const data: Record<string, unknown> = { updatedByUserId: userId };

    if (body.productionCategory !== undefined) {
      const cat = String(body.productionCategory).trim();
      if (!cat) return NextResponse.json({ error: "Production Category is required" }, { status: 400 });
      data.productionCategory = cat;
    }
    if (body.indentNo !== undefined) data.indentNo = body.indentNo ? String(body.indentNo).trim() : null;
    if (body.branchId !== undefined) data.branchId = body.branchId ? parseInt(String(body.branchId), 10) : null;
    if (body.remarks !== undefined) data.remarks = body.remarks ? String(body.remarks).trim() : null;

    await prisma.$transaction(async (tx) => {
      if (Array.isArray(body.items)) {
        if (body.items.length === 0) {
          throw new Error("At least one product is required");
        }
        const productIds = body.items.map((i: Record<string, unknown>) => parseInt(String(i.productId), 10));
        const products = await tx.product.findMany({
          where: { id: { in: productIds }, companyId },
          select: { id: true, sellingPrice: true },
        });
        if (products.length !== productIds.length) {
          throw new Error("One or more products not found");
        }
        const outItems = body.items.map((i: Record<string, unknown>) => {
          const productId = parseInt(String(i.productId), 10);
          const product = products.find((p) => p.id === productId)!;
          const quantity = Number(i.quantity) || 1;
          const price = Number(i.price) > 0 ? Number(i.price) : Number(product.sellingPrice) || 0;
          return { productId, quantity, price, totalPrice: quantity * price };
        });
        await tx.productionOutItem.deleteMany({ where: { productionOutId: id } });
        await tx.productionOutItem.createMany({
          data: outItems.map((i: { productId: number; quantity: number; price: number; totalPrice: number }) => ({
            productionOutId: id,
            companyId,
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            totalPrice: i.totalPrice,
          })),
        });
        data.numberOfProducts = outItems.length;
        data.grandTotal = outItems.reduce((sum: number, i: { totalPrice: number }) => sum + i.totalPrice, 0);
      }

      await tx.productionOut.update({ where: { id }, data });
    });

    const updated = await prisma.productionOut.findUnique({
      where: { id },
      include: { ...itemsInclude, branch: { select: { id: true, branchName: true } }, createdByUser: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, record: serializeProductionOut(updated!) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "At least one product is required" || message === "One or more products not found") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("Production out update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.productionOut.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Production out record not found" }, { status: 404 });

    await prisma.productionOut.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Production out delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
