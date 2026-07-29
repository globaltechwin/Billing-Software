"use client";

import { useState, useMemo } from "react";
import { Plus, RefreshCw, List, CalendarDays, FileSpreadsheet, FileText, Pencil, Trash2, Eye } from "lucide-react";

interface EventRecord {
  id: string;
  sNo: number;
  eventName: string;
  type: string;
  startDate: string;
  endDate: string;
  time: string;
  venue: string;
  guests: number;
  status: "Scheduled" | "Confirmed" | "Pending" | "In Progress" | "Completed" | "Cancelled";
  contact: string;
}

const sampleEvents: EventRecord[] = [
  { id: "1", sNo: 1, eventName: "Customer Appreciation Day", type: "Promotional", startDate: "15/08/2026", endDate: "15/08/2026", time: "10:00 AM", venue: "Main Hall", guests: 45, status: "Scheduled", contact: "9876543210" },
  { id: "2", sNo: 2, eventName: "Rajesh Kumar Birthday", type: "Birthday", startDate: "20/07/2026", endDate: "20/07/2026", time: "06:00 PM", venue: "Banquet Hall A", guests: 30, status: "Completed", contact: "9840393333" },
  { id: "3", sNo: 3, eventName: "Corporate Annual Meet", type: "Corporate", startDate: "05/08/2026", endDate: "06/08/2026", time: "09:00 AM", venue: "Convention Center", guests: 200, status: "Confirmed", contact: "9746602303" },
  { id: "4", sNo: 4, eventName: "Festival Mega Sale Event", type: "Festival", startDate: "10/08/2026", endDate: "12/08/2026", time: "11:00 AM", venue: "City Mall", guests: 500, status: "Pending", contact: "9500122580" },
  { id: "5", sNo: 5, eventName: "Catering - Sharma Wedding", type: "Catering", startDate: "25/07/2026", endDate: "25/07/2026", time: "07:00 PM", venue: "Garden Resort", guests: 150, status: "Confirmed", contact: "9677333175" },
  { id: "6", sNo: 6, eventName: "Outdoor Sports Day", type: "Outdoor", startDate: "01/09/2026", endDate: "01/09/2026", time: "07:00 AM", venue: "Sports Complex", guests: 80, status: "Scheduled", contact: "7010991925" },
  { id: "7", sNo: 7, eventName: "Diwali Celebration", type: "Festival", startDate: "20/10/2026", endDate: "20/10/2026", time: "06:00 PM", venue: "Office Premises", guests: 120, status: "Pending", contact: "9025165143" },
  { id: "8", sNo: 8, eventName: "Product Launch Event", type: "Promotional", startDate: "12/08/2026", endDate: "12/08/2026", time: "11:00 AM", venue: "Hotel Grand", guests: 75, status: "Cancelled", contact: "9170109919" },
];

export default function EventManagementPage() {
  const today = new Date().toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [eventType, setEventType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const eventTypes = ["Birthday", "Corporate", "Catering", "Outdoor", "Festival", "Promotional"];
  const statuses = ["Scheduled", "Confirmed", "Pending", "In Progress", "Completed", "Cancelled"];

  const thisMonth = sampleEvents.filter((e) => {
    const [dd, mm, yy] = e.startDate.split("/").map(Number);
    const now = new Date();
    return mm === now.getMonth() + 1 && yy === now.getFullYear();
  }).length;

  const thisWeek = sampleEvents.filter((e) => {
    const now = new Date();
    const [dd, mm, yy] = e.startDate.split("/").map(Number);
    const eventDate = new Date(yy, mm - 1, dd);
    const diff = Math.abs(eventDate.getTime() - now.getTime());
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const pending = sampleEvents.filter((e) => e.status === "Pending").length;
  const confirmed = sampleEvents.filter((e) => e.status === "Confirmed").length;
  const totalGuests = sampleEvents.reduce((sum, e) => sum + e.guests, 0);

  const filteredData = useMemo(() => {
    let data = [...sampleEvents];
    if (eventType) {
      data = data.filter((e) => e.type === eventType);
    }
    if (statusFilter) {
      data = data.filter((e) => e.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (e) =>
          e.eventName.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.contact.toLowerCase().includes(q)
      );
    }
    return data;
  }, [eventType, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleClear = () => {
    setEventType("");
    setStatusFilter("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Scheduled: "bg-blue-100 text-blue-700 border border-blue-200",
      Confirmed: "bg-green-100 text-green-700 border border-green-200",
      Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      "In Progress": "bg-purple-100 text-purple-700 border border-purple-200",
      Completed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      Cancelled: "bg-red-100 text-red-700 border border-red-200",
    };
    return styles[status] || styles.Pending;
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">📅</span>
        <h1 className="text-xl font-bold text-gray-800">Event Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="text-lg">📅</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{thisMonth}</p>
            <p className="text-xs text-gray-500">This Month</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-green-500 border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <span className="text-lg">✅</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{thisWeek}</p>
            <p className="text-xs text-gray-500">This Week</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-orange-500 border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <span className="text-lg">⏰</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-emerald-500 border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <span className="text-lg">✅</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{confirmed}</p>
            <p className="text-xs text-gray-500">Confirmed</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-purple-500 border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <span className="text-lg">👥</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalGuests}</p>
            <p className="text-xs text-gray-500">Total Guests</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 flex flex-wrap items-end gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[150px]"
            >
              <option value="">All Types</option>
              {eventTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[150px]"
            >
              <option value="">All Status</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
          >
            <span>🔍</span> Search
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* View Toggle + New Event */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-[#1e293b] text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <List size={14} /> List View
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-[#1e293b] text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <CalendarDays size={14} /> Calendar View
          </button>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-5 py-2 bg-[#4caf85] text-white rounded-lg text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
        >
          <Plus size={16} /> New Event
        </button>
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
              <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1">
                <FileSpreadsheet size={14} /> Excel
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1">
                <FileText size={14} /> PDF
              </button>
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
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-3 py-3 text-center text-xs font-semibold w-[60px]">
                  <div className="flex items-center justify-center gap-1">S.NO ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">EVENT NAME ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">TYPE ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">START DATE ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">END DATE ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">TIME ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">VENUE ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">GUESTS ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">STATUS ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">CONTACT ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">ACTIONS</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                    No events found for the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.sNo}</td>
                    <td className="px-3 py-3 text-sm text-gray-800 text-center font-medium">{row.eventName}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.type}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center whitespace-nowrap">{row.startDate}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center whitespace-nowrap">{row.endDate}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.time}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.venue}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.guests}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.contact}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1 text-blue-500 hover:text-blue-700 rounded hover:bg-blue-50" title="View">
                          <Eye size={15} />
                        </button>
                        <button className="p-1 text-amber-500 hover:text-amber-700 rounded hover:bg-amber-50" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
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
            {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === page
                    ? "bg-[#3d9a7e] text-white border-[#3d9a7e]"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
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

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Create New Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Event Name *</label>
                  <input type="text" placeholder="Enter event name" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Event Type *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">--Select--</option>
                    {eventTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date *</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">End Date *</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Time</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Guests</label>
                  <input type="number" placeholder="Number of guests" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Venue</label>
                <input type="text" placeholder="Enter venue" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Number</label>
                  <input type="tel" placeholder="Phone number" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
                <textarea rows={3} placeholder="Event notes..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Event created successfully!");
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
