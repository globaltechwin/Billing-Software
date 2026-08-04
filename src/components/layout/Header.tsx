"use client";

import { useState, useRef, useEffect } from "react";
import {
  Menu,
  ShoppingCart,
  Bell,
  Calendar,
  ChevronDown,
  LogOut,
  Package,
} from "lucide-react";
import { useCompanyBranding } from "@/components/branding/CompanyBrandingProvider";

interface Notification {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { companyName, shortCode, logo, profileImage } = useCompanyBranding();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications?unreadOnly=true")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(() => { /* empty */ });
    const interval = setInterval(() => {
      fetch("/api/notifications?unreadOnly=true")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => { /* empty */ });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    if (!notifOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-all-read" }),
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      /* empty */
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* empty */
    }
  };

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
              className="w-14 h-14 rounded-lg object-contain bg-black p-0.5"
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
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-700">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-billora-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    No unread notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                    >
                      <Package size={16} className="text-orange-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-[10px] text-gray-400 hover:text-gray-600 shrink-0"
                      >
                        Dismiss
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="hidden lg:flex items-center gap-1.5 text-sm text-gray-600">
          <Calendar size={16} />
          <span suppressHydrationWarning>
            {new Date().toLocaleDateString("en-GB")}
          </span>
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
