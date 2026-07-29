"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";

interface StockReportRow {
  id: string;
  sNo: number;
  branchName: string;
  categoryName: string;
  productCode: string;
  productName: string;
  uom: string;
  stockDate: string;
  openingStock: number;
  stockIn: number;
  stockOut: number;
  billed: number;
  totalStockOut: number;
  closingStock: number;
  stockUnitPrice: number;
  totalPrice: number;
}

const sampleStock: StockReportRow[] = [
  { id: "1", sNo: 1, branchName: "Only Coffee Vegetarian Restaurant", categoryName: "Cat", productCode: "1", productName: "Rice", uom: "KG", stockDate: "28/07/2026", openingStock: 0, stockIn: 50, stockOut: 10, billed: 8, totalStockOut: 18, closingStock: 32, stockUnitPrice: 40, totalPrice: 1280 },
  { id: "2", sNo: 2, branchName: "Only Coffee Vegetarian Restaurant", categoryName: "Beverages", productCode: "2", productName: "Coffee Powder", uom: "KG", stockDate: "28/07/2026", openingStock: 20, stockIn: 30, stockOut: 5, billed: 12, totalStockOut: 17, closingStock: 33, stockUnitPrice: 200, totalPrice: 6600 },
  { id: "3", sNo: 3, branchName: "Only Coffee Vegetarian Restaurant", categoryName: "Dairy", productCode: "3", productName: "Milk", uom: "L", stockDate: "28/07/2026", openingStock: 15, stockIn: 40, stockOut: 8, billed: 20, totalStockOut: 28, closingStock: 27, stockUnitPrice: 55, totalPrice: 1485 },
  { id: "4", sNo: 4, branchName: "Only Coffee Vegetarian Restaurant", categoryName: "Snacks", productCode: "4", productName: "Bread", uom: "PCS", stockDate: "28/07/2026", openingStock: 30, stockIn: 20, stockOut: 0, billed: 15, totalStockOut: 15, closingStock: 35, stockUnitPrice: 25, totalPrice: 875 },
  { id: "5", sNo: 5, branchName: "Only Coffee Vegetarian Restaurant", categoryName: "Beverages", productCode: "5", productName: "Tea Leaves", uom: "KG", stockDate: "28/07/2026", openingStock: 10, stockIn: 15, stockOut: 3, billed: 7, totalStockOut: 10, closingStock: 15, stockUnitPrice: 300, totalPrice: 4500 },
  { id: "6", sNo: 6, branchName: "Only Coffee Vegetarian Restaurant", categoryName: "Cat", productCode: "6", productName: "Sugar", uom: "KG", stockDate: "28/07/2026", openingStock: 25, stockIn: 10, stockOut: 2, billed: 5, totalStockOut: 7, closingStock: 28, stockUnitPrice: 45, totalPrice: 1260 },
];

export default function StockReportPage() {
  const today = new Date().toISOString().split("T")[0];
  const [stockType, setStockType] = useState<"store" | "internal">("store");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [category, setCategory] = useState("");
  const [product, setProduct] = useState("");
  const [productType, setProductType] = useState("Inventory");
  const [branch, setBranch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<StockReportRow[]>([]);

  const filteredData = useMemo(() => {
    let data = reportData;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          r.productCode.toLowerCase().includes(q) ||
          r.categoryName.toLowerCase().includes(q) ||
          r.branchName.toLowerCase().includes(q)
      );
    }
    return data;
  }, [reportData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const totals = useMemo(() => {
    const t = { openingStock: 0, stockIn: 0, stockOut: 0, billed: 0, totalStockOut: 0, closingStock: 0, totalPrice: 0 };
    reportData.forEach((r) => {
      t.openingStock += r.openingStock;
      t.stockIn += r.stockIn;
      t.stockOut += r.stockOut;
      t.billed += r.billed;
      t.totalStockOut += r.totalStockOut;
      t.closingStock += r.closingStock;
      t.totalPrice += r.totalPrice;
    });
    return t;
  }, [reportData]);

  const handleViewReport = () => {
    setReportData(sampleStock);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setStartDate(today);
    setEndDate(today);
    setCategory("");
    setProduct("");
    setProductType("Inventory");
    setBranch("");
    setSearchQuery("");
    setReportData([]);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">Stock Report</span>

          {/* Filter icons */}
          <div className="flex items-center gap-1 ml-2">
            <button className="p-1 border border-gray-200 rounded text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
            </button>
            <button className="p-1 border border-gray-200 rounded text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <button className="p-1 border border-gray-200 rounded text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </button>
            <button className="p-1 border border-gray-200 rounded text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>

          {/* Store / Internal radio */}
          <div className="flex items-center gap-4 ml-auto">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="stockType"
                value="store"
                checked={stockType === "store"}
                onChange={() => setStockType("store")}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Store</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="stockType"
                value="internal"
                checked={stockType === "internal"}
                onChange={() => setStockType("internal")}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Internal</span>
            </label>
          </div>
        </div>

        {/* Filter Row 1 */}
        <div className="px-6 pb-3 flex flex-wrap items-center gap-4">
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
            <span className="text-sm font-medium text-gray-700">Category*</span>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-7 w-[180px]"
              >
                <option value="">--Select Product ...</option>
                <option value="beverages">Beverages</option>
                <option value="dairy">Dairy</option>
                <option value="snacks">Snacks</option>
                <option value="cat">Cat</option>
              </select>
              {category && (
                <button onClick={() => setCategory("")} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Product*</span>
            <div className="relative">
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-7 w-[180px]"
              >
                <option value="">--Select Product--</option>
                <option value="rice">Rice</option>
                <option value="coffee-powder">Coffee Powder</option>
                <option value="milk">Milk</option>
                <option value="bread">Bread</option>
                <option value="tea-leaves">Tea Leaves</option>
                <option value="sugar">Sugar</option>
              </select>
              {product && (
                <button onClick={() => setProduct("")} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Row 2 */}
        <div className="px-6 pb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Product Type</span>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[150px]"
            >
              <option value="Inventory">Inventory</option>
              <option value="Non-Inventory">Non-Inventory</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Branch</span>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[200px]"
            >
              <option value="">--Select Branch--</option>
              <option value="br1">Only Coffee Vegetarian Restaurant</option>
            </select>
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
          <table className="w-full min-w-[1400px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-center text-xs font-semibold">S.NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">BRANCH NAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CATEGORY NAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">PRODUCT CODE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">PRODUCT NAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">UOM</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">STOCK DATE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">OPENING STOCK</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">STOCK IN</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">STOCK OUT</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">BILLED</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">TOTAL STOCK OUT</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CLOSING STOCK</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">STOCK UNIT PRICE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">TOTAL PRICE</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <>
                  <tr>
                    <td colSpan={15} className="px-4 py-8 text-center text-sm text-gray-500">
                      No data available in table
                    </td>
                  </tr>
                </>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.sNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.branchName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.categoryName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.productCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">{row.productName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.uom}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.stockDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.openingStock.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.stockIn}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.stockOut}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.billed}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.totalStockOut}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.closingStock.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.stockUnitPrice}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.totalPrice.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total Row */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
          <div className="flex items-center gap-8 pr-4">
            <span className="text-sm font-semibold text-gray-700">Total:</span>
            <span className="text-sm font-semibold text-gray-800 min-w-[80px] text-center">{totals.closingStock.toFixed(2)}</span>
            <span className="text-sm font-semibold text-gray-800 min-w-[80px] text-center">{totals.totalPrice.toFixed(2)}</span>
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
