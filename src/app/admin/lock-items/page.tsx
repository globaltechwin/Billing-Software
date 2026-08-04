"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";

interface ProductLock {
  id: number;
  productName: string;
  productCode: string;
  category: string;
  billLock: boolean;
  onlineLock: boolean;
}

export default function LockItemsPage() {
  const [products, setProducts] = useState<ProductLock[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [lockStatus, setLockStatus] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (searchQuery) params.set("search", searchQuery);
    if (lockStatus) params.set("lockStatus", lockStatus);
    if (category) params.set("category", category);
    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);
    return fetch(`/api/lock-items?${params}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()));
  }, [page, limit, searchQuery, lockStatus, category, sortBy, sortDir]);

  useEffect(() => {
    fetchProducts()
      .then((d) => {
        setProducts(d.products || []);
        setCategories(d.categories || []);
        setTotal(d.pagination.total);
        setTotalPages(d.pagination.totalPages);
      })
      .catch(() => { setProducts([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [fetchProducts]);

  const handleToggle = useCallback(async (id: number, lockType: "billLock" | "onlineLock") => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [lockType]: !p[lockType] } : p))
    );
    try {
      const res = await fetch("/api/lock-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, lockType }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [lockType]: !p[lockType] } : p))
      );
    }
  }, []);

  const handleSort = useCallback((field: string) => {
    setSortBy((prev) => {
      if (prev === field) { setSortDir((d) => (d === "asc" ? "desc" : "asc")); return field; }
      setSortDir("asc");
      return field;
    });
  }, []);

  const handleClear = useCallback(() => {
    setLockStatus("");
    setCategory("");
    setSearchQuery("");
    setPage(1);
  }, []);

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Billing Item Lock/Unlock</h2>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Lock Status</label>
              <select
                value={lockStatus}
                onChange={(e) => { setLockStatus(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 min-w-[140px]"
              >
                <option value="">All</option>
                <option value="bill_locked">Bill Locked</option>
                <option value="online_locked">Online Locked</option>
                <option value="locked">Any Locked</option>
                <option value="unlocked">All Unlocked</option>
              </select>
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Category</label>
              <div className="relative flex-1">
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 pr-8"
                >
                  <option value="">--All Categories--</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {category && (
                  <button
                    onClick={() => { setCategory(""); setPage(1); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={handleClear}
              className="px-5 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4">
          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">PDF</button>
              <button className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">Excel</button>
              <div className="relative ml-0 sm:ml-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search:"
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-56"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-[#1a8a7d] text-white">
                  <th className="px-4 py-2.5 text-left font-medium">
                    <button onClick={() => handleSort("id")} className="flex items-center gap-1">
                      S.NO
                      <span className="text-[10px] opacity-70">↕</span>
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-center font-medium">BILL LOCK</th>
                  <th className="px-4 py-2.5 text-center font-medium">ONLINE LOCK</th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    <button onClick={() => handleSort("category")} className="flex items-center gap-1">
                      CATEGORY
                      <span className="text-[10px] opacity-70">↕</span>
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    <button onClick={() => handleSort("productCode")} className="flex items-center gap-1">
                      PRODUCT CODE
                      <span className="text-[10px] opacity-70">↕</span>
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    <button onClick={() => handleSort("productName")} className="flex items-center gap-1">
                      PRODUCT NAME
                      <span className="text-[10px] opacity-70">↕</span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400 italic">No data available in table</td></tr>
                ) : (
                  products.map((p, idx) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-600">{from + idx}</td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => handleToggle(p.id, "billLock")}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            p.billLock ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            p.billLock ? "translate-x-4.5" : "translate-x-0.5"
                          }`} />
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => handleToggle(p.id, "onlineLock")}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            p.onlineLock ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            p.onlineLock ? "translate-x-4.5" : "translate-x-0.5"
                          }`} />
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">{p.category || "-"}</td>
                      <td className="px-4 py-2.5 text-gray-700">{p.productCode || "-"}</td>
                      <td className="px-4 py-2.5 text-gray-800 font-medium">{p.productName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-500">Showing {from} to {to} of {total} entries</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
