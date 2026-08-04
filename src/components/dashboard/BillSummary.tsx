"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartPanel from "./ChartPanel";

interface BillSummaryProps {
  data: { date: string; count: number; amount: number }[];
  loading: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  chartType: string;
  onChartTypeChange: (type: string) => void;
}

const CHART_OPTIONS = [
  { label: "Bar", value: "bar" },
  { label: "Line", value: "line" },
];

export default function BillSummary({
  data,
  loading,
  collapsed,
  onToggleCollapse,
  onClose,
  chartType,
  onChartTypeChange,
}: BillSummaryProps) {
  return (
    <ChartPanel
      title="Bill Summary"
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      onClose={onClose}
      settingsOptions={CHART_OPTIONS}
      activeSettings={chartType}
      onSettingsChange={onChartTypeChange}
    >
      <div className="p-5 min-h-[280px]">
        {loading ? (
          <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            {chartType === "line" ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#6366f1" }}
                />
              </LineChart>
            ) : (
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
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]}
                />
                <Bar
                  dataKey="amount"
                  fill="#93b8f7"
                  radius={[4, 4, 0, 0]}
                  barSize={50}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </ChartPanel>
  );
}
