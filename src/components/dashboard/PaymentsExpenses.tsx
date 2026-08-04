"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import ChartPanel from "./ChartPanel";

interface PaymentsExpensesProps {
  data: { payments: number; expenses: number } | null;
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

export default function PaymentsExpenses({
  data,
  loading,
  collapsed,
  onToggleCollapse,
  onClose,
  chartType,
  onChartTypeChange,
}: PaymentsExpensesProps) {
  const chartData = data
    ? [
        { label: "Payments", value: data.payments },
        { label: "Expenses", value: data.expenses },
      ]
    : [];
  const maxVal = data ? Math.max(data.payments, data.expenses, 1) : 1;
  const yMax = Math.ceil(maxVal / 100) * 100 || 100;

  return (
    <ChartPanel
      title="Payments / Expenses"
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
        ) : !data || chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            {chartType === "line" ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="label"
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
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  dot={{ r: 5, fill: "#a78bfa" }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="label"
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
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]}
                />
                <Bar dataKey="value" fill="#a78bfa" barSize={60} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </ChartPanel>
  );
}
