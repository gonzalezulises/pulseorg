"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCompany } from "@/contexts/company-context";
import type {
  CorrelationsData,
  Dimension,
  EngagementDriver,
  DimensionBusinessCorrelation,
} from "@/types/correlations";
import { calculatePearsonCorrelation, calculateLinearRegression } from "@/types/correlations";

// Main hook for all correlations data
export function useCorrelationsData() {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: ["correlations", companyId],
    queryFn: async (): Promise<CorrelationsData> => {
      const response = await fetch(`/data/${companyId}/correlations_data.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch correlations data");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for dimensions list
export function useDimensions() {
  const { data, isLoading, error } = useCorrelationsData();
  return {
    data: data?.dimensions || [],
    isLoading,
    error,
  };
}

// Hook for correlation matrix
export function useCorrelationMatrix() {
  const { data, isLoading, error } = useCorrelationsData();
  return {
    matrix: data?.correlation_matrix || [],
    dimensions: data?.dimensions || [],
    isLoading,
    error,
  };
}

// Hook for getting correlation between two specific dimensions
export function useDimensionCorrelation(dim1Index: number, dim2Index: number) {
  const { matrix } = useCorrelationMatrix();

  const correlation = useMemo(() => {
    if (matrix.length === 0) return null;
    if (dim1Index < 0 || dim1Index >= matrix.length) return null;
    if (dim2Index < 0 || dim2Index >= matrix.length) return null;
    return matrix[dim1Index][dim2Index];
  }, [matrix, dim1Index, dim2Index]);

  return correlation;
}

// Hook for business indicators correlations
export function useBusinessCorrelations() {
  const { data, isLoading, error } = useCorrelationsData();
  return {
    indicators: data?.business_indicators?.indicators || [],
    monthlyData: data?.business_indicators?.monthly_data || [],
    correlations: data?.business_indicators?.correlations_with_dimensions || [],
    isLoading,
    error,
  };
}

// Hook for sorted business correlations by indicator
export function useSortedBusinessCorrelations(
  sortBy: "rotation" | "absenteeism" | "productivity" | "nps" = "rotation",
  sortOrder: "asc" | "desc" = "desc"
) {
  const { correlations, isLoading } = useBusinessCorrelations();
  const { data } = useCorrelationsData();

  const sortedData = useMemo(() => {
    if (!correlations.length || !data?.dimensions) return [];

    const withNames = correlations.map((corr) => {
      const dimension = data.dimensions.find((d) => d.code === corr.dimension);
      return {
        ...corr,
        dimensionName: dimension?.name || corr.dimension,
        dimensionShort: dimension?.short || corr.dimension,
      };
    });

    return withNames.sort((a, b) => {
      const valueA = Math.abs(a[sortBy]);
      const valueB = Math.abs(b[sortBy]);
      return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
    });
  }, [correlations, sortBy, sortOrder, data?.dimensions]);

  return { data: sortedData, isLoading };
}

// Hook for engagement drivers
export function useEngagementDrivers() {
  const { data, isLoading, error } = useCorrelationsData();
  return {
    data: data?.engagement_drivers || [],
    isLoading,
    error,
  };
}

// Hook for scatter plot data
export function useScatterPlotData(dim1Code: string, dim2Code: string) {
  const { data, isLoading } = useCorrelationsData();

  const scatterData = useMemo(() => {
    if (!data?.scatter_data) return { points: [], regression: null };

    const dim1Scores = data.scatter_data.dimension_scores.find(
      (d) => d.dimension === dim1Code
    );
    const dim2Scores = data.scatter_data.dimension_scores.find(
      (d) => d.dimension === dim2Code
    );

    if (!dim1Scores || !dim2Scores) return { points: [], regression: null };

    const points = dim1Scores.scores.map((x, i) => ({
      x,
      y: dim2Scores.scores[i],
      month: data.scatter_data.months[i],
    }));

    const x = dim1Scores.scores;
    const y = dim2Scores.scores;

    const correlation = calculatePearsonCorrelation(x, y);
    const regression = calculateLinearRegression(x, y);

    return {
      points,
      regression: {
        ...regression,
        correlation,
        equation: `y = ${regression.slope.toFixed(2)}x + ${regression.intercept.toFixed(2)}`,
      },
    };
  }, [data, dim1Code, dim2Code]);

  return { data: scatterData, isLoading };
}

// Hook for scatter plot with business indicator
export function useScatterPlotWithIndicator(
  dimCode: string,
  indicator: "rotation" | "absenteeism" | "productivity" | "nps"
) {
  const { data, isLoading } = useCorrelationsData();

  const scatterData = useMemo(() => {
    if (!data?.scatter_data || !data?.business_indicators) {
      return { points: [], regression: null };
    }

    const dimScores = data.scatter_data.dimension_scores.find(
      (d) => d.dimension === dimCode
    );

    if (!dimScores) return { points: [], regression: null };

    const indicatorData = data.business_indicators?.monthly_data?.map((m) => {
      switch (indicator) {
        case "rotation":
          return m.rotation;
        case "absenteeism":
          return m.absenteeism;
        case "productivity":
          return m.productivity;
        case "nps":
          return m.nps;
      }
    }) || [];

    if (indicatorData.length === 0) return { points: [], regression: null };

    const points = dimScores.scores.map((x, i) => ({
      x,
      y: indicatorData[i] ?? 0,
      month: data.scatter_data.months[i],
    }));

    const x = dimScores.scores;
    const y = indicatorData;

    const correlation = calculatePearsonCorrelation(x, y);
    const regression = calculateLinearRegression(x, y);

    return {
      points,
      regression: {
        ...regression,
        correlation,
        equation: `y = ${regression.slope.toFixed(2)}x + ${regression.intercept.toFixed(2)}`,
      },
    };
  }, [data, dimCode, indicator]);

  return { data: scatterData, isLoading };
}

// Hook for insights
export function useCorrelationInsights() {
  const { data, isLoading, error } = useCorrelationsData();
  return {
    data: data?.insights,
    isLoading,
    error,
  };
}

// Hook for finding strongest correlations in matrix
export function useStrongestCorrelations(limit: number = 10) {
  const { matrix, dimensions } = useCorrelationMatrix();

  const strongest = useMemo(() => {
    if (matrix.length === 0 || dimensions.length === 0) return [];

    const correlations: Array<{
      dim1: Dimension;
      dim2: Dimension;
      correlation: number;
    }> = [];

    for (let i = 0; i < matrix.length; i++) {
      for (let j = i + 1; j < matrix[i].length; j++) {
        correlations.push({
          dim1: dimensions[i],
          dim2: dimensions[j],
          correlation: matrix[i][j],
        });
      }
    }

    return correlations
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, limit);
  }, [matrix, dimensions, limit]);

  return strongest;
}

// Hook for detailed correlation stats between two dimensions (from backend pre-calculated)
export function useDetailedCorrelation(dim1Code: string, dim2Code: string) {
  const { data, isLoading, error } = useCorrelationsData();

  const detailedStats = useMemo(() => {
    if (!data?.detailed_correlations) return null;

    // Find the correlation pair (could be in either order)
    const detail = data.detailed_correlations.find(
      (d) =>
        (d.dim1 === dim1Code && d.dim2 === dim2Code) ||
        (d.dim1 === dim2Code && d.dim2 === dim1Code)
    );

    if (!detail) return null;

    // Swap if needed to match requested order
    const swapped = detail.dim1 !== dim1Code;

    return {
      dim1: swapped ? detail.dim2 : detail.dim1,
      dim2: swapped ? detail.dim1 : detail.dim2,
      dim1Name: swapped ? detail.dim2_name : detail.dim1_name,
      dim2Name: swapped ? detail.dim1_name : detail.dim2_name,
      pearsonR: detail.r,
      adjustedR: detail.adjusted_r,
      partialR: detail.partial_r,
      spearmanRho: detail.spearman,
      pValue: detail.p_value,
      rSquared: detail.r_squared,
      ciLower: detail.ci_lower,
      ciUpper: detail.ci_upper,
      effectSize: detail.effect_size,
      sampleSize: detail.n,
      isSignificant: detail.is_significant,
      nonlinear: detail.nonlinear,
      segments: detail.segments,
    };
  }, [data, dim1Code, dim2Code]);

  return { data: detailedStats, isLoading, error };
}
