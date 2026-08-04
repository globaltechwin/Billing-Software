"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  BarChart,
  Star,
  ChevronRight,
  Search,
} from "lucide-react";

type ReportCategory = "Sales" | "Stock" | "Financial" | "Employee" | "Analytics";

interface ReportDef {
  id: string;
  name: string;
  route: string;
  categories: ReportCategory[];
}

const reports: ReportDef[] = [
  { id: "employee-bill", name: "Employee Bill Report", route: "/reports/employee-bill", categories: ["Sales"] },
  { id: "sales", name: "Sales Report", route: "/reports/sales", categories: ["Sales"] },
  { id: "cashier", name: "Cashier Report", route: "/reports/cashier", categories: ["Sales"] },
  { id: "items-wise-sales", name: "Items Wise Sales", route: "/reports/items-wise-sales", categories: ["Sales", "Analytics"] },
  { id: "login-history", name: "Login History", route: "/reports/login-history", categories: ["Sales"] },
  { id: "cancelled-bills", name: "Cancelled Bills", route: "/reports/cancelled-bills", categories: ["Sales"] },
  { id: "compliment-bill", name: "Compliment Bill Report", route: "/reports/compliment-bill", categories: ["Sales", "Employee"] },
  { id: "bill-coupon", name: "Bill Coupon Report", route: "/reports/bill-coupon", categories: ["Sales"] },
  { id: "stock", name: "Stock Report", route: "/reports/stock", categories: ["Stock"] },
  { id: "day-wise-stock", name: "Day Wise Stock Report", route: "/reports/day-wise-stock", categories: ["Stock"] },
  { id: "purchases", name: "Purchases Report", route: "/reports/purchases", categories: ["Stock"] },
  { id: "stock-audit", name: "Stock Audit Report", route: "/reports/stock-audit", categories: ["Stock"] },
  { id: "vendor-payments", name: "Vendor Payments", route: "/reports/vendor-payments", categories: ["Financial"] },
  { id: "expense", name: "Expense Report", route: "/reports/expense", categories: ["Financial"] },
  { id: "tally-xml", name: "Tally XML", route: "/reports/tally-xml", categories: ["Financial"] },
  { id: "gst-filing", name: "GST Filing", route: "/reports/gst-filing", categories: ["Financial"] },
  { id: "profit-and-loss", name: "Profit and Loss", route: "/reports/profit-and-loss", categories: ["Financial"] },
  { id: "mis", name: "MIS Report", route: "/reports/mis", categories: ["Financial"] },
  { id: "profit-retail", name: "ProfitReportRetail", route: "/reports/profit-retail", categories: ["Financial"] },
  { id: "wallet-top-up", name: "Wallet Top Up Report", route: "/reports/wallet-top-up", categories: ["Financial"] },
  { id: "cancelled-kot", name: "Cancelled KOT Report", route: "/reports/cancelled-kot", categories: ["Employee"] },
];

type FilterType = "all" | ReportCategory;

const categories: { key: FilterType; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }[] = [
  { key: "all", label: "All Reports", icon: BarChart3, color: "text-blue-600", bgColor: "bg-blue-100" },
  { key: "Sales", label: "Sales", icon: TrendingUp, color: "text-teal-600", bgColor: "bg-teal-100" },
  { key: "Stock", label: "Stock", icon: Package, color: "text-green-600", bgColor: "bg-green-100" },
  { key: "Financial", label: "Financial", icon: DollarSign, color: "text-orange-500", bgColor: "bg-orange-100" },
  { key: "Employee", label: "Employee", icon: Users, color: "text-purple-600", bgColor: "bg-purple-100" },
  { key: "Analytics", label: "Analytics", icon: BarChart, color: "text-blue-500", bgColor: "bg-blue-50" },
];

const categoryColors: Record<ReportCategory, { text: string; bg: string }> = {
  Sales: { text: "text-teal-700", bg: "bg-teal-50" },
  Stock: { text: "text-green-700", bg: "bg-green-50" },
  Financial: { text: "text-orange-600", bg: "bg-orange-50" },
  Employee: { text: "text-purple-700", bg: "bg-purple-50" },
  Analytics: { text: "text-blue-600", bg: "bg-blue-50" },
};

export default function AllReportsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = reports.filter((report) => {
    const matchesFilter =
      activeFilter === "all" || report.categories.includes(activeFilter);
    const matchesSearch = report.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryCount = (cat: FilterType) => {
    if (cat === "all") return reports.length;
    return reports.filter((r) => r.categories.includes(cat)).length;
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-700" />
            <h1 className="text-lg font-semibold text-gray-800">Reports Center</h1>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col xl:flex-row min-h-[500px]">
          {/* Left sidebar - Categories */}
          <div className="w-full xl:w-[240px] border-r border-gray-200 flex-shrink-0">
            <div className="py-2">
              {categories.map((cat) => {
                const CatIcon = cat.icon;
                const isActive = activeFilter === cat.key;
                const count = getCategoryCount(cat.key);
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveFilter(cat.key)}
                    className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                      isActive
                        ? "bg-blue-50 border-r-2 border-blue-600 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.bgColor}`}>
                      <CatIcon className={`w-4 h-4 ${cat.color}`} />
                    </div>
                    <span className="text-sm font-medium flex-1">{cat.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right content - Report list */}
          <div className="flex-1">
            {/* Section header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <span className="text-base font-semibold text-gray-800">
                {activeFilter === "all" ? "All Reports" : activeFilter}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                {filteredReports.length}
              </span>
            </div>

            {/* Report list */}
            <div className="divide-y divide-gray-100">
              {filteredReports.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-500">
                  No reports found matching your search.
                </div>
              ) : (
                filteredReports.map((report) => {
                  const primaryCategory = report.categories[0];
                  const catColor = categoryColors[primaryCategory];
                  return (
                    <Link
                      key={report.id}
                      href={report.route}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                    >
                      <button className="text-gray-300 hover:text-amber-400 transition-colors">
                        <Star className="w-4 h-4" />
                      </button>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${catColor.bg}`}>
                        <BarChart3 className={`w-4 h-4 ${catColor.text}`} />
                      </div>
                      <span className="text-sm text-gray-700 font-medium flex-1">
                        {report.name}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${catColor.bg} ${catColor.text}`}>
                        {primaryCategory}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
