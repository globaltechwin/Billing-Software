"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompanyBranding } from "@/components/branding/CompanyBrandingProvider";
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
  X,
  Menu,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
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
      { label: "Quotations", href: "/view-bill/quotations" },
      {
        label: "Credit Bill Settlement",
        href: "/view-bill/credit-bill-settlement",
      },
      { label: "Kitchen Display", href: "/view-bill/kitchen-display" },
      { label: "Delete Bills", href: "/view-bill/delete-bills" },
      { label: "Held Bills", href: "/view-bill/held-bills" },
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
      { label: "Stock Audit List", href: "/inventory/stock-audit-list" },
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
      { label: "Vendor Branch List", href: "/master/vendor-branch-list" },
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
      { label: "Production Conversion", href: "/master/production-conversion" },
      { label: "Branch Master", href: "/master/branch-master" },
      { label: "Wallet Top Up", href: "/master/wallet-top-up" },
    ],
  },
  {
    label: "GST Management",
    href: "/gst-management",
    icon: Receipt,
    submenu: [
      { label: "GST Rates", href: "/gst-management/gst-rates" },
      { label: "HSN/SAC Master", href: "/gst-management/hsn-sac" },
      { label: "GST Settings", href: "/gst-management/gst-settings" },
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
      { label: "Print Templates", href: "/admin/print-templates" },
      { label: "Company Branding", href: "/admin/company-branding" },
      { label: "Backup & Restore", href: "/admin/backup-restore" },
      { label: "Cloud Backup", href: "/admin/cloud-backup" },
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
  onMouseEnter,
  onMouseLeave,
}: {
  items: SubmenuItem[];
  label: string;
  position: { top: number };
  pathname: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
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
      className="fixed bg-billora-nav-bg/90 rounded-lg shadow-xl py-2 min-w-[180px] z-[100]"
      style={{
        left: 72,
        top: adjustedTop,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-8px)",
        transition: "opacity 150ms ease, transform 150ms ease, top 100ms ease",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

const EMPTY_PERMISSIONS: string[] = [];

let cachedPermissionsRaw: string | null = null;
let cachedPermissions: string[] = EMPTY_PERMISSIONS;

function readPermissions(): string[] {
  const raw = localStorage.getItem("billora_permissions");
  if (raw === cachedPermissionsRaw) return cachedPermissions;
  cachedPermissionsRaw = raw;
  if (!raw || raw === "undefined") {
    cachedPermissions = EMPTY_PERMISSIONS;
  } else {
    try {
      cachedPermissions = JSON.parse(raw);
    } catch {
      cachedPermissions = EMPTY_PERMISSIONS;
    }
  }
  return cachedPermissions;
}

function Logo() {
  const { shortCode, logo, profileImage, companyName } = useCompanyBranding();
  const logoSrc = logo || profileImage;
  if (logoSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoSrc}
        alt={companyName || shortCode || "logo"}
        className="w-14 h-14 rounded-full object-contain flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-billora-primary flex items-center justify-center flex-shrink-0">
      <span className="text-white font-bold text-xs leading-none">
        {shortCode ? shortCode.slice(0, 2) : "B"}
      </span>
    </div>
  );
}

export default function Sidebar({
  showRail,
  drawerOpen,
  onCloseDrawer,
}: {
  showRail: boolean;
  drawerOpen: boolean;
  onCloseDrawer: () => void;
}) {
  const pathname = usePathname();

  const allowedModules = useSyncExternalStore(
    subscribeToStorage,
    readPermissions,
    () => EMPTY_PERMISSIONS,
  );
  const [allowedMenuPaths, setAllowedMenuPaths] = useState<string[]>([]);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [drawerExpanded, setDrawerExpanded] = useState<Set<string>>(new Set());
  const [menuPosition, setMenuPosition] = useState<{ top: number }>({ top: 0 });
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMenuEnter = useCallback((href: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    const el = itemRefs.current.get(href);
    if (el) {
      const rect = el.getBoundingClientRect();
      setMenuPosition({ top: rect.top });
    }
    setHoveredMenu(href);
  }, []);

  const handleMenuLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 200);
  }, []);

  const handlePopupEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handlePopupLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 200);
  }, []);

  const toggleDrawerMenu = useCallback((href: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDrawerExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  }, []);

  // Lock body scroll while the drawer is open on mobile/tablet
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  // Fetch live menu access from API, and re-fetch on route change or permission change
  const refreshMenuPaths = useCallback(() => {
    fetch("/api/my-menu-access")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const paths = data.allowedMenuPaths || [];
          setAllowedMenuPaths(paths);
          if (paths.length > 0) {
            localStorage.setItem("billora_menu_paths", JSON.stringify(paths));
          } else {
            localStorage.removeItem("billora_menu_paths");
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshMenuPaths();
  }, [refreshMenuPaths]);

  useEffect(() => {
    refreshMenuPaths();
  }, [pathname, refreshMenuPaths]);

  useEffect(() => {
    const handler = () => refreshMenuPaths();
    window.addEventListener("billora:permissions-changed", handler);
    return () => window.removeEventListener("billora:permissions-changed", handler);
  }, [refreshMenuPaths]);

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
    if (href === "/gst-management") return pathname.startsWith("/gst-management");
    return pathname === href;
  };

  const allNavItems = (() => {
    // If path-based menu access is set, filter by paths
    if (allowedMenuPaths.length > 0) {
      const pathSet = new Set(allowedMenuPaths);
      return NAV_ITEMS
        .map((item) => {
          if (item.submenu) {
            const parentAllowed = pathSet.has(item.href);
            const visibleChildren = parentAllowed
              ? item.submenu
              : item.submenu.filter((sub) => pathSet.has(sub.href));
            if (visibleChildren.length === 0) return null;
            return { ...item, submenu: visibleChildren };
          }
          return pathSet.has(item.href) || [...pathSet].some((p) => p.startsWith(item.href + "/")) ? item : null;
        })
        .filter(Boolean) as NavItemWithSubmenu[];
    }
    // Fallback to label-based permissions (legacy)
    if (allowedModules.length > 0) {
      return NAV_ITEMS.filter((item) => allowedModules.includes(item.label));
    }
    return NAV_ITEMS;
  })();

  const visibleNavItems = allNavItems;

  return (
    <>
      {/* Desktop / Tablet rail */}
      {showRail && (
        <aside className="fixed left-0 top-0 bottom-0 w-[72px] bg-billora-nav-bg flex flex-col items-center py-3 z-40 overflow-hidden hidden sm:flex">
          {/* Logo */}
          <div className="mb-2 flex-shrink-0">
            <Logo />
          </div>

          {/* Navigation */}
          <nav className="flex flex-col items-center gap-0.5 w-full px-0 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {visibleNavItems.map(({ label, href, icon: Icon, submenu }) => {
              const active = isActive(href);
              const hasSubmenu = submenu && submenu.length > 0;
              const isHovered = hoveredMenu === href;

              if (hasSubmenu) {
                return (
                  <div
                    key={label}
                    className="w-full relative"
                    ref={(el) => {
                      if (el) itemRefs.current.set(href, el);
                    }}
                    onMouseEnter={() => handleMenuEnter(href)}
                    onMouseLeave={handleMenuLeave}
                  >
                    {/* Parent item */}
                    <button
                      className={`relative flex flex-col items-center gap-1 w-full px-1.5 py-2 rounded-lg transition-colors group ${
                        active ? "text-white" : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-[55%] -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r" />
                      )}
                      <Icon size={20} strokeWidth={1.8} />
                      <div className="flex items-center gap-0.5">
                        <span className="text-[9px] leading-tight text-center px-1">
                          {label}
                        </span>
                        {isHovered ? (
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
                  className={`relative flex flex-col items-center gap-1 w-full px-1.5 py-2 rounded-lg transition-colors group ${
                    active ? "text-white" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-[55%] -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r" />
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
      )}

      {/* Floating Submenu Popups - rendered outside sidebar */}
      {showRail &&
        visibleNavItems
          .filter((item) => item.submenu)
          .map((item) => {
            const isHovered = hoveredMenu === item.href;

            if (!isHovered || !item.submenu) return null;

            return (
              <SubmenuPopup
                key={item.href}
                items={item.submenu}
                label={item.label}
                position={menuPosition}
                pathname={pathname}
                onMouseEnter={handlePopupEnter}
                onMouseLeave={handlePopupLeave}
              />
            );
          })}

      {/* Mobile / Tablet drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onCloseDrawer}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-billora-nav-bg flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Logo />
                <span className="text-white font-bold text-sm tracking-tight">
                  Billora
                </span>
              </div>
              <button
                onClick={onCloseDrawer}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2 px-3">
              {visibleNavItems.map(({ label, href, icon: Icon, submenu }) => {
                const active = isActive(href);
                const hasSubmenu = submenu && submenu.length > 0;
                const isExpanded = drawerExpanded.has(href);

                if (hasSubmenu) {
                  return (
                    <div key={label} className="mb-1">
                      <button
                        onClick={(e) => toggleDrawerMenu(href, e)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          active
                            ? "text-white bg-white/10"
                            : "text-gray-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon size={18} strokeWidth={1.8} className="flex-shrink-0" />
                        <span className="flex-1 text-left truncate">{label}</span>
                        {isExpanded ? (
                          <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="ml-4 mt-0.5 pl-3 border-l border-white/10 space-y-0.5 pb-1">
                          {submenu.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={onCloseDrawer}
                              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                                pathname === item.href
                                  ? "text-white bg-white/10"
                                  : "text-gray-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <span className="mr-2 text-gray-600">o</span>
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={onCloseDrawer}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                      active
                        ? "text-white bg-white/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.8} className="flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-white/10 flex-shrink-0">
              <button
                onClick={onCloseDrawer}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Menu size={14} />
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
