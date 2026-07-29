"use client";

import { useState, useMemo } from "react";
import { Zap, MessageCircle } from "lucide-react";

interface MessageLog {
  id: string;
  billNo: string;
  mobile: string;
  customer: string;
  status: "SENT" | "FAILED";
  cost: number;
  sentAt: string;
  error: string;
}

const sampleMessageLog: MessageLog[] = [
  { id: "1", billNo: "12", mobile: "+97466023030", customer: "Arun", status: "SENT", cost: 0.5000, sentAt: "22/07/2026 18:11", error: "" },
  { id: "2", billNo: "4", mobile: "9940393333", customer: "raju", status: "SENT", cost: 0.5000, sentAt: "21/07/2026 17:10", error: "" },
  { id: "3", billNo: "1", mobile: "09940393333", customer: "raju", status: "FAILED", cost: 0.0000, sentAt: "21/07/2026 16:37", error: "[131009] (#131009) Parameter value is not valid | The phone number is malformed: Please use the format: +1234567890." },
  { id: "4", billNo: "", mobile: "+917010991925", customer: "Rajesh Priya", status: "SENT", cost: 0.5000, sentAt: "15/06/2026 11:33", error: "" },
  { id: "5", billNo: "", mobile: "+919025165143", customer: "SINDU VC", status: "SENT", cost: 0.5000, sentAt: "26/05/2026 12:23", error: "" },
  { id: "6", billNo: "", mobile: "9025165143", customer: "Sindu V C", status: "SENT", cost: 0.5000, sentAt: "26/05/2026 12:20", error: "" },
  { id: "7", billNo: "", mobile: "7010991925", customer: "Rajesh Kumar", status: "SENT", cost: 0.5000, sentAt: "26/05/2026 07:41", error: "" },
  { id: "8", billNo: "", mobile: "9677333175", customer: "Pradeep", status: "SENT", cost: 0.5000, sentAt: "25/05/2026 22:20", error: "" },
  { id: "9", billNo: "", mobile: "9677333175", customer: "Pradeep", status: "FAILED", cost: 0.0000, sentAt: "25/05/2026 22:16", error: "[131008] (#131008) Required parameter is missing | Parameter of type text is missing text value" },
  { id: "10", billNo: "4", mobile: "+97466023030", customer: "Arun", status: "SENT", cost: 0.5000, sentAt: "20/05/2026 21:12", error: "" },
  { id: "11", billNo: "8", mobile: "9500122580", customer: "Sandhip Kumar", status: "SENT", cost: 0.5000, sentAt: "18/05/2026 14:05", error: "" },
  { id: "12", billNo: "7", mobile: "+917010991925", customer: "Rajesh Kumar", status: "SENT", cost: 0.5000, sentAt: "18/05/2026 14:03", error: "" },
  { id: "13", billNo: "6", mobile: "7010991925", customer: "Rajesh kumar", status: "SENT", cost: 0.5000, sentAt: "18/05/2026 14:00", error: "" },
  { id: "14", billNo: "5", mobile: "7010991925", customer: "kma", status: "SENT", cost: 0.5000, sentAt: "18/05/2026 13:57", error: "" },
  { id: "15", billNo: "2", mobile: "9677333175", customer: "Pradeep", status: "SENT", cost: 0.5000, sentAt: "18/05/2026 08:31", error: "" },
  { id: "16", billNo: "2", mobile: "9677333175", customer: "Pradeep", status: "SENT", cost: 0.5000, sentAt: "18/05/2026 08:31", error: "" },
  { id: "17", billNo: "1", mobile: "9677333175", customer: "Pradeep", status: "FAILED", cost: 0.0000, sentAt: "18/05/2026 07:58", error: "[132001] Template not found or not approved by Meta. Check: (1) template status is APPROVED in Templates page, (2) template language - 'en' must be saved as 'en_US'. Meta says: template name (bill_notification1) does not exist in en_US." },
  { id: "18", billNo: "2", mobile: "7010991925", customer: "kma", status: "FAILED", cost: 0.0000, sentAt: "12/05/2026 10:11", error: "[190] Access token expired or invalid. Generate a new System User token in Meta Business Manager." },
  { id: "19", billNo: "1", mobile: "7010991925", customer: "Rajesh kumar", status: "FAILED", cost: 0.0000, sentAt: "12/05/2026 10:10", error: "[190] Access token expired or invalid. Generate a new System User token in Meta Business Manager." },
  { id: "20", billNo: "5", mobile: "7010991925", customer: "Rajesh", status: "FAILED", cost: 0.0000, sentAt: "09/05/2026 19:31", error: "[190] Access token expired or invalid. Generate a new System User token in Meta Business Manager." },
  { id: "21", billNo: "11", mobile: "9677333175", customer: "Pradeep", status: "SENT", cost: 0.5000, sentAt: "03/05/2026 16:16", error: "" },
  { id: "22", billNo: "10", mobile: "9677333175", customer: "Pradeep", status: "SENT", cost: 0.5000, sentAt: "03/05/2026 16:15", error: "" },
  { id: "23", billNo: "9", mobile: "9677333175", customer: "Pradeep", status: "FAILED", cost: 0.0000, sentAt: "03/05/2026 15:51", error: "API 404: {\"error\":{\"message\":\"(#132001) Template name does not exist in the translation\",\"code\":132001,\"type\":\"OAuthException\",\"error_data\":{\"messaging_product\":\"whatsapp\",\"details\":\"template name (bill_notification1) does not exist in en\"},\"fbtrace_id\":\"AecfH59cO2QMFdIhGcRrOkO\"}}" },
  { id: "24", billNo: "8", mobile: "9677333175", customer: "Pradeep", status: "FAILED", cost: 0.0000, sentAt: "03/05/2026 15:17", error: "API 404: {\"error\":{\"message\":\"(#132001) Template name does not exist in the translation\",\"code\":132001,\"type\":\"OAuthException\",\"error_data\":{\"messaging_product\":\"whatsapp\",\"details\":\"template name (bill_notification1) does not exist in en\"},\"fbtrace_id\":\"AJmhTBccsxnsLaZdIaLSt_R\"}}" },
  { id: "25", billNo: "7", mobile: "9677333175", customer: "Pradeep", status: "FAILED", cost: 0.0000, sentAt: "03/05/2026 15:15", error: "API 400: {\"error\":{\"message\":\"(#131030) Recipient phone number not in allowed list\",\"code\":131030,\"type\":\"OAuthException\",\"error_data\":{\"messaging_product\":\"whatsapp\",\"details\":\"Recipient phone number not in allowed list: Add recipient phone number to recipient list and try again.\"},\"fbtrace_id\":\"AoqVN2paUXFdzO6OLGc7u5U\"}}" },
  { id: "26", billNo: "6", mobile: "9677333175", customer: "Pradeep", status: "FAILED", cost: 0.0000, sentAt: "03/05/2026 15:10", error: "API 400: {\"error\":{\"message\":\"Unsupported post request. Object with ID '1509973570642451' does not exist, cannot be loaded due to missing permissions, or does not support this operation. Please read the Graph API documentation at https://developers.facebook.com/docs/graph-api\",\"type\":\"GraphMethodException\",\"code\":100,\"error_subcode\":33,\"fbtrace_id\":\"AlhKlgkgNzZnUZJ2c7a9mon\"}}" },
];

