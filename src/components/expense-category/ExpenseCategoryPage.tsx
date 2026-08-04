"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { ExpenseCategory } from "./data";

export default function ExpenseCategoryPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const [showExpenseCategory, setShowExpenseCategory] = useState(true);
  const [showExpenseCategoryList, setShowExpenseCategoryList] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [formError, setFormError] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/expense-categories");
      const data = await res.json();
      if (data.success && data.categories) {
        const formatted = data.categories.map((c: Record<string, unknown>) => ({
          id: c.id,
          categoryName: c.categoryName,
          displayOrder: c.displayOrder,
          isActive: c.isActive,
          createdByUserId: c.createdByUserId,
          createdByName: (c.createdByUser as Record<string, unknown>)?.name || "",
          createdAt: c.createdAt,
        }));
        setCategories(formatted);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((c) => {
    const matchesStatus = !statusFilter ||
      (statusFilter === "active" && c.isActive) ||
      (statusFilter === "inactive" && !c.isActive);
    const matchesSearch = !searchQuery ||
      c.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredCategories.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + entriesPerPage);

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      setFormError("Category Name is required");
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        categoryName: categoryName.trim(),
        displayOrder: parseInt(displayOrder) || 0,
      };

      if (editId) {
        body.id = editId;
        const res = await fetch("/api/expense-categories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update expense category");
        showSuccessToast("Expense category updated successfully!");
      } else {
        const res = await fetch("/api/expense-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create expense category");
        showSuccessToast("Expense category saved successfully!");
      }

      handleClear();
      fetchCategories();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setCategoryName("");
    setDisplayOrder("");
    setEditId(null);
    setFormError("");
  };

  const handleEdit = (category: ExpenseCategory) => {
    setCategoryName(category.categoryName);
    setDisplayOrder(category.displayOrder.toString());
    setEditId(category.id);
    setShowExpenseCategory(true);
  };

  const handleToggleStatus = async (category: ExpenseCategory) => {
    try {
      const res = await fetch("/api/expense-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: category.id, isActive: !category.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      showSuccessToast(`Expense category ${category.isActive ? "deactivated" : "activated"} successfully!`);
      fetchCategories();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/expense-categories?id=${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete expense category");
      showSuccessToast("Expense category deleted successfully!");
      setDeleteConfirm(null);
      fetchCategories();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {successMessage}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">{deleteConfirm.name}</span>?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Category Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Expense Category</h2>
          <button
            onClick={() => setShowExpenseCategory(!showExpenseCategory)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showExpenseCategory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showExpenseCategory && (
          <div className="p-6 space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-6 max-w-3xl">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Salary"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId ? "Update" : "Save"}
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

      {/* Expense Category List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Expense Category List</h2>
          <button
            onClick={() => setShowExpenseCategoryList(!showExpenseCategoryList)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showExpenseCategoryList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showExpenseCategoryList && (
          <>
            {/* Table Controls */}
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
                <div className="flex items-center gap-2 ml-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-16">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-32">ACTIONS</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CATEGORY NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">DISPLAY ORDER</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">STATUS</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED BY</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading expense categories...
                        </div>
                      </td>
                    </tr>
                  ) : paginatedCategories.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    paginatedCategories.map((category, index) => (
                      <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(category)}
                              className={`text-xs font-medium px-2 py-0.5 rounded ${
                                category.isActive
                                  ? "text-emerald-700 hover:bg-emerald-50"
                                  : "text-red-700 hover:bg-red-50"
                              }`}
                              title={category.isActive ? "Deactivate" : "Activate"}
                            >
                              {category.isActive ? "Active" : "Inactive"}
                            </button>
                            <button
                              onClick={() => handleDeleteClick(category.id, category.categoryName)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{category.categoryName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{category.displayOrder}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            category.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}>
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{category.createdByName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(category.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredCategories.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + entriesPerPage, filteredCategories.length)} of{" "}
                {filteredCategories.length} entries
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
          </>
        )}
      </div>
    </div>
  );
}
