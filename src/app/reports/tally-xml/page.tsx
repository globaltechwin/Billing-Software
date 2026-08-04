"use client";

import { useState } from "react";
import { X } from "lucide-react";

function downloadXml(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function TallyXmlPage() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [generating, setGenerating] = useState<string | null>(null);

  const handleDownload = async (type: string) => {
    setGenerating(type);
    try {
      const params = new URLSearchParams();
      const apiType = type === "Billing XML" ? "billing" : type === "Vendor XML" ? "vendor" : "purchase";
      params.set("type", apiType);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await fetch(`/api/reports/tally-xml?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.xml) {
        downloadXml(data.xml, data.filename || `billora-${type}.xml`);
      }
    } catch {
      // ignore download failures
    }
    setGenerating(null);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">Tally XML</span>

          {/* Filter icons */}
          <div className="flex items-center gap-1 ml-2">
            <button className="p-1 border border-gray-200 rounded text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
            </button>
            <button className="p-1 border border-gray-200 rounded text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </button>
            <button className="p-1 border border-gray-200 rounded text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Filter Row + Buttons */}
        <div className="px-6 pb-5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Start Date*</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[150px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">End Date*</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[150px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 ml-auto">
            <button
              onClick={() => handleDownload("Billing XML")}
              disabled={generating !== null}
              className="px-6 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a72] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating === "Billing XML" ? "Generating..." : "Billing XML Download"}
            </button>
            <button
              onClick={() => handleDownload("Vendor XML")}
              disabled={generating !== null}
              className="px-6 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a72] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating === "Vendor XML" ? "Generating..." : "Vendor XML Download"}
            </button>
            <button
              onClick={() => handleDownload("Purchase XML")}
              disabled={generating !== null}
              className="px-6 py-2.5 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a72] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating === "Purchase XML" ? "Generating..." : "Purchase XML Download"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
