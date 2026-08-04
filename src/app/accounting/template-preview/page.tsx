"use client";

import { useState, useEffect } from "react";
import { Printer, Download, FileText, Receipt } from "lucide-react";

interface PreviewItem {
  sno: number; description: string; hsn: string; qty: number; unit: string; rate: number; amount: number;
}

interface CompanyInfo {
  name: string; address: string; phone: string; email: string; gstin: string;
}

interface CustomerInfo {
  name: string; address: string; phone: string; email: string;
}

interface PreviewData {
  quoteNo: string;
  invoiceNo: string;
  date: string;
  expiryDate: string;
  dueDate: string;
  company: CompanyInfo;
  customer: CustomerInfo;
  items: PreviewItem[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  total: number;
  paid: number;
  outstanding: number;
  terms: string[];
  notes: string;
}

const fmt = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function mapCustomer(label: string, customerMap: Map<string, Record<string, string>>): CustomerInfo {
  const clean = (label || "").trim().toLowerCase();
  let c = customerMap.get(clean);
  if (!c && clean.includes("-")) {
    c = customerMap.get(clean.slice(clean.indexOf("-") + 1).trim());
  }
  if (!c) return { name: label || "", address: "", phone: "", email: "" };
  const address = [c.address, c.addressLine2, c.city, c.stateName, c.pincode].filter(Boolean).join(", ");
  return {
    name: c.customerName || label,
    address,
    phone: c.phone || "",
    email: c.email || "",
  };
}

function mapCompany(branch: Record<string, unknown>): CompanyInfo {
  const address = [branch.addr1, branch.addr2, branch.city, branch.state, branch.pincode].filter(Boolean).join(", ");
  return {
    name: (branch.branchName as string) || "",
    address,
    phone: (branch.phone as string) || "",
    email: (branch.email as string) || "",
    gstin: (branch.gstin as string) || "",
  };
}

function buildQuotePreview(
  quote: Record<string, unknown>,
  company: CompanyInfo,
  customerMap: Map<string, Record<string, string>>
): PreviewData {
  const items: PreviewItem[] = ((quote.items as Record<string, unknown>[]) || []).map((it, i) => ({
    sno: i + 1,
    description: [it.item, it.description].filter(Boolean).join(" — "),
    hsn: (it.hsn as string) || "",
    qty: Number(it.qty) || 0,
    unit: "",
    rate: Number(it.rate) || 0,
    amount: Number(it.amount) || 0,
  }));
  const subtotal = items.reduce((s, it) => s + it.amount, 0);
  const discountType = (quote.discountType as string) || "%";
  const discount = discountType === "₹"
    ? Number(quote.discount) || 0
    : subtotal * ((Number(quote.discount) || 0) / 100);
  const taxableAmount = subtotal - discount;
  const taxAmt = taxableAmount * ((Number(quote.taxRate) || 0) / 100);
  const total = taxableAmount + taxAmt;
  const terms = ((quote.terms as string) || "").split("\n").map(t => t.trim()).filter(Boolean);

  return {
    quoteNo: (quote.quoteNo as string) || "",
    invoiceNo: "",
    date: (quote.date as string) || "",
    expiryDate: (quote.expiryDate as string) || "",
    dueDate: "",
    company,
    customer: mapCustomer(quote.customer as string, customerMap),
    items,
    subtotal,
    discount,
    taxableAmount,
    cgst: taxAmt / 2,
    sgst: taxAmt / 2,
    total,
    paid: 0,
    outstanding: 0,
    terms,
    notes: (quote.notes as string) || "",
  };
}

function buildInvoicePreview(
  inv: Record<string, unknown>,
  company: CompanyInfo,
  customerMap: Map<string, Record<string, string>>
): PreviewData {
  const items: PreviewItem[] = ((inv.items as Record<string, unknown>[]) || []).map((it, i) => ({
    sno: i + 1,
    description: [it.item, it.description].filter(Boolean).join(" — "),
    hsn: "",
    qty: Number(it.qty) || 0,
    unit: "",
    rate: Number(it.rate) || 0,
    amount: Number(it.amount) || 0,
  }));
  const subtotal = Number(inv.subtotal) || items.reduce((s, it) => s + it.amount, 0);
  const discount = Number(inv.discount) || 0;
  const taxableAmount = subtotal - discount;
  const taxAmt = Number(inv.taxAmount) || 0;
  const total = Number(inv.total) || taxableAmount + taxAmt;
  const paid = Number(inv.paid) || 0;

  return {
    quoteNo: "",
    invoiceNo: (inv.invoiceNo as string) || "",
    date: (inv.issueDate as string) || "",
    expiryDate: "",
    dueDate: (inv.dueDate as string) || "",
    company,
    customer: mapCustomer(inv.customerName as string, customerMap),
    items,
    subtotal,
    discount,
    taxableAmount,
    cgst: taxAmt / 2,
    sgst: taxAmt / 2,
    total,
    paid,
    outstanding: total - paid,
    terms: [],
    notes: "",
  };
}

export default function TemplatePreviewPage() {
  const [previewType, setPreviewType] = useState<"quote" | "invoice">("quote");
  const [loading, setLoading] = useState(true);
  const [quoteData, setQuoteData] = useState<PreviewData | null>(null);
  const [invoiceData, setInvoiceData] = useState<PreviewData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/branches?activeOnly=true&limit=100").then(r => r.json()),
      fetch("/api/quotes?page=1&limit=1").then(r => r.json()),
      fetch("/api/accounting/invoices?page=1&limit=1").then(r => r.json()),
      fetch("/api/customers?activeOnly=true&limit=500").then(r => r.json()),
    ])
      .then(([branchJson, quoteJson, invoiceJson, customerJson]) => {
        const branches: Record<string, unknown>[] = branchJson.success ? branchJson.branches : [];
        const branch = branches.find(b => b.isDefault === true) || branches[0] || null;
        const company = branch ? mapCompany(branch) : null;

        const customerMap = new Map<string, Record<string, string>>();
        ((customerJson.success ? customerJson.customers : []) as Record<string, string>[]).forEach(c => {
          customerMap.set((c.customerName || "").trim().toLowerCase(), c);
          if (c.customerCode) customerMap.set(`${c.customerCode}-${c.customerName}`.trim().toLowerCase(), c);
        });

        const quote = quoteJson.success && quoteJson.quotes?.length ? quoteJson.quotes[0] : null;
        const invoice = invoiceJson.success && invoiceJson.invoices?.length ? invoiceJson.invoices[0] : null;

        setQuoteData(quote && company ? buildQuotePreview(quote, company, customerMap) : null);
        setInvoiceData(invoice && company ? buildInvoicePreview(invoice, company, customerMap) : null);
        setLoading(false);
      })
      .catch(e => {
        console.error("Failed to load preview data:", e);
        setLoading(false);
      });
  }, []);

  const data = previewType === "quote" ? quoteData : invoiceData;
  const isQuote = previewType === "quote";

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-800">Template Preview</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={()=>setPreviewType("quote")} className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium ${previewType==="quote"?"bg-[#4caf85] text-white":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`}><FileText size={14} /> Quote</button>
          <button onClick={()=>setPreviewType("invoice")} className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium ${previewType==="invoice"?"bg-blue-500 text-white":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`}><Receipt size={14} /> Invoice</button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 text-white rounded-md text-sm font-medium hover:bg-gray-800"><Printer size={14} /> Print</button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600"><Download size={14} /> Download</button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 text-sm text-gray-500">Loading preview...</div>
      ) : !data ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 text-sm text-gray-500">
          {isQuote ? "No quotes yet. Create a quote to preview it here." : "No invoices yet. Create an invoice to preview it here."}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto w-full">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{data.company.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{data.company.address}</p>
                {data.company.phone && <p className="text-sm text-gray-600">Phone: {data.company.phone}</p>}
                {data.company.email && <p className="text-sm text-gray-600">Email: {data.company.email}</p>}
                {data.company.gstin && <p className="text-sm text-gray-600">GSTIN: {data.company.gstin}</p>}
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-[#3d9a7e]">{isQuote ? "QUOTATION" : "TAX INVOICE"}</h3>
                <p className="text-sm text-gray-600 mt-2">{isQuote ? `Quote No: ${data.quoteNo}` : `Invoice No: ${data.invoiceNo}`}</p>
                <p className="text-sm text-gray-600">Date: {data.date}</p>
                {isQuote ? <p className="text-sm text-gray-600">Expiry: {data.expiryDate}</p> : <p className="text-sm text-gray-600">Due: {data.dueDate}</p>}
              </div>
            </div>

            {/* Customer */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h4>
              <p className="text-sm font-medium text-gray-800">{data.customer.name}</p>
              {data.customer.address && <p className="text-sm text-gray-600">{data.customer.address}</p>}
              {data.customer.phone && <p className="text-sm text-gray-600">Phone: {data.customer.phone}</p>}
              {data.customer.email && <p className="text-sm text-gray-600">Email: {data.customer.email}</p>}
            </div>

            {/* Items Table */}
            <table className="w-full mb-6">
              <thead><tr className="bg-[#3d9a7e] text-white">
                <th className="px-3 py-2 text-center text-xs font-semibold">S.NO</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">DESCRIPTION</th>
                <th className="px-3 py-2 text-center text-xs font-semibold">HSN</th>
                <th className="px-3 py-2 text-center text-xs font-semibold">QTY</th>
                <th className="px-3 py-2 text-center text-xs font-semibold">UNIT</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">RATE</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">AMOUNT</th>
              </tr></thead>
              <tbody>
                {data.items.map(item => (
                  <tr key={item.sno} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-sm text-center">{item.sno}</td>
                    <td className="px-3 py-2 text-sm">{item.description}</td>
                    <td className="px-3 py-2 text-sm text-center">{item.hsn}</td>
                    <td className="px-3 py-2 text-sm text-center">{item.qty}</td>
                    <td className="px-3 py-2 text-sm text-center">{item.unit}</td>
                    <td className="px-3 py-2 text-sm text-right">₹{fmt(item.rate)}</td>
                    <td className="px-3 py-2 text-sm text-right font-medium">₹{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-[300px]">
                <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">Subtotal</span><span>₹{fmt(data.subtotal)}</span></div>
                <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">Discount</span><span className="text-red-600">-₹{fmt(data.discount)}</span></div>
                <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">Taxable Amount</span><span>₹{fmt(data.taxableAmount)}</span></div>
                <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">CGST (9%)</span><span>₹{fmt(data.cgst)}</span></div>
                <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">SGST (9%)</span><span>₹{fmt(data.sgst)}</span></div>
                <div className="flex justify-between py-2 text-base font-bold border-t border-gray-300 mt-1"><span>Total</span><span className="text-[#3d9a7e]">₹{fmt(data.total)}</span></div>
                {!isQuote && <>
                  <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">Paid</span><span className="text-green-600">₹{fmt(data.paid)}</span></div>
                  <div className="flex justify-between py-1 text-sm font-bold"><span className="text-gray-600">Outstanding</span><span className="text-red-600">₹{fmt(data.outstanding)}</span></div>
                </>}
              </div>
            </div>

            {/* Terms */}
            {isQuote && data.terms.length > 0 && <div className="mb-4"><h4 className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</h4><ul className="list-disc list-inside text-sm text-gray-600">{data.terms.map((t,i)=><li key={i}>{t}</li>)}</ul></div>}

            {/* Notes */}
            <div className="text-center text-sm text-gray-500 italic mt-6 pt-4 border-t border-gray-200">{isQuote ? data.notes : "Thank you for your payment!"}</div>
          </div>
        </div>
      )}
    </div>
  );
}
