"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, Loader2, Eye } from "lucide-react";
import { VendorBranchMapping, Vendor, Branch } from "./data";

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

function SortIcon({ column, sortBy, sortOrder }: { column: string; sortBy: string; sortOrder: string }) {
  if (sortBy !== column) return <span className="ml-1 text-gray-400">&#8645;</span>;
  return <span className="ml-1 text-white">{sortOrder === "asc" ? "&#9650;" : "&#9660;"}</span>;
}

export default function VendorBranchListPage() {
  const [mappings, setMappings] = useState<VendorBranchMapping[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [showCard, setShowCard] = useState(true);

  const [vendorFilter, setVendorFilter] = useState<number | "">("");
  const [branchFilter, setBranchFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [viewMapping, setViewMapping] = useState<VendorBranchMapping | null>(null);

  const fetchRefData = useCallback(async () => {
    try {
      const [vRes, bRes] = await Promise.all([
        fetch("/api/vendors"),
        fetch("/api/branches"),
      ]);
      const vData = await vRes.json();
      const bData = await bRes.json();
      if (vData.success) setVendors(vData.vendors);
      if (bData.success) setBranches(bData.branches);
    } catch {
      // silently fail
    }
  }, []);

  const fetchMappings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(entriesPerPage));
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      if (vendorFilter) params.set("vendorId", String(vendorFilter));
      if (branchFilter) params.set("branchId", String(branchFilter));
      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);
      if (dateFrom) params.set("effectiveFromGte", dateFrom);
      if (dateTo) params.set("effectiveToLte", dateTo);

      const res = await fetch(`/api/vendor-branch-mappings?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.mappings) {
        const formatted = data.mappings.map((m: Record<string, unknown>) => ({
          id: m.id,
          vendorId: m.vendorId,
          vendorName: (m.vendor as Record<string, unknown>)?.vendorName || "",
          vendorCode: (m.vendor as Record<string, unknown>)?.vendorCode || "",
          branchId: m.branchId,
          branchName: (m.branch as Record<string, unknown>)?.branchName || "",
          status: m.status,
          effectiveFrom: m.effectiveFrom,
          effectiveTo: m.effectiveTo,
          remarks: m.remarks,
          isActive: m.isActive,
          createdByUserId: m.createdByUserId,
          createdByName: (m.createdByUser as Record<string, unknown>)?.name || "",
          createdAt: m.createdAt,
        }));
        setMappings(formatted);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, vendorFilter, branchFilter, statusFilter, searchQuery, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRefData();
  }, [fetchRefData]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMappings();
  }, [fetchMappings]);

  const totalPages = Math.ceil(totalCount / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleToggleStatus = async (mapping: VendorBranchMapping) => {
    try {
      const newStatus = mapping.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const res = await fetch("/api/vendor-branch-mappings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mapping.id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      showSuccessToast(`Mapping ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully!`);
      fetchMappings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/vendor-branch-mappings?id=${deleteConfirm.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete mapping");
      showSuccessToast("Mapping deleted successfully!");
      setDeleteConfirm(null);
      fetchMappings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
      setDeleteConfirm(null);
    }
  };

  const handleExportCsv = () => {
    if (mappings.length === 0) return;
    const headers = [
      "MAPPING ID", "VENDOR NAME", "VENDOR CODE", "BRANCH NAME",
      "STATUS", "EFFECTIVE FROM", "EFFECTIVE TO", "CREATED BY", "CREATED DATE",
    ];
    const rows = mappings.map((m) => [
      m.id,
      m.vendorName,
      m.vendorCode,
      m.branchName,
      m.status,
      formatDate(m.effectiveFrom),
      formatDate(m.effectiveTo),
      m.createdByName,
      formatDate(m.createdAt),
    ]);
    downloadCsv(headers, rows, "Vendor-Branch-Mappings.csv");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {successMessage}
        </div>
      )}

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

      {viewMapping && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Mapping Details</h3>
              <button
                onClick={() => setViewMapping(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500">Mapping ID:</span><br /><span className="font-medium">{viewMapping.id}</span></div>
                <div><span className="text-gray-500">Status:</span><br />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block mt-1 ${
                    viewMapping.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>{viewMapping.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500">Vendor Name:</span><br /><span className="font-medium">{viewMapping.vendorName}</span></div>
                <div><span className="text-gray-500">Vendor Code:</span><br /><span className="font-medium">{viewMapping.vendorCode || "-"}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500">Branch Name:</span><br /><span className="font-medium">{viewMapping.branchName}</span></div>
                <div><span className="text-gray-500">Branch Code:</span><br /><span className="font-medium">-</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500">Effective From:</span><br /><span className="font-medium">{formatDate(viewMapping.effectiveFrom)}</span></div>
                <div><span className="text-gray-500">Effective To:</span><br /><span className="font-medium">{formatDate(viewMapping.effectiveTo)}</span></div>
              </div>
              {viewMapping.remarks && (
                <div><span className="text-gray-500">Remarks:</span><br /><span className="font-medium">{viewMapping.remarks}</span></div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div><span className="text-gray-500">Created By:</span><br /><span className="font-medium">{viewMapping.createdByName}</span></div>
                <div><span className="text-gray-500">Created Date:</span><br /><span className="font-medium">{formatDate(viewMapping.createdAt)}</span></div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewMapping(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Branch List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Vendor Branch List</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={mappings.length === 0}
              className="px-3 py-1 bg-emerald-500 text-white rounded-md text-xs font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              Export CSV
            </button>
            <button
              onClick={() => setShowCard(!showCard)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showCard ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {showCard && (
          <>
            {/* Filters */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
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
                <select
                  value={vendorFilter}
                  onChange={(e) => { setVendorFilter(e.target.value ? Number(e.target.value) : ""); setCurrentPage(1); }}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Vendors</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.vendorName}</option>
                  ))}
                </select>
                <select
                  value={branchFilter}
                  onChange={(e) => { setBranchFilter(e.target.value ? Number(e.target.value) : ""); setCurrentPage(1); }}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.branchName}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">From:</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[140px]"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">To:</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[140px]"
                  />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-gray-600">Search:</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-16">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-36">ACTIONS</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]"
                      onClick={() => handleSort("id")}
                    >
                      MAPPING ID <SortIcon column="id" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]"
                      onClick={() => handleSort("vendorId")}
                    >
                      VENDOR NAME <SortIcon column="vendorId" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">VENDOR CODE</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]"
                      onClick={() => handleSort("branchId")}
                    >
                      BRANCH NAME <SortIcon column="branchId" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]"
                      onClick={() => handleSort("status")}
                    >
                      STATUS <SortIcon column="status" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]"
                      onClick={() => handleSort("effectiveFrom")}
                    >
                      EFFECTIVE FROM <SortIcon column="effectiveFrom" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]"
                      onClick={() => handleSort("effectiveTo")}
                    >
                      EFFECTIVE TO <SortIcon column="effectiveTo" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED BY</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]"
                      onClick={() => handleSort("createdAt")}
                    >
                      CREATED DATE <SortIcon column="createdAt" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading mappings...
                        </div>
                      </td>
                    </tr>
                  ) : mappings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    mappings.map((mapping, index) => (
                      <tr key={mapping.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewMapping(mapping)}
                              className="text-gray-500 hover:text-gray-700"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                const params = new URLSearchParams();
                                params.set("id", String(mapping.id));
                                params.set("vendorId", String(mapping.vendorId));
                                params.set("branchId", String(mapping.branchId));
                                params.set("status", mapping.status);
                                if (mapping.effectiveFrom) params.set("effectiveFrom", mapping.effectiveFrom.substring(0, 10));
                                if (mapping.effectiveTo) params.set("effectiveTo", mapping.effectiveTo.substring(0, 10));
                                if (mapping.remarks) params.set("remarks", mapping.remarks);
                                window.location.href = `/master/vendor-branch-mapping?${params.toString()}`;
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(mapping)}
                              className={`text-xs font-medium px-2 py-0.5 rounded ${
                                mapping.status === "ACTIVE"
                                  ? "text-emerald-700 hover:bg-emerald-50"
                                  : "text-red-700 hover:bg-red-50"
                              }`}
                              title={mapping.status === "ACTIVE" ? "Deactivate" : "Activate"}
                            >
                              {mapping.status === "ACTIVE" ? "Active" : "Inactive"}
                            </button>
                            <button
                              onClick={() => handleDeleteClick(mapping.id, `${mapping.vendorName} - ${mapping.branchName}`)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{mapping.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{mapping.vendorName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{mapping.vendorCode || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{mapping.branchName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            mapping.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}>
                            {mapping.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(mapping.effectiveFrom)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(mapping.effectiveTo)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{mapping.createdByName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(mapping.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {totalCount > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + entriesPerPage, totalCount)} of {totalCount} entries
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
    </div>
  );
}
