"use client";

import { Maximize2, Minimize2 } from "lucide-react";

interface BillingToolbarProps {
  onFullscreen: () => void;
  isFullscreen: boolean;
  onHoldBills: () => void;
  onTableView: () => void;
}

export default function BillingToolbar({
  onFullscreen,
  isFullscreen,
  onHoldBills,
  onTableView,
}: BillingToolbarProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      {/* Laundry Service F3 */}
      <button className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm">
        Laundry Service
        <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded">
          F3
        </span>
      </button>

      {/* Right side buttons */}
      <div className="flex items-center gap-2">
        {/* Full Screen Toggle */}
        <button
          onClick={onFullscreen}
          className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
        </button>

        {/* Hold Bills F7 */}
        <button
          onClick={onHoldBills}
          className="flex items-center gap-1.5 bg-gradient-to-r from-billora-primary to-billora-accent text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm"
        >
          Hold Bills
          <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded">
            F7
          </span>
        </button>

        {/* Table View F6 */}
        <button
          onClick={onTableView}
          className="flex items-center gap-1.5 bg-gradient-to-r from-billora-primary to-billora-accent text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm"
        >
          Table View
          <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded">
            F6
          </span>
        </button>
      </div>
    </div>
  );
}
