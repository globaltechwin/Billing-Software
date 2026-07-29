"use client";

import { Search } from "lucide-react";

const STATUS_FILTERS = [
  { label: "Running", count: 4, color: "text-orange-600 border-orange-300 bg-orange-50" },
  { label: "Available", count: null, color: "text-gray-500 border-gray-300 bg-gray-50" },
  { label: "To settle", count: 3, color: "text-orange-600 border-orange-300 bg-orange-50" },
] as const;

const ACTION_BUTTONS = [
  { label: "Order taken", color: "bg-red-500 hover:bg-red-600" },
  { label: "To be settle", color: "bg-orange-500 hover:bg-orange-600" },
  { label: "Delivery Start", color: "bg-green-500 hover:bg-green-600" },
] as const;

export default function BillingFilters() {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      {/* Left side - Search + Status filters */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Search size={18} className="text-gray-400" />
        </button>
        {STATUS_FILTERS.map(({ label, count, color }) => (
          <button
            key={label}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${color}`}
          >
            {label} {count !== null ? count : "–"}
          </button>
        ))}
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-2">
        {ACTION_BUTTONS.map(({ label, color }) => (
          <button
            key={label}
            className={`text-xs font-semibold text-white px-3 py-1.5 rounded-md transition-colors ${color}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
