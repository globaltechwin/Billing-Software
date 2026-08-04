"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Plus, RefreshCw, List, CalendarDays, FileSpreadsheet, FileText, Pencil, Trash2, Eye } from "lucide-react";

interface EventRecord {
  id: number;
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
  notes: string;
}

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
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewEvent, setViewEvent] = useState<EventRecord | null>(null);
  const [editEvent, setEditEvent] = useState<EventRecord | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());

  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const formNameRef = useRef<HTMLInputElement>(null);
  const formTypeRef = useRef<HTMLSelectElement>(null);
  const formStartDateRef = useRef<HTMLInputElement>(null);
  const formEndDateRef = useRef<HTMLInputElement>(null);
  const formTimeRef = useRef<HTMLInputElement>(null);
  const formGuestsRef = useRef<HTMLInputElement>(null);
  const formVenueRef = useRef<HTMLInputElement>(null);
  const formContactRef = useRef<HTMLInputElement>(null);
  const formStatusRef = useRef<HTMLSelectElement>(null);
  const formNotesRef = useRef<HTMLTextAreaElement>(null);

  const fetchEvents = useCallback(() => {
    setLoading(true);
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setEvents(data.events.map((e: EventRecord, i: number) => ({ ...e, sNo: i + 1 })));
        }
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setEvents(data.events.map((e: EventRecord, i: number) => ({ ...e, sNo: i + 1 })));
        }
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  const handleCreate = useCallback(() => {
    const name = formNameRef.current?.value?.trim() || "";
    const type = formTypeRef.current?.value || "Birthday";
    const startDate = formStartDateRef.current?.value || "";
    const endDate = formEndDateRef.current?.value || "";
    const time = formTimeRef.current?.value || "";
    const guests = formGuestsRef.current?.value || "0";
    const venue = formVenueRef.current?.value || "";
    const contact = formContactRef.current?.value || "";
    const status = formStatusRef.current?.value || "Scheduled";
    const notes = formNotesRef.current?.value || "";

    if (!name || !startDate || !endDate) {
      alert("Please fill in Event Name, Start Date, and End Date.");
      return;
    }

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName: name, type, startDate, endDate, time, guests: Number(guests), venue, contact, status, notes }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setShowCreateModal(false);
          fetchEvents();
        } else {
          alert(data.error || "Failed to create event");
        }
      })
      .catch(() => alert("Failed to create event"));
  }, [fetchEvents]);

  const handleEdit = useCallback(() => {
    if (!editEvent) return;
    const name = formNameRef.current?.value?.trim() || "";
    const type = formTypeRef.current?.value || "Birthday";
    const startDate = formStartDateRef.current?.value || "";
    const endDate = formEndDateRef.current?.value || "";
    const time = formTimeRef.current?.value || "";
    const guests = formGuestsRef.current?.value || "0";
    const venue = formVenueRef.current?.value || "";
    const contact = formContactRef.current?.value || "";
    const status = formStatusRef.current?.value || "Scheduled";
    const notes = formNotesRef.current?.value || "";

    if (!name || !startDate || !endDate) {
      alert("Please fill in Event Name, Start Date, and End Date.");
      return;
    }

    fetch("/api/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editEvent.id, eventName: name, type, startDate, endDate, time, guests: Number(guests), venue, contact, status, notes }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setShowCreateModal(false);
          setEditEvent(null);
          fetchEvents();
        } else {
          alert(data.error || "Failed to update event");
        }
      })
      .catch(() => alert("Failed to update event"));
  }, [editEvent, fetchEvents]);

  const handleDelete = useCallback((id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    fetch(`/api/events?id=${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) fetchEvents();
      })
      .catch(() => {});
  }, [fetchEvents]);

  const openEditModal = useCallback((event: EventRecord) => {
    setEditEvent(event);
    setShowCreateModal(true);
  }, []);

  const openViewModal = useCallback((event: EventRecord) => {
    setViewEvent(event);
    setShowViewModal(true);
  }, []);

  useEffect(() => {
    if (showCreateModal && editEvent && formNameRef.current) {
      formNameRef.current.value = editEvent.eventName;
      if (formTypeRef.current) formTypeRef.current.value = editEvent.type;
      if (formStartDateRef.current) {
        const parts = editEvent.startDate.split("/");
        formStartDateRef.current.value = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      if (formEndDateRef.current) {
        const parts = editEvent.endDate.split("/");
        formEndDateRef.current.value = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      if (formTimeRef.current) formTimeRef.current.value = editEvent.time || "";
      if (formGuestsRef.current) formGuestsRef.current.value = String(editEvent.guests);
      if (formVenueRef.current) formVenueRef.current.value = editEvent.venue || "";
      if (formContactRef.current) formContactRef.current.value = editEvent.contact || "";
      if (formStatusRef.current) formStatusRef.current.value = editEvent.status;
      if (formNotesRef.current) formNotesRef.current.value = editEvent.notes || "";
    } else if (showCreateModal && !editEvent) {
      if (formNameRef.current) formNameRef.current.value = "";
      if (formTypeRef.current) formTypeRef.current.value = "Birthday";
      if (formStartDateRef.current) formStartDateRef.current.value = "";
      if (formEndDateRef.current) formEndDateRef.current.value = "";
      if (formTimeRef.current) formTimeRef.current.value = "";
      if (formGuestsRef.current) formGuestsRef.current.value = "";
      if (formVenueRef.current) formVenueRef.current.value = "";
      if (formContactRef.current) formContactRef.current.value = "";
      if (formStatusRef.current) formStatusRef.current.value = "Scheduled";
      if (formNotesRef.current) formNotesRef.current.value = "";
    }
  }, [showCreateModal, editEvent]);

  const eventTypes = ["Birthday", "Corporate", "Catering", "Outdoor", "Festival", "Promotional"];
  const statuses = ["Scheduled", "Confirmed", "Pending", "In Progress", "Completed", "Cancelled"];

  const thisMonth = events.filter((e) => {
    const [, mm, yy] = e.startDate.split("/").map(Number);
    const now = new Date();
    return mm === now.getMonth() + 1 && yy === now.getFullYear();
  }).length;

  const thisWeek = events.filter((e) => {
    const now = new Date();
    const [, mm, yy] = e.startDate.split("/").map(Number);
    const eventDate = new Date(yy, mm - 1, 1);
    const diff = Math.abs(eventDate.getTime() - now.getTime());
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const pending = events.filter((e) => e.status === "Pending").length;
  const confirmed = events.filter((e) => e.status === "Confirmed").length;
  const totalGuests = events.reduce((sum, e) => sum + e.guests, 0);

  const filteredData = useMemo(() => {
    let data = [...events];
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
  }, [eventType, statusFilter, searchQuery, events]);

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

  const calendarCells = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="bg-white min-h-[80px]" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${String(d).padStart(2, "0")}/${String(calendarMonth + 1).padStart(2, "0")}/${calendarYear}`;
      const dayEvents = events.filter((e) => {
        const sd = e.startDate;
        const ed = e.endDate;
        return dateStr >= sd && dateStr <= ed;
      });
      const isToday = new Date().getDate() === d && new Date().getMonth() === calendarMonth && new Date().getFullYear() === calendarYear;
      cells.push(
        <div key={d} className="bg-white min-h-[80px] p-1.5 relative">
          <span className={`text-xs font-medium ${isToday ? "bg-[#3d9a7e] text-white w-5 h-5 rounded-full flex items-center justify-center" : "text-gray-700"}`}>
            {d}
          </span>
          <div className="mt-1 flex flex-col gap-0.5">
            {dayEvents.slice(0, 3).map((ev) => {
              const color = ev.status === "Confirmed" ? "bg-green-500" : ev.status === "Pending" ? "bg-yellow-500" : ev.status === "Cancelled" ? "bg-red-500" : ev.status === "Completed" ? "bg-emerald-500" : ev.status === "In Progress" ? "bg-purple-500" : "bg-blue-500";
              return (
                <div
                  key={ev.id}
                  className={`${color} text-white text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80`}
                  title={`${ev.eventName} (${ev.time})`}
                  onClick={() => openViewModal(ev)}
                >
                  {ev.eventName}
                </div>
              );
            })}
            {dayEvents.length > 3 && (
              <span className="text-[10px] text-gray-500 text-center">+{dayEvents.length - 3} more</span>
            )}
          </div>
        </div>
      );
    }
    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
      cells.push(<div key={`empty-end-${i}`} className="bg-white min-h-[80px]" />);
    }
    return cells;
  }, [calendarMonth, calendarYear, events, openViewModal]);

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
      <div className="flex flex-wrap items-center justify-between gap-2">
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
          onClick={() => { setEditEvent(null); setShowCreateModal(true); }}
          className="flex items-center gap-1.5 px-5 py-2 bg-[#4caf85] text-white rounded-lg text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
        >
          <Plus size={16} /> New Event
        </button>
      </div>

      {/* List View */}
      {viewMode === "list" && (
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
            <div className="flex flex-wrap items-center gap-3">
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
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-[#3d9a7e] text-white">
                  <th className="px-3 py-3 text-center text-xs font-semibold w-[60px]">S.NO</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">EVENT NAME</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">TYPE</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">START DATE</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">END DATE</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">TIME</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">VENUE</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">GUESTS</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">STATUS</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">CONTACT</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">Loading events...</td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">No events found for the selected filters.</td>
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
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(row.status)}`}>{row.status}</span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.contact}</td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openViewModal(row)} className="p-1 text-blue-500 hover:text-blue-700 rounded hover:bg-blue-50" title="View"><Eye size={15} /></button>
                          <button onClick={() => openEditModal(row)} className="p-1 text-amber-500 hover:text-amber-700 rounded hover:bg-amber-50" title="Edit"><Pencil size={15} /></button>
                          <button onClick={() => handleDelete(row.id)} className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-gray-600">
              Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + entriesPerPage, filteredData.length)} of {filteredData.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 border rounded text-sm ${currentPage === page ? "bg-[#3d9a7e] text-white border-[#3d9a7e]" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); } else { setCalendarMonth(calendarMonth - 1); } }} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100">◀</button>
              <span className="text-sm font-semibold text-gray-800 min-w-[140px] text-center">
                {new Date(calendarYear, calendarMonth).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </span>
              <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); } else { setCalendarMonth(calendarMonth + 1); } }} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100">▶</button>
            </div>
            <button onClick={() => { setCalendarMonth(new Date().getMonth()); setCalendarYear(new Date().getFullYear()); }} className="px-3 py-1 text-sm text-[#3d9a7e] hover:underline">Today</button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="bg-gray-50 px-2 py-2 text-center text-xs font-semibold text-gray-600">{day}</div>
              ))}
              {calendarCells}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-gray-600">{events.length} events total</span>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Scheduled</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Confirmed</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> Pending</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> In Progress</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Completed</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Cancelled</span>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">{editEvent ? "Edit Event" : "Create New Event"}</h3>
              <button onClick={() => { setShowCreateModal(false); setEditEvent(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Event Name *</label>
                  <input ref={formNameRef} type="text" placeholder="Enter event name" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Event Type *</label>
                  <select ref={formTypeRef} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">--Select--</option>
                    {eventTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date *</label>
                  <input ref={formStartDateRef} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">End Date *</label>
                  <input ref={formEndDateRef} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Time</label>
                  <input ref={formTimeRef} type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Guests</label>
                  <input ref={formGuestsRef} type="number" placeholder="Number of guests" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Venue</label>
                <input ref={formVenueRef} type="text" placeholder="Enter venue" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Number</label>
                  <input ref={formContactRef} type="tel" placeholder="Phone number" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <select ref={formStatusRef} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {statuses.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
                <textarea ref={formNotesRef} rows={3} placeholder="Event notes..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={() => { setShowCreateModal(false); setEditEvent(null); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={editEvent ? handleEdit : handleCreate} className="px-4 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors">
                {editEvent ? "Update Event" : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {showViewModal && viewEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Event Details</h3>
              <button onClick={() => { setShowViewModal(false); setViewEvent(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Event Name:</span><span className="font-medium text-gray-800">{viewEvent.eventName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type:</span><span className="text-gray-800">{viewEvent.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Start Date:</span><span className="text-gray-800">{viewEvent.startDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">End Date:</span><span className="text-gray-800">{viewEvent.endDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time:</span><span className="text-gray-800">{viewEvent.time}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Venue:</span><span className="text-gray-800">{viewEvent.venue || "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Guests:</span><span className="text-gray-800">{viewEvent.guests}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(viewEvent.status)}`}>{viewEvent.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Contact:</span><span className="text-gray-800">{viewEvent.contact || "-"}</span></div>
              {viewEvent.notes && <div className="flex justify-between"><span className="text-gray-500">Notes:</span><span className="text-gray-800">{viewEvent.notes}</span></div>}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
              <button onClick={() => { setShowViewModal(false); setViewEvent(null); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
