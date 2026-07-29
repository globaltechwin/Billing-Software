"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Package,
  Database,
  BarChart3,
  Shield,
  Factory,
  ShoppingCart,
  MessageSquare,
  Calendar,
  Wallet,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Settings,
  ScanBarcode,
  GitBranch,
  Layers,
  Ruler,
  Tags,
  GraduationCap,
  UserSquare,
  Store,
  Building,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

interface SubmenuItem {
  label: string;
  href: string;
}

interface NavItemWithSubmenu extends NavItem {
  submenu?: SubmenuItem[];
}

const NAV_ITEMS: NavItemWithSubmenu[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Billing", href: "/billing", icon: Receipt },
  {
    label: "View Bill",
    href: "/view-bill",
    icon: FileText,
    submenu: [
      { label: "Bill List", href: "/view-bill/bill-list" },
      {
        label: "Credit Bill Settlement",
        href: "/view-bill/credit-bill-settlement",
      },
      { label: "Kitchen Display", href: "/view-bill/kitchen-display" },
      { label: "Delete Bills", href: "/view-bill/delete-bills" },
    ],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Package,
    submenu: [
      { label: "Indent Request", href: "/inventory/indent-request" },
      { label: "Dashboard", href: "/inventory/dashboard" },
      { label: "Indent List", href: "/inventory/indent-list" },
      { label: "PO Request", href: "/inventory/po-request" },
      { label: "PO List", href: "/inventory/po-list" },
      { label: "Stock In", href: "/inventory/stock-in" },
      { label: "Stock In List", href: "/inventory/stock-in-list" },
      { label: "Stock Out", href: "/inventory/stock-out" },
      { label: "Stock Out List", href: "/inventory/stock-out-list" },
      { label: "Stock Audit", href: "/inventory/stock-audit" },
    ],
  },
  {
    label: "Master",
    href: "/master",
    icon: Database,
    submenu: [
      { label: "Master Configuration", href: "/master/master-configuration" },
      { label: "Product", href: "/master/product" },
      { label: "Barcode Generation", href: "/master/barcode-generation" },
      { label: "Vendor Branch Mapping", href: "/master/vendor-branch-mapping" },
      { label: "Bulk Product Edit", href: "/master/bulk-product-edit" },
      { label: "Unit", href: "/master/unit" },
      { label: "Expense Category", href: "/master/expense-category" },
      {
        label: "Vendor Branch Price Mapping",
        href: "/master/vendor-branch-price-mapping",
      },
      { label: "Student", href: "/master/student" },
      { label: "Customer", href: "/master/customer" },
      { label: "Vendor", href: "/master/vendor" },
      { label: "Production Mapping", href: "/master/production-mapping" },
      { label: "Branch Master", href: "/master/branch-master" },
      { label: "Wallet Top Up", href: "/master/wallet-top-up" },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    submenu: [
      { label: "All Reports", href: "/reports" },
      { label: "Employee Bill Report", href: "/reports/employee-bill" },
      { label: "Sales Report", href: "/reports/sales" },
      { label: "Cashier Report", href: "/reports/cashier" },
      { label: "Items Wise Sales", href: "/reports/items-wise-sales" },
      { label: "Stock Report", href: "/reports/stock" },
      { label: "Day Wise Stock Report", href: "/reports/day-wise-stock" },
      { label: "Vendor Payments", href: "/reports/vendor-payments" },
      { label: "Expense Report", href: "/reports/expense" },
      { label: "Tally XML", href: "/reports/tally-xml" },
      { label: "GST Filing", href: "/reports/gst-filing" },
      { label: "Login History", href: "/reports/login-history" },
      { label: "Cancelled Bills", href: "/reports/cancelled-bills" },
      { label: "Cancelled KOT Report", href: "/reports/cancelled-kot" },
      { label: "Compliment Bill Report", href: "/reports/compliment-bill" },
      { label: "Bill Coupon Report", href: "/reports/bill-coupon" },
      { label: "Profit and Loss", href: "/reports/profit-and-loss" },
      { label: "MIS Report", href: "/reports/mis" },
      { label: "ProfitReportRetail", href: "/reports/profit-retail" },
      { label: "Purchases Report", href: "/reports/purchases" },
      { label: "Stock Audit Report", href: "/reports/stock-audit" },
      { label: "Wallet Top Up Report", href: "/reports/wallet-top-up" },
    ],
  },
  {
    label: "Admin",
    href: "/admin",
    icon: Shield,
    submenu: [
      { label: "Expenses", href: "/admin/expenses" },
      { label: "Vendor Payment", href: "/admin/vendor-payment" },
      { label: "User Creation", href: "/admin/user-creation" },
      { label: "Day Closing", href: "/admin/day-closing" },
      { label: "Advance Order", href: "/admin/advance-order" },
      { label: "Lock Items", href: "/admin/lock-items" },
      { label: "QR", href: "/admin/qr" },
    ],
  },
  {
    label: "Production",
    href: "/production",
    icon: Factory,
    submenu: [
      { label: "Prod. Planning", href: "/production/planning" },
      { label: "Prod. Planning List", href: "/production/planning-list" },
      { label: "Production-In", href: "/production/production-in" },
      { label: "Production-In List", href: "/production/production-in-list" },
      { label: "Production Out", href: "/production/production-out" },
      { label: "Production Out List", href: "/production/production-out-list" },
      { label: "Wastage", href: "/production/wastage" },
      { label: "Wastage List", href: "/production/wastage-list" },
    ],
  },
  {
    label: "Sales",
    href: "/sales",
    icon: ShoppingCart,
    submenu: [
      { label: "Estimate", href: "/sales/estimate" },
      { label: "Invoice", href: "/sales/invoice" },
    ],
  },
  {
    label: "WhatsApp",
    href: "/whatsapp",
    icon: MessageSquare,
    submenu: [
      { label: "Balance & Analytics", href: "/whatsapp/balance-analytics" },
      { label: "Template Manager", href: "/whatsapp/template-manager" },
      { label: "Campaign", href: "/whatsapp/campaign" },
    ],
  },
  { label: "Events", href: "/events/event-management", icon: Calendar },
  {
    label: "Cash Flow",
    href: "/cash-flow",
    icon: Wallet,
    submenu: [
      { label: "Cash Dashboard", href: "/cash-flow/dashboard" },
      { label: "Cash Transaction", href: "/cash-flow/transaction" },
      { label: "Cash Category", href: "/cash-flow/category" },
      { label: "Cash Account", href: "/cash-flow/account" },
    ],
  },
  {
    label: "Accounting",
    href: "/accounting",
    icon: BookOpen,
    submenu: [
      { label: "Acc Dashboard", href: "/accounting/dashboard" },
      { label: "Quote", href: "/accounting/quote" },
      { label: "Invoice", href: "/accounting/invoice" },
      { label: "Quote Template", href: "/accounting/quote-template" },
      { label: "Template Preview", href: "/accounting/template-preview" },
    ],
  },
];

function SubmenuPopup({
  items,
  label,
  position,
  pathname,
  onLinkClick,
}: {
  items: SubmenuItem[];
  label: string;
  position: { top: number };
  pathname: string;
  onLinkClick: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedTop, setAdjustedTop] = useState(position.top);

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true);
      if (popupRef.current) {
        const rect = popupRef.current.getBoundingClientRect();
        const vh = window.innerHeight;
        const margin = 8;
        let top = position.top;
        if (top + rect.height > vh - margin) {
          top = Math.max(margin, vh - rect.height - margin);
        }
        setAdjustedTop(top);
      }
    });
    return () => setVisible(false);
  }, [position.top, items.length]);

  return createPortal(
    <div
      ref={popupRef}
      className="fixed bg-[#1e293b] rounded-lg shadow-xl py-2 min-w-[180px] z-[100]"
      style={{
        left: 72,
        top: adjustedTop,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-8px)",
        transition: "opacity 150ms ease, transform 150ms ease, top 100ms ease",
      }}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-white/10">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      {/* Items */}
      <div className="py-1 max-h-[400px] overflow-y-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={`block w-full px-4 py-2 text-xs rounded transition-colors ${
              pathname === item.href
                ? "text-white bg-white/10"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="mr-2 text-gray-500">o</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>,
    document.body,
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  const [allowedModules, setAllowedModules] = useState<string[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [menuPosition, setMenuPosition] = useState<{ top: number }>({ top: 0 });
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const permissions = localStorage.getItem("billora_permissions");

    if (permissions) {
      setAllowedModules(JSON.parse(permissions));
    }
  }, []);

  const toggleMenu = useCallback((href: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = itemRefs.current.get(href);
    if (el) {
      const rect = el.getBoundingClientRect();
      setMenuPosition({ top: rect.top });
    }
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  }, []);

  // Close expanded menus on sidebar scroll
  useEffect(() => {
    const nav = document.querySelector("nav");
    if (!nav) return;
    const handleScroll = () => {
      setExpandedMenus(new Set());
    };
    nav.addEventListener("scroll", handleScroll);
    return () => nav.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname.startsWith("/dashboard");
    if (href === "/view-bill") return pathname.startsWith("/view-bill");
    if (href === "/inventory") return pathname.startsWith("/inventory");
    if (href === "/master") return pathname.startsWith("/master");
    if (href === "/reports") return pathname.startsWith("/reports");
    if (href === "/admin") return pathname.startsWith("/admin");
    if (href === "/production") return pathname.startsWith("/production");
    if (href === "/sales") return pathname.startsWith("/sales");
    if (href === "/whatsapp") return pathname.startsWith("/whatsapp");
    if (href === "/cash-flow") return pathname.startsWith("/cash-flow");
    if (href === "/accounting") return pathname.startsWith("/accounting");
    return pathname === href;
  };

  const filteredNavItems =
    allowedModules.length > 0
      ? NAV_ITEMS.filter((item) => allowedModules.includes(item.label))
      : [];

  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 w-[72px] bg-[#0f172a] flex flex-col items-center py-3 z-40 overflow-hidden">
        {/* Logo */}
        <div className="mb-2 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs leading-none">B</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-0.5 w-full px-1.5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {filteredNavItems.map(({ label, href, icon: Icon, submenu }) => {
            const active = isActive(href);
            const hasSubmenu = submenu && submenu.length > 0;
            const isExpanded = expandedMenus.has(href);

            if (hasSubmenu) {
              return (
                <div
                  key={label}
                  className="w-full relative"
                  ref={(el) => {
                    if (el) itemRefs.current.set(href, el);
                  }}
                >
                  {/* Parent item */}
                  <button
                    onClick={(e) => toggleMenu(href, e)}
                    className={`relative flex flex-col items-center gap-1 w-full py-2 rounded-lg transition-colors group ${
                      active
                        ? "text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r" />
                    )}
                    <Icon size={20} strokeWidth={1.8} />
                    <div className="flex items-center gap-0.5">
                      <span className="text-[9px] leading-tight text-center px-1">
                        {label}
                      </span>
                      {isExpanded ? (
                        <ChevronDown size={10} />
                      ) : (
                        <ChevronRight size={10} />
                      )}
                    </div>
                  </button>
                </div>
              );
            }

            return (
              <Link
                key={label}
                href={href}
                className={`relative flex flex-col items-center gap-1 w-full py-2 rounded-lg transition-colors group ${
                  active ? "text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r" />
                )}
                <Icon size={20} strokeWidth={1.8} />
                <span className="text-[9px] leading-tight text-center px-1">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Floating Submenu Popups - rendered outside sidebar */}
      {filteredNavItems
        .filter((item) => item.submenu)
        .map((item) => {
          const isExpanded = expandedMenus.has(item.href);

          if (!isExpanded || !item.submenu) return null;

          return (
            <SubmenuPopup
              key={item.href}
              items={item.submenu}
              label={item.label}
              position={menuPosition}
              pathname={pathname}
              onLinkClick={() =>
                setExpandedMenus((prev) => {
                  const next = new Set(prev);
                  next.delete(item.href);
                  return next;
                })
              }
            />
          );
        })}
    </>
  );
}
