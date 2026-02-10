"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Quote,
  Target,
} from "lucide-react";
import type { ClusterDetail, SentimentType } from "@/types/clustering";
import { cn } from "@/lib/utils";

interface ClusterDetailViewProps {
  cluster: ClusterDetail;
  onClose?: () => void;
}

const sentimentConfig: Record<
  SentimentType,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string; bgColor: string }
> = {
  positive: {
    icon: TrendingUp,
    label: "Positivo",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  neutral: {
    icon: Minus,
    label: "Neutral",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  negative: {
    icon: TrendingDown,
    label: "Negativo",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  mixed: {
    icon: Minus,
    label: "Mixto",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
};

export function ClusterDetailView({ cluster, onClose }: ClusterDetailViewProps) {
  const sentiment = sentimentConfig[cluster.sentiment];
  const SentimentIcon = sentiment.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {cluster.name}
                <Badge variant="outline" className={cn(sentiment.bgColor, sentiment.color)}>
                  <SentimentIcon className="h-3 w-3 mr-1" />
                  {sentiment.label}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {cluster.participant_count} participantes conectados
              </CardDescription>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                &times;
              </button>
            )}
          </div>

          {/* Keywords */}
          <div className="flex flex-wrap gap-1 mt-2">
            {cluster.keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Distribution Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Department Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Distribucion por Area
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cluster.department_distribution.slice(0, 5).map((dept) => (
                    <div key={dept.department} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{dept.department}</span>
                        <span className="text-muted-foreground">{dept.count}</span>
                      </div>
                      <Progress
                        value={(dept.count / cluster.participant_count) * 100}
                        className="h-1.5"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Profile Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Distribucion por Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cluster.profile_distribution.map((profile) => (
                    <div key={profile.profile} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: profile.color }}
                          />
                          <span>{profile.profile}</span>
                        </div>
                        <span className="text-muted-foreground">{profile.count}</span>
                      </div>
                      <Progress
                        value={(profile.count / cluster.participant_count) * 100}
                        className="h-1.5"
                        style={
                          {
                            "--progress-foreground": profile.color,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Representative Comments */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Quote className="h-4 w-4" />
              Comentarios Representativos
            </h4>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {cluster.representative_comments.map((comment, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-lg bg-muted/50"
                  >
                    <p className="text-sm italic">&quot;{comment.text}&quot;</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {comment.department}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          sentimentConfig[comment.sentiment]?.bgColor,
                          sentimentConfig[comment.sentiment]?.color
                        )}
                      >
                        {sentimentConfig[comment.sentiment]?.label || comment.sentiment}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Top Participants */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              Top Participantes Conectados
            </h4>
            <div className="grid gap-2 md:grid-cols-2">
              {cluster.participants.slice(0, 6).map((participant, idx) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                      style={{
                        backgroundColor:
                          participant.profile === "True Believers"
                            ? "#1dc47c"
                            : participant.profile === "Engaged Pragmáticos"
                            ? "#00B4D8"
                            : participant.profile === "Neutrales"
                            ? "#F59E0B"
                            : "#DC2626",
                      }}
                    >
                      {participant.id.replace("P", "")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{participant.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {participant.department}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {participant.connection_weight} conn
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Recommendations */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Recomendaciones
            </h4>
            <div className="space-y-2">
              {cluster.recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 p-2 rounded-lg bg-primary/5"
                >
                  <Target className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span className="text-sm">{rec}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          {cluster.dimensions.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Dimensiones Asociadas</h4>
                <div className="flex flex-wrap gap-1">
                  {cluster.dimensions.map((dim) => (
                    <Badge key={dim} variant="outline">
                      {dim.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
