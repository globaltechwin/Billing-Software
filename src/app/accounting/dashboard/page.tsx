"use client";

import { useState, useEffect } from "react";
import { Clock, Send, CheckCircle, DollarSign } from "lucide-react";

interface RecentQuote {
  quoteNo: string;
  customer: string;
  amount: number;
  status: string;
}

interface RecentInvoice {
  invoiceNo: string;
  customer: string;
  balance: number;
  status: string;
}

interface DashboardData {
  outstanding: number;
  quotesPending: number;
  acceptedQuotes: number;
  collected: number;
  recentQuotes: RecentQuote[];
  recentInvoices: RecentInvoice[];
}

const fmt = (v: number) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AccDashboardPage() {
  const [data, setData] = useState<DashboardData>({
    outstanding: 0,
    quotesPending: 0,
    acceptedQuotes: 0,
    collected: 0,
    recentQuotes: [],
    recentInvoices: [],
  });

  useEffect(() => {
    fetch("/api/accounting/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch((e) => console.error("Failed to fetch dashboard data:", e));
  }, []);

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <h1 className="text-xl font-bold text-gray-800">Accounting Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center min-h-[220px]">
          <div className="flex items-center gap-2 mb-8 w-full justify-start">
            <Clock size={18} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Outstanding</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-3">{fmt(data.outstanding)}</p>
          <p className="text-sm text-gray-500">open invoices</p>
        </div>

        {/* Quotes Pending */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center min-h-[220px]">
          <div className="flex items-center gap-2 mb-8 w-full justify-start">
            <Send size={18} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Quotes Pending</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-3">{data.quotesPending}</p>
          <p className="text-sm text-gray-500">awaiting response</p>
        </div>

        {/* Accepted Quotes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center min-h-[220px]">
          <div className="flex items-center gap-2 mb-8 w-full justify-start">
            <CheckCircle size={18} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Accepted Quotes</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-3">{data.acceptedQuotes}</p>
          <p className="text-sm text-gray-500">ready to invoice</p>
        </div>

        {/* Collected */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center min-h-[220px]">
          <div className="flex items-center gap-2 mb-8 w-full justify-start">
            <DollarSign size={18} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Collected</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-3">{fmt(data.collected)}</p>
          <p className="text-sm text-gray-500">total payments received</p>
        </div>
      </div>

      {/* Recent Quotes & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Quotes */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-bold text-gray-800">Recent Quotes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800">Quote #</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800">Customer</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-800">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentQuotes.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No quotes</td></tr>
                ) : (
                  data.recentQuotes.map((q, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-800">{q.quoteNo}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{q.customer}</td>
                      <td className="px-6 py-3 text-sm text-right text-gray-800">{fmt(q.amount)}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{q.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-bold text-gray-800">Recent Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800">Invoice #</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800">Customer</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-800">Balance</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentInvoices.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No invoices</td></tr>
                ) : (
                  data.recentInvoices.map((inv, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-800">{inv.invoiceNo}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{inv.customer}</td>
                      <td className="px-6 py-3 text-sm text-right text-gray-800">{fmt(inv.balance)}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{inv.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}