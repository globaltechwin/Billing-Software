"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Trash2, RotateCcw } from "lucide-react";

interface LineItem {
  id: string; item: string; description: string; unit: string; qty: number; rate: number; amount: number;
}

interface InvoiceRecord {
  id: string; sNo: number; invoiceNo: string; documentType: string; gstType: string; customerName: string; status: string;
  issueDate: string; dueDate: string; total: number; paid: number;
  items: LineItem[]; discount: number; discountType: string; taxRate: number; notes: string; terms: string;
  challanNo: string; transportationMode: string; vehicleNo: string; dateOfSupply: string; placeOfSupply: string;
  billedToName: string; billedToAddress: string; billedToGstin: string; billedToState: string; billedToStateCode: string;
  shippedToName: string; shippedToAddress: string; shippedToState: string; shippedToStateCode: string;
  bankAccountHolder: string; bankAccountNumber: string; bankIfsc: string; bankName: string; bankBranch: string;
}

interface CompanyData {
  companyName: string; address: string; phone: string; email: string; logo: string | null;
  gstNumber: string | null; gstStateCode: string | null; stateName: string;
  panNumber: string | null; city: string | null; pincode: string | null;
}

interface CustomerOption {
  label: string;
  customerName: string;
  address: string;
  city: string;
  stateName: string;
  stateCode: string;
  gstNumber: string;
  pincode: string;
}

const ENTRIES_PER_PAGE = 50;
const UNITS = ["QTL", "NOS", "KGS", "LTR", "MTR", "SQF", "SQM", "BOX", "PCS", "BAG", "SET", "DOZ", "HRS", "DAY", "MONTH"];

