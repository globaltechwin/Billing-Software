"use client";

import { useState, useEffect, useMemo } from "react";

interface ExpenseRow {
  id: string;
  sNo: number;
  expenseNo: string;
  categoryName: string;
  expenseDate: string;
  description: string;
  amount: number;
  vendorName: string;
  invoiceNo: string;
  comments: string;
  createdBy: string;
  createdDate: string;
}

interface CategoryOption {
  id: string;
  categoryName: string;
}

interface VendorOption {
  id: string;
  vendorName: string;
}

function formatDisplayDate(value: string | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function mapExpenses(expenses: Record<string, unknown>[]): ExpenseRow[] {
  return expenses
    .map((e) => ({
      id: String(e.id),
      sNo: 0,
      expenseNo: String(e.expenseNumber || ""),
      categoryName: String(e.categoryName || ""),
      expenseDate: formatDisplayDate(String(e.expenseDate || "")),
      description: String(e.description || ""),
      amount: Number(e.amount || 0),
      vendorName: String(e.vendorName || ""),
      invoiceNo: String(e.vendorInvoiceNo || ""),
      comments: String(e.comments || ""),
      createdBy: String(e.createdBy || ""),
      createdDate: formatDisplayDate(String(e.createdDate || "")),
    }))
    .map((r, i) => ({ ...r, sNo: i + 1 }));
}

export default function ExpensesPage() {
  const today = new Date().toISOString().split("T")[0];
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState(today);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState("");
  const [comments, setComments] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [reportData, setReportData] = useState<ExpenseRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchFromDate, setSearchFromDate] = useState(today);
  const [searchToDate, setSearchToDate] = useState(today);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/expense-categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories) {
          setCategories(
            data.categories.map((c: { id: number; categoryName: string }) => ({
              id: String(c.id),
              categoryName: c.categoryName,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/vendors?activeOnly=true&limit=1000")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.vendors) {
          setVendors(
            data.vendors.map((v: { id: number; vendorName: string }) => ({
              id: String(v.id),
              vendorName: v.vendorName,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const filteredData = useMemo(() => {
    let data = reportData;
    if (searchCategory) {
      const catName = categories.find((c) => c.id === searchCategory)?.categoryName;
      if (catName) data = data.filter((r) => r.categoryName === catName);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.expenseNo.toLowerCase().includes(q) ||
          r.categoryName.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.vendorName.toLowerCase().includes(q) ||
          r.invoiceNo.toLowerCase().includes(q) ||
          r.comments.toLowerCase().includes(q)
      );
    }
    return data;
  }, [reportData, searchCategory, searchQuery, categories]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const resetForm = () => {
    setExpenseCategory("");
    setExpenseDate(today);
    setDescription("");
    setAmount("");
    setVendor("");
    setVendorInvoiceNo("");
    setComments("");
    setEditingId(null);
  };

  const fetchExpenses = async (fromDate: string, toDate: string, categoryId: string) => {
    try {
      setLoadingList(true);
      const params = new URLSearchParams();
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);
      if (categoryId) params.set("categoryId", categoryId);
      const res = await fetch(`/api/expenses?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load expenses");
      setReportData(mapExpenses(data.expenses || []));
      setCurrentPage(1);
    } catch {
      alert("Failed to load expenses");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetch(`/api/expenses?fromDate=${today}&toDate=${today}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.expenses) {
          setReportData(mapExpenses(data.expenses));
          setCurrentPage(1);
        }
      })
      .catch(() => {});
  }, [today]);

  const handleSave = async () => {
    if (!expenseCategory || !expenseDate || !description || !amount) {
      alert("Please fill all required fields");
      return;
    }
    if (Number(amount) < 0) {
      alert("Amount must be a positive number");
      return;
    }
    setSaving(true);

    const body: Record<string, unknown> = {
      expenseCategoryId: parseInt(expenseCategory, 10),
      expenseDate,
      description,
      amount: parseFloat(amount),
      vendorInvoiceNo,
      comments,
    };
    if (vendor) body.vendorId = parseInt(vendor, 10);
    if (editingId) body.id = parseInt(editingId, 10);

    try {
      const res = await fetch("/api/expenses", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save expense");
      resetForm();
      fetchExpenses(searchFromDate, searchToDate, searchCategory);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row: ExpenseRow) => {
    const cat = categories.find((c) => c.categoryName === row.categoryName);
    const ven = vendors.find((v) => v.vendorName === row.vendorName);
    setEditingId(row.id);
    setExpenseCategory(cat?.id || "");
    setExpenseDate(row.expenseDate.split("/").reverse().join("-"));
    setDescription(row.description);
    setAmount(String(row.amount));
    setVendor(ven?.id || "");
    setVendorInvoiceNo(row.invoiceNo);
    setComments(row.comments);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete expense");
      fetchExpenses(searchFromDate, searchToDate, searchCategory);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete expense");
    }
  };

  const handleSearch = () => {
    fetchExpenses(searchFromDate, searchToDate, searchCategory);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Expense Info Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Expense Info.</h2>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Expense Category *</label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">--Select Expense Category--</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.categoryName}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Expense Date*</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[200px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Description*</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Amount*</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[200px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Vendor</label>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">--Select Vendor--</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.vendorName}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Vendor Invoice No</label>
            <input
              type="text"
              value={vendorInvoiceNo}
              onChange={(e) => setVendorInvoiceNo(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[250px]"
            />
          </div>

          <div className="flex flex-wrap items-start gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right pt-1">Comments (500 max) :</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value.slice(0, 500))}
              rows={4}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pl-0 sm:pl-40">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50">
              {editingId ? "Update" : "Save"}
            </button>
            <button onClick={resetForm} className="px-6 py-2 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition-colors">
              Clear
            </button>
            <button onClick={handleSearch} className="px-6 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
              Search
            </button>
            <button onClick={() => window.print()} className="px-6 py-2 bg-billora-primary text-white rounded-md text-sm font-medium hover:bg-billora-primary-dark transition-colors">
              Print Summary
            </button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Search</h2>
        </div>
        <div className="px-6 py-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From Date</label>
            <input
              type="date"
              value={searchFromDate}
              onChange={(e) => setSearchFromDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[150px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              value={searchToDate}
              onChange={(e) => setSearchToDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[150px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[180px]"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.categoryName}</option>
              ))}
            </select>
          </div>
          <button onClick={handleSearch} className="px-6 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Expense List</h2>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
          </button>
        </div>

        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
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
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-3 py-3 text-center text-xs font-semibold">S.NO</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">EDIT / DELETE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">EXPENSE NO</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">CATEGORY NAME</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">EXPENSE DATE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">DESCRIPTION</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">AMOUNT</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">VENDOR NAME</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">INVOICE NO</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">COMMENTS</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">CREATED BY</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">CREATED DATE</th>
              </tr>
            </thead>
            <tbody>
              {loadingList ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.sNo}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(row)} className="text-blue-500 hover:text-blue-700 text-xs underline">Edit</button>
                        <span className="text-gray-400">/</span>
                        <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 text-xs underline">Delete</button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.expenseNo}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.categoryName}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.expenseDate}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.description}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.amount.toFixed(2)}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.vendorName}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.invoiceNo}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.comments}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.createdBy}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.createdDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-gray-600">
            Showing {filteredData.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
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
    </div>
  );
}
