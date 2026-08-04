"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, Settings, X } from "lucide-react";

interface SettingsOption {
  label: string;
  value: string;
}

interface ChartPanelProps {
  title: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  settingsOptions?: SettingsOption[];
  activeSettings?: string;
  onSettingsChange?: (value: string) => void;
  children: React.ReactNode;
}

export default function ChartPanel({
  title,
  collapsed,
  onToggleCollapse,
  onClose,
  settingsOptions,
  activeSettings,
  onSettingsChange,
  children,
}: ChartPanelProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    if (settingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsOpen]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronUp size={16} className="text-gray-400" />
            )}
          </button>

          {settingsOptions && settingsOptions.length > 0 && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                title="Settings"
              >
                <Settings size={16} className="text-gray-400" />
              </button>
              {settingsOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                  {settingsOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onSettingsChange?.(opt.value);
                        setSettingsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        activeSettings === opt.value
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            title="Close"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {!collapsed && <div className="flex-1">{children}</div>}
    </div>
  );
}
