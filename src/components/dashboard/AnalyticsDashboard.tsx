"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Package, Receipt, CalendarDays, DollarSign, TrendingUp, RotateCcw } from "lucide-react";
import StatCard from "./StatCard";
import DashboardDetails from "./DashboardDetails";
import BillSummary from "./BillSummary";
import TopProducts from "./TopProducts";
import SalesSummary from "./SalesSummary";
import PaymentsExpenses from "./PaymentsExpenses";

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalSales: number;
  thisWeekSales: number;
  lastWeekSales: number;
  thisMonthSales: number;
}

interface ChartData {
  billSummary: { date: string; count: number; amount: number }[];
  topProducts: { name: string; count: number; amount: number; color: string }[];
  salesSummary: { date: string; amount: number }[];
  paymentsExpenses: { payments: number; expenses: number } | null;
}

type PanelKey = "billSummary" | "topProducts" | "salesSummary" | "paymentsExpenses";

function getDefaultDateRange() {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const from = new Date(to);
  from.setDate(from.getDate() - 13);
  from.setHours(0, 0, 0, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>(
    getDefaultDateRange
  );

  const [hiddenPanels, setHiddenPanels] = useState<Set<PanelKey>>(new Set());
  const [collapsedPanels, setCollapsedPanels] = useState<Set<PanelKey>>(new Set());
  const [chartTypes, setChartTypes] = useState<Record<string, string>>({
    billSummary: "bar",
    salesSummary: "area",
    paymentsExpenses: "bar",
  });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setStats({
            totalCustomers: d.stats.totalCustomers,
            totalProducts: d.stats.totalProducts,
            totalSales: d.stats.totalSales,
            thisWeekSales: d.stats.thisWeekSales,
            lastWeekSales: d.stats.lastWeekSales,
            thisMonthSales: d.stats.thisMonthSales,
          });
        }
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

  const toggleCollapse = useCallback((key: PanelKey) => {
    setCollapsedPanels((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const closePanel = useCallback((key: PanelKey) => {
    setHiddenPanels((prev) => new Set(prev).add(key));
  }, []);

  const restoreAll = useCallback(() => {
    setHiddenPanels(new Set());
  }, []);

  const setChartType = useCallback((key: string, value: string) => {
    setChartTypes((prev) => ({ ...prev, [key]: value }));
  }, []);

  const displayStat = (val: number | undefined) =>
    loading ? 0 : val ?? 0;

  const allPanelsVisible = hiddenPanels.size === 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)]">
      <div className="p-4 sm:p-5 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            icon={Users}
            value={displayStat(stats?.totalCustomers)}
            label="Total Customer"
            borderColor="#6366f1"
            iconBg="#eef2ff"
            iconColor="#6366f1"
            badge="#"
            badgeColor="#6366f1"
          />
          <StatCard
            icon={Package}
            value={displayStat(stats?.totalProducts)}
            label="Total Products"
            borderColor="#8b5cf6"
            iconBg="#f5f3ff"
            iconColor="#8b5cf6"
            badge="#"
            badgeColor="#8b5cf6"
          />
          <StatCard
            icon={Receipt}
            value={displayStat(stats?.totalSales)}
            label="Total Sales"
            borderColor="#ef4444"
            iconBg="#fef2f2"
            iconColor="#ef4444"
            badge="#"
            badgeColor="#ef4444"
          />
          <StatCard
            icon={CalendarDays}
            value={displayStat(stats?.thisWeekSales)}
            label="This Week Sales"
            borderColor="#f97316"
            iconBg="#fff7ed"
            iconColor="#f97316"
            badge="#"
            badgeColor="#f97316"
          />
          <StatCard
            icon={DollarSign}
            value={displayStat(stats?.lastWeekSales)}
            label="Last Week Sales"
            borderColor="#3b82f6"
            iconBg="#eff6ff"
            iconColor="#3b82f6"
            badge="$"
            badgeColor="#3b82f6"
          />
          <StatCard
            icon={TrendingUp}
            value={displayStat(stats?.thisMonthSales)}
            label="This Month Sales"
            borderColor="#22c55e"
            iconBg="#f0fdf4"
            iconColor="#22c55e"
            badge="$"
            badgeColor="#22c55e"
          />
        </div>

        <DashboardDetails
          fromDate={dateRange.from}
          toDate={dateRange.to}
          onDateRangeChange={handleDateRangeChange}
        />

        {!allPanelsVisible && (
          <div className="flex items-center gap-2 mt-4 mb-1">
            <button
              onClick={restoreAll}
              className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              <RotateCcw size={14} />
              Restore All Panels
            </button>
            <span className="text-gray-400 text-xs">
              ({hiddenPanels.size} hidden)
            </span>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3${(collapsedPanels.has("billSummary") || collapsedPanels.has("topProducts")) ? " items-start" : ""}`}>
          {!hiddenPanels.has("billSummary") && (
            <BillSummary
              data={chartData?.billSummary || []}
              loading={chartData === null}
              collapsed={collapsedPanels.has("billSummary")}
              onToggleCollapse={() => toggleCollapse("billSummary")}
              onClose={() => closePanel("billSummary")}
              chartType={chartTypes.billSummary || "bar"}
              onChartTypeChange={(v) => setChartType("billSummary", v)}
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

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4${(collapsedPanels.has("salesSummary") || collapsedPanels.has("paymentsExpenses")) ? " items-start" : ""}`}>
          {!hiddenPanels.has("salesSummary") && (
            <SalesSummary
              data={chartData?.salesSummary || []}
              loading={chartData === null}
              collapsed={collapsedPanels.has("salesSummary")}
              onToggleCollapse={() => toggleCollapse("salesSummary")}
              onClose={() => closePanel("salesSummary")}
              chartType={chartTypes.salesSummary || "area"}
              onChartTypeChange={(v) => setChartType("salesSummary", v)}
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
              onChartTypeChange={(v) => setChartType("paymentsExpenses", v)}
            />
          )}
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-between text-xs text-gray-500">
        <span>&copy; 2025 - POS - V5.06.Nov</span>
        <span className="font-medium text-gray-600">
          LICENSE DATE 01/01/2030
        </span>
      </footer>
    </div>
  );
}
