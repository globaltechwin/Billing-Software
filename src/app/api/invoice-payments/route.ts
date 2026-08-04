import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateCustomerPaymentNumber } from "@/lib/number-generators";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");

    const where: Record<string, unknown> = { companyId };
    if (invoiceId) where.invoiceId = parseInt(invoiceId, 10);

    const payments = await prisma.invoicePayment.findMany({
      where,
      include: {
        invoice: { select: { invoiceNumber: true, grandTotal: true } },
        customer: { select: { customerName: true, phone: true } },
        createdByUser: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, payments });
  } catch (error) {
    console.error("Invoice payment list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const { invoiceId, amount, paymentMethod, referenceNumber, notes } = body;

    if (!invoiceId || !amount || amount <= 0 || !paymentMethod) {
      return NextResponse.json(
        { error: "invoiceId, amount (>0), and paymentMethod are required" },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
      include: {
        customer: { select: { id: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (invoice.invoiceStatus === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot record payment for a cancelled invoice" },
        { status: 400 }
      );
    }

    const currentPaid = Number(invoice.cashReceived);
    const grandTotal = Number(invoice.grandTotal);
    const outstanding = grandTotal - currentPaid;

    if (amount > outstanding + 0.01) {
      return NextResponse.json(
        {
          error: `Payment amount (₹${amount}) exceeds outstanding balance (₹${outstanding.toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    const paymentNumber = await generateCustomerPaymentNumber(companyId);

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.invoicePayment.create({
        data: {
          paymentNumber,
          companyId,
          invoiceId,
          customerId: invoice.customerId || null,
          amount,
          paymentMethod,
          referenceNumber: referenceNumber || null,
          notes: notes || null,
          createdByUserId: userId,
        },
      });

      const newPaidAmount = currentPaid + amount;
      let paymentStatus: "PAID" | "PENDING" | "PARTIAL" = "PENDING";
      if (newPaidAmount >= grandTotal - 0.01) {
        paymentStatus = "PAID";
      } else if (newPaidAmount > 0) {
        paymentStatus = "PARTIAL";
      }

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          cashReceived: newPaidAmount,
          paymentStatus,
          paymentMode: paymentMethod,
        },
      });

      return payment;
    });

    return NextResponse.json(
      { success: true, payment: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Invoice payment creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
