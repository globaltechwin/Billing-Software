"use client";

import { useState, useCallback } from "react";
import { ChevronDown, Calendar } from "lucide-react";

interface DashboardDetailsProps {
  fromDate: string;
  toDate: string;
  onDateRangeChange: (from: string, to: string) => void;
}

export default function DashboardDetails({
  fromDate,
  toDate,
  onDateRangeChange,
}: DashboardDetailsProps) {
  const [period, setPeriod] = useState("custom");
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);

  const applyPreset = useCallback(
    (preset: string) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      let f = new Date(today);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);

      switch (preset) {
        case "last7":
          f.setDate(today.getDate() - 6);
          f.setHours(0, 0, 0, 0);
          break;
        case "last14":
          f.setDate(today.getDate() - 13);
          f.setHours(0, 0, 0, 0);
          break;
        case "last30":
          f.setDate(today.getDate() - 29);
          f.setHours(0, 0, 0, 0);
          break;
        case "thisMonth":
          f = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
          break;
        case "lastMonth": {
          const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
          f = lm;
          const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          setFrom(fmt(lm));
          setTo(fmt(lastDay));
          onDateRangeChange(fmt(lm), fmt(lastDay));
          setPeriod(preset);
          return;
        }
        default:
          return;
      }
      setFrom(fmt(f));
      setTo(fmt(today));
      onDateRangeChange(fmt(f), fmt(today));
      setPeriod(preset);
    },
    [onDateRangeChange]
  );

  const handleShow = useCallback(() => {
    onDateRangeChange(from, to);
  }, [from, to, onDateRangeChange]);

  return (
    <div className="mt-2">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Dashboard Details</h2>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <select
            value={period}
            onChange={(e) => applyPreset(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
          >
            <option value="custom">Custom</option>
            <option value="last7">Last 7 days</option>
            <option value="last14">Last 14 days</option>
            <option value="last30">Last 30 days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        <div className="relative">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-[160px]"
          />
          <Calendar
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        <div className="relative">
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-[160px]"
          />
          <Calendar
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        <button
          onClick={handleShow}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all shadow-sm"
        >
          Show Report
        </button>
      </div>
    </div>
  );
}
