"use client";

import { ChevronDown, Calendar } from "lucide-react";

export default function DashboardDetails() {
  return (
    <div className="mt-5">
      <h2 className="text-lg font-bold text-gray-800 mb-3">
        Dashboard Details
      </h2>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Period dropdown */}
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer">
            <option>Last 14 days</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* From date */}
        <div className="relative">
          <input
            type="text"
            defaultValue="13/07/2026"
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-[150px]"
          />
          <Calendar
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* To date */}
        <div className="relative">
          <input
            type="text"
            defaultValue="27/07/2026"
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-[150px]"
          />
          <Calendar
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Show Report button */}
        <button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all shadow-sm">
          Show Report
        </button>
      </div>
    </div>
  );
}
