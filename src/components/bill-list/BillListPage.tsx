"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronUp, X, Printer, ExternalLink, MessageSquare, AlertTriangle } from "lucide-react";
import LastBillPanel from "./LastBillPanel";
import { MOCK_BILLS, type Bill } from "./data";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function BillListPage() {
  const [startDate, setStartDate] = useState("27/07/2026");
  const [endDate, setEndDate] = useState("27/07/2026");
  const [billNo, setBillNo] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyDues, setShowOnlyDues] = useState(false);

  const filteredBills = useMemo(() => {
    let bills = MOCK_BILLS;

    if (showOnlyDues) {
      bills = bills.filter((b) => b.amountDue > 0);
    }

    if (billNo.trim()) {
      bills = bills.filter((b) =>
        b.billNo.toLowerCase().includes(billNo.toLowerCase())
      );
    }

    if (mobile.trim()) {
      bills = bills.filter((b) => b.mobile.includes(mobile));
    }

    if (name.trim()) {
      bills = bills.filter((b) =>
        b.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      bills = bills.filter(
        (b) =>
          b.billNo.toLowerCase().includes(q) ||
          b.name.toLowerCase().includes(q) ||
          b.mobile.includes(q) ||
          b.orderType.toLowerCase().includes(q)
      );
    }

    return bills;
  }, [billNo, mobile, name, searchQuery, showOnlyDues]);

  const totalPages = Math.ceil(filteredBills.length / rowsPerPage);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const pendingDues = MOCK_BILLS.filter((b) => b.amountDue > 0).length;

  const lastBill = MOCK_BILLS[0];

  const handleClear = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setBillNo("");
    setMobile("");
    setName("");
    setSearchQuery("");
    setShowOnlyDues(false);
    setCurrentPage(1);
  }, []);

  const handleReprint = useCallback(() => {
    alert(`Reprinting bill ${lastBill.billNo}...`);
  }, [lastBill]);

  const handlePrintBill = useCallback((bill: Bill) => {
    alert(`Printing bill ${bill.billNo}...`);
  }, []);

  const handleEditBill = useCallback((bill: Bill) => {
    alert(`Editing bill ${bill.billNo}...`);
  }, []);

  const handleViewBill = useCallback((bill: Bill) => {
    alert(`Viewing bill ${bill.billNo}...`);
  }, []);

  const handleWhatsApp = useCallback((bill: Bill) => {
    alert(`Sending bill ${bill.billNo} via WhatsApp...`);
  }, []);

  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Top Row — Filters + Last Bill */}
      <div className="flex gap-4">
        {/* Filter Card */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-lg font-semibold text-gray-800">Bill List</h1>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronUp size={18} className="text-gray-500" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Filter Fields */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill No
              </label>
              <input
                type="text"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Customer mobile"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Customer name"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button className="bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors">
              View Bills
            </button>
            <button
              onClick={handleClear}
              className="bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Last Bill Panel */}
        <div className="w-[280px] flex-shrink-0">
          <LastBillPanel
            billNo={lastBill.billNo}
            amount={lastBill.grandTotal}
            onReprint={handleReprint}
          />
        </div>
      </div>

      {/* Pending Dues Banner — Full Width */}
      {pendingDues > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-sm text-amber-800">
              {pendingDues} bill have pending dues
            </span>
          </div>
          <button
            onClick={() => setShowOnlyDues(!showOnlyDues)}
            className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Show only dues ▸
          </button>
        </div>
      )}

      {/* Table Section — Full Width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-200 text-sm px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {ROWS_PER_PAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">entries</span>
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
              className="border border-gray-200 text-sm px-3 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 w-48"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1e293b] text-white">
                <th className="px-3 py-2.5 text-left text-xs font-semibold">BILL NO</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">BILL DATE</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">ORDER TYPE</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold">SUB TOTAL</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold">DISCOUNT</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold">GRAND TOTAL</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold">PAID AMOUNT</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold">AMOUNT DUE</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">MOBILE</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">NAME</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">CREATED DATE</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold">PRINT / EDIT</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBills.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-gray-400">
                    No bills found
                  </td>
                </tr>
              ) : (
                paginatedBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-medium text-gray-800">{bill.billNo}</td>
                    <td className="px-3 py-2.5 text-gray-600">{bill.billDate}</td>
                    <td className="px-3 py-2.5 text-gray-600">{bill.orderType}</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{bill.subTotal}</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{bill.discount}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-800">{bill.grandTotal}</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{bill.paidAmount}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={bill.amountDue > 0 ? "text-red-600 font-medium" : "text-gray-600"}>
                        {bill.amountDue}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{bill.mobile}</td>
                    <td className="px-3 py-2.5 text-gray-600">{bill.name}</td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">{bill.createdDate}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handlePrintBill(bill)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Print"
                        >
                          <Printer size={14} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleEditBill(bill)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <ExternalLink size={14} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleViewBill(bill)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="View"
                        >
                          <ExternalLink size={14} className="text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleWhatsApp(bill)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare size={14} className="text-green-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Showing {((currentPage - 1) * rowsPerPage) + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredBills.length)} of{" "}
              {filteredBills.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                    currentPage === page
                      ? "bg-teal-500 text-white border-teal-500"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}