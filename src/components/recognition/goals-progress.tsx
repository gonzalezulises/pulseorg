"use client";

import { motion } from "framer-motion";
import { Target, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { GoalProgress } from "@/types/recognition";

interface GoalsProgressProps {
  goals: GoalProgress[];
}

const statusConfig = {
  achieved: {
    icon: CheckCircle,
    label: "Logrado",
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
    progressColor: "bg-green-500",
  },
  on_track: {
    icon: Clock,
    label: "En camino",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
    progressColor: "bg-blue-500",
  },
  needs_attention: {
    icon: AlertTriangle,
    label: "Requiere atencion",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
    progressColor: "bg-yellow-500",
  },
  at_risk: {
    icon: AlertTriangle,
    label: "En riesgo",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
    progressColor: "bg-orange-500",
  },
  critical: {
    icon: XCircle,
    label: "Critico",
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    progressColor: "bg-red-500",
  },
};

function GoalCard({ goal, index }: { goal: GoalProgress; index: number }) {
  const config = statusConfig[goal.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor}/30`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-sm">{goal.name}</h4>
          <p className="text-xs text-muted-foreground">
            Meta: {goal.target} para {new Date(goal.deadline).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}
          </p>
        </div>
        <Badge variant="outline" className={`${config.bgColor} ${config.color} ${config.borderColor}`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Actual: <span className="font-medium text-foreground">{goal.current.toFixed(2)}</span></span>
          <span className="font-medium">{goal.progress.toFixed(0)}%</span>
        </div>

        <div className="relative">
          <Progress value={goal.progress} className="h-3" />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(goal.progress, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`absolute top-0 left-0 h-3 rounded-full ${config.progressColor}`}
          />
        </div>

        {/* Target marker */}
        <div className="relative h-2">
          <div
            className="absolute top-0 w-0.5 h-2 bg-foreground/50"
            style={{ left: "100%" }}
          />
          <span className="absolute -top-1 text-xs text-muted-foreground" style={{ left: "100%", transform: "translateX(-50%)" }}>
            {goal.target}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function GoalsProgress({ goals }: GoalsProgressProps) {
  const achieved = goals.filter((g) => g.status === "achieved").length;
  const onTrack = goals.filter((g) => g.status === "on_track").length;
  const needsAttention = goals.filter((g) => g.status === "needs_attention" || g.status === "at_risk").length;
  const critical = goals.filter((g) => g.status === "critical").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progreso hacia Metas Anuales
            </CardTitle>
            <CardDescription>
              Estado de cumplimiento de objetivos organizacionales
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              {achieved} logrados
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              {onTrack} en camino
            </Badge>
            {needsAttention > 0 && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                {needsAttention} requieren atencion
              </Badge>
            )}
            {critical > 0 && (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                {critical} criticos
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal, idx) => (
            <GoalCard key={goal.dimension} goal={goal} index={idx} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
