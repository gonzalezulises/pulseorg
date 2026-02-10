"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCompany } from "@/contexts/company-context";
import type {
  RecognitionData,
  AreaRanking,
  Achievement,
  GoalProgress,
  AreaOfMonth,
  RecognitionSummary,
} from "@/types/recognition";

// Main hook for all recognition data
export function useRecognitionData() {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: ["recognition", companyId],
    queryFn: async (): Promise<RecognitionData> => {
      const response = await fetch(`/data/${companyId}/recognition_data.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch recognition data");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for podium (top 3 areas)
export function usePodium() {
  const { data, isLoading, error } = useRecognitionData();

  const podium = useMemo(() => {
    if (!data?.podium) return [];
    return data.podium;
  }, [data]);

  return { data: podium, isLoading, error };
}

// Hook for all rankings
export function useRankings() {
  const { data, isLoading, error } = useRecognitionData();

  return {
    data: data?.rankings || [],
    isLoading,
    error,
  };
}

// Hook for area of the month
export function useAreaOfMonth() {
  const { data, isLoading, error } = useRecognitionData();

  return {
    data: data?.area_of_month,
    isLoading,
    error,
  };
}

// Hook for goals progress
export function useGoalsProgress() {
  const { data, isLoading, error } = useRecognitionData();

  return {
    data: data?.goals_progress || [],
    isLoading,
    error,
  };
}

// Hook for achievements feed
export function useAchievements() {
  const { data, isLoading, error } = useRecognitionData();

  return {
    data: data?.achievements || [],
    isLoading,
    error,
  };
}

// Hook for summary stats
export function useRecognitionSummary() {
  const { data, isLoading, error } = useRecognitionData();

  return {
    data: data?.summary,
    isLoading,
    error,
  };
}

// Hook for filtering areas by medal
export function useAreasByMedal(medal: "gold" | "silver" | "bronze" | "none") {
  const { data: rankings } = useRankings();

  return useMemo(() => {
    return rankings.filter((area) => area.medal === medal);
  }, [rankings, medal]);
}

// Hook for goals on track vs at risk
export function useGoalsStatus() {
  const { data: goals } = useGoalsProgress();

  return useMemo(() => {
    const onTrack = goals.filter((g) => g.status === "achieved" || g.status === "on_track");
    const atRisk = goals.filter((g) => g.status === "needs_attention" || g.status === "at_risk" || g.status === "critical");

    return {
      onTrack,
      atRisk,
      totalOnTrack: onTrack.length,
      totalAtRisk: atRisk.length,
    };
  }, [goals]);
}
