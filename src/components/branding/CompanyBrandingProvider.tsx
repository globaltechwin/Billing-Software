"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface CompanyBranding {
  companyName: string;
  shortCode: string;
  logo: string | null;
  profileImage: string | null;
  isOwner: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const DEFAULT_BRANDING: CompanyBranding = {
  companyName: "",
  shortCode: "",
  logo: null,
  profileImage: null,
  isOwner: false,
  isAdmin: false,
  loading: true,
};

const CompanyBrandingContext =
  createContext<CompanyBranding>(DEFAULT_BRANDING);

const BRAND_VARS: { field: string; cssVar: string }[] = [
  { field: "themePrimary", cssVar: "--billora-primary" },
  { field: "themePrimaryDark", cssVar: "--billora-primary-dark" },
  { field: "themeAccent", cssVar: "--billora-accent" },
  { field: "themeWarm", cssVar: "--billora-warm" },
  { field: "themeBgDark", cssVar: "--billora-bg-dark" },
  { field: "themeBgDarker", cssVar: "--billora-bg-darker" },
  { field: "themeCardDark", cssVar: "--billora-card-dark" },
  { field: "themeNavBg", cssVar: "--billora-nav-bg" },
];

function deriveShortCode(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "";
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return cleaned.slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export const BRANDING_UPDATED_EVENT = "billora:branding-updated";

export function CompanyBrandingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [branding, setBranding] =
    useState<CompanyBranding>(DEFAULT_BRANDING);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch("/api/company/settings")
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          const s = data?.settings ?? {};

          for (const { field, cssVar } of BRAND_VARS) {
            if (s[field]) {
              document.documentElement.style.setProperty(cssVar, s[field]);
            }
          }

          const role = data?.role ?? "";
          setBranding({
            companyName: s.companyName || "",
            shortCode: s.shortCode || deriveShortCode(s.companyName || ""),
            logo: s.logo || null,
            profileImage: data?.profileImage || null,
            isOwner: role === "Owner",
            isAdmin: role === "Owner" || role === "Admin",
            loading: false,
          });
        })
        .catch(() => {
          if (!cancelled) {
            setBranding((b) => ({ ...b, loading: false }));
          }
        });
    };

    load();
    window.addEventListener(BRANDING_UPDATED_EVENT, load);

    return () => {
      cancelled = true;
      window.removeEventListener(BRANDING_UPDATED_EVENT, load);
    };
  }, []);

  return (
    <CompanyBrandingContext.Provider value={branding}>
      {children}
    </CompanyBrandingContext.Provider>
  );
}

export function useCompanyBranding(): CompanyBranding {
  return useContext(CompanyBrandingContext);
}
