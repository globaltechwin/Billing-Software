"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { IndentItem, departments } from "./data";

interface ApiProduct {
  id: number;
  productName: string;
  productCode: string;
  unit: string;
  currentStock: number;
  isActive: boolean;
}

interface Branch {
  id: number;
  branchName: string;
}

export default function IndentRequestPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Header fields
  const [indentId, setIndentId] = useState<number | null>(null);
  const [indentNo, setIndentNo] = useState("IND-000001 (Auto)");
  const [indentDate, setIndentDate] = useState(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  });
  const [branch, setBranch] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [requiredDate, setRequiredDate] = useState("");
  const [remarks, setRemarks] = useState("");

  // Branches from API
  const [branchesList, setBranchesList] = useState<Branch[]>([]);

  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productsList, setProductsList] = useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Items
  const [items, setItems] = useState<IndentItem[]>([]);

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
      .catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProductsList(data.products.filter((p: ApiProduct) => p.isActive));
        }
      })
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, []);

  // Fetch indent data when in edit mode
  useEffect(() => {
    if (!editId) return;
    setLoadingEdit(true);
    fetch("/api/indents")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.indents) {
          const indent = data.indents.find((r: Record<string, unknown>) => String(r.id) === editId);
          if (indent) {
            setIndentId(indent.id as number);
            setIndentNo(indent.indentNumber as string);
            setIndentDate(new Date(indent.indentDate as string).toISOString().split("T")[0]);
            setRequestedBy(indent.requestedBy as string);
            setDepartment(indent.department as string);
            setPriority(indent.priority as string);
            setRequiredDate(indent.requiredDate ? new Date(indent.requiredDate as string).toISOString().split("T")[0] : "");
            setRemarks((indent.remarks as string) || "");

            const itemsData = (indent.items as Record<string, unknown>[]) || [];
            const mappedItems: IndentItem[] = itemsData.map((item) => {
              const product = item.product as Record<string, unknown>;
              return {
                id: String(item.id),
                product: {
                  id: String(product.id),
                  name: product.productName as string,
                  uom: product.unit as string,
                  currentStock: Number(product.currentStock),
                },
                requiredQty: Number(item.requiredQty),
                remarks: (item.remarks as string) || "",
              };
            });
            setItems(mappedItems);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingEdit(false));
  }, [editId]);

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
      !items.some((i) => i.product.id === String(p.id))
  );

  // Select product and auto-add
  const handleProductSelect = (product: ApiProduct) => {
    const existing = items.find((i) => i.product.id === String(product.id));
    if (existing) return;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        product: {
          id: String(product.id),
          name: product.productName,
          uom: product.unit,
          currentStock: Number(product.currentStock),
        },
        requiredQty: 1,
        remarks: "",
      },
    ]);

    setProductSearch("");
    setShowProductDropdown(false);
  };

  // Handle quantity change
  const handleQtyChange = (itemId: string, newQty: string) => {
    const qty = parseFloat(newQty);
    if (newQty === "" || (!isNaN(qty) && qty >= 0)) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, requiredQty: newQty === "" ? 0 : qty }
            : item
        )
      );
    }
  };

  // Handle remarks change
  const handleRemarksChange = (itemId: string, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, remarks: value } : item
      )
    );
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Save
  const handleSave = async () => {
    if (items.length === 0) return;
    if (!requestedBy) {
      setSaveError("Requested By is required");
      return;
    }
    if (!department) {
      setSaveError("Department is required");
      return;
    }
    setSaving(true);
    setSaveError("");

    try {
      const payload = indentId
        ? {
            id: indentId,
            requestedBy,
            department,
            priority,
            requiredDate: requiredDate || null,
            remarks: remarks || null,
            items: items.map((item) => ({
              productId: Number(item.product.id),
              requiredQty: item.requiredQty,
              remarks: item.remarks || null,
            })),
          }
        : {
            requestedBy,
            department,
            priority,
            requiredDate: requiredDate || null,
            remarks: remarks || null,
            items: items.map((item) => ({
              productId: Number(item.product.id),
              requiredQty: item.requiredQty,
              remarks: item.remarks || null,
            })),
          };

      const res = await fetch("/api/indents", {
        method: indentId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save indent request");
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
    setIndentId(null);
    setIndentNo("IND-000001 (Auto)");
    setIndentDate(() => {
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${yyyy}-${mm}-${dd}`;
    });
    setBranch("");
    setRequestedBy("");
    setDepartment("");
    setPriority("MEDIUM");
    setRequiredDate("");
    setRemarks("");
    setItems([]);
    setProductSearch("");
    setSaveError("");
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

  // Totals
  const totalProducts = items.length;
  const totalQty = items.reduce((sum, i) => sum + i.requiredQty, 0);

  return (
    <div className="flex flex-col xl:flex-row gap-4 p-4 h-full">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {indentId ? "Indent request updated successfully!" : "Indent request saved successfully!"}
        </div>
      )}
      {saveError && (
        <div className="fixed top-20 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {saveError}
        </div>
      )}
      {loadingEdit && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading indent data...
        </div>
      )}

      {/* Left Panel - Main Content */}
      <div className="xl:flex-[7] flex flex-col gap-4">
        {/* Title Row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            {indentId ? "Edit Indent Request" : "Indent Request"}
          </h1>
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Header Fields */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            {/* Indent No. */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Indent No.<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={indentNo}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-500"
              />
            </div>
            {/* Indent Date */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Indent Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={indentDate}
                onChange={(e) => setIndentDate(e.target.value)}
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
            {/* Requested By */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Requested By<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                placeholder="Requested By"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            {/* Department */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Department<span className="text-red-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Department--</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            {/* Priority */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Priority<span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            {/* Required Date */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Required Date</label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Remarks */}
            <div>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold w-20">UOM</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">Cur. Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">Req. Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-48">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <span className="text-orange-500 text-sm">
                        There are no items [<span className="text-orange-500">Indent</span>]
                      </span>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
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
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        {item.product.currentStock.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.requiredQty || ""}
                          onChange={(e) => handleQtyChange(item.id, e.target.value)}
                          min="1"
                          className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.remarks || ""}
                          onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                          placeholder="Remarks"
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-6">
            <span className="text-gray-400 text-sm">-</span>
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Total Items: {totalProducts}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-700 ml-4">Total Qty: {totalQty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="xl:flex-[3] bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-fit">
        <div className="space-y-4">
          {/* Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Indent No.</span>
              <span className="text-sm font-medium text-gray-800">{indentNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Date</span>
              <span className="text-sm font-medium text-gray-800">
                {indentDate
                  ? new Date(indentDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Priority</span>
              <span className="text-sm font-medium text-gray-800">
                {priority === "LOW" ? "Low" : priority === "MEDIUM" ? "Medium" : priority === "HIGH" ? "High" : "Urgent"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Requested By</span>
              <span className="text-sm font-medium text-gray-800">{requestedBy || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Department</span>
              <span className="text-sm font-medium text-gray-800">{department || "-"}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Products</span>
              <span className="text-sm font-medium text-gray-800">{totalProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Requested Qty</span>
              <span className="text-sm font-medium text-gray-800">{totalQty}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={items.length === 0 || saving || loadingEdit}
              className="flex-1 px-6 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {indentId ? "Update" : "Save"}
            </button>
            <button
              onClick={handleClear}
              className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Keyboard shortcut badge */}
          <div className="flex justify-center pt-1">
            <span className="bg-blue-500 text-white text-xs font-medium px-4 py-1.5 rounded whitespace-nowrap">
              F1 – {indentId ? "Update" : "Save"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
