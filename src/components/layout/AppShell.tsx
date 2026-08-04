"use client";

import { useState, useCallback, useEffect } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { CompanyBrandingProvider } from "@/components/branding/CompanyBrandingProvider";
import { trackPageVisit } from "@/components/dashboard/FrequentlyUsed";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const breakpoint = useBreakpoint();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  const isMobile = breakpoint === "mobile";
  const isTablet = breakpoint === "tablet";

  // Desktop: rail always visible. Tablet: rail collapses while the drawer is open.
  // Mobile: rail hidden, drawer only.
  const showRail = !isMobile && !(isTablet && drawerOpen);

  // The drawer is only used on mobile/tablet. Desktop keeps the fixed rail.
  const openDrawer = useCallback(() => {
    if (breakpoint !== "desktop") setDrawerOpen(true);
  }, [breakpoint]);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Close the drawer whenever the route changes (navigation via drawer link).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setDrawerOpen(false);
  }

  // Track page visit for Frequently Used
  useEffect(() => {
    if (pathname) trackPageVisit(pathname);
  }, [pathname]);

  const contentOffset = isMobile
    ? ""
    : showRail
      ? "ml-[72px]"
      : "";

  return (
    <CompanyBrandingProvider>
      <div className="min-h-screen bg-[#f0f4f8]">
        <Sidebar
          showRail={showRail}
          drawerOpen={drawerOpen}
          onCloseDrawer={closeDrawer}
        />
        <div
          className={`${contentOffset} transition-[margin-left] duration-200 ease-in-out`}
        >
          <Header onMenuClick={openDrawer} />
          <main>{children}</main>
        </div>
      </div>
    </CompanyBrandingProvider>
  );
}
