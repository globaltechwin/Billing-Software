"use client";

import { useState, useEffect } from "react";

interface GSTSettings {
  id: number;
  companyName: string;
  gstNumber: string;
  gstStateCode: string;
  stateName: string;
  gstEnabled: boolean;
  gstMode: string;
  roundOffEnabled: boolean;
  allowInvoiceGstOverride: boolean;
  defaultHsnRequired: boolean;
  allowCustomGstRate: boolean;
}

const GST_MODES = [
  { value: "GST_VISIBLE", label: "GST Visible", desc: "GST amount is shown separately on invoices" },
  { value: "GST_INCLUDED_HIDDEN", label: "GST Included (Hidden)", desc: "GST is included in price but not shown separately" },
  { value: "GST_ITEM_WISE", label: "Item Wise GST", desc: "Each item uses its own GST rate from product master" },
  { value: "NO_GST", label: "No GST", desc: "No GST calculation applied" },
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

export default function GSTSettingsPage() {
  const [settings, setSettings] = useState<GSTSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [gstNumber, setGstNumber] = useState("");
  const [gstStateCode, setGstStateCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstMode, setGstMode] = useState("GST_VISIBLE");
  const [roundOffEnabled, setRoundOffEnabled] = useState(false);
  const [allowInvoiceGstOverride, setAllowInvoiceGstOverride] = useState(false);
  const [defaultHsnRequired, setDefaultHsnRequired] = useState(false);
  const [allowCustomGstRate, setAllowCustomGstRate] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/company/gst-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const s = data.gstSettings;
          setSettings(s);
          setGstNumber(s.gstNumber || "");
          setGstStateCode(s.gstStateCode || "");
          setStateName(s.stateName || "");
          setGstEnabled(s.gstEnabled);
          setGstMode(s.gstMode);
          setRoundOffEnabled(s.roundOffEnabled);
          setAllowInvoiceGstOverride(s.allowInvoiceGstOverride);
          setDefaultHsnRequired(s.defaultHsnRequired);
          setAllowCustomGstRate(s.allowCustomGstRate);
        }
      })
      .catch(() => {
        console.error("Failed to fetch GST settings");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleStateChange = (code: string) => {
    setGstStateCode(code);
    const state = INDIAN_STATES.find((s) => s.code === code);
    setStateName(state ? state.name : "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/company/gst-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gstNumber: gstNumber || null,
          gstStateCode: gstStateCode || null,
          stateName,
          gstEnabled,
          gstMode,
          roundOffEnabled,
          allowInvoiceGstOverride,
          defaultHsnRequired,
          allowCustomGstRate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save settings");
        return;
      }
      setSettings(data.gstSettings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch {
      alert("Failed to save GST settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-sm text-gray-500">
          Loading GST settings...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          GST settings saved successfully!
        </div>
      )}

      {/* Company GST Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Company GST Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
            <div className="lg:col-span-2">
              <label className="block text-sm text-gray-700 font-medium mb-1">GST Number</label>
              <input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 33ABCDE1234F1Z5" maxLength={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono" />
              <p className="text-xs text-gray-400 mt-1">15-digit GSTIN (2 digit state code + PAN + 1 char + Z + 1 digit)</p>
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">State</label>
              <select value={gstStateCode} onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">-- Select State --</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Company Name</label>
              <input type="text" value={settings?.companyName || ""} disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">State Name</label>
              <input type="text" value={stateName} disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
          </div>
        </div>
      </div>

      {/* GST Mode */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">GST Mode</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3 max-w-5xl">
            {GST_MODES.map((mode) => (
              <label key={mode.value} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${gstMode === mode.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                <input type="radio" name="gstMode" value={mode.value} checked={gstMode === mode.value}
                  onChange={(e) => setGstMode(e.target.value)} className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <div>
                  <span className="text-sm font-medium text-gray-800">{mode.label}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{mode.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Invoice & Product Settings</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4 max-w-5xl">
            <ToggleSetting
              label="Enable GST"
              description="Master switch to enable/disable GST calculations for this company"
              checked={gstEnabled}
              onChange={setGstEnabled}
            />
            <ToggleSetting
              label="Round Off Invoice Total"
              description="Automatically round off the invoice grand total to the nearest rupee"
              checked={roundOffEnabled}
              onChange={setRoundOffEnabled}
            />
            <ToggleSetting
              label="Allow GST Override on Invoices"
              description="Allow users to manually change GST rates at the time of invoicing"
              checked={allowInvoiceGstOverride}
              onChange={setAllowInvoiceGstOverride}
            />
            <ToggleSetting
              label="Require HSN/SAC for Products"
              description="Make HSN/SAC code mandatory when creating new products"
              checked={defaultHsnRequired}
              onChange={setDefaultHsnRequired}
            />
            <ToggleSetting
              label="Allow Custom GST Rates"
              description="Allow creation of custom GST rates beyond the standard ones"
              checked={allowCustomGstRate}
              onChange={setAllowCustomGstRate}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={handleSave} disabled={saving}
          className="px-8 py-2.5 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="flex items-center justify-between py-2 text-xs text-gray-400">
        <span>&copy; 2025 - POS - V5.06.Nov</span>
        <span className="text-emerald-600 font-medium">LICENSE DATE 01/01/2030</span>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div>
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-blue-500" : "bg-gray-300"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}
