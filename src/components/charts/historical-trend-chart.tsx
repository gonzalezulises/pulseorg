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
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { GlobalTrendPoint, TrendLineData, DimensionTrend } from "@/types/unified-analysis";

// Brand colors for multiple lines
const LINE_COLORS = [
  "#0052CC", // Primary blue
  "#00B4D8", // Cyan
  "#1dc47c", // Green
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#10B981", // Emerald
  "#EF4444", // Red
];

interface EngagementTrendChartProps {
  data: GlobalTrendPoint[];
  title?: string;
  showRespondents?: boolean;
}

/**
 * Line chart showing global engagement evolution over years
 */
export function EngagementTrendChart({
  data,
  title = "Evolución del Engagement Global",
  showRespondents = true,
}: EngagementTrendChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload as GlobalTrendPoint;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-bold text-sm mb-2">Año {d.year}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Score:</span>
              <span className="font-bold text-primary">{d.engagement_score.toFixed(2)}/5.00</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Engagement:</span>
              <span className="font-bold">{d.engagement_pct.toFixed(1)}%</span>
            </div>
            {showRespondents && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Respuestas:</span>
                <span>{d.respondent_count}</span>
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
          Tendencia histórica 2023-2026
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={4.0}
                stroke="#94A3B8"
                strokeDasharray="3 3"
                label={{ value: "Meta 4.0", position: "right", fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="engagement_score"
                name="Score Engagement"
                stroke="#0052CC"
                strokeWidth={3}
                dot={{ r: 6, fill: "#0052CC" }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface DimensionTrendChartProps {
  data: TrendLineData[];
  dimensions: Record<string, DimensionTrend>;
  selectedDimensions?: string[];
  title?: string;
}

/**
 * Multi-line chart showing dimension evolution over years
 */
export function DimensionTrendChart({
  data,
  dimensions,
  selectedDimensions,
  title = "Evolución de Dimensiones",
}: DimensionTrendChartProps) {
  const dimensionCodes = selectedDimensions || Object.keys(dimensions).slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg max-w-xs">
          <p className="font-bold text-sm mb-2">Año {label}</p>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between gap-4">
                <span
                  className="truncate"
                  style={{ color: entry.color, maxWidth: "150px" }}
                >
                  {dimensions[entry.dataKey]?.name || entry.dataKey}:
                </span>
                <span className="font-bold">{entry.value?.toFixed(2)}</span>
              </div>
            ))}
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
          Comparación de {dimensionCodes.length} dimensiones seleccionadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[3, 5]} ticks={[3, 3.5, 4, 4.5, 5]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => dimensions[value]?.name || value}
                wrapperStyle={{ fontSize: "12px" }}
              />
              {dimensionCodes.map((code, index) => (
                <Line
                  key={code}
                  type="monotone"
                  dataKey={code}
                  name={code}
                  stroke={LINE_COLORS[index % LINE_COLORS.length]}
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

interface TopBottomTrendChartProps {
  data: TrendLineData[];
  dimensions: Record<string, DimensionTrend>;
  title?: string;
}

/**
 * Chart showing top 3 and bottom 3 dimensions over time
 */
export function TopBottomTrendChart({
  data,
  dimensions,
  title = "Top 3 vs Bottom 3 Dimensiones",
}: TopBottomTrendChartProps) {
  // Get latest year data to determine top/bottom
  const latestYear = Math.max(...data.map((d) => d.year));
  const latestData = data.find((d) => d.year === latestYear);

  if (!latestData) return null;

  // Sort dimensions by latest score
  const sortedDims = Object.entries(dimensions)
    .map(([code, dim]) => ({
      code,
      name: dim.name,
      score: latestData[code] as number || 0,
    }))
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score);

  const top3 = sortedDims.slice(0, 3).map((d) => d.code);
  const bottom3 = sortedDims.slice(-3).map((d) => d.code);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-bold text-sm mb-2">Año {label}</p>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => {
              const isTop = top3.includes(entry.dataKey);
              return (
                <div key={index} className="flex justify-between gap-4">
                  <span style={{ color: entry.color }}>
                    {isTop ? "⬆️" : "⬇️"} {dimensions[entry.dataKey]?.name.substring(0, 20)}:
                  </span>
                  <span className="font-bold">{entry.value?.toFixed(2)}</span>
                </div>
              );
            })}
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
          Evolución de las dimensiones con mejor y peor desempeño
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[3, 5]} ticks={[3, 3.5, 4, 4.5, 5]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => {
                  const isTop = top3.includes(value);
                  return `${isTop ? "⬆️" : "⬇️"} ${dimensions[value]?.name || value}`;
                }}
                wrapperStyle={{ fontSize: "11px" }}
              />
              {/* Top 3 - Green shades */}
              {top3.map((code, index) => (
                <Line
                  key={code}
                  type="monotone"
                  dataKey={code}
                  stroke={["#1dc47c", "#00B4D8", "#0052CC"][index]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
                />
              ))}
              {/* Bottom 3 - Red/Orange shades */}
              {bottom3.map((code, index) => (
                <Line
                  key={code}
                  type="monotone"
                  dataKey={code}
                  stroke={["#F59E0B", "#EF4444", "#DC2626"][index]}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
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
