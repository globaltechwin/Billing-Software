"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

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

const sampleBills: BillRow[] = [
  { id: "1", billId: "B001", billNo: "1001", billDate: "28/07/2026", printDate: "28/07/2026 09:15", orderType: "Dine In", subTotal: 450.00, discount: 0, grandTotal: 477.00, paidAmount: 477.00, amountDue: 0, payModes: "Cash", mobile: "9876543210", name: "Ravi Kumar", createdBy: "admin" },
  { id: "2", billId: "B002", billNo: "1002", billDate: "28/07/2026", printDate: "28/07/2026 10:30", orderType: "Take Away", subTotal: 320.00, discount: 20, grandTotal: 316.80, paidAmount: 316.80, amountDue: 0, payModes: "UPI", mobile: "9876543211", name: "Suresh Patel", createdBy: "admin" },
  { id: "3", billId: "B003", billNo: "1003", billDate: "28/07/2026", printDate: "28/07/2026 12:00", orderType: "Dine In", subTotal: 780.00, discount: 0, grandTotal: 819.00, paidAmount: 500.00, amountDue: 319.00, payModes: "Card", mobile: "9876543212", name: "Anita Sharma", createdBy: "admin" },
  { id: "4", billId: "B004", billNo: "1004", billDate: "28/07/2026", printDate: "28/07/2026 13:45", orderType: "Delivery", subTotal: 1200.00, discount: 50, grandTotal: 1219.50, paidAmount: 1219.50, amountDue: 0, payModes: "Cash", mobile: "9876543213", name: "Mohan Das", createdBy: "admin" },
  { id: "5", billId: "B005", billNo: "1005", billDate: "28/07/2026", printDate: "28/07/2026 15:20", orderType: "Dine In", subTotal: 560.00, discount: 0, grandTotal: 588.00, paidAmount: 588.00, amountDue: 0, payModes: "UPI", mobile: "9876543214", name: "Priya Verma", createdBy: "admin" },
  { id: "6", billId: "B006", billNo: "1006", billDate: "28/07/2026", printDate: "28/07/2026 17:00", orderType: "Take Away", subTotal: 250.00, discount: 0, grandTotal: 262.50, paidAmount: 262.50, amountDue: 0, payModes: "Cash", mobile: "9876543215", name: "Raj Singh", createdBy: "admin" },
  { id: "7", billId: "B007", billNo: "1007", billDate: "28/07/2026", printDate: "28/07/2026 18:30", orderType: "Dine In", subTotal: 890.00, discount: 30, grandTotal: 902.55, paidAmount: 902.55, amountDue: 0, payModes: "Card", mobile: "9876543216", name: "Deepa Nair", createdBy: "admin" },
  { id: "8", billId: "B008", billNo: "1008", billDate: "28/07/2026", printDate: "28/07/2026 19:45", orderType: "Delivery", subTotal: 1500.00, discount: 100, grandTotal: 1470.00, paidAmount: 1470.00, amountDue: 0, payModes: "UPI", mobile: "9876543217", name: "Vikram Rao", createdBy: "admin" },
];

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

