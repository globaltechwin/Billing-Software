"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { AuditItem } from "./data";

interface ApiProduct {
  id: number;
  productName: string;
  productCode: string;
  unit: string;
  currentStock: number;
  purchasePrice: number;
}

interface Branch {
  id: number;
  branchName: string;
}

export default function StockAuditPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);

  // Header fields
  const [auditNo, setAuditNo] = useState("SA-000001 (Auto)");
  const [auditDate, setAuditDate] = useState(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  });
  const [branch, setBranch] = useState("");
  const [auditType, setAuditType] = useState("FULL");
  const [auditor, setAuditor] = useState("");
  const [remarks, setRemarks] = useState("");

  // Branches from API
  const [branchesList, setBranchesList] = useState<Branch[]>([]);

  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productsList, setProductsList] = useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Audit items
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);

  // Refs
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  // Fetch branches
  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.company) {
          setBranchesList(data.company.branches || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch products
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProductsList(data.products);
        }
      })
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(e.target as Node)
      ) {
        setShowProductDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter products (exclude already added)
  const filteredProducts = productsList.filter(
    (p) =>
      p.productName.toLowerCase().includes(productSearch.toLowerCase()) &&
      !auditItems.some((i) => i.productId === p.id)
  );

  // Select product and auto-add
  const handleProductSelect = (product: ApiProduct) => {
    const existing = auditItems.find((i) => i.productId === product.id);
    if (existing) return;

    setAuditItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        productId: product.id,
        prodCode: product.productCode || "",
        prodName: product.productName,
        unit: product.unit,
        currentStock: Number(product.currentStock),
        physicalStock: "",
        remarks: "",
      },
    ]);

    setProductSearch("");
    setShowProductDropdown(false);
  };

  // Update physical stock
  const handlePhysicalStockChange = (id: string, value: string) => {
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setAuditItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, physicalStock: value } : item
        )
      );
    }
  };

  // Update remarks
  const handleRemarksChange = (id: string, value: string) => {
    setAuditItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, remarks: value } : item))
    );
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setAuditItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Calculate difference
  const getDifference = (item: AuditItem) => {
    if (item.physicalStock === "") return null;
    return Number(item.physicalStock) - item.currentStock;
  };

  // Totals
  const totalProducts = auditItems.length;
  const totalDifference = auditItems.reduce((sum, item) => {
    const diff = getDifference(item);
    return sum + (diff !== null ? diff : 0);
  }, 0);

  // Save
  const handleSave = async () => {
    if (auditItems.length === 0) return;
    setSaving(true);
    setSaveError("");

    try {
      const payload = {
        auditType,
        auditor,
        remarks: remarks || null,
        auditDate,
        items: auditItems.map((item) => ({
          productId: item.productId,
          physicalStock: item.physicalStock === "" ? item.currentStock : Number(item.physicalStock),
          remarks: item.remarks || null,
        })),
      };

      const res = await fetch("/api/stock-audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save stock audit");
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
    setAuditNo("SA-000001 (Auto)");
    setAuditDate(() => {
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${yyyy}-${mm}-${dd}`;
    });
    setBranch("");
    setAuditType("FULL");
    setAuditor("");
    setRemarks("");
    setAuditItems([]);
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

  return (
    <div className="flex flex-col xl:flex-row gap-4 p-4 h-full">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Stock Audit saved successfully!
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
          <h1 className="text-lg font-semibold text-gray-800">Stock Audit</h1>
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Header Fields */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            {/* Audit No. */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Audit No.<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={auditNo}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-500"
              />
            </div>
            {/* Date */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Audit Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Branch */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Branch--</option>
                {branchesList.map((b) => (
                  <option key={b.id} value={b.id}>{b.branchName}</option>
                ))}
              </select>
            </div>
            {/* Audit Type */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Audit Type<span className="text-red-500">*</span>
              </label>
              <select
                value={auditType}
                onChange={(e) => setAuditType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="FULL">Full</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            {/* Auditor */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Auditor<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={auditor}
                onChange={(e) => setAuditor(e.target.value)}
                placeholder="Auditor Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Remarks */}
            <div className="col-span-3">
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
              placeholder="Search Product to add"
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
                      <span className="text-gray-700">{product.productName}</span>
                      <span className="text-xs text-gray-400">
                        {product.unit} | Stock: {Number(product.currentStock).toFixed(2)}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold w-24">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-20">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">System Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">Physical Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">Difference</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-32">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {auditItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <span className="text-orange-500 text-sm">
                        There are no items [<span className="text-orange-500">Stock Audit</span>]
                      </span>
                    </td>
                  </tr>
                ) : (
                  auditItems.map((item, index) => {
                    const diff = getDifference(item);
                    const isExcess = diff !== null && diff > 0;
                    const isShortage = diff !== null && diff < 0;
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
                        <td className="px-4 py-3 text-sm text-gray-700">{item.prodName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.prodCode || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                          {item.currentStock.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.physicalStock}
                            onChange={(e) => handlePhysicalStockChange(item.id, e.target.value)}
                            placeholder="0"
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {diff !== null ? (
                            <span
                              className={
                                isExcess
                                  ? "text-emerald-600"
                                  : isShortage
                                  ? "text-red-600"
                                  : "text-gray-700"
                              }
                            >
                              {diff > 0 ? "+" : ""}
                              {diff.toFixed(2)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
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
              <span className="text-sm text-gray-600">Audit No.</span>
              <span className="text-sm font-medium text-gray-800">{auditNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Date</span>
              <span className="text-sm font-medium text-gray-800">
                {auditDate
                  ? new Date(auditDate).toLocaleDateString("en-IN", {
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
                {auditType === "FULL" ? "Full" : "Partial"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Auditor</span>
              <span className="text-sm font-medium text-gray-800">{auditor || "-"}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Products</span>
              <span className="text-sm font-medium text-gray-800">{totalProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Difference</span>
              <span
                className={`text-sm font-medium ${
                  totalDifference > 0
                    ? "text-emerald-600"
                    : totalDifference < 0
                    ? "text-red-600"
                    : "text-gray-700"
                }`}
              >
                {totalDifference > 0 ? "+" : ""}
                {totalDifference.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={auditItems.length === 0 || saving}
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
