"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Sparkles, RefreshCw } from "lucide-react";
import {
  BRANDING_UPDATED_EVENT,
  useCompanyBranding,
} from "@/components/branding/CompanyBrandingProvider";

interface BrandForm {
  shortCode: string;
  themePrimary: string;
  themePrimaryDark: string;
  themeAccent: string;
  themeWarm: string;
  themeBgDark: string;
  themeBgDarker: string;
  themeCardDark: string;
  themeNavBg: string;
}

const FALLBACK_FORM: BrandForm = {
  shortCode: "",
  themePrimary: "#e05a3a",
  themePrimaryDark: "#c94025",
  themeAccent: "#f07850",
  themeWarm: "#b83a2a",
  themeBgDark: "#2a0e0e",
  themeBgDarker: "#1a0808",
  themeCardDark: "#3d1616",
  themeNavBg: "#0f172a",
};

const COLOR_FIELDS: {
  key: keyof BrandForm;
  label: string;
  group: string;
}[] = [
  { key: "themePrimary", label: "Primary", group: "Core" },
  { key: "themePrimaryDark", label: "Primary Dark", group: "Core" },
  { key: "themeAccent", label: "Accent", group: "Core" },
  { key: "themeWarm", label: "Warm", group: "Core" },
  { key: "themeNavBg", label: "Navigation Bar", group: "Dark Surfaces" },
  { key: "themeBgDark", label: "Dark Background", group: "Dark Surfaces" },
  { key: "themeBgDarker", label: "Darker Background", group: "Dark Surfaces" },
  { key: "themeCardDark", label: "Dark Card", group: "Dark Surfaces" },
];

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export default function CompanyBrandingPage() {
  const { isAdmin, loading: brandingLoading } = useCompanyBranding();
  const [form, setForm] = useState<BrandForm>(FALLBACK_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/company/settings")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (!data?.success) {
          setError(data?.error || "Failed to load settings");
          return;
        }
        const s = data.settings ?? {};
        setForm({
          shortCode: s.shortCode || "",
          themePrimary: s.themePrimary || FALLBACK_FORM.themePrimary,
          themePrimaryDark: s.themePrimaryDark || FALLBACK_FORM.themePrimaryDark,
          themeAccent: s.themeAccent || FALLBACK_FORM.themeAccent,
          themeWarm: s.themeWarm || FALLBACK_FORM.themeWarm,
          themeBgDark: s.themeBgDark || FALLBACK_FORM.themeBgDark,
          themeBgDarker: s.themeBgDarker || FALLBACK_FORM.themeBgDarker,
          themeCardDark: s.themeCardDark || FALLBACK_FORM.themeCardDark,
          themeNavBg: s.themeNavBg || FALLBACK_FORM.themeNavBg,
        });
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load settings");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = <K extends keyof BrandForm>(key: K, value: BrandForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    if (!form.shortCode.trim()) {
      alert("Short code is required");
      return;
    }
    for (const { key } of COLOR_FIELDS) {
      if (!isHexColor(form[key])) {
        alert(`Invalid color for "${key}"`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/company/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortCode: form.shortCode.trim().toUpperCase().slice(0, 5),
          themePrimary: form.themePrimary,
          themePrimaryDark: form.themePrimaryDark,
          themeAccent: form.themeAccent,
          themeWarm: form.themeWarm,
          themeBgDark: form.themeBgDark,
          themeBgDarker: form.themeBgDarker,
          themeCardDark: form.themeCardDark,
          themeNavBg: form.themeNavBg,
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new CustomEvent(BRANDING_UPDATED_EVENT));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
      } else {
        alert(data.error || "Failed to save branding");
      }
    } catch {
      alert("Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  if (loading || brandingLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-billora-primary" />
          <p className="text-sm text-gray-600">Loading branding...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-md">
          <p className="text-sm text-gray-600 mb-2">
            Only company owners/admins can configure branding.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Branding saved successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Form */}
        <div className="xl:col-span-3 space-y-5">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f2f5f9] px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Company Branding
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Customize how your company appears across the app
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-billora-primary text-white rounded-md text-sm font-medium hover:bg-billora-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Identity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Identity
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.shortCode}
                maxLength={5}
                onChange={(e) => setField("shortCode", e.target.value.toUpperCase())}
                placeholder="e.g. AHS"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-billora-primary/20 focus:border-billora-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Shown in the header and logo tile (2-5 characters).
              </p>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={15} className="text-billora-primary" />
              <h3 className="text-sm font-semibold text-gray-800">
                Brand Colors
              </h3>
            </div>
            {(["Core", "Dark Surfaces"] as const).map((group) => (
              <div key={group} className="mb-5 last:mb-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  {group}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {COLOR_FIELDS.filter((f) => f.group === group).map((f) => (
                    <div
                      key={f.key}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <input
                        type="color"
                        value={isHexColor(form[f.key]) ? form[f.key] : "#000000"}
                        onChange={(e) => setField(f.key, e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-medium text-gray-700">
                          {f.label}
                        </label>
                        <input
                          type="text"
                          value={form[f.key]}
                          onChange={(e) => setField(f.key, e.target.value)}
                          className="w-full mt-0.5 px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-billora-primary/20 focus:border-billora-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
            <div className="bg-[#f2f5f9] px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Live Preview
              </h3>
              <RefreshCw size={13} className="text-gray-400" />
            </div>
            <div className="p-5 bg-[#f0f4f8]">
              <BrandPreview form={form} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandPreview({ form }: { form: BrandForm }) {
  const tileCode = form.shortCode.slice(0, 2) || "B";
  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
      {/* Chrome preview: sidebar + header */}
      <div className="flex">
        {/* Mini sidebar */}
        <div
          className="w-12 flex flex-col items-center py-3 gap-2"
          style={{ backgroundColor: form.themeNavBg }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: form.themePrimary }}
          >
            <span className="text-white font-bold text-[8px] leading-none">
              {tileCode}
            </span>
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-5 h-5 rounded"
              style={{ backgroundColor: `${form.themeNavBg}`, border: "1px solid rgba(255,255,255,0.15)" }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white">
          {/* Mini header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${form.themeAccent} 0%, ${form.themePrimary} 60%, ${form.themePrimaryDark} 100%)`,
                }}
              >
                <span className="text-white font-bold text-[6px] leading-none">
                  {form.shortCode ? form.shortCode.slice(0, 3) : "B"}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-gray-700">
                {form.shortCode || "Company"}
              </span>
            </div>
            <div
              className="px-2 py-1 rounded text-[8px] font-semibold text-white"
              style={{
                background: `linear-gradient(90deg, ${form.themePrimary} 0%, ${form.themeAccent} 100%)`,
              }}
            >
              Save
            </div>
          </div>

          {/* Mock content */}
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: form.themePrimary }}
              >
                <span className="text-white font-bold text-[10px]">
                  {form.shortCode ? form.shortCode.slice(0, 3) : "B"}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-800">
                  {form.shortCode || "Company"} · Dashboard
                </p>
                <p className="text-[8px] text-gray-500">System date · 27/07/2026</p>
              </div>
            </div>
            <div
              className="rounded-lg p-2 text-white"
              style={{ backgroundColor: form.themePrimary }}
            >
              <p className="text-[9px] font-semibold">Primary Button</p>
            </div>
            <div
              className="rounded-lg p-2 text-white"
              style={{
                background: `linear-gradient(135deg, ${form.themePrimary} 0%, ${form.themePrimaryDark} 100%)`,
              }}
            >
              <p className="text-[9px] font-semibold">Gradient Surface</p>
            </div>

            {/* Swatch legend */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {COLOR_FIELDS.map((f) => (
                <div
                  key={f.key}
                  className="flex items-center gap-1.5 rounded px-1.5 py-1"
                  style={{ backgroundColor: form[f.key] }}
                >
                  <span className="text-white text-[7px] font-medium truncate flex-1">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
