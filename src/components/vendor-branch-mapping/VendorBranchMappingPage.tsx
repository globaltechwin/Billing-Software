"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Vendor, Branch, VendorBranchMapping } from "./data";

export default function VendorBranchMappingPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [mappings, setMappings] = useState<VendorBranchMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showVendorInfo, setShowVendorInfo] = useState(true);
  const [showBranchList, setShowBranchList] = useState(true);

  const [selectedVendor, setSelectedVendor] = useState<number | "">("");
  const [selectedBranch, setSelectedBranch] = useState<number | "">("");
  const [status, setStatus] = useState("ACTIVE");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const [vendorFilter, setVendorFilter] = useState<number | "">("");
  const [branchFilter, setBranchFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [formError, setFormError] = useState("");

  const fetchVendors = useCallback(async () => {
    try {
      const res = await fetch("/api/vendors");
      const data = await res.json();
      if (data.success && data.vendors) {
        setVendors(data.vendors);
      }
    } catch {
      // silently fail
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch("/api/branches");
      const data = await res.json();
      if (data.success && data.branches) {
        setBranches(data.branches);
      }
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
      if (vendorFilter) params.set("vendorId", String(vendorFilter));
      if (branchFilter) params.set("branchId", String(branchFilter));
      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/vendor-branch-mappings?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.mappings) {
        const formatted = data.mappings.map((m: Record<string, unknown>) => ({
          id: m.id,
          vendorId: m.vendorId,
          vendorName: (m.vendor as Record<string, unknown>)?.vendorName || "",
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
  }, [currentPage, entriesPerPage, vendorFilter, branchFilter, statusFilter, searchQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVendors();
    fetchBranches();
  }, [fetchVendors, fetchBranches]);

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

  const handleSave = async () => {
    if (!selectedVendor || !selectedBranch) {
      setFormError("Vendor and Branch are required");
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        vendorId: selectedVendor,
        branchId: selectedBranch,
        status,
        effectiveFrom: effectiveFrom || null,
        effectiveTo: effectiveTo || null,
        remarks: remarks || null,
      };

      if (editId) {
        body.id = editId;
        const res = await fetch("/api/vendor-branch-mappings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update mapping");
        showSuccessToast("Vendor branch mapping updated successfully!");
      } else {
        const res = await fetch("/api/vendor-branch-mappings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create mapping");
        showSuccessToast("Vendor branch mapping saved successfully!");
      }

      handleClear();
      fetchMappings();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setSelectedVendor("");
    setSelectedBranch("");
    setStatus("ACTIVE");
    setEffectiveFrom("");
    setEffectiveTo("");
    setRemarks("");
    setEditId(null);
    setFormError("");
  };

  const handleEdit = (mapping: VendorBranchMapping) => {
    setSelectedVendor(mapping.vendorId);
    setSelectedBranch(mapping.branchId);
    setStatus(mapping.status);
    setEffectiveFrom(mapping.effectiveFrom ? mapping.effectiveFrom.substring(0, 10) : "");
    setEffectiveTo(mapping.effectiveTo ? mapping.effectiveTo.substring(0, 10) : "");
    setRemarks(mapping.remarks || "");
    setEditId(mapping.id);
    setShowVendorInfo(true);
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

      {/* Vendor Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Vendor Info.</h2>
          <button
            onClick={() => setShowVendorInfo(!showVendorInfo)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showVendorInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showVendorInfo && (
          <div className="p-6 space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-3 gap-6 max-w-4xl">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Vendor Name<span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.vendorName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Branch Name<span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.branchName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 max-w-4xl">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Effective From</label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Effective To</label>
                <input
                  type="date"
                  value={effectiveTo}
                  onChange={(e) => setEffectiveTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId ? "Update" : "Save"}
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vendor Branch List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Vendor Branch List</h2>
          <button
            onClick={() => setShowBranchList(!showBranchList)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showBranchList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showBranchList && (
          <>
            {/* Filters */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-2 ml-2">
                  <select
                    value={vendorFilter}
                    onChange={(e) => {
                      setVendorFilter(e.target.value ? Number(e.target.value) : "");
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Vendors</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.vendorName}</option>
                    ))}
                  </select>
                  <select
                    value={branchFilter}
                    onChange={(e) => {
                      setBranchFilter(e.target.value ? Number(e.target.value) : "");
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Branches</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.branchName}</option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-12">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-24">ACTIONS</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">VENDOR NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">BRANCH NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">STATUS</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">EFFECTIVE FROM</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">EFFECTIVE TO</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED BY</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading mappings...
                        </div>
                      </td>
                    </tr>
                  ) : mappings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
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
                              onClick={() => handleEdit(mapping)}
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
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{mapping.vendorName}</td>
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
