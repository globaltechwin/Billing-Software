"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Maximize2, Settings, X, Loader2 } from "lucide-react";
import { IndentRecord } from "./data";

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const statusList = ["Pending", "Approved", "Rejected", "Completed", "Cancelled"];

export default function IndentListPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [indents, setIndents] = useState<IndentRecord[]>([]);
  const [filteredData, setFilteredData] = useState<IndentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  const fetchIndents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/indents");
      const data = await res.json();
      if (data.success && data.indents) {
        const mapped: IndentRecord[] = data.indents.map(
          (r: Record<string, unknown>, index: number) => {
            const items = (r.items as Record<string, unknown>[]) || [];
            const totalQty = items.reduce(
              (sum: number, item: Record<string, unknown>) =>
                sum + Number(item.requiredQty || 0),
              0
            );
            const createdBy = (r.createdByUser as Record<string, string>)?.name || "";
            return {
              id: String(r.id),
              sNo: index + 1,
              indentNo: r.indentNumber as string,
              indentDate: new Date(r.indentDate as string).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
              requestedBy: r.requestedBy as string,
              department: r.department as string,
              priority: r.priority as string,
              requiredDate: r.requiredDate
                ? new Date(r.requiredDate as string).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "-",
              totalProducts: items.length,
              totalQty,
              remarks: (r.remarks as string) || "-",
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
        setIndents(mapped);
        setFilteredData(mapped);
      } else {
        setError(data.error || "Failed to load indent records");
      }
    } catch (err) {
      setError(
        "Failed to load indent records: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndents();
  }, [fetchIndents]);

  const mapStatus = (status: string): IndentRecord["status"] => {
    switch (status) {
      case "APPROVED": return "Approved";
      case "REJECTED": return "Rejected";
      case "COMPLETED": return "Completed";
      case "CANCELLED": return "Cancelled";
      case "PENDING":
      default: return "Pending";
    }
  };

  const parseDate = (dateStr: string): Date => {
    const [d, m, y] = dateStr.split("/").map(Number);
    return new Date(y, m - 1, d);
  };

  // Approve / Cancel action
  const handleStatusChange = async (indentId: number, newStatus: string) => {
    setActionLoading(indentId);
    setActionMessage("");
    try {
      const res = await fetch("/api/indents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: indentId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }
      setActionMessage(`Indent ${newStatus.toLowerCase()} successfully`);
      setTimeout(() => setActionMessage(""), 2000);
      fetchIndents();
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : "Action failed");
      setTimeout(() => setActionMessage(""), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  // Edit - navigate to indent request page with edit param
  const handleEdit = (indentId: number) => {
    router.push(`/inventory/indent-request?edit=${indentId}`);
  };

  // View Report
  const handleViewReport = () => {
    let result = [...indents];
    if (startDate) {
      const start = parseDate(startDate);
      result = result.filter((r) => parseDate(r.indentDate) >= start);
    }
    if (endDate) {
      const end = parseDate(endDate);
      result = result.filter((r) => parseDate(r.indentDate) <= end);
    }
    if (priorityFilter) {
      result = result.filter((r) => r.priority === priorityFilter);
    }
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }
    setFilteredData(result);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setPriorityFilter("");
    setStatusFilter("");
    setSearchQuery("");
    setFilteredData(indents);
    setCurrentPage(1);
  };

  const searchFilteredData = searchQuery
    ? filteredData.filter(
        (r) =>
          r.indentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredData;

  const totalPages = Math.ceil(searchFilteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = searchFilteredData.slice(startIndex, startIndex + entriesPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-100 text-emerald-700";
      case "Pending": return "bg-amber-100 text-amber-700";
      case "Rejected": return "bg-red-100 text-red-700";
      case "Completed": return "bg-blue-100 text-blue-700";
      case "Cancelled": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "bg-red-100 text-red-700";
      case "HIGH": return "bg-orange-100 text-orange-700";
      case "MEDIUM": return "bg-amber-100 text-amber-700";
      case "LOW": return "bg-emerald-100 text-emerald-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatPriority = (priority: string) => {
    switch (priority) {
      case "LOW": return "Low";
      case "MEDIUM": return "Medium";
      case "HIGH": return "High";
      case "URGENT": return "Urgent";
      default: return priority;
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Action message toast */}
      {actionMessage && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium ${
          actionMessage.includes("failed") || actionMessage.includes("Cannot")
            ? "bg-red-600 text-white"
            : "bg-emerald-600 text-white"
        }`}>
          {actionMessage}
        </div>
      )}

      {/* Top Panel - Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Indent Request List</h2>
          <div className="flex items-center gap-2">
            <button className="text-gray-500 hover:text-gray-700"><Maximize2 className="w-4 h-4" /></button>
            <button className="text-gray-500 hover:text-gray-700"><Settings className="w-4 h-4" /></button>
            <button className="text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="px-6 pt-6 pb-12 space-y-5">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Priority</label>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">--Select Priority--</option>
                {priorities.map((p) => (<option key={p} value={p}>{formatPriority(p)}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">--Select Status--</option>
                {statusList.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="flex gap-3 ml-auto">
              <button onClick={handleViewReport} className="px-6 py-2 bg-[#2a7de1] text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">View Report</button>
              <button onClick={handleClear} className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">Clear</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-700 transition-colors">PDF</button>
              <button className="bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-emerald-700 transition-colors">Excel</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder=""
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold">S.NO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">INDENT NO.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">INDENT DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">REQUESTED BY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">DEPT.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">PRIORITY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">REQUIRED DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">TOTAL PRODUCTS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">TOTAL QTY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">STATUS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CREATED BY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CREATED DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={13} className="px-4 py-12 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-sm text-red-500">{error}</td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-sm text-gray-500">No data available in table</td>
                </tr>
              ) : (
                paginatedData.map((record) => {
                  const indentId = parseInt(record.id);
                  const isPending = record.status === "Pending";
                  return (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{record.sNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">{record.indentNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.indentDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.requestedBy}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.department}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(record.priority)}`}>
                          {formatPriority(record.priority)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.requiredDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.totalProducts}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.totalQty}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.createdBy}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.createdDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleStatusChange(indentId, "APPROVED")}
                                disabled={actionLoading === indentId}
                                className="text-emerald-600 hover:text-emerald-800 text-xs font-medium disabled:opacity-50"
                              >
                                {actionLoading === indentId ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Approve"}
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleStatusChange(indentId, "CANCELLED")}
                                disabled={actionLoading === indentId}
                                className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <span className="text-gray-300">|</span>
                            </>
                          )}
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleEdit(indentId)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                              >
                                Edit
                              </button>
                              <span className="text-gray-300">|</span>
                            </>
                          )}
                          <button className="text-gray-600 hover:text-gray-800 text-xs font-medium">Print</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-gray-600">
              Showing {searchFilteredData.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(startIndex + entriesPerPage, searchFilteredData.length)} of {searchFilteredData.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
