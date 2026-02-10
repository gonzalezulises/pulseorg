// Predictions and Early Alerts Types

export interface RiskFactor {
  id: string;
  factor: string;
  impact_score: number;
  affected_percentage: number;
  dimension: string;
}

export interface HighRiskArea {
  area: string;
  risk_level: number;
  engagement_score: number;
  headcount: number;
  key_issues: string[];
}

export interface EngagementRotationPoint {
  engagement: number;
  rotation: number;
}

export interface RotationRisk {
  overall_index: number;
  trend: "up" | "down" | "stable";
  risk_factors: RiskFactor[];
  high_risk_areas: HighRiskArea[];
  engagement_rotation_correlation: EngagementRotationPoint[];
}

export interface HistoricalPoint {
  month: string;
  score: number;
}

export interface ForecastPoint {
  month: string;
  optimistic: number;
  expected: number;
  pessimistic: number;
}

export interface OverallProjection {
  current_score: number;
  historical: HistoricalPoint[];
  forecast: ForecastPoint[];
}

export interface DimensionProjection {
  dimension: string;
  label: string;
  current_score: number;
  projected_6m: number;
  projected_12m: number;
  trend: "up" | "down" | "stable";
  change_rate: number;
}

export interface Projections {
  overall: OverallProjection;
  by_dimension: DimensionProjection[];
}

export interface AlertTrendPoint {
  month: string;
  score: number;
}

export type AlertSeverity = "high" | "medium" | "low";
export type ChangeVelocity = "rapid" | "moderate" | "slow";

export interface EarlyAlert {
  id: string;
  dimension: string;
  label: string;
  severity: AlertSeverity;
  current_score: number;
  previous_score: number;
  change: number;
  change_velocity: ChangeVelocity;
  months_declining: number;
  trend_data: AlertTrendPoint[];
  recommendation: string;
  affected_areas: string[];
  created_at: string;
  is_new: boolean;
}

export interface PredictionsSummary {
  total_alerts: number;
  new_alerts: number;
  high_severity_alerts: number;
  dimensions_improving: number;
  dimensions_declining: number;
  overall_trend: "up" | "down" | "stable";
  last_updated: string;
}

export interface PredictionsData {
  rotation_risk: RotationRisk;
  projections: Projections;
  early_alerts: EarlyAlert[];
  summary: PredictionsSummary;
}

// Traffic light colors
export const SCORE_COLORS = {
  good: "#22c55e", // green - score > 4.0
  warning: "#eab308", // yellow - score 3.5-4.0
  danger: "#ef4444", // red - score < 3.5
} as const;

export const SEVERITY_COLORS = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#eab308",
} as const;

export const TREND_COLORS = {
  up: "#22c55e",
  down: "#ef4444",
  stable: "#6b7280",
} as const;

export function getScoreColor(score: number): string {
  if (score > 4.0) return SCORE_COLORS.good;
  if (score >= 3.5) return SCORE_COLORS.warning;
  return SCORE_COLORS.danger;
}

export function getScoreStatus(score: number): "good" | "warning" | "danger" {
  if (score > 4.0) return "good";
  if (score >= 3.5) return "warning";
  return "danger";
}
