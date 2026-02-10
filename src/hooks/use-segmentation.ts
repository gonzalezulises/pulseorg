"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCompany } from "@/contexts/company-context";
import { DIMENSION_LABELS_V2 } from "@/types/clima-v2";
import type { DimensionCodeV2 } from "@/types/clima-v2";
import type {
  SegmentationData,
  SegmentStats,
  RiskGroup,
  HeatmapData,
  HeatmapCell,
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

// Color scale matching segmentation-charts getScoreColor
function scoreToColor(score: number): string {
  if (score >= 4.50) return "#1dc47c";
  if (score >= 4.20) return "#00B4D8";
  if (score >= 4.00) return "#FCD34D";
  if (score >= 3.50) return "#F59E0B";
  return "#DC2626";
}

// Map dimension codes to display labels
function dimensionLabel(code: string): string {
  return DIMENSION_LABELS_V2[code as DimensionCodeV2] || code;
}

/**
 * Hook to get risk groups — transforms raw JSON shape to RiskGroup[]
 */
export function useRiskGroups() {
  const { data, ...rest } = useSegmentationData();

  // Raw JSON uses: group_name, description, count, percentage, avg_engagement, key_factors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = (data as any)?.risk_groups || [];

  const groups: RiskGroup[] = raw.map((r, i) => {
    const name: string = r.group_name || r.department || "";
    const avg: number = r.avg_engagement ?? r.engagement_score ?? 0;
    const level: RiskGroup["risk_level"] =
      r.risk_level ??
      (name.toLowerCase().includes("alto")
        ? "high"
        : name.toLowerCase().includes("moderado") || name.toLowerCase().includes("medio")
        ? "medium"
        : "low");

    return {
      id: r.id ?? `risk-${i}`,
      department: name,
      tenure: r.tenure ?? r.description ?? "N/A",
      hierarchy: r.hierarchy ?? "N/A",
      location: r.location ?? "N/A",
      respondent_count: r.respondent_count ?? r.count ?? 0,
      engagement_pct: r.engagement_pct ?? r.percentage ?? (avg / 5) * 100,
      critical_dimensions: (r.critical_dimensions || r.key_factors || []).map(dimensionLabel),
      risk_level: level,
    };
  });

  return {
    data: groups,
    ...rest,
  };
}

/**
 * Hook to get heatmap data — transforms raw JSON shape to HeatmapData
 */
export function useHeatmapData() {
  const { data, ...rest } = useSegmentationData();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = (data as any)?.heatmap;
  if (!raw) return { data: null, ...rest };

  // Already in expected format
  if (raw.segment_keys) return { data: raw as HeatmapData, ...rest };

  // Transform from raw format: { dimensions, departments, cells: [{department, dimension, score, segment}] }
  const departments: string[] = raw.departments || [];
  const dimensions: string[] = raw.dimensions || [];

  const cells: HeatmapCell[] = (raw.cells || []).map((c: any) => ({
    segment: c.department || c.segment || "",
    segment_name: c.department || c.segment_name || "",
    dimension: c.dimension || "",
    dimension_name: c.dimension || c.dimension_name || "",
    score: c.score ?? 0,
    favorability: c.favorability ?? (c.score ? (c.score / 5) * 100 : 0),
    color: c.color ?? scoreToColor(c.score ?? 0),
  }));

  const heatmap: HeatmapData = {
    segments: departments,
    segment_keys: departments,
    dimensions,
    dimension_keys: dimensions,
    cells,
  };

  return { data: heatmap, ...rest };
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
