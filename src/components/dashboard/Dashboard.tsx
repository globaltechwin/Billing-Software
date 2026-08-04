"use client";

import { useState, useEffect, useCallback } from "react";
import { useCompanyBranding } from "@/components/branding/CompanyBrandingProvider";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  MapPin,
  Calendar,
  Shield,
  Package,
  DollarSign,
  BarChart3,
  RotateCcw,
} from "lucide-react";
import FrequentlyUsed from "./FrequentlyUsed";
import DashboardDetails from "./DashboardDetails";
import BillSummary from "./BillSummary";
import TopProducts from "./TopProducts";
import SalesSummary from "./SalesSummary";
import PaymentsExpenses from "./PaymentsExpenses";

interface DashboardData {
  isSuperAdmin: boolean;
  company: {
    companyName: string;
    shortCode: string;
    logo: string | null;
    licenseDate: string | null;
    registeredDate: string;
  };
  branch: string | null;
  branchCount: number;
  user: { name: string; username: string; profileImage: string | null };
  stats: {
    todayBills: number;
    todaySales: number;
    totalCustomers: number;
    totalProducts: number;
    totalSales: number;
    thisWeekSales: number;
    lastWeekSales: number;
    thisMonthSales: number;
    todayExpenses: number;
  };
}

interface ChartData {
  billSummary: { date: string; count: number; amount: number }[];
  topProducts: { name: string; count: number; amount: number; color: string }[];
  salesSummary: { date: string; amount: number }[];
  paymentsExpenses: { payments: number; expenses: number } | null;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getDefaultDateRange() {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const from = new Date(to);
  from.setDate(from.getDate() - 13);
  from.setHours(0, 0, 0, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export default function Dashboard() {
  const { companyName, shortCode, logo } = useCompanyBranding();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>(
    getDefaultDateRange
  );

  const [hiddenPanels, setHiddenPanels] = useState<Set<string>>(new Set());
  const [collapsedPanels, setCollapsedPanels] = useState<Set<string>>(new Set());
  const [chartTypes, setChartTypes] = useState<Record<string, string>>({
    billSummary: "bar",
    salesSummary: "area",
    paymentsExpenses: "bar",
  });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const params = new URLSearchParams();
      params.set("fromDate", dateRange.from);
      params.set("toDate", dateRange.to);
      fetch(`/api/dashboard/chart?${params.toString()}`)
        .then((res) => res.json())
        .then((d) => {
          if (d.success) setChartData(d);
        })
        .catch(() => {});
    }
  }, [dateRange.from, dateRange.to]);

  const handleDateRangeChange = useCallback((from: string, to: string) => {
    setChartData(null);
    setDateRange({ from, to });
  }, []);

