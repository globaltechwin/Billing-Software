"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Printer,
  Trash2,
  FileText,
  ArrowRightLeft,
  Loader2,
} from "lucide-react";
import InvoicePrintPreview from "@/components/billing/InvoicePrintPreview";

interface EstimateRow {
  id: number;
  estimateNumber: string;
  estimateDate: string;
  expiryDate: string | null;
  customerName: string;
  customerPhone: string;
  gstMode: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  status: string;
  remarks: string;
  itemCount: number;
  createdBy: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  ACCEPTED: "bg-green-100 text-green-700 border border-green-200",
  REJECTED: "bg-red-100 text-red-700 border border-red-200",
  EXPIRED: "bg-gray-100 text-gray-600 border border-gray-200",
  CONVERTED: "bg-blue-100 text-blue-700 border border-blue-200",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

export default function QuotationsListPage() {
  const [estimates, setEstimates] = useState<EstimateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [converting, setConverting] = useState<number | null>(null);
  const [printEstimateId, setPrintEstimateId] = useState<number | null>(null);

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(entriesPerPage));
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/estimates?${params.toString()}`);
      const data = await res.json();

      const rows: EstimateRow[] = (data.estimates || []).map(
        (e: Record<string, unknown>) => ({
          id: e.id as number,
          estimateNumber: e.estimateNumber as string,
          estimateDate: e.estimateDate as string,
          expiryDate: e.expiryDate as string | null,
          customerName: (e.customer as Record<string, unknown>)?.customerName as string || "",
          customerPhone: (e.customer as Record<string, unknown>)?.phone as string || "",
          gstMode: e.gstMode as string,
          subtotal: Number(e.subtotal),
          discountAmount: Number(e.discountAmount),
          taxAmount: Number(e.taxAmount),
          grandTotal: Number(e.grandTotal),
          status: e.status as string,
          remarks: (e.remarks as string) || "",
          itemCount: Array.isArray(e.items) ? e.items.length : 0,
          createdBy: (e.createdByUser as Record<string, unknown>)?.name as string || "",
        })
      );

      setEstimates(rows);
      setPagination(data.pagination);
    } catch (e) {
      console.error("Failed to fetch estimates:", e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetch("/api/estimates")
      .then((res) => res.json())
      .then((data) => {
        const rows: EstimateRow[] = (data.estimates || []).map(
          (e: Record<string, unknown>) => ({
            id: e.id as number,
            estimateNumber: e.estimateNumber as string,
            estimateDate: e.estimateDate as string,
            expiryDate: e.expiryDate as string | null,
            customerName: (e.customer as Record<string, unknown>)?.customerName as string || "",
            customerPhone: (e.customer as Record<string, unknown>)?.phone as string || "",
            gstMode: e.gstMode as string,
            subtotal: Number(e.subtotal),
            discountAmount: Number(e.discountAmount),
            taxAmount: Number(e.taxAmount),
            grandTotal: Number(e.grandTotal),
            status: e.status as string,
            remarks: (e.remarks as string) || "",
            itemCount: Array.isArray(e.items) ? e.items.length : 0,
            createdBy: (e.createdByUser as Record<string, unknown>)?.name as string || "",
          })
        );
        setEstimates(rows);
        setPagination(data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleConvert = async (estimateId: number) => {
    setConverting(estimateId);
    try {
      const res = await fetch("/api/invoices/convert-from-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimateId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Converted! Invoice: ${data.invoice.invoiceNumber}`);
        fetchEstimates();
      } else {
        alert(data.error || "Failed to convert");
      }
    } catch {
      alert("Failed to convert quotation");
    } finally {
      setConverting(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/estimates?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setEstimates((prev) => prev.filter((e) => e.id !== id));
        setDeleteConfirm(null);
      }
    } catch {
      alert("Failed to delete");
    }
  };

  const totalPages = pagination.totalPages;
  const startIndex = (currentPage - 1) * entriesPerPage;

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Quotations</h1>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Controls */}
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">entries</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
              <option value="CONVERTED">Converted</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search number / customer..."
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-[220px]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-amber-500 text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold">NUMBER</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CUSTOMER</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">ITEMS</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">SUBTOTAL</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">TAX</th>
                <th className="px-4 py-3 text-right text-xs font-semibold">TOTAL</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">STATUS</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin inline-block mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : estimates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                    No quotations found
                  </td>
                </tr>
              ) : (
                estimates.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{row.estimateNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(row.estimateDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {row.customerName || <span className="text-gray-400 italic">Walk-in</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.itemCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">₹{row.subtotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">₹{row.taxAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">₹{row.grandTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[row.status] || "bg-gray-100 text-gray-600"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setPrintEstimateId(row.id)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 rounded hover:bg-blue-50"
                          title="Print Quotation"
                        >
                          <Printer size={15} />
                        </button>
                        {row.status !== "CONVERTED" && (
                          <button
                            onClick={() => handleConvert(row.id)}
                            disabled={converting === row.id}
                            className="p-1.5 text-green-600 hover:text-green-700 rounded hover:bg-green-50 disabled:opacity-50"
                            title="Convert to Invoice"
                          >
                            {converting === row.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <ArrowRightLeft size={15} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(row.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
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

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-gray-600">
            Showing {estimates.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + entriesPerPage, pagination.total)} of {pagination.total} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === page
                    ? "bg-amber-500 text-white border-amber-500"
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
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Delete Quotation</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600">Are you sure you want to delete this quotation? This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {printEstimateId && (
        <InvoicePrintPreview
          invoiceId={printEstimateId}
          onClose={() => setPrintEstimateId(null)}
          showQR={false}
          docType="QUOTATION"
        />
      )}
    </div>
  );
}
