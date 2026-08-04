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
  ArrowLeft,
} from "lucide-react";
import { ProductionConversion, Pagination, SelectProduct, SelectUnit } from "../production-mapping/data";

function SortIcon({ column, sortBy, sortOrder }: { column: string; sortBy: string; sortOrder: string }) {
  if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-60" />;
  return sortOrder === "asc" ? <ArrowUp className="w-3 h-3 inline-block ml-1" /> : <ArrowDown className="w-3 h-3 inline-block ml-1" />;
}

export default function ProductionConversionPage() {
  const router = useRouter();
  const [conversions, setConversions] = useState<ProductionConversion[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [products, setProducts] = useState<SelectProduct[]>([]);
  const [units, setUnits] = useState<SelectUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [productId, setProductId] = useState<number | null>(null);
  const [productNameSearch, setProductNameSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [baseQty, setBaseQty] = useState("");
  const [baseUnit, setBaseUnit] = useState("");
  const [portionQty, setPortionQty] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showForm, setShowForm] = useState(true);
  const [showList, setShowList] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchConversions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(entriesPerPage),
        sortBy,
        sortOrder,
      });
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      const res = await fetch(`/api/production-conversions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setConversions(data.conversions || []);
        setPagination(data.pagination);
      }
    } catch {
      setConversions([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversions();
  }, [fetchConversions]);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => {
      if (d.success && d.products) setProducts(d.products.map((p: SelectProduct) => ({ id: p.id, productName: p.productName, productCode: p.productCode })));
    }).catch(() => {});
    fetch("/api/units?activeOnly=true").then((r) => r.json()).then((d) => {
      if (d.success && d.units) setUnits(d.units.map((u: SelectUnit) => ({ id: u.id, unitName: u.unitName, shortName: u.shortName })));
    }).catch(() => {});
  }, []);

  const filteredProducts = productNameSearch
    ? products.filter((p) => p.productName.toLowerCase().includes(productNameSearch.toLowerCase()))
    : products;

  const handleClear = () => {
    setProductId(null);
    setProductNameSearch("");
    setBaseQty("");
    setBaseUnit("");
    setPortionQty("");
    setEditId(null);
    setFormError("");
  };

  const handleEdit = (c: ProductionConversion) => {
    setEditId(c.id);
    setProductId(c.productId);
    setProductNameSearch(c.productName);
    setBaseQty(c.baseQty.toString());
    setBaseUnit(c.baseUnit);
    setPortionQty(c.portionQty.toString());
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!productId) { setFormError("Product is required"); return; }
    if (!baseQty.trim() || parseFloat(baseQty) <= 0) { setFormError("Base Quantity must be greater than zero"); return; }
    if (!baseUnit) { setFormError("Base Unit is required"); return; }
    if (!portionQty.trim() || parseFloat(portionQty) <= 0) { setFormError("Portion Quantity must be greater than zero"); return; }
    setFormError("");

    const payload = {
      productId,
      baseQty: parseFloat(baseQty),
      baseUnit,
      portionQty: parseFloat(portionQty),
    };

    try {
      setSaving(true);
      const res = await fetch("/api/production-conversions", {
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
      fetchConversions();
    } catch {
      setFormError("Failed to save production conversion");
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
          Production conversion saved successfully!
        </div>
      )}

      {/* Production Conversion Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-gray-800">Production Conversion</h2>
            <span className="text-sm text-gray-500">Portion factor used when Production-In / Out moves stock</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/master/production-mapping")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Product Mapping
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
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Product <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    value={productNameSearch}
                    onChange={(e) => { setProductNameSearch(e.target.value); setShowDropdown(true); setProductId(null); }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Enter Product"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {showDropdown && filteredProducts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setProductId(product.id);
                            setProductNameSearch(product.productName);
                            setShowDropdown(false);
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

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">
                    Base Qty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={baseQty}
                    onChange={(e) => setBaseQty(e.target.value)}
                    placeholder="Base Qty"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Unit</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.shortName}>{u.shortName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">
                    Portion Qty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={portionQty}
                    onChange={(e) => setPortionQty(e.target.value)}
                    placeholder="Portion Qty"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div />
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

      {/* Conversion List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-800">Conversion List</h2>
            <span className="text-sm text-gray-500">Products not listed here move stock 1:1</span>
          </div>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold w-24 cursor-pointer select-none" onClick={() => handleSort("baseUnit")}>
                      BASE UNIT <SortIcon column="baseUnit" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none">
                      BASE QTY
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none">
                      PORTION QTY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin inline-block text-gray-400" />
                      </td>
                    </tr>
                  ) : conversions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    conversions.map((c, index) => (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{c.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{c.baseUnit}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{c.baseQty}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{c.portionQty}</td>
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
