"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

interface CashCategory {
  id: string;
  sNo: number;
  categoryId: string;
  categoryName: string;
  categoryType: "Cash In" | "Cash Out";
  displayOrder: number;
  status: "Active" | "Inactive";
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CashCategoryPage() {
  const [categories, setCategories] = useState<CashCategory[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);

  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", "50");
    fetch(`/api/cash-category?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setCategories(json.categories);
          setPagination(json.pagination);
        }
      })
      .catch(e => console.error("Failed to fetch categories:", e));
  }, []);

  const fetchCategories = (page: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(entriesPerPage));
    if (searchQuery) params.set("search", searchQuery);
    fetch(`/api/cash-category?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setCategories(json.categories);
          setPagination(json.pagination);
        }
      })
      .catch(e => console.error("Failed to fetch categories:", e))
      .finally(() => setLoading(false));
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      alert("Category Name is required.");
      return;
    }
    if (!categoryType) {
      alert("Category Type is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        categoryName: categoryName.trim(),
        categoryType,
        displayOrder: Number(displayOrder) || 0,
      };

      if (editId) {
        await fetch("/api/cash-category", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...payload }),
        });
      } else {
        await fetch("/api/cash-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setCategoryName("");
      setCategoryType("");
      setDisplayOrder("");
      setEditId(null);
      fetchCategories(1);
    } catch (e) {
      console.error("Failed to save category:", e);
      alert("Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setCategoryName("");
    setCategoryType("");
    setDisplayOrder("");
    setEditId(null);
  };

  const handleEdit = (cat: CashCategory) => {
    setCategoryName(cat.categoryName);
    setCategoryType(cat.categoryType);
    setDisplayOrder(String(cat.displayOrder));
    setEditId(cat.id);
    setFormCollapsed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/cash-category?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchCategories(currentPage);
      } else {
        alert(json.error || "Failed to delete category.");
      }
    } catch (e) {
      console.error("Failed to delete category:", e);
      alert("Failed to delete category.");
    }
  };

  const totalPages = pagination.totalPages || 1;
  const start = (pagination.page - 1) * pagination.limit;

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Cash Flow Category Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Cash Flow Category</h2>
          <button onClick={() => setFormCollapsed(!formCollapsed)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
            <ChevronUp size={18} className={`transition-transform ${formCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        {!formCollapsed && (
          <div className="px-6 py-6">
            <div className="max-w-3xl">
              {/* Category Name */}
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[140px] text-right">Category Name*</label>
                <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-[420px]" />
              </div>

              {/* Category Type */}
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[140px] text-right">Category Type*</label>
                <select value={categoryType} onChange={e => setCategoryType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-[280px]">
                  <option value="">--Select Type--</option>
                  <option value="Cash In">Cash In</option>
                  <option value="Cash Out">Cash Out</option>
                </select>
              </div>

              {/* Display Order */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700 w-[140px] text-right">Display Order*</label>
                <input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[140px]" />
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3 md:ml-[140px]">
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#4caf85] text-white rounded-full text-sm font-medium hover:bg-[#3d9a7e] disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
                <button onClick={handleClear} className="px-6 py-2 bg-purple-500 text-white rounded-full text-sm font-medium hover:bg-purple-600">Clear</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cash Flow Category List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Cash Flow Category List</h2>
          <button onClick={() => setListCollapsed(!listCollapsed)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
            <ChevronUp size={18} className={`transition-transform ${listCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        {!listCollapsed && (
          <>
            <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select value={entriesPerPage} onChange={e => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 border border-gray-300 rounded-md text-sm">
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Search:</span>
                <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    {["S.NO", "EDIT", "DELETE", "CATEGORYID", "CATEGORYNAME", "CATEGORYTYPE", "DISPLAYORDER", "STATUS"].map(h => (
                      <th key={h} className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">{h} {h !== "EDIT" && h !== "DELETE" ? "↕" : ""}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">Loading...</td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No data available in table</td>
                    </tr>
                  ) : (
                    categories.map((r) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm text-center">{start + r.sNo}</td>
                        <td className="px-3 py-3 text-center">
                          <button onClick={() => handleEdit(r)} className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200">Edit</button>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button onClick={() => handleDelete(r.id)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>
                        </td>
                        <td className="px-3 py-3 text-sm text-center font-medium">{r.categoryId}</td>
                        <td className="px-3 py-3 text-sm text-center">{r.categoryName}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${r.categoryType === "Cash In" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>{r.categoryType}</span>
                        </td>
                        <td className="px-3 py-3 text-sm text-center">{r.displayOrder}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${r.status === "Active" ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`}>{r.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-gray-600">Showing {categories.length > 0 ? start + 1 : 0} to {Math.min(start + entriesPerPage, pagination.total)} of {pagination.total} entries</span>
              <div className="flex items-center gap-1">
                <button onClick={() => { const np = Math.max(1, currentPage - 1); setCurrentPage(np); fetchCategories(np); }} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Previous</button>
                <button onClick={() => { const np = Math.min(totalPages, currentPage + 1); setCurrentPage(np); fetchCategories(np); }} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}