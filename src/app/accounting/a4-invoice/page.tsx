"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Trash2, Printer, RotateCcw, Save } from "lucide-react";

interface LineItem {
  id: string; item: string; description: string; unit: string; qty: number; rate: number; amount: number;
}

const UNITS = ["QTL", "NOS", "KGS", "LTR", "MTR", "SQF", "SQM", "BOX", "PCS", "BAG", "SET", "DOZ", "HRS", "DAY", "MONTH"];

const fmt = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

function emptyA4() {
  return {
    challanNo: "", transportationMode: "", vehicleNo: "", dateOfSupply: "", placeOfSupply: "",
    billedToName: "", billedToAddress: "", billedToGstin: "", billedToState: "", billedToStateCode: "",
    shippedToName: "", shippedToAddress: "", shippedToState: "", shippedToStateCode: "",
    bankAccountHolder: "", bankAccountNumber: "", bankIfsc: "", bankName: "", bankBranch: "",
  };
}

export default function A4InvoiceTemplatePage() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [customerList, setCustomerList] = useState<CustomerOption[]>([]);
  const [formCustomer, setFormCustomer] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDueDate, setFormDueDate] = useState("");
  const [formDiscount, setFormDiscount] = useState("0");
  const [formDiscountType, setFormDiscountType] = useState("%");
  const [formTaxRate, setFormTaxRate] = useState("0");
  const [taxSplit, setTaxSplit] = useState<"AUTO" | "CGST_SGST" | "IGST" | "NONE">("AUTO");
  const [formItems, setFormItems] = useState<LineItem[]>([]);
  const [formNotes, setFormNotes] = useState("");
  const [formTerms, setFormTerms] = useState("");
  const [a4, setA4] = useState(emptyA4());
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    fetch("/api/company/settings")
      .then(r => r.json())
      .then(j => { if (j.success) setCompany(j.company); })
      .catch(() => {});
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
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;
    fetch(`/api/accounting/invoices/${id}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success || !json.invoice) return;
        const inv = json.invoice;
        setEditId(inv.id);
        setFormCustomer(inv.customerName || "");
        setFormDate(inv.issueDate || new Date().toISOString().split("T")[0]);
        setFormDueDate(inv.dueDate || "");
        setFormDiscount(String(inv.discount ?? 0));
        setFormDiscountType(inv.discountType || "%");
        setFormTaxRate(String(inv.taxRate ?? 0));
        setTaxSplit(inv.gstType === "IGST" ? "IGST" : inv.gstType === "NONE" ? "NONE" : "AUTO");
        setFormItems((inv.items || []).map((it: { id: string; item: string; description: string; unit: string; qty: number; rate: number; amount: number }, i: number) => ({
          id: String(i + 1), item: it.item || "", description: it.description || "", unit: it.unit || "NOS", qty: it.qty || 1, rate: it.rate || 0, amount: it.amount || 0,
        })));
        nextId.current = (inv.items?.length || 0) + 1;
        setFormNotes(inv.notes || "");
        setFormTerms(inv.terms || "");
        setA4({
          challanNo: inv.challanNo || "", transportationMode: inv.transportationMode || "", vehicleNo: inv.vehicleNo || "",
          dateOfSupply: inv.dateOfSupply || "", placeOfSupply: inv.placeOfSupply || "",
          billedToName: inv.billedToName || "", billedToAddress: inv.billedToAddress || "", billedToGstin: inv.billedToGstin || "",
          billedToState: inv.billedToState || "", billedToStateCode: inv.billedToStateCode || "",
          shippedToName: inv.shippedToName || "", shippedToAddress: inv.shippedToAddress || "",
          shippedToState: inv.shippedToState || "", shippedToStateCode: inv.shippedToStateCode || "",
          bankAccountHolder: inv.bankAccountHolder || "", bankAccountNumber: inv.bankAccountNumber || "",
          bankIfsc: inv.bankIfsc || "", bankName: inv.bankName || "", bankBranch: inv.bankBranch || "",
        });
      })
      .catch(e => console.error("Failed to load invoice:", e));
  }, []);

  const subtotal = formItems.reduce((sum, i) => sum + i.amount, 0);
  const discountAmt = formDiscountType === "%" ? subtotal * (Number(formDiscount) / 100) : Number(formDiscount);
  const taxableAmt = subtotal - discountAmt;
  const taxRateVal = Number(formTaxRate);
  const halfRate = taxRateVal / 2;

  const companyCode = (company?.gstStateCode || "").trim();
  const customerCode = (a4.billedToStateCode || "").trim();
  const isInterState = Boolean(companyCode && customerCode && companyCode !== customerCode);
  const effectiveTaxType: "CGST_SGST" | "IGST" | "NONE" =
    taxSplit === "CGST_SGST" || taxSplit === "IGST" || taxSplit === "NONE"
      ? taxSplit
      : isInterState ? "IGST" : "CGST_SGST";
  const isIgst = effectiveTaxType === "IGST";
  const showTax = effectiveTaxType !== "NONE";

  const itemsWithTax = formItems.map((item, idx) => {
    const tv = item.amount;
    const cgst = effectiveTaxType === "CGST_SGST" && showTax ? tv * (halfRate / 100) : 0;
    const sgst = effectiveTaxType === "CGST_SGST" && showTax ? tv * (halfRate / 100) : 0;
    const igst = effectiveTaxType === "IGST" && showTax ? tv * (taxRateVal / 100) : 0;
    const total = tv + cgst + sgst + igst;
    return { ...item, srNo: idx + 1, taxableValue: tv, cgstAmount: cgst, sgstAmount: sgst, igstAmount: igst, totalAmount: total };
  });

  const totalTaxable = itemsWithTax.reduce((s, i) => s + i.taxableValue, 0);
  const totalCgst = itemsWithTax.reduce((s, i) => s + i.cgstAmount, 0);
  const totalSgst = itemsWithTax.reduce((s, i) => s + i.sgstAmount, 0);
  const totalIgst = itemsWithTax.reduce((s, i) => s + i.igstAmount, 0);
  const totalQty = itemsWithTax.reduce((s, i) => s + i.qty, 0);
  const grandTotal = totalTaxable + totalCgst + totalSgst + totalIgst;
  const amountInWords = numberToWords(Math.round(grandTotal));
  const taxCols = showTax ? (isIgst ? 2 : 4) : 0;

  const handleAddLine = () => {
    const id = String(nextId.current++);
    setFormItems(prev => [...prev, { id, item: "", description: "", unit: "NOS", qty: 1, rate: 0, amount: 0 }]);
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

  const handleA4Change = (field: string, value: string) => { setA4(prev => ({ ...prev, [field]: value })); };

  const handleCustomerChange = (label: string) => {
    setFormCustomer(label);
    const cust = customerList.find(c => c.label === label);
    if (!cust) return;
    const addr = [cust.address, cust.city, cust.stateName, cust.pincode].filter(Boolean).join(", ");
    setA4(prev => ({
      ...prev,
      billedToName: cust.customerName || label,
      billedToAddress: addr,
      billedToGstin: cust.gstNumber || "",
      billedToState: cust.stateName,
      billedToStateCode: cust.stateCode,
      shippedToName: cust.customerName || label,
      shippedToAddress: addr,
      shippedToState: cust.stateName,
      shippedToStateCode: cust.stateCode,
    }));
  };

  const handleReset = () => {
    setFormCustomer(""); setFormDate(new Date().toISOString().split("T")[0]); setFormDueDate("");
    setFormDiscount("0"); setFormDiscountType("%"); setFormTaxRate("0"); setTaxSplit("AUTO");
    setFormItems([]); setFormNotes(""); setFormTerms(""); setA4(emptyA4()); setEditId(null);
    window.history.replaceState({}, "", "/accounting/a4-invoice");
  };

  const handleSave = async () => {
    if (!formCustomer) { alert("Customer is required."); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        customerName: formCustomer, status: "Unpaid", documentType: "A4 Bill",
        gstType: effectiveTaxType, invoiceDate: formDate, dueDate: formDueDate || null,
        discount: Number(formDiscount), discountType: formDiscountType, taxRate: Number(formTaxRate),
        notes: formNotes, terms: formTerms,
        items: formItems.map(item => ({ item: item.item, description: item.description, unit: item.unit, qty: item.qty, rate: item.rate })),
      };
      for (const [k, v] of Object.entries(a4)) { payload[k] = v || null; }
      let res;
      if (editId) {
        res = await fetch("/api/accounting/invoices", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, ...payload }) });
      } else {
        res = await fetch("/api/accounting/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save invoice");
      alert(editId ? "Invoice updated!" : "Invoice saved!");
      handleReset();
    } catch (e) {
      console.error("Failed to save invoice:", e);
      alert("Failed to save invoice.");
    } finally { setSaving(false); }
  };

  const handlePrint = useCallback(() => {
    const el = printRef.current;
    if (!el) return;
    const parent = el.parentElement;
    document.body.appendChild(el);
    window.print();
    if (parent) parent.appendChild(el);
  }, []);

  const fullAddress = company ? [company.address, company.city, company.stateName, company.pincode].filter(Boolean).join(", ") : "";
  const billedName = a4.billedToName || formCustomer;
  const billedAddr = a4.billedToAddress || company?.address || "";
  const billedGstin = a4.billedToGstin || company?.gstNumber || "URP";
  const billedState = a4.billedToState || company?.stateName || "";
  const billedCode = a4.billedToStateCode || company?.gstStateCode || "";
  const shippedName = a4.shippedToName || formCustomer;
  const shippedAddr = a4.shippedToAddress || company?.address || "";
  const shippedState = a4.shippedToState || company?.stateName || "";
  const shippedCode = a4.shippedToStateCode || company?.gstStateCode || "";

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm";
  const labelCls = "text-sm font-medium text-gray-700 mb-1 block";

  return (
    <div className="flex flex-col xl:flex-row h-[calc(100vh-64px)]">
      {/* Left Panel — Form */}
      <div className="w-full xl:w-[480px] flex-shrink-0 overflow-y-auto p-6 border-r border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">{editId ? "Edit A4 Invoice" : "A4 Invoice"}</h1>
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"><RotateCcw size={14} /> Reset</button>
        </div>

        {/* Customer + Date */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label className={labelCls}>Customer</label><select value={formCustomer} onChange={e => handleCustomerChange(e.target.value)} className={inputCls}><option value="">-- Select Customer --</option>{customerList.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}</select></div>
          <div><label className={labelCls}>Issue Date *</label><input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label className={labelCls}>Due Date</label><input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Discount</label><div className="flex"><input type="number" value={formDiscount} onChange={e => setFormDiscount(e.target.value)} className={`${inputCls} rounded-r-none`} /><select value={formDiscountType} onChange={e => setFormDiscountType(e.target.value)} className="px-2 border border-l-0 border-gray-300 rounded-r-md text-sm bg-white"><option>%</option><option>₹</option></select></div></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Tax Rate (%)</label>
            <input type="number" value={formTaxRate} onChange={e => setFormTaxRate(e.target.value)} className={inputCls} placeholder="e.g. 18" />
          </div>
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

        {/* Transport Details */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Transport Details</h3>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelCls}>Challan No.</label><input value={a4.challanNo} onChange={e => handleA4Change("challanNo", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Transport Mode</label><input value={a4.transportationMode} onChange={e => handleA4Change("transportationMode", e.target.value)} className={inputCls} placeholder="Road" /></div>
            <div><label className={labelCls}>Vehicle No.</label><input value={a4.vehicleNo} onChange={e => handleA4Change("vehicleNo", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Date of Supply</label><input type="date" value={a4.dateOfSupply} onChange={e => handleA4Change("dateOfSupply", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Place of Supply</label><input value={a4.placeOfSupply} onChange={e => handleA4Change("placeOfSupply", e.target.value)} className={inputCls} placeholder="City" /></div>
          </div>
        </div>

        {/* Billed To / Shipped To */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-xs font-bold text-gray-800 mb-2">Billed To</h3>
            <div className="space-y-2">
              <div><label className={labelCls}>Name</label><input value={a4.billedToName} onChange={e => handleA4Change("billedToName", e.target.value)} className={inputCls} placeholder="Billed to name" /></div>
              <div><label className={labelCls}>Address</label><textarea value={a4.billedToAddress} onChange={e => handleA4Change("billedToAddress", e.target.value)} rows={2} className={`${inputCls} resize-none`} /></div>
              <div><label className={labelCls}>GSTIN</label><input value={a4.billedToGstin} onChange={e => handleA4Change("billedToGstin", e.target.value)} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>State</label><input value={a4.billedToState} onChange={e => handleA4Change("billedToState", e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Code</label><input value={a4.billedToStateCode} onChange={e => handleA4Change("billedToStateCode", e.target.value)} className={inputCls} /></div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-xs font-bold text-gray-800 mb-2">Shipped To</h3>
            <div className="space-y-2">
              <div><label className={labelCls}>Name</label><input value={a4.shippedToName} onChange={e => handleA4Change("shippedToName", e.target.value)} className={inputCls} placeholder="Shipped to name" /></div>
              <div><label className={labelCls}>Address</label><textarea value={a4.shippedToAddress} onChange={e => handleA4Change("shippedToAddress", e.target.value)} rows={2} className={`${inputCls} resize-none`} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>State</label><input value={a4.shippedToState} onChange={e => handleA4Change("shippedToState", e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Code</label><input value={a4.shippedToStateCode} onChange={e => handleA4Change("shippedToStateCode", e.target.value)} className={inputCls} /></div>
              </div>
            </div>
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
                  {showTax && (effectiveTaxType === "CGST_SGST" ? (
                    <>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 border-r border-gray-300" colSpan={2}>CGST</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 border-r border-gray-300" colSpan={2}>SGST</th>
                    </>
                  ) : (
                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 border-r border-gray-300" colSpan={2}>IGST</th>
                  ))}
                  <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 w-24 border-r border-gray-300" rowSpan={2}>Total</th>
                  <th className="w-8" rowSpan={2}></th>
                </tr>
                {showTax && (effectiveTaxType === "CGST_SGST" ? (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-gray-300">Rate</th>
                    <th className="px-2 py-1 text-right text-[10px] font-semibold text-gray-500 border-r border-gray-300">Amt</th>
                    <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-gray-300">Rate</th>
                    <th className="px-2 py-1 text-right text-[10px] font-semibold text-gray-500 border-r border-gray-300">Amt</th>
                  </tr>
                ) : (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-gray-300">Rate</th>
                    <th className="px-2 py-1 text-right text-[10px] font-semibold text-gray-500 border-r border-gray-300">Amt</th>
                  </tr>
                ))}
              </thead>
              <tbody>
                {itemsWithTax.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-2 py-1 text-center text-sm text-gray-600 border-r border-gray-300">{item.srNo}</td>
                    <td className="px-2 py-1 border-r border-gray-300"><input value={item.item} onChange={e => handleLineChange(item.id, "item", e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" placeholder="Product name" /></td>
                    <td className="px-2 py-1 border-r border-gray-300"><input type="number" value={item.qty} onChange={e => handleLineChange(item.id, "qty", Number(e.target.value))} className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-center" /></td>
                    <td className="px-2 py-1 border-r border-gray-300">
                      <select value={item.unit} onChange={e => handleLineChange(item.id, "unit", e.target.value)} className="w-full px-1 py-1 border border-gray-200 rounded text-sm">
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1 border-r border-gray-300"><input type="number" value={item.rate} onChange={e => handleLineChange(item.id, "rate", Number(e.target.value))} className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right" /></td>
                    <td className="px-2 py-1 text-sm text-right font-medium border-r border-gray-300">₹{fmt(item.taxableValue)}</td>
                    {showTax && (effectiveTaxType === "CGST_SGST" ? (
                      <>
                        <td className="px-2 py-1 text-center text-xs text-gray-500 border-r border-gray-300">{halfRate.toFixed(2)}%</td>
                        <td className="px-2 py-1 text-sm text-right border-r border-gray-300">₹{fmt(item.cgstAmount)}</td>
                        <td className="px-2 py-1 text-center text-xs text-gray-500 border-r border-gray-300">{halfRate.toFixed(2)}%</td>
                        <td className="px-2 py-1 text-sm text-right border-r border-gray-300">₹{fmt(item.sgstAmount)}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-2 py-1 text-center text-xs text-gray-500 border-r border-gray-300">{taxRateVal.toFixed(2)}%</td>
                        <td className="px-2 py-1 text-sm text-right border-r border-gray-300">₹{fmt(item.igstAmount)}</td>
                      </>
                    ))}
                    <td className="px-2 py-1 text-sm text-right font-bold border-r border-gray-300">₹{fmt(item.totalAmount)}</td>
                    <td className="px-1 py-1 text-center"><button onClick={() => handleRemoveLine(item.id)} className="text-red-400 hover:text-red-600 text-xs"><Trash2 size={12} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleAddLine} className="mt-2 flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"><Plus size={14} /> Add Item</button>
        </div>

        {/* Totals */}
        <div className="mb-4 max-w-sm">
          <div className="flex justify-between py-1 text-sm"><span className="text-gray-600">Subtotal</span><span>₹{fmt(subtotal)}</span></div>
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

        {/* Bank Details */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Bank Details</h3>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelCls}>Account Holder</label><input value={a4.bankAccountHolder} onChange={e => handleA4Change("bankAccountHolder", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Account Number</label><input value={a4.bankAccountNumber} onChange={e => handleA4Change("bankAccountNumber", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>IFSC</label><input value={a4.bankIfsc} onChange={e => handleA4Change("bankIfsc", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Bank Name</label><input value={a4.bankName} onChange={e => handleA4Change("bankName", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Branch</label><input value={a4.bankBranch} onChange={e => handleA4Change("bankBranch", e.target.value)} className={inputCls} /></div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#4caf85] text-white rounded-lg text-sm font-medium hover:bg-[#3d9a7e] shadow-sm disabled:opacity-50">
            <Save size={16} /> {saving ? "Saving..." : editId ? "Update" : "Save"}
          </button>
          <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleReset} className="flex items-center justify-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg text-sm font-medium border border-gray-300">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Right Panel — Live Preview */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
        <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Live Preview</h2>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mx-auto" style={{ maxWidth: "820px" }}>
          <div ref={printRef}>
            <style>{`
              @media print {
                body * { visibility: hidden !important; }
                .print-area, .print-area * { visibility: visible !important; }
                .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                @page { size: A4 portrait; margin: 10mm; }
              }
              .print-area { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #000; }
            `}</style>
            <div className="print-area p-6">
              {/* Company Header */}
              <table className="w-full" style={{ border: "2px solid #000" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "120px", padding: "10px", verticalAlign: "middle", border: "1px solid #000" }}>
                      {company?.logo ? (
                        <img src={company.logo} alt={company.companyName} style={{ maxWidth: "100px", maxHeight: "100px", display: "block", margin: "0 auto" }} />
                      ) : (
                        <div style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>{company?.companyName?.substring(0, 3).toUpperCase() || "CO."}</div>
                      )}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center", verticalAlign: "middle", border: "1px solid #000" }}>
                      <div style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "1px" }}>{company?.companyName || "Company Name"}</div>
                      <div style={{ fontSize: "10px", marginTop: "2px" }}>{fullAddress}</div>
                      {company?.email && <div style={{ fontSize: "10px", marginTop: "2px" }}>{company.email}</div>}
                      {company?.gstNumber && <div style={{ fontSize: "10px", marginTop: "2px", fontWeight: "bold" }}>GSTIN : {company.gstNumber}</div>}
                      {company?.panNumber && <div style={{ fontSize: "10px", marginTop: "2px", fontWeight: "bold" }}>PAN No: {company.panNumber}</div>}
                      {company?.phone && <div style={{ fontSize: "10px", marginTop: "2px" }}>Phone: {company.phone}</div>}
                    </td>
                    <td style={{ width: "160px", padding: "10px", textAlign: "right", verticalAlign: "middle", border: "1px solid #000" }}>
                      <div style={{ fontSize: "10px" }}>Original for Recipient</div>
                      <div style={{ fontSize: "10px" }}>Duplicate for Transporter</div>
                      <div style={{ fontSize: "10px" }}>Triplicate for Supplier</div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* TAX INVOICE */}
              <div style={{ border: "2px solid #000", borderTop: "none", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "16px", letterSpacing: "2px" }}>TAX INVOICE</div>

              {/* Invoice Meta */}
              <table className="w-full" style={{ border: "2px solid #000", borderTop: "none" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "50%", padding: "6px 10px", verticalAlign: "top", borderRight: "1px solid #000" }}>
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Reverse Charge</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: No</td></tr>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Invoice Date</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {formatDateShort(formDate)}</td></tr>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>State</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {company?.stateName || ""} &nbsp;&nbsp; Code: {company?.gstStateCode || ""}</td></tr>
                        </tbody>
                      </table>
                    </td>
                    <td style={{ width: "50%", padding: "6px 10px", verticalAlign: "top" }}>
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Challan No.</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {a4.challanNo || "-"}</td></tr>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Transport Mode</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {a4.transportationMode || "Road"}</td></tr>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Vehicle No.</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {a4.vehicleNo || "-"}</td></tr>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Date of Supply</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {a4.dateOfSupply ? formatDateShort(a4.dateOfSupply) : formatDateShort(formDate)}</td></tr>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Place of Supply</td><td style={{ fontSize: "10px", padding: "1px 0", textAlign: "right" }}>: {a4.placeOfSupply || company?.city || ""} {company?.stateName || ""}</td></tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Billed To + Shipped To */}
              <table className="w-full" style={{ border: "2px solid #000", borderTop: "none" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "50%", padding: "6px 10px", verticalAlign: "top", borderRight: "1px solid #000" }}>
                      <div style={{ fontSize: "10px", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "3px", marginBottom: "4px" }}>Details of Receiver | Billed to:</div>
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Name</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {billedName || "-"}</td></tr>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0", verticalAlign: "top" }}>Address</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {billedAddr || "-"}</td></tr>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>GSTIN</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {billedGstin}</td></tr>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>State</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {billedState} &nbsp;&nbsp; Code: {billedCode}</td></tr>
                        </tbody>
                      </table>
                    </td>
                    <td style={{ width: "50%", padding: "6px 10px", verticalAlign: "top" }}>
                      <div style={{ fontSize: "10px", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "3px", marginBottom: "4px" }}>Details of Consignee | Shipped to:</div>
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>Name</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {shippedName || "-"}</td></tr>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0", verticalAlign: "top" }}>Address</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {shippedAddr || "-"}</td></tr>
                          <tr><td style={{ fontSize: "10px", padding: "1px 0" }}>State</td><td style={{ fontSize: "10px", padding: "1px 0" }}>: {shippedState} &nbsp;&nbsp; Code: {shippedCode}</td></tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Items Table */}
              <table className="w-full" style={{ border: "2px solid #000", borderTop: "none", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#d4e8d4" }}>
                    <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>Sr. No.</th>
                    <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>Name of product</th>
                    <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>QTY</th>
                    <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>Unit</th>
                    <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>Rate</th>
                    <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>Taxable Value</th>
                    {showTax && (effectiveTaxType === "CGST_SGST" ? (
                      <>
                        <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }} colSpan={2}>CGST</th>
                        <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }} colSpan={2}>SGST</th>
                      </>
                    ) : (
                      <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }} colSpan={2}>IGST</th>
                    ))}
                    <th style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", textAlign: "center", fontWeight: "bold" }}>Total</th>
                  </tr>
                  {showTax && (effectiveTaxType === "CGST_SGST" ? (
                    <tr style={{ backgroundColor: "#d4e8d4" }}>
                      {Array.from({ length: 6 }).map((_, i) => <th key={i} style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>)}
                      <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Rate</th>
                      <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Amount</th>
                      <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Rate</th>
                      <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Amount</th>
                      <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    </tr>
                  ) : (
                    <tr style={{ backgroundColor: "#d4e8d4" }}>
                      {Array.from({ length: 6 }).map((_, i) => <th key={i} style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>)}
                      <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Rate</th>
                      <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px", textAlign: "center" }}>Amount</th>
                      <th style={{ border: "1px solid #000", padding: "2px", fontSize: "8px" }}></th>
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {itemsWithTax.length > 0 ? itemsWithTax.map((item) => (
                    <tr key={item.id}>
                      <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{item.srNo}</td>
                      <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px" }}>{item.item || "-"}</td>
                      <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{item.qty}</td>
                      <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{item.unit || "NOS"}</td>
                      <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.rate)}</td>
                      <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.taxableValue)}</td>
                      {showTax && (effectiveTaxType === "CGST_SGST" ? (
                        <>
                          <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{halfRate.toFixed(2)}%</td>
                          <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.cgstAmount)}</td>
                          <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{halfRate.toFixed(2)}%</td>
                          <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.sgstAmount)}</td>
                        </>
                      ) : (
                        <>
                          <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "center" }}>{taxRateVal.toFixed(2)}%</td>
                          <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right" }}>{fmt(item.igstAmount)}</td>
                        </>
                      ))}
                      <td style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", textAlign: "right", fontWeight: "bold" }}>{fmt(item.totalAmount)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7 + taxCols} style={{ border: "1px solid #000", padding: "20px", fontSize: "9px", textAlign: "center", color: "#999" }}>Add items to see preview</td></tr>
                  )}
                  {itemsWithTax.length > 0 && itemsWithTax.length < 8 &&
                    Array.from({ length: 8 - itemsWithTax.length }).map((_, i) => (
                      <tr key={`empty-${i}`}>
                        {Array.from({ length: 7 + taxCols }).map((__, j) => (
                          <td key={j} style={{ border: "1px solid #000", padding: "3px 6px", fontSize: "9px", height: "20px" }}>&nbsp;</td>
                        ))}
                      </tr>
                    ))
                  }
                  {itemsWithTax.length > 0 && (
                    <tr style={{ backgroundColor: "#e8f0e8" }}>
                      <td colSpan={2} style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold" }}>Total Quantity</td>
                      <td style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold", textAlign: "center" }}>{totalQty}</td>
                      <td style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px" }}></td>
                      <td style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px" }}></td>
                      <td style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold", textAlign: "right" }}>{fmt(totalTaxable)}</td>
                      {showTax && (effectiveTaxType === "CGST_SGST" ? (
                        <>
                          <td colSpan={2} style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold", textAlign: "right" }}>{fmt(totalCgst)}</td>
                          <td colSpan={2} style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold", textAlign: "right" }}>{fmt(totalSgst)}</td>
                        </>
                      ) : (
                        <td colSpan={2} style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold", textAlign: "right" }}>{fmt(totalIgst)}</td>
                      ))}
                      <td style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "9px", fontWeight: "bold", textAlign: "right" }}>{fmt(grandTotal)}</td>
                    </tr>
                  )}
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
                          {showTax && effectiveTaxType === "CGST_SGST" && (
                            <>
                              <tr><td style={{ fontSize: "9px", padding: "1px 0" }}>Add : CGST :</td><td style={{ fontSize: "9px", padding: "1px 0", textAlign: "right" }}>₹{fmt(totalCgst)}</td></tr>
                              <tr><td style={{ fontSize: "9px", padding: "1px 0" }}>Add : SGST :</td><td style={{ fontSize: "9px", padding: "1px 0", textAlign: "right" }}>₹{fmt(totalSgst)}</td></tr>
                              <tr><td style={{ fontSize: "9px", padding: "1px 0" }}>Tax Amount : GST :</td><td style={{ fontSize: "9px", padding: "1px 0", textAlign: "right" }}>₹{fmt(totalCgst + totalSgst)}</td></tr>
                            </>
                          )}
                          {showTax && effectiveTaxType === "IGST" && (
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
                      <div style={{ fontSize: "9px" }}>Account Holder Name : <span style={{ float: "right" }}>{a4.bankAccountHolder || company?.companyName || ""}</span></div>
                      <div style={{ fontSize: "9px" }}>Bank Account Number : <span style={{ float: "right" }}>{a4.bankAccountNumber || "-"}</span></div>
                      <div style={{ fontSize: "9px" }}>Bank IFSC Code : <span style={{ float: "right" }}>{a4.bankIfsc || "-"}</span></div>
                      <div style={{ fontSize: "9px" }}>Bank Name : <span style={{ float: "right" }}>{a4.bankName || "-"}</span></div>
                      <div style={{ fontSize: "9px" }}>Bank Branch Name : <span style={{ float: "right" }}>{a4.bankBranch || "-"}</span></div>
                    </td>
                    <td style={{ width: "50%", padding: "6px 10px", verticalAlign: "top", textAlign: "right" }}>
                      <div style={{ fontSize: "9px", marginTop: "4px" }}>Certified that the particular given above are true</div>
                      <div style={{ fontSize: "9px" }}>and correct</div>
                      <div style={{ fontSize: "10px", fontWeight: "bold", marginTop: "12px" }}>For, {company?.companyName || "Company"}</div>
                      <div style={{ fontSize: "9px", marginTop: "30px" }}>Authorised Signatory</div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Terms */}
              <div style={{ border: "2px solid #000", borderTop: "none", padding: "6px 10px" }}>
                <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "3px" }}>Terms And Conditions</div>
                {formTerms ? (
                  <div style={{ fontSize: "9px", whiteSpace: "pre-wrap" }}>{formTerms}</div>
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
    </div>
  );
}
