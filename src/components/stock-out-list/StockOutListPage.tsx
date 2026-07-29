"use client";

import { useState } from "react";
import { Maximize2, Settings, X } from "lucide-react";
import { sampleStockOuts, departments, StockOutRecord } from "./data";

export default function StockOutListPage() {
  const [reportType, setReportType] = useState<"bill" | "item" | "consolidation">("bill");
  const [startDate, setStartDate] = useState("28/07/2026");
  const [endDate, setEndDate] = useState("28/07/2026");
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [branchOut, setBranchOut] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<StockOutRecord[]>(sampleStockOuts);

  const branchList = ["Main Branch", "Second Branch"];

  const handleViewReport = () => {
    let result = [...sampleStockOuts];
    if (startDate) {
      result = result.filter((r) => r.createdDate >= startDate);
    }
    if (endDate) {
      result = result.filter((r) => r.createdDate <= endDate);
    }
    if (branch) {
      result = result.filter((r) => r.branchOutName === branch);
    }
    if (department) {
      result = result.filter((r) => r.deptName === department);
    }
    if (branchOut) {
      result = result.filter((r) => r.branchOutName === branchOut);
    }
    setFilteredData(result);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setReportType("bill");
    setStartDate("28/07/2026");
    setEndDate("28/07/2026");
    setBranch("");
    setDepartment("");
    setBranchOut("");
    setSearchQuery("");
    setFilteredData(sampleStockOuts);
    setCurrentPage(1);
  };

  const searchFilteredData = searchQuery
    ? filteredData.filter(
        (r) =>
          r.grnNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.deptName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.branchOutName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.remarks.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredData;

  const totalPages = Math.ceil(searchFilteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = searchFilteredData.slice(startIndex, startIndex + entriesPerPage);

  const formatCurrency = (amount: number) => amount.toFixed(2);

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Top Panel - Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Stock Out List</h2>
          <div className="flex items-center gap-2">
            <button className="text-gray-500 hover:text-gray-700">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <Settings className="w-4 h-4" />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="px-6 pt-6 pb-12 space-y-5">
          {/* Row 1: Report Type + Dates + Branch */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-700 font-medium">Report Type</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  checked={reportType === "bill"}
                  onChange={() => setReportType("bill")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Bill</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  checked={reportType === "item"}
                  onChange={() => setReportType("item")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Item</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  checked={reportType === "consolidation"}
                  onChange={() => setReportType("consolidation")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Consolidation</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                Start Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate.split("/").reverse().join("-")}
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split("-");
                  setStartDate(`${d}/${m}/${y}`);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                End Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate.split("/").reverse().join("-")}
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split("-");
                  setEndDate(`${d}/${m}/${y}`);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Branch--</option>
                {branchList.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Department + Branch Out + Buttons */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Department--</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Branch Out</label>
              <select
                value={branchOut}
                onChange={(e) => setBranchOut(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Branch--</option>
                {branchList.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 ml-auto">
              <button
                onClick={handleViewReport}
                className="px-6 py-2 bg-[#2a7de1] text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                View Report
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Controls */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-700 transition-colors">
                PDF
              </button>
              <button className="bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-emerald-700 transition-colors">
                Excel
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder=""
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold">S.NO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">GRN NO.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">GRN DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">DEPT. NAME</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">BRANCH OUT NAME</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">NO. OF PRODUCTS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">TAX AMOUNT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">GRAND TOTAL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">REMARKS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CREATED DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">EDIT / PRINT</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{record.sNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{record.grnNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.grnDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.deptName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.branchOutName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.noOfProducts}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(record.taxAmount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(record.grandTotal)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.remarks}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.createdDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          Edit
                        </button>
                        <span className="text-gray-300">/</span>
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total:</span>
            <div className="flex gap-8">
              <span className="text-sm font-semibold text-gray-700">
                {formatCurrency(searchFilteredData.reduce((sum, r) => sum + r.taxAmount, 0))}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {formatCurrency(searchFilteredData.reduce((sum, r) => sum + r.grandTotal, 0))}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {searchFilteredData.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(startIndex + entriesPerPage, searchFilteredData.length)} of{" "}
              {searchFilteredData.length} entries
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
    </div>
  );
}
