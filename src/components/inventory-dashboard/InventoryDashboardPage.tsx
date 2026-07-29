"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { inventoryDashboardData } from "./data";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "purchase", label: "Purchase", icon: ShoppingBag },
  { id: "stock-movement", label: "Stock Movement", icon: Truck },
] as const;

const ICONS = [Package, AlertTriangle, TrendingUp, TrendingDown, ClipboardList, ShoppingCart];

export default function InventoryDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <div className="p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4 mb-4">
        {inventoryDashboardData.summaryCards.map((card, index) => {
          const Icon = ICONS[index];
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl p-4 border-l-4 shadow-sm flex flex-col justify-between min-h-[110px]"
              style={{ borderLeftColor: card.borderColor }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: card.iconBg }}
                >
                  <Icon size={18} style={{ color: card.iconColor }} />
                </div>
              </div>
              <div className="mt-3">
                <p
                  className="text-2xl font-bold"
                  style={{ color: card.borderColor }}
                >
                  {typeof card.value === "number"
                    ? card.value.toLocaleString()
                    : card.value}
                </p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 mb-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white shadow-sm border border-gray-200 text-gray-800"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "overview" && (
        <div className="flex gap-4">
          {/* Low Stock Alerts */}
          <div className="flex-[2] bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-base font-bold text-gray-800">Low Stock Alerts</h2>
              <span className="text-xs text-gray-500">Products below reorder level</span>
            </div>
            <div className="border-t border-gray-100 my-3"></div>
            {inventoryDashboardData.lowStockAlerts.length === 0 ? (
              <div className="bg-emerald-500 text-white text-sm font-medium px-4 py-3 rounded-lg">
                All products are above reorder level.
              </div>
            ) : (
              <div className="space-y-2">
                {inventoryDashboardData.lowStockAlerts.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <span className="text-sm text-amber-600 font-medium">
                      {item.stock} left (Min: {item.reorderLevel})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Indent Status */}
          <div className="flex-[1] bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-800 mb-4">Indent Status</h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryDashboardData.indentStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {inventoryDashboardData.indentStatus.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "purchase" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Purchase Overview</h2>
          <p className="text-sm text-gray-500">Purchase data will be displayed here.</p>
        </div>
      )}

      {activeTab === "stock-movement" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Stock Movement</h2>
          <p className="text-sm text-gray-500">Stock movement data will be displayed here.</p>
        </div>
      )}
    </div>
  );
}
