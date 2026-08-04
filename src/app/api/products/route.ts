import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();
    const products = await prisma.product.findMany({
      where: { companyId },
      select: {
        id: true,
        productName: true,
        productCode: true,
        description: true,
        category: true,
        unit: true,
        purchasePrice: true,
        sellingPrice: true,
        barcode: true,
        hsnCode: true,
        gstApplicable: true,
        currentStock: true,
        minimumStock: true,
        maximumStock: true,
        reorderLevel: true,
        isActive: true,
        gstMaster: { select: { id: true, name: true, totalPercentage: true, cgstPercentage: true, sgstPercentage: true, igstPercentage: true } },
      },
      orderBy: { productName: "asc" },
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Products list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const body = await request.json();
    const {
      productName,
      productCode,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      barcode,
      hsnCode,
      gstMasterId,
      gstApplicable,
      currentStock,
      minimumStock,
      maximumStock,
      reorderLevel,
      isActive,
    } = body;

    if (!productName) {
      return NextResponse.json({ error: "productName is required" }, { status: 400 });
    }

    if (!gstMasterId) {
      return NextResponse.json({ error: "gstMasterId is required" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: "Company not configured" }, { status: 500 });
    }

    if (company.defaultHsnRequired && !hsnCode) {
      return NextResponse.json({ error: "HSN/SAC code is required for this company" }, { status: 400 });
    }

    const gstMaster = await prisma.gSTMaster.findFirst({
      where: { id: gstMasterId },
    });
    if (!gstMaster) {
      return NextResponse.json({ error: "GST rate not found" }, { status: 404 });
    }

    const product = await prisma.product.create({
      data: {
        companyId,
        productName,
        productCode: productCode || null,
        description: null,
        category: category || null,
        unit: unit || "NOS",
        purchasePrice: purchasePrice || 0,
        sellingPrice: sellingPrice || 0,
        gstMasterId,
        gstApplicable: gstApplicable !== false,
        barcode: barcode || null,
        hsnCode: hsnCode || null,
        currentStock: currentStock || 0,
        minimumStock: minimumStock || 0,
        maximumStock: maximumStock || 0,
        reorderLevel: reorderLevel || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.product.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (updateData.hsnCode !== undefined && !updateData.hsnCode) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company?.defaultHsnRequired) {
        return NextResponse.json({ error: "HSN/SAC code is required for this company" }, { status: 400 });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.product.findFirst({
      where: { id: parseInt(id), companyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
