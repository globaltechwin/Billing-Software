"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, Settings, X } from "lucide-react";

interface EstimateRecord {
  id: number;
  estimateNumber: string;
  estimateDate: string;
  expiryDate: string | null;
  customerName: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED";
  grandTotal: number;
}

export default function EstimatePage() {
  const router = useRouter();
  const [estimates, setEstimates] = useState<EstimateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [estimateNoSearch, setEstimateNoSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showData, setShowData] = useState(false);

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(entriesPerPage),
        sortBy: "estimateDate",
        sortOrder: "desc",
      });
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      if (customerSearch) params.set("customerName", customerSearch);
      if (estimateNoSearch) params.set("estimateNo", estimateNoSearch);

      const res = await fetch(`/api/estimates?${params.toString()}`);
      const data = await res.json();
      if (data.estimates) {
        setEstimates(
          data.estimates.map((e: Record<string, unknown>) => ({
            id: e.id as number,
            estimateNumber: e.estimateNumber as string,
            estimateDate: new Date(e.estimateDate as string).toLocaleDateString("en-IN"),
            expiryDate: e.expiryDate ? new Date(e.expiryDate as string).toLocaleDateString("en-IN") : null,
            customerName: (e.customer as Record<string, unknown> | null)?.customerName as string || "Walk-in",
            status: e.status as EstimateRecord["status"],
            grandTotal: Number(e.grandTotal),
          }))
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, searchQuery, statusFilter, customerSearch, estimateNoSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEstimates();
  }, [fetchEstimates]);

  const uniqueEstimateNos = [...new Set(estimates.map((r) => r.estimateNumber))];
  const uniqueCustomers = [...new Set(estimates.map((r) => r.customerName))];
  const uniqueStatuses = ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED", "CONVERTED"];

  const filteredData = estimates;

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchEstimates();
  };

  const handleClear = () => {
    setEstimateNoSearch("");
    setCustomerSearch("");
    setStatusFilter("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      ACCEPTED: "bg-green-100 text-green-700 border border-green-200",
      REJECTED: "bg-red-100 text-red-700 border border-red-200",
      EXPIRED: "bg-gray-100 text-gray-600 border border-gray-200",
    };
    return styles[status] || styles.PENDING;
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEstimates((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus as EstimateRecord["status"] } : e))
        );
      }
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Top Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/sales/estimate/create")}
            className="flex items-center gap-2 px-5 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
          >
            New F3
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            <Settings size={14} />
            Templates
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-semibold text-gray-800">All Estimates</h2>
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
            <label className="text-sm font-medium text-gray-700">Estimate No</label>
            <div className="relative">
              <select
                value={estimateNoSearch}
                onChange={(e) => setEstimateNoSearch(e.target.value)}
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none w-[200px]"
              >
                <option value="">--Search in Estimate No--</option>
                {uniqueEstimateNos.map((no) => (
                  <option key={no} value={no}>{no}</option>
                ))}
              </select>
              {estimateNoSearch && (
                <button
                  onClick={() => setEstimateNoSearch("")}
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
              <select
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none w-[220px]"
              >
                <option value="">--Search in Customer--</option>
                {uniqueCustomers.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none w-[160px]"
              >
                <option value="">--Status--</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                ))}
              </select>
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
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
          <div className="px-4 py-12 text-center text-sm text-gray-500">Loading estimates...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-3 py-3 text-center text-xs font-semibold w-[60px]">S.No</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Estimate No</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Estimate Date</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Expiry Date</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Customer Name</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Status</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Amount</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                        No estimates found. Click "New F3" to create one.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row, idx) => (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm text-gray-700 text-center">{startIndex + idx + 1}</td>
                        <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.estimateNumber}</td>
                        <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.estimateDate}</td>
                        <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.expiryDate || "—"}</td>
                        <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.customerName}</td>
                        <td className="px-3 py-3 text-center">
                          <select
                            value={row.status}
                            onChange={(e) => handleStatusChange(row.id, e.target.value)}
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${getStatusBadge(row.status)}`}
                          >
                            {uniqueStatuses.map((s) => (
                              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{formatCurrency(row.grandTotal)}</td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => router.push(`/sales/estimate/create?id=${row.id}`)}
                              className="text-blue-500 hover:text-blue-700 text-xs underline"
                            >
                              Edit
                            </button>
                            {row.status !== "CONVERTED" && (
                              <button
                                onClick={() => router.push(`/sales/invoice/create?estimateId=${row.id}`)}
                                className="text-green-600 hover:text-green-800 text-xs underline"
                              >
                                Convert
                              </button>
                            )}
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
