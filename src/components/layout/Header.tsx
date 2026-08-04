"use client";

import { useState, useRef, useEffect } from "react";
import {
  Menu,
  ShoppingCart,
  Bell,
  Calendar,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useCompanyBranding } from "@/components/branding/CompanyBrandingProvider";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { companyName, shortCode, logo, profileImage } = useCompanyBranding();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* empty */
    }
    window.location.href = "/";
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 z-30">
      {/* Left side */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          {logo || profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo || profileImage || ""}
              alt={companyName || shortCode || "logo"}
              className="w-12 h-12 rounded object-contain"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-gradient-to-br from-billora-primary via-billora-accent to-billora-primary-dark flex items-center justify-center">
              <span className="text-white text-[7px] font-bold leading-none">
                {shortCode || "B"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4">
        {/* Cart */}
        <button
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Cart"
        >
          <ShoppingCart size={20} className="text-gray-600" />
          <span className="absolute -top-0.5 -right-0.5 bg-billora-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            0
          </span>
        </button>

        {/* Notification */}
        <button
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-gray-600" />
          <span className="absolute -top-0.5 -right-0.5 bg-billora-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            1
          </span>
        </button>

        {/* Date */}
        <div className="hidden lg:flex items-center gap-1.5 text-sm text-gray-600">
          <Calendar size={16} />
          <span suppressHydrationWarning>
            {new Date().toLocaleDateString("en-GB")}
          </span>
          <button
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-gray-600" />
            <span className="absolute -top-0.5 -right-0.5 bg-billora-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              1
            </span>
          </button>
        </div>

        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors"
            aria-label="User menu"
          >
            <span className="hidden md:inline text-sm font-medium text-gray-700">
              {companyName || shortCode || "User"}
            </span>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={16} className="text-gray-500" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
