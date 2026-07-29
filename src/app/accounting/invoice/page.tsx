"use client";

import { useState, useMemo } from "react";
import { ChevronUp, Plus, Trash2, X } from "lucide-react";

interface LineItem {
  id: string; item: string; description: string; qty: number; rate: number; amount: number;
}

interface InvoiceRecord {
  id: string; sNo: number; invoiceNo: string; customerName: string; status: string;
  issueDate: string; dueDate: string; total: number; paid: number; customerId: string;
  items: LineItem[]; discount: number; discountType: string; taxRate: number; notes: string; terms: string;
}

const customers = ["1002-Omkar Tanti", "1001-Harikrishnan Arumugam", "1008-Jeewan Tanti", "1010-Manikandan E", "1003-Rajesh Kumar", "1004-Priya Sharma"];

const sampleInvoices: InvoiceRecord[] = [
  { id:"1",sNo:1,invoiceNo:"INV-0005",customerName:"1002-Omkar Tanti",status:"Paid",issueDate:"29/07/2026",dueDate:"29/08/2026",total:666,paid:666,customerId:"C001",items:[{id:"1",item:"abc",description:"3333",qty:2,rate:333,amount:666}],discount:0,discountType:"%",taxRate:0,notes:"",terms:"" },
  { id:"2",sNo:2,invoiceNo:"INV-0004",customerName:"1001-Harikrishnan Arumugam",status:"Unpaid",issueDate:"28/07/2026",dueDate:"28/08/2026",total:1500,paid:0,customerId:"C002",items:[],discount:0,discountType:"%",taxRate:0,notes:"",terms:"" },
  { id:"3",sNo:3,invoiceNo:"INV-0003",customerName:"1008-Jeewan Tanti",status:"Partial",issueDate:"27/07/2026",dueDate:"27/08/2026",total:3200,paid:1500,customerId:"C003",items:[],discount:0,discountType:"%",taxRate:0,notes:"",terms:"" },
  { id:"4",sNo:4,invoiceNo:"INV-0002",customerName:"1003-Rajesh Kumar",status:"Paid",issueDate:"25/07/2026",dueDate:"25/08/2026",total:5000,paid:5000,customerId:"C004",items:[],discount:0,discountType:"%",taxRate:0,notes:"",terms:"" },
  { id:"5",sNo:5,invoiceNo:"INV-0001",customerName:"1004-Priya Sharma",status:"Overdue",issueDate:"20/07/2026",dueDate:"20/07/2026",total:2100,paid:0,customerId:"C005",items:[],discount:0,discountType:"%",taxRate:0,notes:"",terms:"" },
];

