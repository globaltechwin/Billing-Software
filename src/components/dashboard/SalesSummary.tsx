"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartPanel from "./ChartPanel";

interface SalesSummaryProps {
  data: { date: string; amount: number }[];
  loading: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  chartType: string;
  onChartTypeChange: (type: string) => void;
}

const CHART_OPTIONS = [
  { label: "Area", value: "area" },
  { label: "Bar", value: "bar" },
  { label: "Line", value: "line" },
];

export default function SalesSummary({
  data,
  loading,
  collapsed,
  onToggleCollapse,
  onClose,
  chartType,
  onChartTypeChange,
}: SalesSummaryProps) {
  const maxVal = data.length > 0 ? Math.max(...data.map((d) => d.amount)) : 0;
  const yMax = Math.max(100, Math.ceil(maxVal / 50) * 50);

  const commonAxis = (
    <>
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
        domain={[0, yMax]}
      />
      <Tooltip
        contentStyle={{
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          fontSize: "12px",
        }}
        formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Sales"]}
      />
    </>
  );

  return (
    <ChartPanel
      title="Sales Summary"
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
            {chartType === "bar" ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                {commonAxis}
                <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            ) : chartType === "line" ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                {commonAxis}
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#22c55e"
                  fill="none"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#22c55e" }}
                />
              </AreaChart>
            ) : (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                {commonAxis}
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#22c55e"
                  fill="#dcfce7"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#22c55e" }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </ChartPanel>
  );
}
