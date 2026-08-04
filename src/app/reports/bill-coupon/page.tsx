"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";

interface BillCouponRow {
  id: string;
  sNo: number;
  billNo: string;
  billDate: string;
  grandTotal: number;
  billCoupon: string;
  custName: string;
  custMobile: string;
  couponStatus: string;
}

export default function BillCouponReportPage() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<BillCouponRow[]>([]);

  const filteredData = useMemo(() => {
    let data = reportData;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.billNo.toLowerCase().includes(q) ||
          r.billCoupon.toLowerCase().includes(q) ||
          r.custName.toLowerCase().includes(q) ||
          r.custMobile.includes(q) ||
          r.couponStatus.toLowerCase().includes(q)
      );
    }
    return data;
  }, [reportData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const handleViewReport = async () => {
    setCurrentPage(1);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await fetch(`/api/reports/bill-coupon?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.rows)) {
        setReportData(data.rows as BillCouponRow[]);
      } else {
        setReportData([]);
      }
    } catch {
      setReportData([]);
    }
  };

  const handleClear = () => {
    setStartDate(today);
    setEndDate(today);
    setSearchQuery("");
    setReportData([]);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">Bill Coupon Report</span>

          {/* Filter icons */}
          <div className="flex items-center gap-1 ml-2">
            <button className="p-1 border border-gray-200 rounded text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
            </button>
            <button className="p-1 border border-gray-200 rounded text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </button>
            <button className="p-1 border border-gray-200 rounded text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="px-6 pb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Start Date*</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[150px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">End Date*</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[150px]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-4 flex flex-wrap items-center gap-3">
          <button onClick={handleViewReport} className="px-6 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
            View Report
          </button>
          <button onClick={handleClear} className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
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

          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              PDF
            </button>
            <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              Excel
            </button>
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-center text-xs font-semibold">S.NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">BILL NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">BILL DATE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">GRAND TOTAL</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">BILL COUPON</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CUST. NAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CUST. MOBILE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">COUPON STATUS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.sNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">{row.billNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.billDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.grandTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.billCoupon}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.custName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.custMobile}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        row.couponStatus === "Applied" ? "bg-green-100 text-green-700" :
                        row.couponStatus === "Redeemed" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {row.couponStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {filteredData.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
