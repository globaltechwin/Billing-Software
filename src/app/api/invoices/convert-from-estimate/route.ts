import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { generateKOTNumber } from "@/lib/number-generators";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";

interface ConvertEstimateInput {
  estimateId: number;
  paymentMode?: string;
  cashReceived?: number;
  remarks?: string;
  salesPerson?: string;
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body: ConvertEstimateInput = await request.json();
    const { estimateId, paymentMode, cashReceived, remarks, salesPerson } = body;

    if (!estimateId) {
      return NextResponse.json({ error: "Estimate ID is required" }, { status: 400 });
    }

    const estimate = await prisma.estimate.findFirst({
      where: { id: estimateId, companyId },
      include: { items: true, customer: true },
    });

    if (!estimate) {
      return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
    }

    if (estimate.status === "CONVERTED") {
      return NextResponse.json({ error: "This estimate has already been converted to an invoice" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: "Company not configured" }, { status: 500 });
    }

    const invoiceNumber = await generateInvoiceNumber(companyId);

    const estimateGstMode = estimate.gstMode as "GST_VISIBLE" | "GST_INCLUDED_HIDDEN" | "GST_IGST" | "NO_GST" | "GST_ITEM_WISE";

    // Enforce global GST settings: master switch + per-invoice override policy
    let gstMode = estimateGstMode;
    if (!company.gstEnabled) {
      gstMode = "NO_GST";
    } else if (!company.allowInvoiceGstOverride && company.gstMode) {
      gstMode = company.gstMode;
    }

    const estimateItems = estimate.items;
    let invoiceSubtotal = 0;

    const invoiceItems = estimateItems.map((item) => {
      const unitPrice = Number(item.unitPrice);
      const quantity = Number(item.quantity);
      const itemSubtotal = unitPrice * quantity;

      invoiceSubtotal += itemSubtotal;

      return {
        productId: item.productId,
        productNameSnapshot: item.productNameSnapshot,
        quantity,
        unitPrice,
        subtotal: Number(item.subtotal),
        gstPercentage: gstMode === "NO_GST" ? 0 : Number(item.gstPercentage),
        cgstPercentage: gstMode === "NO_GST" ? 0 : Number(item.cgstPercentage),
        sgstPercentage: gstMode === "NO_GST" ? 0 : Number(item.sgstPercentage),
        igstPercentage: gstMode === "NO_GST" ? 0 : Number(item.igstPercentage),
        cgstAmount: gstMode === "NO_GST" ? 0 : Number(item.cgstAmount),
        sgstAmount: gstMode === "NO_GST" ? 0 : Number(item.sgstAmount),
        igstAmount: gstMode === "NO_GST" ? 0 : Number(item.igstAmount),
        taxAmount: gstMode === "NO_GST" ? 0 : Number(item.taxAmount),
        totalAmount: itemSubtotal + (gstMode === "NO_GST" ? 0 : Number(item.taxAmount)),
      };
    });

    const effectiveDiscount = Number(estimate.discountAmount) || 0;
    const invoiceTax = gstMode === "NO_GST" ? 0 : Number(estimate.taxAmount) || 0;
    let grandTotal = invoiceSubtotal + invoiceTax - effectiveDiscount;
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
          customerId: estimate.customerId,
          createdByUserId: userId,
          estimateId: estimate.id,
          subtotal: invoiceSubtotal,
          discountAmount: effectiveDiscount,
          taxAmount: invoiceTax,
          grandTotal,
          gstMode,
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

      for (const item of estimateItems) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        const newBalance = Number(product.currentStock) - Number(item.quantity);

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

      await tx.estimate.update({
        where: { id: estimate.id },
        data: { status: "CONVERTED" },
      });

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
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        estimateId: estimate.id,
        estimateNumber: estimate.estimateNumber,
      },
    });
  } catch (error) {
    console.error("Estimate conversion error:", error);
    return NextResponse.json({ error: "Failed to convert estimate" }, { status: 500 });
  }
}
