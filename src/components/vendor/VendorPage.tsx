"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ApiVendor {
  id: number;
  vendorCode: string;
  vendorName: string;
  contactPerson: string | null;
  mobileNumber: string;
  alternateMobile: string | null;
  email: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  stateCode: string | null;
  country: string;
  postalCode: string | null;
  paymentTerms: string | null;
  creditLimit: string;
  openingBalance: string;
  currentBalance: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function VendorPage() {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [primaryContact, setPrimaryContact] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [showVendorInfo, setShowVendorInfo] = useState(true);
  const [showVendorList, setShowVendorList] = useState(true);
  const [vendors, setVendors] = useState<ApiVendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendors");
      const data = await res.json();
      if (data.success) setVendors(data.vendors);
    } catch {
      console.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const filteredVendors = searchQuery
    ? vendors.filter(
        (v) =>
          v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.mobileNumber.includes(searchQuery) ||
          (v.email && v.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (v.gstNumber && v.gstNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (v.contactPerson && v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : vendors;

  const totalPages = Math.ceil(filteredVendors.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedVendors = filteredVendors.slice(startIndex, startIndex + entriesPerPage);

  const handleSave = async () => {
    if (!mobile.trim() || !name.trim()) return;

    const body: Record<string, unknown> = {
      vendorName: name.trim(),
      mobileNumber: mobile.trim(),
      contactPerson: primaryContact.trim() || null,
      gstNumber: gstin.trim() || null,
      panNumber: pan.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
    };

    try {
      let res: Response;
      if (editId) {
        res = await fetch("/api/vendors", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...body }),
        });
      } else {
        res = await fetch("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save vendor");
        return;
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      handleClear();
      fetchVendors();
    } catch {
      alert("Failed to save vendor");
    }
  };

  const handleClear = () => {
    setMobile("");
    setName("");
    setPrimaryContact("");
    setGstin("");
    setPan("");
    setEmail("");
    setAddress("");
    setEditId(null);
  };

  const handleEdit = (vendor: ApiVendor) => {
    setMobile(vendor.mobileNumber);
    setName(vendor.vendorName);
    setPrimaryContact(vendor.contactPerson || "");
    setGstin(vendor.gstNumber || "");
    setPan(vendor.panNumber || "");
    setEmail(vendor.email || "");
    setAddress(vendor.address || "");
    setEditId(vendor.id);
    setShowVendorInfo(true);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/vendors?id=${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete vendor");
        setDeleteConfirm(null);
        return;
      }
      setDeleteConfirm(null);
      fetchVendors();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch {
      alert("Failed to delete vendor");
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {editId ? "Vendor updated successfully!" : "Vendor saved successfully!"}
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
            <div className="max-w-3xl space-y-4">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Mobile<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Primary Contact</label>
                <input
                  type="text"
                  value={primaryContact}
                  onChange={(e) => setPrimaryContact(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">GSTIN</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">PAN</label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Address (500 max) :</label>
                <textarea
                  value={address}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setAddress(e.target.value);
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Save
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

      {/* Vendor List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Vendor List</h2>
          <button
            onClick={() => setShowVendorList(!showVendorList)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showVendorList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showVendorList && (
          <>
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
                <div className="flex items-center gap-2 ml-4">
                  <button className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 transition-colors">
                    PDF
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 transition-colors">
                    Excel
                  </button>
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

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-12">S.NO</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-20">EDIT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-20">DELETE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">VENDOR CODE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">VENDOR NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">PRIMARY CONTACT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">MOBILE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">GSTIN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">PAN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">EMAIL</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">ADDRESS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                        Loading vendors...
                      </td>
                    </tr>
                  ) : paginatedVendors.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    paginatedVendors.map((vendor, index) => (
                      <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleEdit(vendor)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteClick(vendor.id, vendor.vendorName)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.vendorCode}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{vendor.vendorName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.contactPerson || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.mobileNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.gstNumber || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.panNumber || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.email || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.address || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredVendors.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + entriesPerPage, filteredVendors.length)} of{" "}
                {filteredVendors.length} entries
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

      {/* Footer */}
      <div className="flex items-center justify-between py-2 text-xs text-gray-400">
        <span>&copy; 2025 - POS - V5.06.Nov</span>
        <span className="text-emerald-600 font-medium">LICENSE DATE 01/01/2030</span>
      </div>
    </div>
  );
}
