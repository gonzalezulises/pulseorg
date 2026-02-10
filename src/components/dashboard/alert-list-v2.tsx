"use client";

import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AlertV2 } from "@/hooks/use-clima-v2";

interface AlertListV2Props {
  alerts: AlertV2[];
  title?: string;
  showRecommendations?: boolean;
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/20",
    badge: "destructive" as const,
    label: "Crítico",
  },
  warning: {
    icon: AlertCircle,
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    badge: "outline" as const,
    label: "Atención",
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    badge: "secondary" as const,
    label: "Info",
  },
};

export function AlertListV2({
  alerts,
  title = "Dimensiones que Requieren Atención",
}: AlertListV2Props) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 dark:bg-green-950/30 p-3 mb-3">
              <Info className="h-6 w-6 text-green-600" />
            </div>
            <p className="font-medium">Todas las dimensiones en zona positiva</p>
            <p className="text-sm text-muted-foreground">
              No hay alertas críticas en este momento
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {alerts.length} alertas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg ${config.bg} transition-colors`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 ${config.color} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-medium text-sm">
                      {alert.dimension_name}
                    </h4>
                    <Badge variant={config.badge} className="text-xs shrink-0">
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Score: <strong className={config.color}>{alert.score.toFixed(2)}</strong>
                      {" / "}
                      Benchmark: {alert.benchmark}%
                    </span>
                    <span
                      className={
                        alert.gap >= 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {alert.gap >= 0 ? "+" : ""}
                      {alert.gap.toFixed(1)}pp
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    {alert.recommendation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
