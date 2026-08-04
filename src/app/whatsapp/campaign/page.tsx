"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart3, FileText, Send, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Customer {
  id: number;
  customerName: string;
  phone: string;
  customerCode?: string;
  selected: boolean;
}

interface Template {
  id: number;
  name: string;
  status: string;
}

interface CampaignHistory {
  id: number;
  name: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: string;
  createdAt: string;
}

export default function CampaignPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [campaignHistory, setCampaignHistory] = useState<CampaignHistory[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerTotal, setCustomerTotal] = useState(0);
  const [customerPage, setCustomerPage] = useState(1);
  const perPage = 50;

  useEffect(() => {
    fetch("/api/whatsapp/templates?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTemplates(
            (data.templates as Template[]).filter(
              (t) => t.status === "APPROVED" || t.status === "DRAFT"
            )
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/whatsapp/campaign?limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCampaignHistory(data.campaigns as CampaignHistory[]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(customerPage));
    params.set("limit", String(perPage));
    if (searchQuery) params.set("search", searchQuery);
    fetch(`/api/customers?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomers(
            (data.customers as Customer[]).map((c) => ({
              ...c,
              selected: false,
            }))
          );
          setCustomerTotal(data.pagination.total);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [customerPage, searchQuery]);

  const filteredCustomers = useMemo(() => customers, [customers]);

  const totalPages = Math.ceil(customerTotal / perPage);
  const startIndex = (customerPage - 1) * perPage;
  const paginatedCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + perPage
  );

  const selectedCount = customers.filter((c) => c.selected).length;

  const handleSelectAll = () => {
    setCustomers((prev) => {
      const filteredIds = new Set(paginatedCustomers.map((c) => c.id));
      return prev.map((c) => (filteredIds.has(c.id) ? { ...c, selected: true } : c));
    });
  };

  const handleSelectNone = () => {
    setCustomers((prev) => {
      const filteredIds = new Set(paginatedCustomers.map((c) => c.id));
      return prev.map((c) => (filteredIds.has(c.id) ? { ...c, selected: false } : c));
    });
  };

  const handleToggleCustomer = (id: number) => {
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
    const template = templates.find((t) => String(t.id) === selectedTemplate);
    const selectedCustomerIds = customers
      .filter((c) => c.selected)
      .map((c) => c.id);

    fetch("/api/whatsapp/campaign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: campaignName || template?.name || "Campaign",
        templateId: parseInt(selectedTemplate, 10),
        templateName: template?.name || "",
        customerIds: selectedCustomerIds,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCampaignHistory((prev) => [
            {
              id: data.campaign.id,
              name: data.campaign.name,
              totalRecipients: data.campaign.totalRecipients,
              sentCount: data.campaign.sentCount,
              failedCount: data.campaign.failedCount,
              status: data.campaign.status,
              createdAt: data.campaign.createdAt,
            },
            ...prev,
          ]);
          setCustomers((prev) => prev.map((c) => ({ ...c, selected: false })));
          setSelectedTemplate("");
          setCampaignName("");
          alert(`Campaign sent to ${selectedCustomerIds.length} recipients successfully!`);
        } else {
          alert(data.error || "Failed to send campaign");
        }
      })
      .catch(() => {
        alert("Failed to send campaign");
      })
      .finally(() => setSending(false));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCustomerPage(1);
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
                  {templates.map((t) => (
                    <option key={t.id} value={String(t.id)}>{t.name}</option>
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
            <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
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
                  onChange={handleSearchChange}
                  placeholder="Search name / mobile..."
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[220px]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="max-h-[460px] overflow-y-auto overflow-x-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">Loading customers...</div>
              ) : paginatedCustomers.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">No customers found</div>
              ) : (
                <table className="w-full min-w-[600px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#4caf85] text-white">
                      <th className="px-4 py-3 text-center w-[50px]">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">CUSTOMER</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">MOBILE</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold">CODE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCustomers.map((customer) => (
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
                        <td className="px-4 py-3 text-sm text-gray-800">{customer.customerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{customer.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-center">{customer.customerCode || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-gray-600">
                  Showing {startIndex + 1}–{Math.min(startIndex + perPage, customerTotal)} of {customerTotal}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCustomerPage((p) => Math.max(1, p - 1))}
                    disabled={customerPage === 1}
                    className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>
                  <button
                    onClick={() => setCustomerPage((p) => Math.min(totalPages, p + 1))}
                    disabled={customerPage === totalPages || totalPages === 0}
                    className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
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
                      <p className="text-xs text-gray-500">
                        {c.createdAt} — {c.sentCount}/{c.totalRecipients} sent — {c.status}
                      </p>
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