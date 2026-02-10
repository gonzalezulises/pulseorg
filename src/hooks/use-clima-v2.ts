"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_CONFIG, DASHBOARD_CONFIG } from "@/lib/constants";
import { useCompany } from "@/contexts/company-context";
import type {
  ClimaDataV2,
  YearData,
  DimensionStatV2,
  EngagementData,
} from "@/types/clima-v2";

// Query keys para React Query V2
export const queryKeysV2 = {
  climaData: (companyId: string) => ["clima", "v2", "data", companyId] as const,
  yearData: (companyId: string, year: number) => ["clima", "v2", "year", companyId, year] as const,
  dimensions: (companyId: string, year: number) => ["clima", "v2", "dimensions", companyId, year] as const,
  engagement: (companyId: string, year: number) => ["clima", "v2", "engagement", companyId, year] as const,
};

// Hook principal para cargar todos los datos V2
export function useClimaDataV2() {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: queryKeysV2.climaData(companyId),
    queryFn: async (): Promise<ClimaDataV2> => {
      const response = await fetch(`/data/${companyId}/clima_v2_data.json`);
      if (!response.ok) {
        throw new Error(`Error cargando datos: ${response.status}`);
      }
      return response.json();
    },
    ...QUERY_CONFIG,
    staleTime: Infinity,
  });
}

// Hook para obtener datos de un año específico
export function useYearDataV2(year: number) {
  const { data, isLoading, isError, error } = useClimaDataV2();

  const yearData = data?.years?.[String(year)] || null;

  return {
    data: yearData,
    isLoading,
    isError,
    error,
  };
}

// Hook para estadísticas de dimensiones V2
export function useDimensionStatsV2(params?: { year?: number }) {
  const year = params?.year || DASHBOARD_CONFIG.defaultYear;
  const { data, isLoading, isError, error } = useYearDataV2(year);

  return {
    data: data?.dimensions || null,
    isLoading,
    isError,
    error,
  };
}

// Hook para datos de engagement V2
export function useEngagementV2(year: number = DASHBOARD_CONFIG.defaultYear) {
  const { data, isLoading, isError, error } = useYearDataV2(year);

  return {
    data: data?.engagement || null,
    isLoading,
    isError,
    error,
  };
}

// KPIs del dashboard V2
export interface DashboardKPIsV2 {
  engagementScore: number;
  engagementPct: number;
  totalResponses: number;
  dimensionsAnalyzed: number;
  criticalDimensions: number;
  yearOverYearChange: number;
  topDimension: DimensionStatV2 | null;
  bottomDimension: DimensionStatV2 | null;
}

// Hook para KPIs del dashboard V2
export function useDashboardKPIsV2(year: number = DASHBOARD_CONFIG.defaultYear) {
  const currentYearQuery = useYearDataV2(year);
  const previousYearQuery = useYearDataV2(year - 1);

  const isLoading = currentYearQuery.isLoading || previousYearQuery.isLoading;
  const isError = currentYearQuery.isError || previousYearQuery.isError;

  let kpis: DashboardKPIsV2 | null = null;

  if (currentYearQuery.data) {
    const currentData = currentYearQuery.data;
    const previousData = previousYearQuery.data;

    // Engagement
    const engagement = currentData.engagement;
    const engagementScore = engagement?.engagement_score || 0;
    const engagementPct = engagement?.engagement_pct || 0;

    // Dimensiones críticas (en estado "crisis" o "atencion")
    // Excluir dimensiones con solo 1 ítem (no son dimensiones completas)
    const criticalDimensions =
      currentData.dimensions?.filter(
        (d) => (d.segment === "crisis" || d.segment === "atencion") && d.item_count > 1
      ).length || 0;

    // Top y bottom dimensiones
    const sortedDimensions = [...(currentData.dimensions || [])].sort(
      (a, b) => b.avg_score - a.avg_score
    );
    const topDimension = sortedDimensions[0] || null;
    const bottomDimension = sortedDimensions[sortedDimensions.length - 1] || null;

    // Cambio año a año (basado en engagement)
    let yearOverYearChange = 0;
    if (previousData?.engagement) {
      yearOverYearChange =
        engagementPct - previousData.engagement.engagement_pct;
    }

    kpis = {
      engagementScore,
      engagementPct,
      totalResponses: currentData.respondent_count,
      dimensionsAnalyzed: currentData.dimensions?.length || 0,
      criticalDimensions,
      yearOverYearChange: Math.round(yearOverYearChange * 10) / 10,
      topDimension,
      bottomDimension,
    };
  }

  return {
    data: kpis,
    isLoading,
    isError,
    currentYearData: currentYearQuery.data,
    previousYearData: previousYearQuery.data,
  };
}

