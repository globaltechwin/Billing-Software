"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";

interface CancelledBillRow {
  id: string;
  sNo: number;
  billNo: string;
  billDate: string;
  grandTotal: number;
  payMode: string;
  name: string;
  mobile: string;
  remarks: string;
  cancelledBy: string;
  cancelledDate: string;
}

const sampleData: CancelledBillRow[] = [
  { id: "1", sNo: 1, billNo: "1001", billDate: "28/07/2026", grandTotal: 1250.00, payMode: "Cash", name: "Ravi Kumar", mobile: "9876543210", remarks: "Customer changed mind", cancelledBy: "admin", cancelledDate: "28/07/2026" },
  { id: "2", sNo: 2, billNo: "1005", billDate: "27/07/2026", grandTotal: 850.00, payMode: "UPI", name: "Suresh Patel", mobile: "9876543211", remarks: "Wrong order", cancelledBy: "admin", cancelledDate: "27/07/2026" },
  { id: "3", sNo: 3, billNo: "1012", billDate: "27/07/2026", grandTotal: 2100.00, payMode: "Card", name: "Anita Sharma", mobile: "9876543212", remarks: "Duplicate entry", cancelledBy: "manager1", cancelledDate: "27/07/2026" },
  { id: "4", sNo: 4, billNo: "1018", billDate: "26/07/2026", grandTotal: 450.00, payMode: "Cash", name: "Mohan Das", mobile: "9876543213", remarks: "Item not available", cancelledBy: "admin", cancelledDate: "26/07/2026" },
  { id: "5", sNo: 5, billNo: "1023", billDate: "26/07/2026", grandTotal: 3200.00, payMode: "UPI", name: "Priya Verma", mobile: "9876543214", remarks: "System error", cancelledBy: "admin", cancelledDate: "26/07/2026" },
  { id: "6", sNo: 6, billNo: "1030", billDate: "25/07/2026", grandTotal: 675.00, payMode: "Cash", name: "Raj Singh", mobile: "9876543215", remarks: "Cancelled by customer", cancelledBy: "manager1", cancelledDate: "25/07/2026" },
];

export default function CancelledBillsPage() {
  const today = new Date().toISOString().split("T")[0];
  const [reportType, setReportType] = useState<"bill" | "item">("bill");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<CancelledBillRow[]>([]);

  const filteredData = useMemo(() => {
    let data = reportData;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.billNo.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.mobile.includes(q) ||
          r.payMode.toLowerCase().includes(q) ||
          r.remarks.toLowerCase().includes(q) ||
          r.cancelledBy.toLowerCase().includes(q)
      );
    }
    return data;
  }, [reportData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const totals = useMemo(() => {
    const t = { grandTotal: 0 };
    reportData.forEach((r) => {
      t.grandTotal += r.grandTotal;
    });
    return t;
  }, [reportData]);

  const handleViewReport = () => {
    setReportData(sampleData);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setStartDate(today);
    setEndDate(today);
    setReportType("bill");
    setSearchQuery("");
    setReportData([]);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">Cancelled Bills Report</span>

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
            <span className="text-sm font-medium text-gray-700">Report Type</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="reportType"
                value="bill"
                checked={reportType === "bill"}
                onChange={() => setReportType("bill")}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Bill</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="reportType"
                value="item"
                checked={reportType === "item"}
                onChange={() => setReportType("item")}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Item</span>
            </label>
          </div>

          <div className="flex items-center gap-2 ml-auto">
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
        <div className="px-6 pb-4 flex items-center gap-3">
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
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
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
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-center text-xs font-semibold">S.NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">BILL NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">BILL DATE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">GRAND TOTAL</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">PAY MODE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">NAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">MOBILE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">REMARKS</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CANCELLED BY</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CANCELLED DATE</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">
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
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.payMode}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.mobile}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.remarks}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.cancelledBy}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.cancelledDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total Row */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-start gap-8 pl-4">
            <span className="text-sm font-semibold text-gray-700">Total:</span>
            <span className="text-sm font-semibold text-gray-800 min-w-[80px] text-center">{reportData.length > 0 ? totals.grandTotal.toFixed(2) : "0.00"}</span>
          </div>
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
