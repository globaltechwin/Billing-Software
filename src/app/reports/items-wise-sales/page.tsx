"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";

interface ItemSalesRow {
  id: string;
  sNo: number;
  category: string;
  productName: string;
  count: number;
  totalPrice: number;
}

const sampleItems: ItemSalesRow[] = [
  { id: "1", sNo: 1, category: "Beverages", productName: "Cafe Latte", count: 45, totalPrice: 2925.0 },
  { id: "2", sNo: 2, category: "Beverages", productName: "Cappuccino", count: 38, totalPrice: 2470.0 },
  { id: "3", sNo: 3, category: "Beverages", productName: "Espresso", count: 52, totalPrice: 2600.0 },
  { id: "4", sNo: 4, category: "Snacks", productName: "Veg Samosa", count: 30, totalPrice: 1200.0 },
  { id: "5", sNo: 5, category: "Snacks", productName: "Chicken Patty", count: 22, totalPrice: 1540.0 },
  { id: "6", sNo: 6, category: "Main Course", productName: "Paneer Butter Masala", count: 18, totalPrice: 3240.0 },
  { id: "7", sNo: 7, category: "Main Course", productName: "Chicken Biryani", count: 25, totalPrice: 4375.0 },
  { id: "8", sNo: 8, category: "Desserts", productName: "Chocolate Brownie", count: 15, totalPrice: 1125.0 },
  { id: "9", sNo: 9, category: "Desserts", productName: "Gulab Jamun", count: 20, totalPrice: 800.0 },
  { id: "10", sNo: 10, category: "Beverages", productName: "Cold Coffee", count: 35, totalPrice: 2625.0 },
  { id: "11", sNo: 11, category: "Snacks", productName: "French Fries", count: 28, totalPrice: 1120.0 },
  { id: "12", sNo: 12, category: "Main Course", productName: "Butter Naan", count: 40, totalPrice: 1200.0 },
];

export default function ItemsWiseSalesPage() {
  const today = new Date().toISOString().split("T")[0];
  const [activeTab, setActiveTab] = useState<"itemWise" | "billWise">("itemWise");
  const [fromDate, setFromDate] = useState(today);
  const [fromTime, setFromTime] = useState("00:00");
  const [toDate, setToDate] = useState(today);
  const [toTime, setToTime] = useState("23:59");
  const [allFilter, setAllFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectAttender, setSelectAttender] = useState("");
  const [selectUser, setSelectUser] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<ItemSalesRow[]>([]);

  const filteredData = useMemo(() => {
    let data = reportData;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }
    return data;
  }, [reportData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const totalCount = useMemo(() => filteredData.reduce((sum, r) => sum + r.count, 0), [filteredData]);
  const totalPrice = useMemo(() => filteredData.reduce((sum, r) => sum + r.totalPrice, 0), [filteredData]);

  const handleView = () => {
    setReportData(sampleItems);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFromDate(today);
    setFromTime("00:00");
    setToDate(today);
    setToTime("23:59");
    setAllFilter("All");
    setSelectedProduct("");
    setSelectAttender("");
    setSelectUser("");
    setSearchQuery("");
    setReportData([]);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">Item Wise Sales</span>

          {/* Tab Buttons */}
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setActiveTab("itemWise")}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "itemWise"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Item Wise
            </button>
            <button
              onClick={() => setActiveTab("billWise")}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "billWise"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Bill Wise
            </button>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[130px]"
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
              className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[130px]"
            />
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[100px]"
            />
          </div>

          <select
            value={allFilter}
            onChange={(e) => setAllFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">--All--</option>
            <option value="Dine In">Dine In</option>
            <option value="Take Away">Take Away</option>
            <option value="Delivery">Delivery</option>
          </select>
        </div>

        {/* Product Selector */}
        <div className="px-6 pb-3">
          <div className="relative">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">--Select Product--</option>
              <option value="cafe-latte">Cafe Latte</option>
              <option value="cappuccino">Cappuccino</option>
              <option value="espresso">Espresso</option>
              <option value="cold-coffee">Cold Coffee</option>
              <option value="veg-samosa">Veg Samosa</option>
              <option value="chicken-patty">Chicken Patty</option>
              <option value="paneer-butter-masala">Paneer Butter Masala</option>
              <option value="chicken-biryani">Chicken Biryani</option>
              <option value="chocolate-brownie">Chocolate Brownie</option>
              <option value="gulab-jamun">Gulab Jamun</option>
            </select>
            {selectedProduct && (
              <button
                onClick={() => setSelectedProduct("")}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
        </div>

        {/* Attender, User, Action Buttons */}
        <div className="px-6 pb-4 flex flex-wrap items-center gap-2">
          <select
            value={selectAttender}
            onChange={(e) => setSelectAttender(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Attender</option>
            <option value="att1">Attender 1</option>
            <option value="att2">Attender 2</option>
          </select>

          <select
            value={selectUser}
            onChange={(e) => setSelectUser(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select User</option>
            <option value="admin">Admin</option>
            <option value="user1">User 1</option>
          </select>

          <button onClick={handleView} className="px-5 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            View
          </button>
          <button className="px-5 py-1.5 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors">
            Summary
          </button>
          <button className="px-5 py-1.5 bg-[#f0a500] text-white rounded-md text-sm font-medium hover:bg-[#d99400] transition-colors">
            Print
          </button>
          <button className="px-5 py-1.5 bg-rose-500 text-white rounded-md text-sm font-medium hover:bg-rose-600 transition-colors">
            Waiter Wise
          </button>
          <button className="px-5 py-1.5 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors">
            User Wise
          </button>
          <button onClick={handleClear} className="px-5 py-1.5 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition-colors">
            Clear
          </button>
          <button className="px-5 py-1.5 bg-indigo-700 text-white rounded-md text-sm font-medium hover:bg-indigo-800 transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
            Analytics
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
          <table className="w-full">
            <thead>
              <tr className="bg-[#3d3d3d] text-white">
                <th className="px-4 py-3 text-center text-xs font-semibold">S.NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CATEGORY</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">PRODUCT NAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">COUNT</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">TOTAL PRICE</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <>
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      No data available in table
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td colSpan={2} className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">Total:</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-center">0.00</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-center">0.00</td>
                  </tr>
                </>
              ) : (
                <>
                  {paginatedData.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.sNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">{row.productName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.count}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td colSpan={2} className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">Total:</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-center">{totalCount}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-center">{totalPrice.toFixed(2)}</td>
                  </tr>
                </>
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
