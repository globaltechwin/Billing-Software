"use client";

import { useState, useMemo } from "react";
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

const initialCategories: CashCategory[] = [
  { id: "1", sNo: 1, categoryId: "CAT-001", categoryName: "Sales Income", categoryType: "Cash In", displayOrder: 1, status: "Active" },
  { id: "2", sNo: 2, categoryId: "CAT-002", categoryName: "Customer Payment", categoryType: "Cash In", displayOrder: 2, status: "Active" },
  { id: "3", sNo: 3, categoryId: "CAT-003", categoryName: "Supplier Refund", categoryType: "Cash In", displayOrder: 3, status: "Active" },
  { id: "4", sNo: 4, categoryId: "CAT-004", categoryName: "Purchase Expense", categoryType: "Cash Out", displayOrder: 4, status: "Active" },
  { id: "5", sNo: 5, categoryId: "CAT-005", categoryName: "Salary", categoryType: "Cash Out", displayOrder: 5, status: "Active" },
  { id: "6", sNo: 6, categoryId: "CAT-006", categoryName: "Rent", categoryType: "Cash Out", displayOrder: 6, status: "Active" },
  { id: "7", sNo: 7, categoryId: "CAT-007", categoryName: "Utility Bills", categoryType: "Cash Out", displayOrder: 7, status: "Inactive" },
  { id: "8", sNo: 8, categoryId: "CAT-008", categoryName: "Petty Cash", categoryType: "Cash Out", displayOrder: 8, status: "Active" },
];

export default function CashCategoryPage() {
  const [categories, setCategories] = useState<CashCategory[]>(initialCategories);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);

  const filteredData = useMemo(() => {
    let d = [...categories];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      d = d.filter(r =>
        r.categoryName.toLowerCase().includes(q) ||
        r.categoryId.toLowerCase().includes(q) ||
        r.categoryType.toLowerCase().includes(q)
      );
    }
    return d;
  }, [categories, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const paginated = filteredData.slice(start, start + entriesPerPage);

  const handleSave = () => {
    if (!categoryName.trim()) {
      alert("Category Name is required.");
      return;
    }
    if (!categoryType) {
      alert("Category Type is required.");
      return;
    }
    if (editId) {
      setCategories(prev => prev.map(c =>
        c.id === editId
          ? { ...c, categoryName: categoryName.trim(), categoryType: categoryType as "Cash In" | "Cash Out", displayOrder: Number(displayOrder) || 0 }
          : c
      ));
    } else {
      const newId = String(categories.length + 1);
      const newCatId = `CAT-${String(categories.length + 1).padStart(3, "0")}`;
      setCategories(prev => [...prev, {
        id: newId,
        sNo: prev.length + 1,
        categoryId: newCatId,
        categoryName: categoryName.trim(),
        categoryType: categoryType as "Cash In" | "Cash Out",
        displayOrder: Number(displayOrder) || 0,
        status: "Active",
      }]);
    }
    handleClear();
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

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

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
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[140px] text-right">Category Name*</label>
                <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[420px]" />
              </div>

              {/* Category Type */}
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[140px] text-right">Category Type*</label>
                <select value={categoryType} onChange={e => setCategoryType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[280px]">
                  <option value="">--Select Type--</option>
                  <option value="Cash In">Cash In</option>
                  <option value="Cash Out">Cash Out</option>
                </select>
              </div>

              {/* Display Order */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700 w-[140px] text-right">Display Order*</label>
                <input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[140px]" />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 ml-[140px]">
                <button onClick={handleSave} className="px-6 py-2 bg-[#4caf85] text-white rounded-full text-sm font-medium hover:bg-[#3d9a7e]">Save</button>
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
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
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
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No data available in table</td>
                    </tr>
                  ) : (
                    paginated.map((r) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm text-center">{r.sNo}</td>
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
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">Showing {filteredData.length > 0 ? start + 1 : 0} to {Math.min(start + entriesPerPage, filteredData.length)} of {filteredData.length} entries</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Previous</button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
