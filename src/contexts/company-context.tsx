"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  COMPANIES,
  DEFAULT_COMPANY_ID,
  COMPANY_IDS,
  type CompanyId,
  type CompanyProfile,
  type CompanyTheme,
} from "@/lib/companies";

interface CompanyContextType {
  companyId: CompanyId;
  company: CompanyProfile;
  setCompanyId: (id: CompanyId) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const STORAGE_KEY = "pulseorg-company";

function applyTheme(theme: CompanyTheme) {
  const root = document.documentElement;
  for (const [property, value] of Object.entries(theme)) {
    root.style.setProperty(property, value);
  }
}

function getInitialCompanyId(): CompanyId {
  if (typeof window === "undefined") return DEFAULT_COMPANY_ID;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && COMPANY_IDS.includes(stored as CompanyId)) {
      return stored as CompanyId;
    }
  } catch {}
  return DEFAULT_COMPANY_ID;
}

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companyId, setCompanyIdState] = useState<CompanyId>(DEFAULT_COMPANY_ID);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = getInitialCompanyId();
    setCompanyIdState(stored);
    setMounted(true);
  }, []);

  // Apply theme whenever companyId changes (only after mount)
  useEffect(() => {
    if (!mounted) return;
    const company = COMPANIES[companyId];
    applyTheme(company.theme);
    try {
      localStorage.setItem(STORAGE_KEY, companyId);
    } catch {}
  }, [companyId, mounted]);

  const setCompanyId = useCallback((id: CompanyId) => {
    setCompanyIdState(id);
  }, []);

  const company = COMPANIES[companyId];

  const value = useMemo(
    () => ({ companyId, company, setCompanyId }),
    [companyId, company, setCompanyId]
  );

  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
