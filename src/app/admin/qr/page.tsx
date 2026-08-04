"use client";

import { useCallback, useEffect, useState } from "react";

interface PaymentSettingsData {
  id: number;
  merchantName: string;
  upiId: string;
  qrEnabled: boolean;
  branchId: number | null;
  branchName: string;
  isActive: boolean;
}

export default function QRCodePage() {
  const [settings, setSettings] = useState<PaymentSettingsData | null>(null);
  const [merchantName, setMerchantName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [qrEnabled, setQrEnabled] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (d.settings) {
          setSettings(d.settings);
          setMerchantName(d.settings.merchantName);
          setUpiId(d.settings.upiId);
          setQrEnabled(d.settings.qrEnabled);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = useCallback(async () => {
    setSettingsMsg("");
    if (!merchantName.trim()) { setSettingsMsg("Merchant name is required"); return; }
    if (!upiId.trim()) { setSettingsMsg("UPI ID is required"); return; }
    if (!/^[\w.\-]+@[\w]+$/.test(upiId.trim())) { setSettingsMsg("Invalid UPI ID format (e.g., name@bank)"); return; }

    setSavingSettings(true);
    try {
      const method = settings ? "PATCH" : "POST";
      const body = settings
        ? { id: settings.id, merchantName: merchantName.trim(), upiId: upiId.trim(), qrEnabled }
        : { merchantName: merchantName.trim(), upiId: upiId.trim(), qrEnabled };
      const res = await fetch("/api/payment-settings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSettings(data.settings);
      setSettingsMsg("Settings saved successfully");
    } catch (err) {
      setSettingsMsg(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingSettings(false);
    }
  }, [merchantName, upiId, qrEnabled, settings]);

  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Payment Settings Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Payment Settings</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Merchant Name *</label>
              <input type="text" value={merchantName} onChange={(e) => setMerchantName(e.target.value)}
                placeholder="Enter merchant name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">UPI ID *</label>
              <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g., merchant@bank"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={qrEnabled} onChange={(e) => setQrEnabled(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                <span className="text-sm font-semibold text-gray-700">QR Enabled</span>
              </label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleSaveSettings} disabled={savingSettings}
              className="px-5 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50">
              {savingSettings ? "Saving..." : "Save Settings"}
            </button>
            {settingsMsg && (
              <span className={`text-sm ${settingsMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {settingsMsg}
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
