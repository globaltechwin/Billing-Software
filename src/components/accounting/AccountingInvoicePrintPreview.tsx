"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Printer, Loader2 } from "lucide-react";

interface InvoiceItem {
  id: number;
  item: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  id: number;
  invoiceNumber: string;
  documentType: string;
  gstType: string;
  customerName: string;
  status: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  discountType: string;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  notes: string;
  terms: string;
  items: InvoiceItem[];
  challanNo: string;
  transportationMode: string;
  vehicleNo: string;
  dateOfSupply: string;
  placeOfSupply: string;
  billedToName: string;
  billedToAddress: string;
  billedToGstin: string;
  billedToState: string;
  billedToStateCode: string;
  shippedToName: string;
  shippedToAddress: string;
  shippedToState: string;
  shippedToStateCode: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankName: string;
  bankBranch: string;
}

interface CompanyData {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;
  gstNumber: string | null;
  gstStateCode: string | null;
  stateName: string;
  panNumber: string | null;
  city: string | null;
  pincode: string | null;
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

function formatDateShort(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

function fmt(v: number): string {
  return v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AccountingInvoicePrintPreview({
  invoiceId,
  onClose,
}: {
  invoiceId: number;
  onClose: () => void;
}) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/accounting/invoices/${invoiceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInvoice(data.invoice);
          setCompany(data.company);
        } else {
          setError(data.error || "Failed to load invoice");
        }
      })
      .catch(() => setError("Failed to load invoice"))
      .finally(() => setLoading(false));
  }, [invoiceId]);

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
          <p className="text-sm text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice || !company) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">{error || "Invoice not found"}</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300">Close</button>
        </div>
      </div>
    );
  }

  const taxRate = Number(invoice.taxRate);
  const gstType = invoice.gstType || "CGST_SGST";
  const showCgstSgst = gstType === "CGST_SGST" && taxRate > 0;
  const showIgst = gstType === "IGST" && taxRate > 0;
  const igstRate = taxRate;
  const cgstRate = showCgstSgst ? taxRate / 2 : 0;
  const sgstRate = showCgstSgst ? taxRate / 2 : 0;

  const itemsWithTax = invoice.items.map((item, idx) => {
    const taxableValue = item.amount;
    const cgstAmount = showCgstSgst ? taxableValue * (cgstRate / 100) : 0;
    const sgstAmount = showCgstSgst ? taxableValue * (sgstRate / 100) : 0;
    const igstAmount = showIgst ? taxableValue * (igstRate / 100) : 0;
    const totalAmount = taxableValue + cgstAmount + sgstAmount + igstAmount;
    return { ...item, srNo: idx + 1, taxableValue, cgstAmount, sgstAmount, igstAmount, totalAmount };
  });

  const totalTaxable = itemsWithTax.reduce((s, i) => s + i.taxableValue, 0);
  const totalCgst = itemsWithTax.reduce((s, i) => s + i.cgstAmount, 0);
  const totalSgst = itemsWithTax.reduce((s, i) => s + i.sgstAmount, 0);
  const totalIgst = itemsWithTax.reduce((s, i) => s + i.igstAmount, 0);
  const totalQty = itemsWithTax.reduce((s, i) => s + i.quantity, 0);
  const grandTotal = totalTaxable + totalCgst + totalSgst + totalIgst;
  const amountInWords = numberToWords(Math.round(grandTotal));

  const fullAddress = [company.address, company.city, company.stateName, company.pincode].filter(Boolean).join(", ");

  const billedName = invoice.billedToName || invoice.customerName;
  const billedAddr = invoice.billedToAddress || company.address || "";
  const billedGstin = invoice.billedToGstin || company.gstNumber || "URP";
  const billedState = invoice.billedToState || company.stateName || "";
  const billedCode = invoice.billedToStateCode || company.gstStateCode || "";

  const shippedName = invoice.shippedToName || invoice.customerName;
  const shippedAddr = invoice.shippedToAddress || company.address || "";
  const shippedState = invoice.shippedToState || company.stateName || "";
  const shippedCode = invoice.shippedToStateCode || company.gstStateCode || "";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-start justify-center overflow-y-auto py-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[820px] my-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 print:hidden">
          <h2 className="text-lg font-bold text-gray-800">Tax Invoice — {invoice.invoiceNumber}</h2>
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
              .print-area, .print-area * { visibility: visible !important; }
              .print-area { position: absolute; left: 0; top: 0; width: 100%; }
              @page { size: A4 portrait; margin: 10mm; }
            }
            .print-area { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #000; }
          `}</style>

          <div className="print-area">
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
                    <div style={{ fontSize: "10px", marginTop: "2px" }}>{fullAddress}{company.pincode ? ", " + company.pincode : ""}</div>
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
              TAX INVOICE
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
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Challan No.</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {invoice.challanNo || ""}</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Transportation Mode</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {invoice.transportationMode || "Road"}</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Vehicle No.</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {invoice.vehicleNo || ""}</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Date of Supply</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {invoice.dateOfSupply ? formatDateShort(invoice.dateOfSupply) : formatDateShort(invoice.invoiceDate)}</td></tr>
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Place of Supply</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {invoice.placeOfSupply || company.city || ""} {company.stateName || ""}</td></tr>
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
                          <td style={{ fontSize: "10px", padding: "1px 0" }}>: {billedState} &nbsp;&nbsp; State Code : {billedCode}</td>
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
                        <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>State</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {shippedState} &nbsp;&nbsp; State Code : {shippedCode}</td></tr>
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
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Rate</th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Amount</th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Rate</th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Amount</th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                  </tr>
                )}
                {showIgst && (
                  <tr style={{ backgroundColor: "#d4e8d4" }}>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
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
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px" }}>{item.item}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{item.unit || "NOS"}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.unitPrice)}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.taxableValue)}</td>
                    {showCgstSgst && (
                      <>
                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{cgstRate.toFixed(2)}%</td>
                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.cgstAmount)}</td>
                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{sgstRate.toFixed(2)}%</td>
                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.sgstAmount)}</td>
                      </>
                    )}
                    {showIgst && (
                      <>
                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{igstRate.toFixed(2)}%</td>
                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.igstAmount)}</td>
                      </>
                    )}
                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right", fontWeight: "bold" }}>{fmt(item.totalAmount)}</td>
                  </tr>
                ))}
                {itemsWithTax.length < 10 &&
                  Array.from({ length: 10 - itemsWithTax.length }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                      {Array.from({ length: showCgstSgst ? 11 : showIgst ? 9 : 7 }).map((__, j) => (
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

            {/* Bank Details */}
            <table className="w-full" style={{ border: "2px solid #000", borderTop: "none" }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", padding: "6px 10px", verticalAlign: "top", borderRight: "1px solid #000" }}>
                    <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "4px" }}>Bank Details</div>
                    <div style={{ fontSize: "9px" }}>Account Holder Name : <span style={{ float: "right" }}>{invoice.bankAccountHolder || company.companyName}</span></div>
                    <div style={{ fontSize: "9px" }}>Bank Account Number : <span style={{ float: "right" }}>{invoice.bankAccountNumber || ""}</span></div>
                    <div style={{ fontSize: "9px" }}>Bank IFSC Code : <span style={{ float: "right" }}>{invoice.bankIfsc || ""}</span></div>
                    <div style={{ fontSize: "9px" }}>Bank Name : <span style={{ float: "right" }}>{invoice.bankName || ""}</span></div>
                    <div style={{ fontSize: "9px" }}>Bank Branch Name : <span style={{ float: "right" }}>{invoice.bankBranch || ""}</span></div>
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
              {invoice.terms ? (
                <div style={{ fontSize: "9px", whiteSpace: "pre-wrap" }}>{invoice.terms}</div>
              ) : (
                <ol style={{ margin: "0", paddingLeft: "16px", fontSize: "9px" }}>
                  <li>This is an electronically generated document.</li>
                  <li>All disputes are subject to Chennai jurisdiction</li>
                  <li>Warranty and claims of the products will be covered by respective</li>
                  <li>Manufacturer/ service centers as per their terms and conditions</li>
                  <li>Goods sold as bill prices are approved from customer end</li>
                </ol>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
