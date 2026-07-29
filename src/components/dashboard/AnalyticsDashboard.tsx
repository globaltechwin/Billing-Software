import { Users, Package, Receipt, CalendarDays, DollarSign, TrendingUp } from "lucide-react";
import StatCard from "./StatCard";
import DashboardDetails from "./DashboardDetails";
import BillSummary from "./BillSummary";
import TopProducts from "./TopProducts";
import SalesSummary from "./SalesSummary";
import PaymentsExpenses from "./PaymentsExpenses";

const STAT_CARDS = [
  {
    icon: Users,
    value: 2110,
    label: "Total Customer",
    borderColor: "#6366f1",
    iconBg: "#eef2ff",
    iconColor: "#6366f1",
    badge: "#" as const,
    badgeColor: "#6366f1",
  },
  {
    icon: Package,
    value: 7,
    label: "Total Products",
    borderColor: "#8b5cf6",
    iconBg: "#f5f3ff",
    iconColor: "#8b5cf6",
    badge: "#" as const,
    badgeColor: "#8b5cf6",
  },
  {
    icon: Receipt,
    value: 11,
    label: "Total Sales",
    borderColor: "#ef4444",
    iconBg: "#fef2f2",
    iconColor: "#ef4444",
    badge: "#" as const,
    badgeColor: "#ef4444",
  },
  {
    icon: CalendarDays,
    value: 11,
    label: "This Week Sales",
    borderColor: "#f97316",
    iconBg: "#fff7ed",
    iconColor: "#f97316",
    badge: "#" as const,
    badgeColor: "#f97316",
  },
  {
    icon: DollarSign,
    value: 300,
    label: "Last Week Sales",
    borderColor: "#3b82f6",
    iconBg: "#eff6ff",
    iconColor: "#3b82f6",
    badge: "$" as const,
    badgeColor: "#3b82f6",
  },
  {
    icon: TrendingUp,
    value: 311,
    label: "This Month Sales",
    borderColor: "#22c55e",
    iconBg: "#f0fdf4",
    iconColor: "#22c55e",
    badge: "$" as const,
    badgeColor: "#22c55e",
  },
];

export default function AnalyticsDashboard() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)]">
      <div className="p-4 sm:p-5 flex-1">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAT_CARDS.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Dashboard Details */}
        <DashboardDetails />

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
          <BillSummary />
          <TopProducts />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <SalesSummary />
          <PaymentsExpenses />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-between text-xs text-gray-500">
        <span>&copy; 2025 - POS - V5.06.Nov</span>
        <span className="font-medium text-gray-600">
          LICENSE DATE 01/01/2030
        </span>
      </footer>
    </div>
  );
}
