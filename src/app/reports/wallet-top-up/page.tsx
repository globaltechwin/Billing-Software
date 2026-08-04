"use client";

import { useState, useMemo, useCallback } from "react";
import { X } from "lucide-react";

interface WalletTopUpRow {
  id: string;
  sNo: number;
  employeeName: string;
  employeeId: string;
  cardNumber: string;
  mobile: string;
  department: string;
  amount: number;
  paymode: string;
  createdBy: string;
  date: string;
}

function downloadCsv(headers: string[], rows: (string | number)[][], filename: string) {
  const lines = [headers.join(",")];
  rows.forEach((row) => lines.push(row.map((v) => `"${v}"`).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function WalletTopUpReportPage() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [payMode, setPayMode] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportData, setReportData] = useState<WalletTopUpRow[]>([]);

  const filteredData = useMemo(() => {
    let data = reportData;
    if (payMode !== "All") {
      data = data.filter((r) => r.paymode === payMode);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeId.toLowerCase().includes(q) ||
          r.cardNumber.toLowerCase().includes(q) ||
          r.mobile.includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.paymode.toLowerCase().includes(q) ||
          r.createdBy.toLowerCase().includes(q)
      );
    }
    return data;
  }, [reportData, payMode, searchQuery]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, r) => sum + r.amount, 0);
  }, [filteredData]);

  const handleViewReport = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (payMode !== "All") params.set("payMode", payMode);
      if (searchQuery) params.set("search", searchQuery);
      params.set("limit", "200");

      const res = await fetch(`/api/wallet?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.transactions) {
        setReportData(data.transactions.map((t: Record<string, unknown>) => ({
          id: String(t.id),
          sNo: t.sNo,
          employeeName: t.employeeName || "",
          employeeId: t.employeeId || "",
          cardNumber: t.cardNumber || "",
          mobile: t.mobile || "",
          department: t.department || "",
          amount: parseFloat(String(t.amount)) || 0,
          paymode: t.paymode || "",
          createdBy: t.createdBy || "",
          date: t.date || "",
        })));
      }
    } catch {
      setReportData([]);
    }
  }, [startDate, endDate, payMode, searchQuery]);

  const handleClear = () => {
    setStartDate(today);
    setEndDate(today);
    setPayMode("All");
    setSearchQuery("");
    setReportData([]);
  };

  const handleExportExcel = () => {
    if (reportData.length === 0) return;
    const headers = ["SNO", "EMPLOYEE NAME", "EMPLOYEE ID", "CARD NUMBER", "MOBILE", "DEPARTMENT", "AMOUNT", "PAYMODE", "CREATED BY", "DATE"];
    const rows = filteredData.map((r) => [r.sNo, r.employeeName, r.employeeId, r.cardNumber, r.mobile, r.department, r.amount.toFixed(2), r.paymode, r.createdBy, r.date]);
    rows.push(["", "", "", "", "", "", totalAmount.toFixed(2), "", "", ""]);
    downloadCsv(headers, rows, `Wallet-TopUp-Report-${startDate.replace(/\//g, "-")}.csv`);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">Wallet Top Up Report</span>
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

        {/* Filters Row */}
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
            <span className="text-sm font-medium text-gray-700">Pay Mode</span>
            <select
              value={payMode}
              onChange={(e) => setPayMode(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[150px]"
            >
              <option value="All">All</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-4 flex flex-wrap items-center gap-3">
          <button onClick={handleViewReport} className="px-6 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a72] transition-colors">
            View Report
          </button>
          <button onClick={handleClear} className="px-6 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
          <button onClick={handleExportExcel} className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Download Excel
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-3 py-3 text-center text-xs font-semibold">SNO</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">EMPLOYEE NAME</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">EMPLOYEE ID</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">CARD NUMBER</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">MOBILE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">DEPARTMENT</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">AMOUNT</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">PAYMODE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">CREATED BY</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.sNo}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.employeeName}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.employeeId}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.cardNumber}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.mobile}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.department}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.amount.toFixed(2)}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.paymode}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.createdBy}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total Row */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end gap-8 pr-4">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="text-sm font-semibold text-gray-800 min-w-[100px] text-right">
              {reportData.length > 0 ? totalAmount.toFixed(2) : "0.00"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
