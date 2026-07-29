"use client";

import { Menu, ShoppingCart, Bell, Calendar, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-green-500 via-red-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-[7px] font-bold leading-none">AHS</span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Cart */}
        <button className="relative p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ShoppingCart size={20} className="text-gray-600" />
          <span className="absolute -top-0.5 -right-0.5 bg-green-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            0
          </span>
        </button>

        {/* Notification */}
        <button className="relative p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute -top-0.5 -right-0.5 bg-green-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            1
          </span>
        </button>

        {/* Company code */}
        <span className="text-sm font-medium text-gray-700">AHS</span>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Calendar size={16} />
          <span>27/07/2026</span>
        </div>

        {/* Another bell */}
        <button className="relative p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={18} className="text-gray-500" />
          <span className="absolute -top-0.5 -right-0.5 bg-green-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            1
          </span>
        </button>

        {/* User dropdown */}
        <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors">
          <span className="text-sm font-medium text-gray-700">AHS Software Demo</span>
          <ChevronDown size={16} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}
