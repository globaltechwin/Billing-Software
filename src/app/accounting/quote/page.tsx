"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Mail, Link, Printer, FileText, ArrowLeft, Search, Send } from "lucide-react";

interface LineItem {
  id: string; item: string; description: string; hsn: string; qty: number; rate: number; amount: number;
}

interface Quote {
  id: string; quoteNo: string; customer: string; date: string; expiryDate: string;
  status: "Draft" | "Sent" | "Approved" | "Rejected" | "Expired" | "Converted";
  items: LineItem[]; discount: number; taxRate: number; notes: string; terms: string;
}

const initialQuotes: Quote[] = [
  { id:"1",quoteNo:"QT-0005",customer:"1002-Omkar Tanti",date:"17/06/2026",expiryDate:"17/07/2026",status:"Sent",items:[{id:"1",item:"abc",description:"3333",hsn:"",qty:2,rate:333,amount:666}],discount:0,taxRate:0,notes:"",terms:"" },
  { id:"2",quoteNo:"QT-0004",customer:"1001-Harikrishnan Arumugam",date:"17/06/2026",expiryDate:"17/07/2026",status:"Draft",items:[],discount:0,taxRate:0,notes:"",terms:"" },
  { id:"3",quoteNo:"QT-0003",customer:"1008-Jeewan Tanti",date:"17/06/2026",expiryDate:"17/07/2026",status:"Draft",items:[],discount:0,taxRate:0,notes:"",terms:"" },
  { id:"4",quoteNo:"QT-0002",customer:"1001-Harikrishnan Arumugam",date:"17/06/2026",expiryDate:"17/07/2026",status:"Draft",items:[],discount:0,taxRate:0,notes:"",terms:"" },
  { id:"5",quoteNo:"QT-0001",customer:"1010-Manikandan E",date:"12/06/2026",expiryDate:"12/07/2026",status:"Draft",items:[],discount:0,taxRate:0,notes:"",terms:"" },
];

const fmt = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const statusColors: Record<string, string> = {
  Draft:"bg-gray-200 text-gray-700", Sent:"bg-blue-500 text-white",
  Approved:"bg-green-100 text-green-700", Rejected:"bg-red-100 text-red-700",
  Expired:"bg-orange-100 text-orange-700", Converted:"bg-purple-100 text-purple-700"
};

const customers = ["1002-Omkar Tanti","1001-Harikrishnan Arumugam","1008-Jeewan Tanti","1010-Manikandan E","1003-Rajesh Kumar","1004-Priya Sharma"];

