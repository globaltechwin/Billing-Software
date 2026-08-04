"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import ProductSearch from "@/components/billing/ProductSearch";
import CartTable, { type CartItemGST } from "@/components/billing/CartTable";
import CustomerForm, { type CustomerData } from "@/components/billing/CustomerForm";
import InvoicePrintPreview from "@/components/billing/InvoicePrintPreview";

export type BillingMode = "WITH_GST" | "WITH_GST_HIDE" | "WITH_IGST" | "WITHOUT_GST";

let nextId = 1;

interface CartItemExtra extends CartItemGST {
  gstApplicable: boolean;
  gst: {
    gstPercentage: number;
    cgstPercentage: number;
    sgstPercentage: number;
    igstPercentage: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    taxAmount: number;
  };
}

function mapGSTModeToBilling(apiMode: string): BillingMode {
  switch (apiMode) {
    case "GST_VISIBLE": return "WITH_GST";
    case "GST_INCLUDED_HIDDEN": return "WITH_GST_HIDE";
    case "GST_IGST": return "WITH_IGST";
    case "NO_GST": return "WITHOUT_GST";
    default: return "WITH_GST";
  }
}

function mapBillingToGSTMode(mode: BillingMode): string {
  switch (mode) {
    case "WITH_GST": return "GST_VISIBLE";
    case "WITH_GST_HIDE": return "GST_INCLUDED_HIDDEN";
    case "WITH_IGST": return "GST_IGST";
    case "WITHOUT_GST": return "NO_GST";
  }
}

