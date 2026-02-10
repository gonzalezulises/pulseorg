"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCompany } from "@/contexts/company-context";
import type {
  SegmentationData,
  SegmentStats,
  RiskGroup,
  HeatmapData,
  SegmentComparison,
  DemographicFilters,
} from "@/types/segmentation";

/**
 * Main hook to load all segmentation data
 */
export function useSegmentationData() {
  const { companyId } = useCompany();

  return useQuery<SegmentationData>({
    queryKey: ["segmentation-data", companyId],
    queryFn: async () => {
      const response = await fetch(`/data/${companyId}/segmentation_data.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch segmentation data");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to derive department options dynamically from loaded data
 */
export function useDepartmentOptions() {
  const { data } = useSegmentationData();

  return useMemo(() => {
    const options = [{ value: "all", label: "Todas las Áreas" }];
    if (data?.by_department) {
      data.by_department.forEach((seg) => {
        options.push({ value: seg.segment_id, label: seg.segment_name });
      });
    }
    return options;
  }, [data]);
}

/**
 * Hook to get segment stats by type
 */
export function useSegmentStats(type: "department" | "tenure" | "gender") {
  const { data, ...rest } = useSegmentationData();

  let segments: SegmentStats[] = [];

  if (data) {
    switch (type) {
      case "department":
        segments = data.by_department;
        break;
      case "tenure":
        segments = data.by_tenure;
        break;
      case "gender":
        segments = data.by_gender;
        break;
    }
  }

  return {
    data: segments,
    ...rest,
  };
}

/**
 * Hook to get risk groups
 */
export function useRiskGroups() {
  const { data, ...rest } = useSegmentationData();

  return {
    data: data?.risk_groups || [],
    ...rest,
  };
}

/**
 * Hook to get heatmap data
 */
export function useHeatmapData() {
  const { data, ...rest } = useSegmentationData();

  return {
    data: data?.heatmap || null,
    ...rest,
  };
}

/**
 * Hook to get comparison data for bar charts
 */
export function useSegmentComparison(type: "department" | "tenure" | "gender") {
  const { data: segments, ...rest } = useSegmentStats(type);
  const { data: fullData } = useSegmentationData();

  const globalScore = fullData?.global_score || 4.25;

  const comparison: SegmentComparison[] = segments.map((seg) => ({
    segment_name: seg.segment_name,
    segment_type: seg.segment_type,
    engagement_score: seg.engagement_score,
    engagement_pct: seg.engagement_pct,
    respondent_count: seg.respondent_count,
    vs_global: parseFloat((seg.engagement_score - globalScore).toFixed(2)),
  }));

  return {
    data: comparison.sort((a, b) => b.engagement_score - a.engagement_score),
    globalScore,
    ...rest,
  };
}

/**
 * Hook to filter data based on demographic filters
 */
export function useFilteredData(filters: DemographicFilters) {
  const { data, ...rest } = useSegmentationData();

  // For now, we return the full data
  // In a real implementation, this would filter the underlying data
  // Since we have mock data, we'll just return segment-specific views

  const filteredDimensions = data?.by_department?.[0]?.dimensions || [];

  // Apply filter logic to show relevant segments
  let relevantSegment = "all";

  if (filters.department) {
    relevantSegment = filters.department;
  } else if (filters.tenure) {
    relevantSegment = filters.tenure;
  } else if (filters.gender) {
    relevantSegment = filters.gender;
  }

  return {
    data,
    relevantSegment,
    hasFilters: Object.values(filters).some((v) => v !== null),
    ...rest,
  };
}

/**
 * Hook to get global stats
 */
export function useGlobalStats() {
  const { data, ...rest } = useSegmentationData();

  return {
    data: {
      globalEngagement: data?.global_engagement || 0,
      globalScore: data?.global_score || 0,
      totalRespondents: data?.total_respondents || 0,
    },
    ...rest,
  };
}

/**
 * Hook to get a specific segment's dimension data
 */
export function useSegmentDimensions(
  type: "department" | "tenure" | "gender",
  segmentId: string
) {
  const { data: segments, ...rest } = useSegmentStats(type);

  const segment = segments.find((s) => s.segment_id === segmentId);

  return {
    data: segment?.dimensions || [],
    segment,
    ...rest,
  };
}
