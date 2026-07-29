"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { sampleExpenseCategories } from "@/components/expense-category/data";
import { sampleVendors } from "@/components/vendor/data";

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

const sampleExpenses: ExpenseRow[] = [
  { id: "1", sNo: 1, expenseNo: "EXP-1001", categoryName: "Salary", expenseDate: "28/07/2026", description: "Monthly staff salary", amount: 45000.00, vendorName: "", invoiceNo: "", comments: "July 2026 salary", createdBy: "admin", createdDate: "28/07/2026" },
  { id: "2", sNo: 2, expenseNo: "EXP-1002", categoryName: "Petrol", expenseDate: "28/07/2026", description: "Delivery vehicle fuel", amount: 2500.00, vendorName: "Rajesh kumar", invoiceNo: "INV-201", comments: "Weekly fuel", createdBy: "admin", createdDate: "28/07/2026" },
  { id: "3", sNo: 3, expenseNo: "EXP-1003", categoryName: "Local Purchase", expenseDate: "27/07/2026", description: "Office supplies purchase", amount: 1800.00, vendorName: "Arasu", invoiceNo: "INV-202", comments: "Stationery items", createdBy: "manager1", createdDate: "27/07/2026" },
  { id: "4", sNo: 4, expenseNo: "EXP-1004", categoryName: "Salary", expenseDate: "27/07/2026", description: "Part-time staff payment", amount: 12000.00, vendorName: "", invoiceNo: "", comments: "Part-time wages", createdBy: "admin", createdDate: "27/07/2026" },
  { id: "5", sNo: 5, expenseNo: "EXP-1005", categoryName: "Petrol", expenseDate: "26/07/2026", description: "Generator fuel", amount: 3200.00, vendorName: "MadhuAshwath", invoiceNo: "INV-203", comments: "Generator running", createdBy: "admin", createdDate: "26/07/2026" },
  { id: "6", sNo: 6, expenseNo: "EXP-1006", categoryName: "Local Purchase", expenseDate: "26/07/2026", description: "Kitchen cleaning supplies", amount: 950.00, vendorName: "Abdul", invoiceNo: "INV-204", comments: "Cleaning items", createdBy: "manager1", createdDate: "26/07/2026" },
];

function downloadCsv(headers: string[], rows: (string | number)[][], filename: string) {
  const lines = [headers.join(",")];
  rows.forEach((row) => lines.push(row.map((v) => `"${v}"`).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

  const [searchFromDate, setSearchFromDate] = useState(today);
  const [searchToDate, setSearchToDate] = useState(today);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<ExpenseRow[]>([]);

  const filteredData = useMemo(() => {
    let data = reportData;
    if (searchCategory) data = data.filter((r) => r.categoryName === searchCategory);
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
  }, [reportData, searchCategory, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const totalAmount = useMemo(() => filteredData.reduce((sum, r) => sum + r.amount, 0), [filteredData]);

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

  const handleSave = () => {
    if (!expenseCategory || !expenseDate || !description || !amount) {
      alert("Please fill all required fields");
      return;
    }
    const catName = sampleExpenseCategories.find((c) => c.id === expenseCategory)?.categoryName || "";
    const vendorName = sampleVendors.find((v) => v.id === vendor)?.vendorName || "";

    if (editingId) {
      setReportData((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, categoryName: catName, expenseDate, description, amount: parseFloat(amount), vendorName, invoiceNo: vendorInvoiceNo, comments }
            : r
        )
      );
    } else {
      const newExpense: ExpenseRow = {
        id: String(Date.now()),
        sNo: reportData.length + 1,
        expenseNo: `EXP-${1000 + reportData.length + 1}`,
        categoryName: catName,
        expenseDate,
        description,
        amount: parseFloat(amount),
        vendorName,
        invoiceNo: vendorInvoiceNo,
        comments,
        createdBy: "admin",
        createdDate: today,
      };
      setReportData((prev) => [newExpense, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (row: ExpenseRow) => {
    const cat = sampleExpenseCategories.find((c) => c.categoryName === row.categoryName);
    const ven = sampleVendors.find((v) => v.vendorName === row.vendorName);
    setEditingId(row.id);
    setExpenseCategory(cat?.id || "");
    setExpenseDate(row.expenseDate.split("/").reverse().join("-"));
    setDescription(row.description);
    setAmount(String(row.amount));
    setVendor(ven?.id || "");
    setVendorInvoiceNo(row.invoiceNo);
    setComments(row.comments);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    setReportData((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClear = () => {
    resetForm();
    setSearchFromDate(today);
    setSearchToDate(today);
    setSearchCategory("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSearch = () => {
    let data = sampleExpenses;
    if (searchCategory) data = data.filter((r) => {
      const cat = sampleExpenseCategories.find((c) => c.id === searchCategory);
      return cat && r.categoryName === cat.categoryName;
    });
    setReportData(data);
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    if (filteredData.length === 0) return;
    const headers = ["S.NO", "EXPENSE NO", "CATEGORY NAME", "EXPENSE DATE", "DESCRIPTION", "AMOUNT", "VENDOR NAME", "INVOICE NO", "COMMENTS", "CREATED BY", "CREATED DATE"];
    const rows = filteredData.map((r) => [r.sNo, r.expenseNo, r.categoryName, r.expenseDate, r.description, r.amount.toFixed(2), r.vendorName, r.invoiceNo, r.comments, r.createdBy, r.createdDate]);
    rows.push(["", "", "", "", "Total:", totalAmount.toFixed(2), "", "", "", "", ""]);
    downloadCsv(headers, rows, `Expenses-${searchFromDate.replace(/\//g, "-")}.csv`);
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
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Expense Category *</label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">--Select Expense Category--</option>
              {sampleExpenseCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.categoryName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Expense Date*</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[200px]"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Description*</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-4">
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

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Vendor</label>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">--Select Vendor--</option>
              {sampleVendors.map((v) => (
                <option key={v.id} value={v.id}>{v.vendorName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Vendor Invoice No</label>
            <input
              type="text"
              value={vendorInvoiceNo}
              onChange={(e) => setVendorInvoiceNo(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[250px]"
            />
          </div>

          <div className="flex items-start gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right pt-1">Comments (500 max) :</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value.slice(0, 500))}
              rows={4}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pl-40">
            <button onClick={handleSave} className="px-6 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
              {editingId ? "Update" : "Save"}
            </button>
            <button onClick={resetForm} className="px-6 py-2 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition-colors">
              Clear
            </button>
            <button onClick={handleSearch} className="px-6 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
              Search
            </button>
            <button onClick={() => window.print()} className="px-6 py-2 bg-orange-400 text-white rounded-md text-sm font-medium hover:bg-orange-500 transition-colors">
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
              {sampleExpenseCategories.map((c) => (
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
              {paginatedData.length === 0 ? (
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

        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
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