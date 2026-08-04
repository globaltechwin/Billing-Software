"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Save,
  Trash2,
  GripVertical,
  Upload,
  Star,
} from "lucide-react";

interface TemplateField {
  id?: number;
  fieldKey: string;
  label: string;
  visible: boolean;
  bold: boolean;
  fontSize: number;
  alignment: string;
  displayOrder: number;
}

interface PrintTemplate {
  id: number;
  templateName: string;
  templateType: string;
  isDefault: boolean;
  useDynamicPrint: boolean;
  showLogo: boolean;
  logoUrl: string | null;
  logoSize: string;
  logoAlignment: string;
  footerMessage: string | null;
  fields: TemplateField[];
}

const DEFAULT_BILL_FIELDS: TemplateField[] = [
  { fieldKey: "branchName", label: "Branch Name", visible: true, bold: true, fontSize: 12, alignment: "CENTER", displayOrder: 0 },
  { fieldKey: "address1", label: "Address Line 1", visible: true, bold: false, fontSize: 9, alignment: "CENTER", displayOrder: 1 },
  { fieldKey: "address2", label: "Address Line 2", visible: true, bold: false, fontSize: 9, alignment: "CENTER", displayOrder: 2 },
  { fieldKey: "gstNumber", label: "GST Number", visible: true, bold: false, fontSize: 9, alignment: "CENTER", displayOrder: 3 },
  { fieldKey: "phoneNumber", label: "Phone Number", visible: true, bold: false, fontSize: 9, alignment: "CENTER", displayOrder: 4 },
  { fieldKey: "invoiceNumber", label: "Invoice Number", visible: true, bold: true, fontSize: 11, alignment: "CENTER", displayOrder: 5 },
  { fieldKey: "invoiceDate", label: "Invoice Date", visible: true, bold: false, fontSize: 9, alignment: "LEFT", displayOrder: 6 },
  { fieldKey: "cashier", label: "Cashier", visible: true, bold: false, fontSize: 9, alignment: "LEFT", displayOrder: 7 },
  { fieldKey: "customer", label: "Customer", visible: true, bold: false, fontSize: 9, alignment: "LEFT", displayOrder: 8 },
  { fieldKey: "orderType", label: "Order Type", visible: true, bold: false, fontSize: 9, alignment: "LEFT", displayOrder: 9 },
  { fieldKey: "itemName", label: "Item Name", visible: true, bold: false, fontSize: 9, alignment: "LEFT", displayOrder: 10 },
  { fieldKey: "quantity", label: "Quantity", visible: true, bold: false, fontSize: 9, alignment: "CENTER", displayOrder: 11 },
  { fieldKey: "rate", label: "Rate", visible: true, bold: false, fontSize: 9, alignment: "RIGHT", displayOrder: 12 },
  { fieldKey: "amount", label: "Amount", visible: true, bold: false, fontSize: 9, alignment: "RIGHT", displayOrder: 13 },
  { fieldKey: "discount", label: "Discount", visible: true, bold: false, fontSize: 9, alignment: "RIGHT", displayOrder: 14 },
  { fieldKey: "tax", label: "Tax", visible: true, bold: false, fontSize: 9, alignment: "RIGHT", displayOrder: 15 },
  { fieldKey: "subtotal", label: "Sub Total", visible: true, bold: false, fontSize: 10, alignment: "RIGHT", displayOrder: 16 },
  { fieldKey: "grandTotal", label: "Grand Total", visible: true, bold: true, fontSize: 11, alignment: "RIGHT", displayOrder: 17 },
  { fieldKey: "paymentMode", label: "Payment Mode", visible: true, bold: false, fontSize: 9, alignment: "LEFT", displayOrder: 18 },
];

