"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronUp, Settings, X } from "lucide-react";

const data = [
  { date: "21/07/2026", amount: 1.9 },
  { date: "27/07/2026", amount: 1.0 },
];

export default function BillSummary() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-800">Bill Summary</h3>
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
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
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
              domain={[0, 2]}
              ticks={[1, 1.2, 1.4, 1.6, 1.8, 2]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="amount"
              fill="#93b8f7"
              radius={[4, 4, 0, 0]}
              barSize={80}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
