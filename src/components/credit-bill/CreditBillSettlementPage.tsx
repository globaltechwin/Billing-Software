"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Settings,
  X,
  Loader2,
  Eye,
  Printer,
  Wallet,
  History,
  Download,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
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

interface InvoicePaymentRecord {
  id: number;
  paymentNumber: string;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  notes: string | null;
  paymentDate: string;
  createdBy: { name: string } | null;
  invoice: { invoiceNumber: string; grandTotal: number } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-red-100 text-red-700",
  PARTIAL: "bg-amber-100 text-amber-700",
};

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "BANK", label: "Bank Transfer" },
  { value: "CHEQUE", label: "Cheque" },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(val: number): string {
  return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CreditBillSettlementPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search By Customer
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");

  // Search By Bill
  const [billDateFrom, setBillDateFrom] = useState("");
  const [billDateTo, setBillDateTo] = useState("");
  const [billNo, setBillNo] = useState("");
  const [unsettledBill, setUnsettledBill] = useState(true);

  // Table state
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [receivePaymentInvoice, setReceivePaymentInvoice] = useState<InvoiceRow | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState("");

  const [paymentHistoryInvoice, setPaymentHistoryInvoice] = useState<InvoiceRow | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<InvoicePaymentRecord[]>([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);

  const [printInvoiceId, setPrintInvoiceId] = useState<number | null>(null);
  const [viewInvoice, setViewInvoice] = useState<InvoiceRow | null>(null);

  const fetchInvoices = useCallback(
    async (page: number, limit: number) => {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        // Build search query combining customer and bill filters
        const searchParts: string[] = [];
        if (searchQuery) searchParts.push(searchQuery);
        if (mobile) searchParts.push(mobile);
        if (name) searchParts.push(name);
        if (billNo) searchParts.push(billNo);
        if (searchParts.length > 0) {
          params.set("search", searchParts.join(" "));
        }

        if (billDateFrom) params.set("startDate", billDateFrom);
        if (billDateTo) params.set("endDate", billDateTo);

        // For credit bill settlement, default to showing unpaid/partial invoices
        if (unsettledBill) {
          params.set("paymentStatus", "PARTIAL");
          // Also need PENDING but API only takes one value - use paymentMode=CREDIT instead
          params.delete("paymentStatus");
          params.set("paymentMode", "CREDIT");
        }

        params.set("sortField", sortField);
        params.set("sortDirection", sortDirection);

        const res = await fetch(`/api/invoices?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          // If unsettled filter is on, also include PARTIAL payment status invoices
          let filteredInvoices = data.invoices;
          if (unsettledBill) {
            // Fetch PENDING status invoices too
            const params2 = new URLSearchParams(params);
            params2.delete("paymentMode");
            params2.set("paymentStatus", "PENDING");
            const res2 = await fetch(`/api/invoices?${params2.toString()}`);
            const data2 = await res2.json();
            if (data2.success) {
              const combined = [...filteredInvoices, ...data2.invoices];
              const unique = combined.reduce((acc: InvoiceRow[], inv: InvoiceRow) => {
                if (!acc.find((i) => i.id === inv.id)) acc.push(inv);
                return acc;
              }, []);
              filteredInvoices = unique;
            }
          }
          setInvoices(filteredInvoices);
          setPagination({
            ...data.pagination,
            total: filteredInvoices.length,
            totalPages: Math.ceil(filteredInvoices.length / rowsPerPage),
          });
        } else {
          setError(data.error || "Failed to load invoices");
        }
      } catch (err) {
        setError(
          "Failed to load invoices: " +
            (err instanceof Error ? err.message : String(err))
        );
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, mobile, name, billDateFrom, billDateTo, billNo, unsettledBill, sortField, sortDirection, rowsPerPage]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoices(1, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsettledBill, sortField, sortDirection, rowsPerPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices(1, rowsPerPage);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, mobile, name, billNo, billDateFrom, billDateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalOutstanding = useMemo(
    () =>
      invoices.reduce(
        (sum, inv) => sum + (inv.grandTotal - inv.cashReceived),
        0
      ),
    [invoices]
  );

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
    setMobile("");
    setName("");
    setBillDateFrom("");
    setBillDateTo("");
    setBillNo("");
    setUnsettledBill(true);
    setSearchQuery("");
    setSortField("createdAt");
    setSortDirection("desc");
  }, []);

  const handleReceivePayment = useCallback(async () => {
    if (!receivePaymentInvoice) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }
    const outstanding = receivePaymentInvoice.grandTotal - receivePaymentInvoice.cashReceived;
    if (amount > outstanding + 0.01) {
      alert(`Payment amount cannot exceed outstanding balance of ${formatCurrency(outstanding)}`);
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentSuccess("");
      const res = await fetch("/api/invoice-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: receivePaymentInvoice.id,
          amount,
          paymentMethod,
          referenceNumber: paymentReference || undefined,
          notes: paymentNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSuccess("Payment recorded successfully!");
        // Update the invoice in the local list
        setInvoices((prev) =>
          prev.map((inv) => {
            if (inv.id === receivePaymentInvoice.id) {
              const newPaid = inv.cashReceived + amount;
              const newStatus =
                newPaid >= inv.grandTotal - 0.01 ? "PAID" : "PARTIAL";
              return {
                ...inv,
                cashReceived: newPaid,
                paymentStatus: newStatus,
              };
            }
            return inv;
          })
        );
        setPaymentAmount("");
        setPaymentReference("");
        setPaymentNotes("");
        setTimeout(() => {
          setReceivePaymentInvoice(null);
          setPaymentSuccess("");
        }, 1500);
      } else {
        alert(data.error || "Failed to record payment");
      }
    } catch {
      alert("Failed to record payment");
    } finally {
      setPaymentLoading(false);
    }
  }, [receivePaymentInvoice, paymentAmount, paymentMethod, paymentReference, paymentNotes]);

  const fetchPaymentHistory = useCallback(async (invoiceId: number) => {
    try {
      setPaymentHistoryLoading(true);
      const res = await fetch(`/api/invoice-payments?invoiceId=${invoiceId}`);
      const data = await res.json();
      if (data.success) {
        setPaymentHistory(data.payments);
      }
    } catch {
      // ignore
    } finally {
      setPaymentHistoryLoading(false);
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    if (invoices.length === 0) return;
    const headers = [
      "Invoice No",
      "Date",
      "Customer",
      "Mobile",
      "Billing Mode",
      "Total",
      "Paid",
      "Outstanding",
      "Payment Status",
      "Created By",
    ];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      formatDate(inv.invoiceDate),
      inv.customerName,
      inv.customerPhone,
      inv.paymentMode || "-",
      inv.grandTotal,
      inv.cashReceived,
      inv.grandTotal - inv.cashReceived,
      inv.paymentStatus,
      inv.createdBy,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `credit_bills_${new Date().toISOString().split("T")[0]}.csv`;
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

  const paginatedInvoices = useMemo(() => {
    const start = (pagination.page - 1) * rowsPerPage;
    return invoices.slice(start, start + rowsPerPage);
  }, [invoices, pagination.page, rowsPerPage]);

  const totalPages = Math.ceil(invoices.length / rowsPerPage);

  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Top Row — Two search panels */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Left — Search By Customer */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <h1 className="text-lg font-semibold text-gray-800">Credit Bills</h1>
            <span className="text-sm text-gray-500">Search By Customer</span>
            <div className="ml-auto flex items-center gap-1">
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronUp size={16} className="text-gray-500" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={16} className="text-gray-500" />
              </button>
              <button
                onClick={handleClearFilters}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Customer mobile"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Customer name"
              />
            </div>
          </div>

          {/* Due Amount Display */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                Total Outstanding: {formatCurrency(totalOutstanding)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 my-4" />

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
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors"
              >
                <Download size={14} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Right — Search By Bill */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <h2 className="text-sm font-semibold text-gray-700">Search By Bill</h2>
            <div className="ml-auto flex items-center gap-1">
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronUp size={16} className="text-gray-500" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={16} className="text-gray-500" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bill Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={billDateFrom}
                onChange={(e) => setBillDateFrom(e.target.value)}
                className="flex-1 border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="date"
                value={billDateTo}
                onChange={(e) => setBillDateTo(e.target.value)}
                className="flex-1 border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill No
              </label>
              <input
                type="text"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Invoice number"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unsettledBill}
                  onChange={(e) => setUnsettledBill(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">Unsettled Bills Only</span>
              </label>
            </div>
          </div>

          {/* Global Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quick Search
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice, customer..."
                className="w-full border border-gray-200 text-sm pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="border border-gray-200 text-sm px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {ROWS_PER_PAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">
              entries | {invoices.length} credit bill{invoices.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-teal-500" />
            <span className="ml-2 text-sm text-gray-500">Loading credit bills...</span>
          </div>
        ) : (
          <>
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
                    <th className="px-3 py-2.5 text-left text-xs font-semibold">MOBILE</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold">BILLING MODE</th>
                    <th
                      className="px-3 py-2.5 text-right text-xs font-semibold cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort("grandTotal")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        TOTAL {renderSortIcon("grandTotal")}
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold">PAID</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold">OUTSTANDING</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">STATUS</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle size={24} className="text-green-300" />
                          <p>No pending credit bills</p>
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
                    paginatedInvoices.map((inv) => {
                      const outstanding = inv.grandTotal - inv.cashReceived;
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
                          <td className="px-3 py-2.5 text-gray-800">
                            {inv.customerName}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">
                            {inv.customerPhone || "-"}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 text-xs">
                            {inv.paymentMode || "-"}
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
                                outstanding > 0.01
                                  ? "text-red-600 font-semibold"
                                  : "text-green-600 font-medium"
                              }
                            >
                              {formatCurrency(outstanding)}
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
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setViewInvoice(inv)}
                                className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                                title="View Bill"
                              >
                                <Eye size={14} className="text-blue-500" />
                              </button>
                              <button
                                onClick={() => {
                                  setReceivePaymentInvoice(inv);
                                  setPaymentAmount(
                                    String((inv.grandTotal - inv.cashReceived).toFixed(2))
                                  );
                                  setPaymentSuccess("");
                                }}
                                className="p-1.5 hover:bg-green-50 rounded transition-colors"
                                title="Receive Payment"
                              >
                                <Wallet size={14} className="text-green-600" />
                              </button>
                              <button
                                onClick={() => {
                                  setPaymentHistoryInvoice(inv);
                                  fetchPaymentHistory(inv.id);
                                }}
                                className="p-1.5 hover:bg-purple-50 rounded transition-colors"
                                title="Payment History"
                              >
                                <History size={14} className="text-purple-500" />
                              </button>
                              <button
                                onClick={() => setPrintInvoiceId(inv.id)}
                                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                title="Print Invoice"
                              >
                                <Printer size={14} className="text-gray-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 flex-wrap gap-2">
                <span className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * rowsPerPage + 1} to{" "}
                  {Math.min(pagination.page * rowsPerPage, invoices.length)} of{" "}
                  {invoices.length} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 7) {
                      page = i + 1;
                    } else if (pagination.page <= 4) {
                      page = i + 1;
                    } else if (pagination.page >= totalPages - 3) {
                      page = totalPages - 6 + i;
                    } else {
                      page = pagination.page - 3 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setPagination((p) => ({ ...p, page }))}
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
                    onClick={() => setPagination((p) => ({ ...p, page: Math.min(totalPages, p.page + 1) }))}
                    disabled={pagination.page >= totalPages}
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
                  <p className="text-sm font-medium text-gray-800">{formatDate(viewInvoice.invoiceDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Billing Mode</p>
                  <p className="text-sm font-medium text-gray-800">{viewInvoice.paymentMode || "-"}</p>
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
                  <span className="text-green-600">{formatCurrency(viewInvoice.cashReceived)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-800">Outstanding</span>
                  <span className="text-red-600">
                    {formatCurrency(viewInvoice.grandTotal - viewInvoice.cashReceived)}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setReceivePaymentInvoice(viewInvoice);
                    setPaymentAmount(
                      String((viewInvoice.grandTotal - viewInvoice.cashReceived).toFixed(2))
                    );
                    setPaymentSuccess("");
                    setViewInvoice(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  <Wallet size={16} />
                  Receive Payment
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

      {/* Receive Payment Modal */}
      {receivePaymentInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Receive Payment</h2>
                <p className="text-sm text-gray-500">
                  {receivePaymentInvoice.invoiceNumber} — {receivePaymentInvoice.customerName}
                </p>
              </div>
              <button
                onClick={() => setReceivePaymentInvoice(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Outstanding Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Bill</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(receivePaymentInvoice.grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Already Paid</span>
                  <span className="text-green-600">
                    {formatCurrency(receivePaymentInvoice.cashReceived)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2">
                  <span className="text-gray-800">Outstanding</span>
                  <span className="text-red-600">
                    {formatCurrency(
                      receivePaymentInvoice.grandTotal - receivePaymentInvoice.cashReceived
                    )}
                  </span>
                </div>
              </div>

              {paymentSuccess ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="text-sm text-green-700">{paymentSuccess}</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={receivePaymentInvoice.grandTotal - receivePaymentInvoice.cashReceived}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {PAYMENT_METHODS.map((m) => (
                        <button
                          key={m.value}
                          onClick={() => setPaymentMethod(m.value)}
                          className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                            paymentMethod === m.value
                              ? "bg-teal-500 text-white border-teal-500"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(paymentMethod === "CARD" || paymentMethod === "UPI" || paymentMethod === "CHEQUE" || paymentMethod === "BANK") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Transaction/Cheque ref no."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Optional notes"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                {!paymentSuccess && (
                  <button
                    onClick={handleReceivePayment}
                    disabled={paymentLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Wallet size={16} />
                        Record Payment
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    setReceivePaymentInvoice(null);
                    setPaymentSuccess("");
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {paymentSuccess ? "Close" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {paymentHistoryInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
                <p className="text-sm text-gray-500">
                  {paymentHistoryInvoice.invoiceNumber} — {paymentHistoryInvoice.customerName}
                </p>
              </div>
              <button
                onClick={() => setPaymentHistoryInvoice(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">{formatCurrency(paymentHistoryInvoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Paid</span>
                  <span className="text-green-600">{formatCurrency(paymentHistoryInvoice.cashReceived)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-800">Outstanding</span>
                  <span className="text-red-600">
                    {formatCurrency(paymentHistoryInvoice.grandTotal - paymentHistoryInvoice.cashReceived)}
                  </span>
                </div>
              </div>

              {paymentHistoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-teal-500" />
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No payments recorded yet
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p.paymentNumber}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(p.paymentDate)} | {p.paymentMethod}
                          {p.referenceNumber ? ` | Ref: ${p.referenceNumber}` : ""}
                        </p>
                        {p.notes && (
                          <p className="text-xs text-gray-400 mt-0.5">{p.notes}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(Number(p.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
