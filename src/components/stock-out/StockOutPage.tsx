"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { StockOutItem, StockOutProduct } from "./data";

const stockOutTypes = [
  { value: "PRODUCTION", label: "Production" },
  { value: "DAMAGE", label: "Damage" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "BRANCH_TRANSFER", label: "Branch Transfer" },
  { value: "OTHER", label: "Other" },
];

const departments = [
  "Kitchen",
  "Production",
  "Housekeeping",
  "Laundry",
  "Store",
];

interface ApiProduct {
  id: number;
  productName: string;
  unit: string;
  currentStock: number;
  purchasePrice: number;
}

export default function StockOutPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Header fields
  const [stockOutNo, setStockOutNo] = useState("SO-0001 (Auto)");
  const [stockOutDate, setStockOutDate] = useState(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  });
  const [stockOutType, setStockOutType] = useState("PRODUCTION");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [branchOut, setBranchOut] = useState("");
  const [remarks, setRemarks] = useState("");

  // Product selection
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productsList, setProductsList] = useState<StockOutProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Items table
  const [items, setItems] = useState<StockOutItem[]>([]);

  // Refs
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  // Fetch products from API
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          const mapped: StockOutProduct[] = data.products
            .filter((p: ApiProduct) => Number(p.currentStock) > 0)
            .map((p: ApiProduct) => ({
              id: String(p.id),
              name: p.productName,
              uom: p.unit,
              currentStock: Number(p.currentStock),
              price: Number(p.purchasePrice),
            }));
          setProductsList(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter products
  const filteredProducts = productsList.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
      !items.some((i) => i.product.id === p.id)
  );

  // Select product and auto-add
  const handleProductSelect = (product: StockOutProduct) => {
    const qty = 1;
    if (qty > product.currentStock) return;

    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      const newQty = existing.qty + qty;
      if (newQty > existing.product.currentStock) return;
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === product.id
            ? { ...i, qty: newQty }
            : i
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        { id: Date.now().toString(), product, qty },
      ]);
    }

    setProductSearch("");
    setShowProductDropdown(false);
  };

  // Handle qty change
  const handleQtyChange = (itemId: string, newQty: string) => {
    const qty = parseFloat(newQty);
    if (newQty === "" || (!isNaN(qty) && qty >= 0)) {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === itemId) {
            const capped = Math.min(qty, i.product.currentStock);
            return { ...i, qty: newQty === "" ? 0 : capped };
          }
          return i;
        })
      );
    }
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Totals
  const totalQuantity = items.reduce((sum, i) => sum + i.qty, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  // Save
  const handleSave = async () => {
    if (items.length === 0) return;
    setSaving(true);
    setSaveError("");
    try {
      const payload = {
        stockOutType,
        referenceNumber: referenceNumber || null,
        notes: remarks || null,
        items: items.map((item) => ({
          productId: Number(item.product.id),
          quantity: item.qty,
        })),
      };
      const res = await fetch("/api/stock-outs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save stock out");
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleClear();
      }, 2000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Clear
  const handleClear = () => {
    setStockOutNo("SO-0001 (Auto)");
    setStockOutDate(() => {
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${yyyy}-${mm}-${dd}`;
    });
    setStockOutType("PRODUCTION");
    setReferenceNumber("");
    setDepartment("");
    setBranchOut("");
    setRemarks("");
    setItems([]);
    setProductSearch("");
    setSaveError("");
  };

  // Cancel
  const handleCancel = () => {
    handleClear();
  };

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "F1") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "F2") {
        e.preventDefault();
        productInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSaveError("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const formatCurrency = (amount: number) => amount.toFixed(2);

  return (
    <div className="flex flex-col xl:flex-row gap-4 p-4 h-full">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Stock Out saved successfully!
        </div>
      )}
      {saveError && (
        <div className="fixed top-20 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {saveError}
        </div>
      )}

      {/* Left Panel - Main Content */}
      <div className="xl:flex-[7] flex flex-col gap-4">
        {/* Title Row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Stock Out</h1>
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Header Fields */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            {/* Stock Out No. */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Stock Out No.<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={stockOutNo}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-500"
              />
            </div>
            {/* Date */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={stockOutDate}
                onChange={(e) => setStockOutDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Stock Out Type */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Stock Out Type<span className="text-red-500">*</span>
              </label>
              <select
                value={stockOutType}
                onChange={(e) => setStockOutType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {stockOutTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            {/* Reference Number */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Reference Number</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Reference Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            {/* Department */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Department--</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            {/* Branch Out */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Branch Out</label>
              <select
                value={branchOut}
                onChange={(e) => setBranchOut(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Branch--</option>
                <option value="Main Branch">Main Branch</option>
                <option value="Second Branch">Second Branch</option>
              </select>
            </div>
            {/* Remarks */}
            <div className="col-span-2">
              <label className="block text-sm text-gray-700 font-medium mb-1">Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Product Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg" ref={productDropdownRef}>
            <input
              ref={productInputRef}
              type="text"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
              placeholder="Enter Product"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {showProductDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto">
                {productsLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No products found</div>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                    >
                      <span className="text-gray-700">{product.name}</span>
                      <span className="text-xs text-gray-400">
                        {product.uom} | Stock: {product.currentStock}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <span className="bg-blue-500 text-white text-xs font-medium px-4 py-1.5 rounded whitespace-nowrap">
            F1 – Save, F2 – Select product
          </span>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-[#3d9a7e] text-white">
                  <th className="px-4 py-3 text-left w-12 text-xs font-semibold">-</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Product Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-20">UOM</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">Cur. Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-24">Qty.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-24">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <span className="text-orange-500 text-sm">
                        There are no items [<span className="text-orange-500">Stock Out</span>]
                      </span>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const total = item.product.price * item.qty;
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.product.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.product.uom}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.product.currentStock}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.qty || ""}
                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                            min="1"
                            max={item.product.currentStock}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(item.product.price)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{formatCurrency(total)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="xl:flex-[3] bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-fit">
        <div className="space-y-4">
          {/* Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stock Out No.</span>
              <span className="text-sm font-medium text-gray-800">{stockOutNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Date</span>
              <span className="text-sm font-medium text-gray-800">
                {stockOutDate
                  ? new Date(stockOutDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Type</span>
              <span className="text-sm font-medium text-gray-800">
                {stockOutTypes.find((t) => t.value === stockOutType)?.label || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Department</span>
              <span className="text-sm font-medium text-gray-800">{department || "-"}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Items</span>
              <span className="text-sm font-medium text-gray-800">{items.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Quantity</span>
              <span className="text-sm font-medium text-gray-800">{totalQuantity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">Total Amount</span>
              <span className="text-sm font-bold text-gray-800">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={items.length === 0 || saving}
              className="flex-1 px-6 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
            <button
              onClick={handleClear}
              className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Keyboard shortcut badge */}
          <div className="flex justify-center pt-1">
            <span className="bg-blue-500 text-white text-xs font-medium px-4 py-1.5 rounded whitespace-nowrap">
              F1 – Save
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
