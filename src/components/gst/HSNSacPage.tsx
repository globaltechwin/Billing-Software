"use client";

import { useState, useEffect, useCallback } from "react";

interface HSNSacRecord {
  id: number;
  code: string;
  description: string;
  type: string;
  defaultGstRateId: number | null;
  defaultGstRate: { id: number; name: string; totalPercentage: number } | null;
  isActive: boolean;
  productCount: number;
}

interface GSTRate {
  id: number;
  name: string;
  totalPercentage: number;
}

export default function HSNSacPage() {
  const [records, setRecords] = useState<HSNSacRecord[]>([]);
  const [gstRates, setGstRates] = useState<GSTRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 50;

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("HSN");
  const [defaultGstRateId, setDefaultGstRateId] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(true);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; code: string } | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hsn-sac");
      const data = await res.json();
      if (data.success) setRecords(data.records);
    } catch {
      console.error("Failed to fetch HSN/SAC records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/hsn-sac")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRecords(data.records);
      })
      .catch(() => console.error("Failed to fetch HSN/SAC records"));
    fetch("/api/gst-rates")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setGstRates(data.rates.filter((r: GSTRate & { isActive: boolean }) => r.isActive));
      })
      .catch(() => console.error("Failed to fetch GST rates"));
  }, []);

  const filteredRecords = records.filter((r) => {
    const matchesSearch = !searchQuery || r.code.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredRecords.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + entriesPerPage);

  const resetForm = () => {
    setCode("");
    setDescription("");
    setType("HSN");
    setDefaultGstRateId("");
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!code || !description) {
      alert("Code and description are required");
      return;
    }

    const body = {
      ...(editingId ? { id: editingId } : {}),
      code: code.toUpperCase(),
      description,
      type,
      defaultGstRateId: defaultGstRateId ? Number(defaultGstRateId) : null,
    };

    try {
      const res = await fetch("/api/hsn-sac", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save HSN/SAC");
        return;
      }

      setSuccessMessage(editingId ? "HSN/SAC updated successfully!" : "HSN/SAC created successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      resetForm();
      fetchRecords();
    } catch {
      alert("Failed to save HSN/SAC");
    }
  };

  const handleEdit = (record: HSNSacRecord) => {
    setEditingId(record.id);
    setCode(record.code);
    setDescription(record.description);
    setType(record.type);
    setDefaultGstRateId(record.defaultGstRateId ? String(record.defaultGstRateId) : "");
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/hsn-sac?id=${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete");
        return;
      }
      setDeleteConfirm(null);
      fetchRecords();
    } catch {
      alert("Failed to delete HSN/SAC");
    }
  };

  const handleToggleActive = async (record: HSNSacRecord) => {
    try {
      await fetch("/api/hsn-sac", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id, isActive: !record.isActive }),
      });
      fetchRecords();
    } catch {
      console.error("Failed to toggle");
    }
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
              Are you sure you want to delete HSN/SAC <span className="font-medium">{deleteConfirm.code}</span>?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">HSN/SAC Master</h2>
          <button onClick={() => setShowForm(!showForm)} className="text-gray-500 hover:text-gray-700">
            {showForm ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            )}
          </button>
        </div>
        {showForm && (
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. 0401 or 9954"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Milk and cream"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="HSN">HSN</option>
                  <option value="SAC">SAC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Default GST Rate</label>
                <select value={defaultGstRateId} onChange={(e) => setDefaultGstRateId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">-- Select Rate --</option>
                  {gstRates.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.totalPercentage}%)</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={handleSave}
                className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors">
                {editingId ? "Update" : "Save"}
              </button>
              <button onClick={resetForm}
                className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors">
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">HSN/SAC List</h2>
        </div>
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 font-medium">Type</label>
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="All">All</option>
                <option value="HSN">HSN</option>
                <option value="SAC">SAC</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-center text-xs font-semibold w-12">S.NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold w-32">ACTIONS</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CODE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">DESCRIPTION</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">TYPE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">DEFAULT GST RATE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">PRODUCTS</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : paginatedRecords.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No HSN/SAC records found</td></tr>
              ) : (
                paginatedRecords.map((record, idx) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{startIndex + idx + 1}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(record)} className="text-blue-500 hover:text-blue-700 text-xs underline">Edit</button>
                        <span className="text-gray-400">/</span>
                        <button onClick={() => setDeleteConfirm({ id: record.id, code: record.code })} className="text-red-500 hover:text-red-700 text-xs underline">Delete</button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center font-medium">{record.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{record.description}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.type === "HSN" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">
                      {record.defaultGstRate ? `${record.defaultGstRate.name}` : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{record.productCount}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleActive(record)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${record.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
                        {record.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-gray-600">
            Showing {filteredRecords.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredRecords.length)} of {filteredRecords.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Previous</button>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-2 text-xs text-gray-400">
        <span>&copy; 2025 - POS - V5.06.Nov</span>
        <span className="text-emerald-600 font-medium">LICENSE DATE 01/01/2030</span>
      </div>
    </div>
  );
}
