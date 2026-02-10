// Tipos para el modelo V2 de clima organizacional - 17 dimensiones
// Modelo de 17 dimensiones para análisis de clima organizacional

// Códigos de dimensión V2
export type DimensionCodeV2 =
  | "orgullo_institucional"
  | "resultados_logros"
  | "innovacion_cambio"
  | "proposito_trabajo"
  | "seguridad_fisica"
  | "cohesion_equipo"
  | "cuidado_mutuo"
  | "autonomia"
  | "liderazgo_efectivo"
  | "balance_vida_trabajo"
  | "desarrollo_profesional"
  | "equidad_ascensos"
  | "comunicacion_interna"
  | "compensacion"
  | "reconocimiento"
  | "beneficios_exclusivos"
  | "confianza_institucional";

// Segmentos de clasificación
export type SegmentType =
  | "fortaleza_excepcional"
  | "fortaleza_solida"
  | "aceptable"
  | "atencion"
  | "crisis";

// Perfiles de engagement
export type EngagementProfile =
  | "True Believers"
  | "Engaged Pragmáticos"
  | "Neutrales"
  | "Desengaged";

// Estadísticas de dimensión V2
export interface DimensionStatV2 {
  dimension_code: DimensionCodeV2;
  dimension_name: string;
  year: number;
  avg_score: number;
  std_score: number;
  favorability_pct: number;
  segment: SegmentType;
  item_count: number;
  respondent_count: number;
  benchmark: number;
  gap_vs_benchmark: number;
  rank: number;
}

// Perfil de engagement
export interface EngagementProfileData {
  n: number;
  pct: number;
}

// Datos de engagement
export interface EngagementData {
  engagement_score: number;
  engagement_pct: number;
  respondent_count: number;
  profiles: Record<EngagementProfile, EngagementProfileData>;
}

// Datos de un año
export interface YearData {
  year: number;
  respondent_count: number;
  dimensions: DimensionStatV2[];
  engagement?: EngagementData;
}

// Estructura completa del JSON V2
export interface ClimaDataV2 {
  generated_at: string;
  model_version: string;
  dimensions_count: number;
  years: Record<string, YearData>;
}

// Labels de dimensiones V2
export const DIMENSION_LABELS_V2: Record<DimensionCodeV2, string> = {
  orgullo_institucional: "Orgullo Institucional",
  resultados_logros: "Resultados y Logros",
  innovacion_cambio: "Innovación y Cambio",
  proposito_trabajo: "Propósito del Trabajo",
  seguridad_fisica: "Seguridad Física",
  cohesion_equipo: "Cohesión de Equipo",
  cuidado_mutuo: "Cuidado Mutuo",
  autonomia: "Autonomía",
  liderazgo_efectivo: "Liderazgo Efectivo",
  balance_vida_trabajo: "Balance Vida-Trabajo",
  desarrollo_profesional: "Desarrollo Profesional",
  equidad_ascensos: "Equidad en Ascensos",
  comunicacion_interna: "Comunicación Interna",
  compensacion: "Compensación",
  reconocimiento: "Reconocimiento",
  beneficios_exclusivos: "Beneficios Exclusivos",
  confianza_institucional: "Confianza Institucional",
};

// Colores por segmento
export const SEGMENT_COLORS: Record<SegmentType, string> = {
  fortaleza_excepcional: "#1dc47c",
  fortaleza_solida: "#00B4D8",
  aceptable: "#0052CC",
  atencion: "#F59E0B",
  crisis: "#DC2626",
};

// Colores para perfiles de engagement
export const PROFILE_COLORS: Record<EngagementProfile, string> = {
  "True Believers": "#1dc47c",
  "Engaged Pragmáticos": "#00B4D8",
  "Neutrales": "#F59E0B",
  "Desengaged": "#DC2626",
};

// Helper para obtener color de segmento
export function getSegmentColor(segment: SegmentType): string {
  return SEGMENT_COLORS[segment] || "#6b7280";
}

// Helper para obtener icono de segmento
export function getSegmentIcon(segment: SegmentType): string {
  switch (segment) {
    case "fortaleza_excepcional":
      return "⭐";
    case "fortaleza_solida":
      return "✅";
    case "aceptable":
      return "✅";
    case "atencion":
      return "⚠️";
    case "crisis":
      return "🔴";
    default:
      return "•";
  }
}

// Helper para obtener label de segmento
export function getSegmentLabel(segment: SegmentType): string {
  switch (segment) {
    case "fortaleza_excepcional":
      return "Fortaleza Excepcional";
    case "fortaleza_solida":
      return "Fortaleza Sólida";
    case "aceptable":
      return "Aceptable";
    case "atencion":
      return "Requiere Atención";
    case "crisis":
      return "Crítico";
    default:
      return segment;
  }
}
