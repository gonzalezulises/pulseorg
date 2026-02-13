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
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { GroupedBarData, DimensionYearComparison } from "@/types/unified-analysis";

// Year colors (brand aligned)
const YEAR_COLORS = {
  "2023": "#94A3B8", // Slate (oldest)
  "2024": "#00B4D8", // Cyan
  "2025": "#0052CC", // Primary blue
  "2026": "#1dc47c", // Green (current)
};

interface YearComparisonBarChartProps {
  data: GroupedBarData[];
  selectedYears?: string[];
  title?: string;
  maxItems?: number;
  sortBy?: "name" | "latest" | "change";
}

/**
 * Grouped bar chart comparing dimensions across years
 */
export function YearComparisonBarChart({
  data,
  selectedYears = ["2024", "2025", "2026"],
  title = "Comparación de Indicadores por Año",
  maxItems = 17,
  sortBy = "latest",
}: YearComparisonBarChartProps) {
  // Sort data based on criteria
  let sortedData = [...data];

  if (sortBy === "latest") {
    sortedData.sort((a, b) => (b["2026"] || 0) - (a["2026"] || 0));
  } else if (sortBy === "change") {
    sortedData.sort((a, b) => {
      const changeA = (a["2026"] || 0) - (a["2023"] || 0);
      const changeB = (b["2026"] || 0) - (b["2023"] || 0);
      return changeB - changeA;
    });
  } else {
    sortedData.sort((a, b) => a.dimension_name.localeCompare(b.dimension_name));
  }

  sortedData = sortedData.slice(0, maxItems);

  // Shorten dimension names for chart
  const chartData = sortedData.map((d) => ({
    ...d,
    name: d.dimension_name.length > 18
      ? d.dimension_name.substring(0, 18) + "..."
      : d.dimension_name,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dim = sortedData.find((d) =>
        d.dimension_name.startsWith(label.replace("...", ""))
      );

      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-bold text-sm mb-2">{dim?.dimension_name}</p>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between gap-4">
                <span style={{ color: entry.fill }}>{entry.name}:</span>
                <span className="font-bold">{entry.value?.toFixed(2)}</span>
              </div>
            ))}
            {dim && dim["2023"] && dim["2026"] && (
              <div className="pt-1 border-t mt-1">
                <span className="text-muted-foreground">Cambio 2023→2026: </span>
                <span
                  className={
                    (dim["2026"]! - dim["2023"]!) >= 0
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {(dim["2026"]! - dim["2023"]!) >= 0 ? "+" : ""}
                  {(dim["2026"]! - dim["2023"]!).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          Puntuación promedio por indicador (escala 1-5)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: Math.max(400, chartData.length * 30) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedYears.map((year) => (
                <Bar
                  key={year}
                  dataKey={year}
                  name={year}
                  fill={YEAR_COLORS[year as keyof typeof YEAR_COLORS]}
                  radius={[0, 4, 4, 0]}
                  barSize={8}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface YearChangeChartProps {
  data: DimensionYearComparison[];
  fromYear?: number;
  toYear?: number;
  title?: string;
}

/**
 * Bar chart showing change between two years
 */
export function YearChangeChart({
  data,
  fromYear = 2025,
  toYear = 2026,
  title = "Cambio Año a Año",
}: YearChangeChartProps) {
  // Calculate change for each dimension
  const changeData = data
    .map((dim) => {
      const fromScore = dim[`score_${fromYear}` as keyof typeof dim] as number | undefined;
      const toScore = dim[`score_${toYear}` as keyof typeof dim] as number | undefined;

      if (fromScore === undefined || toScore === undefined) return null;

      return {
        dimension_code: dim.dimension_code,
        dimension_name: dim.dimension_name,
        name: dim.dimension_name.length > 20
          ? dim.dimension_name.substring(0, 20) + "..."
          : dim.dimension_name,
        fromScore,
        toScore,
        change: toScore - fromScore,
      };
    })
    .filter((d) => d !== null)
    .sort((a, b) => b!.change - a!.change);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = changeData.find((item) =>
        item?.dimension_name.startsWith(label.replace("...", ""))
      );

      if (!d) return null;

      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-bold text-sm mb-2">{d.dimension_name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{fromYear}:</span>
              <span>{d.fromScore.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{toYear}:</span>
              <span>{d.toScore.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t">
              <span>Cambio:</span>
              <span
                className={
                  d.change >= 0
                    ? "text-green-600 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                {d.change >= 0 ? "+" : ""}{d.change.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          Variación {fromYear} → {toYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: Math.max(400, changeData.length * 28) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={changeData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[-0.5, 0.5]}
                tickFormatter={(v) => (v >= 0 ? `+${v}` : v.toString())}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="change" radius={[0, 4, 4, 0]} barSize={16}>
                {changeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry!.change >= 0 ? "#1dc47c" : "#DC2626"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface HorizontalComparisonProps {
  data: GroupedBarData[];
  title?: string;
}

/**
 * Horizontal grouped bar chart for dashboard overview
 */
export function HorizontalYearComparison({
  data,
  title = "Top 5 Indicadores - Evolución",
}: HorizontalComparisonProps) {
  // Get top 5 by 2026 score
  const top5 = [...data]
    .sort((a, b) => (b["2026"] || 0) - (a["2026"] || 0))
    .slice(0, 5)
    .map((d) => ({
      ...d,
      name: d.dimension_name.length > 15
        ? d.dimension_name.substring(0, 15) + "..."
        : d.dimension_name,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top5}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-30}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 10 }}
              />
              <YAxis domain={[0, 5]} ticks={[2, 3, 4, 5]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="2024" fill="#00B4D8" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="2025" fill="#0052CC" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="2026" fill="#1dc47c" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
