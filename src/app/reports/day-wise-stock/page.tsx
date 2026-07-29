"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";

interface DayWiseStockRow {
  id: string;
  sNo: number;
  date: string;
  productName: string;
  openingStock: number;
  stockIn: number;
  stockOut: number;
  closingStock: number;
  totalStockValue: number;
}

const sampleData: DayWiseStockRow[] = [
  { id: "1", sNo: 1, date: "26/07/2026", productName: "Rice", openingStock: 100, stockIn: 50, stockOut: 30, closingStock: 120, totalStockValue: 4800 },
  { id: "2", sNo: 2, date: "26/07/2026", productName: "Coffee Powder", openingStock: 20, stockIn: 10, stockOut: 5, closingStock: 25, totalStockValue: 5000 },
  { id: "3", sNo: 3, date: "27/07/2026", productName: "Rice", openingStock: 120, stockIn: 30, stockOut: 40, closingStock: 110, totalStockValue: 4400 },
  { id: "4", sNo: 4, date: "27/07/2026", productName: "Coffee Powder", openingStock: 25, stockIn: 15, stockOut: 8, closingStock: 32, totalStockValue: 6400 },
  { id: "5", sNo: 5, date: "28/07/2026", productName: "Rice", openingStock: 110, stockIn: 40, stockOut: 25, closingStock: 125, totalStockValue: 5000 },
  { id: "6", sNo: 6, date: "28/07/2026", productName: "Coffee Powder", openingStock: 32, stockIn: 20, stockOut: 10, closingStock: 42, totalStockValue: 8400 },
];

export default function DayWiseStockReportPage() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [product, setProduct] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<DayWiseStockRow[]>([]);

  const filteredData = useMemo(() => {
    let data = reportData;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          r.date.includes(q)
      );
    }
    return data;
  }, [reportData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const totals = useMemo(() => {
    const t = { openingStock: 0, stockIn: 0, stockOut: 0, closingStock: 0, totalStockValue: 0 };
    reportData.forEach((r) => {
      t.openingStock += r.openingStock;
      t.stockIn += r.stockIn;
      t.stockOut += r.stockOut;
      t.closingStock += r.closingStock;
      t.totalStockValue += r.totalStockValue;
    });
    return t;
  }, [reportData]);

  const handleViewReport = () => {
    setReportData(sampleData);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setStartDate(today);
    setEndDate(today);
    setProduct("");
    setSearchQuery("");
    setReportData([]);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">Day Wise Stock Report</span>

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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Product *</span>
            <div className="relative">
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-7 w-[200px]"
              >
                <option value="">-- All --</option>
                <option value="rice">Rice</option>
                <option value="coffee-powder">Coffee Powder</option>
                <option value="milk">Milk</option>
                <option value="bread">Bread</option>
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
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-center text-xs font-semibold">S.NO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">DATE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">PRODUCT NAME</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">OPENING STOCK</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">STOCK IN</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">STOCK OUT</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">CLOSING STOCK</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">TOTAL STOCK VALUE</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.sNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">{row.productName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.openingStock}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.stockIn}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.stockOut}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.closingStock}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.totalStockValue.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total Row */}
        {reportData.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
            <div className="flex items-center gap-8 pr-4">
              <span className="text-sm font-semibold text-gray-700">Total:</span>
              <span className="text-sm font-semibold text-gray-800 min-w-[60px] text-center">{totals.openingStock}</span>
              <span className="text-sm font-semibold text-gray-800 min-w-[60px] text-center">{totals.stockIn}</span>
              <span className="text-sm font-semibold text-gray-800 min-w-[60px] text-center">{totals.stockOut}</span>
              <span className="text-sm font-semibold text-gray-800 min-w-[60px] text-center">{totals.closingStock}</span>
              <span className="text-sm font-semibold text-gray-800 min-w-[80px] text-center">{totals.totalStockValue.toFixed(2)}</span>
            </div>
          </div>
        )}

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
