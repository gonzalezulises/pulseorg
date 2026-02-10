/**
 * Types for unified climate analysis data
 * Includes keyword extraction, historical trends, and year comparisons
 */

// Keyword analysis types
export interface KeywordItem {
  word: string;
  count: number;
  frequency: number;
}

export interface BigramItem {
  phrase: string;
  count: number;
  frequency: number;
}

export interface SentimentDistribution {
  positive: {
    count: number;
    percentage: number;
  };
  negative: {
    count: number;
    percentage: number;
  };
  neutral: {
    count: number;
    percentage: number;
  };
}

export interface SentimentAnalysis {
  sentiment_distribution: SentimentDistribution;
  top_positive_words: Array<[string, number]>;
  top_negative_words: Array<[string, number]>;
}

export interface OpenQuestionAnalysis {
  column_name: string;
  response_count: number;
  keywords: KeywordItem[];
  bigrams: BigramItem[];
  sentiment: SentimentAnalysis;
}

export interface YearKeywordAnalysis {
  future_suggestions?: OpenQuestionAnalysis;
  ia_processes?: OpenQuestionAnalysis;
  ia_training?: OpenQuestionAnalysis;
  change_synthesis?: OpenQuestionAnalysis;
}

// Historical trends types
export interface GlobalTrendPoint {
  year: number;
  engagement_score: number;
  engagement_pct: number;
  respondent_count: number;
}

export interface DimensionTrendPoint {
  year: number;
  score: number;
  favorability: number;
  segment: string;
}

export interface DimensionTrend {
  name: string;
  data: DimensionTrendPoint[];
}

export interface HistoricalTrends {
  global_engagement: GlobalTrendPoint[];
  by_dimension: Record<string, DimensionTrend>;
}

// Year comparison types
export interface DimensionYearComparison {
  dimension_code: string;
  dimension_name: string;
  score_2023?: number;
  score_2024?: number;
  score_2025?: number;
  score_2026?: number;
  favorability_2023?: number;
  favorability_2024?: number;
  favorability_2025?: number;
  favorability_2026?: number;
}

// Main unified analysis data structure
export interface UnifiedAnalysisData {
  generated_at: string;
  model_version: string;
  years_analyzed: number[];
  keyword_analysis: Record<string, YearKeywordAnalysis>;
  historical_trends: HistoricalTrends;
  year_comparison: DimensionYearComparison[];
}

// Chart-ready data formats
export interface TrendLineData {
  year: number;
  [key: string]: number; // dimension scores
}

export interface GroupedBarData {
  dimension: string;
  dimension_name: string;
  "2023"?: number;
  "2024"?: number;
  "2025"?: number;
  "2026"?: number;
}

// Word cloud compatible format
export interface WordCloudItem {
  text: string;
  value: number;
}
