"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Maximize2,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Trash2,
  Eye,
  Printer,
  RotateCcw,
  Loader2,
  Download,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import InvoicePrintPreview from "@/components/billing/InvoicePrintPreview";

interface DeletedInvoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone: string;
  gstMode: string;
  paymentMode: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  cashReceived: number;
  paymentStatus: string;
  invoiceStatus: string;
  salesPerson: string;
  remarks: string;
  itemCount: number;
  createdBy: string;
  deletedAt: string | null;
  deletedBy: string;
  deleteReason: string;
  createdAt: string;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-red-100 text-red-700",
  PARTIAL: "bg-amber-100 text-amber-700",
};

const PAYMENT_MODES = ["Cash", "Card", "UPI", "Credit", "Compliment"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} ${time}`;
}

function formatCurrency(val: number): string {
  return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DeleteBillsPage() {
  const [invoices, setInvoices] = useState<DeletedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [deletedByFilter, setDeletedByFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("deletedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Modals
  const [viewInvoice, setViewInvoice] = useState<DeletedInvoice | null>(null);
  const [printInvoiceId, setPrintInvoiceId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [restoreConfirmId, setRestoreConfirmId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchDeletedInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        showDeleted: "true",
        page: String(currentPage),
        limit: String(rowsPerPage),
      });

      const searchParts: string[] = [];
      if (searchQuery) searchParts.push(searchQuery);
      if (deletedByFilter) searchParts.push(deletedByFilter);
      if (searchParts.length > 0) params.set("search", searchParts.join(" "));

      if (dateFrom) params.set("startDate", dateFrom);
      if (dateTo) params.set("endDate", dateTo);
      if (paymentModeFilter) params.set("paymentMode", paymentModeFilter);
      if (paymentStatusFilter) params.set("paymentStatus", paymentStatusFilter);
      params.set("sortField", sortField);
      params.set("sortDirection", sortDirection);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setInvoices(data.invoices);
      } else {
        setError(data.error || "Failed to load deleted invoices");
      }
    } catch (err) {
      setError(
        "Failed to load deleted invoices: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, searchQuery, dateFrom, dateTo, paymentModeFilter, paymentStatusFilter, deletedByFilter, sortField, sortDirection]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDeletedInvoices();
  }, [fetchDeletedInvoices]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchDeletedInvoices();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRestore = useCallback(async (id: number) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      const data = await res.json();
      if (data.success) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
        setRestoreConfirmId(null);
      } else {
        alert(data.error || "Failed to restore invoice");
      }
    } catch {
      alert("Failed to restore invoice");
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("desc");
      }
    },
    [sortField]
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setPaymentModeFilter("");
    setPaymentStatusFilter("");
    setDeletedByFilter("");
    setSortField("deletedAt");
    setSortDirection("desc");
    setCurrentPage(1);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (invoices.length === 0) return;
    const headers = [
      "Invoice No",
      "Date",
      "Customer",
      "Mobile",
      "Total",
      "Paid",
      "Outstanding",
      "Payment Status",
      "Payment Mode",
      "Deleted By",
      "Deleted Date",
      "Delete Reason",
    ];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      formatDate(inv.invoiceDate),
      inv.customerName,
      inv.customerPhone,
      inv.grandTotal,
      inv.cashReceived,
      inv.grandTotal - inv.cashReceived,
      inv.paymentStatus,
      inv.paymentMode || "-",
      inv.deletedBy,
      inv.deletedAt ? formatDateTime(inv.deletedAt) : "-",
      inv.deleteReason || "-",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deleted_bills_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [invoices]);

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-gray-400" />;
    return sortDirection === "asc" ? (
      <ChevronUp size={12} className="text-white" />
    ) : (
      <ChevronDown size={12} className="text-white" />
    );
  };

  const totalAmount = useMemo(
    () => invoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
    [invoices]
  );

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Top Row: Search Bill + Summary */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Search Bill Panel */}
        <div className="flex-[3] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Title Bar */}
          <div className="bg-[#f2f5f9] px-4 py-3 flex items-center justify-between border-b border-gray-200 flex-wrap gap-2">
            <h3 className="text-sm font-medium text-gray-700">Search Bill</h3>
            <div className="flex items-center gap-2">
              <button className="text-gray-500 hover:text-gray-700">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Row 1: Date Range */}
            <div className="flex flex-wrap items-center gap-4 mb-5">
              <div className="flex-shrink-0">
                <label className="block text-xs text-gray-500 mb-1">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-shrink-0">
                <label className="block text-xs text-gray-500 mb-1">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex-shrink-0">
                <label className="block text-xs text-gray-500 mb-1">Payment Mode</label>
                <select
                  value={paymentModeFilter}
                  onChange={(e) => setPaymentModeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-shrink-0">
                <label className="block text-xs text-gray-500 mb-1">Payment Status</label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Unpaid</option>
                  <option value="PARTIAL">Partial</option>
                </select>
              </div>

              <div className="flex-shrink-0">
                <label className="block text-xs text-gray-500 mb-1">Deleted By</label>
                <input
                  type="text"
                  value={deletedByFilter}
                  onChange={(e) => setDeletedByFilter(e.target.value)}
                  placeholder="User name"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-5" />

            {/* Row 2: Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setCurrentPage(1);
                  fetchDeletedInvoices();
                }}
                className="px-5 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                View Bills
              </button>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="flex-[2] flex flex-col justify-start bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-fit">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">No. of Bills:</span>
              <span className="text-sm font-semibold text-emerald-600">{invoices.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Total:</span>
              <span className="text-sm font-semibold text-emerald-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header Controls */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-200 text-sm px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {ROWS_PER_PAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
          <div className="flex items-center gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice, customer..."
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-teal-500" />
            <span className="ml-2 text-sm text-gray-500">Loading deleted bills...</span>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold cursor-pointer hover:bg-[#35876c] transition-colors"
                      onClick={() => handleSort("invoiceNumber")}
                    >
                      <div className="flex items-center gap-1">
                        INVOICE NO {renderSortIcon("invoiceNumber")}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold cursor-pointer hover:bg-[#35876c] transition-colors"
                      onClick={() => handleSort("invoiceDate")}
                    >
                      <div className="flex items-center gap-1">
                        BILL DATE {renderSortIcon("invoiceDate")}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CUSTOMER</th>
                    <th
                      className="px-4 py-3 text-right text-xs font-semibold cursor-pointer hover:bg-[#35876c] transition-colors"
                      onClick={() => handleSort("grandTotal")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        TOTAL {renderSortIcon("grandTotal")}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">PAYMENT</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold">STATUS</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">DELETED BY</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold cursor-pointer hover:bg-[#35876c] transition-colors"
                      onClick={() => handleSort("deletedAt")}
                    >
                      <div className="flex items-center gap-1">
                        DELETED DATE {renderSortIcon("deletedAt")}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">REASON</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle size={24} className="text-green-300" />
                          <p>No deleted bills found</p>
                          <button
                            onClick={handleClearFilters}
                            className="text-sm text-teal-500 hover:text-teal-700"
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatDate(inv.invoiceDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div>{inv.customerName}</div>
                          {inv.customerPhone && (
                            <div className="text-xs text-gray-400">{inv.customerPhone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                          {formatCurrency(inv.grandTotal)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {inv.paymentMode || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              PAYMENT_STATUS_COLORS[inv.paymentStatus] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {inv.deletedBy || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {inv.deletedAt ? formatDateTime(inv.deletedAt) : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate">
                          {inv.deleteReason || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewInvoice(inv)}
                              className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                              title="View Bill"
                            >
                              <Eye size={14} className="text-blue-500" />
                            </button>
                            <button
                              onClick={() => setPrintInvoiceId(inv.id)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Print Invoice"
                            >
                              <Printer size={14} className="text-gray-500" />
                            </button>
                            <button
                              onClick={() => setRestoreConfirmId(inv.id)}
                              className="p-1.5 hover:bg-green-50 rounded transition-colors"
                              title="Restore Bill"
                            >
                              <RotateCcw size={14} className="text-green-600" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(inv.id)}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                              title="Permanently Delete"
                            >
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50 flex-wrap gap-2">
              <span className="text-sm text-gray-600">
                Showing {invoices.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{" "}
                {Math.min(currentPage * rowsPerPage, invoices.length)} of {invoices.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(Math.ceil(invoices.length / rowsPerPage), 7) }, (_, i) => {
                  const totalPages = Math.ceil(invoices.length / rowsPerPage);
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage >= Math.ceil(invoices.length / rowsPerPage)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Deleted Invoice {viewInvoice.invoiceNumber}
              </h2>
              <button
                onClick={() => setViewInvoice(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="text-sm font-medium text-gray-800">{viewInvoice.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-800">{viewInvoice.customerPhone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bill Date</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(viewInvoice.invoiceDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Mode</p>
                  <p className="text-sm font-medium text-gray-800">{viewInvoice.paymentMode || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Deleted By</p>
                  <p className="text-sm font-medium text-gray-800">{viewInvoice.deletedBy || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Deleted At</p>
                  <p className="text-sm font-medium text-gray-800">
                    {viewInvoice.deletedAt ? formatDateTime(viewInvoice.deletedAt) : "-"}
                  </p>
                </div>
              </div>
              {viewInvoice.deleteReason && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-600 font-medium">Delete Reason</p>
                  <p className="text-sm text-amber-800">{viewInvoice.deleteReason}</p>
                </div>
              )}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">{formatCurrency(viewInvoice.subtotal)}</span>
                </div>
                {viewInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-gray-800">-{formatCurrency(viewInvoice.discountAmount)}</span>
                  </div>
                )}
                {viewInvoice.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span className="text-gray-800">{formatCurrency(viewInvoice.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold border-t border-gray-100 pt-2">
                  <span className="text-gray-800">Grand Total</span>
                  <span className="text-gray-800">{formatCurrency(viewInvoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Paid</span>
                  <span className="text-green-600">{formatCurrency(viewInvoice.cashReceived)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Outstanding</span>
                  <span className="text-red-600">
                    {formatCurrency(viewInvoice.grandTotal - viewInvoice.cashReceived)}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setRestoreConfirmId(viewInvoice.id);
                    setViewInvoice(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  <RotateCcw size={16} />
                  Restore Bill
                </button>
                <button
                  onClick={() => {
                    setPrintInvoiceId(viewInvoice.id);
                    setViewInvoice(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  <Printer size={16} />
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoreConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <RotateCcw size={18} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Restore Invoice</h3>
                <p className="text-sm text-gray-500">This will make the invoice visible again.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to restore this invoice? It will reappear in the Bill List and all active billing screens.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleRestore(restoreConfirmId)}
                disabled={actionLoading === restoreConfirmId}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === restoreConfirmId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <RotateCcw size={16} />
                    Restore
                  </>
                )}
              </button>
              <button
                onClick={() => setRestoreConfirmId(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Permanently Delete</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Permanent deletion is not enabled in this version. Use soft delete (Restore) instead to manage bill visibility.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {printInvoiceId && (
        <InvoicePrintPreview
          invoiceId={printInvoiceId}
          onClose={() => setPrintInvoiceId(null)}
        />
      )}
    </div>
  );
}
