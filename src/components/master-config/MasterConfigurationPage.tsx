"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Building2, Receipt, Package, Printer, Globe, Settings, Plus } from "lucide-react";

interface CompanySettings {
  id: number;
  companyName: string;
  logo: string | null;
  address: string;
  phone: string;
  email: string;
  gstNumber: string | null;
  gstStateCode: string | null;
  stateName: string;
  gstEnabled: boolean;
  gstMode: string;
  roundOffEnabled: boolean;
  allowInvoiceGstOverride: boolean;
  defaultHsnRequired: boolean;
  allowCustomGstRate: boolean;
  panNumber: string | null;
  city: string | null;
  country: string | null;
  pincode: string | null;
  website: string | null;
  bankAccountHolder: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  bankName: string | null;
  bankBranch: string | null;
  defaultBillingMode: string | null;
  invoicePrefix: string | null;
  estimatePrefix: string | null;
  creditBillPrefix: string | null;
  autoNumberGeneration: boolean;
  decimalPrecision: number | null;
  defaultPaymentMode: string | null;
  lowStockAlert: number | null;
  negativeStockAllowed: boolean;
  defaultWarehouseId: number | null;
  barcodeSettings: string | null;
  defaultPrintTemplateId: number | null;
  paperSize: string | null;
  printPreviewEnabled: boolean;
  defaultGstPercentage: number | null;
  igstEnabled: boolean;
  currency: string | null;
  currencySymbol: string | null;
  timeZone: string | null;
  dateFormat: string | null;
  financialYear: string | null;
  language: string | null;
}

type TabId = "company" | "billing" | "inventory" | "print" | "tax" | "general" | "lists";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: "company", label: "Company Info", icon: <Building2 size={16} /> },
  { id: "billing", label: "Billing", icon: <Receipt size={16} /> },
  { id: "inventory", label: "Inventory", icon: <Package size={16} /> },
  { id: "print", label: "Print", icon: <Printer size={16} /> },
  { id: "tax", label: "Tax / GST", icon: <Globe size={16} /> },
  { id: "general", label: "General", icon: <Settings size={16} /> },
  { id: "lists", label: "Lists", icon: <Settings size={16} /> },
];

