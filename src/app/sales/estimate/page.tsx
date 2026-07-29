"use client";

import { useState, useMemo } from "react";
import { ChevronUp, Settings, X, Search, Calendar } from "lucide-react";

interface EstimateRecord {
  id: string;
  sNo: number;
  estimateNo: string;
  estimateDate: string;
  expiryDate: string;
  customerName: string;
  status: "Pending" | "Accepted" | "Rejected" | "Expired";
  amount: number;
}

const sampleEstimates: EstimateRecord[] = [
  { id: "1", sNo: 1, estimateNo: "EST-1001", estimateDate: "28/07/2026", expiryDate: "27/08/2026", customerName: "Lakshmi Enterprises", status: "Pending", amount: 25000.00 },
  { id: "2", sNo: 2, estimateNo: "EST-1002", estimateDate: "27/07/2026", expiryDate: "26/08/2026", customerName: "Vijay Textiles", status: "Accepted", amount: 18500.00 },
  { id: "3", sNo: 3, estimateNo: "EST-1003", estimateDate: "26/07/2026", expiryDate: "25/08/2026", customerName: "Prakash Traders", status: "Pending", amount: 42000.00 },
  { id: "4", sNo: 4, estimateNo: "EST-1004", estimateDate: "25/07/2026", expiryDate: "24/08/2026", customerName: "Anita Garments", status: "Rejected", amount: 9500.00 },
  { id: "5", sNo: 5, estimateNo: "EST-1005", estimateDate: "24/07/2026", expiryDate: "23/08/2026", customerName: "Rajesh Hardware", status: "Expired", amount: 31200.00 },
];

export default function EstimatePage() {
  const today = new Date().toISOString().split("T")[0];
  const [estimateNoSearch, setEstimateNoSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showData, setShowData] = useState(false);

  const uniqueEstimateNos = useMemo(() => [...new Set(sampleEstimates.map((r) => r.estimateNo))], []);
  const uniqueCustomers = useMemo(() => [...new Set(sampleEstimates.map((r) => r.customerName))], []);
  const uniqueStatuses = ["Pending", "Accepted", "Rejected", "Expired"];

  const filteredData = useMemo(() => {
    let data = showData ? sampleEstimates : [];
    if (estimateNoSearch) {
      data = data.filter((r) => r.estimateNo === estimateNoSearch);
    }
    if (customerSearch) {
      data = data.filter((r) => r.customerName === customerSearch);
    }
    if (statusFilter) {
      data = data.filter((r) => r.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.estimateNo.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
      );
    }
    return data;
  }, [showData, estimateNoSearch, customerSearch, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const handleSearch = () => {
    setShowData(true);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setEstimateNoSearch("");
    setCustomerSearch("");
    setStatusFilter("");
    setSearchQuery("");
    setCurrentPage(1);
    setShowData(false);
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      Accepted: "bg-green-100 text-green-700 border border-green-200",
      Rejected: "bg-red-100 text-red-700 border border-red-200",
      Expired: "bg-gray-100 text-gray-600 border border-gray-200",
    };
    return styles[status] || styles.Pending;
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Top Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-5 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors">
            New F3
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            <Settings size={14} />
            Templates
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">All Estimates</h2>
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Estimate No</label>
            <div className="relative">
              <select
                value={estimateNoSearch}
                onChange={(e) => setEstimateNoSearch(e.target.value)}
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none w-[200px]"
              >
                <option value="">--Search in Estimate No--</option>
                {uniqueEstimateNos.map((no) => (
                  <option key={no} value={no}>{no}</option>
                ))}
              </select>
              {estimateNoSearch && (
                <button
                  onClick={() => setEstimateNoSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Customer</label>
            <div className="relative">
              <select
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none w-[220px]"
              >
                <option value="">--Search in Customer--</option>
                {uniqueCustomers.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {customerSearch && (
                <button
                  onClick={() => setCustomerSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none w-[160px]"
              >
                <option value="">--Status--</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex items-center gap-3">
          <button
            onClick={handleSearch}
            className="px-5 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
          >
            Search
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Search:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowData(true);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-3 py-3 text-center text-xs font-semibold w-[60px]">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[10px]">◀▶</span>
                  </div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">ESTIMATENO ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">ESTIMATEDATE ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">EXPIRYDATE ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">CUSTOMERNAME ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">STATUS ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">AMOUNT ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">EDIT / PRINT</div>
                </th>
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
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.sNo}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.estimateNo}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.estimateDate}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.expiryDate}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.customerName}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{formatCurrency(row.amount)}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-blue-500 hover:text-blue-700 text-xs underline">
                          Edit
                        </button>
                        <span className="text-gray-300">/</span>
                        <button className="text-blue-500 hover:text-blue-700 text-xs underline">
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

        <div className="px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700 font-medium mb-2">
            Total: <span className="ml-2">{showData ? formatCurrency(filteredData.reduce((s, r) => s + r.amount, 0)) : "0.00"}</span>
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
