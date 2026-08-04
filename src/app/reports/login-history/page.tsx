"use client";

import { useState, useMemo } from "react";
import { X, LogIn, CheckCircle, XCircle, Users } from "lucide-react";

interface LoginHistoryRow {
  id: string;
  sNo: number;
  username: string;
  userName: string;
  loginTime: string;
  ipAddress: string;
  device: string;
  status: string;
}

interface ReportTotals {
  total: number;
  successful: number;
  failed: number;
  uniqueUsers: number;
}

export default function LoginHistoryPage() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [status, setStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<LoginHistoryRow[]>([]);
  const [totals, setTotals] = useState<ReportTotals>({ total: 0, successful: 0, failed: 0, uniqueUsers: 0 });

  const filteredData = useMemo(() => {
    let data = reportData;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.username.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          r.ipAddress.includes(q)
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
      if (status !== "all") params.set("status", status);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/reports/login-history?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.rows)) {
        setReportData(data.rows as LoginHistoryRow[]);
        setTotals(data.totals || { total: 0, successful: 0, failed: 0, uniqueUsers: 0 });
      } else {
        setReportData([]);
        setTotals({ total: 0, successful: 0, failed: 0, uniqueUsers: 0 });
      }
    } catch {
      setReportData([]);
      setTotals({ total: 0, successful: 0, failed: 0, uniqueUsers: 0 });
    }
  };

  const handleClear = () => {
    setStartDate(today);
    setEndDate(today);
    setStatus("all");
    setSearchQuery("");
    setReportData([]);
    setTotals({ total: 0, successful: 0, failed: 0, uniqueUsers: 0 });
    setCurrentPage(1);
  };

  const cards = [
    { label: "TOTAL LOGINS", value: totals.total, icon: <LogIn size={20} />, iconBg: "bg-green-50", iconColor: "#22c55e" },
    { label: "SUCCESSFUL", value: totals.successful, icon: <CheckCircle size={20} />, iconBg: "bg-blue-50", iconColor: "#3b82f6" },
    { label: "FAILED", value: totals.failed, icon: <XCircle size={20} />, iconBg: "bg-red-50", iconColor: "#ef4444" },
    { label: "UNIQUE USERS", value: totals.uniqueUsers, icon: <Users size={20} />, iconBg: "bg-purple-50", iconColor: "#8b5cf6" },
  ];

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">Login History Report</span>

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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button onClick={handleViewReport} className="px-6 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
              View Report
            </button>
            <button onClick={handleClear} className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center`}>
                <span style={{ color: card.iconColor }}>{card.icon}</span>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">{card.label}</div>
                <div className="text-xl font-bold text-gray-800">{card.value}</div>
              </div>
            </div>
          </div>
        ))}
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
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-center text-xs font-semibold">S.NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">USERNAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">NAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">LOGIN TIME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">IP ADDRESS</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">DEVICE / AGENT</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.sNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">{row.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.userName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.loginTime}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.ipAddress}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center max-w-[280px] truncate" title={row.device}>
                      {row.device}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        row.status === "Success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {row.status}
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
