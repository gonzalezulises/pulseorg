"use client";

import { useMemo } from "react";
import { useFilters } from "@/contexts/filter-context";
import { useClimaDataV2, useDashboardKPIsV2 } from "./use-clima-v2";
import { useSegmentationData } from "./use-segmentation";
import type { DimensionStatV2 } from "@/types/clima-v2";
import type { DemographicFilters, SegmentStats, SegmentDimensionScore } from "@/types/segmentation";
import { DASHBOARD_CONFIG } from "@/lib/constants";

/**
 * Find the matching segment based on filters
 */
function findMatchingSegment(
  filters: DemographicFilters,
  segmentationData: {
    by_department: SegmentStats[];
    by_tenure: SegmentStats[];
    by_gender: SegmentStats[];
  } | null
): SegmentStats | null {
  if (!segmentationData) return null;

  // Priority: department > tenure > gender
  if (filters.department) {
    return segmentationData.by_department.find(
      (s) => s.segment_id === filters.department
    ) || null;
  }
  if (filters.tenure) {
    return segmentationData.by_tenure.find(
      (s) => s.segment_id === filters.tenure
    ) || null;
  }
  if (filters.gender) {
    return segmentationData.by_gender.find(
      (s) => s.segment_id === filters.gender
    ) || null;
  }

  return null;
}

/**
 * Convert segment dimension scores to DimensionStatV2 format
 */
function convertToDimensionStats(
  segmentDimensions: SegmentDimensionScore[],
  originalDimensions: DimensionStatV2[] | undefined,
  year: number
): DimensionStatV2[] {
  if (!originalDimensions) return [];

  // Map segment dimensions and sort by score to calculate ranks
  const mappedDimensions = segmentDimensions.map((segDim) => {
    // Find original dimension to get benchmark and other metadata
    const original = originalDimensions.find(
      (d) => d.dimension_code === segDim.dimension_code
    );

    // Calculate segment based on score using correct segment types
    let segment: "fortaleza_excepcional" | "fortaleza_solida" | "aceptable" | "atencion" | "crisis";
    if (segDim.avg_score >= 4.5) segment = "fortaleza_excepcional";
    else if (segDim.avg_score >= 4.2) segment = "fortaleza_solida";
    else if (segDim.avg_score >= 4.0) segment = "aceptable";
    else if (segDim.avg_score >= 3.5) segment = "atencion";
    else segment = "crisis";

    return {
      year,
      dimension_code: segDim.dimension_code as DimensionStatV2["dimension_code"],
      dimension_name: segDim.dimension_name,
      avg_score: segDim.avg_score,
      std_score: original?.std_score || 0,
      favorability_pct: segDim.favorability_pct,
      benchmark: original?.benchmark || 4.25,
      gap_vs_benchmark: segDim.gap_vs_global,
      segment,
      item_count: original?.item_count || 3,
      respondent_count: original?.respondent_count || 0,
      rank: 0, // Will be calculated below
    };
  });

  // Calculate ranks based on scores (highest score = rank 1)
  const sortedByScore = [...mappedDimensions].sort((a, b) => b.avg_score - a.avg_score);
  sortedByScore.forEach((dim, idx) => {
    const found = mappedDimensions.find((d) => d.dimension_code === dim.dimension_code);
    if (found) {
      found.rank = idx + 1;
    }
  });

  return mappedDimensions;
}

/**
 * Hook to get filtered dimension stats based on demographic filters
 */
export function useFilteredDimensionStats(year: number = DASHBOARD_CONFIG.defaultYear) {
  const { filters, activeFilterCount } = useFilters();
  const { data: climaData, isLoading: climaLoading, isError: climaError } = useClimaDataV2();
  const { data: segmentationData, isLoading: segLoading, isError: segError } = useSegmentationData();

  const filteredData = useMemo(() => {
    if (!climaData) return null;

    const yearData = climaData.years?.[String(year)];
    if (!yearData?.dimensions) return null;

    // If no filters, return original data
    if (activeFilterCount === 0) {
      return yearData.dimensions;
    }

    // Find matching segment
    const matchingSegment = findMatchingSegment(filters, segmentationData || null);

    if (!matchingSegment || !matchingSegment.dimensions || matchingSegment.dimensions.length === 0) {
      return yearData.dimensions;
    }

    // Convert segment dimensions to the expected format
    return convertToDimensionStats(
      matchingSegment.dimensions,
      yearData.dimensions,
      year
    );
  }, [climaData, segmentationData, filters, activeFilterCount, year]);

  return {
    data: filteredData,
    isLoading: climaLoading || segLoading,
    isError: climaError || segError,
    hasFilters: activeFilterCount > 0,
  };
}

