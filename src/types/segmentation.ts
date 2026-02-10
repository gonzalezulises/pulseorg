/**
 * Types for demographic segmentation functionality
 */

// Filter options
export interface DemographicFilters {
  department: string | null;
  tenure: string | null;
  gender: string | null;
}

// Tenure options - REAL values from CSV
export const TENURE_OPTIONS = [
  { value: "all", label: "Todas las Antigüedades" },
  { value: "menos_de_1_ano", label: "Menos de 1 año" },
  { value: "entre_1_y_3_anos", label: "Entre 1 y 3 años" },
  { value: "entre_3_y_5_anos", label: "Entre 3 y 5 años" },
  { value: "entre_5_y_7_anos", label: "Entre 5 y 7 años" },
  { value: "mas_de_7_anos", label: "Más de 7 años" },
] as const;

// Gender options - REAL values from CSV
export const GENDER_OPTIONS = [
  { value: "all", label: "Todos los Géneros" },
  { value: "femenino", label: "Femenino" },
  { value: "masculino", label: "Masculino" },
] as const;

// Segment data types
export interface SegmentStats {
  segment_id: string;
  segment_name: string;
  segment_type: "department" | "tenure" | "gender";
  respondent_count: number;
  engagement_score: number;
  engagement_pct: number;
  dimensions: SegmentDimensionScore[];
}

export interface SegmentDimensionScore {
  dimension_code: string;
  dimension_name: string;
  avg_score: number;
  favorability_pct: number;
  gap_vs_global: number;
}

// Heatmap data
export interface HeatmapCell {
  segment: string;
  segment_name: string;
  dimension: string;
  dimension_name: string;
  score: number;
  favorability: number;
  color: string;
}

export interface HeatmapData {
  segments: string[];
  segment_keys: string[];
  dimensions: string[];
  dimension_keys: string[];
  cells: HeatmapCell[];
}

// Risk groups (combination of department + tenure)
export interface RiskGroup {
  id: string;
  department: string;
  tenure: string;
  hierarchy: string; // "N/A" - not available in data
  location: string;  // "N/A" - not available in data
  respondent_count: number;
  engagement_pct: number;
  critical_dimensions: string[];
  risk_level: "high" | "medium" | "low";
}

// Comparison data for bar charts
export interface SegmentComparison {
  segment_name: string;
  segment_type: string;
  engagement_score: number;
  engagement_pct: number;
  respondent_count: number;
  vs_global: number; // Difference from global average
}

// Full segmentation data structure
export interface SegmentationData {
  generated_at: string;
  global_engagement: number;
  global_score: number;
  total_respondents: number;
  by_department: SegmentStats[];
  by_tenure: SegmentStats[];
  by_gender: SegmentStats[];
  by_hierarchy: SegmentStats[]; // Empty - not available in data
  by_location: SegmentStats[];  // Empty - not available in data
  risk_groups: RiskGroup[];
  heatmap: HeatmapData;
}

// Filter context type
export interface FilterContextType {
  filters: DemographicFilters;
  setFilters: (filters: DemographicFilters) => void;
  updateFilter: (key: keyof DemographicFilters, value: string | null) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}
