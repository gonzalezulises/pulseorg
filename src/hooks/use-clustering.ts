"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import { useCompany } from "@/contexts/company-context";
import type {
  ClusteringData,
  ClusterNode,
  ClusterEdge,
  ClusterDetail,
  NetworkMetrics,
  ClusteringFilters,
  ClusterFilterState,
  GraphData,
  GraphNode,
  GraphLink,
  ParticipantNode,
  ThemeNode,
  EngagementProfile,
  SentimentType,
} from "@/types/clustering";

// Main hook for all clustering data
export function useClusteringData() {
  const { companyId } = useCompany();

  return useQuery<ClusteringData>({
    queryKey: ["clustering", companyId],
    queryFn: async () => {
      const response = await fetch(`/data/${companyId}/clustering_data.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch clustering data");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for network metrics
export function useNetworkMetrics() {
  const { data, isLoading, error } = useClusteringData();

  return {
    data: data?.metrics,
    isLoading,
    error,
  };
}

// Hook for cluster details
export function useClusterDetails() {
  const { data, isLoading, error } = useClusteringData();

  return {
    data: data?.clusters || [],
    isLoading,
    error,
  };
}

// Hook for filter options
export function useClusterFilters() {
  const { data, isLoading, error } = useClusteringData();

  return {
    data: data?.filters,
    isLoading,
    error,
  };
}

// Hook for a specific cluster detail
export function useClusterDetail(clusterId: string | null) {
  const { data: clusters } = useClusterDetails();

  return useMemo(() => {
    if (!clusterId) return null;
    return clusters.find((c) => c.id === clusterId) || null;
  }, [clusters, clusterId]);
}

// Default filter state
const defaultFilterState: ClusterFilterState = {
  departments: [],
  profiles: [],
  sentiments: [],
  themes: [],
  minConnections: 2,
  showParticipantEdges: true,
  showThemeEdges: true,
  nodeSize: 0.5, // Default scale factor (smaller nodes)
  minCommonThemes: 4, // Minimum themes for participant-participant edges
};

// Hook for managing filter state and filtered graph data
export function useFilteredGraphData(initialFilters?: Partial<ClusterFilterState>) {
  const { data, isLoading, error } = useClusteringData();
  const [filters, setFilters] = useState<ClusterFilterState>({
    ...defaultFilterState,
    ...initialFilters,
  });

  // Update a single filter
  const updateFilter = useCallback(
    <K extends keyof ClusterFilterState>(key: K, value: ClusterFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilterState);
  }, []);

  // Filter nodes based on current filters
  const filteredNodes = useMemo(() => {
    if (!data?.nodes) return [];

    return data.nodes.filter((node) => {
      // Filter participant nodes
      if (node.type === "participant") {
        const pNode = node as ParticipantNode;

        // Department filter
        if (
          filters.departments.length > 0 &&
          !filters.departments.includes(pNode.department)
        ) {
          return false;
        }

        // Profile filter
        if (
          filters.profiles.length > 0 &&
          !filters.profiles.includes(pNode.profile)
        ) {
          return false;
        }

        // Sentiment filter
        if (
          filters.sentiments.length > 0 &&
          !filters.sentiments.includes(pNode.sentiment)
        ) {
          return false;
        }

        return true;
      }

      // Filter theme nodes
      if (node.type === "theme") {
        const tNode = node as ThemeNode;

        // Theme filter
        if (filters.themes.length > 0 && !filters.themes.includes(tNode.theme_id)) {
          return false;
        }

        // Sentiment filter for themes
        if (
          filters.sentiments.length > 0 &&
          !filters.sentiments.includes(tNode.sentiment)
        ) {
          return false;
        }

        return true;
      }

      return true;
    });
  }, [data?.nodes, filters]);

  // Get IDs of filtered nodes
  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes]
  );

  // Filter edges based on filtered nodes and edge type settings
  const filteredEdges = useMemo(() => {
    if (!data?.edges) return [];

    return data.edges.filter((edge) => {
      // Both source and target must be in filtered nodes
      if (!filteredNodeIds.has(edge.source) || !filteredNodeIds.has(edge.target)) {
        return false;
      }

      // Edge type filter
      if (edge.type === "participant_participant" && !filters.showParticipantEdges) {
        return false;
      }

      if (edge.type === "participant_theme" && !filters.showThemeEdges) {
        return false;
      }

      // Minimum connections filter (only for participant-participant edges)
      if (edge.type === "participant_participant" && edge.weight < filters.minConnections) {
        return false;
      }

      // Minimum common themes filter (only for participant-participant edges)
      if (edge.type === "participant_participant") {
        const commonThemesCount = edge.common_themes?.length || 0;
        if (commonThemesCount < filters.minCommonThemes) {
          return false;
        }
      }

      return true;
    });
  }, [data?.edges, filteredNodeIds, filters]);

  // Convert to graph format for visualization
  const graphData: GraphData = useMemo(() => {
    const sizeScale = filters.nodeSize;

    const nodes: GraphNode[] = filteredNodes.map((node) => ({
      id: node.id,
      label: node.label,
      type: node.type,
      color: node.color,
      size: node.size * sizeScale, // Apply size scaling
      borderColor: node.type === "participant" ? (node as ParticipantNode).border_color : undefined,
      profile: node.type === "participant" ? (node as ParticipantNode).profile : undefined,
      department: node.type === "participant" ? (node as ParticipantNode).department_name : undefined,
      sentiment: node.sentiment,
    }));

    const links: GraphLink[] = filteredEdges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      value: edge.weight,
      color: edge.color,
      type: edge.type,
    }));

    return { nodes, links };
  }, [filteredNodes, filteredEdges, filters.nodeSize]);

  // Statistics about filtered data
  const stats = useMemo(() => {
    const participantNodes = filteredNodes.filter((n) => n.type === "participant");
    const themeNodes = filteredNodes.filter((n) => n.type === "theme");
    const participantEdges = filteredEdges.filter((e) => e.type === "participant_participant");
    const themeEdges = filteredEdges.filter((e) => e.type === "participant_theme");

    return {
      totalNodes: filteredNodes.length,
      participantCount: participantNodes.length,
      themeCount: themeNodes.length,
      totalEdges: filteredEdges.length,
      participantEdges: participantEdges.length,
      themeEdges: themeEdges.length,
      isFiltered:
        filters.departments.length > 0 ||
        filters.profiles.length > 0 ||
        filters.sentiments.length > 0 ||
        filters.themes.length > 0,
    };
  }, [filteredNodes, filteredEdges, filters]);

  return {
    graphData,
    filters,
    updateFilter,
    resetFilters,
    stats,
    isLoading,
    error,
    rawData: data,
  };
}

// Hook for influencers and bridges
export function useNetworkAnalysis() {
  const { data } = useNetworkMetrics();

  return useMemo(() => {
    if (!data) {
      return {
        influencers: [],
        bridges: [],
        isolated: [],
        departmentDistribution: [],
        profileDistribution: [],
      };
    }

    return {
      influencers: data.influencers || [],
      bridges: data.bridges || [],
      isolated: data.isolated_participants || [],
      departmentDistribution: data.department_distribution || [],
      profileDistribution: data.profile_distribution || [],
    };
  }, [data]);
}

// Hook for getting node details by ID
export function useNodeDetail(nodeId: string | null) {
  const { data } = useClusteringData();

  return useMemo(() => {
    if (!nodeId || !data?.nodes) return null;
    return data.nodes.find((n) => n.id === nodeId) || null;
  }, [data?.nodes, nodeId]);
}

// Hook for getting connected nodes
export function useConnectedNodes(nodeId: string | null) {
  const { data } = useClusteringData();

  return useMemo(() => {
    if (!nodeId || !data) return { nodes: [], edges: [] };

    const connectedEdges = data.edges.filter(
      (e) => e.source === nodeId || e.target === nodeId
    );

    const connectedNodeIds = new Set<string>();
    connectedEdges.forEach((e) => {
      if (e.source !== nodeId) connectedNodeIds.add(e.source);
      if (e.target !== nodeId) connectedNodeIds.add(e.target);
    });

    const connectedNodes = data.nodes.filter((n) => connectedNodeIds.has(n.id));

    return {
      nodes: connectedNodes,
      edges: connectedEdges,
    };
  }, [data, nodeId]);
}