/**
 * Hook to get filtered engagement data
 */
export function useFilteredEngagement(year: number = DASHBOARD_CONFIG.defaultYear) {
  const { filters, activeFilterCount } = useFilters();
  const { data: climaData, isLoading: climaLoading, isError: climaError } = useClimaDataV2();
  const { data: segmentationData, isLoading: segLoading, isError: segError } = useSegmentationData();

  const filteredData = useMemo(() => {
    if (!climaData) return null;

    const yearData = climaData.years?.[String(year)];
    if (!yearData?.engagement) return null;

    // If no filters, return original data
    if (activeFilterCount === 0) {
      return yearData.engagement;
    }

    // Find matching segment
    const matchingSegment = findMatchingSegment(filters, segmentationData || null);

    if (!matchingSegment) {
      return yearData.engagement;
    }

    // Create modified engagement data based on segment
    return {
      ...yearData.engagement,
      engagement_score: matchingSegment.engagement_score,
      engagement_pct: matchingSegment.engagement_pct,
      // Scale profiles based on respondent count
      profiles: yearData.engagement.profiles,
    };
  }, [climaData, segmentationData, filters, activeFilterCount, year]);

  return {
    data: filteredData,
    isLoading: climaLoading || segLoading,
    isError: climaError || segError,
    hasFilters: activeFilterCount > 0,
  };
}

/**
 * Hook to get filtered KPIs for the dashboard
 */
export function useFilteredDashboardKPIs(year: number = DASHBOARD_CONFIG.defaultYear) {
  const { filters, activeFilterCount } = useFilters();
  const { data: originalKPIs, isLoading: kpiLoading, isError: kpiError } = useDashboardKPIsV2(year);
  const { data: segmentationData, isLoading: segLoading, isError: segError } = useSegmentationData();
  const { data: filteredDimensions } = useFilteredDimensionStats(year);

  const filteredKPIs = useMemo(() => {
    if (!originalKPIs) return null;

    // If no filters, return original KPIs
    if (activeFilterCount === 0) {
      return originalKPIs;
    }

    // Find matching segment
    const matchingSegment = findMatchingSegment(filters, segmentationData || null);

    if (!matchingSegment || !filteredDimensions) {
      return originalKPIs;
    }

    // Calculate filtered KPIs
    const sortedDimensions = [...filteredDimensions].sort(
      (a, b) => b.avg_score - a.avg_score
    );

    // Excluir dimensiones con solo 1 ítem (no son dimensiones completas)
    const criticalDimensions = filteredDimensions.filter(
      (d) => (d.segment === "crisis" || d.segment === "atencion") && d.item_count > 1
    ).length;

    return {
      engagementScore: matchingSegment.engagement_score,
      engagementPct: matchingSegment.engagement_pct,
      totalResponses: matchingSegment.respondent_count,
      dimensionsAnalyzed: filteredDimensions.length,
      criticalDimensions,
      yearOverYearChange: originalKPIs.yearOverYearChange, // Keep original for now
      topDimension: sortedDimensions[0] || null,
      bottomDimension: sortedDimensions[sortedDimensions.length - 1] || null,
    };
  }, [originalKPIs, segmentationData, filteredDimensions, filters, activeFilterCount]);

  return {
    data: filteredKPIs,
    isLoading: kpiLoading || segLoading,
    isError: kpiError || segError,
    hasFilters: activeFilterCount > 0,
  };
}

/**
 * Hook to get current filter label for display
 */
export function useCurrentFilterLabel(): string {
  const { filters, activeFilterCount } = useFilters();
  const { data: segmentationData } = useSegmentationData();

  if (activeFilterCount === 0) {
    return "Global";
  }

  const matchingSegment = findMatchingSegment(filters, segmentationData || null);

  return matchingSegment?.segment_name || "Filtrado";
}

/**
 * Hook to get filtered alerts
 */
export function useFilteredAlerts(params?: { limit?: number }) {
  const { data: filteredDimensions, isLoading, isError, hasFilters } = useFilteredDimensionStats();

  const alerts = useMemo(() => {
    if (!filteredDimensions) return [];

    let alertList = filteredDimensions
      .filter((d) => d.segment === "crisis" || d.segment === "atencion")
      .map((d) => ({
        id: `${d.year}-${d.dimension_code}`,
        dimension_code: d.dimension_code,
        dimension_name: d.dimension_name,
        severity: d.segment === "crisis" ? "critical" as const : "warning" as const,
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
      alertList = alertList.slice(0, params.limit);
    }

    return alertList;
  }, [filteredDimensions, params?.limit]);

  return {
    data: alerts,
    isLoading,
    isError,
    hasFilters,
  };
}
