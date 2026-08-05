import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = await getCurrentCompanyId();
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const invoice = await prisma.accountingInvoice.findFirst({
      where: { id, companyId },
      include: { items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        companyName: true,
        address: true,
        phone: true,
        email: true,
        logo: true,
        gstNumber: true,
        gstStateCode: true,
        stateName: true,
        panNumber: true,
        city: true,
        pincode: true,
      },
    });

    const items = (invoice.items || []).map((item) => ({
      id: item.id,
      item: item.item,
      description: item.description || "",
      unit: item.unit || "",
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      amount: Number(item.amount),
    }));

    const subtotal = Number(invoice.subtotal);
    const discountAmount = Number(invoice.discountAmount);
    const taxRate = Number(invoice.taxRate);
    const taxAmount = Number(invoice.taxAmount);
    const total = Number(invoice.total);
    const paidAmount = Number(invoice.paidAmount);

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        documentType: invoice.documentType || "Invoice",
        gstType: invoice.gstType || "CGST_SGST",
        customerName: invoice.customerName,
        status: invoice.status,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        subtotal,
        discountAmount,
        discountType: invoice.discountType || "%",
        taxRate,
        taxAmount,
        total,
        paidAmount,
        notes: invoice.notes || "",
        terms: invoice.terms || "",
        challanNo: invoice.challanNo || "",
        transportationMode: invoice.transportationMode || "",
        vehicleNo: invoice.vehicleNo || "",
        dateOfSupply: invoice.dateOfSupply,
        placeOfSupply: invoice.placeOfSupply || "",
        billedToName: invoice.billedToName || "",
        billedToAddress: invoice.billedToAddress || "",
        billedToGstin: invoice.billedToGstin || "",
        billedToState: invoice.billedToState || "",
        billedToStateCode: invoice.billedToStateCode || "",
        shippedToName: invoice.shippedToName || "",
        shippedToAddress: invoice.shippedToAddress || "",
        shippedToState: invoice.shippedToState || "",
        shippedToStateCode: invoice.shippedToStateCode || "",
        bankAccountHolder: invoice.bankAccountHolder || "",
        bankAccountNumber: invoice.bankAccountNumber || "",
        bankIfsc: invoice.bankIfsc || "",
        bankName: invoice.bankName || "",
        bankBranch: invoice.bankBranch || "",
        items,
        createdAt: invoice.createdAt,
      },
      company: company
        ? {
            id: company.id,
            companyName: company.companyName,
            address: company.address,
            phone: company.phone,
            email: company.email,
            logo: company.logo,
            gstNumber: company.gstNumber,
            gstStateCode: company.gstStateCode,
            stateName: company.stateName,
            panNumber: company.panNumber,
            city: company.city,
            pincode: company.pincode,
          }
        : null,
    });
  } catch (error) {
    console.error("Accounting invoice fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
