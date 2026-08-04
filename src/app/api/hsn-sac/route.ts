import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/company-context";

// GET /api/hsn-sac — list HSN/SAC records
export async function GET() {
  try {
    const records = await prisma.hSNSac.findMany({
      orderBy: { code: "asc" },
      include: {
        defaultGstRate: { select: { id: true, name: true, totalPercentage: true } },
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({
      success: true,
      records: records.map((r) => ({
        id: r.id,
        code: r.code,
        description: r.description,
        type: r.type,
        defaultGstRateId: r.defaultGstRateId,
        defaultGstRate: r.defaultGstRate,
        isActive: r.isActive,
        productCount: r._count.products,
      })),
    });
  } catch (error) {
    console.error("HSN/SAC list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/hsn-sac — create a new HSN/SAC record
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { code, description, type, defaultGstRateId } = body;

    if (!code || !description) {
      return NextResponse.json(
        { error: "code and description are required" },
        { status: 400 }
      );
    }

    // Check for duplicate code
    const existing = await prisma.hSNSac.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: `HSN/SAC code "${code}" already exists` },
        { status: 409 }
      );
    }

    // Validate defaultGstRateId if provided
    if (defaultGstRateId) {
      const rate = await prisma.gSTMaster.findUnique({ where: { id: defaultGstRateId } });
      if (!rate) {
        return NextResponse.json({ error: "Invalid GST rate" }, { status: 400 });
      }
    }

    const record = await prisma.hSNSac.create({
      data: {
        code,
        description,
        type: type || "HSN",
        defaultGstRateId: defaultGstRateId || null,
        isActive: true,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error) {
    console.error("HSN/SAC creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/hsn-sac — update a HSN/SAC record
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { id, code, description, type, defaultGstRateId, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.hSNSac.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "HSN/SAC record not found" }, { status: 404 });
    }

    // Check code uniqueness if changed
    if (code && code !== existing.code) {
      const duplicate = await prisma.hSNSac.findUnique({ where: { code } });
      if (duplicate) {
        return NextResponse.json(
          { error: `HSN/SAC code "${code}" already exists` },
          { status: 409 }
        );
      }
    }

    // Validate defaultGstRateId if provided
    if (defaultGstRateId) {
      const rate = await prisma.gSTMaster.findUnique({ where: { id: defaultGstRateId } });
      if (!rate) {
        return NextResponse.json({ error: "Invalid GST rate" }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (defaultGstRateId !== undefined) updateData.defaultGstRateId = defaultGstRateId || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedByUserId = userId;

    const record = await prisma.hSNSac.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("HSN/SAC update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/hsn-sac?id=X — soft delete (deactivate) a HSN/SAC record
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.hSNSac.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "HSN/SAC record not found" }, { status: 404 });
    }

    // Check if any products use this HSN/SAC
    const productCount = await prisma.product.count({ where: { hsnSacId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${productCount} product(s) use this HSN/SAC. Unlink them first.` },
        { status: 409 }
      );
    }

    await prisma.hSNSac.update({ where: { id }, data: { isActive: false, updatedByUserId: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("HSN/SAC delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
