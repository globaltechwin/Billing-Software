"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { sampleVendors, Vendor } from "./data";

export default function VendorPage() {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [primaryContact, setPrimaryContact] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [email, setEmail] = useState("");
  const [vendorType, setVendorType] = useState("Payment");
  const [address, setAddress] = useState("");
  const [isChessEnabled, setIsChessEnabled] = useState(false);
  const [showVendorInfo, setShowVendorInfo] = useState(true);
  const [showVendorList, setShowVendorList] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>(sampleVendors);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const filteredVendors = searchQuery
    ? vendors.filter(
        (v) =>
          v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.mobile.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.primaryContact.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : vendors;

  const totalPages = Math.ceil(filteredVendors.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedVendors = filteredVendors.slice(startIndex, startIndex + entriesPerPage);

  const handleSave = () => {
    if (!mobile.trim() || !name.trim()) return;

    const exists = vendors.some(
      (v) =>
        v.mobile === mobile.trim() &&
        v.id !== editId
    );
    if (exists) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      return;
    }

    if (editId) {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === editId
            ? {
                ...v,
                mobile: mobile.trim(),
                vendorName: name.trim(),
                primaryContact: primaryContact.trim(),
                gstin: gstin.trim(),
                pan: pan.trim(),
                email: email.trim(),
                vendorType,
                address: address.trim(),
                isChessEnabled,
              }
            : v
        )
      );
    } else {
      const newVendorId = vendors.length > 0 ? Math.max(...vendors.map((v) => v.vendorId)) + 1 : 1;
      const newVendor: Vendor = {
        id: Date.now().toString(),
        vendorId: newVendorId,
        vendorName: name.trim(),
        primaryContact: primaryContact.trim(),
        mobile: mobile.trim(),
        gstin: gstin.trim(),
        pan: pan.trim(),
        email: email.trim(),
        vendorType,
        address: address.trim(),
        isChessEnabled,
      };
      setVendors((prev) => [...prev, newVendor]);
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    handleClear();
  };

  const handleClear = () => {
    setMobile("");
    setName("");
    setPrimaryContact("");
    setGstin("");
    setPan("");
    setEmail("");
    setVendorType("Payment");
    setAddress("");
    setIsChessEnabled(false);
    setEditId(null);
  };

  const handleEdit = (vendor: Vendor) => {
    setMobile(vendor.mobile);
    setName(vendor.vendorName);
    setPrimaryContact(vendor.primaryContact);
    setGstin(vendor.gstin);
    setPan(vendor.pan);
    setEmail(vendor.email);
    setVendorType(vendor.vendorType);
    setAddress(vendor.address);
    setIsChessEnabled(vendor.isChessEnabled);
    setEditId(vendor.id);
    setShowVendorInfo(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      setVendors((prev) => prev.filter((v) => v.id !== deleteConfirm.id));
      setDeleteConfirm(null);
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
                <label className="block text-sm text-gray-700 font-medium mb-1">Vendor Type</label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="vendorType"
                      value="Expense"
                      checked={vendorType === "Expense"}
                      onChange={(e) => setVendorType(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Expense</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="vendorType"
                      value="Payment"
                      checked={vendorType === "Payment"}
                      onChange={(e) => setVendorType(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Payment</span>
                  </label>
                </div>
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isChessEnabled"
                  checked={isChessEnabled}
                  onChange={(e) => setIsChessEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isChessEnabled" className="text-sm text-gray-700 cursor-pointer">
                  Is Chess Enabled
                </label>
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
              <table className="w-full">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-12">S.NO</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-20">EDIT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-20">DELETE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">VENDOR ID</th>
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
                  {paginatedVendors.length === 0 ? (
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
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.vendorId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{vendor.vendorName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.primaryContact}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.mobile}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.gstin}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.pan}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{vendor.address}</td>
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
