"use client";

import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  FileText,
  Receipt,
  Package,
  Wallet,
  Users,
  ClipboardList,
  Factory,
  BarChart3,
  Shield,
  MessageSquare,
  Calendar,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

const ALL_PAGES: { label: string; icon: LucideIcon; color: string; href: string }[] = [
  { label: "Billing", icon: Receipt, color: "blue", href: "/billing" },
  { label: "Dashboard", icon: LayoutDashboard, color: "blue", href: "/dashboard" },
  { label: "Bill List", icon: FileText, color: "purple", href: "/view-bill/bill-list" },
  { label: "Expenses", icon: Wallet, color: "green", href: "/admin/expenses" },
  { label: "Products", icon: Package, color: "orange", href: "/master/products" },
  { label: "Customers", icon: Users, color: "blue", href: "/master/customers" },
  { label: "Orders", icon: ClipboardList, color: "purple", href: "/sales/sales-orders" },
  { label: "Master Config", icon: Settings, color: "orange", href: "/master/master-configuration" },
  { label: "Credit Settlement", icon: FileText, color: "green", href: "/view-bill/credit-bill-settlement" },
  { label: "Production", icon: Factory, color: "orange", href: "/production/planning" },
  { label: "Inventory", icon: Package, color: "green", href: "/inventory/stock-in" },
  { label: "Reports", icon: BarChart3, color: "blue", href: "/reports/sales" },
  { label: "User Management", icon: Shield, color: "purple", href: "/admin/user-creation" },
  { label: "Vendor Payment", icon: Wallet, color: "green", href: "/admin/vendor-payment" },
  { label: "Advance Order", icon: ClipboardList, color: "orange", href: "/admin/advance-order" },
  { label: "WhatsApp", icon: MessageSquare, color: "green", href: "/whatsapp/balance-analytics" },
  { label: "Events", icon: Calendar, color: "blue", href: "/events/event-management" },
];

const COLOR_MAP: Record<string, string> = {
  orange: "bg-orange-100 text-orange-600",
  green: "bg-emerald-100 text-emerald-600",
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
};

const STORAGE_KEY = "billora_page_visits";

function getVisitCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function trackPageVisit(href: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const counts: Record<string, number> = raw ? JSON.parse(raw) : {};
    counts[href] = (counts[href] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  } catch { /* empty */ }
}

function getTopPages(): typeof ALL_PAGES {
  const counts = getVisitCounts();
  return [...ALL_PAGES]
    .sort((a, b) => (counts[b.href] || 0) - (counts[a.href] || 0))
    .slice(0, 6);
}

export default function FrequentlyUsed() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const topPages = mounted ? getTopPages() : ALL_PAGES.slice(0, 6);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Frequently Used
        </h2>
        <span className="text-xs text-gray-400">
          Usage is tracked in your browser
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {topPages.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flex flex-col items-center justify-center gap-3 py-5 px-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow min-w-[130px]"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${COLOR_MAP[card.color]}`}>
              <card.icon size={22} strokeWidth={1.8} />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">
              {card.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
