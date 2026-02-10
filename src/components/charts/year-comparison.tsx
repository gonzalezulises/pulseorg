"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DIMENSION_LABELS, type DimensionStatistics } from "@/types/api";

interface YearComparisonProps {
  currentYear: DimensionStatistics[];
  previousYear?: DimensionStatistics[];
  title?: string;
}

interface ComparisonDataPoint {
  dimension: string;
  label: string;
  current: number;
  previous?: number;
}

export function YearComparison({
  currentYear,
  previousYear,
  title = "Comparación Año a Año",
}: YearComparisonProps) {
  // Crear mapa del año anterior para búsqueda rápida
  const previousYearMap = new Map(
    previousYear?.map((d) => [d.dimension, d.favorability_pct]) || []
  );

  // Preparar datos para el gráfico
  const chartData: ComparisonDataPoint[] = currentYear.map((d) => ({
    dimension: d.dimension,
    label: DIMENSION_LABELS[d.dimension] || d.dimension,
    current: Math.round(d.favorability_pct),
    previous: previousYearMap.has(d.dimension)
      ? Math.round(previousYearMap.get(d.dimension)!)
      : undefined,
  }));

  const currentYearLabel = currentYear[0]?.year || "Actual";
  const previousYearLabel = previousYear?.[0]?.year || "Anterior";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="label"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
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
                        <p className="font-semibold mb-2">{label}</p>
                        {payload.map((entry) => (
                          <p
                            key={entry.dataKey}
                            className="text-sm"
                            style={{ color: entry.color }}
                          >
                            {entry.name}: {entry.value}%
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              {previousYear && previousYear.length > 0 && (
                <Bar
                  dataKey="previous"
                  name={String(previousYearLabel)}
                  fill="hsl(var(--muted-foreground))"
                  opacity={0.5}
                  radius={[4, 4, 0, 0]}
                />
              )}
              <Bar
                dataKey="current"
                name={String(currentYearLabel)}
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