export default function InvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const estimateIdParam = searchParams.get("estimateId");

  const [cart, setCart] = useState<CartItemExtra[]>([]);
  const [discPercent, setDiscPercent] = useState(0);
  const [discAmount, setDiscAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [gstRate, setGstRate] = useState(0);
  const [complimentBill, setComplimentBill] = useState(false);
  const [creditBill, setCreditBill] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [amountGiven, setAmountGiven] = useState(0);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [salesPerson, setSalesPerson] = useState("");
  const [saving, setSaving] = useState(false);
  const [billingMode, setBillingMode] = useState<BillingMode>("WITH_GST");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printInvoiceId, setPrintInvoiceId] = useState<number | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState<boolean>(!!estimateIdParam);
  const [estimateInfo, setEstimateInfo] = useState<{ number: string; id: number } | null>(null);

  useEffect(() => {
    fetch("/api/company/gst-settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.gstSettings) return;
        const configuredMode = data.gstSettings.gstEnabled === false
          ? "WITHOUT_GST"
          : mapGSTModeToBilling(data.gstSettings.gstMode);
        if (!estimateIdParam) setBillingMode(configuredMode);
      })
      .catch(() => {});
  }, [estimateIdParam]);

  useEffect(() => {
    if (!estimateIdParam) return;
    const eid = parseInt(estimateIdParam, 10);
    if (isNaN(eid)) return;

    fetch(`/api/estimates/${eid}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setEstimateInfo({ number: data.estimateNumber, id: data.id });
          setBillingMode(mapGSTModeToBilling(data.gstMode));
          setDiscAmount(Number(data.discountAmount) || 0);
          setGstRate(Number(data.taxRate) || 0);
          setRemarks(data.remarks || "");

          if (data.customer) {
            setSelectedCustomer({
              id: data.customer.id,
              mobile: data.customer.phone || "",
              name: data.customer.customerName,
              address: data.customer.address || "",
              landmark: "",
              additionalMobile: "",
              attender: "",
              stateCode: data.customer.stateCode || undefined,
            });
          }

          if (data.items && data.items.length > 0) {
            const estItems: CartItemExtra[] = data.items.map((item: Record<string, unknown>) => {
              return {
                id: nextId++,
                productId: item.productId as number,
                name: item.productNameSnapshot as string,
                price: Number(item.unitPrice),
                qty: Number(item.quantity),
                stock: Number(item.quantity) + 100,
                remarks: "",
                gstApplicable: true,
                gst: { gstPercentage: 0, cgstPercentage: 0, sgstPercentage: 0, igstPercentage: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, taxAmount: 0 },
              };
            });
            setCart(estItems);
          }
        }
      })
      .catch(() => alert("Failed to load estimate"))
      .finally(() => setLoadingEstimate(false));
  }, [estimateIdParam]);

  const isGSTVisible = billingMode === "WITH_GST" || billingMode === "WITH_IGST" || billingMode === "WITH_GST_HIDE";
  const isNoGST = billingMode === "WITHOUT_GST";
  const isIGST = billingMode === "WITH_IGST";
  const gstModeAPI = mapBillingToGSTMode(billingMode);

  const subtotal = useMemo(() => cart.reduce((s, item) => s + item.price * item.qty, 0), [cart]);
  const effectiveTax = isNoGST ? taxAmount : Math.round((subtotal - discAmount) * (gstRate / 100) * 100) / 100;
  const total = subtotal - discAmount + effectiveTax;

  const handleAddProduct = useCallback(
    (product: {
      id: number;
      productName: string;
      sellingPrice: number;
      currentStock: number;
      gstApplicable?: boolean;
      gstMaster?: { totalPercentage: number } | null;
    }) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          if (existing.qty >= product.currentStock) return prev;
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, qty: Math.min(item.qty + 1, product.currentStock) }
              : item
          );
        }
        return [
          ...prev,
          {
            id: nextId++,
            productId: product.id,
            name: product.productName,
            price: product.sellingPrice,
            qty: 1,
            stock: product.currentStock,
            remarks: "",
            gstApplicable: product.gstApplicable ?? true,
            gst: { gstPercentage: 0, cgstPercentage: 0, sgstPercentage: 0, igstPercentage: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, taxAmount: 0 },
          },
        ];
      });
    },
    []
  );

  const handleUpdateQty = useCallback((id: number, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.min(qty, item.stock) } : item
      )
    );
  }, []);

  const handleRemove = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleCustomerSelect = useCallback((customer: CustomerData) => {
    setSelectedCustomer(customer);
    setShowCustomerForm(false);
  }, []);

  const handleClearCustomer = useCallback(() => {
    setSelectedCustomer(null);
  }, []);

  const handleDiscPercentChange = useCallback((val: number) => {
    setDiscPercent(val);
    const sub = cart.reduce((s, item) => s + item.price * item.qty, 0);
    setDiscAmount(Math.round((sub * val) / 100 * 100) / 100);
  }, [cart]);

  const handleDiscAmountChange = useCallback((val: number) => {
    setDiscAmount(val);
    const sub = cart.reduce((s, item) => s + item.price * item.qty, 0);
    if (sub > 0) {
      setDiscPercent(Math.round((val / sub) * 10000) / 100);
    }
  }, [cart]);

  const buildPayload = useCallback(() => ({
    customerId: selectedCustomer?.id || 0,
    items: cart.map((item) => ({
      productId: item.productId,
      quantity: item.qty,
      unitPrice: item.price,
    })),
    gstMode: gstModeAPI,
    taxRate: gstRate,
    discountAmount: discAmount,
    paymentMode: complimentBill ? "COMPLIMENT" : creditBill ? "CREDIT" : paymentMode,
    cashReceived: amountGiven,
    remarks: remarks || undefined,
    salesPerson: salesPerson || undefined,
  }), [cart, selectedCustomer, discAmount, gstRate, complimentBill, creditBill, paymentMode, amountGiven, remarks, salesPerson, gstModeAPI]);

  const clearAll = useCallback(() => {
    setCart([]);
    setDiscPercent(0);
    setDiscAmount(0);
    setTaxAmount(0);
    setGstRate(0);
    setAmountGiven(0);
    setRemarks("");
    setSelectedCustomer(null);
    setPaymentMode("CASH");
    setComplimentBill(false);
    setCreditBill(false);
    setEstimateInfo(null);
  }, []);

  const handleSaveAndPrint = useCallback(async () => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      let res: Response;
      if (estimateInfo) {
        res = await fetch("/api/invoices/convert-from-estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estimateId: estimateInfo.id,
            paymentMode: complimentBill ? "COMPLIMENT" : creditBill ? "CREDIT" : paymentMode,
            cashReceived: amountGiven,
            remarks: remarks || undefined,
            salesPerson: salesPerson || undefined,
          }),
        });
      } else {
        res = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });
      }

      const data = await res.json();
      if (data.success) {
        const invId = data.invoice.id;
        setPrintInvoiceId(invId);
        setShowPrintPreview(true);
        clearAll();
      } else {
        alert(data.error || "Failed to save invoice");
      }
    } catch {
      alert("Failed to save invoice. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [cart, estimateInfo, complimentBill, creditBill, paymentMode, amountGiven, remarks, salesPerson, buildPayload, clearAll]);

  const handleSaveAndNew = useCallback(async () => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      let res: Response;
      if (estimateInfo) {
        res = await fetch("/api/invoices/convert-from-estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estimateId: estimateInfo.id,
            paymentMode: complimentBill ? "COMPLIMENT" : creditBill ? "CREDIT" : paymentMode,
            cashReceived: amountGiven,
            remarks: remarks || undefined,
            salesPerson: salesPerson || undefined,
          }),
        });
      } else {
        res = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });
      }

      const data = await res.json();
      if (data.success) {
        alert(`Invoice saved! Number: ${data.invoice.invoiceNumber}`);
        clearAll();
      } else {
        alert(data.error || "Failed to save invoice");
      }
    } catch {
      alert("Failed to save invoice. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [cart, estimateInfo, complimentBill, creditBill, paymentMode, amountGiven, remarks, salesPerson, buildPayload, clearAll]);

  const handleCancel = useCallback(() => {
    if (cart.length > 0 && !confirm("Discard current invoice?")) return;
    clearAll();
    router.push("/sales/invoice");
  }, [cart.length, clearAll, router]);

  if (loadingEstimate) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-purple-600" />
          <p className="text-sm text-gray-600">Loading estimate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row h-full bg-gray-50">
      {/* Left: Product Search + Cart */}
      <div className="flex-1 flex flex-col min-w-0 p-4 gap-3">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button onClick={handleCancel} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-gray-600" />
              <h1 className="text-xl font-bold text-gray-800">
                {estimateInfo ? `Invoice from ${estimateInfo.number}` : "New Invoice"}
              </h1>
            </div>
            {estimateInfo && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                Converting Estimate
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={billingMode}
              onChange={(e) => setBillingMode(e.target.value as BillingMode)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="WITH_GST">With GST</option>
              <option value="WITH_GST_HIDE">GST Included (Hide)</option>
              <option value="WITH_IGST">With IGST</option>
              <option value="WITHOUT_GST">Without GST</option>
            </select>
            {isGSTVisible && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">GST %:</label>
                <input
                  type="number"
                  value={gstRate || ""}
                  onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  min={0}
                  max={100}
                  step={0.5}
                />
              </div>
            )}
          </div>
        </div>

        {/* Product Search */}
        <ProductSearch onAddProduct={handleAddProduct} />

        {/* Cart */}
        <div className="flex-1 overflow-auto">
          <CartTable
            items={cart}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
          />
        </div>

        {/* GST Summary */}
        {isGSTVisible && cart.length > 0 && effectiveTax > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-600">GST ({gstRate}%): <span className="font-semibold text-billora-primary">{effectiveTax.toFixed(2)}</span></span>
              {isIGST ? (
                <span className="text-gray-600">IGST: <span className="font-semibold text-gray-800">{effectiveTax.toFixed(2)}</span></span>
              ) : (
                <>
                  <span className="text-gray-600">CGST ({(gstRate / 2).toFixed(1)}%): <span className="font-semibold text-gray-800">{(effectiveTax / 2).toFixed(2)}</span></span>
                  <span className="text-gray-600">SGST ({(gstRate / 2).toFixed(1)}%): <span className="font-semibold text-gray-800">{(effectiveTax / 2).toFixed(2)}</span></span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Customer + Payment + Actions */}
      <div className="w-full xl:w-80 border-l border-gray-200 bg-white p-4 flex flex-col gap-4 overflow-y-auto">
        {/* Customer */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer</h3>
          {selectedCustomer ? (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-800">{selectedCustomer.name}</span>
                <button onClick={handleClearCustomer} className="text-xs text-red-500 hover:text-red-700">Change</button>
              </div>
              <p className="text-xs text-gray-500">{selectedCustomer.mobile}</p>
              {selectedCustomer.address && <p className="text-xs text-gray-400 mt-1">{selectedCustomer.address}</p>}
            </div>
          ) : (
            <button onClick={() => setShowCustomerForm(true)} className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors">
              + Select / Add Customer
            </button>
          )}
        </div>

        {/* Discount */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Discount</h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500">%</label>
              <input type="number" value={discPercent || ""} onChange={(e) => handleDiscPercentChange(parseFloat(e.target.value) || 0)} className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" min={0} max={100} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">Amount</label>
              <input type="number" value={discAmount || ""} onChange={(e) => handleDiscAmountChange(parseFloat(e.target.value) || 0)} className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" min={0} />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment</h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={complimentBill} onChange={(e) => { setComplimentBill(e.target.checked); if (e.target.checked) setCreditBill(false); }} className="w-4 h-4 rounded border-gray-300" />
                <span className="text-xs text-gray-600">Compliment</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={creditBill} onChange={(e) => { setCreditBill(e.target.checked); if (e.target.checked) setComplimentBill(false); }} className="w-4 h-4 rounded border-gray-300" />
                <span className="text-xs text-gray-600">Credit</span>
              </label>
            </div>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="CREDIT">Credit</option>
            </select>
            <input type="number" value={amountGiven || ""} onChange={(e) => setAmountGiven(parseFloat(e.target.value) || 0)} placeholder="Cash received" className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
            <input type="text" value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)} placeholder="Sales person" className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Remarks</h3>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" placeholder="Optional remarks..." />
        </div>

        {/* Totals */}
        <div className="space-y-2 border-t border-gray-200 pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{subtotal.toFixed(2)}</span>
          </div>
          {discAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-red-600">-{discAmount.toFixed(2)}</span>
            </div>
          )}
          {effectiveTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({gstRate}%)</span>
              <span className="font-medium">{effectiveTax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
            <span>Grand Total</span>
            <span className="text-green-600">{total.toFixed(2)}</span>
          </div>
          {amountGiven > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Balance</span>
              <span className={`font-medium ${amountGiven - total >= 0 ? "text-green-600" : "text-red-600"}`}>
                {(amountGiven - total).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto">
          <button onClick={handleSaveAndPrint} disabled={cart.length === 0 || saving} className="w-full px-4 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "Saving..." : "Save & Print"}
          </button>
          <button onClick={handleSaveAndNew} disabled={cart.length === 0 || saving} className="w-full px-4 py-2.5 bg-[#4caf85] text-white rounded-lg text-sm font-medium hover:bg-[#3d9a7e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "Saving..." : "Save & New"}
          </button>
          <button onClick={handleCancel} className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </div>

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <CustomerForm onCustomerSelect={handleCustomerSelect} onClose={() => setShowCustomerForm(false)} />
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintPreview && printInvoiceId && (
        <InvoicePrintPreview invoiceId={printInvoiceId} onClose={() => { setShowPrintPreview(false); setPrintInvoiceId(null); }} />
      )}
    </div>
  );
}
