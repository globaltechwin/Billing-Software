import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company-context";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tallyDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}${d.getFullYear()}`;
}

function envelope(title: string, body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Billora</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTBODY>
        <TALLYMESSAGE>
          <!-- ${esc(title)} -->
${body}
        </TALLYMESSAGE>
      </REQUESTBODY>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") || "billing";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    if (!start || !end) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    let xml = "";
    let filename = "";

    if (type === "vendor") {
      const vendors = await prisma.vendor.findMany({
        where: { companyId, isActive: true },
        select: { vendorName: true },
        orderBy: [{ vendorName: "asc" }],
      });
      const body = vendors
        .map(
          (v) => `        <LEDGER NAME="${esc(v.vendorName)}" ACTION="Create">
          <PARENT> Sundry Creditors </PARENT>
          <NAME>${esc(v.vendorName)}</NAME>
        </LEDGER>`
        )
        .join("\n");
      xml = envelope("Vendor Masters", body);
      filename = `billora-vendors.xml`;
    } else if (type === "purchase") {
      const invoices = await prisma.purchaseInvoice.findMany({
        where: { companyId, invoiceDate: { gte: start, lte: end } },
        include: { vendor: { select: { vendorName: true } } },
        orderBy: [{ invoiceDate: "asc" }],
      });
      const body = invoices
        .map((inv) => {
          const total = Number(inv.grandTotal);
          return `        <VOUCHER VCHTYPE="Purchase" ACTION="Create">
          <DATE>${tallyDate(inv.invoiceDate)}</DATE>
          <VOUCHERNUMBER>${esc(inv.invoiceNumber)}</VOUCHERNUMBER>
          <PARTYLEDGERNAME>${esc(inv.vendor.vendorName)}</PARTYLEDGERNAME>
          <LEDGERENTRIES>
            <ALLLEDGERENTRIES>
              <LEDGERNAME>${esc(inv.vendor.vendorName)}</LEDGERNAME>
              <AMOUNT>-${total.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES>
            <ALLLEDGERENTRIES>
              <LEDGERNAME>Purchases</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>${total.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES>
          </LEDGERENTRIES>
        </VOUCHER>`;
        })
        .join("\n");
      xml = envelope(`Purchase Invoices from ${startDate} to ${endDate}`, body);
      filename = `billora-purchase-${startDate}.xml`;
    } else {
      const invoices = await prisma.invoice.findMany({
        where: { companyId, deletedAt: null, invoiceDate: { gte: start, lte: end } },
        select: { invoiceNumber: true, invoiceDate: true, grandTotal: true, paymentMode: true },
        orderBy: [{ invoiceDate: "asc" }],
      });
      const body = invoices
        .map((inv) => {
          const total = Number(inv.grandTotal);
          const mode = inv.paymentMode || "Cash";
          return `        <VOUCHER VCHTYPE="Sales" ACTION="Create">
          <DATE>${tallyDate(inv.invoiceDate)}</DATE>
          <VOUCHERNUMBER>${esc(inv.invoiceNumber)}</VOUCHERNUMBER>
          <PARTYLEDGERNAME>${esc(mode)}</PARTYLEDGERNAME>
          <LEDGERENTRIES>
            <ALLLEDGERENTRIES>
              <LEDGERNAME>${esc(mode)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${total.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES>
            <ALLLEDGERENTRIES>
              <LEDGERNAME>Sales</LEDGERNAME>
              <AMOUNT>${total.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES>
          </LEDGERENTRIES>
        </VOUCHER>`;
        })
        .join("\n");
      xml = envelope(`Sales Vouchers from ${startDate} to ${endDate}`, body);
      filename = `billora-billing-${startDate}.xml`;
    }

    return NextResponse.json({ success: true, xml, filename });
  } catch (error) {
    console.error("Tally XML generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
