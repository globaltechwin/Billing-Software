import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";
import { generateHoldNumber } from "@/lib/number-generators";

export async function GET() {
  try {
    const companyId = await getCurrentCompanyId();
    const heldBills = await prisma.heldBill.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, heldBills });
  } catch (error) {
    console.error("Held bills list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const {
      customerId,
      customerName,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      grandTotal,
      gstMode,
      gstRate,
      paymentMode,
      remarks,
      salesPerson,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items to hold" }, { status: 400 });
    }

    const holdNumber = await generateHoldNumber(companyId);

    const heldBill = await prisma.heldBill.create({
      data: {
        companyId,
        holdNumber,
        customerId: customerId || null,
        customerName: customerName || null,
        items: items,
        subtotal: subtotal || 0,
        taxAmount: taxAmount || 0,
        discountAmount: discountAmount || 0,
        grandTotal: grandTotal || 0,
        gstMode: gstMode || null,
        gstRate: gstRate || null,
        paymentMode: paymentMode || null,
        remarks: remarks || null,
        salesPerson: salesPerson || null,
        createdByUserId: userId,
      },
    });

    return NextResponse.json({ success: true, heldBill }, { status: 201 });
  } catch (error) {
    console.error("Hold bill error:", error);
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

    const existing = await prisma.heldBill.findFirst({
      where: { id: parseInt(id), companyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Held bill not found" }, { status: 404 });
    }

    await prisma.heldBill.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete held bill error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
