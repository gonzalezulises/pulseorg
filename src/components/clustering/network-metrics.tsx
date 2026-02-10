"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Network,
  Star,
  GitBranch,
  AlertTriangle,
  TrendingUp,
  Building2,
} from "lucide-react";
import type { NetworkMetrics, Influencer, Bridge } from "@/types/clustering";

interface NetworkMetricsProps {
  metrics: NetworkMetrics;
  onNodeSelect?: (nodeId: string) => void;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfluencerCard({
  influencer,
  rank,
  onClick,
}: {
  influencer: Influencer;
  rank: number;
  onClick?: () => void;
}) {
  const profileColor =
    influencer.profile === "True Believers"
      ? "#1dc47c"
      : influencer.profile === "Engaged Pragmáticos"
      ? "#00B4D8"
      : influencer.profile === "Neutrales"
      ? "#F59E0B"
      : "#DC2626";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
        #{rank}
      </div>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
        style={{ backgroundColor: profileColor }}
      >
        {influencer.id.replace("P", "")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{influencer.label}</div>
        <div className="text-xs text-muted-foreground truncate">
          {influencer.department}
        </div>
      </div>
      <Badge variant="secondary" className="shrink-0">
        {influencer.connections} conn
      </Badge>
    </motion.div>
  );
}

function BridgeCard({
  bridge,
  rank,
  onClick,
}: {
  bridge: Bridge;
  rank: number;
  onClick?: () => void;
}) {
  const profileColor =
    bridge.profile === "True Believers"
      ? "#1dc47c"
      : bridge.profile === "Engaged Pragmáticos"
      ? "#00B4D8"
      : bridge.profile === "Neutrales"
      ? "#F59E0B"
      : "#DC2626";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
        <GitBranch className="h-4 w-4" />
      </div>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
        style={{ backgroundColor: profileColor }}
      >
        {bridge.id.replace("P", "")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{bridge.label}</div>
        <div className="text-xs text-muted-foreground truncate">
          {bridge.department}
        </div>
      </div>
      <Badge variant="outline" className="shrink-0">
        {bridge.theme_diversity} temas
      </Badge>
    </motion.div>
  );
}

export function NetworkMetricsCard({ metrics, onNodeSelect }: NetworkMetricsProps) {
  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Participantes"
          value={metrics.participant_count}
          color="bg-blue-100 text-blue-600"
          index={0}
        />
        <MetricCard
          icon={Network}
          label="Conexiones"
          value={metrics.participant_edges.toLocaleString()}
          color="bg-purple-100 text-purple-600"
          index={1}
        />
        <MetricCard
          icon={TrendingUp}
          label="Densidad Red"
          value={`${(metrics.density * 100).toFixed(1)}%`}
          color="bg-green-100 text-green-600"
          index={2}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Aislados"
          value={metrics.isolated_count}
          color="bg-red-100 text-red-600"
          index={3}
        />
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Analisis de Comunidades</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="influencers">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="influencers" className="gap-1">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Influenciadores</span>
              </TabsTrigger>
              <TabsTrigger value="bridges" className="gap-1">
                <GitBranch className="h-4 w-4" />
                <span className="hidden sm:inline">Puentes</span>
              </TabsTrigger>
              <TabsTrigger value="distribution" className="gap-1">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Distribucion</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="influencers" className="mt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground mb-3">
                  Participantes con mayor numero de conexiones
                </p>
                <ScrollArea className="h-64">
                  {metrics.influencers.map((inf, idx) => (
                    <InfluencerCard
                      key={inf.id}
                      influencer={inf}
                      rank={idx + 1}
                      onClick={() => onNodeSelect?.(inf.id)}
                    />
                  ))}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="bridges" className="mt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground mb-3">
                  Participantes conectados a multiples temas (puentes entre comunidades)
                </p>
                <ScrollArea className="h-64">
                  {metrics.bridges.map((bridge, idx) => (
                    <BridgeCard
                      key={bridge.id}
                      bridge={bridge}
                      rank={idx + 1}
                      onClick={() => onNodeSelect?.(bridge.id)}
                    />
                  ))}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="distribution" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Department Distribution */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Por Departamento</h4>
                  <div className="space-y-2">
                    {metrics.department_distribution.slice(0, 6).map((dept) => (
                      <div key={dept.department} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="truncate">{dept.department}</span>
                          <span className="text-muted-foreground shrink-0 ml-2">
                            {dept.count}
                          </span>
                        </div>
                        <Progress
                          value={(dept.count / metrics.participant_count) * 100}
                          className="h-1.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profile Distribution */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Por Perfil</h4>
                  <div className="space-y-2">
                    {metrics.profile_distribution.map((profile) => (
                      <div key={profile.profile} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: profile.color }}
                            />
                            <span className="truncate">{profile.profile}</span>
                          </div>
                          <span className="text-muted-foreground shrink-0 ml-2">
                            {profile.count} ({((profile.count / metrics.participant_count) * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <Progress
                          value={(profile.count / metrics.participant_count) * 100}
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
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