const SAMPLE_DATA: Record<string, string> = {
  branchName: "SFS LAUNDRY",
  address1: "Brigade Xanadu, Bonito E block, Chanakyan",
  address2: "main road, Annamalai Avenue, Mogappair West",
  gstNumber: "33ABCDE1234F1Z5",
  phoneNumber: "9876543210",
  invoiceNumber: "BILL-1025",
  invoiceDate: "26/04/2026 06:45 PM",
  cashier: "SFSBILL",
  customer: "Walk-in Customer",
  orderType: "Dine In",
  tableName: "Table 5",
  itemName: "Veg Fried Rice",
  quantity: "2",
  rate: "90.00",
  amount: "180.00",
  discount: "0.00",
  tax: "12.50",
  subtotal: "237.50",
  grandTotal: "250.00",
  paymentMode: "Cash",
  footerMessage: "Thank you. Visit again.",
};

const ITEM_ROWS = [
  { name: "Veg Fried Rice", qty: "2", amt: "180.00" },
  { name: "Paneer Gravy", qty: "1", amt: "70.00" },
];

export default function PrintTemplateDesignerPage() {
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"BILL" | "KOT">("BILL");

  const [templateName, setTemplateName] = useState("Default Bill");
  const [useDynamicPrint, setUseDynamicPrint] = useState(true);
  const [showLogo, setShowLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState("MEDIUM");
  const [logoAlignment, setLogoAlignment] = useState("CENTER");
  const [footerMessage, setFooterMessage] = useState("Thank you. Visit again.");
  const [isDefault, setIsDefault] = useState(false);
  const [fields, setFields] = useState<TemplateField[]>(DEFAULT_BILL_FIELDS);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTemplate = templates.find((t) => t.id === activeTemplateId);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/print-templates");
      const data = await res.json();
      if (data.success) setTemplates(data.templates);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const loadTemplate = useCallback((template: PrintTemplate) => {
    setActiveTemplateId(template.id);
    setTemplateName(template.templateName);
    setUseDynamicPrint(template.useDynamicPrint);
    setShowLogo(template.showLogo);
    setLogoUrl(template.logoUrl);
    setLogoSize(template.logoSize);
    setLogoAlignment(template.logoAlignment);
    setFooterMessage(template.footerMessage || "");
    setIsDefault(template.isDefault);
    setFields(template.fields.length > 0 ? template.fields : DEFAULT_BILL_FIELDS);
  }, []);

  const handleNew = useCallback(() => {
    setActiveTemplateId(null);
    setTemplateName(`New ${activeTab === "BILL" ? "Bill" : "KOT"} Template`);
    setUseDynamicPrint(true);
    setShowLogo(false);
    setLogoUrl(null);
    setLogoSize("MEDIUM");
    setLogoAlignment("CENTER");
    setFooterMessage("Thank you. Visit again.");
    setIsDefault(false);
    setFields(DEFAULT_BILL_FIELDS);
  }, [activeTab]);

  const handleSave = useCallback(async () => {
    if (!templateName.trim()) {
      alert("Template name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        templateName,
        templateType: activeTab,
        useDynamicPrint,
        showLogo,
        logoUrl,
        logoSize,
        logoAlignment,
        footerMessage,
        isDefault,
        fields: fields.map((f, i) => ({ ...f, displayOrder: i })),
      };

      let res;
      if (activeTemplateId) {
        res = await fetch(`/api/print-templates/${activeTemplateId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/print-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        alert(activeTemplateId ? "Template updated!" : "Template created!");
        await fetchTemplates();
        if (data.template) loadTemplate(data.template);
      } else {
        alert(data.error || "Failed to save");
      }
    } catch {
      alert("Failed to save template");
    } finally {
      setSaving(false);
    }
  }, [templateName, activeTab, useDynamicPrint, showLogo, logoUrl, logoSize, logoAlignment, footerMessage, isDefault, fields, activeTemplateId, fetchTemplates, loadTemplate]);

  const handleDelete = useCallback(async () => {
    if (!activeTemplateId) return;
    if (!confirm("Delete this template?")) return;
    try {
      const res = await fetch(`/api/print-templates/${activeTemplateId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setActiveTemplateId(null);
        handleNew();
        await fetchTemplates();
      }
    } catch {
      alert("Failed to delete");
    }
  }, [activeTemplateId, fetchTemplates, handleNew]);

  const updateField = useCallback((index: number, updates: Partial<TemplateField>) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    setFields((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next.map((f, i) => ({ ...f, displayOrder: i }));
    });
    setDragIndex(null);
  }, [dragIndex]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const logoSizePx = logoSize === "SMALL" ? 40 : logoSize === "LARGE" ? 80 : 60;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-gray-800">
            Dynamic Bill Print
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Templates:</span>
            <select
              value={activeTemplateId || ""}
              onChange={(e) => {
                const t = templates.find((t) => t.id === Number(e.target.value));
                if (t) loadTemplate(t);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Template --</option>
              {templates.filter((t) => t.templateType === activeTab).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.templateName} {t.isDefault ? "(Default)" : ""}
                </option>
              ))}
            </select>
            <button onClick={handleNew} className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors" title="New Template">
              <Plus size={14} />
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
            {activeTemplateId && (
              <button onClick={handleDelete} className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors" title="Delete Template">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4">
        {/* LEFT SIDE — Configuration */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("BILL")}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "BILL"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Bill
              </button>
              <button
                onClick={() => setActiveTab("KOT")}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "KOT"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                KOT
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Template Name + Use Dynamic Print */}
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm font-medium text-gray-700 w-40 text-right">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm font-medium text-gray-700 w-40 text-right">Use Dynamic Print</label>
                <input
                  type="checkbox"
                  checked={useDynamicPrint}
                  onChange={(e) => setUseDynamicPrint(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm font-medium text-gray-700 w-40 text-right">Set as Default</label>
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Logo Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Logo</h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-8">
                {/* Show Logo */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Show Logo</label>
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Logo Upload */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Upload size={14} />
                    Upload Logo
                  </button>
                  {logoUrl && (
                    <button onClick={() => setLogoUrl(null)} className="text-xs text-red-500 hover:text-red-600">
                      Remove
                    </button>
                  )}
                </div>

                {/* Size */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Size</label>
                  <select
                    value={logoSize}
                    onChange={(e) => setLogoSize(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SMALL">Small</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LARGE">Large</option>
                  </select>
                </div>

                {/* Align */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Align</label>
                  <select
                    value={logoAlignment}
                    onChange={(e) => setLogoAlignment(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LEFT">Left</option>
                    <option value="CENTER">Center</option>
                    <option value="RIGHT">Right</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Message */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm font-medium text-gray-700 w-40 text-right">Footer Message</label>
                <input
                  type="text"
                  value={footerMessage}
                  onChange={(e) => setFooterMessage(e.target.value)}
                  placeholder="Thank you. Visit again."
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Field Configuration Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Field Configuration</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-3 py-2.5 text-center text-xs font-semibold w-10"></th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">Field</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold">Label</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold w-16">Show</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold w-16">Bold</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold w-20">Size</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold w-28">Align</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr
                      key={field.fieldKey}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-move ${dragIndex === index ? "bg-blue-50 opacity-60" : ""}`}
                    >
                      <td className="px-3 py-2 text-center">
                        <GripVertical size={14} className="text-gray-400 mx-auto" />
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 text-center font-mono text-xs">
                        {field.fieldKey}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={field.visible}
                          onChange={(e) => updateField(index, { visible: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={field.bold}
                          onChange={(e) => updateField(index, { bold: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <select
                          value={field.fontSize}
                          onChange={(e) => updateField(index, { fontSize: Number(e.target.value) })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {[7, 8, 9, 10, 11, 12, 14, 16].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <select
                          value={field.alignment}
                          onChange={(e) => updateField(index, { alignment: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="LEFT">Left</option>
                          <option value="CENTER">Center</option>
                          <option value="RIGHT">Right</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — Live Preview */}
        <div className="w-full xl:w-[340px] flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
            <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center gap-3">
              <h3 className="text-sm font-semibold text-gray-800">Preview</h3>
              <span className="text-xs text-gray-500">Sample Bill</span>
            </div>

            <div className="p-4 flex justify-center">
              {/* Receipt Paper */}
              <div
                className="bg-white border border-gray-300 shadow-lg p-4 font-mono text-gray-900"
                style={{ width: "280px", fontSize: "10px" }}
              >
                {/* Logo */}
                {showLogo && logoUrl && (
                  <div
                    className={`mb-2 ${logoAlignment === "CENTER" ? "text-center" : logoAlignment === "RIGHT" ? "text-right" : "text-left"}`}
                  >
                    <img
                      src={logoUrl}
                      alt="Logo"
                      style={{ width: `${logoSizePx}px`, height: "auto" }}
                      className={`inline-block ${logoAlignment === "CENTER" ? "mx-auto" : ""}`}
                    />
                  </div>
                )}

                {/* Fields */}
                {fields
                  .filter((f) => f.visible)
                  .map((field) => {
                    const value = SAMPLE_DATA[field.fieldKey] || field.label;
                    const align = field.alignment === "CENTER" ? "text-center" : field.alignment === "RIGHT" ? "text-right" : "text-left";

                    if (["itemName", "quantity", "rate", "amount"].includes(field.fieldKey)) {
                      return null;
                    }

                    if (field.fieldKey === "grandTotal") {
                      return (
                        <div key={field.fieldKey} className="my-1">
                          <div className="border-t border-dashed border-gray-400 my-1" />
                          <div className={`flex justify-between ${align}`}>
                            <span style={{ fontSize: `${field.fontSize}px` }} className={field.bold ? "font-bold" : ""}>
                              {field.label}
                            </span>
                            <span style={{ fontSize: `${field.fontSize}px` }} className={field.bold ? "font-bold" : ""}>
                              {value}
                            </span>
                          </div>
                          <div className="border-t border-dashed border-gray-400 my-1" />
                        </div>
                      );
                    }

                    if (["subtotal", "discount", "tax"].includes(field.fieldKey)) {
                      return (
                        <div key={field.fieldKey} className={`flex justify-between my-0.5 ${align}`}>
                          <span style={{ fontSize: `${field.fontSize}px` }}>{field.label}</span>
                          <span style={{ fontSize: `${field.fontSize}px` }}>{value}</span>
                        </div>
                      );
                    }

                    if (["branchName", "invoiceNumber"].includes(field.fieldKey)) {
                      return (
                        <div key={field.fieldKey} className={`my-0.5 ${align}`}>
                          <span style={{ fontSize: `${field.fontSize}px` }} className={field.bold ? "font-bold" : ""}>
                            {value}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={field.fieldKey} className={`my-0.5 ${align}`}>
                        <span style={{ fontSize: `${field.fontSize}px` }} className={field.bold ? "font-bold" : ""}>
                          {value}
                        </span>
                      </div>
                    );
                  })}

                {/* Items Table */}
                {fields.some((f) => f.visible && ["itemName", "quantity", "amount"].includes(f.fieldKey)) && (
                  <>
                    <div className="border-t border-dashed border-gray-400 my-1" />
                    <table className="w-full" style={{ fontSize: "9px" }}>
                      <thead>
                        <tr>
                          <th className="text-left py-0.5">Item</th>
                          <th className="text-center py-0.5">Qty</th>
                          <th className="text-right py-0.5">Amt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ITEM_ROWS.map((item, i) => (
                          <tr key={i}>
                            <td className="py-0.5">{item.name}</td>
                            <td className="text-center py-0.5">{item.qty}</td>
                            <td className="text-right py-0.5">{item.amt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="border-t border-dashed border-gray-400 my-1" />
                  </>
                )}

                {/* Tax Summary */}
                <div className="my-1" style={{ fontSize: "8px" }}>
                  <div className="flex justify-between">
                    <span>Tax Summary</span>
                    <span>GST 5% : 12.50</span>
                  </div>
                </div>

                {/* Payment */}
                {fields.some((f) => f.visible && f.fieldKey === "paymentMode") && (
                  <div className="my-1" style={{ fontSize: "9px" }}>
                    <div className="flex justify-between">
                      <span>Payment</span>
                      <span>{SAMPLE_DATA.paymentMode} : {SAMPLE_DATA.grandTotal}</span>
                    </div>
                  </div>
                )}

                {/* Footer */}
                {footerMessage && (
                  <div className="border-t border-dashed border-gray-400 mt-2 pt-2 text-center" style={{ fontSize: "8px" }}>
                    {footerMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
