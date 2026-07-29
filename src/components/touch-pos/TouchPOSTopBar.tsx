"use client";

import { Search, Maximize2 } from "lucide-react";

interface TouchPOSTopBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onFullscreen: () => void;
  splitEnabled: boolean;
  onSplitToggle: (val: boolean) => void;
  onTableView: () => void;
}

export default function TouchPOSTopBar({
  searchQuery,
  onSearchChange,
  onFullscreen,
  splitEnabled,
  onSplitToggle,
  onTableView,
}: TouchPOSTopBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Enter Product"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Full Screen */}
      <button
        onClick={onFullscreen}
        className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Maximize2 size={14} />
        Full Screen
      </button>

      {/* Split Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSplitToggle(!splitEnabled)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            splitEnabled ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              splitEnabled ? "translate-x-5" : ""
            }`}
          />
        </button>
        <span className="text-sm text-gray-600">Split</span>
      </div>

      {/* Table View F6 */}
      <button
        onClick={onTableView}
        className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-purple-400 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm"
      >
        Table View
        <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded">
          F6
        </span>
      </button>

      {/* Split Bill */}
      <button className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
        Split Bill
      </button>

      {/* Laundry Service */}
      <select className="border border-gray-200 text-sm text-gray-600 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option>Laundry Service</option>
        <option>Dry Cleaning</option>
        <option>Ironing</option>
      </select>
    </div>
  );
}