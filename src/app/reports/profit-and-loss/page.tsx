"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";

interface ProfitLossRow {
  id: string;
  sNo: number;
  particulars: string;
  amount: number;
  type: "income" | "expense";
}

const sampleData: ProfitLossRow[] = [
  { id: "1", sNo: 1, particulars: "Total Sales", amount: 0, type: "income" },
  { id: "2", sNo: 2, particulars: "Total Expenses", amount: 0, type: "expense" },
  { id: "3", sNo: 3, particulars: "Stock IN", amount: 0, type: "income" },
  { id: "4", sNo: 4, particulars: "Stock Out", amount: 0, type: "expense" },
];

export default function ProfitAndLossPage() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportData, setReportData] = useState<ProfitLossRow[]>([]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return reportData;
    const q = searchQuery.toLowerCase();
    return reportData.filter((r) => r.particulars.toLowerCase().includes(q));
  }, [reportData, searchQuery]);

  const totalAmount = useMemo(() => {
    return reportData.reduce((sum, r) => sum + r.amount, 0);
  }, [reportData]);

  const handleView = () => {
    setReportData(sampleData);
  };

  const handleClear = () => {
    setStartDate(today);
    setEndDate(today);
    setSearchQuery("");
    setReportData([]);
  };

  const handleDownloadExcel = () => {
    alert("Excel download initiated (demo)");
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handlePrintExcel = () => {
    handleDownloadExcel();
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Profit and Loss</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 flex items-center gap-4 flex-wrap">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Start Date*</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">End Date*</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleView}
              className="bg-teal-500 text-white px-6 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-600 transition"
            >
              View
            </button>
            <button
              onClick={handleDownloadExcel}
              className="bg-teal-500 text-white px-6 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-600 transition"
            >
              DownLoad Excel
            </button>
            <button
              onClick={handleClear}
              className="bg-gray-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Action Row */}
        <div className="px-6 pb-4 flex items-center gap-2">
          <button
            onClick={handlePrintPDF}
            className="bg-gray-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
          >
            PDF
          </button>
          <button
            onClick={handlePrintExcel}
            className="bg-gray-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
          >
            Excel
          </button>
          <div className="ml-auto">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal-500 text-white">
                  <th className="px-4 py-3 text-left font-medium">S.NO</th>
                  <th className="px-4 py-3 text-left font-medium">PARTICULARS</th>
                  <th className="px-4 py-3 text-right font-medium">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{row.sNo}</td>
                    <td className="px-4 py-3">
                      <span className="bg-teal-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                        {row.particulars}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {row.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-4 py-3" colSpan={2}></td>
                  <td className="px-4 py-3 text-right">{totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {reportData.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">
            Select date range and click View to generate the Profit and Loss report.
          </p>
        </div>
      )}
    </div>
  );
}