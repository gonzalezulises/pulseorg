// Clustering and Social Network Types

export type NodeType = "participant" | "theme";
export type EdgeType = "participant_theme" | "participant_participant";
export type SentimentType = "positive" | "neutral" | "negative" | "mixed";
export type EngagementProfile =
  | "Embajadores"
  | "Comprometidos Pragmáticos"
  | "Neutrales"
  | "Desvinculados";

// Base node interface
export interface BaseNode {
  id: string;
  type: NodeType;
  label: string;
  color: string;
  size: number;
  sentiment: SentimentType;
  sentiment_score: number;
}

// Participant node
export interface ParticipantNode extends BaseNode {
  type: "participant";
  department: string;
  department_name: string;
  profile: EngagementProfile;
  comment_count: number;
  themes: string[];
  theme_count: number;
  border_color: string;
  comment_ids: string[];
  sample_comment: string;
}

// Theme/Cluster node
export interface ThemeNode extends BaseNode {
  type: "theme";
  theme_id: string;
  frequency: number;
  keywords: string[];
  dimensions: string[];
  participant_count: number;
}

// Union type for all nodes
export type ClusterNode = ParticipantNode | ThemeNode;

// Edge interface
export interface ClusterEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
  sentiment: SentimentType;
  color: string;
  width: number;
  common_themes?: string[];
}

// Network metrics
export interface NetworkMetrics {
  total_nodes: number;
  participant_count: number;
  theme_count: number;
  total_edges: number;
  participant_edges: number;
  theme_edges: number;
  density: number;
  avg_degree: number;
  max_degree: number;
  influencers: Influencer[];
  bridges: Bridge[];
  isolated_count: number;
  isolated_participants: IsolatedParticipant[];
  department_distribution: DepartmentDistribution[];
  profile_distribution: ProfileDistribution[];
}

export interface Influencer {
  id: string;
  label: string;
  department: string;
  profile: EngagementProfile;
  connections: number;
  themes: string[];
}

export interface Bridge {
  id: string;
  label: string;
  department: string;
  profile: EngagementProfile;
  theme_diversity: number;
  themes: string[];
}

export interface IsolatedParticipant {
  id: string;
  label: string;
  department: string;
}

export interface DepartmentDistribution {
  department: string;
  count: number;
}

export interface ProfileDistribution {
  profile: EngagementProfile;
  count: number;
  color: string;
}

// Cluster/Theme detail
export interface ClusterDetail {
  id: string;
  name: string;
  keywords: string[];
  sentiment: SentimentType;
  sentiment_score: number;
  participant_count: number;
  participants: ClusterParticipant[];
  representative_comments: RepresentativeComment[];
  department_distribution: DepartmentDistribution[];
  profile_distribution: ProfileDistribution[];
  dimensions: string[];
  recommendations: string[];
}

export interface ClusterParticipant {
  id: string;
  label: string;
  department: string;
  profile: EngagementProfile;
  sentiment: SentimentType;
  connection_weight: number;
}

export interface RepresentativeComment {
  text: string;
  sentiment: SentimentType;
  department: string;
}

// Filter options
export interface FilterOption {
  id: string;
  name: string;
  color?: string;
}

export interface ClusteringFilters {
  departments: FilterOption[];
  profiles: FilterOption[];
  sentiments: FilterOption[];
  themes: FilterOption[];
}

// Main clustering data structure
export interface ClusteringData {
  generated_at: string;
  source: string;
  total_comments_processed: number;
  nodes: ClusterNode[];
  edges: ClusterEdge[];
  metrics: NetworkMetrics;
  clusters: ClusterDetail[];
  filters: ClusteringFilters;
}

// Graph visualization types (for D3/Force Graph)
export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  color: string;
  size: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  vx?: number;
  vy?: number;
  // Additional properties for rendering
  borderColor?: string;
  profile?: EngagementProfile;
  department?: string;
  sentiment?: SentimentType;
  [key: string]: unknown;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
  color: string;
  type: EdgeType;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Filter state
export interface ClusterFilterState {
  departments: string[];
  profiles: EngagementProfile[];
  sentiments: SentimentType[];
  themes: string[];
  minConnections: number;
  showParticipantEdges: boolean;
  showThemeEdges: boolean;
  nodeSize: number; // Scale factor for node sizes (0.3 - 1.5)
  minCommonThemes: number; // Minimum themes in common for participant-participant edges
}
