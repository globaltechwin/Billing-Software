"use client";

import { useState, useEffect, useCallback } from "react";

interface GSTRate {
  id: number;
  name: string;
  totalPercentage: number;
  cgstPercentage: number;
  sgstPercentage: number;
  igstPercentage: number;
  effectiveFrom: string | null;
  isCustom: boolean;
  isActive: boolean;
  productCount: number;
}

export default function GSTRatesPage() {
  const [rates, setRates] = useState<GSTRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 50;

  const [name, setName] = useState("");
  const [totalPercentage, setTotalPercentage] = useState("");
  const [cgstPercentage, setCgstPercentage] = useState("");
  const [sgstPercentage, setSgstPercentage] = useState("");
  const [igstPercentage, setIgstPercentage] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(true);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gst-rates");
      const data = await res.json();
      if (data.success) setRates(data.rates);
    } catch {
      console.error("Failed to fetch GST rates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/gst-rates")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRates(data.rates);
      })
      .catch(() => console.error("Failed to fetch GST rates"));
  }, []);

  const filteredRates = rates.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || String(r.totalPercentage).includes(q);
  });

  const totalPages = Math.ceil(filteredRates.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedRates = filteredRates.slice(startIndex, startIndex + entriesPerPage);

  const handleTotalChange = (value: string) => {
    setTotalPercentage(value);
    const total = parseFloat(value);
    if (!isNaN(total)) {
      const half = (total / 2).toFixed(2);
      setCgstPercentage(half);
      setSgstPercentage(half);
      setIgstPercentage(value);
    }
  };

  const resetForm = () => {
    setName("");
    setTotalPercentage("");
    setCgstPercentage("");
    setSgstPercentage("");
    setIgstPercentage("");
    setEffectiveFrom("");
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name || totalPercentage === "") {
      alert("Name and total percentage are required");
      return;
    }

    const body = {
      ...(editingId ? { id: editingId } : {}),
      name,
      totalPercentage,
      cgstPercentage: cgstPercentage || "0",
      sgstPercentage: sgstPercentage || "0",
      igstPercentage: igstPercentage || totalPercentage,
      effectiveFrom: effectiveFrom || null,
    };

    try {
      const res = await fetch("/api/gst-rates", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save GST rate");
        return;
      }

      setSuccessMessage(editingId ? "GST rate updated successfully!" : "GST rate created successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      resetForm();
      fetchRates();
    } catch {
      alert("Failed to save GST rate");
    }
  };

  const handleEdit = (rate: GSTRate) => {
    setEditingId(rate.id);
    setName(rate.name);
    setTotalPercentage(String(rate.totalPercentage));
    setCgstPercentage(String(rate.cgstPercentage));
    setSgstPercentage(String(rate.sgstPercentage));
    setIgstPercentage(String(rate.igstPercentage));
    setEffectiveFrom(rate.effectiveFrom ? rate.effectiveFrom.split("T")[0] : "");
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/gst-rates?id=${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete");
        return;
      }
      setDeleteConfirm(null);
      fetchRates();
    } catch {
      alert("Failed to delete GST rate");
    }
  };

  const handleToggleActive = async (rate: GSTRate) => {
    try {
      await fetch("/api/gst-rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rate.id, isActive: !rate.isActive }),
      });
      fetchRates();
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
              Are you sure you want to delete <span className="font-medium">{deleteConfirm.name}</span>?
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
          <h2 className="text-base font-semibold text-gray-800">GST Rate Master</h2>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl">
              <div className="lg:col-span-2">
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Rate Name <span className="text-red-500">*</span>
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. GST 15%"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Total % <span className="text-red-500">*</span>
                </label>
                <input type="number" value={totalPercentage} onChange={(e) => handleTotalChange(e.target.value)}
                  min="0" max="100" step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">CGST %</label>
                <input type="number" value={cgstPercentage} onChange={(e) => setCgstPercentage(e.target.value)}
                  min="0" max="100" step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">SGST %</label>
                <input type="number" value={sgstPercentage} onChange={(e) => setSgstPercentage(e.target.value)}
                  min="0" max="100" step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">IGST %</label>
                <input type="number" value={igstPercentage} onChange={(e) => setIgstPercentage(e.target.value)}
                  min="0" max="100" step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Effective From</label>
                <input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
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
          <h2 className="text-base font-semibold text-gray-800">GST Rate List</h2>
        </div>
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select value={entriesPerPage} onChange={() => {}} className="px-2 py-1 border border-gray-300 rounded-md text-sm">
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-center text-xs font-semibold w-12">S.NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold w-32">ACTIONS</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">NAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">TOTAL %</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CGST %</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">SGST %</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">IGST %</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">EFFECTIVE FROM</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">PRODUCTS</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">TYPE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : paginatedRates.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">No GST rates found</td></tr>
              ) : (
                paginatedRates.map((rate, idx) => (
                  <tr key={rate.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{startIndex + idx + 1}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(rate)} className="text-blue-500 hover:text-blue-700 text-xs underline">Edit</button>
                        {!rate.isCustom ? null : (
                          <>
                            <span className="text-gray-400">/</span>
                            <button onClick={() => setDeleteConfirm({ id: rate.id, name: rate.name })} className="text-red-500 hover:text-red-700 text-xs underline">Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center font-medium">{rate.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{rate.totalPercentage}%</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{rate.cgstPercentage}%</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{rate.sgstPercentage}%</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{rate.igstPercentage}%</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">
                      {rate.effectiveFrom ? new Date(rate.effectiveFrom).toLocaleDateString("en-GB") : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{rate.productCount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${rate.isCustom ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                        {rate.isCustom ? "Custom" : "Default"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleActive(rate)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${rate.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
                        {rate.isActive ? "Active" : "Inactive"}
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
            Showing {filteredRates.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredRates.length)} of {filteredRates.length} entries
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
