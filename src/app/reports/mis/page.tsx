"use client";

import { useState } from "react";
import { X } from "lucide-react";

const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "thisWeek" },
  { label: "Last Week", value: "lastWeek" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Quarter", value: "thisQuarter" },
  { label: "Last Quarter", value: "lastQuarter" },
  { label: "This Financial Year", value: "thisFinancialYear" },
  { label: "Last Financial Year", value: "lastFinancialYear" },
  { label: "Custom", value: "custom" },
];

function getDateRange(preset: string): { from: string; to: string } {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  switch (preset) {
    case "today":
      return { from: todayStr, to: todayStr };
    case "yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const ys = formatDate(y);
      return { from: ys, to: ys };
    }
    case "thisWeek": {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      return { from: formatDate(start), to: todayStr };
    }
    case "lastWeek": {
      const end = new Date(today);
      end.setDate(today.getDate() - today.getDay() - 1);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      return { from: formatDate(start), to: formatDate(end) };
    }
    case "thisMonth": {
      const start = new Date(yyyy, today.getMonth(), 1);
      return { from: formatDate(start), to: todayStr };
    }
    case "lastMonth": {
      const start = new Date(yyyy, today.getMonth() - 1, 1);
      const end = new Date(yyyy, today.getMonth(), 0);
      return { from: formatDate(start), to: formatDate(end) };
    }
    case "thisQuarter": {
      const qStart = Math.floor(today.getMonth() / 3) * 3;
      const start = new Date(yyyy, qStart, 1);
      return { from: formatDate(start), to: todayStr };
    }
    case "lastQuarter": {
      const lqEnd = Math.floor(today.getMonth() / 3) * 3 - 1;
      const lqStart = lqEnd - 2;
      const start = new Date(yyyy, lqStart, 1);
      const end = new Date(yyyy, lqEnd + 1, 0);
      return { from: formatDate(start), to: formatDate(end) };
    }
    case "thisFinancialYear": {
      const fyStart = today.getMonth() >= 3 ? yyyy : yyyy - 1;
      const start = new Date(fyStart, 3, 1);
      return { from: formatDate(start), to: todayStr };
    }
    case "lastFinancialYear": {
      const fyStart = today.getMonth() >= 3 ? yyyy - 1 : yyyy - 2;
      const start = new Date(fyStart, 3, 1);
      const end = new Date(fyStart + 1, 2, 31);
      return { from: formatDate(start), to: formatDate(end) };
    }
    default:
      return { from: todayStr, to: todayStr };
  }
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(row.map((v) => `"${v}"`).join(","));
  });
  return lines.join("\n");
}

export default function MisReportPage() {
  const { from: defaultFrom, to: defaultTo } = getDateRange("today");
  const [datePreset, setDatePreset] = useState("today");
  const [startDate, setStartDate] = useState(defaultFrom);
  const [endDate, setEndDate] = useState(defaultTo);
  const [generating, setGenerating] = useState<string | null>(null);

  interface MisRow {
    sNo: number;
    particulars: string;
    amount: number;
  }

  const fetchMisData = async (): Promise<{ rows: MisRow[]; itemWise: { sNo: number; category: string; product: string; quantity: number; amount: number }[] }> => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const res = await fetch(`/api/reports/mis?${params.toString()}`);
    const data = await res.json();
    return { rows: data.rows ?? [], itemWise: data.itemWise ?? [] };
  };

  const handleDownloadExcel = async () => {
    setGenerating("excel");
    try {
      const { rows } = await fetchMisData();
      const headers = ["S.No", "Particulars", "Amount"];
      const dataRows = rows.map((r) => [r.sNo, r.particulars, r.amount]);
      const csv = generateCsv(headers, dataRows);
      const dateLabel = `${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;
      downloadFile(csv, `MIS-Report-${dateLabel.replace(/\//g, "-")}.csv`, "text/csv");
    } catch {
      console.error("Failed to fetch MIS data");
    }
    setGenerating(null);
  };

  const handleItemWiseExcel = async () => {
    setGenerating("itemWise");
    try {
      const { itemWise } = await fetchMisData();
      const headers = ["S.No", "Category", "Product", "Quantity", "Amount"];
      const dataRows = itemWise.map((r) => [r.sNo, r.category, r.product, r.quantity, r.amount]);
      const csv = generateCsv(headers, dataRows);
      const dateLabel = `${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;
      downloadFile(csv, `MIS-ItemWise-${dateLabel.replace(/\//g, "-")}.csv`, "text/csv");
    } catch {
      console.error("Failed to fetch MIS item-wise data");
    }
    setGenerating(null);
  };

  const handleDownloadPdf = async () => {
    setGenerating("pdf");
    try {
      const { rows } = await fetchMisData();
      const dateLabel = `${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;
      const lines = [
        "MIS Report",
        `Period: ${dateLabel}`,
        "",
        "S.No,Particulars,Amount",
        ...rows.map((r) => `${r.sNo},${r.particulars},${r.amount}`),
      ];
      downloadFile(lines.join("\n"), `MIS-Report-${dateLabel.replace(/\//g, "-")}.txt`, "text/plain");
    } catch {
      console.error("Failed to fetch MIS data");
    }
    setGenerating(null);
  };

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    if (preset !== "custom") {
      const range = getDateRange(preset);
      setStartDate(range.from);
      setEndDate(range.to);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-gray-800">MIS Report</h2>
          <div className="flex items-center gap-1">
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

        {/* Filters Row */}
        <div className="px-6 py-5 flex flex-wrap items-center gap-4">
          {/* Date Preset Dropdown */}
          <select
            value={datePreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px] bg-white"
          >
            {DATE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Start Date */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset("custom");
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[160px]"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset("custom");
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[160px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 ml-auto">
            <button
              onClick={handleDownloadExcel}
              disabled={generating !== null}
              className="px-6 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a72] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating === "excel" ? "Generating..." : "Download Excel"}
            </button>
            <button
              onClick={handleItemWiseExcel}
              disabled={generating !== null}
              className="px-6 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a72] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating === "itemWise" ? "Generating..." : "Item Wise Download Excel"}
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={generating !== null}
              className="px-6 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a72] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating === "pdf" ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}