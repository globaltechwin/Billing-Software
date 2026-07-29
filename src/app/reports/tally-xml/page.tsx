"use client";

import { useState } from "react";
import { X } from "lucide-react";

function generateTallyXml(type: string, fromDate: string, toDate: string): string {
  const transactions = [
    { id: "1", date: fromDate, number: "BILL001", type: "Sales", amount: 15000 },
    { id: "2", date: fromDate, number: "BILL002", type: "Sales", amount: 8500 },
    { id: "3", date: toDate, number: "BILL003", type: "Sales", amount: 12000 },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<ENVELOPE>\n`;
  xml += `  <HEADER>\n`;
  xml += `    <TALLYREQUEST>Import Data</TALLYREQUEST>\n`;
  xml += `  </HEADER>\n`;
  xml += `  <BODY>\n`;
  xml += `    <IMPORTDATA>\n`;
  xml += `      <REQUESTDESC>\n`;
  xml += `        <REPORTNAME>All Masters</REPORTNAME>\n`;
  xml += `        <STATICVARIABLES>\n`;
  xml += `          <SVCURRENTCOMPANY>Billora</SVCURRENTCOMPANY>\n`;
  xml += `        </STATICVARIABLES>\n`;
  xml += `      </REQUESTDESC>\n`;
  xml += `      <REQUESTBODY>\n`;
  xml += `        <TALLYMESSAGE>\n`;
  xml += `          <!-- ${type} Data from ${fromDate} to ${toDate} -->\n`;

  transactions.forEach((t) => {
    xml += `          <VOUCHER VCHTYPE="${t.type}" ACTION="Create">\n`;
    xml += `            <DATE>${t.date.split("/").reverse().join("")}</DATE>\n`;
    xml += `            <VOUCHERNUMBER>${t.number}</VOUCHERNUMBER>\n`;
    xml += `            <AMOUNT>${t.amount.toFixed(2)}</AMOUNT>\n`;
    xml += `          </VOUCHER>\n`;
  });

  xml += `        </TALLYMESSAGE>\n`;
  xml += `      </REQUESTBODY>\n`;
  xml += `    </IMPORTDATA>\n`;
  xml += `  </BODY>\n`;
  xml += `</ENVELOPE>`;

  return xml;
}

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

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const xml = generateTallyXml(type, startDate, endDate);
    const filename = `billora-${type.toLowerCase().replace(/\s+/g, "-")}-${startDate.replace(/\//g, "-")}.xml`;
    downloadXml(xml, filename);
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

          <div className="flex items-center gap-3 ml-auto">
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