export default function QuotePage() {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [selectedId, setSelectedId] = useState<string>("1");
  const [view, setView] = useState<"detail" | "new" | "edit">("detail");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formCustomer, setFormCustomer] = useState("");
  const [formStatus, setFormStatus] = useState("Draft");
  const [formDate, setFormDate] = useState("2026-07-29");
  const [formExpiry, setFormExpiry] = useState("");
  const [formDiscount, setFormDiscount] = useState("0");
  const [formDiscountType, setFormDiscountType] = useState("%");
  const [formTaxRate, setFormTaxRate] = useState("0");
  const [formItems, setFormItems] = useState<LineItem[]>([]);
  const [formNotes, setFormNotes] = useState("");
  const [formTerms, setFormTerms] = useState("");

  const filteredQuotes = quotes.filter(q =>
    q.quoteNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedQuote = quotes.find(q => q.id === selectedId);

  const handleNew = () => {
    setView("new");
    setFormCustomer(""); setFormStatus("Draft"); setFormDate("2026-07-29");
    setFormExpiry(""); setFormDiscount("0"); setFormDiscountType("%");
    setFormTaxRate("0"); setFormItems([]); setFormNotes(""); setFormTerms("");
  };

  const handleSelect = (id: string) => { setSelectedId(id); setView("detail"); };

  const handleEdit = () => {
    if (!selectedQuote) return;
    setView("edit");
    setFormCustomer(selectedQuote.customer);
    setFormStatus(selectedQuote.status);
    setFormDate("2026-07-29");
    setFormExpiry("");
    setFormDiscount(String(selectedQuote.discount));
    setFormTaxRate(String(selectedQuote.taxRate));
    setFormItems([...selectedQuote.items]);
    setFormNotes(selectedQuote.notes);
    setFormTerms(selectedQuote.terms);
  };

  const handleAddLine = () => {
    setFormItems(prev => [...prev, { id: String(Date.now()), item: "", description: "", hsn: "", qty: 1, rate: 0, amount: 0 }]);
  };

  const handleLineChange = (id: string, field: keyof LineItem, value: string | number) => {
    setFormItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === "qty" || field === "rate") updated.amount = updated.qty * updated.rate;
      return updated;
    }));
  };

  const handleRemoveLine = (id: string) => { setFormItems(prev => prev.filter(i => i.id !== id)); };

  const subtotal = formItems.reduce((sum, i) => sum + i.amount, 0);
  const discountAmt = formDiscountType === "%" ? subtotal * (Number(formDiscount) / 100) : Number(formDiscount);
  const taxableAmt = subtotal - discountAmt;
  const taxAmt = taxableAmt * (Number(formTaxRate) / 100);
  const total = taxableAmt + taxAmt;

  const handleSave = () => {
    if (!formCustomer) { alert("Customer is required."); return; }
    const newQuote: Quote = {
      id: String(quotes.length + 1), quoteNo: `QT-${String(quotes.length + 1).padStart(4, "0")}`,
      customer: formCustomer, date: formDate, expiryDate: formExpiry, status: formStatus as Quote["status"],
      items: formItems, discount: Number(formDiscount), taxRate: Number(formTaxRate), notes: formNotes, terms: formTerms
    };
    setQuotes(prev => [newQuote, ...prev]);
    setSelectedId(newQuote.id);
    setView("detail");
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this quote?")) {
      setQuotes(prev => prev.filter(q => q.id !== id));
      if (selectedId === id) { setSelectedId(quotes[0]?.id || ""); setView("detail"); }
    }
  };

  const getSubtotal = (q: Quote) => q.items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2"><h1 className="text-xl font-bold text-gray-800">Quotes create & send</h1></div>
      <div className="flex flex-1 min-h-0 px-4 pb-4 gap-4">
        {/* Left Panel - Quote List */}
        <div className="w-[320px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">All Quotes</h2>
            <button onClick={handleNew} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600"><Plus size={12} /> New</button>
          </div>
          <div className="px-3 py-2 border-b border-gray-200">
            <div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search quote no / customer..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredQuotes.map(q => {
              const sub = getSubtotal(q);
              const isSelected = q.id === selectedId;
              return (
                <button key={q.id} onClick={() => handleSelect(q.id)} className={`w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-50 ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-gray-800">{q.customer}</span>
                    <span className="text-sm font-medium text-gray-800">₹{fmt(sub)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{q.quoteNo} • {q.date} {q.status === "Sent" && <Send size={10} className="inline ml-1 text-blue-500" />}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColors[q.status]}`}>{q.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Detail / Form */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
          {(view === "detail" && selectedQuote) ? (
            <div className="p-6">
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-800">{selectedQuote.quoteNo}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${statusColors[selectedQuote.status]}`}>{selectedQuote.status}</span>
                  <span className="text-xs text-gray-500">Sent {selectedQuote.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{selectedQuote.customer} • ₹{fmt(getSubtotal(selectedQuote))}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <button onClick={handleEdit} className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"><Pencil size={14} /> Edit</button>
                <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"><Mail size={14} /> Email</button>
                <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"><Link size={14} /> Payment Link</button>
                <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"><Printer size={14} /> PDF/Print</button>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e]"><FileText size={14} /> Invoice</button>
                <button onClick={() => handleDelete(selectedQuote.id)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"><Trash2 size={14} /></button>
              </div>

              {/* Company Header */}
              <div className="bg-indigo-600 rounded-t-lg p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center"><span className="text-indigo-600 font-bold text-lg">TB</span></div>
                <div><h3 className="text-white text-xl font-bold">Only Coffee Vegetarian Restaurant</h3><p className="text-indigo-200 text-xs">S2H Foods And Enterprises Pvt Ltd Mahamaha Kulam, Kumbakonam- 612002 GSTIN: 33ABDCSS478H1Z4</p></div>
              </div>

              {/* Quotation Body */}
              <div className="border border-gray-200 border-t-0 rounded-b-lg p-6">
                <div className="flex items-start justify-between mb-6">
                  <div><h2 className="text-2xl font-bold text-indigo-600">QUOTATION</h2><p className="text-sm text-gray-600 mt-1"># {selectedQuote.quoteNo}</p></div>
                  <div className="text-right"><p className="text-sm text-gray-600">Issue: {selectedQuote.date}</p><span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase mt-1 ${statusColors[selectedQuote.status]}`}>{selectedQuote.status}</span></div>
                </div>

                <div className="mb-6"><p className="text-xs text-gray-500 uppercase">Bill To</p><p className="text-sm font-bold text-gray-800">{selectedQuote.customer}</p></div>

                {/* Items Table */}
                <table className="w-full mb-6">
                  <thead><tr className="bg-indigo-600 text-white">
                    <th className="px-3 py-2 text-center text-xs font-semibold">#</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Item</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Description</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold">Rate</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold">Amount</th>
                  </tr></thead>
                  <tbody>
                    {selectedQuote.items.length === 0 ? (
                      <tr><td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-400">No items</td></tr>
                    ) : selectedQuote.items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="px-3 py-2 text-sm text-center">{idx + 1}</td>
                        <td className="px-3 py-2 text-sm">{item.item}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{item.description}</td>
                        <td className="px-3 py-2 text-sm text-center">{item.qty.toFixed(2)}</td>
                        <td className="px-3 py-2 text-sm text-right">₹{fmt(item.rate)}</td>
                        <td className="px-3 py-2 text-sm text-right">₹{fmt(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-[280px] space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>₹{fmt(getSubtotal(selectedQuote))}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">CGST (0.00%)</span><span>₹ 0.00</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">SGST (0.00%)</span><span>₹ 0.00</span></div>
                    <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2"><span>Total</span><span className="text-indigo-600">₹{fmt(getSubtotal(selectedQuote))}</span></div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-4">Total In Words: <em>Indian Rupee {getSubtotal(selectedQuote) === 0 ? "Zero Only" : "Six Hundred Sixty Six Only"}</em></p>

                <div className="flex justify-end mt-8"><div className="border border-gray-300 rounded px-8 py-4 text-center"><p className="text-xs text-gray-500">Authorized Signature</p></div></div>
              </div>
            </div>
          ) : (
            /* New / Edit Quote Form */
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">{view === "edit" ? "Edit Quote" : "New Quote"}</h2>
                <button onClick={() => setView("detail")} className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"><ArrowLeft size={14} /> Back</button>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="col-span-2"><label className="text-sm font-medium text-gray-700 mb-1 block">Customer *</label><select value={formCustomer} onChange={e => setFormCustomer(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"><option value="">-- Select Customer --</option>{customers.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="col-span-2"><label className="text-sm font-medium text-gray-700 mb-1 block">Status *</label><select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"><option>Draft</option><option>Sent</option><option>Approved</option></select></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Issue Date *</label><input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Valid Until</label><input type="date" value={formExpiry} onChange={e => setFormExpiry(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Discount</label><div className="flex"><input type="number" value={formDiscount} onChange={e => setFormDiscount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-l-md text-sm" /><select value={formDiscountType} onChange={e => setFormDiscountType(e.target.value)} className="px-2 border border-l-0 border-gray-300 rounded-r-md text-sm"><option>%</option><option>₹</option></select></div></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Tax Rate (%)</label><input type="number" value={formTaxRate} onChange={e => setFormTaxRate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" /></div>
              </div>

              {/* Line Items */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Line Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead><tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Item</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Description</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">HSN/SAC</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Rate</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Amount</th>
                      <th className="w-10"></th>
                    </tr></thead>
                    <tbody>
                      {formItems.map(item => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="px-2 py-1"><input value={item.item} onChange={e => handleLineChange(item.id, "item", e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" /></td>
                          <td className="px-2 py-1"><input value={item.description} onChange={e => handleLineChange(item.id, "description", e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" /></td>
                          <td className="px-2 py-1"><input value={item.hsn} onChange={e => handleLineChange(item.id, "hsn", e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" /></td>
                          <td className="px-2 py-1"><input type="number" value={item.qty} onChange={e => handleLineChange(item.id, "qty", Number(e.target.value))} className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-center" /></td>
                          <td className="px-2 py-1"><input type="number" value={item.rate} onChange={e => handleLineChange(item.id, "rate", Number(e.target.value))} className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right" /></td>
                          <td className="px-3 py-2 text-sm text-right font-medium">₹{fmt(item.amount)}</td>
                          <td className="px-2 py-1 text-center"><button onClick={() => handleRemoveLine(item.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={handleAddLine} className="mt-2 flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"><Plus size={14} /> Add Line</button>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-[280px] space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>{fmt(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Discount</span><span>{fmt(discountAmt)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Tax</span><span>{fmt(taxAmt)}</span></div>
                  <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2"><span>Total</span><span className="text-[#3d9a7e]">{fmt(total)}</span></div>
                </div>
              </div>

              {/* Notes & Terms */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label><textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3} placeholder="Notes visible to customer" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Terms</label><textarea value={formTerms} onChange={e => setFormTerms(e.target.value)} rows={3} placeholder="Payment terms & conditions" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" /></div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setView("detail")} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e]">Save Quote</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
