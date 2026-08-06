"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useCompanyBranding,
  getCompanyColors,
} from "@/components/branding/CompanyBrandingProvider";

export default function BillingHeader() {
  const [canTouchPOS, setCanTouchPOS] = useState(false);
  const router = useRouter();
  const { companyName } = useCompanyBranding();
  const companyColors = getCompanyColors(companyName);

  useEffect(() => {
    fetch("/api/my-menu-access")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          // allowedMenuPaths is null when no restrictions exist (all menus allowed)
          const paths = data.allowedMenuPaths;
          if (paths === null || paths === undefined) {
            setCanTouchPOS(true);
          } else {
            setCanTouchPOS(paths.includes("/billing/touch-pos"));
          }
        }
      })
      .catch(() => { /* empty */ });
  }, []);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-semibold text-gray-700 mr-1">
        Dashboard
      </span>

      {/* Billing F6 */}
      <button
        onClick={() => router.push("/billing/billing")}
        className="flex items-center gap-1.5 bg-gradient-to-r from-billora-primary to-billora-accent text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm cursor-pointer"
      >
        Billing
        <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded">
          F6
        </span>
      </button>

      {/* Touch POS F7 */}
      {canTouchPOS && (
        <button
          onClick={() => router.push("/touch-pos")}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-400 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm cursor-pointer"
        >
          Touch POS
          <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded">
            F7
          </span>
        </button>
      )}

      {/* Company Name */}
      <button
        className="flex items-center text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm ml-2"
        style={{
          background: `linear-gradient(to right, ${companyColors.from}, ${companyColors.to})`,
        }}
      >
        {companyName || "Laundry Service"}
      </button>
    </div>
  );
}
