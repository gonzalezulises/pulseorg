// Tipos basados en los schemas de clima-api
// API URL: https://clima-api-pied.vercel.app

// Enums - Vocabularios controlados
export type Dimension =
  | "liderazgo"
  | "comunicacion"
  | "desarrollo"
  | "compensacion"
  | "ambiente"
  | "balance"
  | "innovacion"
  | "compromiso";

export type Classification =
  | "fortaleza"
  | "oportunidad"
  | "debilidad"
  | "critico";

export type AlertSeverity = "critical" | "warning" | "info";

export type AlertType = "ceiling" | "dispersion" | "decline";

export type TrendPattern = "improving" | "declining" | "stable" | "volatile";

export type SurveyStatus = "draft" | "active" | "closed" | "archived";

export type ExportFormat = "excel" | "csv";

export type ExportScope = "items" | "dimensions" | "trends" | "alerts";

// Estadísticas de Item
export interface ItemStatistics {
  item_code: string;
  item_text: string;
  dimension: Dimension;
  year: number;
  total_responses: number;
  score_mean: number;
  score_std: number;
  favorability_pct: number;
  score_distribution: Record<string, number>;
  classification: Classification;
}

// Estadísticas de Dimensión
export interface DimensionStatistics {
  dimension: Dimension;
  year: number;
  items_count: number;
  total_responses: number;
  score_mean: number;
  score_std: number;
  favorability_pct: number;
  classification: Classification;
  top_items: ItemStatistics[];
  bottom_items: ItemStatistics[];
}

// Tendencia Longitudinal
export interface LongitudinalTrend {
  item_code: string;
  item_text: string;
  dimension: Dimension;
  years: number[];
  scores: number[];
  favorabilities: number[];
  total_change: number;
  average_change: number;
  trend_pattern: TrendPattern;
  data_points: number;
}

// Alerta
export interface Alert {
  id: string;
  item_code: string;
  item_text: string;
  dimension: Dimension;
  alert_type: AlertType;
  severity: AlertSeverity;
  current_value: number;
  threshold_value: number;
  description: string;
  recommendation: string;
  detected_at: string;
}

// Survey
export interface Survey {
  id: number;
  year: number;
  name: string;
  description?: string;
  status: SurveyStatus;
  start_date?: string;
  end_date?: string;
  total_responses: number;
  created_at: string;
  updated_at: string;
}

// Item
export interface Item {
  id: number;
  code: string;
  text_es: string;
  text_en?: string;
  dimension: Dimension;
  is_reverse_scored: boolean;
  is_active: boolean;
  created_at: string;
}

// Health Check Response
export interface HealthResponse {
  status: "healthy" | "unhealthy";
  version: string;
  database: {
    connected: boolean;
    error?: string;
  };
}

// Health Detail Response
export interface HealthDetailResponse extends HealthResponse {
  database_file_size_mb: number;
  table_counts: Record<string, number>;
}

// API Response Wrappers
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Parámetros de consulta
export interface DimensionStatsParams {
  year?: number;
  min_responses?: number;
}

export interface TrendsParams {
  min_years?: number;
  dimension?: Dimension;
}

export interface AlertsParams {
  severity?: AlertSeverity;
  alert_type?: AlertType;
  dimension?: Dimension;
  limit?: number;
}

export interface ItemStatsParams {
  year?: number;
  dimension?: Dimension;
  classification?: Classification;
  min_responses?: number;
}

export interface ExportParams {
  format: ExportFormat;
  scope: ExportScope;
  year?: number;
  dimension?: Dimension;
}

// KPIs del Dashboard
export interface DashboardKPIs {
  globalFavorability: number;
  totalResponses: number;
  dimensionsAnalyzed: number;
  criticalAlerts: number;
  yearOverYearChange: number;
}

// Dimensiones para el gráfico radar
export const DIMENSION_LABELS: Record<Dimension, string> = {
  liderazgo: "Liderazgo",
  comunicacion: "Comunicación",
  desarrollo: "Desarrollo",
  compensacion: "Compensación",
  ambiente: "Ambiente",
  balance: "Balance",
  innovacion: "Innovación",
  compromiso: "Compromiso",
};

// Colores por dimensión
export const DIMENSION_COLORS: Record<Dimension, string> = {
  liderazgo: "#3b82f6",
  comunicacion: "#8b5cf6",
  desarrollo: "#06b6d4",
  compensacion: "#10b981",
  ambiente: "#f59e0b",
  balance: "#ec4899",
  innovacion: "#6366f1",
  compromiso: "#14b8a6",
};

// Colores por severidad de alerta
export const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

// Colores por clasificación
export const CLASSIFICATION_COLORS: Record<Classification, string> = {
  fortaleza: "#10b981",
  oportunidad: "#3b82f6",
  debilidad: "#f59e0b",
  critico: "#ef4444",
};
