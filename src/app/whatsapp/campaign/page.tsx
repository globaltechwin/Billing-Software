"use client";

import { useState, useMemo } from "react";
import { BarChart3, FileText, Send, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  mobile: string;
  lastBill: string;
  bills: number;
  selected: boolean;
}

const allCustomers: Omit<Customer, "selected">[] = [
  { id: "1", name: "Aadil Baig", mobile: "REVFO16056", lastBill: "-", bills: 0 },
  { id: "2", name: "Aakarsh Gupta", mobile: "ADMS000380", lastBill: "-", bills: 0 },
  { id: "3", name: "Aakash Aary", mobile: "RXILO01657", lastBill: "-", bills: 0 },
  { id: "4", name: "Aakash Mohata", mobile: "RRILO01080", lastBill: "-", bills: 0 },
  { id: "5", name: "Aaron Pilley", mobile: "RXILO01806", lastBill: "-", bills: 0 },
  { id: "6", name: "Aarthi Mp", mobile: "AJOF000603", lastBill: "-", bills: 0 },
  { id: "7", name: "Abdul Aqeel", mobile: "RGMLO11268", lastBill: "-", bills: 0 },
  { id: "8", name: "Abdul Mateen", mobile: "ADMS000272", lastBill: "-", bills: 0 },
  { id: "9", name: "Abdul Naim", mobile: "RRILO07085", lastBill: "-", bills: 0 },
  { id: "10", name: "Abdul Najeeb", mobile: "ADMS000349", lastBill: "-", bills: 0 },
  { id: "11", name: "Abhay Singh", mobile: "ADMS000298", lastBill: "-", bills: 0 },
  { id: "12", name: "Abhay Vinod", mobile: "RXILO01828", lastBill: "-", bills: 0 },
  { id: "13", name: "Abhije Mishra", mobile: "ADMS000358", lastBill: "-", bills: 0 },
  { id: "14", name: "Abhishek Agaja", mobile: "ADMS000100", lastBill: "-", bills: 0 },
  { id: "15", name: "Abhishek B K", mobile: "REVFO16097", lastBill: "-", bills: 0 },
  { id: "16", name: "Abhishek Dwivedi", mobile: "RXILO01882", lastBill: "-", bills: 0 },
  { id: "17", name: "Abhishek Kumar", mobile: "RXILO01512", lastBill: "-", bills: 0 },
  { id: "18", name: "Abhishek Kumar", mobile: "SPALO02117", lastBill: "-", bills: 0 },
  { id: "19", name: "Abhishek Mahesh", mobile: "RXILO01830", lastBill: "-", bills: 0 },
  { id: "20", name: "Abhishek Pandey", mobile: "RXILO01309", lastBill: "-", bills: 0 },
  { id: "21", name: "ABHISHEK S", mobile: "6238523816", lastBill: "-", bills: 0 },
  { id: "22", name: "Abhishek S", mobile: "RGMLO11173", lastBill: "-", bills: 0 },
  { id: "23", name: "Abhishek Tamrakar", mobile: "RXILO01711", lastBill: "-", bills: 0 },
  { id: "24", name: "Abhishek V", mobile: "ADMS000310", lastBill: "-", bills: 0 },
  { id: "25", name: "Abinandhan Shanmugasundaram", mobile: "RGMLO11167", lastBill: "-", bills: 0 },
  { id: "26", name: "Abinas Bayee", mobile: "RXILO01558", lastBill: "-", bills: 0 },
  { id: "27", name: "Abinaya Sathiyana", mobile: "RXILO01602", lastBill: "-", bills: 0 },
  { id: "28", name: "Abishek Annadurai", mobile: "RGMLO11181", lastBill: "-", bills: 0 },
  { id: "29", name: "Abitha J", mobile: "RGMLO11127", lastBill: "-", bills: 0 },
  { id: "30", name: "Accountable Manager", mobile: "STPLO02082", lastBill: "-", bills: 0 },
  { id: "31", name: "Achyut Pandey", mobile: "RXILO01345", lastBill: "-", bills: 0 },
  { id: "32", name: "Adam Mydeen Mohamed Abdul Khader", mobile: "RRILO07046", lastBill: "-", bills: 0 },
  { id: "33", name: "Aditya G", mobile: "RPSLO17002", lastBill: "-", bills: 0 },
  { id: "34", name: "Adityakrishna R", mobile: "RXILO01335", lastBill: "-", bills: 0 },
  { id: "35", name: "Ahalya V", mobile: "RXILO01251", lastBill: "-", bills: 0 },
  { id: "36", name: "Ahmer .", mobile: "RGMLO11216", lastBill: "-", bills: 0 },
  { id: "37", name: "Aiswarya B S", mobile: "VRPLO25047", lastBill: "-", bills: 0 },
  { id: "38", name: "Ajay", mobile: "ADMS000128", lastBill: "-", bills: 0 },
  { id: "39", name: "Ajay Bind", mobile: "RRILO06013", lastBill: "-", bills: 0 },
  { id: "40", name: "Ajay Jha", mobile: "RARS015006", lastBill: "-", bills: 0 },
  { id: "41", name: "Ajay Kumar", mobile: "ADMS000319", lastBill: "-", bills: 0 },
  { id: "42", name: "Ajay Kumar", mobile: "ADMS000341", lastBill: "-", bills: 0 },
  { id: "43", name: "Ajay Kumar", mobile: "RXILO01566", lastBill: "-", bills: 0 },
  { id: "44", name: "Ajay Verma", mobile: "ADMS000025", lastBill: "-", bills: 0 },
  { id: "45", name: "Ajay Waghmare", mobile: "RXILO01770", lastBill: "-", bills: 0 },
  { id: "46", name: "Ajaykumar Chauhan", mobile: "RXILO01347", lastBill: "-", bills: 0 },
  { id: "47", name: "Ajeet Raj", mobile: "RXILO01571", lastBill: "-", bills: 0 },
  { id: "48", name: "Ajeet Yadav", mobile: "RXILO01190", lastBill: "-", bills: 0 },
  { id: "49", name: "Ajeet Yadav", mobile: "RXILO01674", lastBill: "-", bills: 0 },
  { id: "50", name: "Ajit Singh", mobile: "RRILO05012", lastBill: "-", bills: 0 },
];

