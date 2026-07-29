"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingHeader() {
  const [posEnabled, setPosEnabled] = useState(false);
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-semibold text-gray-700 mr-1">
        Dashboard
      </span>

      {/* Billing F6 */}
      <button
        onClick={() => router.push("/billing/billing")}
        className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm cursor-pointer"
      >
        Billing
        <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded">
          F6
        </span>
      </button>

      {/* Touch POS F7 */}
      <button
        onClick={() => router.push("/touch-pos")}
        className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-400 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm cursor-pointer"
      >
        Touch POS
        <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded">
          F7
        </span>
      </button>

      {/* Billing POS toggle */}
      <div className="flex items-center gap-2 ml-2">
        <span className="text-sm text-gray-500">Billing POS</span>
        <button
          onClick={() => setPosEnabled(!posEnabled)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            posEnabled ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              posEnabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {/* Laundry Service F3 */}
      <button className="flex items-center gap-1.5 bg-[#1e293b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm ml-2">
        Laundry Service
        <span className="bg-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded">
          F3
        </span>
      </button>
    </div>
  );
}
