"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit3, DollarSign, RefreshCw, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { ProductRecord, GSTRate, BulkUpdateFields } from "./data";
import { productCategories } from "@/components/product/data";

interface UnitApi {
  id: number;
  unitName: string;
  shortName: string;
}

export default function BulkProductEditPage() {
  const [activeTab, setActiveTab] = useState<"product-edit" | "order-type" | "stock-revision">("product-edit");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Data
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [gstRates, setGstRates] = useState<GSTRate[]>([]);
  const [unitsList, setUnitsList] = useState<UnitApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Selection
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [taxGroupFilter, setTaxGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Bulk edit fields
  const [editSellingPrice, setEditSellingPrice] = useState("");
  const [editPurchasePrice, setEditPurchasePrice] = useState("");
  const [editGstMasterId, setEditGstMasterId] = useState<number | "">("");
  const [editCategory, setEditCategory] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editBarcode, setEditBarcode] = useState("");
  const [editReorderLevel, setEditReorderLevel] = useState("");
  const [editIsActive, setEditIsActive] = useState<"active" | "inactive" | "">("");
  const [enableSellingPrice, setEnableSellingPrice] = useState(false);
  const [enablePurchasePrice, setEnablePurchasePrice] = useState(false);
  const [enableGstMasterId, setEnableGstMasterId] = useState(false);
  const [enableCategory, setEnableCategory] = useState(false);
  const [enableUnit, setEnableUnit] = useState(false);
  const [enableBarcode, setEnableBarcode] = useState(false);
  const [enableReorderLevel, setEnableReorderLevel] = useState(false);
  const [enableIsActive, setEnableIsActive] = useState(false);

  // Order Type tab state
  const [otCategory, setOtCategory] = useState("--Select--");

  // Stock Price Revision tab state
  const [srStartDate, setSrStartDate] = useState("");
  const [srEndDate, setSrEndDate] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGstRates = useCallback(async () => {
    try {
      const res = await fetch("/api/gst-rates");
      const data = await res.json();
      if (data.success && data.rates) {
        setGstRates(data.rates);
      }
    } catch {
      // silently fail
    }
  }, []);

  const fetchUnits = useCallback(async () => {
    try {
      const res = await fetch("/api/units?activeOnly=true");
      const data = await res.json();
      if (data.success && data.units) {
        setUnitsList(data.units);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    fetchGstRates();
    fetchUnits();
  }, [fetchProducts, fetchGstRates, fetchUnits]);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    const matchesUnit = !unitFilter || p.unit === unitFilter;
    const matchesTaxGroup = !taxGroupFilter || (p.gstMaster && p.gstMaster.name === taxGroupFilter);
    const matchesStatus = !statusFilter ||
      (statusFilter === "active" && p.isActive) ||
      (statusFilter === "inactive" && !p.isActive);
    const matchesSearch = !searchQuery ||
      p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.productCode && p.productCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesUnit && matchesTaxGroup && matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + entriesPerPage);

  const allSelected = paginatedProducts.length > 0 && paginatedProducts.every((r) => selectedRows.has(r.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedProducts.map((r) => r.id)));
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClearFilters = () => {
    setCategoryFilter("");
    setUnitFilter("");
    setTaxGroupFilter("");
    setStatusFilter("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleClearEditFields = () => {
    setEditSellingPrice("");
    setEditPurchasePrice("");
    setEditGstMasterId("");
    setEditCategory("");
    setEditUnit("");
    setEditBarcode("");
    setEditReorderLevel("");
    setEditIsActive("");
    setEnableSellingPrice(false);
    setEnablePurchasePrice(false);
    setEnableGstMasterId(false);
    setEnableCategory(false);
    setEnableUnit(false);
    setEnableBarcode(false);
    setEnableReorderLevel(false);
    setEnableIsActive(false);
  };

  const handleBulkUpdate = async () => {
    if (selectedRows.size === 0) {
      setSuccessMessage("Please select at least one product");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      return;
    }

    const updates: BulkUpdateFields = {};
    if (enableSellingPrice && editSellingPrice) updates.sellingPrice = parseFloat(editSellingPrice);
    if (enablePurchasePrice && editPurchasePrice) updates.purchasePrice = parseFloat(editPurchasePrice);
    if (enableGstMasterId && editGstMasterId) updates.gstMasterId = Number(editGstMasterId);
    if (enableCategory && editCategory) updates.category = editCategory;
    if (enableUnit && editUnit) updates.unit = editUnit;
    if (enableBarcode) updates.barcode = editBarcode || null;
    if (enableReorderLevel && editReorderLevel) updates.reorderLevel = parseFloat(editReorderLevel);
    if (enableIsActive && editIsActive) updates.isActive = editIsActive === "active";

    if (Object.keys(updates).length === 0) {
      setSuccessMessage("Please enable at least one field to update");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: Array.from(selectedRows),
          updates,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update products");

      setSuccessMessage(data.message || "Products updated successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setSelectedRows(new Set());
      handleClearEditFields();
      fetchProducts();
    } catch (err: unknown) {
      setSuccessMessage(err instanceof Error ? err.message : "Something went wrong");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setActiveTab("product-edit")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === "product-edit"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Product Edit
        </button>
        <button
          onClick={() => setActiveTab("order-type")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === "order-type"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Order Type Price
        </button>
        <button
          onClick={() => setActiveTab("stock-revision")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === "stock-revision"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Stock Price Revision
        </button>
      </div>

      {/* Product Edit Tab */}
      {activeTab === "product-edit" && (
        <>
          {/* Filters Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Filters</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            {showFilters && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Categories</option>
                      {productCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">Unit</label>
                    <select
                      value={unitFilter}
                      onChange={(e) => { setUnitFilter(e.target.value); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Units</option>
                      {unitsList.map((u) => (
                        <option key={u.id} value={u.shortName}>{u.shortName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">Tax Group</label>
                    <select
                      value={taxGroupFilter}
                      onChange={(e) => { setTaxGroupFilter(e.target.value); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Tax Groups</option>
                      {gstRates.map((t) => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">Search</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      placeholder="Search by name, code, or barcode..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Edit Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 bg-[#f2f5f9] border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">
                Bulk Edit — {selectedRows.size} product(s) selected
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {/* Selling Price */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableSellingPrice}
                    onChange={(e) => setEnableSellingPrice(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="block text-sm text-gray-700 font-medium mb-1">Selling Price</label>
                    <input
                      type="number"
                      value={editSellingPrice}
                      onChange={(e) => setEditSellingPrice(e.target.value)}
                      disabled={!enableSellingPrice}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Purchase Price */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enablePurchasePrice}
                    onChange={(e) => setEnablePurchasePrice(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="block text-sm text-gray-700 font-medium mb-1">Purchase Price</label>
                    <input
                      type="number"
                      value={editPurchasePrice}
                      onChange={(e) => setEditPurchasePrice(e.target.value)}
                      disabled={!enablePurchasePrice}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Tax Group */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableGstMasterId}
                    onChange={(e) => setEnableGstMasterId(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="block text-sm text-gray-700 font-medium mb-1">Tax Group</label>
                    <select
                      value={editGstMasterId}
                      onChange={(e) => setEditGstMasterId(e.target.value ? Number(e.target.value) : "")}
                      disabled={!enableGstMasterId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select</option>
                      {gstRates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableCategory}
                    onChange={(e) => setEnableCategory(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="block text-sm text-gray-700 font-medium mb-1">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      disabled={!enableCategory}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select</option>
                      {productCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Unit */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableUnit}
                    onChange={(e) => setEnableUnit(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="block text-sm text-gray-700 font-medium mb-1">Unit</label>
                    <select
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      disabled={!enableUnit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select</option>
                      {unitsList.map((u) => (
                        <option key={u.id} value={u.shortName}>{u.shortName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Barcode */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableBarcode}
                    onChange={(e) => setEnableBarcode(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="block text-sm text-gray-700 font-medium mb-1">Barcode</label>
                    <input
                      type="text"
                      value={editBarcode}
                      onChange={(e) => setEditBarcode(e.target.value)}
                      disabled={!enableBarcode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Reorder Level */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableReorderLevel}
                    onChange={(e) => setEnableReorderLevel(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="block text-sm text-gray-700 font-medium mb-1">Reorder Level</label>
                    <input
                      type="number"
                      value={editReorderLevel}
                      onChange={(e) => setEditReorderLevel(e.target.value)}
                      disabled={!enableReorderLevel}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableIsActive}
                    onChange={(e) => setEnableIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="block text-sm text-gray-700 font-medium mb-1">Status</label>
                    <select
                      value={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.value as "" | "active" | "inactive")}
                      disabled={!enableIsActive}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleBulkUpdate}
                  disabled={saving || selectedRows.size === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Updating..." : `Update ${selectedRows.size} Product(s)`}
                </button>
                <button
                  onClick={handleClearEditFields}
                  className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors"
                >
                  Clear Fields
                </button>
              </div>
            </div>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">entries</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Search:</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-3 py-3 text-center text-xs font-semibold w-[50px]">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-12">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CODE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CATEGORY</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">SELLING PRICE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">PURCHASE PRICE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">TAX GROUP</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">UOM</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">STOCK</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading products...
                        </div>
                      </td>
                    </tr>
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((product, index) => (
                      <tr
                        key={product.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          selectedRows.has(product.id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(product.id)}
                            onChange={() => handleSelectRow(product.id)}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{product.productCode || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{product.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{product.category || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{Number(product.sellingPrice).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{Number(product.purchasePrice).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{product.gstMaster?.name || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{product.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{Number(product.currentStock).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}>
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + entriesPerPage, filteredProducts.length)} of {filteredProducts.length} entries
                {selectedRows.size > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">({selectedRows.size} selected)</span>
                )}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 font-medium">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order Type Price Tab */}
      {activeTab === "order-type" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Type Price</h2>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                  Product Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={otCategory}
                  onChange={(e) => setOtCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                >
                  <option value="--Select--">--Select--</option>
                  {productCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setSuccessMessage("Order type price saved successfully!");
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 2000);
                }}
                className="flex items-center gap-1.5 px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Price Revision Tab */}
      {activeTab === "stock-revision" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Stock Price Revision</h2>
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="date"
                value={srStartDate}
                onChange={(e) => setSrStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="date"
                value={srEndDate}
                onChange={(e) => setSrEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => {
                  setSuccessMessage("Stock revision completed successfully!");
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 2000);
                }}
                className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Stock Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
