"use client";

import { Clock, Send, CheckCircle, DollarSign } from "lucide-react";

const recentQuotes = [
  { quoteNo: "QT-0005", customer: "1002-Omkar Tanti", amount: 666, status: "Sent" },
  { quoteNo: "QT-0004", customer: "1001-Harikrishnan Arumugam", amount: 0, status: "Draft" },
  { quoteNo: "QT-0003", customer: "1008-Jeewan Tanti", amount: 0, status: "Draft" },
  { quoteNo: "QT-0002", customer: "1001-Harikrishnan Arumugam", amount: 0, status: "Draft" },
  { quoteNo: "QT-0001", customer: "1010-Manikandan E", amount: 0, status: "Draft" },
];

const recentInvoices: { invoiceNo: string; customer: string; balance: number; status: string }[] = [];

const fmt = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const summaryCards = [
  { label: "Outstanding", value: 0, subtitle: "0 open invoices", icon: Clock, iconColor: "text-gray-500" },
  { label: "Quotes Pending", value: 666, subtitle: "1 awaiting response", icon: Send, iconColor: "text-gray-500" },
  { label: "Accepted Quotes", value: 0, subtitle: "ready to invoice", icon: CheckCircle, iconColor: "text-gray-500" },
  { label: "Collected", value: 0, subtitle: "total payments received", icon: DollarSign, iconColor: "text-gray-500" },
];

export default function AccDashboardPage() {
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <h1 className="text-xl font-bold text-gray-800">Accounting Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center min-h-[220px]">
            <div className="flex items-center gap-2 mb-8 w-full justify-start">
              <card.icon size={18} className={card.iconColor} />
              <span className="text-sm font-semibold text-gray-700">{card.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-3">{fmt(card.value)}</p>
            <p className="text-sm text-gray-500">{card.subtitle}</p>
          </div>
        ))}
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
                {recentQuotes.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No quotes</td></tr>
                ) : (
                  recentQuotes.map((q, i) => (
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
                {recentInvoices.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No invoices</td></tr>
                ) : (
                  recentInvoices.map((inv, i) => (
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
