"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Clock,
  ChefHat,
  CheckCircle,
  UtensilsCrossed,
  Loader2,
  ArrowRight,
  Package,
  Timer,
} from "lucide-react";

interface KitchenItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unit: string;
  specialInstructions: string;
  itemStatus: string;
}

interface KitchenOrder {
  id: number;
  kotNumber: string;
  invoiceId: number;
  invoiceNumber: string;
  customerName: string;
  orderType: string;
  orderStatus: string;
  priority: string;
  tableNumber: string;
  tokenNumber: string;
  orderTime: string;
  acceptedTime: string | null;
  preparingTime: string | null;
  readyTime: string | null;
  servedTime: string | null;
  notes: string;
  createdBy: string;
  createdAt: string;
  items: KitchenItem[];
}

interface DashboardSummary {
  pending: number;
  preparing: number;
  ready: number;
  served: number;
  total: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  NEW: { label: "New", color: "text-blue-700", bg: "bg-blue-100", icon: "🆕" },
  ACCEPTED: { label: "Accepted", color: "text-amber-700", bg: "bg-amber-100", icon: "✅" },
  PREPARING: { label: "Preparing", color: "text-orange-700", bg: "bg-orange-100", icon: "👨‍🍳" },
  READY: { label: "Ready", color: "text-green-700", bg: "bg-green-100", icon: "✅" },
  SERVED: { label: "Served", color: "text-gray-600", bg: "bg-gray-100", icon: "🍽️" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  LOW: { label: "Low", color: "text-gray-600", bg: "bg-gray-100" },
  NORMAL: { label: "Normal", color: "text-blue-600", bg: "bg-blue-50" },
  HIGH: { label: "High", color: "text-orange-600", bg: "bg-orange-50" },
  URGENT: { label: "Urgent", color: "text-red-600", bg: "bg-red-50" },
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  DINE_IN: "Dine In",
  TAKE_AWAY: "Take Away",
  DELIVERY: "Delivery",
};

const STATUS_FLOW = ["NEW", "ACCEPTED", "PREPARING", "READY", "SERVED"];

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ${diffMins % 60}m ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({ pending: 0, preparing: 0, ready: 0, served: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
        date: selectedDate,
      });
      if (statusFilter) params.set("orderStatus", statusFilter);
      if (orderTypeFilter) params.set("orderType", orderTypeFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (searchQuery) params.set("search", searchQuery);

      const [ordersRes, summaryRes] = await Promise.all([
        fetch(`/api/kitchen-orders?${params.toString()}`),
        fetch(`/api/kitchen-orders/summary?date=${selectedDate}`),
      ]);

      const ordersData = await ordersRes.json();
      const summaryData = await summaryRes.json();

      if (ordersData.success) {
        setOrders(ordersData.orders);
      } else {
        setError(ordersData.error || "Failed to load orders");
      }

      if (summaryData.success) {
        setSummary(summaryData.summary);
      }
    } catch (err) {
      setError("Failed to load kitchen orders: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [selectedDate, statusFilter, orderTypeFilter, priorityFilter, searchQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = useCallback(async (orderId: number, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/kitchen-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  orderStatus: newStatus,
                  acceptedTime: data.order.acceptedTime || o.acceptedTime,
                  preparingTime: data.order.preparingTime || o.preparingTime,
                  readyTime: data.order.readyTime || o.readyTime,
                  servedTime: data.order.servedTime || o.servedTime,
                  items: data.order.items || o.items,
                }
              : o
          )
        );
        // Refresh summary
        fetchOrders();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }, [fetchOrders]);

  const getNextStatus = (currentStatus: string): string | null => {
    const idx = STATUS_FLOW.indexOf(currentStatus);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  const getPreviousStatus = (currentStatus: string): string | null => {
    const idx = STATUS_FLOW.indexOf(currentStatus);
    if (idx <= 0) return null;
    return STATUS_FLOW[idx - 1];
  };

  const getCardBorderClass = (status: string): string => {
    switch (status) {
      case "NEW": return "border-l-blue-500";
      case "ACCEPTED": return "border-l-amber-500";
      case "PREPARING": return "border-l-orange-500";
      case "READY": return "border-l-green-500";
      case "SERVED": return "border-l-gray-400";
      default: return "border-l-gray-300";
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Dashboard Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{summary.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Preparing</p>
              <p className="text-2xl font-bold text-orange-600">{summary.preparing}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <ChefHat size={20} className="text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Ready</p>
              <p className="text-2xl font-bold text-green-600">{summary.ready}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Today</p>
              <p className="text-2xl font-bold text-gray-800">{summary.total}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Package size={20} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-200 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All</option>
              {STATUS_FLOW.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order Type</label>
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="border border-gray-200 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All</option>
              <option value="DINE_IN">Dine In</option>
              <option value="TAKE_AWAY">Take Away</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-200 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All</option>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search KOT, invoice, customer..."
                className="w-full border border-gray-200 text-sm pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchOrders}
              className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-teal-500" />
          <span className="ml-2 text-sm text-gray-500">Loading kitchen orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <UtensilsCrossed size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No kitchen orders for this date</p>
          <p className="text-xs text-gray-400 mt-1">Orders will appear here when bills with kitchen items are created</p>
        </div>
      ) : (
        /* Order Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => {
            const statusConf = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.NEW;
            const priorityConf = PRIORITY_CONFIG[order.priority] || PRIORITY_CONFIG.NORMAL;
            const nextStatus = getNextStatus(order.orderStatus);
            const prevStatus = getPreviousStatus(order.orderStatus);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${getCardBorderClass(order.orderStatus)} overflow-hidden`}
              >
                {/* Card Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{order.kotNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConf.bg} ${statusConf.color}`}>
                        {statusConf.label}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityConf.bg} ${priorityConf.color}`}>
                      {priorityConf.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>#{order.invoiceNumber}</span>
                    <span>{ORDER_TYPE_LABELS[order.orderType] || order.orderType}</span>
                    {order.tableNumber && <span>Table {order.tableNumber}</span>}
                    {order.tokenNumber && <span>Token {order.tokenNumber}</span>}
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">{order.customerName}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Timer size={12} />
                      <span>{timeAgo(order.orderTime)}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5 mb-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-700">{item.productName}</span>
                          <span className="text-xs text-gray-400">×{item.quantity}</span>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          item.itemStatus === "READY" ? "bg-green-100 text-green-700" :
                          item.itemStatus === "PREPARING" ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {STATUS_CONFIG[item.itemStatus]?.label || item.itemStatus}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-3">
                      <p className="text-xs text-amber-700">{order.notes}</p>
                    </div>
                  )}

                  {/* Time Info */}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-3">
                    <span>Ordered {formatTime(order.orderTime)}</span>
                    {order.acceptedTime && <span>• Accepted {formatTime(order.acceptedTime)}</span>}
                    {order.preparingTime && <span>• Preparing {formatTime(order.preparingTime)}</span>}
                    {order.readyTime && <span>• Ready {formatTime(order.readyTime)}</span>}
                  </div>
                </div>

                {/* Card Footer — Status Actions */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    {prevStatus && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, prevStatus)}
                        disabled={updatingId === order.id}
                        className="flex-1 text-xs font-medium py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        ← {STATUS_CONFIG[prevStatus]?.label}
                      </button>
                    )}
                    {nextStatus && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        disabled={updatingId === order.id}
                        className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {updatingId === order.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <>
                            {STATUS_CONFIG[nextStatus]?.label}
                            <ArrowRight size={12} />
                          </>
                        )}
                      </button>
                    )}
                    {!nextStatus && order.orderStatus === "SERVED" && (
                      <div className="flex-1 text-center text-xs text-gray-500 py-1.5">
                        ✓ Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="text-center text-xs text-gray-400">
        Auto-refreshes every 30 seconds • {orders.length} order{orders.length !== 1 ? "s" : ""} displayed
      </div>
    </div>
  );
}
