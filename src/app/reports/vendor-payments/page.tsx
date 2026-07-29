"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";

interface VendorPaymentRow {
  id: string;
  sNo: number;
  vendorName: string;
  credit: number;
  cash: number;
  card: number;
  upi: number;
  wallet: number;
  curBalance: number;
  balanceDesc: string;
  date: string;
}

const samplePayments: VendorPaymentRow[] = [
  { id: "1", sNo: 1, vendorName: "Fresh Farms Suppliers", credit: 15000, cash: 5000, card: 3000, upi: 2000, wallet: 0, curBalance: 12000, balanceDesc: "Due", date: "28/07/2026" },
  { id: "2", sNo: 2, vendorName: "Metro Dairy Products", credit: 8000, cash: 3000, card: 0, upi: 1500, wallet: 500, curBalance: 6000, balanceDesc: "Due", date: "28/07/2026" },
  { id: "3", sNo: 3, vendorName: "National Beverages Ltd", credit: 22000, cash: 10000, card: 5000, upi: 3000, wallet: 0, curBalance: 8000, balanceDesc: "Partial", date: "27/07/2026" },
  { id: "4", sNo: 4, vendorName: "Quality Meat Traders", credit: 12000, cash: 8000, card: 2000, upi: 1000, wallet: 0, curBalance: 5000, balanceDesc: "Due", date: "27/07/2026" },
  { id: "5", sNo: 5, vendorName: "Spice Garden Imports", credit: 35000, cash: 15000, card: 10000, upi: 5000, wallet: 2000, curBalance: 10000, balanceDesc: "Partial", date: "26/07/2026" },
  { id: "6", sNo: 6, vendorName: "Green Valley Organics", credit: 18000, cash: 12000, card: 3000, upi: 2000, wallet: 1000, curBalance: 0, balanceDesc: "Paid", date: "26/07/2026" },
];

export default function VendorPaymentsPage() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [deletedPayments, setDeletedPayments] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<VendorPaymentRow[]>([]);

  const filteredData = useMemo(() => {
    let data = reportData;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.vendorName.toLowerCase().includes(q) ||
          r.balanceDesc.toLowerCase().includes(q) ||
          r.date.includes(q)
      );
    }
    return data;
  }, [reportData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const totals = useMemo(() => {
    const t = { credit: 0, cash: 0, card: 0, upi: 0, wallet: 0, curBalance: 0 };
    reportData.forEach((r) => {
      t.credit += r.credit;
      t.cash += r.cash;
      t.card += r.card;
      t.upi += r.upi;
      t.wallet += r.wallet;
      t.curBalance += r.curBalance;
    });
    return t;
  }, [reportData]);

  const handleViewReport = () => {
    setReportData(samplePayments);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setStartDate(today);
    setEndDate(today);
    setDeletedPayments(false);
    setSearchQuery("");
    setReportData([]);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">Vendor Payments Report</span>

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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={deletedPayments}
              onChange={(e) => setDeletedPayments(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Deleted Payments</span>
          </label>

          {/* Buttons */}
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={handleViewReport} className="px-6 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
              View Report
            </button>
            <button onClick={handleClear} className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors">
              Clear
            </button>
            <button className="px-6 py-2 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors">
              Consolidated
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">TOTAL CREDIT</div>
              <div className="text-xl font-bold text-gray-800">{totals.credit.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">TOTAL PAYMENT</div>
              <div className="text-xl font-bold text-gray-800">{totals.cash + totals.card + totals.upi + totals.wallet > 0 ? (totals.cash + totals.card + totals.upi + totals.wallet).toFixed(2) : "0.00"}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">NET BALANCE DUE</div>
              <div className="text-xl font-bold text-gray-800">{totals.curBalance.toFixed(2)}</div>
            </div>
          </div>
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
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-center text-xs font-semibold">S.NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">VENDOR NAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CREDIT</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CASH</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CARD</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">UPI</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">WALLET</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CUR. BALANCE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">BALANCE DESC.</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">DATE</th>
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
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">{row.vendorName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.credit.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.cash.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.card.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.upi.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.wallet.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.curBalance.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        row.balanceDesc === "Paid" ? "bg-green-100 text-green-700" :
                        row.balanceDesc === "Partial" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {row.balanceDesc}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total Row */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end gap-8 pr-4">
            <span className="text-sm font-semibold text-gray-700">Total:</span>
            <span className="text-sm font-semibold text-gray-800 min-w-[80px] text-center">{reportData.length > 0 ? totals.credit.toFixed(2) : "0.00"}</span>
            <span className="text-sm font-semibold text-gray-800 min-w-[80px] text-center">{reportData.length > 0 ? totals.cash.toFixed(2) : "0.00"}</span>
            <span className="text-sm font-semibold text-gray-800 min-w-[80px] text-center">{reportData.length > 0 ? totals.card.toFixed(2) : "0.00"}</span>
            <span className="text-sm font-semibold text-gray-800 min-w-[80px] text-center">{reportData.length > 0 ? totals.upi.toFixed(2) : "0.00"}</span>
            <span className="text-sm font-semibold text-gray-800 min-w-[80px] text-center">{reportData.length > 0 ? totals.wallet.toFixed(2) : "0.00"}</span>
            <span className="text-sm font-semibold text-gray-800 min-w-[80px] text-center">{reportData.length > 0 ? totals.curBalance.toFixed(2) : "0.00"}</span>
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
