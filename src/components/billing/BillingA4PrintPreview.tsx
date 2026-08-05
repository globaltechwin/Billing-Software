"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Printer, Loader2 } from "lucide-react";

interface InvoiceItem {
  id: number;
  productName: string;
  hsnCode: string | null;
  unit: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  gstPercentage: number;
  cgstPercentage: number;
  sgstPercentage: number;
  igstPercentage: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxAmount: number;
  totalAmount: number;
}

interface InvoiceData {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  gstMode: string;
  paymentStatus: string;
  invoiceStatus: string;
  paymentMode?: string;
  salesPerson?: string;
  remarks?: string;
  company: {
    companyName: string;
    gstNumber: string | null;
    gstStateCode: string | null;
    stateName: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    logo: string | null;
    panNumber: string | null;
    city: string | null;
    pincode: string | null;
    bankAccountHolder: string | null;
    bankAccountNumber: string | null;
    bankIfsc: string | null;
    bankName: string | null;
    bankBranch: string | null;
  };
  customer: {
    customerName: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    stateCode: string | null;
    stateName: string | null;
    gstNumber: string | null;
  } | null;
  createdBy: { id: number; name: string; email: string } | null;
  items: InvoiceItem[];
  gstBreakup: {
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    tax: number;
    grandTotal: number;
  } | null;
}

function fmt(v: number): string {
  return v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  let result = convert(intPart);
  if (decPart > 0) result += " and " + convert(decPart) + " Paise";
  return result + " Rupees Only";
}

