import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEstimateNumber } from "@/lib/number-generators";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";

interface EstimateItemInput {
  productId: number;
  quantity: number;
  unitPrice: number;
}

interface EstimateInput {
  customerId?: number;
  items: EstimateItemInput[];
  gstMode: "GST_VISIBLE" | "GST_INCLUDED_HIDDEN" | "GST_IGST" | "NO_GST" | "GST_ITEM_WISE";
  taxRate?: number;
  discountAmount?: number;
  expiryDate?: string;
  remarks?: string;
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body: EstimateInput = await request.json();

    const { customerId, items, gstMode, taxRate: clientTaxRate, discountAmount, expiryDate, remarks } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: "Company not configured" }, { status: 500 });
    }

    // Enforce global GST settings: master switch + per-estimate override policy
    let effectiveGstMode = gstMode;
    if (!company.gstEnabled) {
      effectiveGstMode = "NO_GST";
    } else if (!company.allowInvoiceGstOverride && company.gstMode) {
      effectiveGstMode = company.gstMode;
    }

    let customer: { id: number; customerName: string; stateCode: string } | null = null;
    if (customerId) {
      customer = await prisma.customer.findFirst({ where: { id: customerId, companyId } });
      if (!customer) {
        return NextResponse.json({ error: "Customer not found in your company" }, { status: 404 });
      }
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, companyId },
      include: { gstMaster: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more products not found in your company" }, { status: 404 });
    }

    const estimateNumber = await generateEstimateNumber(companyId);

    let estSubtotal = 0;

    const estimateItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPrice = item.unitPrice || Number(product.sellingPrice);
      const quantity = item.quantity;
      const itemSubtotal = unitPrice * quantity;

      estSubtotal += itemSubtotal;

      return {
        productId: product.id,
        productNameSnapshot: product.productName,
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
        gstPercentage: 0,
        cgstPercentage: 0,
        sgstPercentage: 0,
        igstPercentage: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        taxAmount: 0,
        totalAmount: itemSubtotal,
      };
    });

    const effectiveDiscount = discountAmount || 0;
    const rate = clientTaxRate || 0;
    const isInterstate = company.gstStateCode && customer?.stateCode
      ? company.gstStateCode !== customer.stateCode
      : false;
    const estTax = Math.round((estSubtotal - effectiveDiscount) * (rate / 100) * 100) / 100;
    const cgstTax = isInterstate ? 0 : estTax / 2;
    const sgstTax = isInterstate ? 0 : estTax / 2;
    const igstTax = isInterstate ? estTax : 0;

    for (const item of estimateItems) {
      const itemShare = estSubtotal > 0 ? item.subtotal / estSubtotal : 0;
      item.gstPercentage = rate;
      item.cgstPercentage = isInterstate ? 0 : rate / 2;
      item.sgstPercentage = isInterstate ? 0 : rate / 2;
      item.igstPercentage = isInterstate ? rate : 0;
      item.cgstAmount = Math.round(cgstTax * itemShare * 100) / 100;
      item.sgstAmount = Math.round(sgstTax * itemShare * 100) / 100;
      item.igstAmount = Math.round(igstTax * itemShare * 100) / 100;
      item.taxAmount = item.cgstAmount + item.sgstAmount + item.igstAmount;
      item.totalAmount = item.subtotal + item.taxAmount;
    }

    let grandTotal = estSubtotal - effectiveDiscount + estTax;
    if (company.roundOffEnabled) {
      grandTotal = Math.round(grandTotal);
    }

    const estimate = await prisma.$transaction(async (tx) => {
      return tx.estimate.create({
        data: {
          estimateNumber,
          companyId,
          customerId: customerId || null,
          createdByUserId: userId,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          gstMode: effectiveGstMode,
          subtotal: estSubtotal,
          discountAmount: effectiveDiscount,
          taxAmount: estTax,
          grandTotal,
          remarks: remarks || null,
          items: { create: estimateItems },
        },
        include: { items: true, customer: true },
      });
    });

    return NextResponse.json({ success: true, estimate });
  } catch (error) {
    console.error("Error creating estimate:", error);
    return NextResponse.json({ error: "Failed to create estimate" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const customerName = searchParams.get("customerName") || "";
    const estimateNo = searchParams.get("estimateNo") || "";
    const sortBy = searchParams.get("sortBy") || "estimateDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Record<string, unknown> = { companyId };
    if (search) {
      where.OR = [
        { estimateNumber: { contains: search } },
        { customer: { customerName: { contains: search } } },
        { remarks: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (customerName) where.customer = { customerName: { contains: customerName } };
    if (estimateNo) where.estimateNumber = { contains: estimateNo };

    const [estimates, total] = await Promise.all([
      prisma.estimate.findMany({
        where,
        include: { customer: true, items: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.estimate.count({ where }),
    ]);

    return NextResponse.json({
      estimates,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching estimates:", error);
    return NextResponse.json({ error: "Failed to fetch estimates" }, { status: 500 });
  }
}
