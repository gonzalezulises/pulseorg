"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DimensionStatV2 } from "@/types/clima-v2";
import { SEGMENT_COLORS, getSegmentLabel } from "@/types/clima-v2";

interface DimensionBarChartProps {
  dimensions: DimensionStatV2[];
  title?: string;
  showBenchmark?: boolean;
  maxItems?: number;
  sortBy?: "score" | "rank" | "name";
  layout?: "vertical" | "horizontal";
}

export function DimensionBarChart({
  dimensions,
  title = "Puntuación por Indicador",
  showBenchmark = true,
  maxItems = 17,
  sortBy = "score",
  layout = "vertical",
}: DimensionBarChartProps) {
  // Ordenar dimensiones
  const sortedDimensions = [...dimensions].sort((a, b) => {
    if (sortBy === "score") return b.avg_score - a.avg_score;
    if (sortBy === "rank") return a.rank - b.rank;
    return a.dimension_name.localeCompare(b.dimension_name);
  }).slice(0, maxItems);

  // Preparar datos para el gráfico
  const chartData = sortedDimensions.map((d) => ({
    name: d.dimension_name.length > 25
      ? d.dimension_name.substring(0, 25) + "..."
      : d.dimension_name,
    fullName: d.dimension_name,
    score: d.avg_score,
    favorability: d.favorability_pct,
    segment: d.segment,
    benchmark: d.benchmark,
    gap: d.gap_vs_benchmark,
    rank: d.rank,
    color: SEGMENT_COLORS[d.segment],
  }));

  // Calcular promedio para línea de referencia
  const avgScore = dimensions.reduce((sum, d) => sum + d.avg_score, 0) / dimensions.length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{data.fullName}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Puntuación:</span>
              <span className="font-bold" style={{ color: data.color }}>
                {data.score.toFixed(2)}/5.00
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Favorabilidad:</span>
              <span>{data.favorability.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Segmento:</span>
              <span style={{ color: data.color }}>{getSegmentLabel(data.segment)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Ranking:</span>
              <span>#{data.rank}/17</span>
            </div>
            {showBenchmark && (
              <div className="flex justify-between gap-4 pt-1 border-t">
                <span className="text-muted-foreground">Brecha vs Ref.:</span>
                <span className={data.gap >= 0 ? "text-green-600" : "text-red-600"}>
                  {data.gap >= 0 ? "+" : ""}{data.gap.toFixed(1)}pp
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (layout === "horizontal") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={avgScore}
                  stroke="#64748B"
                  strokeDasharray="3 3"
                  label={{ value: `Promedio: ${avgScore.toFixed(2)}`, position: "right", fontSize: 10 }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Layout vertical (default)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: Math.max(400, chartData.length * 35) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <YAxis
                dataKey="name"
                type="category"
                width={180}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={avgScore}
                stroke="#64748B"
                strokeDasharray="3 3"
                label={{ value: `Prom: ${avgScore.toFixed(2)}`, position: "top", fontSize: 10 }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para mostrar comparación de scores
interface DimensionComparisonBarProps {
  currentDimensions: DimensionStatV2[];
  previousDimensions?: DimensionStatV2[];
  title?: string;
  maxItems?: number;
}

export function DimensionComparisonBar({
  currentDimensions,
  previousDimensions,
  title = "Comparación de Indicadores",
  maxItems = 10,
}: DimensionComparisonBarProps) {
  // Preparar datos de comparación
  const comparisonData = currentDimensions
    .map((current) => {
      const previous = previousDimensions?.find(
        (p) => p.dimension_code === current.dimension_code
      );
      return {
        name: current.dimension_name.length > 20
          ? current.dimension_name.substring(0, 20) + "..."
          : current.dimension_name,
        fullName: current.dimension_name,
        current: current.avg_score,
        previous: previous?.avg_score || 0,
        change: previous ? current.avg_score - previous.avg_score : 0,
        segment: current.segment,
        color: SEGMENT_COLORS[current.segment],
      };
    })
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <p className="font-medium text-sm mb-2">{data.fullName}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-primary">Actual:</span>
                            <span className="font-bold">{data.current.toFixed(2)}</span>
                          </div>
                          {previousDimensions && (
                            <>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Anterior:</span>
                                <span>{data.previous.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between gap-4 pt-1 border-t">
                                <span>Cambio:</span>
                                <span className={data.change >= 0 ? "text-green-600" : "text-red-600"}>
                                  {data.change >= 0 ? "+" : ""}{data.change.toFixed(2)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="current" name="Actual" fill="#0052CC" radius={[0, 4, 4, 0]} />
              {previousDimensions && (
                <Bar dataKey="previous" name="Anterior" fill="#94A3B8" radius={[0, 4, 4, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
