"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Unit } from "./data";

export default function UnitPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [unitName, setUnitName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const [showUnitMaster, setShowUnitMaster] = useState(true);
  const [showUnitList, setShowUnitList] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [formError, setFormError] = useState("");

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/units");
      const data = await res.json();
      if (data.success && data.units) {
        const formatted = data.units.map((u: Record<string, unknown>) => ({
          id: u.id,
          unitName: u.unitName,
          shortName: u.shortName,
          description: u.description,
          displayOrder: u.displayOrder,
          isActive: u.isActive,
          createdByUserId: u.createdByUserId,
          createdByName: (u.createdByUser as Record<string, unknown>)?.name || "",
          createdAt: u.createdAt,
        }));
        setUnits(formatted);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnits();
  }, [fetchUnits]);

  const filteredUnits = units.filter((u) => {
    const matchesStatus = !statusFilter ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "inactive" && !u.isActive);
    const matchesSearch = !searchQuery ||
      u.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.description && u.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredUnits.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedUnits = filteredUnits.slice(startIndex, startIndex + entriesPerPage);

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSave = async () => {
    if (!unitName.trim() || !shortName.trim()) {
      setFormError("Unit Name and Short Name are required");
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        unitName: unitName.trim(),
        shortName: shortName.trim(),
        description: description.trim() || null,
        displayOrder: parseInt(displayOrder) || 0,
      };

      if (editId) {
        body.id = editId;
        const res = await fetch("/api/units", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update unit");
        showSuccessToast("Unit updated successfully!");
      } else {
        const res = await fetch("/api/units", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create unit");
        showSuccessToast("Unit saved successfully!");
      }

      handleClear();
      fetchUnits();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setUnitName("");
    setShortName("");
    setDescription("");
    setDisplayOrder("");
    setEditId(null);
    setFormError("");
  };

  const handleEdit = (unit: Unit) => {
    setUnitName(unit.unitName);
    setShortName(unit.shortName);
    setDescription(unit.description || "");
    setDisplayOrder(unit.displayOrder.toString());
    setEditId(unit.id);
    setShowUnitMaster(true);
  };

  const handleToggleStatus = async (unit: Unit) => {
    try {
      const res = await fetch("/api/units", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: unit.id, isActive: !unit.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      showSuccessToast(`Unit ${unit.isActive ? "deactivated" : "activated"} successfully!`);
      fetchUnits();
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
      const res = await fetch(`/api/units?id=${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete unit");
      showSuccessToast("Unit deleted successfully!");
      setDeleteConfirm(null);
      fetchUnits();
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

      {/* Unit Master Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Unit Master</h2>
          <button
            onClick={() => setShowUnitMaster(!showUnitMaster)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showUnitMaster ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showUnitMaster && (
          <div className="p-6 space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-6 max-w-3xl">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Unit Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="e.g. Kilogram"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Short Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. KG"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 max-w-3xl">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  min="0"
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

      {/* Unit List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Unit List</h2>
          <button
            onClick={() => setShowUnitList(!showUnitList)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showUnitList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showUnitList && (
          <>
            {/* Table Controls */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-2 ml-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-16">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-24">ACTIONS</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">UNIT NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">SHORT NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">DESCRIPTION</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">STATUS</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED BY</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading units...
                        </div>
                      </td>
                    </tr>
                  ) : paginatedUnits.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    paginatedUnits.map((unit, index) => (
                      <tr key={unit.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(unit)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(unit)}
                              className={`text-xs font-medium px-2 py-0.5 rounded ${
                                unit.isActive
                                  ? "text-emerald-700 hover:bg-emerald-50"
                                  : "text-red-700 hover:bg-red-50"
                              }`}
                              title={unit.isActive ? "Deactivate" : "Activate"}
                            >
                              {unit.isActive ? "Active" : "Inactive"}
                            </button>
                            <button
                              onClick={() => handleDeleteClick(unit.id, unit.unitName)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{unit.unitName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{unit.shortName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{unit.description || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            unit.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}>
                            {unit.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{unit.createdByName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(unit.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredUnits.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + entriesPerPage, filteredUnits.length)} of{" "}
                {filteredUnits.length} entries
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
