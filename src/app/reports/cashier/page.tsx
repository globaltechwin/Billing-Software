"use client";

import { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";

interface BillRow {
  id: string;
  billId: string;
  billNo: string;
  billDate: string;
  printDate: string;
  orderType: string;
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  amountDue: number;
  payModes: string;
  mobile: string;
  name: string;
  createdBy: string;
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[130px]">
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-gray-800">{value}</div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

const billIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const currencyIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export default function CashierReportPage() {
  const [orderType, setOrderType] = useState("All");
  const [payment, setPayment] = useState("");
  const [tax, setTax] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<BillRow[]>([]);

  useEffect(() => {
    fetch("/api/reports/cashier")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.rows)) {
          setReportData(data.rows as BillRow[]);
        }
      })
      .catch(() => {
        setReportData([]);
      });
  }, []);

  const filteredData = useMemo(() => {
    let data = reportData;
    if (orderType !== "All") {
      data = data.filter((r) => r.orderType === orderType);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.billNo.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.mobile.includes(q) ||
          r.payModes.toLowerCase().includes(q)
      );
    }
    return data;
  }, [reportData, orderType, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const totals = useMemo(() => {
    const t = { bills: 0, subTotal: 0, tax: 0, discount: 0, grandTotal: 0, paidAmount: 0, amountDue: 0, expenses: 0, complimentBills: 0, cancelledBills: 0, runningOrder: 0, creditBills: 0, deliveryCharge: 0 };
    reportData.forEach((r) => {
      t.bills += 1;
      t.subTotal += r.subTotal;
      t.discount += r.discount;
      t.grandTotal += r.grandTotal;
      t.paidAmount += r.paidAmount;
      t.amountDue += r.amountDue;
      t.tax += r.grandTotal - r.subTotal;
    });
    return t;
  }, [reportData]);

  const handlePrinting = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header Row: 4 blocks */}
      <div className="grid grid-cols-4 gap-4">
        {/* Cashier Report title block */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-800">Cashier Report</h2>
          <button
            onClick={handlePrinting}
            className="mt-4 px-6 py-2 bg-[#f0a500] text-white rounded-lg text-sm font-medium hover:bg-[#d99400] transition-colors"
          >
            Printing
          </button>
        </div>

        {/* Order Type block */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Order Type</span>
            <button onClick={() => setOrderType("All")} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">--All--</option>
            <option value="Dine In">Dine In</option>
            <option value="Take Away">Take Away</option>
            <option value="Delivery">Delivery</option>
          </select>
        </div>

        {/* Payment block */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Payment</span>
            <div className="flex items-center gap-1">
              <button className="text-gray-400 hover:text-gray-600 p-1 border border-gray-200 rounded">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
              </button>
              <button className="text-gray-400 hover:text-gray-600 p-1 border border-gray-200 rounded">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <button onClick={() => setPayment("")} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </div>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">--All--</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        {/* TAX block */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">TAX</span>
            <div className="flex items-center gap-1">
              <button className="text-gray-400 hover:text-gray-600 p-1 border border-gray-200 rounded">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
              </button>
              <button className="text-gray-400 hover:text-gray-600 p-1 border border-gray-200 rounded">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <button onClick={() => setTax("")} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </div>
          <select
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">--All--</option>
            <option value="GST">GST</option>
            <option value="Non-GST">Non-GST</option>
          </select>
        </div>
      </div>

      {/* Summary Cards Row 1 */}
      <div className="grid grid-cols-6 gap-3">
        <SummaryCard label="No of Bills" value={String(totals.bills)} icon={billIcon} />
        <SummaryCard label="Sub Total" value={totals.subTotal.toFixed(2)} icon={currencyIcon} />
        <SummaryCard label="Tax Amount" value={totals.tax.toFixed(2)} icon={currencyIcon} />
        <SummaryCard label="Discount" value={totals.discount.toFixed(2)} icon={currencyIcon} />
        <SummaryCard label="Grand Total" value={totals.grandTotal.toFixed(2)} icon={currencyIcon} />
        <SummaryCard label="Paid Amount" value={totals.paidAmount.toFixed(2)} icon={currencyIcon} />
      </div>

      {/* Summary Cards Row 2 */}
      <div className="grid grid-cols-6 gap-3">
        <SummaryCard label="Amount Due" value={totals.amountDue.toFixed(2)} icon={currencyIcon} />
        <SummaryCard label="Expenses" value={totals.expenses.toFixed(2)} icon={currencyIcon} />
        <SummaryCard label="Compliment Bills" value={String(totals.complimentBills)} icon={billIcon} />
        <SummaryCard label="Cancelled Bills" value={String(totals.cancelledBills)} icon={billIcon} />
        <SummaryCard label="Running Order" value={totals.runningOrder.toFixed(2)} icon={currencyIcon} />
        <SummaryCard label="Credit Bills" value={totals.creditBills.toFixed(2)} icon={currencyIcon} />
      </div>

      {/* Summary Cards Row 3 */}
      <div className="grid grid-cols-6 gap-3">
        <SummaryCard label="Delivery Charge" value={totals.deliveryCharge.toFixed(2)} icon={currencyIcon} />
      </div>

      {/* Bill List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
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
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold">BILLID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">BILL NO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">BILL DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">PRINT DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">ORDER TYPE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">SUB TOTAL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">DISCOUNT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">GRAND TOTAL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">PAID AMOUNT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">AMOUNT DUE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">PAY MODES</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">MOBILE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">NAME</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{row.billId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{row.billNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.billDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.printDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.orderType}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.subTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.discount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{row.grandTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.paidAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.amountDue.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.payModes}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.mobile}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{row.name}</td>
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
