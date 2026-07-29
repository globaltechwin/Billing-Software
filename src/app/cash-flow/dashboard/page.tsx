"use client";

import { useState } from "react";
import { Calendar, RefreshCw, ArrowDownCircle, ArrowUpCircle, Scale, List } from "lucide-react";

interface RecentTransaction {
  id: string;
  date: string;
  type: string;
  category: string;
  account: string;
  party: string;
  refNo: string;
  amount: number;
}

const sampleTransactions: RecentTransaction[] = [];

const fmt = (v: number) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CashDashboardPage() {
  const [fromDate, setFromDate] = useState("2026-07-01");
  const [toDate, setToDate] = useState("2026-07-29");
  const [loading, setLoading] = useState(false);

  const totalCashIn = 0;
  const totalCashOut = 0;
  const netCashFlow = totalCashIn - totalCashOut;
  const totalTransactions = 0;

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">From Date</label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[180px]"
              />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">To Date</label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[180px]"
              />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : null}
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cash In */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <ArrowDownCircle size={18} className="text-green-600" />
            </span>
            <span className="text-sm font-semibold text-gray-700">Total Cash In</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{fmt(totalCashIn)}</p>
        </div>

        {/* Total Cash Out */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <ArrowUpCircle size={18} className="text-red-600" />
            </span>
            <span className="text-sm font-semibold text-gray-700">Total Cash Out</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{fmt(totalCashOut)}</p>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <Scale size={18} className="text-red-600" />
            </span>
            <span className="text-sm font-semibold text-gray-700">Net Cash Flow</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{fmt(netCashFlow)}</p>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <List size={18} className="text-blue-600" />
            </span>
            <span className="text-sm font-semibold text-gray-700">Transactions</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-3">
          <h2 className="text-base font-semibold text-gray-800">Recent Transactions</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Last 10</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Account</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Party</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Ref No</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sampleTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                sampleTransactions.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{row.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.account}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.party}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.refNo}</td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      row.type === "Cash In" ? "text-green-600" : "text-red-600"
                    }`}>
                      {row.type === "Cash In" ? "+" : "-"}{fmt(row.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
