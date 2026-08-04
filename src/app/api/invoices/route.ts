import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";

interface InvoiceItemInput {
  productId: number;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  remarks?: string;
  gstRate?: number;
}

interface InvoiceInput {
  customerId: number;
  items: InvoiceItemInput[];
  gstMode: "GST_VISIBLE" | "GST_INCLUDED_HIDDEN" | "GST_IGST" | "NO_GST" | "GST_ITEM_WISE";
  taxRate?: number;
  discountAmount?: number;
  paymentMode?: string;
  cashReceived?: number;
  remarks?: string;
  branchId?: number;
  salesPerson?: string;
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();

    const body: InvoiceInput = await request.json();
    const { customerId, items, gstMode, taxRate: clientTaxRate, discountAmount, paymentMode, cashReceived, remarks, branchId, salesPerson } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json(
        { error: "Company not configured" },
        { status: 500 }
      );
    }

    // Enforce global GST settings: master switch + per-invoice override policy
    let effectiveGstMode = gstMode;
    if (!company.gstEnabled) {
      effectiveGstMode = "NO_GST";
    } else if (effectiveGstMode !== "GST_ITEM_WISE" && !company.allowInvoiceGstOverride && company.gstMode) {
      effectiveGstMode = company.gstMode;
    }

    let customer: { id: number; customerName: string; stateCode: string; stateName: string } | null = null;
    if (customerId) {
      customer = await prisma.customer.findFirst({
        where: { id: customerId, companyId },
      });
      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found in your company" },
          { status: 404 }
        );
      }
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, companyId },
      include: { gstMaster: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products not found in your company" },
        { status: 404 }
      );
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (Number(product.currentStock) < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.productName}. Available: ${product.currentStock}, Requested: ${item.quantity}` },
          { status: 400 }
        );
      }
    }

    const invoiceNumber = await generateInvoiceNumber(companyId);

    let invoiceSubtotal = 0;

    const invoiceItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPrice = item.unitPrice || Number(product.sellingPrice);
      const quantity = item.quantity;
      const itemSubtotal = unitPrice * quantity;

      invoiceSubtotal += itemSubtotal;

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

    const itemDiscountTotal = discountAmount || 0;
    const isInterstate = company.gstStateCode && customer?.stateCode
      ? company.gstStateCode !== customer.stateCode
      : false;

    const isItemWise = effectiveGstMode === "GST_ITEM_WISE";

    for (const item of invoiceItems) {
      const product = products.find((p) => p.id === item.productId)!;

      let rate: number;
      if (isItemWise) {
        const clientRate = items.find((i) => i.productId === item.productId)?.gstRate;
        rate = clientRate ?? (product.gstApplicable !== false ? Number(product.gstMaster.totalPercentage) : 0);
      } else {
        rate = clientTaxRate || 0;
      }

      const taxableBase = item.subtotal;
      const itemTax = Math.round(taxableBase * (rate / 100) * 100) / 100;

      item.gstPercentage = rate;
      item.cgstPercentage = isInterstate ? 0 : rate / 2;
      item.sgstPercentage = isInterstate ? 0 : rate / 2;
      item.igstPercentage = isInterstate ? rate : 0;
      item.cgstAmount = isInterstate ? 0 : Math.round(itemTax / 2 * 100) / 100;
      item.sgstAmount = isInterstate ? 0 : Math.round(itemTax / 2 * 100) / 100;
      item.igstAmount = isInterstate ? itemTax : 0;
      item.taxAmount = item.cgstAmount + item.sgstAmount + item.igstAmount;
      item.totalAmount = item.subtotal + item.taxAmount;
    }

    const invoiceTax = invoiceItems.reduce((sum, item) => sum + item.taxAmount, 0);

    let grandTotal = invoiceSubtotal + invoiceTax - itemDiscountTotal;
    if (company.roundOffEnabled) {
      grandTotal = Math.round(grandTotal);
    }

    let paymentStatus: "PAID" | "PENDING" | "PARTIAL" = "PENDING";
    if (paymentMode === "COMPLIMENT") {
      paymentStatus = "PAID";
    } else if (cashReceived && cashReceived >= grandTotal) {
      paymentStatus = "PAID";
    } else if (cashReceived && cashReceived > 0) {
      paymentStatus = "PARTIAL";
    } else if (paymentMode === "CREDIT") {
      paymentStatus = "PENDING";
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          companyId,
          customerId: customerId || null,
          createdByUserId: userId,
          branchId: branchId || null,
          subtotal: invoiceSubtotal,
          discountAmount: itemDiscountTotal,
          taxAmount: invoiceTax,
          grandTotal,
          gstMode: effectiveGstMode,
          paymentStatus,
          invoiceStatus: "COMPLETED",
          paymentMode: paymentMode || "CASH",
          cashReceived: cashReceived || 0,
          remarks: remarks || null,
          salesPerson: salesPerson || null,
        },
      });

      await tx.invoiceItem.createMany({
        data: invoiceItems.map((item) => ({
          ...item,
          invoiceId: inv.id,
        })),
      });

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        const newBalance = Number(product.currentStock) - item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: newBalance },
        });

        await tx.inventoryLedger.create({
          data: {
            companyId,
            productId: item.productId,
            quantityIn: 0,
            quantityOut: item.quantity,
            balance: newBalance,
            referenceType: "SALE",
            referenceId: inv.id,
            referenceNumber: invoiceNumber,
            createdByUserId: userId,
          },
        });
      }

      return inv;
    });

    // Auto-create kitchen order if there are kitchen items
    const KITCHEN_CATEGORIES = ["Food", "Beverages", "Desserts", "Starters", "Main Course"];
    try {
      const invoiceWithItems = await prisma.invoice.findUnique({
        where: { id: invoice.id },
        include: {
          items: {
            include: { product: { select: { id: true, category: true, unit: true } } },
          },
          customer: { select: { customerName: true } },
        },
      });

      if (invoiceWithItems) {
        const kitchenItems = invoiceWithItems.items.filter(
          (item) => item.product.category && KITCHEN_CATEGORIES.includes(item.product.category)
        );

        if (kitchenItems.length > 0) {
          const { generateKOTNumber } = await import("@/lib/number-generators");
          const kotNumber = await generateKOTNumber(companyId);

          await prisma.kitchenOrder.create({
            data: {
              kotNumber,
              companyId,
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              customerId: invoice.customerId,
              customerName: invoiceWithItems.customer?.customerName || null,
              orderType: "DINE_IN",
              priority: "NORMAL",
              createdByUserId: userId,
              items: {
                createMany: {
                  data: kitchenItems.map((item) => ({
                    productId: item.productId,
                    productNameSnapshot: item.productNameSnapshot,
                    quantity: item.quantity,
                    unit: item.product.unit || null,
                    itemStatus: "NEW",
                  })),
                },
              },
            },
          });
        }
      }
    } catch (kdsError) {
      console.error("Failed to create kitchen order:", kdsError);
      // Don't fail the invoice creation if KDS fails
    }

    const response: Record<string, unknown> = {
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        subtotal: invoice.subtotal,
        discountAmount: invoice.discountAmount,
        taxAmount: invoice.taxAmount,
        grandTotal: invoice.grandTotal,
        gstMode: invoice.gstMode,
        paymentStatus: invoice.paymentStatus,
        invoiceStatus: invoice.invoiceStatus,
        paymentMode: invoice.paymentMode,
        cashReceived: invoice.cashReceived,
        customer: customer
          ? {
              id: customer.id,
              customerName: customer.customerName,
              stateCode: customer.stateCode,
              stateName: customer.stateName,
            }
          : null,
        items: invoiceItems.map((item) => ({
          productName: item.productNameSnapshot,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          ...(effectiveGstMode === "GST_VISIBLE"
            ? {
                gstPercentage: item.gstPercentage,
                cgstPercentage: item.cgstPercentage,
                sgstPercentage: item.sgstPercentage,
                igstPercentage: item.igstPercentage,
                cgstAmount: item.cgstAmount,
                sgstAmount: item.sgstAmount,
                igstAmount: item.igstAmount,
                taxAmount: item.taxAmount,
              }
            : {}),
          totalAmount: item.totalAmount,
        })),
      },
    };

    if (effectiveGstMode === "GST_VISIBLE") {
      (response.invoice as Record<string, unknown>).gstBreakup = {
        subtotal: invoiceSubtotal,
        cgst: invoiceItems.reduce((sum, i) => sum + i.cgstAmount, 0),
        sgst: invoiceItems.reduce((sum, i) => sum + i.sgstAmount, 0),
        igst: invoiceItems.reduce((sum, i) => sum + i.igstAmount, 0),
        tax: invoiceTax,
        discount: itemDiscountTotal,
        grandTotal,
        ...(company.roundOffEnabled && {
          rounding: grandTotal - (invoiceSubtotal + invoiceTax - itemDiscountTotal),
        }),
      };
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Invoice creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const gstMode = searchParams.get("gstMode") || "";
    const paymentMode = searchParams.get("paymentMode") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const invoiceStatus = searchParams.get("invoiceStatus") || "";
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortDirection = searchParams.get("sortDirection") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = { companyId };

    // Soft delete filtering: exclude deleted by default, or show only deleted
    const showDeleted = searchParams.get("showDeleted") === "true";
    const deletedByUser = searchParams.get("deletedBy") || "";
    if (showDeleted) {
      where.deletedAt = { not: null };
      if (deletedByUser) {
        where.deletedByUser = { name: { contains: deletedByUser } };
      }
    } else {
      where.deletedAt = null;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { customerName: { contains: search } } },
        { customer: { phone: { contains: search } } },
        { salesPerson: { contains: search } },
        { remarks: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
      where.invoiceDate = dateFilter;
    }

    if (gstMode) where.gstMode = gstMode;
    if (paymentMode) where.paymentMode = paymentMode;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (invoiceStatus) where.invoiceStatus = invoiceStatus;

    const allowedSortFields = ["invoiceDate", "createdAt", "grandTotal", "invoiceNumber", "deletedAt"];
    const orderBy = allowedSortFields.includes(sortField)
      ? { [sortField]: sortDirection }
      : { createdAt: "desc" as const };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: { select: { customerName: true, phone: true } },
          createdByUser: { select: { name: true } },
          deletedByUser: { select: { name: true } },
          _count: { select: { items: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    const result = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      customerName: inv.customer?.customerName || "Walk-in",
      customerPhone: inv.customer?.phone || "",
      gstMode: inv.gstMode,
      paymentMode: inv.paymentMode || "Cash",
      subtotal: Number(inv.subtotal),
      discountAmount: Number(inv.discountAmount),
      taxAmount: Number(inv.taxAmount),
      grandTotal: Number(inv.grandTotal),
      cashReceived: Number(inv.cashReceived),
      paymentStatus: inv.paymentStatus,
      invoiceStatus: inv.invoiceStatus,
      salesPerson: inv.salesPerson || "",
      remarks: inv.remarks || "",
      itemCount: inv._count.items,
      createdBy: inv.createdByUser?.name || "",
      deletedAt: inv.deletedAt,
      deletedBy: inv.deletedByUser?.name || "",
      deleteReason: inv.deleteReason || "",
      createdAt: inv.createdAt,
    }));

    return NextResponse.json({
      success: true,
      invoices: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Invoice list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
