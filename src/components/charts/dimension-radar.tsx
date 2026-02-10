"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DIMENSION_LABELS, type DimensionStatistics } from "@/types/api";

interface DimensionRadarProps {
  data: DimensionStatistics[];
  title?: string;
}

interface RadarDataPoint {
  dimension: string;
  label: string;
  favorability: number;
  fullMark: number;
}

export function DimensionRadar({
  data,
  title = "Favorabilidad por Dimensión",
}: DimensionRadarProps) {
  // Preparar datos para el gráfico radar
  const radarData: RadarDataPoint[] = data.map((d) => ({
    dimension: d.dimension,
    label: DIMENSION_LABELS[d.dimension] || d.dimension,
    favorability: Math.round(d.favorability_pct),
    fullMark: 100,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="label"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickCount={5}
              />
              <Radar
                name="Favorabilidad"
                dataKey="favorability"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as RadarDataPoint;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="font-medium">{data.label}</p>
                        <p className="text-sm text-muted-foreground">
                          Favorabilidad:{" "}
                          <span className="font-semibold text-foreground">
                            {data.favorability}%
                          </span>
                        </p>
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
