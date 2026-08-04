"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, Settings, X, FileEdit, Trash2, Printer } from "lucide-react";

interface InvoiceRecord {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
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
}

export default function InvoicePage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceNoSearch, setInvoiceNoSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(entriesPerPage),
      });
      if (searchQuery) params.set("search", searchQuery);
      if (invoiceNoSearch) params.set("search", invoiceNoSearch);
      if (customerSearch) params.set("search", customerSearch);
      if (statusFilter) params.set("invoiceStatus", statusFilter);
      if (paymentStatusFilter) params.set("paymentStatus", paymentStatusFilter);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      if (data.invoices) {
        setInvoices(
          data.invoices.map((inv: Record<string, unknown>) => ({
            id: inv.id as number,
            invoiceNumber: inv.invoiceNumber as string,
            invoiceDate: new Date(inv.invoiceDate as string).toLocaleDateString("en-IN"),
            customerName: (inv.customerName as string) || "Walk-in",
            gstMode: inv.gstMode as string,
            paymentMode: (inv.paymentMode as string) || "Cash",
            subtotal: Number(inv.subtotal),
            discountAmount: Number(inv.discountAmount),
            taxAmount: Number(inv.taxAmount),
            grandTotal: Number(inv.grandTotal),
            cashReceived: Number(inv.cashReceived),
            paymentStatus: inv.paymentStatus as string,
            invoiceStatus: inv.invoiceStatus as string,
            salesPerson: (inv.salesPerson as string) || "",
            remarks: (inv.remarks as string) || "",
            itemCount: inv.itemCount as number,
            createdBy: (inv.createdBy as string) || "",
            deletedAt: inv.deletedAt as string | null,
            deletedBy: (inv.deletedBy as string) || "",
            deleteReason: (inv.deleteReason as string) || "",
          }))
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, searchQuery, invoiceNoSearch, customerSearch, statusFilter, paymentStatusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoices();
  }, [fetchInvoices]);

  const uniqueStatuses = ["DRAFT", "COMPLETED", "CANCELLED"];
  const uniquePaymentStatuses = ["PAID", "PENDING", "PARTIAL"];

  const filteredData = invoices;
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchInvoices();
  };

  const handleClear = () => {
    setInvoiceNoSearch("");
    setCustomerSearch("");
    setStatusFilter("");
    setPaymentStatusFilter("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(paginatedData.map((r) => r.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: number) => {
    const reason = prompt("Enter reason for deletion:");
    if (reason === null) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "Deleted from invoice list" }),
      });
      if (res.ok) {
        fetchInvoices();
      } else {
        alert("Failed to delete invoice");
      }
    } catch {
      alert("Failed to delete invoice");
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this invoice?")) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceStatus: "CANCELLED" }),
      });
      if (res.ok) {
        fetchInvoices();
      } else {
        alert("Failed to cancel invoice");
      }
    } catch {
      alert("Failed to cancel invoice");
    }
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-700 border border-gray-200",
      COMPLETED: "bg-green-100 text-green-700 border border-green-200",
      CANCELLED: "bg-red-100 text-red-700 border border-red-200",
    };
    return styles[status] || styles.DRAFT;
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      PAID: "bg-green-100 text-green-700 border border-green-200",
      PENDING: "bg-red-100 text-red-700 border border-red-200",
      PARTIAL: "bg-amber-100 text-amber-700 border border-amber-200",
    };
    return styles[status] || styles.PENDING;
  };

  const allSelected = paginatedData.length > 0 && paginatedData.every((r) => selectedRows.has(r.id));

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-800">All Invoices</h2>
            <button
              onClick={() => router.push("/sales/invoice/create")}
              className="px-4 py-1.5 bg-[#6b5ce7] text-white rounded-md text-sm font-medium hover:bg-[#5a4bd6] transition-colors"
            >
              New F3
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
              <ChevronUp size={16} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
              <Settings size={16} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Invoice No</label>
            <div className="relative">
              <input
                type="text"
                value={invoiceNoSearch}
                onChange={(e) => setInvoiceNoSearch(e.target.value)}
                placeholder="Search invoice no..."
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[200px]"
              />
              {invoiceNoSearch && (
                <button
                  onClick={() => setInvoiceNoSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Customer</label>
            <div className="relative">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customer..."
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[200px]"
              />
              {customerSearch && (
                <button
                  onClick={() => setCustomerSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Payment</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {uniquePaymentStatuses.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 pb-5 flex flex-wrap items-center gap-3">
          <button
            onClick={handleSearch}
            className="px-5 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
          >
            Search
          </button>
          <button
            onClick={handleClear}
            className="px-5 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 flex-wrap gap-2">
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

          <div className="flex items-center gap-3">
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
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500">Loading invoices...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-3 py-3 text-center text-xs font-semibold w-[50px]">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Date</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Invoice No.</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Customer</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Status</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Payment</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Amount</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                        No invoices found. Click &quot;New F3&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row) => (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(row.id)}
                            onChange={() => handleSelectRow(row.id)}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.invoiceDate}</td>
                        <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.invoiceNumber}</td>
                        <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.customerName}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(row.invoiceStatus)}`}>
                            {row.invoiceStatus}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentBadge(row.paymentStatus)}`}>
                            {row.paymentStatus}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{formatCurrency(row.grandTotal)}</td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => router.push(`/sales/invoice/create?invoiceId=${row.id}`)}
                              className="p-1 text-blue-500 hover:text-blue-700 rounded hover:bg-blue-50"
                              title="View/Edit"
                            >
                              <FileEdit size={15} />
                            </button>
                            <button
                              onClick={() => handleCancel(row.id)}
                              className="p-1 text-amber-500 hover:text-amber-700 rounded hover:bg-amber-50"
                              title="Cancel"
                              disabled={row.invoiceStatus === "CANCELLED"}
                            >
                              <Printer size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700 font-medium mb-2">
                Total: <span className="ml-2">{formatCurrency(filteredData.reduce((s, r) => s + r.grandTotal, 0))}</span>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
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
                {totalPages > 0 && Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, currentPage - 2);
                  return start + i;
                }).filter((p) => p <= totalPages).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page
                        ? "bg-[#3d9a7e] text-white border-[#3d9a7e]"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
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
