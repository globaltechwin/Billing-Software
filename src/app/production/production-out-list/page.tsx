"use client";

import { useState, useMemo } from "react";
import { ChevronUp, Settings, X } from "lucide-react";
import { sampleBranches } from "@/components/branch-master/data";

interface ProductionOutRecord {
  id: string;
  sNo: number;
  prodNo: string;
  catName: string;
  productionDate: string;
  numberOfProducts: number;
  grandTotal: number;
  branch: string;
  remarks: string;
  createdDate: string;
}

const sampleProductionOutRecords: ProductionOutRecord[] = [
  { id: "1", sNo: 1, prodNo: "PO-1001", catName: "Morning Session", productionDate: "28/07/2026", numberOfProducts: 3, grandTotal: 3200.00, branch: "Demo2", remarks: "Morning raw materials", createdDate: "28/07/2026" },
  { id: "2", sNo: 2, prodNo: "PO-1002", catName: "Afternoon Session", productionDate: "27/07/2026", numberOfProducts: 5, grandTotal: 6800.00, branch: "Demo2", remarks: "Afternoon ingredients", createdDate: "27/07/2026" },
  { id: "3", sNo: 3, prodNo: "PO-1003", catName: "Full Day", productionDate: "26/07/2026", numberOfProducts: 2, grandTotal: 2100.00, branch: "Demo2", remarks: "Weekend stock out", createdDate: "26/07/2026" },
  { id: "4", sNo: 4, prodNo: "PO-1004", catName: "Morning Session", productionDate: "25/07/2026", numberOfProducts: 4, grandTotal: 5400.00, branch: "Demo2", remarks: "Regular materials", createdDate: "25/07/2026" },
  { id: "5", sNo: 5, prodNo: "PO-1005", catName: "Evening Session", productionDate: "24/07/2026", numberOfProducts: 6, grandTotal: 7900.00, branch: "Demo2", remarks: "Evening supplies", createdDate: "24/07/2026" },
];

export default function ProductionOutListPage() {
  const today = new Date().toISOString().split("T")[0];
  const [reportType, setReportType] = useState<"Bill" | "Item">("Bill");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [branch, setBranch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showData, setShowData] = useState(false);

  const filteredData = useMemo(() => {
    let data = showData ? sampleProductionOutRecords : [];
    if (branch) {
      const branchName = sampleBranches.find((b) => b.id === branch)?.branchName || "";
      data = data.filter((r) => r.branch === branchName);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.prodNo.toLowerCase().includes(q) ||
          r.catName.toLowerCase().includes(q) ||
          r.branch.toLowerCase().includes(q) ||
          r.remarks.toLowerCase().includes(q)
      );
    }
    return data;
  }, [showData, branch, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const grandTotalSum = useMemo(
    () => filteredData.reduce((sum, r) => sum + r.grandTotal, 0),
    [filteredData]
  );

  const handleViewReport = () => {
    setShowData(true);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setReportType("Bill");
    setStartDate(today);
    setEndDate(today);
    setBranch("");
    setSearchQuery("");
    setCurrentPage(1);
    setShowData(false);
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Production Out List</h2>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
              <ChevronUp size={16} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
              <Settings size={16} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Report Type</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  checked={reportType === "Bill"}
                  onChange={() => setReportType("Bill")}
                  className="w-3.5 h-3.5 text-blue-600"
                />
                <span className="text-sm text-gray-700">Bill</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  checked={reportType === "Item"}
                  onChange={() => setReportType("Item")}
                  className="w-3.5 h-3.5 text-blue-600"
                />
                <span className="text-sm text-gray-700">Item</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Start Date*</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[160px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">End Date*</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[160px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[180px]"
            >
              <option value="">--Select Branch--</option>
              {sampleBranches.map((b) => (
                <option key={b.id} value={b.id}>{b.branchName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 pb-5 flex items-center gap-3">
          <button
            onClick={handleViewReport}
            className="px-5 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
          >
            View Report
          </button>
          <button
            onClick={handleClear}
            className="px-5 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
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

          <div className="flex items-center gap-3">
            <button className="px-4 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              PDF
            </button>
            <button className="px-4 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              Excel
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Search:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">S.NO ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">PROD. NO. ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">CAT. NAME ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">PRODUCTION DATE ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">NO. OF PRODUCTS ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">GRAND TOTAL ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">BRANCH ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">REMARKS ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">CREATED DATE ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">EDIT ↕</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.sNo}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.prodNo}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.catName}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.productionDate}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.numberOfProducts}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{formatCurrency(row.grandTotal)}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.branch}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.remarks}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.createdDate}</td>
                    <td className="px-3 py-3 text-center">
                      <button className="text-blue-500 hover:text-blue-700 text-xs underline">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-8 text-sm text-gray-700 font-medium">
            <span>Total:</span>
            <span>{showData && filteredData.length > 0 ? formatCurrency(grandTotalSum) : "0.00"}</span>
            <span>{showData && filteredData.length > 0 ? formatCurrency(grandTotalSum) : "0.00"}</span>
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
