"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alert, AlertSeverity } from "@/types/api";
import { DIMENSION_LABELS } from "@/types/api";

interface AlertListProps {
  alerts: Alert[];
  title?: string;
  maxItems?: number;
  showRecommendations?: boolean;
}

const severityConfig: Record<
  AlertSeverity,
  { icon: typeof AlertCircle; color: string; bgColor: string }
> = {
  critical: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
};

const severityLabels: Record<AlertSeverity, string> = {
  critical: "Crítico",
  warning: "Advertencia",
  info: "Información",
};

const alertTypeLabels: Record<string, string> = {
  ceiling: "Techo",
  dispersion: "Dispersión",
  decline: "Declive",
};

export function AlertList({
  alerts,
  title = "Alertas Recientes",
  maxItems = 5,
  showRecommendations = false,
}: AlertListProps) {
  const displayedAlerts = alerts.slice(0, maxItems);

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Info className="h-8 w-8 mb-2" />
            <p className="text-sm">No hay alertas activas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          {title}
          {alerts.length > maxItems && (
            <span className="text-xs font-normal text-muted-foreground">
              +{alerts.length - maxItems} más
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedAlerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={cn("rounded-lg p-3", config.bgColor)}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", config.color)}
                    >
                      {severityLabels[alert.severity]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {alertTypeLabels[alert.alert_type] || alert.alert_type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {DIMENSION_LABELS[alert.dimension] || alert.dimension}
                    </Badge>
                  </div>

                  <p className="text-sm font-medium mt-1 truncate">
                    {alert.item_text}
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.description}
                  </p>

                  {showRecommendations && alert.recommendation && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Recomendación: {alert.recommendation}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Valor actual: {alert.current_value.toFixed(1)}</span>
                    <span>Umbral: {alert.threshold_value.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