export default function BillingA4PrintPreview({
  invoiceId,
  onClose,
  showQR = false,
  docType = "INVOICE",
}: {
  invoiceId: number;
  onClose: () => void;
  showQR?: boolean;
  docType?: "INVOICE" | "QUOTATION";
}) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = docType === "QUOTATION" ? `/api/estimates/${invoiceId}` : `/api/invoices/${invoiceId}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInvoice(data.invoice);
        } else {
          setError(data.error || "Failed to load invoice");
        }
      })
      .catch(() => setError("Failed to load invoice"))
      .finally(() => setLoading(false));
  }, [invoiceId, docType]);

  const handlePrint = useCallback(() => {
    const el = printRef.current;
    if (!el) return;
    const parent = el.parentElement;
    document.body.appendChild(el);
    window.print();
    if (parent) parent.appendChild(el);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-purple-600" />
          <p className="text-sm text-gray-600">Loading A4 bill...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">{error || "Invoice not found"}</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300">Close</button>
        </div>
      </div>
    );
  }

  const company = invoice.company;
  const gstMode = invoice.gstMode;
  const showCgstSgst = (gstMode === "GST_VISIBLE" || gstMode === "GST_ITEM_WISE") && invoice.items.some(i => i.cgstPercentage > 0 || i.sgstPercentage > 0);
  const showIgst = gstMode === "GST_IGST" || invoice.items.some(i => i.igstPercentage > 0);
  const isItemWise = gstMode === "GST_ITEM_WISE";

  let cgstRate = 0, sgstRate = 0, igstRate = 0;
  if (isItemWise && invoice.items.length > 0) {
    cgstRate = invoice.items[0].cgstPercentage;
    sgstRate = invoice.items[0].sgstPercentage;
    igstRate = invoice.items[0].igstPercentage;
  } else if (showCgstSgst && invoice.gstBreakup) {
    cgstRate = invoice.subtotal > 0 ? (invoice.gstBreakup.cgst / invoice.subtotal) * 100 : 0;
    sgstRate = cgstRate;
  } else if (showIgst && invoice.gstBreakup) {
    igstRate = invoice.subtotal > 0 ? (invoice.gstBreakup.igst / invoice.subtotal) * 100 : 0;
  }

  const itemsWithTax = invoice.items.map((item, idx) => {
    const taxableValue = item.subtotal;
    const cgstAmt = showCgstSgst ? item.cgstAmount : 0;
    const sgstAmt = showCgstSgst ? item.sgstAmount : 0;
    const igstAmt = showIgst ? item.igstAmount : 0;
    const totalAmount = taxableValue + cgstAmt + sgstAmt + igstAmt;
    return { ...item, srNo: idx + 1, taxableValue, cgstAmt, sgstAmt, igstAmt, totalAmount };
  });

  const totalTaxable = itemsWithTax.reduce((s, i) => s + i.taxableValue, 0);
  const totalCgst = itemsWithTax.reduce((s, i) => s + i.cgstAmt, 0);
  const totalSgst = itemsWithTax.reduce((s, i) => s + i.sgstAmt, 0);
  const totalIgst = itemsWithTax.reduce((s, i) => s + i.igstAmt, 0);
  const totalQty = itemsWithTax.reduce((s, i) => s + i.quantity, 0);
  const grandTotal = invoice.grandTotal;
  const amountInWords = numberToWords(Math.round(grandTotal));

  const fullAddress = [company.address, company.city, company.stateName, company.pincode].filter(Boolean).join(", ");
  const invoiceDate = new Date(invoice.invoiceDate);
  const dateOfSupply = invoiceDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const placeOfSupply = [company.city, company.stateName].filter(Boolean).join(", ");
  const billedName = invoice.customer?.customerName || "Walk-in Customer";
  const billedAddr = invoice.customer?.address || company.address || "";
  const billedGstin = invoice.customer?.gstNumber || company.gstNumber || "URP";
  const billedState = invoice.customer?.stateName || company.stateName || "";
  const billedCode = invoice.customer?.stateCode || company.gstStateCode || "";
  const shippedName = invoice.customer?.customerName || "Walk-in Customer";
  const shippedAddr = invoice.customer?.address || company.address || "";
  const shippedState = invoice.customer?.stateName || company.stateName || "";
  const shippedCode = invoice.customer?.stateCode || company.gstStateCode || "";

  const colCount = showCgstSgst ? 11 : showIgst ? 9 : 7;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-start justify-center overflow-y-auto py-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[820px] my-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 print:hidden">
          <h2 className="text-lg font-bold text-gray-800">
            {docType === "QUOTATION" ? "Quotation" : "Tax Invoice"} — {invoice.invoiceNumber}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-[#3d9a7e] text-white rounded-md text-sm font-medium hover:bg-[#2e8a6e]">
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
        </div>

        <div ref={printRef} className="p-6">
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              .print-a4, .print-a4 * { visibility: visible !important; }
              .print-a4 { position: absolute; left: 0; top: 0; width: 100%; }
              @page { size: A4 portrait; margin: 10mm; }
            }
            .print-a4 { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #000; }
          `}</style>

          <div className="print-a4">
            {/* Company Header */}
            <table className="w-full" style={{ border: "2px solid #000" }}>
              <tbody>
                <tr>
                  <td style={{ width: "120px", padding: "10px", verticalAlign: "middle", border: "1px solid #000" }}>
                    {company.logo ? (
                      <img src={company.logo} alt={company.companyName} style={{ maxWidth: "100px", maxHeight: "100px", display: "block", margin: "0 auto" }} />
                    ) : (
                      <div style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>{company.companyName?.substring(0, 3).toUpperCase()}</div>
                    )}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center", verticalAlign: "middle", border: "1px solid #000" }}>
                    <div style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "1px" }}>{company.companyName}</div>
                    <div style={{ fontSize: "10px", marginTop: "2px" }}>{fullAddress}</div>
                    {company.email && <div style={{ fontSize: "10px", marginTop: "2px" }}>{company.email}</div>}
                    {company.gstNumber && <div style={{ fontSize: "10px", marginTop: "2px", fontWeight: "bold" }}>GSTIN : {company.gstNumber}</div>}
                    {company.panNumber && <div style={{ fontSize: "10px", marginTop: "2px", fontWeight: "bold" }}>PAN No: {company.panNumber}</div>}
                    {company.phone && <div style={{ fontSize: "10px", marginTop: "2px" }}>LAND LINE : {company.phone}</div>}
                  </td>
                  <td style={{ width: "160px", padding: "10px", textAlign: "right", verticalAlign: "middle", border: "1px solid #000" }}>
                    <div style={{ fontSize: "10px" }}>Original for Recipient</div>
                    <div style={{ fontSize: "10px" }}>Duplicate for Transporter</div>
                    <div style={{ fontSize: "10px" }}>Triplicate for Supplier</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* TAX INVOICE title */}
            <div style={{ border: "2px solid #000", borderTop: "none", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "16px", letterSpacing: "2px" }}>
              {docType === "QUOTATION" ? "QUOTATION" : "TAX INVOICE"}
            </div>

            {/* Invoice meta row */}
            <table className="w-full" style={{ border: "2px solid #000", borderTop: "none" }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", padding: "6px 10px", verticalAlign: "top", borderRight: "1px solid #000" }}>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Reverse Charge</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: No</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Invoice No.</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {invoice.invoiceNumber}</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Invoice Date</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {formatDateShort(invoice.invoiceDate)}</td></tr>
                        <tr>
                          <td style={{ fontSize: "10px", padding: "1px 0" }}>State</td>
                          <td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {company.stateName || ""} &nbsp;&nbsp; State Code : {company.gstStateCode || ""}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{ width: "50%", padding: "6px 10px", verticalAlign: "top" }}>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Challan No.</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {invoice.invoiceNumber}</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Transportation Mode</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: Road</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Vehicle No.</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: </td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Date of Supply</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {dateOfSupply}</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Place of Supply</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {placeOfSupply}</td></tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Billing + Shipping */}
            <table className="w-full" style={{ border: "2px solid #000", borderTop: "none" }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", padding: "6px 10px", verticalAlign: "top", borderRight: "1px solid #000" }}>
                    <div style={{ fontSize: "10px", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "3px", marginBottom: "4px" }}>Details of Receiver | Billed to:</div>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Name</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {billedName}</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0", verticalAlign: "top" }}>Address</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {billedAddr}</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>GSTIN</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {billedGstin}</td></tr>
                        <tr>
                          <td style={{ fontSize: "10px", padding: "1px 0" }}>State</td>
                          <td style={{ fontSize: "10px", padding: "1px 0" }}>: {billedState} &nbsp;&nbsp; Code : {billedCode}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{ width: "50%", padding: "6px 10px", verticalAlign: "top" }}>
                    <div style={{ fontSize: "10px", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "3px", marginBottom: "4px" }}>Details of Consignee | Shipped to:</div>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Name</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {shippedName}</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0", verticalAlign: "top" }}>Address</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {shippedAddr}</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>State</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {shippedState} &nbsp;&nbsp; Code : {shippedCode}</td></tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Line Items Table */}
            <table className="w-full" style={{ border: "2px solid #000", borderTop: "none", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#d4e8d4" }}>
                  <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>Sr. No.</th>
                  <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>Name of product</th>
                  <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>QTY</th>
                  <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>Unit</th>
                  <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>Rate</th>
                  <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>Taxable Value</th>
                  {showCgstSgst && (
                    <>
                      <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }} colSpan={2}>CGST</th>
                      <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }} colSpan={2}>SGST</th>
                    </>
                  )}
                  {showIgst && (
                    <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }} colSpan={2}>IGST</th>
                  )}
                  <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>Total</th>
                </tr>
                {showCgstSgst && (
                  <tr style={{ backgroundColor: "#d4e8d4" }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <th key={i} style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    ))}
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Rate</th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Amount</th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Rate</th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Amount</th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                  </tr>
                )}
                {showIgst && (
                  <tr style={{ backgroundColor: "#d4e8d4" }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <th key={i} style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    ))}
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Rate</th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Amount</th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {itemsWithTax.map((item) => (
                  <tr key={item.id}>
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{item.srNo}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px" }}>{item.productName}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{item.unit || "NOS"}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.unitPrice)}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.taxableValue)}</td>
                    {showCgstSgst && (
                      <>
                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{(item.cgstPercentage || cgstRate).toFixed(2)}%</td>
                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.cgstAmt)}</td>
                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{(item.sgstPercentage || sgstRate).toFixed(2)}%</td>
                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.sgstAmt)}</td>
                      </>
                    )}
                    {showIgst && (
                      <>
                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{(item.igstPercentage || igstRate).toFixed(2)}%</td>
                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.igstAmt)}</td>
                      </>
                    )}
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right", fontWeight: "bold" }}>{fmt(item.totalAmount)}</td>
                  </tr>
                ))}
                {itemsWithTax.length < 10 &&
                  Array.from({ length: 10 - itemsWithTax.length }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                      {Array.from({ length: colCount }).map((__, j) => (
                        <td key={j} style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", height: "20px" }}>&nbsp;</td>
                      ))}
                    </tr>
                  ))
                }
                <tr style={{ backgroundColor: "#e8f0e8" }}>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold" }}>Total Quantity</td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold", textAlign: "center" }}>{totalQty}</td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px" }}></td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px" }}></td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold", textAlign: "right" }}>{fmt(totalTaxable)}</td>
                  {showCgstSgst && (
                    <>
                      <td colSpan={2} style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold", textAlign: "right" }}>{fmt(totalCgst)}</td>
                      <td colSpan={2} style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold", textAlign: "right" }}>{fmt(totalSgst)}</td>
                    </>
                  )}
                  {showIgst && (
                    <td colSpan={2} style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold", textAlign: "right" }}>{fmt(totalIgst)}</td>
                  )}
                  <td style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold", textAlign: "right" }}>{fmt(grandTotal)}</td>
                </tr>
              </tbody>
            </table>

            {/* Amount in words + Summary */}
            <table className="w-full" style={{ border: "2px solid #000", borderTop: "none" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "6px 10px", borderBottom: "1px solid #000", verticalAlign: "top" }}>
                    <div style={{ fontSize: "10px", fontWeight: "bold" }}>Total Invoice Amount in words</div>
                    <div style={{ fontSize: "10px", marginTop: "4px" }}>{amountInWords}</div>
                  </td>
                  <td style={{ width: "280px", padding: "6px 10px", borderBottom: "1px solid #000" }}>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr><td style={{ fontSize: "9px", padding: "1px 0" }}>Total Amount Before Tax :</td><td style={{ fontSize: "9px", padding: "1px 0", textAlign: "right", fontWeight: "bold" }}>₹{fmt(totalTaxable)}</td></tr>
                        {showCgstSgst && (
                          <>
                            <tr><td style={{ fontSize: "9px", padding: "1px 0" }}>Add : CGST :</td><td style={{ fontSize: "9px", padding: "1px 0", textAlign: "right" }}>₹{fmt(totalCgst)}</td></tr>
                            <tr><td style={{ fontSize: "9px", padding: "1px 0" }}>Add : SGST :</td><td style={{ fontSize: "9px", padding: "1px 0", textAlign: "right" }}>₹{fmt(totalSgst)}</td></tr>
                            <tr><td style={{ fontSize: "9px", padding: "1px 0" }}>Tax Amount : GST :</td><td style={{ fontSize: "9px", padding: "1px 0", textAlign: "right" }}>₹{fmt(totalCgst + totalSgst)}</td></tr>
                          </>
                        )}
                        {showIgst && (
                          <>
                            <tr><td style={{ fontSize: "9px", padding: "1px 0" }}>Add : IGST :</td><td style={{ fontSize: "9px", padding: "1px 0", textAlign: "right" }}>₹{fmt(totalIgst)}</td></tr>
                            <tr><td style={{ fontSize: "9px", padding: "1px 0" }}>Tax Amount : GST :</td><td style={{ fontSize: "9px", padding: "1px 0", textAlign: "right" }}>₹{fmt(totalIgst)}</td></tr>
                          </>
                        )}
                        <tr><td style={{ fontSize: "9px", padding: "1px 0", fontWeight: "bold" }}>Amount With Tax :</td><td style={{ fontSize: "9px", padding: "1px 0", textAlign: "right", fontWeight: "bold" }}>₹{fmt(grandTotal)}</td></tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bank Details + Signatory */}
            <table className="w-full" style={{ border: "2px solid #000", borderTop: "none" }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", padding: "6px 10px", verticalAlign: "top", borderRight: "1px solid #000" }}>
                    <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "4px" }}>Bank Details</div>
                    <div style={{ fontSize: "9px" }}>Account Holder Name : <span style={{ float: "right" }}>{company.bankAccountHolder || company.companyName}</span></div>
                    {company.bankAccountNumber && <div style={{ fontSize: "9px" }}>Bank Account Number : <span style={{ float: "right" }}>{company.bankAccountNumber}</span></div>}
                    {company.bankIfsc && <div style={{ fontSize: "9px" }}>Bank IFSC Code : <span style={{ float: "right" }}>{company.bankIfsc}</span></div>}
                    {company.bankName && <div style={{ fontSize: "9px" }}>Bank Name : <span style={{ float: "right" }}>{company.bankName}</span></div>}
                    {company.bankBranch && <div style={{ fontSize: "9px" }}>Bank Branch Name : <span style={{ float: "right" }}>{company.bankBranch}</span></div>}
                  </td>
                  <td style={{ width: "50%", padding: "6px 10px", verticalAlign: "top", textAlign: "right" }}>
                    <div style={{ fontSize: "9px", marginTop: "4px" }}>Certified that the particular given above are true</div>
                    <div style={{ fontSize: "9px" }}>and correct</div>
                    <div style={{ fontSize: "10px", fontWeight: "bold", marginTop: "12px" }}>For, {company.companyName}</div>
                    <div style={{ fontSize: "9px", marginTop: "30px" }}>Authorised Signatory</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Terms and Conditions */}
            <div style={{ border: "2px solid #000", borderTop: "none", padding: "6px 10px" }}>
              <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "3px" }}>Terms And Conditions</div>
              <ol style={{ margin: "0", paddingLeft: "16px", fontSize: "9px" }}>
                <li>This is an electronically generated document.</li>
                <li>All disputes are subject to local jurisdiction</li>
                <li>Goods once sold will not be taken back or exchanged</li>
                <li>Bills not paid within the due date will attract interest at 18% p.a.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
