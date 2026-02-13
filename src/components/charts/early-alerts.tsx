"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { EarlyAlert, AlertSeverity, ChangeVelocity } from "@/types/predictions";
import { SEVERITY_COLORS, SCORE_COLORS, getScoreColor } from "@/types/predictions";
import {
  AlertTriangle,
  TrendingDown,
  Zap,
  Clock,
  Lightbulb,
  Bell,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface EarlyAlertsListProps {
  alerts: EarlyAlert[];
  title?: string;
}

export function EarlyAlertsList({
  alerts,
  title = "Alertas Tempranas",
}: EarlyAlertsListProps) {
  const newAlerts = alerts.filter((a) => a.is_new);
  const oldAlerts = alerts.filter((a) => !a.is_new);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {title}
              {newAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {newAlerts.length} nuevas
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Indicadores con deterioro significativo detectado
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mb-3 text-green-500" />
            <p>No hay alertas activas</p>
            <p className="text-sm">Todos los indicadores están estables</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* New alerts first */}
            {newAlerts.map((alert) => (
              <EarlyAlertCard key={alert.id} alert={alert} />
            ))}

            {/* Then older alerts */}
            {oldAlerts.map((alert) => (
              <EarlyAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EarlyAlertCardProps {
  alert: EarlyAlert;
}

export function EarlyAlertCard({ alert }: EarlyAlertCardProps) {
  const getSeverityLabel = (severity: AlertSeverity) => {
    switch (severity) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
    }
  };

  const getVelocityLabel = (velocity: ChangeVelocity) => {
    switch (velocity) {
      case "rapid":
        return "Rápida";
      case "moderate":
        return "Moderada";
      case "slow":
        return "Lenta";
    }
  };

  const getVelocityIcon = (velocity: ChangeVelocity) => {
    switch (velocity) {
      case "rapid":
        return <Zap className="h-3 w-3" />;
      case "moderate":
        return <TrendingDown className="h-3 w-3" />;
      case "slow":
        return <Clock className="h-3 w-3" />;
    }
  };

  // Mini sparkline data
  const sparklineData = alert.trend_data.map((t) => ({
    month: t.month.split("-")[1],
    score: t.score,
  }));

  return (
    <div
      className={`p-4 rounded-lg border-l-4 bg-card hover:bg-muted/30 transition-colors ${
        alert.is_new ? "ring-2 ring-offset-2 ring-offset-background" : ""
      }`}
      style={{
        borderLeftColor: SEVERITY_COLORS[alert.severity],
        ...(alert.is_new && { "--tw-ring-color": SEVERITY_COLORS[alert.severity] } as React.CSSProperties),
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle
              className="h-4 w-4 flex-shrink-0"
              style={{ color: SEVERITY_COLORS[alert.severity] }}
            />
            <h4 className="font-medium text-sm truncate">{alert.label}</h4>
            {alert.is_new && (
              <Badge variant="secondary" className="text-xs">
                Nueva
              </Badge>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <Badge
              variant="outline"
              style={{
                borderColor: SEVERITY_COLORS[alert.severity],
                color: SEVERITY_COLORS[alert.severity],
              }}
            >
              Severidad: {getSeverityLabel(alert.severity)}
            </Badge>
            <Badge variant="outline" className="gap-1">
              {getVelocityIcon(alert.change_velocity)}
              Velocidad: {getVelocityLabel(alert.change_velocity)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {alert.months_declining} meses en declive
            </span>
          </div>

          {/* Score change */}
          <div className="flex items-center gap-4 mb-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Anterior</p>
              <p
                className="text-lg font-bold"
                style={{ color: getScoreColor(alert.previous_score) }}
              >
                {alert.previous_score.toFixed(2)}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Actual</p>
              <p
                className="text-lg font-bold"
                style={{ color: getScoreColor(alert.current_score) }}
              >
                {alert.current_score.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Cambio</p>
              <p className="text-lg font-bold text-red-600">
                {alert.change.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Affected areas */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">Áreas afectadas:</span>
            <div className="flex flex-wrap gap-1">
              {alert.affected_areas.map((area) => (
                <Badge key={area} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                  Recomendación
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {alert.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mini trend chart */}
        <div className="w-[100px] h-[60px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <ReferenceLine y={3.5} stroke={SCORE_COLORS.warning} strokeDasharray="2 2" />
              <Line
                type="monotone"
                dataKey="score"
                stroke={SEVERITY_COLORS[alert.severity]}
                strokeWidth={2}
                dot={false}
              />
              <XAxis dataKey="month" hide />
              <YAxis domain={[3, 4.5]} hide />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface AlertsSummaryCardsProps {
  totalAlerts: number;
  newAlerts: number;
  highSeverity: number;
  dimensionsImproving: number;
  dimensionsDeclining: number;
}

export function AlertsSummaryCards({
  totalAlerts,
  newAlerts,
  highSeverity,
  dimensionsImproving,
  dimensionsDeclining,
}: AlertsSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Bell className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalAlerts}</p>
              <p className="text-xs text-muted-foreground">Alertas Activas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{newAlerts}</p>
              <p className="text-xs text-muted-foreground">Alertas Nuevas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{highSeverity}</p>
              <p className="text-xs text-muted-foreground">Alta Severidad</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <TrendingDown className="h-5 w-5 text-green-600 rotate-180" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{dimensionsImproving}</p>
              <p className="text-xs text-muted-foreground">Mejorando</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{dimensionsDeclining}</p>
              <p className="text-xs text-muted-foreground">En Declive</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
