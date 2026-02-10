"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_CONFIG, DASHBOARD_CONFIG } from "@/lib/constants";
import type {
  DimensionStatsParams,
  ItemStatsParams,
  DashboardKPIs,
  DimensionStatistics,
  TrendsParams,
  AlertsParams,
} from "@/types/api";

// Query keys para React Query
export const queryKeys = {
  health: ["health"] as const,
  healthDetail: ["health", "detail"] as const,
  dimensions: (params?: DimensionStatsParams) =>
    ["statistics", "dimensions", params] as const,
  items: (params?: ItemStatsParams) =>
    ["statistics", "items", params] as const,
  trends: (params?: TrendsParams) =>
    ["statistics", "trends", params] as const,
  alerts: (params?: AlertsParams) =>
    ["statistics", "alerts", params] as const,
};

// Hook para verificar salud de la API
export function useHealthCheck() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.health.check(),
    ...QUERY_CONFIG,
    staleTime: 30 * 1000, // 30 segundos para health check
  });
}

// Hook para estadísticas de dimensiones
export function useDimensionStats(params?: DimensionStatsParams) {
  return useQuery({
    queryKey: queryKeys.dimensions(params),
    queryFn: () => apiClient.statistics.dimensions(params),
    ...QUERY_CONFIG,
  });
}

// Hook para estadísticas de items
export function useItemStats(params?: ItemStatsParams) {
  return useQuery({
    queryKey: queryKeys.items(params),
    queryFn: () => apiClient.statistics.items(params),
    ...QUERY_CONFIG,
  });
}

// Hook para tendencias
export function useTrends(params?: TrendsParams) {
  return useQuery({
    queryKey: queryKeys.trends(params),
    queryFn: () => apiClient.statistics.trends(params),
    ...QUERY_CONFIG,
  });
}

// Hook para alertas
export function useAlerts(params?: AlertsParams) {
  return useQuery({
    queryKey: queryKeys.alerts(params),
    queryFn: () => apiClient.statistics.alerts(params),
    ...QUERY_CONFIG,
  });
}

// Hook para obtener KPIs del dashboard
export function useDashboardKPIs(year: number = DASHBOARD_CONFIG.defaultYear) {
  const currentYearQuery = useDimensionStats({ year });
  const previousYearQuery = useDimensionStats({ year: year - 1 });
  const alertsQuery = useAlerts({ severity: "critical" });

  const isLoading =
    currentYearQuery.isLoading ||
    previousYearQuery.isLoading ||
    alertsQuery.isLoading;
  const isError =
    currentYearQuery.isError ||
    previousYearQuery.isError ||
    alertsQuery.isError;

  // Calcular KPIs
  let kpis: DashboardKPIs | null = null;

  if (currentYearQuery.data) {
    const currentData = currentYearQuery.data;
    const previousData = previousYearQuery.data;

    // Calcular favorabilidad global (promedio de todas las dimensiones)
    const globalFavorability =
      currentData.length > 0
        ? currentData.reduce((sum, d) => sum + d.favorability_pct, 0) /
          currentData.length
        : 0;

    // Calcular total de respuestas (máximo entre dimensiones)
    const totalResponses =
      currentData.length > 0
        ? Math.max(...currentData.map((d) => d.total_responses))
        : 0;

    // Calcular cambio año a año
    let yearOverYearChange = 0;
    if (previousData && previousData.length > 0) {
      const previousFavorability =
        previousData.reduce((sum, d) => sum + d.favorability_pct, 0) /
        previousData.length;
      yearOverYearChange = globalFavorability - previousFavorability;
    }

    kpis = {
      globalFavorability: Math.round(globalFavorability * 10) / 10,
      totalResponses,
      dimensionsAnalyzed: currentData.length,
      criticalAlerts: alertsQuery.data?.length || 0,
      yearOverYearChange: Math.round(yearOverYearChange * 10) / 10,
    };
  }

  return {
    data: kpis,
    isLoading,
    isError,
    dimensionData: currentYearQuery.data,
    alertsData: alertsQuery.data,
  };
}

// Helper para preparar datos del gráfico radar
export function prepareRadarData(dimensions: DimensionStatistics[]) {
  return dimensions.map((d) => ({
    dimension: d.dimension,
    favorability: d.favorability_pct,
    score: d.score_mean,
    responses: d.total_responses,
  }));
}
