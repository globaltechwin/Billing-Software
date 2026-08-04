"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, RefreshCw, BarChart3, Pencil, Trash2, Send, X, Save } from "lucide-react";

interface WATemplate {
  id: number;
  name: string;
  isDefault: boolean;
  language: string;
  category: string;
  header: string;
  body: string;
  footer: string;
  params: number;
  status: "APPROVED" | "PENDING" | "REJECTED" | "DRAFT";
  lastSync: string;
  sampleValues: string[];
  paramLabels: string[];
}

export default function TemplateManagerPage() {
  const [templates, setTemplates] = useState<WATemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WATemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState("");
  const [formLanguage, setFormLanguage] = useState("English US");
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formCategory, setFormCategory] = useState("UTILITY — transactional (bills, receipts, alerts)");
  const [formHeader, setFormHeader] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formFooter, setFormFooter] = useState("");
  const [formSampleValues, setFormSampleValues] = useState<string[]>(["", "", "", "", ""]);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/whatsapp/templates");
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch (e) {
        console.error("Failed to fetch templates:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const filteredData = useMemo(() => {
    let data = [...templates];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.language.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
      );
    }
    return data;
  }, [templates, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormName("");
    setFormLanguage("English US");
    setFormIsDefault(false);
    setFormCategory("UTILITY — transactional (bills, receipts, alerts)");
    setFormHeader("");
    setFormBody("");
    setFormFooter("");
    setFormSampleValues(["", "", "", "", ""]);
    setShowModal(true);
  };

  const openEditModal = (tpl: WATemplate) => {
    setEditingTemplate(tpl);
    setFormName(tpl.name);
    setFormLanguage(tpl.language === "en_US" ? "English US" : tpl.language);
    setFormIsDefault(tpl.isDefault);
    setFormCategory(tpl.category);
    setFormHeader(tpl.header);
    setFormBody(tpl.body);
    setFormFooter(tpl.footer);
    setFormSampleValues([...tpl.sampleValues, ...Array(5 - tpl.sampleValues.length).fill("")]);
    setShowModal(true);
  };

  const handleSaveDraft = async () => {
    if (!formName.trim()) {
      alert("Template name is required");
      return;
    }
    if (!formBody.trim()) {
      alert("Template body is required");
      return;
    }
    try {
      const res = await fetch("/api/whatsapp/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          language: formLanguage === "English US" ? "en_US" : formLanguage,
          isDefault: formIsDefault,
          category: formCategory,
          header: formHeader,
          body: formBody,
          footer: formFooter,
          sampleValues: formSampleValues.filter((v) => v),
          paramLabels: Array((formBody.match(/\{\{\d+\}\}/g) || []).length).fill(""),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        const data = await res.json();
        setTemplates((prev) => [data.template, ...prev]);
      }
    } catch (e) {
      console.error("Save failed:", e);
    }
  };

  const handleSubmitToMeta = async () => {
    if (!formName.trim()) {
      alert("Template name is required");
      return;
    }
    if (!formBody.trim()) {
      alert("Template body is required");
      return;
    }
    try {
      const params = (formBody.match(/\{\{\d+\}\}/g) || []).length;
      const payload: Record<string, unknown> = {
        name: formName,
        language: formLanguage === "English US" ? "en_US" : formLanguage,
        isDefault: formIsDefault,
        category: formCategory,
        header: formHeader,
        body: formBody,
        footer: formFooter,
        sampleValues: formSampleValues.filter((v) => v),
        paramLabels: Array(params).fill(""),
      };
      if (editingTemplate) {
        payload.id = editingTemplate.id;
        payload.lastSyncAt = new Date().toISOString();
        const res = await fetch("/api/whatsapp/templates", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setTemplates((prev) =>
            prev.map((t) => (t.id === editingTemplate.id ? data.template : t))
          );
        }
      } else {
        payload.status = "PENDING";
        const res = await fetch("/api/whatsapp/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setTemplates((prev) => [data.template, ...prev]);
        }
      }
      setShowModal(false);
    } catch (e) {
      console.error("Submit failed:", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/whatsapp/templates?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => String(t.id) !== id));
        setDeleteConfirm(null);
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handleInsertParam = (param: string) => {
    setFormBody((prev) => prev + param);
  };

  const getPreviewText = () => {
    let text = formBody;
    formSampleValues.forEach((val, i) => {
      if (val) {
        text = text.replace(new RegExp(`\\{\\{${i + 1}\\}\\}`, "g"), val);
      }
    });
    return text || "-";
  };

  const extractParams = (body: string) => {
    const matches = body.match(/\{\{\d+\}\}/g) || [];
    return [...new Set(matches)].sort();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      APPROVED: "bg-green-100 text-green-700 border border-green-200",
      PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      REJECTED: "bg-red-100 text-red-700 border border-red-200",
      DRAFT: "bg-gray-100 text-gray-600 border border-gray-200",
    };
    return styles[status] || styles.DRAFT;
  };

  const paramButtons = ["{{1}}", "{{2}}", "{{3}}", "{{4}}", "{{5}}"];

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-sm">💬</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">WhatsApp Templates</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#4caf85] text-white rounded-lg text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
          >
            <Plus size={16} />
            New Template
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} />
            Sync Status from Meta
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <BarChart3 size={14} />
            Balance
          </button>
        </div>
      </div>

      {/* Template List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Template List &nbsp;({filteredData.length})</h2>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mt-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Templates must be approved by Meta</span> before messages can be sent. Create a template here, then click <span className="font-semibold">Submit to Meta</span>. Approval takes 1–2 business days. Use <span className="font-semibold">Sync Status</span> to refresh. The <span className="font-semibold">Default</span> template is used for billing auto-send.
          </p>
        </div>

        {/* Table Controls */}
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold">
                  <div className="flex items-center gap-1">NAME ↕</div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">LANGUAGE ↕</div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">CATEGORY ↕</div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">BODY</div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold w-[80px]">
                  <div className="flex items-center justify-center gap-1">PARAMS ↕</div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">STATUS ↕</div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">LAST SYNC ↕</div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">ACTIONS</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {row.name}
                      {row.isDefault && (
                        <span className="ml-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-semibold border border-green-200">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.language}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{row.category.split("—")[0].trim()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center max-w-[200px] truncate">{row.body}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center font-medium">{row.params}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center whitespace-nowrap">{row.lastSync}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(row)}
                          className="p-1 text-blue-500 hover:text-blue-700 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button className="p-1 text-green-500 hover:text-green-700 rounded hover:bg-green-50" title="Submit to Meta">
                          <Send size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(String(row.id))}
                          className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
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

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Delete Template</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600">Are you sure you want to delete this template? This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingTemplate ? "Edit Template" : "New Template"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Left: Form */}
              <div className="flex-1 px-6 py-5 flex flex-col gap-4">
                {/* Template Name + Language + Default */}
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Template Name *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. bill_notification"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, underscores only</p>
                  </div>
                  <div className="w-[160px]">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Language</label>
                    <select
                      value={formLanguage}
                      onChange={(e) => setFormLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>English US</option>
                      <option>English</option>
                      <option>Tamil</option>
                      <option>Hindi</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pb-0.5">
                    <input
                      type="checkbox"
                      checked={formIsDefault}
                      onChange={(e) => setFormIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label className="text-sm text-gray-700">Default</label>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>UTILITY — transactional (bills, receipts, alerts)</option>
                    <option>MARKETING — promotional (offers, discounts, campaigns)</option>
                    <option>AUTHENTICATION — OTP, verification codes</option>
                  </select>
                </div>

                {/* Header */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Header <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={formHeader}
                    onChange={(e) => setFormHeader(e.target.value)}
                    placeholder="Short header line — no parameters allowed here"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Body * <span className="text-gray-400 font-normal">Use {"{{1}}"}, {"{{2}}"} ... for dynamic values</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">Insert param:</span>
                    {paramButtons.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleInsertParam(p)}
                        className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    rows={5}
                    placeholder={`Hi {{1}}, your bill {{2}} of ₹{{3}} on {{4}} is ready. View: {{5}}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">{formBody.length} / 1024</p>
                </div>

                {/* Footer */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Footer <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={formFooter}
                    onChange={(e) => setFormFooter(e.target.value)}
                    placeholder="e.g. Reply STOP to opt out"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Sample Values */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">🧪 Sample Values <span className="text-gray-400 font-normal">Sent to Meta for review — fill with realistic examples</span></p>
                  {extractParams(formBody).map((param, i) => (
                    <div key={param} className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-red-500 font-mono w-[40px]">{param}</span>
                      <input
                        type="text"
                        value={formSampleValues[i] || ""}
                        onChange={(e) => {
                          const newVals = [...formSampleValues];
                          newVals[i] = e.target.value;
                          setFormSampleValues(newVals);
                        }}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Parameter Labels */}
                {formBody && extractParams(formBody).length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Label your parameters — helps Meta reviewers and your team:</p>
                    <p className="text-sm text-gray-600">
                      {extractParams(formBody).map((param, i) => (
                        <span key={param}>
                          <span className="text-red-500 font-mono">{param}</span> = {formSampleValues[i] || `Parameter ${i + 1}`}
                          {i < extractParams(formBody).length - 1 ? "  " : ""}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </div>

              {/* Right: Live Preview */}
              <div className="w-full lg:w-[320px] flex-shrink-0 px-6 py-5 border-l border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">LIVE PREVIEW</h4>
                <div className="bg-[#e5ddd5] rounded-lg p-4 min-h-[200px]">
                  {formHeader && (
                    <p className="text-sm font-semibold text-gray-800 mb-2">{formHeader}</p>
                  )}
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {getPreviewText()}
                  </p>
                  {formFooter && (
                    <p className="text-xs text-gray-500 mt-3 italic">{formFooter}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Parameters will be filled with sample values when the message is sent.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Make sure the order of <span className="text-red-500 font-mono">{"{{n}}"}</span> matches your BAL send method.
                </p>
                {formBody && extractParams(formBody).length > 0 && (
                  <p className="text-xs text-blue-600 mt-3">
                    ℹ️ {extractParams(formBody).length} parameters — fill sample values above before submitting to Meta.
                  </p>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#6b5ce7] text-white rounded-md text-sm font-medium hover:bg-[#5a4bd6] transition-colors"
              >
                <Save size={14} />
                Save Draft
              </button>
              <button
                onClick={handleSubmitToMeta}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
              >
                <Send size={14} />
                Save & Submit to Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