const fmt = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const statusColors: Record<string, string> = {
  Draft:"bg-gray-100 text-gray-700", Unpaid:"bg-red-100 text-red-700",
  Partial:"bg-yellow-100 text-yellow-700", Paid:"bg-green-100 text-green-700",
  Overdue:"bg-orange-100 text-orange-700", Cancelled:"bg-gray-200 text-gray-600",
};

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

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [customerList, setCustomerList] = useState<CustomerOption[]>([]);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [formCustomer, setFormCustomer] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDueDate, setFormDueDate] = useState("");
  const [formDiscount, setFormDiscount] = useState("0");
  const [formDiscountType, setFormDiscountType] = useState("%");
  const [formTaxRate, setFormTaxRate] = useState("0");
  const [taxSplit, setTaxSplit] = useState<"AUTO" | "CGST_SGST" | "IGST" | "NONE">("AUTO");
  const [formItems, setFormItems] = useState<LineItem[]>([]);
  const [formNotes, setFormNotes] = useState("");
  const [formTerms, setFormTerms] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage] = useState(ENTRIES_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);

  const nextId = useRef(1);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", String(ENTRIES_PER_PAGE));
    fetch(`/api/accounting/invoices?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setInvoices(json.invoices.map((r: InvoiceRecord, i: number) => ({ ...r, sNo: i + 1 })));
        }
      })
      .catch(e => console.error("Failed to fetch invoices:", e));
  }, []);

  useEffect(() => {
    fetch("/api/customers?activeOnly=true&limit=100")
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setCustomerList(json.customers.map((c: { customerCode: string; customerName: string; address: string; city: string; stateName: string; stateCode: string; gstNumber: string; pincode: string }) => ({
            label: c.customerCode ? `${c.customerCode}-${c.customerName}` : c.customerName,
            customerName: c.customerName,
            address: c.address || "",
            city: c.city || "",
            stateName: c.stateName || "",
            stateCode: c.stateCode || "",
            gstNumber: c.gstNumber || "",
            pincode: c.pincode || "",
          })));
        }
      })
      .catch(e => console.error("Failed to fetch customers:", e));
  }, []);

  useEffect(() => {
    fetch("/api/company/settings")
      .then(r => r.json())
      .then(j => { if (j.success) setCompany(j.company); })
      .catch(() => {});
  }, []);

  const subtotal = formItems.reduce((sum, i) => sum + i.amount, 0);
  const discountAmt = formDiscountType === "%" ? subtotal * (Number(formDiscount) / 100) : Number(formDiscount);
  const taxableAmt = subtotal - discountAmt;
  const taxRateVal = Number(formTaxRate);
  const halfRate = taxRateVal / 2;

  const companyCode = (company?.gstStateCode || "").trim();
  const customerCode = (selectedCustomer?.stateCode || "").trim();
  const isInterState = Boolean(companyCode && customerCode && companyCode !== customerCode);
  const effectiveTaxType: "CGST_SGST" | "IGST" | "NONE" =
    taxSplit === "CGST_SGST" || taxSplit === "IGST" || taxSplit === "NONE"
      ? taxSplit
      : isInterState ? "IGST" : "CGST_SGST";
  const showTax = taxRateVal > 0 && effectiveTaxType !== "NONE";

  const itemsWithTax = formItems.map((item, idx) => {
    const tv = item.amount;
    const cgst = effectiveTaxType === "CGST_SGST" && showTax ? tv * (halfRate / 100) : 0;
    const sgst = effectiveTaxType === "CGST_SGST" && showTax ? tv * (halfRate / 100) : 0;
    const igst = effectiveTaxType === "IGST" && showTax ? tv * (taxRateVal / 100) : 0;
    const lineTotal = tv + cgst + sgst + igst;
    return { ...item, srNo: idx + 1, taxableValue: tv, cgstAmount: cgst, sgstAmount: sgst, igstAmount: igst, totalAmount: lineTotal };
  });

  const totalTaxable = itemsWithTax.reduce((s, i) => s + i.taxableValue, 0);
  const totalCgst = itemsWithTax.reduce((s, i) => s + i.cgstAmount, 0);
  const totalSgst = itemsWithTax.reduce((s, i) => s + i.sgstAmount, 0);
  const totalIgst = itemsWithTax.reduce((s, i) => s + i.igstAmount, 0);
  const grandTotal = totalTaxable + totalCgst + totalSgst + totalIgst;

  const filteredData = useMemo(() => {
    let d = [...invoices];
    if (searchQuery) { const q = searchQuery.toLowerCase(); d = d.filter(r => r.invoiceNo.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q) || (r.documentType || "").toLowerCase().includes(q)); }
    return d;
  }, [invoices, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const paginated = filteredData.slice(start, start + entriesPerPage);

  const handleAddLine = () => {
    setFormItems(prev => [...prev, { id: String(nextId.current++), item: "", description: "", unit: "NOS", qty: 1, rate: 0, amount: 0 }]);
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

  const handleCustomerChange = (label: string) => {
    setFormCustomer(label);
    const cust = customerList.find(c => c.label === label);
    setSelectedCustomer(cust || null);
  };

  const handleSave = async () => {
    if (!formCustomer) { alert("Customer is required."); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        customerName: formCustomer, status: formStatus || "Unpaid", documentType: "Invoice",
        gstType: effectiveTaxType, invoiceDate: formDate, dueDate: formDueDate || null,
        discount: Number(formDiscount), discountType: formDiscountType, taxRate: Number(formTaxRate),
        notes: formNotes, terms: formTerms,
        items: formItems.map(item => ({ item: item.item, description: item.description, unit: item.unit, qty: item.qty, rate: item.rate })),
      };
      let res;
      if (editId) {
        res = await fetch("/api/accounting/invoices", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, ...payload }) });
      } else {
        res = await fetch("/api/accounting/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save invoice");
      await refreshList();
      handleClear();
    } catch (e) {
      console.error("Failed to save invoice:", e);
      alert("Failed to save invoice.");
    } finally { setSaving(false); }
  };

  const refreshList = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", String(ENTRIES_PER_PAGE));
    return fetch(`/api/accounting/invoices?${params.toString()}`)
      .then(res => res.json())
      .then(json => { if (json.success) { setInvoices(json.invoices.map((r: InvoiceRecord, i: number) => ({ ...r, sNo: i + 1 }))); } })
      .catch(e => console.error("Failed to refresh invoices:", e));
  };

  const handleClear = () => {
    setFormCustomer(""); setFormStatus(""); setFormDate(new Date().toISOString().split("T")[0]);
    setFormDueDate(""); setFormDiscount("0"); setFormDiscountType("%"); setFormTaxRate("0");
    setFormItems([]); setFormNotes(""); setFormTerms(""); setEditId(null); setTaxSplit("AUTO");
    setSelectedCustomer(null);
  };

  const handleEdit = (inv: InvoiceRecord) => {
    setFormCustomer(inv.customerName); setFormStatus(inv.status);
    setFormDate(inv.issueDate || new Date().toISOString().split("T")[0]);
    setFormDueDate(inv.dueDate); setFormDiscount(String(inv.discount)); setFormDiscountType(inv.discountType);
    setFormTaxRate(String(inv.taxRate)); setFormItems([...inv.items]); setFormNotes(inv.notes); setFormTerms(inv.terms);
    setTaxSplit(inv.gstType === "IGST" ? "IGST" : inv.gstType === "NONE" ? "NONE" : "AUTO");
    const cust = customerList.find(c => c.label === inv.customerName || c.customerName === inv.customerName);
    setSelectedCustomer(cust || null);
    setEditId(inv.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      const res = await fetch(`/api/accounting/invoices?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { refreshList(); } else { alert(json.error || "Failed to delete invoice."); }
    } catch (e) { console.error("Failed to delete invoice:", e); alert("Failed to delete invoice."); }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm";
  const labelCls = "text-sm font-medium text-gray-700 mb-1 block";

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="w-full bg-white shadow-sm rounded-lg m-4">
        <div className="px-6 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">{editId ? "Edit Invoice" : "New Invoice"}</h2>
        </div>
        <div className="px-6 py-6">
          {/* Customer + Status */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className={labelCls}>Customer *</label><select value={formCustomer} onChange={e => handleCustomerChange(e.target.value)} className={inputCls}><option value="">-- Select Customer --</option>{customerList.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}</select></div>
            <div><label className={labelCls}>Status *</label><select value={formStatus} onChange={e => setFormStatus(e.target.value)} className={inputCls}><option value="">-- Select Status --</option><option>Draft</option><option>Unpaid</option><option>Partial</option><option>Paid</option><option>Overdue</option></select></div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className={labelCls}>Issue Date *</label><input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Due Date</label><input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} className={inputCls} /></div>
          </div>

          {/* Discount + Tax */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className={labelCls}>Discount</label><div className="flex"><input type="number" value={formDiscount} onChange={e => setFormDiscount(e.target.value)} className={`${inputCls} rounded-r-none`} /><select value={formDiscountType} onChange={e => setFormDiscountType(e.target.value)} className="px-2 border border-l-0 border-gray-300 rounded-r-md text-sm bg-white"><option>%</option><option>₹</option></select></div></div>
            <div><label className={labelCls}>Tax Rate (%)</label><input type="number" value={formTaxRate} onChange={e => setFormTaxRate(e.target.value)} className={inputCls} placeholder="e.g. 18" /></div>
            <div>
              <label className={labelCls}>GST Type</label>
              <select value={taxSplit} onChange={e => setTaxSplit(e.target.value as typeof taxSplit)} className={inputCls}>
                <option value="AUTO">Auto Detect</option>
                <option value="CGST_SGST">CGST + SGST</option>
                <option value="IGST">IGST</option>
                <option value="NONE">No Tax</option>
              </select>
              {taxSplit === "AUTO" && (
                <p className="text-[11px] text-gray-500 mt-1">
                  {isInterState ? "Inter-state → IGST" : "Intra-state → CGST + SGST"}
                </p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Line Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200" style={{ minWidth: "900px" }}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-10 border-r border-gray-300" rowSpan={2}>Sr.</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 border-r border-gray-300" rowSpan={2}>Product</th>
                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-16 border-r border-gray-300" rowSpan={2}>Qty</th>
                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-20 border-r border-gray-300" rowSpan={2}>Unit</th>
                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 w-20 border-r border-gray-300" rowSpan={2}>Rate</th>
                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 w-24 border-r border-gray-300" rowSpan={2}>Taxable</th>
                    {showTax && (effectiveTaxType === "CGST_SGST" ? (<>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 border-r border-gray-300" colSpan={2}>CGST</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 border-r border-gray-300" colSpan={2}>SGST</th>
                    </>) : (
                      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 border-r border-gray-300" colSpan={2}>IGST</th>
                    ))}
                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 w-24 border-r border-gray-300" rowSpan={2}>Total</th>
                    <th className="w-8" rowSpan={2}></th>
                  </tr>
                  {showTax && (effectiveTaxType === "CGST_SGST" ? (<tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-gray-300">Rate</th>
                    <th className="px-2 py-1 text-right text-[10px] font-semibold text-gray-500 border-r border-gray-300">Amt</th>
                    <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-gray-300">Rate</th>
                    <th className="px-2 py-1 text-right text-[10px] font-semibold text-gray-500 border-r border-gray-300">Amt</th>
                  </tr>) : (<tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-gray-300">Rate</th>
                    <th className="px-2 py-1 text-right text-[10px] font-semibold text-gray-500 border-r border-gray-300">Amt</th>
                  </tr>))}
                </thead>
                <tbody>
                  {itemsWithTax.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="px-2 py-1 text-center text-sm text-gray-600 border-r border-gray-300">{item.srNo}</td>
                      <td className="px-2 py-1 border-r border-gray-300"><input value={item.item} onChange={e => handleLineChange(item.id, "item", e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" placeholder="Product name" /></td>
                      <td className="px-2 py-1 border-r border-gray-300"><input type="number" value={item.qty} onChange={e => handleLineChange(item.id, "qty", Number(e.target.value))} className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-center" /></td>
                      <td className="px-2 py-1 border-r border-gray-300"><select value={item.unit} onChange={e => handleLineChange(item.id, "unit", e.target.value)} className="w-full px-1 py-1 border border-gray-200 rounded text-sm">{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></td>
                      <td className="px-2 py-1 border-r border-gray-300"><input type="number" value={item.rate} onChange={e => handleLineChange(item.id, "rate", Number(e.target.value))} className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right" /></td>
                      <td className="px-2 py-1 text-sm text-right font-medium border-r border-gray-300">₹{fmt(item.taxableValue)}</td>
                      {showTax && (effectiveTaxType === "CGST_SGST" ? (<>
                        <td className="px-2 py-1 text-center text-xs text-gray-500 border-r border-gray-300">{halfRate.toFixed(2)}%</td>
                        <td className="px-2 py-1 text-sm text-right border-r border-gray-300">₹{fmt(item.cgstAmount)}</td>
                        <td className="px-2 py-1 text-center text-xs text-gray-500 border-r border-gray-300">{halfRate.toFixed(2)}%</td>
                        <td className="px-2 py-1 text-sm text-right border-r border-gray-300">₹{fmt(item.sgstAmount)}</td>
                      </>) : (<>
                        <td className="px-2 py-1 text-center text-xs text-gray-500 border-r border-gray-300">{taxRateVal.toFixed(2)}%</td>
                        <td className="px-2 py-1 text-sm text-right border-r border-gray-300">₹{fmt(item.igstAmount)}</td>
                      </>))}
                      <td className="px-2 py-1 text-sm text-right font-bold border-r border-gray-300">₹{fmt(item.totalAmount)}</td>
                      <td className="px-1 py-1 text-center"><button onClick={() => handleRemoveLine(item.id)} className="text-red-400 hover:text-red-600 text-xs"><Trash2 size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={handleAddLine} className="mt-2 flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"><Plus size={14} /> Add Line</button>
          </div>

          {/* Totals */}
          <div className="mb-4 max-w-sm">
            <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">Subtotal</span><span>₹{fmt(totalTaxable)}</span></div>
            <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">Discount</span><span>₹{fmt(discountAmt)}</span></div>
            {showTax && effectiveTaxType === "CGST_SGST" && <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">CGST</span><span>₹{fmt(totalCgst)}</span></div>}
            {showTax && effectiveTaxType === "CGST_SGST" && <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">SGST</span><span>₹{fmt(totalSgst)}</span></div>}
            {showTax && effectiveTaxType === "IGST" && <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">IGST</span><span>₹{fmt(totalIgst)}</span></div>}
            <div className="flex justify-between py-2 text-base font-bold border-t border-gray-300 mt-1"><span>Grand Total</span><span className="text-[#3d9a7e]">₹{fmt(grandTotal)}</span></div>
          </div>

          {/* Notes + Terms */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className={labelCls}>Notes</label><textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2} className={`${inputCls} resize-none`} /></div>
            <div><label className={labelCls}>Terms & Conditions</label><textarea value={formTerms} onChange={e => setFormTerms(e.target.value)} rows={2} className={`${inputCls} resize-none`} /></div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#4caf85] text-white rounded-full text-sm font-medium hover:bg-[#3d9a7e] disabled:opacity-50">{saving ? "Saving..." : editId ? "Update" : "Save"}</button>
            <button onClick={handleClear} className="px-6 py-2 bg-purple-500 text-white rounded-full text-sm font-medium hover:bg-purple-600 flex items-center gap-1.5"><RotateCcw size={14} /> Clear</button>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="w-full bg-white shadow-sm rounded-lg m-4 mt-0">
        <div className="px-6 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Invoices ({filteredData.length})</h2>
            <input type="text" placeholder="Search invoices..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-64" />
          </div>
        </div>
        <div className="px-6 py-4">
          {paginated.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>No invoices found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Invoice #</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Customer</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Total</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((inv: InvoiceRecord) => (
                      <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-800">{inv.invoiceNo}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{inv.customerName}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{inv.issueDate}</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status] || "bg-gray-100 text-gray-600"}`}>{inv.status}</span></td>
                        <td className="px-3 py-2 text-sm text-right font-bold text-[#3d9a7e]">₹{Number(inv.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleEdit(inv)} className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">Edit</button>
                            <button onClick={() => handleDelete(inv.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">Showing {(currentPage - 1) * entriesPerPage + 1}–{Math.min(currentPage * entriesPerPage, filteredData.length)} of {filteredData.length}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Prev</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
