/**
 * Types for text analysis functionality
 */

export type SentimentType = "positive" | "neutral" | "negative";

export interface Comment {
  id: string;
  text: string;
  dimension: string;
  department: string;
  sentiment: SentimentType;
  sentiment_score: number;
  date: string;
  themes: string[];
}

export interface WordFrequency {
  word: string;
  count: number;
  sentiment: SentimentType;
}

export interface Theme {
  id: string;
  name: string;
  frequency: number;
  sentiment: SentimentType | "mixed";
  sentiment_score: number;
  dimensions: string[];
  keywords: string[];
  example_comments: string[];
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface SentimentTrend {
  month: string;
  positive: number;
  neutral: number;
  negative: number;
  avg_score: number;
}

export interface TextAnalysisData {
  generated_at: string;
  total_comments: number;
  comments: Comment[];
  word_frequencies: WordFrequency[];
  themes: Theme[];
  sentiment_summary: SentimentSummary;
  sentiment_trend: SentimentTrend[];
}

// Word cloud data format
export interface WordCloudWord {
  text: string;
  value: number;
  sentiment: SentimentType;
}

// Filter options
export interface TextAnalysisFilters {
  dimension: string | null;
  department: string | null;
  sentiment: SentimentType | null;
  dateRange: { start: string; end: string } | null;
}

// Sentiment colors
export const SENTIMENT_COLORS: Record<SentimentType | "mixed", string> = {
  positive: "#22C55E",
  neutral: "#94A3B8",
  negative: "#EF4444",
  mixed: "#F59E0B",
};

// Sentiment labels
export const SENTIMENT_LABELS: Record<SentimentType, string> = {
  positive: "Positivo",
  neutral: "Neutro",
  negative: "Negativo",
};
