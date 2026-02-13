"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type {
  OverallProjection,
  DimensionProjection,
  HistoricalPoint,
  ForecastPoint,
} from "@/types/predictions";
import { SCORE_COLORS, getScoreColor, getScoreStatus } from "@/types/predictions";
import { TrendingUp, TrendingDown, Minus, LineChart as LineChartIcon } from "lucide-react";

interface ProjectionChartProps {
  data: OverallProjection;
  title?: string;
}

export function ProjectionChart({
  data,
  title = "Proyección de Puntuación General",
}: ProjectionChartProps) {
  // Combine historical and forecast data for the chart
  const chartData = [
    ...data.historical.map((h) => ({
      month: formatMonth(h.month),
      actual: h.score,
      optimistic: null as number | null,
      expected: null as number | null,
      pessimistic: null as number | null,
    })),
    // Add transition point (last historical + first forecast)
    {
      month: formatMonth(data.forecast[0]?.month || ""),
      actual: data.historical[data.historical.length - 1]?.score,
      optimistic: data.forecast[0]?.optimistic,
      expected: data.forecast[0]?.expected,
      pessimistic: data.forecast[0]?.pessimistic,
    },
    ...data.forecast.slice(1).map((f) => ({
      month: formatMonth(f.month),
      actual: null as number | null,
      optimistic: f.optimistic,
      expected: f.expected,
      pessimistic: f.pessimistic,
    })),
  ];

  const projected6m = data.forecast[5];
  const projected12m = data.forecast[11];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <LineChartIcon className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              Score actual: {data.current_score.toFixed(2)} | Proyecciones a 6 y 12 meses
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              6m: {projected6m?.expected.toFixed(2)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              12m: {projected12m?.expected.toFixed(2)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SCORE_COLORS.good} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={SCORE_COLORS.good} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPessimistic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SCORE_COLORS.danger} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={SCORE_COLORS.danger} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[3, 5]} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <p className="font-medium mb-2">{label}</p>
                        {payload.map((p, i) => {
                          if (p.value == null) return null;
                          return (
                            <p
                              key={i}
                              className="text-sm"
                              style={{ color: p.color }}
                            >
                              {p.name}: {Number(p.value).toFixed(2)}
                            </p>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={4.0}
                stroke={SCORE_COLORS.good}
                strokeDasharray="5 5"
                label={{ value: "Meta (4.0)", position: "right", fontSize: 10 }}
              />
              <ReferenceLine
                y={3.5}
                stroke={SCORE_COLORS.warning}
                strokeDasharray="5 5"
              />

              {/* Confidence band - optimistic */}
              <Area
                type="monotone"
                dataKey="optimistic"
                name="Optimista"
                stroke={SCORE_COLORS.good}
                fill="url(#colorOptimistic)"
                strokeWidth={1}
                strokeDasharray="3 3"
                connectNulls
              />

              {/* Confidence band - pessimistic */}
              <Area
                type="monotone"
                dataKey="pessimistic"
                name="Pesimista"
                stroke={SCORE_COLORS.danger}
                fill="url(#colorPessimistic)"
                strokeWidth={1}
                strokeDasharray="3 3"
                connectNulls
              />

              {/* Expected projection */}
              <Line
                type="monotone"
                dataKey="expected"
                name="Esperado"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls
              />

              {/* Actual historical data */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="#1e40af"
                strokeWidth={3}
                dot={{ fill: "#1e40af", r: 4 }}
                connectNulls
              />

              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Actual</p>
            <p
              className="text-2xl font-bold"
              style={{ color: getScoreColor(data.current_score) }}
            >
              {data.current_score.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <p className="text-sm text-muted-foreground">6 Meses</p>
            <p className="text-2xl font-bold text-blue-600">
              {projected6m?.expected.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              ({projected6m?.pessimistic.toFixed(2)} - {projected6m?.optimistic.toFixed(2)})
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <p className="text-sm text-muted-foreground">12 Meses</p>
            <p className="text-2xl font-bold text-blue-600">
              {projected12m?.expected.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              ({projected12m?.pessimistic.toFixed(2)} - {projected12m?.optimistic.toFixed(2)})
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatMonth(month: string): string {
  if (!month) return "";
  const [year, m] = month.split("-");
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${months[parseInt(m) - 1]} ${year.slice(2)}`;
}

interface DimensionProjectionsProps {
  data: DimensionProjection[];
  title?: string;
}

export function DimensionProjections({
  data,
  title = "Proyecciones por Indicador",
}: DimensionProjectionsProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Sort by current score descending
  const sortedData = [...data].sort((a, b) => b.current_score - a.current_score);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          Evolución esperada de los indicadores críticos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedData.map((dim) => (
            <div
              key={dim.dimension}
              className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTrendIcon(dim.trend)}
                  <span className="font-medium text-sm">{dim.label}</span>
                </div>
                <Badge
                  variant="outline"
                  style={{
                    borderColor: getScoreColor(dim.current_score),
                    color: getScoreColor(dim.current_score),
                  }}
                >
                  {dim.current_score.toFixed(2)}
                </Badge>
              </div>

              {/* Mini projection bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                  {/* Scale from 1-5 */}
                  <div
                    className="absolute h-full bg-muted-foreground/20 rounded-full"
                    style={{ width: `${((dim.current_score - 1) / 4) * 100}%` }}
                  />
                  {/* Current score marker */}
                  <div
                    className="absolute h-full w-1 bg-foreground rounded-full"
                    style={{ left: `${((dim.current_score - 1) / 4) * 100}%` }}
                  />
                  {/* 6m projection marker */}
                  <div
                    className="absolute h-full w-1 bg-blue-500/50 rounded-full"
                    style={{ left: `${((dim.projected_6m - 1) / 4) * 100}%` }}
                  />
                  {/* 12m projection marker */}
                  <div
                    className="absolute h-full w-1 bg-blue-500 rounded-full"
                    style={{ left: `${((dim.projected_12m - 1) / 4) * 100}%` }}
                  />
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground whitespace-nowrap">
                  <span>6m: {dim.projected_6m.toFixed(2)}</span>
                  <span>12m: {dim.projected_12m.toFixed(2)}</span>
                </div>
              </div>

              {/* Change indicator */}
              <div className="mt-2 text-xs text-muted-foreground">
                Cambio mensual:{" "}
                <span
                  style={{
                    color:
                      dim.change_rate > 0
                        ? SCORE_COLORS.good
                        : dim.change_rate < 0
                        ? SCORE_COLORS.danger
                        : undefined,
                  }}
                >
                  {dim.change_rate > 0 ? "+" : ""}
                  {(dim.change_rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
