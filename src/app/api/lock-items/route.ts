import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const lockStatus = searchParams.get("lockStatus") || "";
    const category = searchParams.get("category") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const sortBy = searchParams.get("sortBy") || "id";
    const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = { companyId, isActive: true };

    if (category) where.category = category;

    if (lockStatus === "locked") {
      where.OR = [{ billLock: true }, { onlineLock: true }];
    } else if (lockStatus === "unlocked") {
      where.AND = [{ billLock: false }, { onlineLock: false }];
    } else if (lockStatus === "bill_locked") {
      where.billLock = true;
    } else if (lockStatus === "online_locked") {
      where.onlineLock = true;
    }

    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { productCode: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const allowedSort: Record<string, string> = {
      id: "id",
      productName: "productName",
      productCode: "productCode",
      category: "category",
    };
    const orderBy = { [allowedSort[sortBy] || "id"]: sortDir };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          productName: true,
          productCode: true,
          category: true,
          billLock: true,
          billLockedAt: true,
          billLockedByUserId: true,
          onlineLock: true,
          onlineLockedAt: true,
          onlineLockedByUserId: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const categories = await prisma.product.findMany({
      where: { companyId, isActive: true },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    return NextResponse.json({
      success: true,
      products: products.map((p) => ({
        id: p.id,
        productName: p.productName,
        productCode: p.productCode || "",
        category: p.category || "",
        billLock: p.billLock,
        onlineLock: p.onlineLock,
      })),
      categories: categories.map((c) => c.category).filter(Boolean),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Lock items list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { id, lockType } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    if (!lockType || !["billLock", "onlineLock"].includes(lockType)) {
      return NextResponse.json({ error: "lockType must be billLock or onlineLock" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({ where: { id, companyId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const currentLock = lockType === "billLock" ? product.billLock : product.onlineLock;
    const newLock = !currentLock;

    const updateData: Record<string, unknown> = {};
    updateData[lockType] = newLock;
    if (lockType === "billLock") {
      updateData.billLockedAt = newLock ? new Date() : null;
      updateData.billLockedByUserId = newLock ? userId : null;
    } else {
      updateData.onlineLockedAt = newLock ? new Date() : null;
      updateData.onlineLockedByUserId = newLock ? userId : null;
    }

    await prisma.product.update({ where: { id }, data: updateData });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        productName: product.productName,
        [lockType]: newLock,
      },
    });
  } catch (error) {
    console.error("Lock items toggle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
