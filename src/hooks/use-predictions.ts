"use client";

import { useQuery } from "@tanstack/react-query";
import { useCompany } from "@/contexts/company-context";
import type {
  PredictionsData,
  RotationRisk,
  Projections,
  EarlyAlert,
  PredictionsSummary,
  HistoricalPoint,
  ForecastPoint,
} from "@/types/predictions";

// Main hook for all predictions data
export function usePredictionsData() {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: ["predictions", companyId],
    queryFn: async (): Promise<PredictionsData> => {
      const response = await fetch(`/data/${companyId}/predictions_data.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch predictions data");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for rotation risk data
export function useRotationRisk() {
  const { data, isLoading, error } = usePredictionsData();
  return {
    data: data?.rotation_risk,
    isLoading,
    error,
  };
}

// Hook for projections data
export function useProjections() {
  const { data, isLoading, error } = usePredictionsData();
  return {
    data: data?.projections,
    isLoading,
    error,
  };
}

// Hook for early alerts
export function useEarlyAlerts() {
  const { data, isLoading, error } = usePredictionsData();
  return {
    data: data?.early_alerts || [],
    isLoading,
    error,
  };
}

// Hook for predictions summary
export function usePredictionsSummary() {
  const { data, isLoading, error } = usePredictionsData();
  return {
    data: data?.summary,
    isLoading,
    error,
  };
}

// Hook for new alerts count (for sidebar badge)
export function useNewAlertsCount() {
  const { data, isLoading } = usePredictionsData();
  return {
    count: data?.summary?.new_alerts || 0,
    isLoading,
  };
}

// Hook for high severity alerts
export function useHighSeverityAlerts() {
  const { data, isLoading } = usePredictionsData();
  return {
    data: data?.early_alerts.filter((alert) => alert.severity === "high") || [],
    count: data?.summary?.high_severity_alerts || 0,
    isLoading,
  };
}

// Linear regression projection algorithm
export function calculateLinearProjection(
  historical: HistoricalPoint[],
  monthsToProject: number
): ForecastPoint[] {
  if (historical.length < 2) return [];

  // Calculate linear regression
  const n = historical.length;
  const xValues = historical.map((_, i) => i);
  const yValues = historical.map((p) => p.score);

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate standard error for confidence bands
  const predictions = xValues.map((x) => intercept + slope * x);
  const residuals = yValues.map((y, i) => y - predictions[i]);
  const standardError = Math.sqrt(
    residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2)
  );

  // Generate forecast points
  const lastMonth = historical[historical.length - 1].month;
  const [year, month] = lastMonth.split("-").map(Number);

  const forecast: ForecastPoint[] = [];

  for (let i = 1; i <= monthsToProject; i++) {
    const projectedX = n - 1 + i;
    const expected = intercept + slope * projectedX;

    // Confidence bands widen over time
    const confidenceMultiplier = 1 + i * 0.1;
    const band = standardError * confidenceMultiplier;

    // Calculate new month
    let newMonth = month + i;
    let newYear = year;
    while (newMonth > 12) {
      newMonth -= 12;
      newYear += 1;
    }

    forecast.push({
      month: `${newYear}-${String(newMonth).padStart(2, "0")}`,
      optimistic: Math.min(5, expected + band * 1.5),
      expected: Math.max(1, Math.min(5, expected)),
      pessimistic: Math.max(1, expected - band * 1.5),
    });
  }

  return forecast;
}

// Hook for custom projection based on historical data
export function useCustomProjection(
  historical: HistoricalPoint[],
  monthsToProject: number = 12
) {
  return calculateLinearProjection(historical, monthsToProject);
}

// Detect deteriorating dimensions (dropped 2+ points in 3 months)
export function detectDeterioratingDimensions(
  alerts: EarlyAlert[]
): EarlyAlert[] {
  return alerts.filter(
    (alert) => Math.abs(alert.change) >= 0.2 && alert.months_declining >= 2
  );
}

// Hook for deteriorating dimensions
export function useDeterioratingDimensions() {
  const { data: alerts, isLoading } = useEarlyAlerts();
  return {
    data: detectDeterioratingDimensions(alerts),
    isLoading,
  };
}

// Calculate trend direction
export function calculateTrend(
  historical: HistoricalPoint[]
): "up" | "down" | "stable" {
  if (historical.length < 2) return "stable";

  const recentPoints = historical.slice(-3);
  if (recentPoints.length < 2) return "stable";

  const first = recentPoints[0].score;
  const last = recentPoints[recentPoints.length - 1].score;
  const change = last - first;

  if (change > 0.1) return "up";
  if (change < -0.1) return "down";
  return "stable";
}

// Calculate change velocity
export function calculateChangeVelocity(
  change: number,
  months: number
): "rapid" | "moderate" | "slow" {
  const ratePerMonth = Math.abs(change) / months;

  if (ratePerMonth >= 0.1) return "rapid";
  if (ratePerMonth >= 0.05) return "moderate";
  return "slow";
}
