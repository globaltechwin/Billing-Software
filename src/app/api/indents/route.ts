import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateIndentNumber } from "@/lib/number-generators";

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();
    const indents = await prisma.indent.findMany({
      where: { companyId },
      include: {
        createdByUser: { select: { name: true } },
        items: {
          include: {
            product: { select: { id: true, productName: true, unit: true, currentStock: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, indents });
  } catch (error) {
    console.error("Indent list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { requestedBy, department, priority, requiredDate, remarks, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    if (!requestedBy) {
      return NextResponse.json({ error: "Requested By is required" }, { status: 400 });
    }

    if (!department) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 });
    }

    for (const item of items) {
      if (!item.requiredQty || Number(item.requiredQty) <= 0) {
        return NextResponse.json({ error: "Required quantity must be greater than zero" }, { status: 400 });
      }
    }

    const indentNumber = await generateIndentNumber(companyId);

    const result = await prisma.$transaction(async (tx) => {
      const indent = await tx.indent.create({
        data: {
          indentNumber,
          companyId,
          requestedBy,
          department,
          priority: priority || "MEDIUM",
          requiredDate: requiredDate ? new Date(requiredDate) : null,
          remarks: remarks || null,
          status: "PENDING",
          createdByUserId: userId,
        },
      });

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        await tx.indentItem.create({
          data: {
            indentId: indent.id,
            productId: item.productId,
            currentStock: Number(product.currentStock),
            requiredQty: Number(item.requiredQty),
            remarks: item.remarks || null,
          },
        });
      }

      return indent;
    });

    return NextResponse.json({ success: true, indent: result }, { status: 201 });
  } catch (error) {
    console.error("Indent creation error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const body = await request.json();
    const { id, status, requestedBy, department, priority, requiredDate, remarks, items } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const indent = await prisma.indent.findFirst({ where: { id, companyId } });
    if (!indent) return NextResponse.json({ error: "Indent not found" }, { status: 404 });

    // Status-only updates (Approve / Cancel)
    if (status && !items) {
      const updateData: Record<string, unknown> = {};
      if (status === "APPROVED") {
        if (indent.status !== "PENDING") {
          return NextResponse.json({ error: `Cannot approve indent in ${indent.status} status` }, { status: 400 });
        }
        updateData.status = "APPROVED";
      } else if (status === "CANCELLED") {
        if (indent.status === "COMPLETED") {
          return NextResponse.json({ error: "Cannot cancel a completed indent" }, { status: 400 });
        }
        updateData.status = "CANCELLED";
      } else if (status === "REJECTED") {
        if (indent.status !== "PENDING") {
          return NextResponse.json({ error: `Cannot reject indent in ${indent.status} status` }, { status: 400 });
        }
        updateData.status = "REJECTED";
      } else {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      const updated = await prisma.indent.update({ where: { id }, data: updateData });
      return NextResponse.json({ success: true, indent: updated });
    }

    // Full edit update
    if (!requestedBy || !department || !items || items.length === 0) {
      return NextResponse.json({ error: "requestedBy, department, and items are required" }, { status: 400 });
    }

    if (indent.status === "APPROVED" || indent.status === "COMPLETED") {
      return NextResponse.json({ error: `Cannot edit indent in ${indent.status} status` }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.indent.update({
        where: { id },
        data: {
          requestedBy,
          department,
          priority: priority || "MEDIUM",
          requiredDate: requiredDate ? new Date(requiredDate) : null,
          remarks: remarks || null,
        },
      });

      // Delete existing items and recreate
      await tx.indentItem.deleteMany({ where: { indentId: id } });

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        await tx.indentItem.create({
          data: {
            indentId: id,
            productId: item.productId,
            currentStock: Number(product.currentStock),
            requiredQty: Number(item.requiredQty),
            remarks: item.remarks || null,
          },
        });
      }

      return await tx.indent.findUnique({ where: { id } });
    });

    return NextResponse.json({ success: true, indent: result });
  } catch (error) {
    console.error("Indent update error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