function SummaryCard({ label, value, borderColor }: { label: string; value: string; borderColor: string }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 ${borderColor} min-w-[120px]`}>
      <div className="text-lg font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

export default function SalesReportPage() {
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [fromTime, setFromTime] = useState("00:00");
  const [toDate, setToDate] = useState(today);
  const [toTime, setToTime] = useState("23:59");
  const [selectUser, setSelectUser] = useState("");
  const [selectAttender, setSelectAttender] = useState("");
  const [customerType, setCustomerType] = useState("All");
  const [orderType, setOrderType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<BillRow[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const filteredData = useMemo(() => {
    let data = reportData;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.billNo.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.mobile.includes(q) ||
          r.payModes.toLowerCase().includes(q) ||
          r.orderType.toLowerCase().includes(q)
      );
    }
    return data;
  }, [reportData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const totals = useMemo(() => {
    const t = { bills: 0, subTotal: 0, tax: 0, discount: 0, grandTotal: 0, paidAmount: 0, amountDue: 0, expenses: 0, profitLoss: 0, returnAmt: 0, lastWkSales: 300, prevDayPay: 0, compliment: 0, cancelled: 0, runningOrder: 0, creditBills: 0, delivery: 0 };
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

  const handleView = () => {
    setReportData(sampleBills);
    setHasSearched(true);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFromDate(today);
    setFromTime("00:00");
    setToDate(today);
    setToTime("23:59");
    setSelectUser("");
    setSelectAttender("");
    setCustomerType("All");
    setOrderType("All");
    setSearchQuery("");
    setReportData([]);
    setHasSearched(false);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-gray-800">Sales Report</span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[140px]"
            />
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[100px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[140px]"
            />
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[100px]"
            />
          </div>

          <select
            value={selectUser}
            onChange={(e) => setSelectUser(e.target.value)}
            className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select User</option>
            <option value="admin">Admin</option>
            <option value="user1">User 1</option>
          </select>

          <select
            value={selectAttender}
            onChange={(e) => setSelectAttender(e.target.value)}
            className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Attender</option>
            <option value="att1">Attender 1</option>
            <option value="att2">Attender 2</option>
          </select>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Customer:</span>
            {["All", "With GST", "Without GST"].map((opt) => (
              <label key={opt} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="customerType"
                  value={opt}
                  checked={customerType === opt}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="px-6 py-2 flex flex-wrap items-center gap-2 border-t border-gray-200">
          <button onClick={handleView} className="px-5 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">View</button>
          <button onClick={handleClear} className="px-5 py-1.5 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors">Clear</button>
          <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Hourly</button>
          <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Print</button>
          <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Waiter</button>
          <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Bills</button>
          <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Excel</button>
          <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Bill XLS</button>
          <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Day PDF</button>
          <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Sales PDF</button>
          <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Denomination</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-8 gap-3">
        <SummaryCard label="No of Bills" value={String(totals.bills)} borderColor="border-t-4 border-t-blue-200" />
        <SummaryCard label="Sub Total" value={totals.subTotal.toFixed(2)} borderColor="border-t-4 border-t-red-400" />
        <SummaryCard label="Tax Amount" value={totals.tax.toFixed(2)} borderColor="border-t-4 border-t-green-400" />
        <SummaryCard label="Discount" value={totals.discount.toFixed(2)} borderColor="border-t-4 border-t-gray-300" />
        <SummaryCard label="Grand Total" value={totals.grandTotal.toFixed(2)} borderColor="border-t-4 border-t-orange-400" />
        <SummaryCard label="Paid Amount" value={totals.paidAmount.toFixed(2)} borderColor="border-t-4 border-t-green-400" />
        <SummaryCard label="Amount Due" value={totals.amountDue.toFixed(2)} borderColor="border-t-4 border-t-blue-400" />
        <SummaryCard label="Expenses" value={totals.expenses.toFixed(2)} borderColor="border-t-4 border-t-green-400" />
      </div>
      <div className="grid grid-cols-8 gap-3">
        <SummaryCard label="Profit/Loss" value={totals.profitLoss.toFixed(2)} borderColor="border-t-4 border-t-red-400" />
        <SummaryCard label="Return" value={totals.returnAmt.toFixed(2)} borderColor="border-t-4 border-t-green-400" />
        <SummaryCard label="Last Wk Sales" value={totals.lastWkSales.toFixed(2)} borderColor="border-t-4 border-t-gray-300" />
        <SummaryCard label="Prev Day Pay" value={totals.prevDayPay.toFixed(2)} borderColor="border-t-4 border-t-blue-400" />
        <SummaryCard label="Compliment" value={String(totals.compliment)} borderColor="border-t-4 border-t-green-400" />
        <SummaryCard label="Cancelled" value={String(totals.cancelled)} borderColor="border-t-4 border-t-red-400" />
        <SummaryCard label="Running Order" value={totals.runningOrder.toFixed(2)} borderColor="border-t-4 border-t-red-400" />
        <SummaryCard label="Credit Bills" value={totals.creditBills.toFixed(2)} borderColor="border-t-4 border-t-gray-300" />
      </div>
      <div className="grid grid-cols-8 gap-3">
        <SummaryCard label="Delivery" value={totals.delivery.toFixed(2)} borderColor="border-t-4 border-t-gray-300" />
      </div>

      {/* Order Type / Payment / Tax */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">ORDER TYPE</span>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">--All--</option>
              <option value="Dine In">Dine In</option>
              <option value="Take Away">Take Away</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700">PAYMENT</span>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700">TAX</span>
          </div>
        </div>
      </div>

      {/* Bill List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Bill List</h3>
        </div>
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
                <th className="px-4 py-3 text-left text-xs font-semibold">CREATED BY</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-4 py-8 text-center text-sm text-gray-500">
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
                    <td className="px-4 py-3 text-sm text-gray-700">{row.createdBy}</td>
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
            <span className="px-3 py-1 text-sm text-gray-700 font-medium">{currentPage}</span>
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