const fmt = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const statusColors: Record<string, string> = {
  Draft:"bg-gray-100 text-gray-700", Unpaid:"bg-red-100 text-red-700",
  Partial:"bg-yellow-100 text-yellow-700", Paid:"bg-green-100 text-green-700",
  Overdue:"bg-orange-100 text-orange-700", Cancelled:"bg-gray-200 text-gray-600",
};

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(sampleInvoices);
  const [formCustomer, setFormCustomer] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formDate, setFormDate] = useState("2026-07-29");
  const [formDueDate, setFormDueDate] = useState("");
  const [formDiscount, setFormDiscount] = useState("0");
  const [formDiscountType, setFormDiscountType] = useState("%");
  const [formTaxRate, setFormTaxRate] = useState("0");
  const [formItems, setFormItems] = useState<LineItem[]>([]);
  const [formNotes, setFormNotes] = useState("");
  const [formTerms, setFormTerms] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);

  const subtotal = formItems.reduce((sum, i) => sum + i.amount, 0);
  const discountAmt = formDiscountType === "%" ? subtotal * (Number(formDiscount) / 100) : Number(formDiscount);
  const taxableAmt = subtotal - discountAmt;
  const taxAmt = taxableAmt * (Number(formTaxRate) / 100);
  const total = taxableAmt + taxAmt;

  const filteredData = useMemo(() => {
    let d = [...invoices];
    if (searchQuery) { const q = searchQuery.toLowerCase(); d = d.filter(r => r.invoiceNo.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q)); }
    return d;
  }, [invoices, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const paginated = filteredData.slice(start, start + entriesPerPage);

  const handleAddLine = () => {
    setFormItems(prev => [...prev, { id: String(Date.now()), item: "", description: "", qty: 1, rate: 0, amount: 0 }]);
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

  const handleSave = () => {
    if (!formCustomer) { alert("Customer is required."); return; }
    if (editId) {
      setInvoices(prev => prev.map(inv => inv.id === editId ? {
        ...inv, customerName: formCustomer, status: formStatus || "Draft", issueDate: formDate,
        dueDate: formDueDate, total, paid: inv.paid, items: formItems,
        discount: Number(formDiscount), discountType: formDiscountType, taxRate: Number(formTaxRate),
        notes: formNotes, terms: formTerms,
      } : inv));
    } else {
      const newId = String(invoices.length + 1);
      setInvoices(prev => [...prev, {
        id: newId, sNo: prev.length + 1, invoiceNo: `INV-${String(prev.length + 1).padStart(4, "0")}`,
        customerName: formCustomer, status: formStatus || "Unpaid", issueDate: formDate, dueDate: formDueDate,
        total, paid: 0, customerId: `C${String(prev.length + 1).padStart(3, "0")}`,
        items: formItems, discount: Number(formDiscount), discountType: formDiscountType,
        taxRate: Number(formTaxRate), notes: formNotes, terms: formTerms,
      }]);
    }
    handleClear();
  };

  const handleClear = () => {
    setFormCustomer(""); setFormStatus(""); setFormDate("2026-07-29"); setFormDueDate("");
    setFormDiscount("0"); setFormDiscountType("%"); setFormTaxRate("0");
    setFormItems([]); setFormNotes(""); setFormTerms(""); setEditId(null);
  };

  const handleEdit = (inv: InvoiceRecord) => {
    setFormCustomer(inv.customerName); setFormStatus(inv.status); setFormDate("2026-07-29");
    setFormDueDate(inv.dueDate); setFormDiscount(String(inv.discount)); setFormDiscountType(inv.discountType);
    setFormTaxRate(String(inv.taxRate)); setFormItems([...inv.items]); setFormNotes(inv.notes); setFormTerms(inv.terms);
    setEditId(inv.id); setFormCollapsed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => { if (confirm("Delete this invoice?")) setInvoices(prev => prev.filter(i => i.id !== id)); };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Invoice Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Invoice</h2>
          <button onClick={() => setFormCollapsed(!formCollapsed)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"><ChevronUp size={18} className={`transition-transform ${formCollapsed?"rotate-180":""}`} /></button>
        </div>
        {!formCollapsed && (
          <div className="px-6 py-6">
            {/* Row 1: Customer + Status */}
            <div className="grid grid-cols-2 gap-4 mb-5 max-w-4xl">
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Customer *</label><select value={formCustomer} onChange={e => setFormCustomer(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"><option value="">-- Select Customer --</option>{customers.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Status *</label><select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"><option value="">-- Select Status --</option><option>Draft</option><option>Unpaid</option><option>Partial</option><option>Paid</option><option>Overdue</option></select></div>
            </div>
            {/* Row 2: Issue Date + Due Date */}
            <div className="grid grid-cols-2 gap-4 mb-5 max-w-4xl">
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Issue Date *</label><input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" /></div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label><input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" /></div>
            </div>
            {/* Row 3: Discount + Tax */}
            <div className="grid grid-cols-2 gap-4 mb-6 max-w-4xl">
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Discount</label><div className="flex"><input type="number" value={formDiscount} onChange={e => setFormDiscount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-l-md text-sm" /><select value={formDiscountType} onChange={e => setFormDiscountType(e.target.value)} className="px-2 border border-l-0 border-gray-300 rounded-r-md text-sm bg-white"><option>%</option><option>₹</option></select></div></div>
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
                        <td className="px-2 py-1"><input type="number" value={item.qty} onChange={e => handleLineChange(item.id, "qty", Number(e.target.value))} className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-center" /></td>
                        <td className="px-2 py-1"><input type="number" value={item.rate} onChange={e => handleLineChange(item.id, "rate", Number(e.target.value))} className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right" /></td>
                        <td className="px-3 py-2 text-sm text-right font-medium">₹{fmt(item.amount)}</td>
                        <td className="px-2 py-1 text-center"><button onClick={() => handleRemoveLine(item.id)} className="text-red-400 hover:text-red-600 text-xs"><Trash2 size={12} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={handleAddLine} className="mt-2 flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"><Plus size={14} /> Add Line</button>
            </div>

            {/* Totals */}
            <div className="mb-6 max-w-md">
              <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">Discount</span><span>{fmt(discountAmt)}</span></div>
              <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">Tax</span><span>{fmt(taxAmt)}</span></div>
              <div className="flex justify-between py-2 text-base font-bold border-t border-gray-300 mt-1"><span>Total</span><span className="text-[#3d9a7e]">{fmt(total)}</span></div>
            </div>

            {/* Notes + Terms */}
            <div className="grid grid-cols-2 gap-4 mb-6 max-w-4xl">
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label><textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Terms</label><textarea value={formTerms} onChange={e => setFormTerms(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" /></div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="px-6 py-2 bg-[#4caf85] text-white rounded-full text-sm font-medium hover:bg-[#3d9a7e]">Save</button>
              <button onClick={handleClear} className="px-6 py-2 bg-purple-500 text-white rounded-full text-sm font-medium hover:bg-purple-600">Clear</button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Invoice List</h2>
          <button onClick={() => setListCollapsed(!listCollapsed)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"><ChevronUp size={18} className={`transition-transform ${listCollapsed?"rotate-180":""}`} /></button>
        </div>
        {!listCollapsed && (
          <>
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50">📄 PDF</button>
                <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50">📊 Excel</button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Search:</span>
                <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead><tr className="bg-[#3d9a7e] text-white">
                  {["S.NO","ACTIONS","INVOICENO","CUSTOMERNAME","STATUS","ISSUE DATE","DUE DATE","TOTAL","PAID","CUSTOMERID"].map(h => (
                    <th key={h} className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">{h} {h !== "ACTIONS" ? "↕" : ""}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {paginated.length === 0 ? <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">No data available in table</td></tr> :
                  paginated.map(r => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm text-center">{r.sNo}</td>
                      <td className="px-3 py-3 text-center"><div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(r)} className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200">Edit</button>
                        <button onClick={() => handleDelete(r.id)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>
                      </div></td>
                      <td className="px-3 py-3 text-sm text-center font-medium">{r.invoiceNo}</td>
                      <td className="px-3 py-3 text-sm text-center">{r.customerName}</td>
                      <td className="px-3 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]||"bg-gray-100 text-gray-600"}`}>{r.status}</span></td>
                      <td className="px-3 py-3 text-sm text-center">{r.issueDate}</td>
                      <td className="px-3 py-3 text-sm text-center">{r.dueDate}</td>
                      <td className="px-3 py-3 text-sm text-center font-medium">₹{fmt(r.total)}</td>
                      <td className="px-3 py-3 text-sm text-center text-green-600">₹{fmt(r.paid)}</td>
                      <td className="px-3 py-3 text-sm text-center">{r.customerId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">Showing {filteredData.length>0?start+1:0} to {Math.min(start+entriesPerPage,filteredData.length)} of {filteredData.length} entries</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={currentPage===1} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Previous</button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages||totalPages===0} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
