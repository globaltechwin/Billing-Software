import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/gst-rates — list GST rates (all rates are global, shared across companies)
export async function GET() {
  try {
    const rates = await prisma.gSTMaster.findMany({
      orderBy: { totalPercentage: "asc" },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({
      success: true,
      rates: rates.map((r) => ({
        id: r.id,
        name: r.name,
        totalPercentage: r.totalPercentage,
        cgstPercentage: r.cgstPercentage,
        sgstPercentage: r.sgstPercentage,
        igstPercentage: r.igstPercentage,
        effectiveFrom: r.effectiveFrom,
        isCustom: r.isCustom,
        isActive: r.isActive,
        productCount: r._count.products,
      })),
    });
  } catch (error) {
    console.error("GST rates list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/gst-rates — create a new GST rate (custom rates only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, totalPercentage, cgstPercentage, sgstPercentage, igstPercentage, effectiveFrom } = body;

    if (!name || totalPercentage === undefined || cgstPercentage === undefined || sgstPercentage === undefined || igstPercentage === undefined) {
      return NextResponse.json(
        { error: "name, totalPercentage, cgstPercentage, sgstPercentage, and igstPercentage are required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findFirst({ where: { allowCustomGstRate: true } });
    if (!company) {
      return NextResponse.json(
        { error: "Custom GST rates are not allowed for this company" },
        { status: 403 }
      );
    }

    // Verify cgst + sgst = total
    const cgst = parseFloat(cgstPercentage);
    const sgst = parseFloat(sgstPercentage);
    const total = parseFloat(totalPercentage);
    const igst = parseFloat(igstPercentage);
    if (Math.abs(cgst + sgst - total) > 0.01) {
      return NextResponse.json(
        { error: "CGST + SGST must equal total percentage" },
        { status: 400 }
      );
    }

    // Verify igst = total
    if (Math.abs(igst - total) > 0.01) {
      return NextResponse.json(
        { error: "IGST must equal total percentage" },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existingByName = await prisma.gSTMaster.findFirst({
      where: { name },
    });
    if (existingByName) {
      return NextResponse.json(
        { error: `A GST rate with name "${name}" already exists` },
        { status: 409 }
      );
    }

    // Check for duplicate total percentage
    const existing = await prisma.gSTMaster.findFirst({
      where: { totalPercentage: total },
    });
    if (existing) {
      return NextResponse.json(
        { error: `A GST rate with ${total}% already exists` },
        { status: 409 }
      );
    }

    const rate = await prisma.gSTMaster.create({
      data: {
        name,
        totalPercentage: total,
        cgstPercentage: cgst,
        sgstPercentage: sgst,
        igstPercentage: igst,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : null,
        isCustom: true,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, rate }, { status: 201 });
  } catch (error) {
    console.error("GST rate creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/gst-rates — update a GST rate
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, totalPercentage, cgstPercentage, sgstPercentage, igstPercentage, effectiveFrom, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.gSTMaster.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "GST rate not found" }, { status: 404 });
    }

    const nextName = name !== undefined ? name : existing.name;
    const nextTotal = totalPercentage !== undefined ? parseFloat(totalPercentage) : existing.totalPercentage.toNumber();
    const nextCgst = cgstPercentage !== undefined ? parseFloat(cgstPercentage) : existing.cgstPercentage.toNumber();
    const nextSgst = sgstPercentage !== undefined ? parseFloat(sgstPercentage) : existing.sgstPercentage.toNumber();
    const nextIgst = igstPercentage !== undefined ? parseFloat(igstPercentage) : existing.igstPercentage.toNumber();

    // Verify cgst + sgst = total
    if (Math.abs(nextCgst + nextSgst - nextTotal) > 0.01) {
      return NextResponse.json(
        { error: "CGST + SGST must equal total percentage" },
        { status: 400 }
      );
    }

    // Verify igst = total
    if (Math.abs(nextIgst - nextTotal) > 0.01) {
      return NextResponse.json(
        { error: "IGST must equal total percentage" },
        { status: 400 }
      );
    }

    // Check for duplicate name
    if (nextName !== existing.name) {
      const existingByName = await prisma.gSTMaster.findFirst({
        where: { name: nextName, NOT: { id } },
      });
      if (existingByName) {
        return NextResponse.json(
          { error: `A GST rate with name "${nextName}" already exists` },
          { status: 409 }
        );
      }
    }

    // Check for duplicate total percentage
    if (nextTotal !== existing.totalPercentage.toNumber()) {
      const existingByTotal = await prisma.gSTMaster.findFirst({
        where: { totalPercentage: nextTotal, NOT: { id } },
      });
      if (existingByTotal) {
        return NextResponse.json(
          { error: `A GST rate with ${nextTotal}% already exists` },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (totalPercentage !== undefined) updateData.totalPercentage = nextTotal;
    if (cgstPercentage !== undefined) updateData.cgstPercentage = nextCgst;
    if (sgstPercentage !== undefined) updateData.sgstPercentage = nextSgst;
    if (igstPercentage !== undefined) updateData.igstPercentage = nextIgst;
    if (effectiveFrom !== undefined) updateData.effectiveFrom = effectiveFrom ? new Date(effectiveFrom) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const rate = await prisma.gSTMaster.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, rate });
  } catch (error) {
    console.error("GST rate update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/gst-rates?id=X — soft delete (deactivate) a GST rate
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.gSTMaster.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "GST rate not found" }, { status: 404 });
    }

    // Check if any products use this rate
    const productCount = await prisma.product.count({ where: { gstMasterId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${productCount} product(s) use this GST rate. Reassign them first.` },
        { status: 409 }
      );
    }

    await prisma.gSTMaster.update({ where: { id }, data: { isActive: false } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GST rate delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