const approvedTemplates = [
  { id: "1", name: "bill_notification1" },
  { id: "2", name: "order_confirm1" },
];

interface CampaignHistory {
  id: string;
  name: string;
  sent: number;
  status: string;
  date: string;
}

const campaignHistory: CampaignHistory[] = [];

export default function CampaignPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(
    allCustomers.map((c) => ({ ...c, selected: false }))
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sending, setSending] = useState(false);
  const perPage = 50;

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.mobile.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const totalPages = Math.ceil(filteredCustomers.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + perPage);

  const selectedCount = customers.filter((c) => c.selected).length;

  const handleSelectAll = () => {
    setCustomers((prev) => {
      const filteredIds = new Set(filteredCustomers.map((c) => c.id));
      return prev.map((c) => (filteredIds.has(c.id) ? { ...c, selected: true } : c));
    });
  };

  const handleSelectNone = () => {
    setCustomers((prev) => {
      const filteredIds = new Set(filteredCustomers.map((c) => c.id));
      return prev.map((c) => (filteredIds.has(c.id) ? { ...c, selected: false } : c));
    });
  };

  const handleToggleCustomer = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleSend = () => {
    if (!selectedTemplate) {
      alert("Please select a template");
      return;
    }
    if (selectedCount === 0) {
      alert("Please select at least one recipient");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      alert(`Campaign sent to ${selectedCount} recipients successfully!`);
      setCustomers((prev) => prev.map((c) => ({ ...c, selected: false })));
      setSelectedTemplate("");
      setCampaignName("");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-sm">💬</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">WhatsApp Campaign</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <FileText size={14} />
            Templates
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <BarChart3 size={14} />
            Balance
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Step 1: Choose Template & Parameters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <span className="text-lg">📋</span>
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Choose Template & Parameters</h2>
            </div>
            <div className="px-6 py-5 flex flex-wrap items-end gap-6">
              <div className="flex-1 min-w-[250px]">
                <label className="text-sm font-semibold text-gray-700 mb-1 block uppercase">
                  Template <span className="text-gray-400 font-normal normal-case">(Approved Only)</span>
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">— Select template —</option>
                  {approvedTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[250px]">
                <label className="text-sm font-semibold text-gray-700 mb-1 block uppercase">
                  Campaign Name <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. May Promotion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Select Recipients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <span className="text-lg">👥</span>
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Select Recipients</h2>
            </div>

            {/* Controls */}
            <div className="px-6 py-3 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <input type="checkbox" checked={false} readOnly className="w-3.5 h-3.5 rounded border-gray-300" />
                  All
                </button>
                <button
                  onClick={handleSelectNone}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <input type="checkbox" checked={false} readOnly className="w-3.5 h-3.5 rounded border-gray-300" />
                  None
                </button>
                <span className="text-sm text-gray-500">{selectedCount} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <Search size={14} className="text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search name / mobile..."
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[220px]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="max-h-[460px] overflow-y-auto overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#4caf85] text-white">
                    <th className="px-4 py-3 text-center w-[50px]">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CUSTOMER</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">MOBILE</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold">LAST BILL</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold">BILLS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          customer.selected ? "bg-green-50" : ""
                        }`}
                        onClick={() => handleToggleCustomer(customer.id)}
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={customer.selected}
                            onChange={() => handleToggleCustomer(customer.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">{customer.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{customer.mobile}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-center">{customer.lastBill}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center font-medium">{customer.bills}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {startIndex + 1}–{Math.min(startIndex + perPage, filteredCustomers.length)} of {filteredCustomers.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Send Campaign */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <span className="text-lg">🚀</span>
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Send Campaign</h2>
            </div>
            <div className="px-6 py-5">
              <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  Messages are sent one-by-one with a 300ms gap (Meta rate limit). Balance is deducted per sent message.
                </p>
              </div>
              <button
                onClick={handleSend}
                disabled={sending || selectedCount === 0 || !selectedTemplate}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#4caf85] text-white rounded-lg text-sm font-medium hover:bg-[#3d9a7e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                {sending ? "Sending..." : "Send to Selected Recipients"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Campaign History */}
        <div className="w-full lg:w-[320px] flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <span className="text-lg">🔄</span>
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Campaign History</h2>
            </div>
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              {campaignHistory.length === 0 ? (
                "No campaigns yet"
              ) : (
                <div className="flex flex-col gap-3">
                  {campaignHistory.map((c) => (
                    <div key={c.id} className="text-left border-b border-gray-100 pb-3">
                      <p className="font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.date} — {c.sent} sent — {c.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
