"use client";

import { useState, useEffect } from "react";
import { Maximize2, Settings, X, Loader2 } from "lucide-react";
import { StockOutRecord } from "./data";

const stockOutTypes = [
  "PRODUCTION",
  "DAMAGE",
  "ADJUSTMENT",
  "BRANCH_TRANSFER",
  "OTHER",
];

const statusList = ["Pending", "Completed", "Cancelled"];

export default function StockOutListPage() {
  const [startDate, setStartDate] = useState("30/07/2026");
  const [endDate, setEndDate] = useState("30/07/2026");
  const [stockOutTypeFilter, setStockOutTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [stockOuts, setStockOuts] = useState<StockOutRecord[]>([]);
  const [filteredData, setFilteredData] = useState<StockOutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStockOuts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stock-outs");
      const data = await res.json();
      if (data.success && data.stockOuts) {
        const mapped: StockOutRecord[] = data.stockOuts.map(
          (r: Record<string, unknown>, index: number) => {
            const items = (r.items as Record<string, unknown>[]) || [];
            const totalQty = items.reduce(
              (sum: number, item: Record<string, unknown>) =>
                sum + Number(item.quantity || 0),
              0
            );
            const totalAmt = items.reduce(
              (sum: number, item: Record<string, unknown>) =>
                sum + Number(item.amount || 0),
              0
            );
            const createdBy = (r.createdByUser as Record<string, string>)?.name || "";
            return {
              id: String(r.id),
              sNo: index + 1,
              stockOutNo: r.stockOutNumber as string,
              date: new Date(r.stockOutDate as string).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
              stockOutType: r.stockOutType as string,
              referenceNumber: (r.referenceNumber as string) || "-",
              totalItems: items.length,
              totalQuantity: totalQty,
              totalAmount: totalAmt,
              remarks: (r.notes as string) || "-",
              status: mapStatus(r.status as string),
              createdBy,
              createdDate: new Date(r.createdAt as string).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
            };
          }
        );
        setStockOuts(mapped);
        setFilteredData(mapped);
      } else {
        setError(data.error || "Failed to load stock out records");
      }
    } catch (err) {
      setError(
        "Failed to load stock out records: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStockOuts();
  }, []);

  // Map status to display status
  const mapStatus = (status: string): StockOutRecord["status"] => {
    switch (status) {
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      case "PENDING":
      default:
        return "Pending";
    }
  };

  // Map stock out type to display label
  const mapStockOutType = (type: string) => {
    switch (type) {
      case "PRODUCTION": return "Production";
      case "DAMAGE": return "Damage";
      case "ADJUSTMENT": return "Adjustment";
      case "BRANCH_TRANSFER": return "Branch Transfer";
      case "OTHER": return "Other";
      default: return type;
    }
  };

  // Parse DD/MM/YYYY to Date
  const parseDate = (dateStr: string): Date => {
    const [d, m, y] = dateStr.split("/").map(Number);
    return new Date(y, m - 1, d);
  };

  // Handle view report
  const handleViewReport = () => {
    let result = [...stockOuts];
    if (startDate) {
      const start = parseDate(startDate);
      result = result.filter((r) => parseDate(r.date) >= start);
    }
    if (endDate) {
      const end = parseDate(endDate);
      result = result.filter((r) => parseDate(r.date) <= end);
    }
    if (stockOutTypeFilter) {
      result = result.filter((r) => r.stockOutType === stockOutTypeFilter);
    }
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }
    setFilteredData(result);
    setCurrentPage(1);
  };

  // Handle clear
  const handleClear = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    setStartDate(`${dd}/${mm}/${yyyy}`);
    setEndDate(`${dd}/${mm}/${yyyy}`);
    setStockOutTypeFilter("");
    setStatusFilter("");
    setSearchQuery("");
    setFilteredData(stockOuts);
    setCurrentPage(1);
  };

  // Search filter
  const searchFilteredData = searchQuery
    ? filteredData.filter(
        (r) =>
          r.stockOutNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.stockOutType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.createdBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.remarks.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredData;

  // Pagination
  const totalPages = Math.ceil(searchFilteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = searchFilteredData.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700";
      case "Pending":
        return "bg-amber-100 text-amber-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Format currency
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
          {/* Row 1: Dates */}
          <div className="flex items-center gap-6 flex-wrap">
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
          </div>

          {/* Row 2: Stock Out Type + Status + Buttons */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Stock Out Type</label>
              <select
                value={stockOutTypeFilter}
                onChange={(e) => setStockOutTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Type--</option>
                {stockOutTypes.map((t) => (
                  <option key={t} value={t}>{mapStockOutType(t)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Status--</option>
                {statusList.map((s) => (
                  <option key={s} value={s}>{s}</option>
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
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 flex-wrap gap-2">
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
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold">S.NO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">STOCK OUT NO.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">TYPE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">REF. NUMBER</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">NO. OF PRODUCTS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">TOTAL QTY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">TOTAL AMOUNT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">STATUS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CREATED BY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CREATED DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-sm text-gray-500">
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
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{record.stockOutNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{mapStockOutType(record.stockOutType)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.referenceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.totalItems}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.totalQuantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(record.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.createdBy}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.createdDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button className="text-gray-600 hover:text-gray-800 text-xs font-medium">
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
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <div className="flex gap-8">
              <span className="text-sm font-semibold text-gray-700">
                {searchFilteredData.reduce(
                  (sum, r) => sum + r.totalQuantity,
                  0
                )}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {formatCurrency(
                  searchFilteredData.reduce(
                    (sum, r) => sum + r.totalAmount,
                    0
                  )
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-gray-600">
              Showing {searchFilteredData.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(
                startIndex + entriesPerPage,
                searchFilteredData.length
              )}{" "}
              of {searchFilteredData.length} entries
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
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
