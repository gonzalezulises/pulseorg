"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DimensionStatV2 } from "@/types/clima-v2";
import { getSegmentColor } from "@/types/clima-v2";

interface DimensionRadarV2Props {
  data: DimensionStatV2[];
  title?: string;
  showBenchmark?: boolean;
}

interface RadarDataPoint {
  dimension: string;
  dimension_code: string;
  score: number;
  favorability: number;
  benchmark: number;
  segment: string;
  fullMark: number;
}

export function DimensionRadarV2({
  data,
  title = "Puntuación por Indicador (17 indicadores)",
  showBenchmark = false,
}: DimensionRadarV2Props) {
  // Preparar datos para el gráfico radar (top 8 dimensiones para legibilidad)
  const topDimensions = [...data]
    .sort((a, b) => b.avg_score - a.avg_score)
    .slice(0, 8);

  const radarData: RadarDataPoint[] = topDimensions.map((d) => ({
    dimension: d.dimension_name,
    dimension_code: d.dimension_code,
    score: d.avg_score,
    favorability: d.favorability_pct,
    benchmark: d.benchmark,
    segment: d.segment,
    fullMark: 5,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Top 8 indicadores por puntuación
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickCount={6}
              />
              <Radar
                name="Puntuación"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              {showBenchmark && (
                <Radar
                  name="Referencia"
                  dataKey="benchmark"
                  stroke="hsl(var(--muted-foreground))"
                  fill="transparent"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
              )}
              <Legend />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as RadarDataPoint;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <p className="font-medium">{data.dimension}</p>
                        <div className="mt-1 space-y-1 text-sm">
                          <p>
                            Puntuación:{" "}
                            <span
                              className="font-semibold"
                              style={{ color: getSegmentColor(data.segment as any) }}
                            >
                              {data.score.toFixed(2)}/5.00
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            Favorabilidad: {data.favorability.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
