"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductSearch from "@/components/billing/ProductSearch";
import CartTable from "@/components/billing/CartTable";
import CustomerForm, { type CustomerData } from "@/components/billing/CustomerForm";

export type BillingMode = "WITH_GST" | "WITH_GST_HIDE" | "WITH_IGST" | "WITHOUT_GST";

let nextId = 1;

export default function EstimatePage() {
  const router = useRouter();
  const [cart, setCart] = useState<Array<{
    id: number;
    productId: number;
    name: string;
    price: number;
    qty: number;
    stock: number;
    remarks: string;
  }>>([]);
  const [discPercent, setDiscPercent] = useState(0);
  const [discAmount, setDiscAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [gstRate, setGstRate] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [saving, setSaving] = useState(false);
  const [billingMode, setBillingMode] = useState<BillingMode>("WITH_GST");

  useEffect(() => {
    fetch("/api/company/gst-settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.gstSettings) return;
        const map: Record<string, BillingMode> = {
          GST_VISIBLE: "WITH_GST",
          GST_INCLUDED_HIDDEN: "WITH_GST_HIDE",
          GST_IGST: "WITH_IGST",
          NO_GST: "WITHOUT_GST",
        };
        const configuredMode = data.gstSettings.gstEnabled === false
          ? "WITHOUT_GST"
          : map[data.gstSettings.gstMode] || "WITH_GST";
        setBillingMode(configuredMode);
      })
      .catch(() => {});
  }, []);

  const isGSTVisible = billingMode === "WITH_GST" || billingMode === "WITH_IGST" || billingMode === "WITH_GST_HIDE";
  const isNoGST = billingMode === "WITHOUT_GST";
  const isIGST = billingMode === "WITH_IGST";

  const gstModeAPI = isNoGST ? "NO_GST" : billingMode === "WITH_GST_HIDE" ? "GST_INCLUDED_HIDDEN" : isIGST ? "GST_IGST" : "GST_VISIBLE";

  const subtotal = cart.reduce((s, item) => s + item.price * item.qty, 0);
  const effectiveTax = isNoGST ? taxAmount : Math.round((subtotal - discAmount) * (gstRate / 100) * 100) / 100;
  const total = subtotal - discAmount + effectiveTax;

  const handleAddProduct = useCallback(
    (product: {
      id: number;
      productName: string;
      sellingPrice: number;
      currentStock: number;
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

  const handleSave = useCallback(async () => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.qty,
        unitPrice: item.price,
      }));

      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || undefined,
          items,
          gstMode: gstModeAPI,
          taxRate: gstRate,
          discountAmount: discAmount,
          expiryDate: expiryDate || undefined,
          remarks: remarks || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Estimate saved! Number: ${data.estimate.estimateNumber}`);
        setCart([]);
        setDiscPercent(0);
        setDiscAmount(0);
        setTaxAmount(0);
        setGstRate(0);
        setRemarks("");
        setExpiryDate("");
        setSelectedCustomer(null);
      } else {
        alert(data.error || "Failed to save estimate");
      }
    } catch {
      alert("Failed to save estimate. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [cart, selectedCustomer, discAmount, gstRate, expiryDate, remarks, gstModeAPI]);

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

  return (
    <div className="flex flex-col xl:flex-row h-full bg-gray-50">
      {/* Left: Product Search + Cart */}
      <div className="flex-1 flex flex-col min-w-0 p-4 gap-3">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/sales/estimate")}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">New Estimate</h1>
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
      </div>

      {/* Right: Customer + Summary */}
      <div className="w-full xl:w-80 border-l border-gray-200 bg-white p-4 flex flex-col gap-4">
        {/* Customer */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer</h3>
          {selectedCustomer ? (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-800">{selectedCustomer.name}</span>
                <button onClick={handleClearCustomer} className="text-xs text-red-500 hover:text-red-700">✕</button>
              </div>
              <p className="text-xs text-gray-500">{selectedCustomer.mobile}</p>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomerForm(true)}
              className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
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
              <input
                type="number"
                value={discPercent || ""}
                onChange={(e) => handleDiscPercentChange(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                min={0}
                max={100}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">Amount</label>
              <input
                type="number"
                value={discAmount || ""}
                onChange={(e) => handleDiscAmountChange(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Expiry Date</h3>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        {/* Remarks */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Remarks</h3>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            placeholder="Optional remarks..."
          />
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
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={cart.length === 0 || saving}
          className="w-full px-4 py-2.5 bg-[#4caf85] text-white rounded-lg text-sm font-medium hover:bg-[#3d9a7e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
        >
          {saving ? "Saving..." : "Save Estimate"}
        </button>
      </div>

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <CustomerForm onCustomerSelect={handleCustomerSelect} onClose={() => setShowCustomerForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
