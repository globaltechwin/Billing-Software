import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";
import { formatDate } from "@/lib/report-utils";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    if (!start || !end) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { companyId, deletedAt: null, invoiceDate: { gte: start, lte: end } },
      include: {
        customer: { select: { customerName: true, gstNumber: true } },
        items: {
          select: {
            subtotal: true,
            cgstPercentage: true,
            sgstPercentage: true,
            igstPercentage: true,
            cgstAmount: true,
            sgstAmount: true,
            igstAmount: true,
            taxAmount: true,
            product: { select: { hsnCode: true } },
          },
        },
      },
      orderBy: [{ invoiceDate: "asc" }],
    });

    const rows = invoices.map((inv, index) => {
      let taxableValue = 0;
      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;
      let totalTax = 0;
      let cgstRate = 0;
      let sgstRate = 0;
      let igstRate = 0;
      let hsnCode = "";
      let maxSubtotal = -1;

      for (const item of inv.items) {
        const subtotal = Number(item.subtotal);
        taxableValue += subtotal;
        cgstAmount += Number(item.cgstAmount);
        sgstAmount += Number(item.sgstAmount);
        igstAmount += Number(item.igstAmount);
        totalTax += Number(item.taxAmount);
        if (subtotal > maxSubtotal) {
          maxSubtotal = subtotal;
          cgstRate = Number(item.cgstPercentage);
          sgstRate = Number(item.sgstPercentage);
          igstRate = Number(item.igstPercentage);
          hsnCode = item.product.hsnCode || "";
        }
      }

      return {
        id: String(inv.id),
        sNo: index + 1,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: formatDate(inv.invoiceDate),
        customerName: inv.customer?.customerName || "",
        gstin: inv.customer?.gstNumber || "",
        hsnCode,
        taxableValue,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        igstRate,
        igstAmount,
        totalTax,
        invoiceTotal: Number(inv.grandTotal),
      };
    });

    return NextResponse.json({ success: true, rows });
  } catch (error) {
    console.error("GST filing report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