// Hook para comparación entre años
export function useYearComparisonV2(currentYear: number, previousYear: number) {
  const currentQuery = useYearDataV2(currentYear);
  const previousQuery = useYearDataV2(previousYear);

  const isLoading = currentQuery.isLoading || previousQuery.isLoading;
  const isError = currentQuery.isError || previousQuery.isError;

  // Preparar datos de comparación
  let comparisonData: {
    dimension_code: string;
    dimension_name: string;
    current_score: number;
    previous_score: number;
    change: number;
    current_segment: string;
    previous_segment: string;
  }[] = [];

  if (currentQuery.data?.dimensions && previousQuery.data?.dimensions) {
    const previousMap = new Map(
      previousQuery.data.dimensions.map((d) => [d.dimension_code, d])
    );

    comparisonData = currentQuery.data.dimensions.map((current) => {
      const previous = previousMap.get(current.dimension_code);
      return {
        dimension_code: current.dimension_code,
        dimension_name: current.dimension_name,
        current_score: current.avg_score,
        previous_score: previous?.avg_score || 0,
        change: previous ? current.avg_score - previous.avg_score : 0,
        current_segment: current.segment,
        previous_segment: previous?.segment || "unknown",
      };
    });
  }

  return {
    data: comparisonData,
    isLoading,
    isError,
    currentYear: currentQuery.data,
    previousYear: previousQuery.data,
  };
}

// Helper para preparar datos del radar V2
export function prepareRadarDataV2(dimensions: DimensionStatV2[]) {
  return dimensions.map((d) => ({
    dimension: d.dimension_name,
    dimension_code: d.dimension_code,
    score: d.avg_score,
    favorability: d.favorability_pct,
    benchmark: d.benchmark,
    segment: d.segment,
    fullMark: 5,
  }));
}

// Helper para preparar datos de perfiles de engagement
export function prepareProfileDataV2(engagement: EngagementData | null) {
  if (!engagement) return [];

  return Object.entries(engagement.profiles).map(([name, data]) => ({
    name,
    value: data.n,
    pct: data.pct,
  }));
}

// Alertas V2 (generadas desde dimensiones críticas)
export interface AlertV2 {
  id: string;
  dimension_code: string;
  dimension_name: string;
  severity: "critical" | "warning" | "info";
  score: number;
  benchmark: number;
  gap: number;
  segment: string;
  description: string;
  recommendation: string;
}

// Hook para alertas V2
export function useAlertsV2(params?: { limit?: number }) {
  const { data, isLoading, isError } = useYearDataV2(DASHBOARD_CONFIG.defaultYear);

  let alerts: AlertV2[] = [];

  if (data?.dimensions) {
    alerts = data.dimensions
      .filter((d) => d.segment === "crisis" || d.segment === "atencion")
      .map((d): AlertV2 => ({
        id: `${d.year}-${d.dimension_code}`,
        dimension_code: d.dimension_code,
        dimension_name: d.dimension_name,
        severity: d.segment === "crisis" ? "critical" : "warning",
        score: d.avg_score,
        benchmark: d.benchmark,
        gap: d.gap_vs_benchmark,
        segment: d.segment,
        description:
          d.segment === "crisis"
            ? `${d.dimension_name} está en zona crítica con ${d.avg_score.toFixed(2)}/5.00`
            : `${d.dimension_name} requiere atención con ${d.avg_score.toFixed(2)}/5.00`,
        recommendation:
          d.segment === "crisis"
            ? `Priorizar intervención inmediata en ${d.dimension_name}`
            : `Monitorear y desarrollar plan de mejora para ${d.dimension_name}`,
      }))
      .sort((a, b) => a.score - b.score);

    if (params?.limit) {
      alerts = alerts.slice(0, params.limit);
    }
  }

  return {
    data: alerts,
    isLoading,
    isError,
  };
}
