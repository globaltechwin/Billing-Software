import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCompanyContext } from "@/lib/company-context";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");
    const branchId = searchParams.get("branchId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const effectiveFromGte = searchParams.get("effectiveFromGte");
    const effectiveToLte = searchParams.get("effectiveToLte");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: Record<string, unknown> = { companyId };

    if (vendorId) where.vendorId = parseInt(vendorId, 10);
    if (branchId) where.branchId = parseInt(branchId, 10);
    if (status) where.status = status;
    if (effectiveFromGte) where.effectiveFrom = { gte: new Date(effectiveFromGte) };
    if (effectiveToLte) where.effectiveTo = { lte: new Date(effectiveToLte) };

    if (search) {
      where.OR = [
        { vendor: { vendorName: { contains: search } } },
        { vendor: { vendorCode: { contains: search } } },
        { branch: { branchName: { contains: search } } },
        { remarks: { contains: search } },
      ];
    }

    const allowedSortFields = ["id", "vendorId", "branchId", "status", "effectiveFrom", "effectiveTo", "createdAt"];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder === "asc" ? "asc" : "desc";

    const [mappings, total] = await Promise.all([
      prisma.vendorBranchMapping.findMany({
        where,
        include: {
          vendor: { select: { id: true, vendorName: true, vendorCode: true } },
          branch: { select: { id: true, branchName: true } },
          createdByUser: { select: { id: true, name: true } },
        },
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vendorBranchMapping.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      mappings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Vendor branch mapping list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { userId } = await getCompanyContext();
    const body = await request.json();
    const { vendorId, branchId, status, effectiveFrom, effectiveTo, remarks } = body;

    if (!vendorId || !branchId) {
      return NextResponse.json({ error: "Vendor and Branch are required" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, companyId },
    });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const branch = await prisma.branch.findFirst({
      where: { id: branchId, companyId },
    });
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const existing = await prisma.vendorBranchMapping.findFirst({
      where: { companyId, vendorId, branchId },
    });
    if (existing) {
      return NextResponse.json({ error: "This vendor-branch mapping already exists" }, { status: 409 });
    }

    const mapping = await prisma.vendorBranchMapping.create({
      data: {
        companyId,
        vendorId,
        branchId,
        status: status || "ACTIVE",
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : null,
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        remarks: remarks || null,
        createdByUserId: userId,
      },
      include: {
        vendor: { select: { id: true, vendorName: true, vendorCode: true } },
        branch: { select: { id: true, branchName: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, mapping }, { status: 201 });
  } catch (error) {
    console.error("Vendor branch mapping creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.vendorBranchMapping.findFirst({
      where: { id, companyId },
    });
    if (!existing) return NextResponse.json({ error: "Mapping not found" }, { status: 404 });

    if (updateData.vendorId || updateData.branchId) {
      const newVendorId = updateData.vendorId || existing.vendorId;
      const newBranchId = updateData.branchId || existing.branchId;

      const duplicate = await prisma.vendorBranchMapping.findFirst({
        where: {
          companyId,
          vendorId: newVendorId,
          branchId: newBranchId,
          id: { not: id },
        },
      });
      if (duplicate) {
        return NextResponse.json({ error: "This vendor-branch mapping already exists" }, { status: 409 });
      }
    }

    if (updateData.effectiveFrom) updateData.effectiveFrom = new Date(updateData.effectiveFrom);
    if (updateData.effectiveTo) updateData.effectiveTo = new Date(updateData.effectiveTo);

    const mapping = await prisma.vendorBranchMapping.update({
      where: { id },
      data: updateData,
      include: {
        vendor: { select: { id: true, vendorName: true, vendorCode: true } },
        branch: { select: { id: true, branchName: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, mapping });
  } catch (error) {
    console.error("Vendor branch mapping update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.vendorBranchMapping.findFirst({
      where: { id, companyId },
    });
    if (!existing) return NextResponse.json({ error: "Mapping not found" }, { status: 404 });

    await prisma.vendorBranchMapping.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vendor branch mapping delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