  const toggleCollapse = useCallback((key: string) => {
    setCollapsedPanels((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const closePanel = useCallback((key: string) => {
    setHiddenPanels((prev) => new Set(prev).add(key));
  }, []);

  const displayName = data?.user?.name || data?.user?.username || "User";
  const companyNameStr =
    data?.company?.companyName || companyName || shortCode || "Billora";
  const companyLogo = data?.company?.logo || data?.user?.profileImage || logo;
  const sc = data?.company?.shortCode || shortCode || "B";
  const branch = data?.branch;
  const stats = data?.stats;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-billora-primary via-billora-primary-dark to-billora-bg-darker text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 sm:p-8">
          {companyLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={companyLogo}
              alt={companyNameStr}
              className="w-28 h-28 rounded-xl object-contain bg-white p-1.5 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl">
                {sc ? sc.slice(0, 3).toUpperCase() : "B"}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p
              className="text-white/70 text-sm font-medium"
              suppressHydrationWarning
            >
              {loading ? "..." : getGreeting()}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-0.5 truncate">
              {displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <Shield size={14} /> {companyNameStr}
              </span>
              {branch && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {branch}
                </span>
              )}
              <span
                className="flex items-center gap-1"
                suppressHydrationWarning
              >
                <Calendar size={14} />{" "}
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={Users}
          label="Total Customer"
          value={loading ? "-" : String(stats?.totalCustomers ?? 0)}
          badge="#"
          borderColor="#3b82f6"
          iconBg="#eff6ff"
          iconColor="#3b82f6"
          badgeColor="#3b82f6"
        />
        <StatCard
          icon={Package}
          label="Total Products"
          value={loading ? "-" : String(stats?.totalProducts ?? 0)}
          badge="#"
          borderColor="#8b5cf6"
          iconBg="#f5f3ff"
          iconColor="#8b5cf6"
          badgeColor="#8b5cf6"
        />
        <StatCard
          icon={DollarSign}
          label="Total Sales"
          value={loading ? "-" : String(stats?.totalSales ?? 0)}
          badge="$"
          borderColor="#f97316"
          iconBg="#fff7ed"
          iconColor="#f97316"
          badgeColor="#f97316"
        />
        <StatCard
          icon={BarChart3}
          label="This Week Sales"
          value={loading ? "-" : String(stats?.thisWeekSales ?? 0)}
          badge="#"
          borderColor="#ef4444"
          iconBg="#fef2f2"
          iconColor="#ef4444"
          badgeColor="#ef4444"
        />
        <StatCard
          icon={TrendingUp}
          label="Last Week Sales"
          value={loading ? "-" : String(stats?.lastWeekSales ?? 0)}
          badge="$"
          borderColor="#10b981"
          iconBg="#ecfdf5"
          iconColor="#10b981"
          badgeColor="#10b981"
        />
        <StatCard
          icon={ShoppingCart}
          label="This Month Sales"
          value={loading ? "-" : String(stats?.thisMonthSales ?? 0)}
          badge="$"
          borderColor="#06b6d4"
          iconBg="#ecfeff"
          iconColor="#06b6d4"
          badgeColor="#06b6d4"
        />
      </div>

      <DashboardDetails
        fromDate={dateRange.from}
        toDate={dateRange.to}
        onDateRangeChange={handleDateRangeChange}
      />

      {!hiddenPanels.has("billSummary") && !hiddenPanels.has("topProducts") && (
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5${(collapsedPanels.has("billSummary") || collapsedPanels.has("topProducts")) ? " items-start" : ""}`}>
          {!hiddenPanels.has("billSummary") && (
            <BillSummary
              data={chartData?.billSummary || []}
              loading={chartData === null}
              collapsed={collapsedPanels.has("billSummary")}
              onToggleCollapse={() => toggleCollapse("billSummary")}
              onClose={() => closePanel("billSummary")}
              chartType={chartTypes.billSummary || "bar"}
              onChartTypeChange={(v) => setChartTypes((p) => ({ ...p, billSummary: v }))}
            />
          )}
          {!hiddenPanels.has("topProducts") && (
            <TopProducts
              data={chartData?.topProducts || []}
              loading={chartData === null}
              collapsed={collapsedPanels.has("topProducts")}
              onToggleCollapse={() => toggleCollapse("topProducts")}
              onClose={() => closePanel("topProducts")}
            />
          )}
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5${(collapsedPanels.has("salesSummary") || collapsedPanels.has("paymentsExpenses")) ? " items-start" : ""}`}>
        {!hiddenPanels.has("salesSummary") && (
          <SalesSummary
            data={chartData?.salesSummary || []}
            loading={chartData === null}
            collapsed={collapsedPanels.has("salesSummary")}
            onToggleCollapse={() => toggleCollapse("salesSummary")}
            onClose={() => closePanel("salesSummary")}
            chartType={chartTypes.salesSummary || "area"}
            onChartTypeChange={(v) => setChartTypes((p) => ({ ...p, salesSummary: v }))}
          />
        )}
        {!hiddenPanels.has("paymentsExpenses") && (
          <PaymentsExpenses
            data={chartData?.paymentsExpenses || null}
            loading={chartData === null}
            collapsed={collapsedPanels.has("paymentsExpenses")}
            onToggleCollapse={() => toggleCollapse("paymentsExpenses")}
            onClose={() => closePanel("paymentsExpenses")}
            chartType={chartTypes.paymentsExpenses || "bar"}
            onChartTypeChange={(v) => setChartTypes((p) => ({ ...p, paymentsExpenses: v }))}
          />
        )}
      </div>

      {hiddenPanels.size > 0 && (
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setHiddenPanels(new Set())}
            className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            <RotateCcw size={14} />
            Restore All Panels
          </button>
        </div>
      )}

      <FrequentlyUsed />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  badge,
  borderColor,
  iconBg,
  iconColor,
  badgeColor,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  badge: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  badgeColor: string;
}) {
  return (
    <div
      className="bg-white rounded-xl p-4 border-l-4 shadow-sm flex flex-col justify-between min-h-[110px]"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ backgroundColor: badgeColor, color: "#fff" }}
        >
          {badge}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold" style={{ color: borderColor }}>
          {value}
        </p>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}
