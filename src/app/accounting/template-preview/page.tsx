"use client";

import { useState } from "react";
import { Printer, Download, FileText, Receipt } from "lucide-react";

const mockQuote = {
  quoteNo: "QUO-0024", date: "28/07/2026", expiryDate: "28/08/2026",
  company: { name: "Billora Pvt. Ltd.", address: "123 Business Park, Chennai", phone: "+91 98765 43210", email: "info@billora.com", gstin: "33AABCB1234C1Z5" },
  customer: { name: "Priya Sharma", address: "456 Market Road, Mumbai", phone: "+91 98765 43211", email: "priya@example.com" },
  items: [
    { sno: 1, description: "POS Software License", hsn: "8523", qty: 1, unit: "Nos", rate: 12000, amount: 12000 },
    { sno: 2, description: "Installation & Setup", hsn: "9983", qty: 1, unit: "Nos", rate: 3000, amount: 3000 },
    { sno: 3, description: "1 Year Support", hsn: "9983", qty: 1, unit: "Year", rate: 5000, amount: 5000 },
  ],
  subtotal: 20000, discount: 500, taxableAmount: 19500, cgst: 1755, sgst: 1755, total: 23010,
  terms: ["Payment due within 30 days", "Quote valid for 30 days", "Prices include applicable taxes"],
  notes: "Thank you for your business!",
};

const mockInvoice = {
  invoiceNo: "INV-0018", date: "29/07/2026", dueDate: "29/08/2026",
  company: { name: "Billora Pvt. Ltd.", address: "123 Business Park, Chennai", phone: "+91 98765 43210", email: "info@billora.com", gstin: "33AABCB1234C1Z5" },
  customer: { name: "Rajesh Kumar", address: "789 Industrial Area, Bangalore", phone: "+91 98765 43212", email: "rajesh@example.com" },
  items: [
    { sno: 1, description: "POS Software License", hsn: "8523", qty: 2, unit: "Nos", rate: 12000, amount: 24000 },
    { sno: 2, description: "Annual Maintenance", hsn: "9983", qty: 1, unit: "Year", rate: 4000, amount: 4000 },
  ],
  subtotal: 28000, discount: 100, taxableAmount: 27900, cgst: 2511, sgst: 2511, total: 32922, paid: 32922, outstanding: 0,
};

const fmt = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function TemplatePreviewPage() {
  const [previewType, setPreviewType] = useState<"quote" | "invoice">("quote");
  const data = previewType === "quote" ? mockQuote : mockInvoice;
  const isQuote = previewType === "quote";

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Template Preview</h1>
        <div className="flex items-center gap-2">
          <button onClick={()=>setPreviewType("quote")} className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium ${previewType==="quote"?"bg-[#4caf85] text-white":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`}><FileText size={14} /> Quote</button>
          <button onClick={()=>setPreviewType("invoice")} className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium ${previewType==="invoice"?"bg-blue-500 text-white":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`}><Receipt size={14} /> Invoice</button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 text-white rounded-md text-sm font-medium hover:bg-gray-800"><Printer size={14} /> Print</button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600"><Download size={14} /> Download</button>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto w-full">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{data.company.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{data.company.address}</p>
              <p className="text-sm text-gray-600">Phone: {data.company.phone}</p>
              <p className="text-sm text-gray-600">Email: {data.company.email}</p>
              <p className="text-sm text-gray-600">GSTIN: {data.company.gstin}</p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-[#3d9a7e]">{isQuote ? "QUOTATION" : "TAX INVOICE"}</h3>
              <p className="text-sm text-gray-600 mt-2">{isQuote ? `Quote No: ${mockQuote.quoteNo}` : `Invoice No: ${mockInvoice.invoiceNo}`}</p>
              <p className="text-sm text-gray-600">Date: {data.date}</p>
              {isQuote ? <p className="text-sm text-gray-600">Expiry: {mockQuote.expiryDate}</p> : <p className="text-sm text-gray-600">Due: {mockInvoice.dueDate}</p>}
            </div>
          </div>

          {/* Customer */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h4>
            <p className="text-sm font-medium text-gray-800">{data.customer.name}</p>
            <p className="text-sm text-gray-600">{data.customer.address}</p>
            <p className="text-sm text-gray-600">Phone: {data.customer.phone}</p>
            <p className="text-sm text-gray-600">Email: {data.customer.email}</p>
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
                <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">Paid</span><span className="text-green-600">₹{fmt(mockInvoice.paid)}</span></div>
                <div className="flex justify-between py-1 text-sm font-bold"><span className="text-gray-600">Outstanding</span><span className="text-red-600">₹{fmt(mockInvoice.outstanding)}</span></div>
              </>}
            </div>
          </div>

          {/* Terms */}
          {isQuote && <div className="mb-4"><h4 className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</h4><ul className="list-disc list-inside text-sm text-gray-600">{mockQuote.terms.map((t,i)=><li key={i}>{t}</li>)}</ul></div>}

          {/* Notes */}
          <div className="text-center text-sm text-gray-500 italic mt-6 pt-4 border-t border-gray-200">{isQuote ? mockQuote.notes : "Thank you for your payment!"}</div>
        </div>
      </div>
    </div>
  );
}