export default function BalanceAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"messageLog" | "recharges">("messageLog");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickAmount, setQuickAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const currentBalance = 92.50;
  const totalSpent = 7.50;
  const totalRecharged = 100.00;
  const costPerMessage = 0.50;
  const messagesRemaining = Math.floor(currentBalance / costPerMessage);

  const filteredData = useMemo(() => {
    let data = activeTab === "messageLog" ? sampleMessageLog : [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.billNo.toLowerCase().includes(q) ||
          r.mobile.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          r.error.toLowerCase().includes(q)
      );
    }
    return data;
  }, [activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-IN", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

  const formatCurrencyShort = (val: number) =>
    "\u20B9 " + val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleQuickSelect = (amount: number) => {
    setQuickAmount(amount);
    setCustomAmount(String(amount));
  };

  const handleRecharge = () => {
    const amt = parseFloat(customAmount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    alert(`Recharge of ₹ ${amt} initiated successfully!`);
    setCustomAmount("");
    setQuickAmount(null);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Top Section: Balance Cards + Recharge */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Balance Cards */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Balance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Balance</p>
            <p className="text-3xl font-bold text-gray-800">{formatCurrencyShort(currentBalance)}</p>
            <p className="text-sm text-gray-500 mt-1">{messagesRemaining} messages remaining</p>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Spent</p>
            <p className="text-3xl font-bold text-gray-800">{formatCurrencyShort(totalSpent)}</p>
            <p className="text-sm text-gray-500 mt-1">{formatCurrencyShort(costPerMessage)} / message</p>
          </div>

          {/* Total Recharged */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Recharged</p>
            <p className="text-3xl font-bold text-gray-800">{formatCurrencyShort(totalRecharged)}</p>
            <p className="text-sm text-gray-500 mt-1">lifetime</p>
          </div>
        </div>

        {/* Recharge Widget */}
        <div className="w-full lg:w-[320px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={20} className="text-green-600" />
            <h3 className="text-sm font-semibold text-gray-800">Recharge WhatsApp Balance</h3>
          </div>

          <p className="text-xs text-gray-600 mb-2">Quick select:</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickSelect(amt)}
                className={`px-2 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  quickAmount === amt
                    ? "bg-green-50 border-green-500 text-green-700"
                    : "border-green-300 text-green-600 hover:bg-green-50"
                }`}
              >
                {"\u20B9"}{amt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">{"\u20B9"}</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setQuickAmount(null);
              }}
              placeholder="Enter amount"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <button
            onClick={handleRecharge}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4caf85] text-white rounded-lg text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
          >
            <Zap size={16} />
            Pay & Recharge
          </button>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">History</h2>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200 flex items-center gap-6">
          <button
            onClick={() => {
              setActiveTab("messageLog");
              setCurrentPage(1);
              setSearchQuery("");
            }}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "messageLog"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Message Log
          </button>
          <button
            onClick={() => {
              setActiveTab("recharges");
              setCurrentPage(1);
              setSearchQuery("");
            }}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "recharges"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Recharges
          </button>
        </div>

        {/* Table Controls */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Search:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {activeTab === "messageLog" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-[#3d9a7e] text-white">
                  <th className="px-3 py-3 text-center text-xs font-semibold w-[80px]">
                    <div className="flex items-center justify-center gap-1">BILL NO ↕</div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">
                    <div className="flex items-center justify-center gap-1">MOBILE ↕</div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">
                    <div className="flex items-center justify-center gap-1">CUSTOMER ↕</div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold w-[100px]">
                    <div className="flex items-center justify-center gap-1">STATUS ↕</div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold w-[100px]">
                    <div className="flex items-center justify-center gap-1">COST ↕</div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">
                    <div className="flex items-center justify-center gap-1">SENT AT ↕</div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">
                    <div className="flex items-center justify-center gap-1">ERROR</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.billNo || "\u00A0"}</td>
                      <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.mobile}</td>
                      <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.customer}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          row.status === "SENT"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700 text-center">{formatCurrency(row.cost)}</td>
                      <td className="px-3 py-3 text-sm text-gray-700 text-center whitespace-nowrap">{row.sentAt}</td>
                      <td className="px-3 py-3 text-sm text-red-600 text-left max-w-[300px]">
                        {row.error && (
                          <span className="text-xs leading-relaxed break-words">{row.error}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No recharge history available
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {filteredData.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === page
                    ? "bg-[#3d9a7e] text-white border-[#3d9a7e]"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
