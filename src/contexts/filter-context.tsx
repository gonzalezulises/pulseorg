"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { DemographicFilters, FilterContextType } from "@/types/segmentation";

const DEFAULT_FILTERS: DemographicFilters = {
  department: null,
  tenure: null,
  gender: null,
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<DemographicFilters>(DEFAULT_FILTERS);

  const updateFilter = useCallback(
    (key: keyof DemographicFilters, value: string | null) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "all" ? null : value,
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((v) => v !== null).length;
  }, [filters]);

  const value = useMemo(
    () => ({
      filters,
      setFilters,
      updateFilter,
      resetFilters,
      activeFilterCount,
    }),
    [filters, updateFilter, resetFilters, activeFilterCount]
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}

// Hook to check if any filter is active
export function useHasActiveFilters() {
  const { activeFilterCount } = useFilters();
  return activeFilterCount > 0;
}

// Hook to get filter summary text
export function useFilterSummary() {
  const { filters, activeFilterCount } = useFilters();

  if (activeFilterCount === 0) {
    return "Sin filtros aplicados";
  }

  const parts: string[] = [];

  if (filters.department) parts.push(`Área: ${filters.department}`);
  if (filters.tenure) parts.push(`Antigüedad: ${filters.tenure}`);
  if (filters.gender) parts.push(`Género: ${filters.gender}`);

  return parts.join(" | ");
}
