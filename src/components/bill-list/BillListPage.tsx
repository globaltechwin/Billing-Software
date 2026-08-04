"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Printer,
  Eye,
  ExternalLink,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Download,
  RotateCcw,
} from "lucide-react";
import LastBillPanel from "./LastBillPanel";
import InvoicePrintPreview from "@/components/billing/InvoicePrintPreview";

interface InvoiceRow {
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
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const GST_MODE_LABELS: Record<string, string> = {
  GST_VISIBLE: "With GST",
  GST_INCLUDED_HIDDEN: "GST Hidden",
  GST_IGST: "With IGST",
  NO_GST: "No GST",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  UNPAID: "bg-red-100 text-red-700",
  PARTIAL: "bg-amber-100 text-amber-700",
};

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

export default function BillListPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [gstModeFilter, setGstModeFilter] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [showOnlyDues, setShowOnlyDues] = useState(false);

  const [printInvoiceId, setPrintInvoiceId] = useState<number | null>(null);
  const [viewInvoice, setViewInvoice] = useState<InvoiceRow | null>(null);
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchInvoices = useCallback(async (page: number, limit: number) => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (searchQuery) params.set("search", searchQuery);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (gstModeFilter) params.set("gstMode", gstModeFilter);
      if (paymentModeFilter) params.set("paymentMode", paymentModeFilter);
      if (paymentStatusFilter) params.set("paymentStatus", paymentStatusFilter);
      if (invoiceStatusFilter) params.set("invoiceStatus", invoiceStatusFilter);
      params.set("sortField", sortField);
      params.set("sortDirection", sortDirection);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setInvoices(data.invoices);
        setPagination(data.pagination);
      } else {
        setError(data.error || "Failed to load invoices");
      }
    } catch (err) {
      setError(
        "Failed to load invoices: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery, startDate, endDate, gstModeFilter, paymentModeFilter, paymentStatusFilter, invoiceStatusFilter, sortField, sortDirection]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoices(1, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsPerPage, gstModeFilter, paymentModeFilter, paymentStatusFilter, invoiceStatusFilter, sortField, sortDirection, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices(1, rowsPerPage);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const pendingDues = useMemo(
    () => invoices.filter((b) => b.invoiceStatus !== "CANCELLED" && b.paymentStatus !== "PAID").length,
    [invoices]
  );

  const lastInvoice = invoices.length > 0 ? invoices[0] : null;

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
    setStartDate("");
    setEndDate("");
    setGstModeFilter("");
    setPaymentModeFilter("");
    setPaymentStatusFilter("");
    setInvoiceStatusFilter("");
    setShowOnlyDues(false);
    setSortField("createdAt");
    setSortDirection("desc");
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      fetchInvoices(newPage, rowsPerPage);
    },
    [fetchInvoices, rowsPerPage]
  );

  const handleDelete = useCallback(async (id: number) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: deleteReason || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
        setDeleteConfirmId(null);
        setDeleteReason("");
        setActionMenuId(null);
      } else {
        alert(data.error || "Failed to delete invoice");
      }
    } catch {
      alert("Failed to delete invoice");
    } finally {
      setActionLoading(null);
    }
  }, [deleteReason]);

  const handleCancel = useCallback(async (id: number) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceStatus: "CANCELLED" }),
      });
      const data = await res.json();
      if (data.success) {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === id ? { ...inv, invoiceStatus: "CANCELLED" } : inv
          )
        );
        setCancelConfirmId(null);
        setActionMenuId(null);
      } else {
        alert(data.error || "Failed to cancel invoice");
      }
    } catch {
      alert("Failed to cancel invoice");
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    if (invoices.length === 0) return;
    const headers = [
      "Invoice No",
      "Date",
      "Customer",
      "Mobile",
      "GST Mode",
      "Payment Mode",
      "Subtotal",
      "Discount",
      "Tax",
      "Grand Total",
      "Paid",
      "Amount Due",
      "Payment Status",
      "Status",
      "Created By",
    ];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      formatDate(inv.invoiceDate),
      inv.customerName,
      inv.customerPhone,
      GST_MODE_LABELS[inv.gstMode] || inv.gstMode,
      inv.paymentMode,
      inv.subtotal,
      inv.discountAmount,
      inv.taxAmount,
      inv.grandTotal,
      inv.cashReceived,
      inv.grandTotal - inv.cashReceived,
      inv.paymentStatus,
      inv.invoiceStatus,
      inv.createdBy,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bills_${new Date().toISOString().split("T")[0]}.csv`;
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

  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Top Row — Filters + Last Bill */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Filter Card */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h1 className="text-lg font-semibold text-gray-800">Bill List</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors"
              >
                <Download size={14} />
                Export
              </button>
              <button
                onClick={handleClearFilters}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear filters"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Filter Fields */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Mode
              </label>
              <select
                value={gstModeFilter}
                onChange={(e) => setGstModeFilter(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All</option>
                <option value="GST_VISIBLE">With GST</option>
                <option value="GST_INCLUDED_HIDDEN">GST Hidden</option>
                <option value="GST_IGST">With IGST</option>
                <option value="NO_GST">No GST</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode
              </label>
              <select
                value={paymentModeFilter}
                onChange={(e) => setPaymentModeFilter(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Status
              </label>
              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All</option>
                <option value="ACTIVE">Active</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchInvoices(1, rowsPerPage)}
              className="bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              View Bills
            </button>
            <button
              onClick={handleClearFilters}
              className="bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Last Bill Panel */}
        <div className="w-full xl:w-[280px] flex-shrink-0">
          {lastInvoice ? (
            <LastBillPanel
              billNo={lastInvoice.invoiceNumber}
              amount={lastInvoice.grandTotal}
              onReprint={() => setPrintInvoiceId(lastInvoice.id)}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex items-center justify-center">
              <p className="text-sm text-gray-400">No bills yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Dues Banner */}
      {pendingDues > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-sm text-amber-800">
              {pendingDues} bill{pendingDues !== 1 ? "s" : ""} have pending dues
            </span>
          </div>
          <button
            onClick={() => setShowOnlyDues(!showOnlyDues)}
            className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            {showOnlyDues ? "Show all" : "Show only dues"} ▸
          </button>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {/* Top bar: entries selector + global search */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                fetchInvoices(1, Number(e.target.value));
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
              placeholder="Search invoice, customer, mobile..."
              className="border border-gray-200 text-sm px-3 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-teal-500" />
            <span className="ml-2 text-sm text-gray-500">Loading invoices...</span>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1400px]">
                <thead>
                  <tr className="bg-[#1e293b] text-white">
                    <th
                      className="px-3 py-2.5 text-left text-xs font-semibold cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort("invoiceNumber")}
                    >
                      <div className="flex items-center gap-1">
                        INVOICE NO {renderSortIcon("invoiceNumber")}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2.5 text-left text-xs font-semibold cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort("invoiceDate")}
                    >
                      <div className="flex items-center gap-1">
                        DATE {renderSortIcon("invoiceDate")}
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold">CUSTOMER</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold">GST MODE</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold">PAYMENT</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold">SUBTOTAL</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold">DISCOUNT</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold">TAX</th>
                    <th
                      className="px-3 py-2.5 text-right text-xs font-semibold cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort("grandTotal")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        TOTAL {renderSortIcon("grandTotal")}
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold">PAID</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold">DUE</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">STATUS</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold">CREATED BY</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="text-center py-12 text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <Filter size={24} className="text-gray-300" />
                          <p>No invoices found</p>
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
                    invoices
                      .filter((inv) => !showOnlyDues || (inv.grandTotal - inv.cashReceived) > 0.01)
                      .map((inv) => {
                        const amountDue = inv.grandTotal - inv.cashReceived;
                        return (
                          <tr
                            key={inv.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-3 py-2.5 font-medium text-gray-800">
                              {inv.invoiceNumber}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600">
                              {formatDate(inv.invoiceDate)}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="text-gray-800">{inv.customerName}</div>
                              {inv.customerPhone && (
                                <div className="text-xs text-gray-400">{inv.customerPhone}</div>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600 text-xs">
                              {GST_MODE_LABELS[inv.gstMode] || inv.gstMode}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600 text-xs">
                              {inv.paymentMode}
                            </td>
                            <td className="px-3 py-2.5 text-right text-gray-600">
                              {formatCurrency(inv.subtotal)}
                            </td>
                            <td className="px-3 py-2.5 text-right text-gray-600">
                              {inv.discountAmount > 0 ? formatCurrency(inv.discountAmount) : "-"}
                            </td>
                            <td className="px-3 py-2.5 text-right text-gray-600">
                              {inv.taxAmount > 0 ? formatCurrency(inv.taxAmount) : "-"}
                            </td>
                            <td className="px-3 py-2.5 text-right font-medium text-gray-800">
                              {formatCurrency(inv.grandTotal)}
                            </td>
                            <td className="px-3 py-2.5 text-right text-gray-600">
                              {formatCurrency(inv.cashReceived)}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span
                                className={
                                  amountDue > 0.01
                                    ? "text-red-600 font-medium"
                                    : "text-gray-600"
                                }
                              >
                                {formatCurrency(amountDue)}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                  PAYMENT_STATUS_COLORS[inv.paymentStatus] || "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {inv.paymentStatus}
                              </span>
                              {inv.invoiceStatus === "CANCELLED" && (
                                <span className="inline-block ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  Cancelled
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600 text-xs">
                              {inv.createdBy}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center justify-center gap-1 relative">
                                <button
                                  onClick={() =>
                                    setActionMenuId(actionMenuId === inv.id ? null : inv.id)
                                  }
                                  className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
                                  title="Actions"
                                >
                                  <ExternalLink size={14} />
                                </button>

                                {/* Action Dropdown */}
                                {actionMenuId === inv.id && (
                                  <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40">
                                    <button
                                      onClick={() => {
                                        setViewInvoice(inv);
                                        setActionMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Eye size={14} className="text-blue-500" />
                                      View
                                    </button>
                                    <button
                                      onClick={() => {
                                        setPrintInvoiceId(inv.id);
                                        setActionMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Printer size={14} className="text-teal-500" />
                                      Print
                                    </button>
                                    <button
                                      onClick={() => {
                                        setPrintInvoiceId(inv.id);
                                        setActionMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <RotateCcw size={14} className="text-purple-500" />
                                      Reprint
                                    </button>
                                    {inv.invoiceStatus !== "CANCELLED" && (
                                      <>
                                        <div className="border-t border-gray-100 my-1" />
                                        <button
                                          onClick={() => {
                                            setCancelConfirmId(inv.id);
                                            setActionMenuId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50"
                                        >
                                          <AlertTriangle size={14} />
                                          Cancel Bill
                                        </button>
                                        <button
                                          onClick={() => {
                                            setDeleteConfirmId(inv.id);
                                            setActionMenuId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                          <Trash2 size={14} />
                                          Delete
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 flex-wrap gap-2">
                <span className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                    let page: number;
                    if (pagination.totalPages <= 7) {
                      page = i + 1;
                    } else if (pagination.page <= 4) {
                      page = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 3) {
                      page = pagination.totalPages - 6 + i;
                    } else {
                      page = pagination.page - 3 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                          pagination.page === page
                            ? "bg-teal-500 text-white border-teal-500"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Invoice {viewInvoice.invoiceNumber}
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
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-800">{formatDateTime(viewInvoice.invoiceDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">GST Mode</p>
                  <p className="text-sm font-medium text-gray-800">{GST_MODE_LABELS[viewInvoice.gstMode]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Mode</p>
                  <p className="text-sm font-medium text-gray-800">{viewInvoice.paymentMode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sales Person</p>
                  <p className="text-sm font-medium text-gray-800">{viewInvoice.salesPerson || "-"}</p>
                </div>
              </div>
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
                  <span className="text-gray-800">{formatCurrency(viewInvoice.cashReceived)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Due</span>
                  <span className={`font-medium ${(viewInvoice.grandTotal - viewInvoice.cashReceived) > 0.01 ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(viewInvoice.grandTotal - viewInvoice.cashReceived)}
                  </span>
                </div>
              </div>
              {viewInvoice.remarks && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500">Remarks</p>
                  <p className="text-sm text-gray-700">{viewInvoice.remarks}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setPrintInvoiceId(viewInvoice.id);
                    setViewInvoice(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={() => setViewInvoice(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Delete Invoice</h3>
                <p className="text-sm text-gray-500">This will hide the invoice from all views.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Are you sure you want to delete this invoice? It will be moved to Deleted Bills and can be restored later.
            </p>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delete Reason
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason for deletion"
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={actionLoading === deleteConfirmId}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === deleteConfirmId ? (
                  <Loader2 size={16} className="animate-spin mx-auto" />
                ) : (
                  "Delete"
                )}
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteReason("");
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Cancel Invoice</h3>
                <p className="text-sm text-gray-500">Mark this invoice as cancelled.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to cancel this invoice? This will mark it as cancelled but it will still appear in records.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleCancel(cancelConfirmId)}
                disabled={actionLoading === cancelConfirmId}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === cancelConfirmId ? (
                  <Loader2 size={16} className="animate-spin mx-auto" />
                ) : (
                  "Cancel Invoice"
                )}
              </button>
              <button
                onClick={() => setCancelConfirmId(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Keep
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

      {/* Click-away overlay for action menu */}
      {actionMenuId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActionMenuId(null)}
        />
      )}
    </div>
  );
}
