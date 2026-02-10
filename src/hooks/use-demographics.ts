"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_CONFIG, DASHBOARD_CONFIG } from "@/lib/constants";
import { useCompany } from "@/contexts/company-context";
import type {
  DemographicsJSON,
  YearDemographicsData,
  FichaTecnica,
  DemographicsData,
  ENPSData,
  EvaluatedItem,
} from "@/types/demographics";

// Query keys
export const demographicsQueryKeys = {
  all: (companyId: string) => ["demographics", companyId] as const,
  year: (companyId: string, year: number) => ["demographics", companyId, "year", year] as const,
};

// Hook principal para cargar todos los datos demográficos
export function useDemographicsData() {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: demographicsQueryKeys.all(companyId),
    queryFn: async (): Promise<DemographicsJSON> => {
      const response = await fetch(`/data/${companyId}/clima_demographics.json`);
      if (!response.ok) {
        throw new Error(`Error cargando datos demográficos: ${response.status}`);
      }
      return response.json();
    },
    ...QUERY_CONFIG,
    staleTime: Infinity,
  });
}

// Hook para obtener datos de un año específico
export function useYearDemographics(year: number = DASHBOARD_CONFIG.defaultYear) {
  const { data, isLoading, isError, error } = useDemographicsData();

  const yearData = data?.years?.[String(year)] || null;

  return {
    data: yearData,
    isLoading,
    isError,
    error,
  };
}

// Hook para ficha técnica
export function useFichaTecnica(year: number = DASHBOARD_CONFIG.defaultYear) {
  const { data, isLoading, isError, error } = useYearDemographics(year);

  return {
    data: data?.ficha_tecnica || null,
    isLoading,
    isError,
    error,
  };
}

// Hook para datos demográficos
export function useDemographicsStats(year: number = DASHBOARD_CONFIG.defaultYear) {
  const { data, isLoading, isError, error } = useYearDemographics(year);

  return {
    data: data?.demographics || null,
    isLoading,
    isError,
    error,
  };
}

// Hook para eNPS
export function useENPS(year: number = DASHBOARD_CONFIG.defaultYear) {
  const { data, isLoading, isError, error } = useYearDemographics(year);

  return {
    data: data?.enps || null,
    isLoading,
    isError,
    error,
  };
}

// Hook para Top/Bottom items
export function useTopBottomItems(year: number = DASHBOARD_CONFIG.defaultYear) {
  const { data, isLoading, isError, error } = useYearDemographics(year);

  return {
    topItems: data?.top_5_items || [],
    bottomItems: data?.bottom_5_items || [],
    isLoading,
    isError,
    error,
  };
}

// Hook para comparación de ficha técnica entre años
export function useFichaTecnicaComparison() {
  const { data, isLoading, isError, error } = useDemographicsData();

  const comparison: {
    year: number;
    population_n: number;
    sample_n: number;
    response_rate: number;
    margin_of_error: number;
  }[] = [];

  if (data?.years) {
    Object.entries(data.years)
      .sort(([a], [b]) => Number(a) - Number(b))
      .forEach(([year, yearData]) => {
        comparison.push({
          year: Number(year),
          ...yearData.ficha_tecnica,
        });
      });
  }

  return {
    data: comparison,
    isLoading,
    isError,
    error,
  };
}

// Helper para preparar datos de género para gráficos
export function prepareGenderChartData(demographics: DemographicsData | null) {
  if (!demographics) return [];

  return Object.entries(demographics.genders)
    .filter(([key]) => key !== "Sin especificar")
    .map(([name, value]) => ({
      name,
      value,
      pct: 0, // Se calculará después
    }));
}

// Helper para preparar datos de antigüedad para gráficos
export function prepareTenureChartData(demographics: DemographicsData | null) {
  if (!demographics) return [];

  const order = ["<1 año", "1-3 años", "3-5 años", "5-7 años", ">7 años"];

  return order
    .filter((key) => demographics.tenures[key])
    .map((name) => ({
      name,
      value: demographics.tenures[name] || 0,
      pct: 0,
    }));
}

// Helper para preparar datos de departamento para gráficos
export function prepareDepartmentChartData(demographics: DemographicsData | null) {
  if (!demographics) return [];

  return Object.entries(demographics.departments)
    .filter(([key]) => key !== "Sin especificar")
    .map(([name, value]) => ({
      name,
      value,
      pct: 0,
    }))
    .sort((a, b) => b.value - a.value);
}
