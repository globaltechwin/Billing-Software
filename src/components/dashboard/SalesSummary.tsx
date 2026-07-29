"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronUp, Settings, X } from "lucide-react";

const data = [
  { date: "21/07/2026", amount: 300 },
  { date: "27/07/2026", amount: 0 },
];

export default function SalesSummary() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-800">Sales Summary</h3>
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
            <ChevronUp size={16} className="text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
            <Settings size={16} className="text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-5 min-h-[280px]">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              domain={[0, 300]}
              ticks={[0, 50, 100, 150, 200, 250, 300]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#22c55e"
              fill="#dcfce7"
              strokeWidth={2}
              dot={{ r: 3, fill: "#22c55e" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
