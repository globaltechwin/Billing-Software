"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  ShoppingCart,
  BarChart3,
  ShoppingBag,
  Truck,
  RefreshCw,
  Loader2,
  Users,
  XCircle,
  DollarSign,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { DashboardData } from "./data";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "purchase", label: "Purchase", icon: ShoppingBag },
  { id: "stock-movement", label: "Stock Movement", icon: Truck },
] as const;

const CARD_ICONS = [Package, Users, ClipboardList, ShoppingCart, TrendingUp, TrendingDown, AlertTriangle, XCircle, DollarSign];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  DRAFT: "bg-gray-100 text-gray-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  PARTIAL: "bg-orange-100 text-orange-700",
  PARTIALLY_RECEIVED: "bg-orange-100 text-orange-700",
  REJECTED: "bg-red-100 text-red-700",
  PRODUCTION: "bg-purple-100 text-purple-700",
  DAMAGE: "bg-red-100 text-red-700",
  ADJUSTMENT: "bg-amber-100 text-amber-700",
  BRANCH_TRANSFER: "bg-blue-100 text-blue-700",
  OTHER: "bg-gray-100 text-gray-700",
};

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const formatCurrency = (val: number) =>
  val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function InventoryDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory-dashboard");
      const data = await res.json();
      if (data.success && data.dashboard) {
        setDashboard(data.dashboard);
        setError("");
      } else {
        setError(data.error || "Failed to load dashboard");
      }
    } catch (err) {
      setError("Failed to load dashboard: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !dashboard) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-3">{error}</p>
          <button onClick={fetchDashboard} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const summaryCards = [
    { label: "TOTAL PRODUCTS", value: dashboard.summaryCards.totalProducts, borderColor: "#3b82f6", iconBg: "#eff6ff", iconColor: "#3b82f6" },
    { label: "TOTAL VENDORS", value: dashboard.summaryCards.totalVendors, borderColor: "#8b5cf6", iconBg: "#f5f3ff", iconColor: "#8b5cf6" },
    { label: "PENDING INDENTS", value: dashboard.summaryCards.pendingIndents, borderColor: "#f59e0b", iconBg: "#fffbeb", iconColor: "#f59e0b" },
    { label: "PENDING PO", value: dashboard.summaryCards.pendingPOs, borderColor: "#22c55e", iconBg: "#f0fdf4", iconColor: "#22c55e" },
    { label: "TODAY STOCK IN", value: dashboard.summaryCards.todayStockIn, borderColor: "#3b82f6", iconBg: "#eff6ff", iconColor: "#3b82f6" },
    { label: "TODAY STOCK OUT", value: dashboard.summaryCards.todayStockOut, borderColor: "#a855f7", iconBg: "#faf5ff", iconColor: "#a855f7" },
    { label: "LOW STOCK ITEMS", value: dashboard.summaryCards.lowStockCount, borderColor: "#f59e0b", iconBg: "#fffbeb", iconColor: "#f59e0b" },
    { label: "OUT OF STOCK", value: dashboard.summaryCards.outOfStockCount, borderColor: "#ef4444", iconBg: "#fef2f2", iconColor: "#ef4444" },
    { label: "INVENTORY VALUE", value: formatCurrency(dashboard.summaryCards.totalInventoryValue), borderColor: "#06b6d4", iconBg: "#ecfeff", iconColor: "#06b6d4" },
  ];

  return (
    <div className="p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-4">
        {summaryCards.map((card, index) => {
          const Icon = CARD_ICONS[index] || Package;
          return (
            <div key={card.label} className="bg-white rounded-xl p-3 border-l-4 shadow-sm flex flex-col justify-between min-h-[90px]" style={{ borderLeftColor: card.borderColor }}>
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.iconBg }}>
                  <Icon size={16} style={{ color: card.iconColor }} />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-lg font-bold" style={{ color: card.borderColor }}>
                  {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                </p>
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Bar + Refresh */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-white shadow-sm border border-gray-200 text-gray-800" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"}`}>
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
        <button onClick={fetchDashboard} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 shadow-sm disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Left Column */}
          <div className="xl:flex-[2] flex flex-col gap-4">
            {/* Low Stock Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-base font-bold text-gray-800">Low Stock Alerts</h2>
                <span className="text-xs text-gray-500">Products below reorder level</span>
              </div>
              <div className="border-t border-gray-100 my-3"></div>
              {dashboard.lowStockProducts.length === 0 ? (
                <div className="bg-emerald-500 text-white text-sm font-medium px-4 py-3 rounded-lg">
                  All products are above reorder level.
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {dashboard.lowStockProducts.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="text-sm text-gray-700">{item.productName}</span>
                      <span className="text-sm text-amber-600 font-medium">
                        {Number(item.currentStock).toFixed(1)} {item.unit} left (Min: {Number(item.reorderLevel).toFixed(1)})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Out of Stock */}
            {dashboard.outOfStockProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-base font-bold text-gray-800">Out of Stock Products</h2>
                  <span className="text-xs text-gray-500">Products with zero stock</span>
                </div>
                <div className="border-t border-gray-100 my-3"></div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {dashboard.outOfStockProducts.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-sm text-gray-700">{item.productName}</span>
                      <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Stock In */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-3">Recent Stock In</h2>
              {dashboard.recentStockIns.length === 0 ? (
                <p className="text-sm text-gray-400">No recent stock in transactions.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-xs font-semibold text-gray-500">GRN No.</th>
                        <th className="text-left py-2 text-xs font-semibold text-gray-500">Vendor</th>
                        <th className="text-left py-2 text-xs font-semibold text-gray-500">Date</th>
                        <th className="text-left py-2 text-xs font-semibold text-gray-500">Qty</th>
                        <th className="text-left py-2 text-xs font-semibold text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentStockIns.map((item) => (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 font-medium text-gray-700">{item.grnNumber}</td>
                          <td className="py-2 text-gray-600">{item.vendorName}</td>
                          <td className="py-2 text-gray-600">{formatDate(item.date)}</td>
                          <td className="py-2 text-gray-600">{item.totalQty}</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-700"}`}>
                              {formatStatus(item.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Stock Out */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-3">Recent Stock Out</h2>
              {dashboard.recentStockOuts.length === 0 ? (
                <p className="text-sm text-gray-400">No recent stock out transactions.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-xs font-semibold text-gray-500">SO No.</th>
                        <th className="text-left py-2 text-xs font-semibold text-gray-500">Type</th>
                        <th className="text-left py-2 text-xs font-semibold text-gray-500">Date</th>
                        <th className="text-left py-2 text-xs font-semibold text-gray-500">Qty</th>
                        <th className="text-left py-2 text-xs font-semibold text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentStockOuts.map((item) => (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 font-medium text-gray-700">{item.stockOutNumber}</td>
                          <td className="py-2 text-gray-600">{formatStatus(item.type)}</td>
                          <td className="py-2 text-gray-600">{formatDate(item.date)}</td>
                          <td className="py-2 text-gray-600">{item.totalQty}</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-700"}`}>
                              {formatStatus(item.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="xl:flex-[1] flex flex-col gap-4">
            {/* Indent Status Pie */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-4">Indent Status</h2>
              <div className="h-[220px]">
                {dashboard.indentStatus.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center mt-8">No indent data.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dashboard.indentStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                        {dashboard.indentStatus.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} formatter={(value: string) => (
                        <span className="text-xs text-gray-600">{value}</span>
                      )} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent Purchase Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-3">Recent Purchase Orders</h2>
              {dashboard.recentPOs.length === 0 ? (
                <p className="text-sm text-gray-400">No recent purchase orders.</p>
              ) : (
                <div className="space-y-2">
                  {dashboard.recentPOs.map((po) => (
                    <div key={po.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{po.poNumber}</p>
                        <p className="text-xs text-gray-400">{po.vendorName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[po.status] || "bg-gray-100 text-gray-700"}`}>
                        {formatStatus(po.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Indent Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-3">Recent Indent Requests</h2>
              {dashboard.recentIndents.length === 0 ? (
                <p className="text-sm text-gray-400">No recent indent requests.</p>
              ) : (
                <div className="space-y-2">
                  {dashboard.recentIndents.map((ind) => (
                    <div key={ind.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{ind.indentNumber}</p>
                        <p className="text-xs text-gray-400">{ind.department} | Qty: {ind.totalQty}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ind.status] || "bg-gray-100 text-gray-700"}`}>
                        {formatStatus(ind.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Purchase Tab */}
      {activeTab === "purchase" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Purchase Overview</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{dashboard.summaryCards.pendingPOs}</p>
              <p className="text-xs text-gray-500 mt-1">Pending POs</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{dashboard.summaryCards.totalVendors}</p>
              <p className="text-xs text-gray-500 mt-1">Active Vendors</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{dashboard.recentPOs.length}</p>
              <p className="text-xs text-gray-500 mt-1">Recent POs</p>
            </div>
          </div>
          {dashboard.recentPOs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-xs font-semibold text-gray-500">PO Number</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-500">Vendor</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-500">Date</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-500">Amount</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentPOs.map((po) => (
                    <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 font-medium text-gray-700">{po.poNumber}</td>
                      <td className="py-2 text-gray-600">{po.vendorName}</td>
                      <td className="py-2 text-gray-600">{formatDate(po.date)}</td>
                      <td className="py-2 text-gray-600">{formatCurrency(po.grandTotal)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[po.status] || "bg-gray-100 text-gray-700"}`}>
                          {formatStatus(po.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stock Movement Tab */}
      {activeTab === "stock-movement" && (
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="xl:flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-800 mb-4">Today&apos;s Stock In</h2>
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <p className="text-4xl font-bold text-blue-600">{dashboard.summaryCards.todayStockIn}</p>
              <p className="text-sm text-gray-500 mt-2">Units received today</p>
            </div>
          </div>
          <div className="xl:flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-800 mb-4">Today&apos;s Stock Out</h2>
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <p className="text-4xl font-bold text-purple-600">{dashboard.summaryCards.todayStockOut}</p>
              <p className="text-sm text-gray-500 mt-2">Units dispatched today</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
