// Recognition/Gamification Types

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface AreaRanking {
  area: string;
  engagement: number;
  respondents: number;
  dimensions: Record<string, number>;
  medal: "gold" | "silver" | "bronze" | "none";
  rank: number;
  change: number;
  trend: "up" | "down" | "stable" | "new";
  badges: Badge[];
}

export interface AreaOfMonthEntry {
  month: string;
  area: string;
  improvement: number;
}

export interface DimensionImprovement {
  dimension: string;
  name: string;
  improvement: number;
}

export interface AreaOfMonth {
  current: {
    area: string;
    improvement: number;
    previous_score: number;
    current_score: number;
    top_improving_dimensions: DimensionImprovement[];
    month: string;
  };
  history: AreaOfMonthEntry[];
}

export interface GoalProgress {
  dimension: string;
  name: string;
  current: number;
  target: number;
  progress: number;
  status: "achieved" | "on_track" | "needs_attention" | "at_risk" | "critical";
  deadline: string;
}

export interface Achievement {
  id: string;
  type: "milestone" | "improvement" | "dimension" | "streak";
  icon: string;
  message: string;
  area: string;
  value: number;
  dimension?: string;
  date: string;
}

export interface RecognitionSummary {
  total_areas: number;
  gold_medals: number;
  silver_medals: number;
  bronze_medals: number;
  average_engagement: number;
  goals_on_track: number;
  goals_at_risk: number;
}

export interface RecognitionData {
  generated_at: string;
  rankings: AreaRanking[];
  podium: AreaRanking[];
  area_of_month: AreaOfMonth | null;
  goals_progress: GoalProgress[];
  achievements: Achievement[];
  summary: RecognitionSummary;
}
