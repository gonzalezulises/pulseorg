"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LongitudinalTrend } from "@/types/api";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/api";

interface TrendLineProps {
  data: LongitudinalTrend[];
  title?: string;
  showLegend?: boolean;
}

interface ChartDataPoint {
  year: number;
  [key: string]: number;
}

export function TrendLine({
  data,
  title = "Tendencia de Favorabilidad",
  showLegend = true,
}: TrendLineProps) {
  // Obtener todos los años únicos
  const allYears = Array.from(new Set(data.flatMap((d) => d.years))).sort();

  // Agrupar por dimensión y preparar datos
  const dimensionData = new Map<string, Map<number, number>>();

  data.forEach((trend) => {
    if (!dimensionData.has(trend.dimension)) {
      dimensionData.set(trend.dimension, new Map());
    }
    const dimMap = dimensionData.get(trend.dimension)!;
    trend.years.forEach((year, idx) => {
      const currentValue = dimMap.get(year) || 0;
      const count = dimMap.has(year) ? 2 : 1;
      // Promediar si hay múltiples items
      dimMap.set(
        year,
        (currentValue * (count - 1) + trend.favorabilities[idx]) / count
      );
    });
  });

  // Preparar datos para el gráfico
  const chartData: ChartDataPoint[] = allYears.map((year) => {
    const point: ChartDataPoint = { year };
    dimensionData.forEach((values, dimension) => {
      if (values.has(year)) {
        point[dimension] = Math.round(values.get(year)!);
      }
    });
    return point;
  });

  // Obtener dimensiones únicas para las líneas
  const dimensions = Array.from(dimensionData.keys());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="year"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <p className="font-semibold mb-2">Año {label}</p>
                        {payload.map((entry) => (
                          <p
                            key={entry.dataKey}
                            className="text-sm"
                            style={{ color: entry.color }}
                          >
                            {DIMENSION_LABELS[
                              entry.dataKey as keyof typeof DIMENSION_LABELS
                            ] || entry.dataKey}
                            : {entry.value}%
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {showLegend && (
                <Legend
                  formatter={(value) =>
                    DIMENSION_LABELS[value as keyof typeof DIMENSION_LABELS] ||
                    value
                  }
                />
              )}
              {dimensions.map((dimension) => (
                <Line
                  key={dimension}
                  type="monotone"
                  dataKey={dimension}
                  stroke={
                    DIMENSION_COLORS[
                      dimension as keyof typeof DIMENSION_COLORS
                    ] || "#8884d8"
                  }
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
