"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";

interface GstFilingRow {
  id: string;
  sNo: number;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  gstin: string;
  hsnCode: string;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  invoiceTotal: number;
}

export default function GstFilingPage() {
  const today = new Date().toISOString().split("T")[0];
  const [filingType, setFilingType] = useState("itemWise");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<GstFilingRow[]>([]);

  const filteredData = useMemo(() => {
    let data = reportData;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.invoiceNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.gstin.toLowerCase().includes(q) ||
          r.hsnCode.includes(q)
      );
    }
    return data;
  }, [reportData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const totals = useMemo(() => {
    const t = { taxableValue: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalTax: 0, invoiceTotal: 0 };
    reportData.forEach((r) => {
      t.taxableValue += r.taxableValue;
      t.cgstAmount += r.cgstAmount;
      t.sgstAmount += r.sgstAmount;
      t.igstAmount += r.igstAmount;
      t.totalTax += r.totalTax;
      t.invoiceTotal += r.invoiceTotal;
    });
    return t;
  }, [reportData]);

  const handleViewReport = async () => {
    setCurrentPage(1);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await fetch(`/api/reports/gst-filing?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.rows)) {
        setReportData(data.rows as GstFilingRow[]);
      } else {
        setReportData([]);
      }
    } catch {
      setReportData([]);
    }
  };

  const handleClear = () => {
    setStartDate(today);
    setEndDate(today);
    setFilingType("itemWise");
    setSearchQuery("");
    setReportData([]);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">GST Filing</span>

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
          {/* Radio buttons */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="filingType"
                value="itemWise"
                checked={filingType === "itemWise"}
                onChange={(e) => setFilingType(e.target.value)}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Item Wise</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="filingType"
                value="summary"
                checked={filingType === "summary"}
                onChange={(e) => setFilingType(e.target.value)}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Summary</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="filingType"
                value="template1"
                checked={filingType === "template1"}
                onChange={(e) => setFilingType(e.target.value)}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Template 1</span>
            </label>
          </div>

          <div className="flex items-center gap-2 ml-auto">
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
        </div>

        {/* Buttons */}
        <div className="px-6 pb-4 flex flex-wrap items-center gap-3">
          <button onClick={handleViewReport} className="px-6 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
            View Report
          </button>
          <button onClick={handleClear} className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          <div className="px-6 py-5 text-center">
            <div className="text-sm font-medium text-gray-600">Total Sales</div>
            <div className="text-xl font-bold text-gray-800 mt-1">{reportData.length > 0 ? totals.invoiceTotal.toFixed(2) : "—"}</div>
          </div>
          <div className="px-6 py-5 text-center">
            <div className="text-sm font-medium text-gray-600">Total CGST</div>
            <div className="text-xl font-bold text-gray-800 mt-1">{reportData.length > 0 ? totals.cgstAmount.toFixed(2) : "—"}</div>
          </div>
          <div className="px-6 py-5 text-center">
            <div className="text-sm font-medium text-gray-600">Total SGST</div>
            <div className="text-xl font-bold text-gray-800 mt-1">{reportData.length > 0 ? totals.sgstAmount.toFixed(2) : "—"}</div>
          </div>
          <div className="px-6 py-5 text-center">
            <div className="text-sm font-medium text-gray-600">Total Net Sales</div>
            <div className="text-xl font-bold text-gray-800 mt-1">{reportData.length > 0 ? totals.taxableValue.toFixed(2) : "—"}</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
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
            <table className="w-full min-w-[1300px]">
              <thead>
                <tr className="bg-[#3d9a7e] text-white">
                  <th className="px-4 py-3 text-center text-xs font-semibold">S.NO</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">INVOICE NUMBER</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">INVOICE DATE</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">CUSTOMER NAME</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">GSTIN</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">HSN CODE</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">TAXABLE VALUE</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">CGST RATE</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">CGST AMOUNT</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">SGST RATE</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">SGST AMOUNT</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">IGST RATE</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">IGST AMOUNT</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">TOTAL TAX</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">INVOICE TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.sNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">{row.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.invoiceDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.customerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.gstin}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.hsnCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.taxableValue.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.cgstRate}%</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.cgstAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.sgstRate}%</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.sgstAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.igstRate}%</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.igstAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center font-medium">{row.totalTax.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center font-medium">{row.invoiceTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td colSpan={6} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Total:</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-center">{totals.taxableValue.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center"></td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-center">{totals.cgstAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center"></td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-center">{totals.sgstAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center"></td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-center">{totals.igstAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-center">{totals.totalTax.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-center">{totals.invoiceTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
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
      )}
    </div>
  );
}
