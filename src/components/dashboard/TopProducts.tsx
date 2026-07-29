"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronUp, Settings, X } from "lucide-react";

const PRODUCTS = [
  { name: "TEST0002", count: 1, color: "#3b82f6" },
  { name: "Shirts", count: 1, color: "#8b5cf6" },
  { name: "Product", count: 1, color: "#ef4444" },
  { name: "Pant", count: 1, color: "#22c55e" },
];

export default function TopProducts() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-800">Top 5 Products</h3>
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

      {/* Content */}
      <div className="flex flex-col md:flex-row p-5 gap-5">
        {/* Donut chart */}
        <div className="flex flex-col items-center min-w-[140px]">
          <span className="text-xs font-semibold text-gray-500 mb-2">Top 5</span>
          <div className="w-[120px] h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PRODUCTS}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={52}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {PRODUCTS.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product list */}
        <div className="flex-1">
          <div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-0.5 text-sm mb-3">
            <span className="font-semibold text-gray-700">Products</span>
            <span className="font-semibold text-gray-700 text-right">Sale Count</span>
          </div>
          <div className="space-y-2.5">
            {PRODUCTS.map((product) => (
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
      </div>
    </div>
  );
}
