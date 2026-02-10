"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useCompany } from "@/contexts/company-context";
import type {
  TextAnalysisData,
  Comment,
  WordFrequency,
  Theme,
  TextAnalysisFilters,
  SentimentType,
  WordCloudWord,
} from "@/types/text-analysis";

/**
 * Main hook for text analysis data
 */
export function useTextAnalysisData() {
  const { companyId } = useCompany();

  return useQuery<TextAnalysisData>({
    queryKey: ["text-analysis-data", companyId],
    queryFn: async () => {
      const response = await fetch(`/data/${companyId}/text_analysis_data.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch text analysis data");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for filtered comments
 */
export function useFilteredComments(filters: TextAnalysisFilters) {
  const { data, ...rest } = useTextAnalysisData();

  const filteredComments = useMemo(() => {
    if (!data?.comments) return [];

    return data.comments.filter((comment) => {
      if (filters.dimension && comment.dimension !== filters.dimension) {
        return false;
      }
      if (filters.department && comment.department !== filters.department) {
        return false;
      }
      if (filters.sentiment && comment.sentiment !== filters.sentiment) {
        return false;
      }
      return true;
    });
  }, [data?.comments, filters]);

  return {
    data: filteredComments,
    ...rest,
  };
}

/**
 * Hook for word cloud data
 */
export function useWordCloudData(filters: TextAnalysisFilters) {
  const { data: comments } = useFilteredComments(filters);
  const { data: analysisData } = useTextAnalysisData();

  const wordCloudData = useMemo((): WordCloudWord[] => {
    if (!analysisData?.word_frequencies) return [];

    // If no filters, return original frequencies
    if (!filters.dimension && !filters.department && !filters.sentiment) {
      return analysisData.word_frequencies.map((wf) => ({
        text: wf.word,
        value: wf.count,
        sentiment: wf.sentiment,
      }));
    }

    // Calculate frequencies from filtered comments
    const wordCounts: Record<string, { count: number; sentiments: SentimentType[] }> = {};

    comments.forEach((comment) => {
      comment.themes.forEach((theme) => {
        if (!wordCounts[theme]) {
          wordCounts[theme] = { count: 0, sentiments: [] };
        }
        wordCounts[theme].count++;
        wordCounts[theme].sentiments.push(comment.sentiment);
      });
    });

    return Object.entries(wordCounts)
      .map(([word, data]) => {
        // Determine predominant sentiment
        const sentimentCounts = data.sentiments.reduce(
          (acc, s) => {
            acc[s]++;
            return acc;
          },
          { positive: 0, neutral: 0, negative: 0 }
        );

        const maxSentiment = Object.entries(sentimentCounts).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0] as SentimentType;

        return {
          text: word,
          value: data.count,
          sentiment: maxSentiment,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 30);
  }, [analysisData?.word_frequencies, comments, filters]);

  return wordCloudData;
}

/**
 * Hook for sentiment analysis
 */
export function useSentimentAnalysis(filters: TextAnalysisFilters) {
  const { data: comments } = useFilteredComments(filters);
  const { data: analysisData, ...rest } = useTextAnalysisData();

  const sentimentData = useMemo(() => {
    if (!comments.length) {
      return {
        summary: { positive: 0, neutral: 0, negative: 0, total: 0 },
        trend: analysisData?.sentiment_trend || [],
        avgScore: 0,
      };
    }

    const summary = comments.reduce(
      (acc, comment) => {
        acc[comment.sentiment]++;
        acc.total++;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0, total: 0 }
    );

    const avgScore =
      comments.reduce((sum, c) => sum + c.sentiment_score, 0) / comments.length;

    return {
      summary,
      trend: analysisData?.sentiment_trend || [],
      avgScore,
    };
  }, [comments, analysisData?.sentiment_trend]);

  return {
    data: sentimentData,
    comments,
    ...rest,
  };
}

/**
 * Hook for themes
 */
export function useThemes(filters: TextAnalysisFilters) {
  const { data: analysisData, ...rest } = useTextAnalysisData();
  const { data: comments } = useFilteredComments(filters);

  const themes = useMemo(() => {
    if (!analysisData?.themes) return [];

    // If no filters, return original themes
    if (!filters.dimension && !filters.department && !filters.sentiment) {
      return analysisData.themes;
    }

    // Filter themes based on filtered comments
    const commentThemes = new Set<string>();
    comments.forEach((comment) => {
      comment.themes.forEach((theme) => commentThemes.add(theme));
    });

    return analysisData.themes.filter((theme) =>
      theme.keywords.some((kw) => commentThemes.has(kw))
    );
  }, [analysisData?.themes, comments, filters]);

  return {
    data: themes,
    ...rest,
  };
}

/**
 * Hook for comments by word
 */
export function useCommentsByWord(word: string | null) {
  const { data: analysisData } = useTextAnalysisData();

  const comments = useMemo(() => {
    if (!word || !analysisData?.comments) return [];

    return analysisData.comments.filter(
      (comment) =>
        comment.themes.includes(word.toLowerCase()) ||
        comment.text.toLowerCase().includes(word.toLowerCase())
    );
  }, [word, analysisData?.comments]);

  return comments;
}

/**
 * Hook for filter state management
 */
export function useTextAnalysisFilters() {
  const [filters, setFilters] = useState<TextAnalysisFilters>({
    dimension: null,
    department: null,
    sentiment: null,
    dateRange: null,
  });

  const updateFilter = <K extends keyof TextAnalysisFilters>(
    key: K,
    value: TextAnalysisFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      dimension: null,
      department: null,
      sentiment: null,
      dateRange: null,
    });
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== null
  ).length;

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    activeFilterCount,
  };
}

/**
 * Hook to get comment by ID
 */
export function useCommentById(id: string) {
  const { data: analysisData } = useTextAnalysisData();

  return useMemo(() => {
    if (!analysisData?.comments) return null;
    return analysisData.comments.find((c) => c.id === id) || null;
  }, [analysisData?.comments, id]);
}
