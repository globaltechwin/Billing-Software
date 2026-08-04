"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Loader2,
  Repeat,
} from "lucide-react";
import { ProductionMapping, Pagination, SelectProduct, SelectUnit } from "./data";

function SortIcon({ column, sortBy, sortOrder }: { column: string; sortBy: string; sortOrder: string }) {
  if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-60" />;
  return sortOrder === "asc" ? <ArrowUp className="w-3 h-3 inline-block ml-1" /> : <ArrowDown className="w-3 h-3 inline-block ml-1" />;
}

export default function ProductionMappingPage() {
  const router = useRouter();
  const [mappings, setMappings] = useState<ProductionMapping[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [products, setProducts] = useState<SelectProduct[]>([]);
  const [units, setUnits] = useState<SelectUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [mappingType, setMappingType] = useState("Production");
  const [itemId, setItemId] = useState<number | null>(null);
  const [itemNameSearch, setItemNameSearch] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
  const [productionNameSearch, setProductionNameSearch] = useState("");
  const [showProductionDropdown, setShowProductionDropdown] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showForm, setShowForm] = useState(true);
  const [showList, setShowList] = useState(true);

  const itemDropdownRef = useRef<HTMLDivElement>(null);
  const productionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(e.target as Node)) {
        setShowItemDropdown(false);
      }
      if (productionDropdownRef.current && !productionDropdownRef.current.contains(e.target as Node)) {
        setShowProductionDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayCost = quantity && purchasePrice ? (parseFloat(quantity) * parseFloat(purchasePrice)).toFixed(2) : "";

  const fetchMappings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(entriesPerPage),
        sortBy,
        sortOrder,
      });
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      const res = await fetch(`/api/production-mappings?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMappings(data.mappings || []);
        setPagination(data.pagination);
      }
    } catch {
      setMappings([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMappings();
  }, [fetchMappings]);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => {
      if (d.success && d.products) setProducts(d.products.map((p: SelectProduct) => ({ id: p.id, productName: p.productName, productCode: p.productCode })));
    }).catch(() => {});
    fetch("/api/units?activeOnly=true").then((r) => r.json()).then((d) => {
      if (d.success && d.units) setUnits(d.units.map((u: SelectUnit) => ({ id: u.id, unitName: u.unitName, shortName: u.shortName })));
    }).catch(() => {});
  }, []);

  const filteredItems = itemNameSearch
    ? products.filter((p) => p.productName.toLowerCase().includes(itemNameSearch.toLowerCase()))
    : products;

  const filteredProductionItems = productionNameSearch
    ? products.filter((p) => p.productName.toLowerCase().includes(productionNameSearch.toLowerCase()))
    : products;

  const handleClear = () => {
    setMappingType("Production");
    setItemId(null);
    setItemNameSearch("");
    setProductId(null);
    setProductionNameSearch("");
    setQuantity("");
    setUnit("");
    setPurchasePrice("");
    setEditId(null);
    setFormError("");
  };

  const handleEdit = (m: ProductionMapping) => {
    setEditId(m.id);
    setMappingType(m.mappingType);
    setItemId(m.itemId);
    setItemNameSearch(m.itemName);
    setProductId(m.productId);
    setProductionNameSearch(m.productName);
    setQuantity(m.quantity.toString());
    setUnit(m.unit);
    setPurchasePrice(m.purchasePrice.toString());
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!itemId) { setFormError("Item Name is required"); return; }
    if (!productId) { setFormError("Production Name is required"); return; }
    if (!quantity.trim() || parseFloat(quantity) <= 0) { setFormError("Quantity must be greater than zero"); return; }
    if (!unit) { setFormError("UOM is required"); return; }
    setFormError("");

    const payload = {
      mappingType,
      itemId,
      productId,
      quantity: parseFloat(quantity),
      unit,
      purchasePrice: parseFloat(purchasePrice) || 0,
      cost: (parseFloat(quantity) || 0) * (parseFloat(purchasePrice) || 0),
    };

    try {
      setSaving(true);
      const res = await fetch("/api/production-mappings", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { id: editId, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed to save"); return; }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      handleClear();
      setCurrentPage(1);
      fetchMappings();
    } catch {
      setFormError("Failed to save production mapping");
    } finally {
      setSaving(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else { setSortBy(column); setSortOrder("asc"); }
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * pagination.limit;

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Production mapping saved successfully!
        </div>
      )}

      {/* Product Mapping Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Product Mapping</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/master/production-conversion")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              <Repeat className="w-4 h-4" />
              Production Conversion
            </button>
            <button onClick={() => setShowForm(!showForm)} className="text-gray-500 hover:text-gray-700">
              {showForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {showForm && (
          <div className="p-6 space-y-4">
            <div className="space-y-4 max-w-4xl">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-2">
                  Mapping Type <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-6">
                  {["Production", "Recipes", "Modifier"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mappingType"
                        value={type}
                        checked={mappingType === type}
                        onChange={(e) => setMappingType(e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={itemDropdownRef}>
                  <div className="relative flex">
                    <input
                      type="text"
                      value={itemNameSearch}
                      onChange={(e) => { setItemNameSearch(e.target.value); setShowItemDropdown(true); setItemId(null); }}
                      onFocus={() => setShowItemDropdown(true)}
                      placeholder="Enter Product"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      className="ml-2 px-2 py-1 text-gray-500 hover:text-gray-700"
                      title="Edit Item"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  {showItemDropdown && filteredItems.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredItems.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setItemId(product.id);
                            setItemNameSearch(product.productName);
                            setShowItemDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          {product.productName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700 font-medium mb-1">
                      Production Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative" ref={productionDropdownRef}>
                      <input
                        type="text"
                        value={productionNameSearch}
                        onChange={(e) => { setProductionNameSearch(e.target.value); setShowProductionDropdown(true); setProductId(null); }}
                        onFocus={() => setShowProductionDropdown(true)}
                        placeholder="Enter Product"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {showProductionDropdown && filteredProductionItems.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredProductionItems.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                setProductId(product.id);
                                setProductionNameSearch(product.productName);
                                setShowProductionDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              {product.productName}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">Quantity</label>
                    <input
                      type="text"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Quantity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">UOM</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">UOM</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.shortName}>{u.shortName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">Purchase Price</label>
                    <input
                      type="text"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="Purchase Price"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">Cost</label>
                    <input
                      type="text"
                      value={displayCost}
                      readOnly
                      placeholder="Cost"
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-sm text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {formError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-2 max-w-4xl">
                {formError}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Mapping List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Product Mapping List</h2>
          <button onClick={() => setShowList(!showList)} className="text-gray-500 hover:text-gray-700">
            {showList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showList && (
          <>
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
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
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-16 cursor-pointer select-none" onClick={() => handleSort("id")}>
                      S.NO <SortIcon column="id" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-20 cursor-pointer select-none">
                      EDIT <SortIcon column="id" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none" onClick={() => handleSort("productName")}>
                      PRODUCT NAME <SortIcon column="productName" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-24 cursor-pointer select-none" onClick={() => handleSort("unit")}>
                      UOM <SortIcon column="unit" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none" onClick={() => handleSort("mappingType")}>
                      MAPPING TYPE <SortIcon column="mappingType" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin inline-block text-gray-400" />
                      </td>
                    </tr>
                  ) : mappings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    mappings.map((m, index) => (
                      <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleEdit(m)} className="text-blue-600 hover:text-blue-800">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{m.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{m.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{m.mappingType}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {pagination.total > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + entriesPerPage, pagination.total)} of {pagination.total} entries
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
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages || pagination.totalPages === 0}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
