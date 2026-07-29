"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { sampleCustomers, Customer } from "./data";

export default function CustomerPage() {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [anniversaryDate, setAnniversaryDate] = useState("");
  const [loyaltyCardNumber, setLoyaltyCardNumber] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [wallet, setWallet] = useState("");
  const [showCustomerInfo, setShowCustomerInfo] = useState(true);
  const [showCustomerList, setShowCustomerList] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const filteredCustomers = searchQuery
    ? customers.filter(
        (c) =>
          c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.mobile.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : customers;

  const totalPages = Math.ceil(filteredCustomers.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + entriesPerPage);

  const handleSave = () => {
    if (!mobile.trim() || !name.trim()) return;

    const exists = customers.some(
      (c) =>
        c.mobile === mobile.trim() &&
        c.id !== editId
    );
    if (exists) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      return;
    }

    if (editId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editId
            ? {
                ...c,
                mobile: mobile.trim(),
                customerName: name.trim(),
                address: address.trim(),
                gstin: gstin.trim(),
                pan: pan.trim(),
                companyName: companyName.trim(),
                email: email.trim(),
                gender,
                dateOfBirth,
                anniversaryDate,
                loyaltyCardNumber: loyaltyCardNumber.trim(),
                rewardPoints: rewardPoints.trim(),
                customerType,
                wallet: parseFloat(wallet) || 0,
              }
            : c
        )
      );
    } else {
      const newCustomerId = customers.length > 0 ? Math.max(...customers.map((c) => c.customerId)) + 1 : 2968;
      const newCustomer: Customer = {
        id: Date.now().toString(),
        customerId: newCustomerId,
        customerName: name.trim(),
        employeeId: "",
        gender,
        mobile: mobile.trim(),
        email: email.trim(),
        dateOfBirth,
        address: address.trim(),
        loyalty: loyaltyCardNumber.trim(),
        gstin: gstin.trim(),
        pan: pan.trim(),
        companyName: companyName.trim(),
        anniversaryDate,
        loyaltyCardNumber: loyaltyCardNumber.trim(),
        rewardPoints: rewardPoints.trim(),
        customerType,
        wallet: parseFloat(wallet) || 0,
      };
      setCustomers((prev) => [...prev, newCustomer]);
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    handleClear();
  };

  const handleClear = () => {
    setMobile("");
    setName("");
    setAddress("");
    setGstin("");
    setPan("");
    setCompanyName("");
    setEmail("");
    setGender("");
    setDateOfBirth("");
    setAnniversaryDate("");
    setLoyaltyCardNumber("");
    setRewardPoints("");
    setCustomerType("");
    setWallet("");
    setEditId(null);
  };

  const handleEdit = (customer: Customer) => {
    setMobile(customer.mobile);
    setName(customer.customerName);
    setAddress(customer.address);
    setGstin(customer.gstin);
    setPan(customer.pan);
    setCompanyName(customer.companyName);
    setEmail(customer.email);
    setGender(customer.gender);
    setDateOfBirth(customer.dateOfBirth);
    setAnniversaryDate(customer.anniversaryDate);
    setLoyaltyCardNumber(customer.loyaltyCardNumber);
    setRewardPoints(customer.rewardPoints);
    setCustomerType(customer.customerType);
    setWallet(customer.wallet.toString());
    setEditId(customer.id);
    setShowCustomerInfo(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      setCustomers((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {editId ? "Customer updated successfully!" : "Customer saved successfully!"}
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

      {/* Customer Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Customer Info.</h2>
          <div className="flex items-center gap-3">
            <button className="bg-amber-500 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-amber-600 transition-colors">
              Employee Sync
            </button>
            <button
              onClick={() => setShowCustomerInfo(!showCustomerInfo)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showCustomerInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {showCustomerInfo && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-6 max-w-4xl">
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
              <div className="col-span-1">
                <label className="block text-sm text-gray-700 font-medium mb-1">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
                <label className="block text-sm text-gray-700 font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
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
                <label className="block text-sm text-gray-700 font-medium mb-1">Gender</label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={gender === "Male"}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Male</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={gender === "Female"}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Female</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Anniversary Date</label>
                <input
                  type="date"
                  value={anniversaryDate}
                  onChange={(e) => setAnniversaryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Loyalty Card Number</label>
                <input
                  type="text"
                  value={loyaltyCardNumber}
                  onChange={(e) => setLoyaltyCardNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Reward Points</label>
                <input
                  type="text"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Customer Type</label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">--Select Customer Type--</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Wallet</label>
                <input
                  type="number"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Customer List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Customer List</h2>
          <button
            onClick={() => setShowCustomerList(!showCustomerList)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showCustomerList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showCustomerList && (
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
                    <th className="px-4 py-3 text-left text-xs font-semibold w-32">EDIT / DELETE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CUSTOMER ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CUSTOMER NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">EMPLOYEEID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">GENDER</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">MOBILE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">EMAIL</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">DATE OF BIRTH</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">ADDRESS</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">LOYALTY</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((customer, index) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(customer)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(customer.id, customer.customerName)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{customer.customerId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{customer.customerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{customer.employeeId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{customer.gender}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{customer.mobile}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{customer.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{customer.dateOfBirth}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{customer.address}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{customer.loyalty}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredCustomers.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + entriesPerPage, filteredCustomers.length)} of{" "}
                {filteredCustomers.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded text-sm ${
                        currentPage === page
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="px-2 text-gray-400">...</span>
                )}
                {totalPages > 5 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === totalPages
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
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
