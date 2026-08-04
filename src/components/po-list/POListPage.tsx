"use client";

import { useState, useEffect } from "react";
import { Maximize2, Settings, X, Loader2 } from "lucide-react";
import { PORecord } from "./data";

export default function POListPage() {
  const [reportType, setReportType] = useState<"bill" | "item" | "consolidation">("bill");
  const [startDate, setStartDate] = useState("28/07/2026");
  const [endDate, setEndDate] = useState("28/07/2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [purchaseOrders, setPurchaseOrders] = useState<PORecord[]>([]);
  const [filteredData, setFilteredData] = useState<PORecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState<string | null>(null);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/purchase-orders");
      const data = await res.json();
      if (data.success && data.orders) {
        const mapped: PORecord[] = data.orders.map((order: Record<string, unknown>, index: number) => ({
          id: String(order.id),
          sNo: index + 1,
          poDate: new Date(order.orderDate as string).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }),
          poNo: order.poNumber as string,
          branchName: "-",
          noOfProducts: (order.items as unknown[])?.length || 0,
          grandTotal: parseFloat(order.grandTotal as string),
          remarks: (order.notes as string) || "",
          vendorName: ((order.vendor as Record<string, string>)?.vendorName) || "",
          createdDate: new Date(order.createdAt as string).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }),
          requestStatus: (order.status === "PENDING" || order.status === "DRAFT" ? "Pending" : order.status === "APPROVED" ? "Approved" : order.status === "CANCELLED" ? "Rejected" : "Completed") as PORecord["requestStatus"],
        }));
        setPurchaseOrders(mapped);
        setFilteredData(mapped);
      } else {
        setError(data.error || "Failed to load purchase orders");
      }
    } catch (err) {
      setError("Failed to load purchase orders: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPOs();
  }, []);

  // Handle approve
  const handleApprove = async (id: string, currentStatus: string) => {
    if (currentStatus !== "Pending") return;
    setApproving(id);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), status: "APPROVED" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPOs();
      } else {
        alert(data.error || "Failed to approve PO");
      }
    } catch {
      alert("Failed to approve PO");
    } finally {
      setApproving(null);
    }
  };

  // Handle cancel
  const handleCancel = async (id: string) => {
    setApproving(id);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), status: "CANCELLED" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPOs();
      } else {
        alert(data.error || "Failed to cancel PO");
      }
    } catch {
      alert("Failed to cancel PO");
    } finally {
      setApproving(null);
    }
  };

  // Parse DD/MM/YYYY to comparable date
  const parseDate = (dateStr: string): Date => {
    const [d, m, y] = dateStr.split("/").map(Number);
    return new Date(y, m - 1, d);
  };

  // Handle view report
  const handleViewReport = () => {
    let result = [...purchaseOrders];
    if (startDate) {
      const start = parseDate(startDate);
      result = result.filter((r) => parseDate(r.createdDate) >= start);
    }
    if (endDate) {
      const end = parseDate(endDate);
      result = result.filter((r) => parseDate(r.createdDate) <= end);
    }
    setFilteredData(result);
    setCurrentPage(1);
  };

  // Handle clear
  const handleClear = () => {
    setReportType("bill");
    setStartDate("28/07/2026");
    setEndDate("28/07/2026");
    setSearchQuery("");
    setFilteredData(purchaseOrders);
    setCurrentPage(1);
  };

  // Search filter
  const searchFilteredData = searchQuery
    ? filteredData.filter(
        (r) =>
          r.poNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.remarks.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.requestStatus.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredData;

  // Pagination
  const totalPages = Math.ceil(searchFilteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = searchFilteredData.slice(startIndex, startIndex + entriesPerPage);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-700";
      case "Pending":
        return "bg-amber-100 text-amber-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Completed":
        return "bg-blue-100 text-blue-700";
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
          <h2 className="text-base font-semibold text-gray-800">Purchase Order Request List</h2>
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
          {/* Row 1: Report Type + Dates */}
          <div className="flex items-center gap-8 flex-wrap">
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
          </div>

          {/* Row 2: Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleViewReport}
              className="px-6 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
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
                <th className="px-4 py-3 text-left text-xs font-semibold">PO DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">PO NO.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">BRANCH NAME</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">NO. OF PRODUCTS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">GRAND TOTAL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">REMARKS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">VENDOR NAME</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CREATED DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">REQUEST STATUS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">EDIT / PRINT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((po) => (
                  <tr
                    key={po.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{po.sNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{po.poDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{po.poNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{po.branchName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{po.noOfProducts}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(po.grandTotal)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{po.remarks}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{po.vendorName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{po.createdDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(po.requestStatus)}`}>
                        {po.requestStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {po.requestStatus === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(po.id, po.requestStatus)}
                              disabled={approving === po.id}
                              className="text-emerald-600 hover:text-emerald-800 text-xs font-medium disabled:opacity-50"
                            >
                              {approving === po.id ? "..." : "Approve"}
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleCancel(po.id)}
                              disabled={approving === po.id}
                              className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <span className="text-gray-300">|</span>
                          </>
                        )}
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
                {searchFilteredData.reduce((sum, r) => sum + r.noOfProducts, 0)}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {formatCurrency(searchFilteredData.reduce((sum, r) => sum + r.grandTotal, 0))}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
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
