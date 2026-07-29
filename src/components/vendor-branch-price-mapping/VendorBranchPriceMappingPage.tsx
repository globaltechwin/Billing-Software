"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  vendorList,
  branchList,
  samplePriceMappings,
  VendorBranchPriceMapping,
} from "./data";

export default function VendorBranchPriceMappingPage() {
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [showVendorInfo, setShowVendorInfo] = useState(true);
  const [showBranchList, setShowBranchList] = useState(true);
  const [mappings, setMappings] = useState<VendorBranchPriceMapping[]>(samplePriceMappings);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const filteredMappings = searchQuery
    ? mappings.filter(
        (m) =>
          m.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.prodName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mappings;

  const totalPages = Math.ceil(filteredMappings.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedMappings = filteredMappings.slice(startIndex, startIndex + entriesPerPage);

  const handleSave = () => {
    if (!selectedVendor || !selectedBranch || !productName.trim() || !amount) return;

    const vendor = vendorList.find((v) => v.id === selectedVendor);
    const branch = branchList.find((b) => b.id === selectedBranch);
    if (!vendor || !branch) return;

    const exists = mappings.some(
      (m) =>
        m.vendorId === selectedVendor &&
        m.branchId === selectedBranch &&
        m.prodName.toLowerCase() === productName.trim().toLowerCase() &&
        m.id !== editId
    );
    if (exists) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      return;
    }

    if (editId) {
      setMappings((prev) =>
        prev.map((m) =>
          m.id === editId
            ? {
                ...m,
                vendorId: selectedVendor,
                vendorName: vendor.name,
                branchId: selectedBranch,
                branchName: branch.name,
                prodName: productName.trim(),
                amount: parseFloat(amount) || 0,
              }
            : m
        )
      );
    } else {
      const newMapping: VendorBranchPriceMapping = {
        id: Date.now().toString(),
        vendorId: selectedVendor,
        vendorName: vendor.name,
        branchId: selectedBranch,
        branchName: branch.name,
        prodId: String(Date.now()),
        prodName: productName.trim(),
        amount: parseFloat(amount) || 0,
        createdDate: new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      };
      setMappings((prev) => [...prev, newMapping]);
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    handleClear();
  };

  const handleClear = () => {
    setSelectedVendor("");
    setSelectedBranch("");
    setProductName("");
    setAmount("");
    setEditId(null);
  };

  const handleEdit = (mapping: VendorBranchPriceMapping) => {
    setSelectedVendor(mapping.vendorId);
    setSelectedBranch(mapping.branchId);
    setProductName(mapping.prodName);
    setAmount(mapping.amount.toString());
    setEditId(mapping.id);
    setShowVendorInfo(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      setMappings((prev) => prev.filter((m) => m.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {editId ? "Price mapping updated successfully!" : "Price mapping saved successfully!"}
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
            <div className="grid grid-cols-2 gap-6 max-w-3xl">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Vendor Name<span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Vendor</option>
                  {vendorList.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Branch Name<span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Branch</option>
                  {branchList.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Product Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter Product"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Amount<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter Amount"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
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
                    <th className="px-4 py-3 text-left text-xs font-semibold">VENDORID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">VENDORNAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">BRANCHID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">BRANCHNAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">PRODID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">PRODNAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">AMOUNT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATEDDATE</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMappings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    paginatedMappings.map((mapping, index) => (
                      <tr key={mapping.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleEdit(mapping)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteClick(mapping.id, `${mapping.vendorName} - ${mapping.prodName}`)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{mapping.vendorId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{mapping.vendorName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{mapping.branchId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{mapping.branchName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{mapping.prodId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{mapping.prodName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{mapping.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{mapping.createdDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredMappings.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + entriesPerPage, filteredMappings.length)} of{" "}
                {filteredMappings.length} entries
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