const INDIAN_STATES = [
  { code: "01", name: "Jammu & Kashmir" }, { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" }, { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" }, { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" }, { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" }, { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" }, { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" }, { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" }, { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" }, { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" }, { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" }, { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" }, { code: "24", name: "Gujarat" },
  { code: "25", name: "Daman & Diu" }, { code: "26", name: "Dadra & Nagar Haveli" },
  { code: "27", name: "Maharashtra" }, { code: "28", name: "Andhra Pradesh (Old)" },
  { code: "29", name: "Karnataka" }, { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" }, { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" }, { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" }, { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" }, { code: "38", name: "Ladakh" },
];

export default function MasterConfigurationPage() {
  const [activeTab, setActiveTab] = useState<TabId>("company");
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/company/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      } else {
        setError(data.error || "Failed to load settings");
      }
    } catch {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const { logo: _logo, ...patchData } = settings;
      const res = await fetch("/api/company/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchData),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        alert(data.error || "Failed to save settings");
      }
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-purple-600" />
          <p className="text-sm text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-3">{error || "Failed to load settings"}</p>
          <button onClick={fetchSettings} className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Settings saved successfully!
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">
        {/* Header */}
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Master Configuration</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 flex-shrink-0">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "company" && (
            <CompanyInfoTab settings={settings} updateField={updateField} />
          )}
          {activeTab === "billing" && (
            <BillingConfigTab settings={settings} updateField={updateField} />
          )}
          {activeTab === "inventory" && (
            <InventoryConfigTab settings={settings} updateField={updateField} />
          )}
          {activeTab === "print" && (
            <PrintConfigTab settings={settings} updateField={updateField} />
          )}
          {activeTab === "tax" && (
            <TaxConfigTab settings={settings} updateField={updateField} />
          )}
          {activeTab === "general" && (
            <GeneralSettingsTab settings={settings} updateField={updateField} />
          )}
          {activeTab === "lists" && (
            <ListsTab />
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, required, type = "text" }: {
  label: string; value: string | null; onChange: (val: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string | null; onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleField({ label, value, onChange, description }: {
  label: string; value: boolean; onChange: (val: boolean) => void; description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-[#4caf85]" : "bg-gray-300"
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          value ? "translate-x-6" : "translate-x-1"
        }`} />
      </button>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function CompanyInfoTab({ settings, updateField }: { settings: CompanySettings; updateField: <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => void }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField label="Company Name" value={settings.companyName} onChange={(v) => updateField("companyName", v)} required />
          <InputField label="Email" value={settings.email} onChange={(v) => updateField("email", v)} type="email" />
          <InputField label="Phone" value={settings.phone} onChange={(v) => updateField("phone", v)} />
          <InputField label="Website" value={settings.website} onChange={(v) => updateField("website", v)} placeholder="https://..." />
          <div className="md:col-span-2 lg:col-span-3">
            <InputField label="Address" value={settings.address} onChange={(v) => updateField("address", v)} />
          </div>
          <InputField label="City" value={settings.city} onChange={(v) => updateField("city", v)} />
          <InputField label="Pincode" value={settings.pincode} onChange={(v) => updateField("pincode", v)} />
          <InputField label="Country" value={settings.country} onChange={(v) => updateField("country", v)} />
        </div>
      </SectionCard>

      <SectionCard title="Tax Information">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField label="GSTIN" value={settings.gstNumber} onChange={(v) => updateField("gstNumber", v)} placeholder="22AAAAA0000A1Z5" />
          <InputField label="PAN Number" value={settings.panNumber} onChange={(v) => updateField("panNumber", v)} placeholder="ABCDE1234F" />
          <SelectField
            label="State"
            value={settings.gstStateCode}
            onChange={(code) => {
              const state = INDIAN_STATES.find((s) => s.code === code);
              updateField("gstStateCode", code);
              if (state) updateField("stateName", state.name);
            }}
            options={INDIAN_STATES.map((s) => ({ value: s.code, label: `${s.code} - ${s.name}` }))}
          />
          <InputField label="State Name" value={settings.stateName} onChange={(v) => updateField("stateName", v)} />
        </div>
      </SectionCard>

      <SectionCard title="Bank Details (for A4 Bill Print)">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField label="Account Holder Name" value={settings.bankAccountHolder} onChange={(v) => updateField("bankAccountHolder", v)} />
          <InputField label="Account Number" value={settings.bankAccountNumber} onChange={(v) => updateField("bankAccountNumber", v)} />
          <InputField label="IFSC Code" value={settings.bankIfsc} onChange={(v) => updateField("bankIfsc", v)} />
          <InputField label="Bank Name" value={settings.bankName} onChange={(v) => updateField("bankName", v)} />
          <InputField label="Branch" value={settings.bankBranch} onChange={(v) => updateField("bankBranch", v)} />
        </div>
      </SectionCard>
    </div>
  );
}

function BillingConfigTab({ settings, updateField }: { settings: CompanySettings; updateField: <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => void }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Default Billing">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Default Billing Mode"
            value={settings.defaultBillingMode}
            onChange={(v) => updateField("defaultBillingMode", v)}
            options={[
              { value: "WITH_GST", label: "With GST" },
              { value: "WITH_GST_HIDE", label: "With GST (Hide Details)" },
              { value: "WITH_IGST", label: "With IGST" },
              { value: "WITHOUT_GST", label: "Without GST" },
            ]}
          />
          <SelectField
            label="Default Payment Mode"
            value={settings.defaultPaymentMode}
            onChange={(v) => updateField("defaultPaymentMode", v)}
            options={[
              { value: "CASH", label: "Cash" },
              { value: "CARD", label: "Card" },
              { value: "UPI", label: "UPI" },
              { value: "CREDIT", label: "Credit" },
            ]}
          />
          <SelectField
            label="Decimal Precision"
            value={String(settings.decimalPrecision || 2)}
            onChange={(v) => updateField("decimalPrecision", parseInt(v, 10))}
            options={[
              { value: "0", label: "0 - No decimals" },
              { value: "1", label: "1 decimal" },
              { value: "2", label: "2 decimals" },
              { value: "3", label: "3 decimals" },
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard title="Number Prefixes">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField label="Invoice Prefix" value={settings.invoicePrefix} onChange={(v) => updateField("invoicePrefix", v)} />
          <InputField label="Estimate Prefix" value={settings.estimatePrefix} onChange={(v) => updateField("estimatePrefix", v)} />
          <InputField label="Credit Bill Prefix" value={settings.creditBillPrefix} onChange={(v) => updateField("creditBillPrefix", v)} />
        </div>
        <div className="mt-4">
          <ToggleField
            label="Auto Number Generation"
            value={settings.autoNumberGeneration}
            onChange={(v) => updateField("autoNumberGeneration", v)}
            description="Automatically generate sequential invoice, estimate, and credit bill numbers"
          />
        </div>
      </SectionCard>
    </div>
  );
}

function InventoryConfigTab({ settings, updateField }: { settings: CompanySettings; updateField: <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => void }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Stock Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Low Stock Alert Threshold"
            value={settings.lowStockAlert != null ? String(settings.lowStockAlert) : ""}
            onChange={(v) => updateField("lowStockAlert", v ? parseFloat(v) : null)}
            type="number"
          />
          <InputField
            label="Barcode Settings"
            value={settings.barcodeSettings}
            onChange={(v) => updateField("barcodeSettings", v)}
            placeholder="e.g., EAN13, CODE128"
          />
        </div>
        <div className="mt-4 space-y-0">
          <ToggleField
            label="Allow Negative Stock"
            value={settings.negativeStockAllowed}
            onChange={(v) => updateField("negativeStockAllowed", v)}
            description="Allow selling products even when stock is zero or negative"
          />
        </div>
      </SectionCard>
    </div>
  );
}

function PrintConfigTab({ settings, updateField }: { settings: CompanySettings; updateField: <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => void }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Print Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Paper Size"
            value={settings.paperSize}
            onChange={(v) => updateField("paperSize", v)}
            options={[
              { value: "A4", label: "A4 (210 x 297 mm)" },
              { value: "A5", label: "A5 (148 x 210 mm)" },
              { value: "POS", label: "POS (80mm)" },
              { value: "CUSTOM", label: "Custom" },
            ]}
          />
        </div>
        <div className="mt-4 space-y-0">
          <ToggleField
            label="Enable Print Preview"
            value={settings.printPreviewEnabled}
            onChange={(v) => updateField("printPreviewEnabled", v)}
            description="Show print preview dialog before printing invoices"
          />
        </div>
      </SectionCard>
    </div>
  );
}

function TaxConfigTab({ settings, updateField }: { settings: CompanySettings; updateField: <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => void }) {
  return (
    <div className="space-y-6">
      <SectionCard title="GST Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Default GST Percentage"
            value={settings.defaultGstPercentage != null ? String(settings.defaultGstPercentage) : ""}
            onChange={(v) => updateField("defaultGstPercentage", v ? parseFloat(v) : null)}
            type="number"
          />
        </div>
        <div className="mt-4 space-y-0">
          <ToggleField
            label="Enable GST"
            value={settings.gstEnabled}
            onChange={(v) => updateField("gstEnabled", v)}
            description="Enable GST calculations on invoices"
          />
          <ToggleField
            label="Enable IGST"
            value={settings.igstEnabled}
            onChange={(v) => updateField("igstEnabled", v)}
            description="Enable IGST for interstate transactions"
          />
          <ToggleField
            label="Round Off Totals"
            value={settings.roundOffEnabled}
            onChange={(v) => updateField("roundOffEnabled", v)}
            description="Round off invoice totals to nearest integer"
          />
          <ToggleField
            label="Allow Invoice GST Override"
            value={settings.allowInvoiceGstOverride}
            onChange={(v) => updateField("allowInvoiceGstOverride", v)}
            description="Allow GST rate override at invoice level"
          />
          <ToggleField
            label="Default HSN Required"
            value={settings.defaultHsnRequired}
            onChange={(v) => updateField("defaultHsnRequired", v)}
            description="Require HSN code for all products"
          />
          <ToggleField
            label="Allow Custom GST Rate"
            value={settings.allowCustomGstRate}
            onChange={(v) => updateField("allowCustomGstRate", v)}
            description="Allow custom GST rates different from master rates"
          />
        </div>
      </SectionCard>
    </div>
  );
}

function GeneralSettingsTab({ settings, updateField }: { settings: CompanySettings; updateField: <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => void }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Regional Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Currency"
            value={settings.currency}
            onChange={(v) => updateField("currency", v)}
            options={[
              { value: "INR", label: "INR - Indian Rupee" },
              { value: "USD", label: "USD - US Dollar" },
              { value: "EUR", label: "EUR - Euro" },
              { value: "GBP", label: "GBP - British Pound" },
              { value: "AED", label: "AED - UAE Dirham" },
            ]}
          />
          <InputField label="Currency Symbol" value={settings.currencySymbol} onChange={(v) => updateField("currencySymbol", v)} />
          <SelectField
            label="Date Format"
            value={settings.dateFormat}
            onChange={(v) => updateField("dateFormat", v)}
            options={[
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
            ]}
          />
          <SelectField
            label="Time Zone"
            value={settings.timeZone}
            onChange={(v) => updateField("timeZone", v)}
            options={[
              { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
              { value: "UTC", label: "UTC" },
              { value: "America/New_York", label: "America/New_York (EST)" },
              { value: "Europe/London", label: "Europe/London (GMT)" },
            ]}
          />
          <InputField label="Financial Year" value={settings.financialYear} onChange={(v) => updateField("financialYear", v)} placeholder="e.g., 2025-2026" />
          <SelectField
            label="Language"
            value={settings.language}
            onChange={(v) => updateField("language", v)}
            options={[
              { value: "en", label: "English" },
              { value: "hi", label: "Hindi" },
              { value: "ta", label: "Tamil" },
              { value: "te", label: "Telugu" },
              { value: "kn", label: "Kannada" },
              { value: "ml", label: "Malayalam" },
            ]}
          />
        </div>
      </SectionCard>
    </div>
  );
}

function ListsTab() {
  const [tableTypes, setTableTypes] = useState<string[]>([]);
  const [orderTypes, setOrderTypes] = useState<string[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/company/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const s = data.settings;
          if (Array.isArray(s.tableTypes)) setTableTypes(s.tableTypes);
          if (Array.isArray(s.orderTypes)) setOrderTypes(s.orderTypes);
          if (Array.isArray(s.productCategories)) setProductCategories(s.productCategories);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveLists = async (patch: Record<string, string[]>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/company/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (type: "tableTypes" | "orderTypes" | "productCategories", setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const name = prompt("Enter new item name:");
    if (!name || !name.trim()) return;
    const updated = [...(type === "tableTypes" ? tableTypes : type === "orderTypes" ? orderTypes : productCategories), name.trim()];
    setter(updated);
    await saveLists({ [type]: updated });
  };

  const handleDelete = async (type: "tableTypes" | "orderTypes" | "productCategories", setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => {
    const list = type === "tableTypes" ? tableTypes : type === "orderTypes" ? orderTypes : productCategories;
    const updated = list.filter((_, i) => i !== idx);
    setter(updated);
    await saveLists({ [type]: updated });
  };

  const handleRename = async (type: "tableTypes" | "orderTypes" | "productCategories", setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => {
    const list = type === "tableTypes" ? tableTypes : type === "orderTypes" ? orderTypes : productCategories;
    const current = list[idx];
    const newName = prompt("Rename item:", current);
    if (!newName || !newName.trim() || newName.trim() === current) return;
    const updated = list.map((v, i) => (i === idx ? newName.trim() : v));
    setter(updated);
    await saveLists({ [type]: updated });
  };

  const sections: { id: string; title: string; addLabel: string; type: "tableTypes" | "orderTypes" | "productCategories"; items: string[]; setter: React.Dispatch<React.SetStateAction<string[]>> }[] = [
    { id: "tables", title: "Tables / Table Types", addLabel: "Add Table", type: "tableTypes", items: tableTypes, setter: setTableTypes },
    { id: "order-type", title: "Order Type List", addLabel: "Add Order Type", type: "orderTypes", items: orderTypes, setter: setOrderTypes },
    { id: "product-category", title: "Product Category List", addLabel: "Add Product Category", type: "productCategories", items: productCategories, setter: setProductCategories },
  ];

  return (
    <div className="space-y-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Configuration saved!
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-12 text-center text-sm text-gray-500">
          Loading lists...
        </div>
      ) : sections.map((section) => (
        <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">{section.title}</h3>
            <button
              onClick={() => handleAdd(section.type, section.setter)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              <Plus size={14} />
              {section.addLabel}
            </button>
          </div>
          {section.items.length > 0 ? (
            <div className="border-t border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-6 py-3 text-left text-xs font-semibold w-16">S.NO</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold">NAME</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold w-32">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-700">{idx + 1}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{item}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRename(section.type, section.setter, idx)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">/</span>
                          <button
                            onClick={() => handleDelete(section.type, section.setter, idx)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border-t border-gray-100 px-6 py-4 text-sm text-gray-500 text-center">
              No items yet. Click &ldquo;{section.addLabel}&rdquo; to add one.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
