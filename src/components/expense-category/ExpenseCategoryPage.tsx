"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { sampleExpenseCategories, ExpenseCategory } from "./data";

export default function ExpenseCategoryPage() {
  const [categoryName, setCategoryName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [categories, setCategories] = useState<ExpenseCategory[]>(sampleExpenseCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExpenseCategory, setShowExpenseCategory] = useState(true);
  const [showExpenseCategoryList, setShowExpenseCategoryList] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const filteredCategories = searchQuery
    ? categories.filter((c) =>
        c.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  const totalPages = Math.ceil(filteredCategories.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + entriesPerPage);

  const handleSave = () => {
    if (!categoryName.trim()) return;
    const order = parseInt(displayOrder) || 1;

    if (editId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editId ? { ...c, categoryName: categoryName.trim(), displayOrder: order } : c
        )
      );
    } else {
      const newCategoryId = categories.length > 0 ? Math.max(...categories.map((c) => c.categoryId)) + 1 : 1;
      const newCategory: ExpenseCategory = {
        id: Date.now().toString(),
        categoryId: newCategoryId,
        categoryName: categoryName.trim(),
        displayOrder: order,
        createdBy: "demo1",
        createdDate: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      };
      setCategories((prev) => [...prev, newCategory]);
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    handleClear();
  };

  const handleClear = () => {
    setCategoryName("");
    setDisplayOrder("");
    setEditId(null);
  };

  const handleEdit = (category: ExpenseCategory) => {
    setCategoryName(category.categoryName);
    setDisplayOrder(category.displayOrder.toString());
    setEditId(category.id);
    setShowExpenseCategory(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Expense Category saved successfully!
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
            <div className="grid grid-cols-2 gap-6 max-w-3xl">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Display Order <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
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
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-16">S.NO</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-24">EDIT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-24">DELETE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CATEGORY ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CATEGORY NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">DISPLAY ORDER</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED BY</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    paginatedCategories.map((category, index) => (
                      <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteClick(category.id, category.categoryName)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{category.categoryId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{category.categoryName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{category.displayOrder}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{category.createdBy}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{category.createdDate}</td>
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

      {/* Footer */}
      <div className="flex items-center justify-between py-2 text-xs text-gray-400">
        <span>&copy; 2025 - POS - V5.06.Nov</span>
        <span className="text-emerald-600 font-medium">LICENSE DATE 01/01/2030</span>
      </div>
    </div>
  );
}
