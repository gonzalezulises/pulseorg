"use client";

import { useQuery } from "@tanstack/react-query";
import { useCompany } from "@/contexts/company-context";
import type {
  UnifiedAnalysisData,
  YearKeywordAnalysis,
  HistoricalTrends,
  DimensionYearComparison,
  TrendLineData,
  GroupedBarData,
  WordCloudItem,
  GlobalTrendPoint,
} from "@/types/unified-analysis";

/**
 * Main hook to load all unified analysis data
 */
export function useUnifiedAnalysis() {
  const { companyId } = useCompany();

  return useQuery<UnifiedAnalysisData>({
    queryKey: ["unified-analysis", companyId],
    queryFn: async () => {
      const response = await fetch(`/data/${companyId}/unified_analysis.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch unified analysis data");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get keyword analysis for a specific year
 */
export function useKeywordAnalysis(year: number) {
  const { data, ...rest } = useUnifiedAnalysis();

  const yearData = data?.keyword_analysis[year.toString()] || null;

  return {
    data: yearData,
    ...rest,
  };
}

/**
 * Hook to get historical trends data
 */
export function useHistoricalTrends() {
  const { data, ...rest } = useUnifiedAnalysis();

  return {
    data: data?.historical_trends || null,
    ...rest,
  };
}

/**
 * Hook to get year comparison data
 */
export function useYearComparison() {
  const { data, ...rest } = useUnifiedAnalysis();

  return {
    data: data?.year_comparison || [],
    ...rest,
  };
}

/**
 * Hook to get global engagement trend data (formatted for line chart)
 */
export function useEngagementTrend() {
  const { data, ...rest } = useUnifiedAnalysis();

  const trendData: GlobalTrendPoint[] =
    data?.historical_trends?.global_engagement || [];

  return {
    data: trendData,
    ...rest,
  };
}

/**
 * Hook to get dimension trends formatted for multi-line chart
 * @param dimensionCodes - Array of dimension codes to include
 */
export function useDimensionTrends(dimensionCodes?: string[]) {
  const { data, ...rest } = useUnifiedAnalysis();

  let lineData: TrendLineData[] = [];

  if (data?.historical_trends?.by_dimension) {
    const years = [2023, 2024, 2025, 2026];
    const dimensions = data.historical_trends.by_dimension;

    // Filter dimensions if specified
    const codes =
      dimensionCodes ||
      Object.keys(dimensions);

    lineData = years.map((year) => {
      const point: TrendLineData = { year };

      codes.forEach((code) => {
        const dim = dimensions[code];
        if (dim) {
          const yearData = dim.data.find((d) => d.year === year);
          if (yearData) {
            point[code] = yearData.score;
          }
        }
      });

      return point;
    });
  }

  return {
    data: lineData,
    dimensions: data?.historical_trends?.by_dimension || {},
    ...rest,
  };
}

/**
 * Hook to get grouped bar data for year comparison
 */
export function useGroupedBarData() {
  const { data, ...rest } = useUnifiedAnalysis();

  const barData: GroupedBarData[] = (data?.year_comparison || []).map((dim) => ({
    dimension: dim.dimension_code,
    dimension_name: dim.dimension_name,
    "2023": dim.score_2023,
    "2024": dim.score_2024,
    "2025": dim.score_2025,
    "2026": dim.score_2026,
  }));

  return {
    data: barData,
    ...rest,
  };
}

/**
 * Hook to get word cloud data for a specific question
 */
export function useWordCloud(year: number, questionKey: keyof YearKeywordAnalysis) {
  const { data, ...rest } = useKeywordAnalysis(year);

  let wordCloudData: WordCloudItem[] = [];

  if (data && data[questionKey]) {
    wordCloudData = data[questionKey].keywords.map((k) => ({
      text: k.word,
      value: k.count,
    }));
  }

  return {
    data: wordCloudData,
    rawData: data?.[questionKey] || null,
    ...rest,
  };
}

/**
 * Hook to get all available years with keyword data
 */
export function useAvailableYears() {
  const { data, ...rest } = useUnifiedAnalysis();

  return {
    data: data?.years_analyzed || [],
    ...rest,
  };
}
