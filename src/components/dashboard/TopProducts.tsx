"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import ChartPanel from "./ChartPanel";

interface TopProductsProps {
  data: { name: string; count: number; amount: number; color: string }[];
  loading: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

export default function TopProducts({
  data,
  loading,
  collapsed,
  onToggleCollapse,
  onClose,
}: TopProductsProps) {
  return (
    <ChartPanel
      title="Top 5 Products"
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      onClose={onClose}
    >
      <div className="flex flex-col md:flex-row p-5 gap-5">
        {loading ? (
          <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
            No data available
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center min-w-[140px]">
              <span className="text-xs font-semibold text-gray-500 mb-2">Top 5</span>
              <div className="w-[120px] h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={52}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {data.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-0.5 text-sm mb-3">
                <span className="font-semibold text-gray-700">Products</span>
                <span className="font-semibold text-gray-700 text-right">Sale Count</span>
              </div>
              <div className="space-y-2.5">
                {data.map((product) => (
                  <div
                    key={product.name}
                    className="grid grid-cols-[1fr_auto] gap-x-6 items-center py-1.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: product.color }}
                      />
                      <span className="text-sm text-gray-700">{product.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-right">
                      {product.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ChartPanel>
  );
}
