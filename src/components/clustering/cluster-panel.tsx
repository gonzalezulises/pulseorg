"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, MessageSquare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ClusterDetail, SentimentType } from "@/types/clustering";
import { cn } from "@/lib/utils";

interface ClusterPanelProps {
  clusters: ClusterDetail[];
  selectedClusterId?: string | null;
  onClusterSelect?: (clusterId: string) => void;
  maxParticipants?: number;
}

const sentimentConfig: Record<
  SentimentType,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
  positive: {
    icon: TrendingUp,
    label: "Positivo",
    color: "text-green-600 bg-green-100",
  },
  neutral: {
    icon: Minus,
    label: "Neutral",
    color: "text-gray-600 bg-gray-100",
  },
  negative: {
    icon: TrendingDown,
    label: "Negativo",
    color: "text-red-600 bg-red-100",
  },
  mixed: {
    icon: Minus,
    label: "Mixto",
    color: "text-yellow-600 bg-yellow-100",
  },
};

function ClusterCard({
  cluster,
  isSelected,
  onClick,
  maxParticipants,
  index,
}: {
  cluster: ClusterDetail;
  isSelected: boolean;
  onClick: () => void;
  maxParticipants: number;
  index: number;
}) {
  const sentiment = sentimentConfig[cluster.sentiment];
  const SentimentIcon = sentiment.icon;
  const participantPercentage = (cluster.participant_count / maxParticipants) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isSelected && "ring-2 ring-primary"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{cluster.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <Badge
                    variant="outline"
                    className={cn("text-xs", sentiment.color)}
                  >
                    <SentimentIcon className="h-3 w-3 mr-1" />
                    {sentiment.label}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {cluster.participant_count}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <Progress value={participantPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {participantPercentage.toFixed(0)}% del total
              </div>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-1">
              {cluster.keywords.slice(0, 4).map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>

            {/* Sample comment preview */}
            {cluster.representative_comments[0] && (
              <div className="text-xs text-muted-foreground line-clamp-2 italic">
                &quot;{cluster.representative_comments[0].text.slice(0, 80)}...&quot;
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ClusterPanel({
  clusters,
  selectedClusterId,
  onClusterSelect,
  maxParticipants,
}: ClusterPanelProps) {
  const maxP = maxParticipants || Math.max(...clusters.map((c) => c.participant_count));

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Clusters Detectados
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {clusters.length} temas identificados
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-3 p-4 pt-0">
            {clusters.map((cluster, index) => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                isSelected={selectedClusterId === cluster.id}
                onClick={() => onClusterSelect?.(cluster.id)}
                maxParticipants={maxP}
                index={index}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
