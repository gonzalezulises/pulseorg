"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import type { EngagementDriver } from "@/types/correlations";
import { getCorrelationColor, getCorrelationLabel } from "@/types/correlations";
import { Target, Lightbulb, TrendingUp } from "lucide-react";

interface EngagementDriversChartProps {
  data: EngagementDriver[];
  title?: string;
  onBarClick?: (dimensionCode: string) => void;
}

export function EngagementDriversChart({
  data,
  title = "Drivers del Engagement",
  onBarClick,
}: EngagementDriversChartProps) {
  // Sort by correlation descending and prepare chart data
  const chartData = [...data]
    .sort((a, b) => b.correlation - a.correlation)
    .map((driver) => ({
      ...driver,
      correlationPercent: driver.correlation * 100,
    }));

  const topDriver = chartData[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          ¿Qué dimensiones impactan más el Engagement Global?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const driver = payload[0].payload as EngagementDriver & {
                      correlationPercent: number;
                    };
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-sm">
                          Correlación: <strong>{driver.correlation.toFixed(2)}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getCorrelationLabel(driver.correlation)} impacto
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ranking: #{driver.impact_rank}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                x={50}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                label={{ value: "50%", position: "top", fontSize: 10 }}
              />
              <Bar
                dataKey="correlationPercent"
                radius={[0, 4, 4, 0]}
                onClick={(data: { payload?: { dimension?: string } }) => {
                  if (onBarClick && data.payload?.dimension) {
                    onBarClick(data.payload.dimension);
                  }
                }}
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.dimension}
                    fill={getCorrelationColor(entry.correlation)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insight box */}
        {topDriver && (
          <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-primary">Insight Principal</p>
                <p className="text-sm text-muted-foreground">
                  Mejorar <strong>{topDriver.name}</strong> tendría el mayor impacto en
                  Engagement (r = {topDriver.correlation.toFixed(2)})
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact ranking list
interface EngagementDriversListProps {
  data: EngagementDriver[];
  limit?: number;
}

export function EngagementDriversList({ data, limit = 5 }: EngagementDriversListProps) {
  const topDrivers = [...data]
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top {limit} Drivers del Engagement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topDrivers.map((driver, index) => (
            <div
              key={driver.dimension}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                style={{
                  backgroundColor: getCorrelationColor(driver.correlation),
                  color: "#fff",
                }}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{driver.name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${driver.correlation * 100}%`,
                        backgroundColor: getCorrelationColor(driver.correlation),
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground w-10">
                    {(driver.correlation * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Summary stats
interface DriversSummaryProps {
  drivers: EngagementDriver[];
}

export function DriversSummary({ drivers }: DriversSummaryProps) {
  const strongDrivers = drivers.filter((d) => d.correlation >= 0.7).length;
  const moderateDrivers = drivers.filter(
    (d) => d.correlation >= 0.5 && d.correlation < 0.7
  ).length;
  const weakDrivers = drivers.filter((d) => d.correlation < 0.5).length;
  const avgCorrelation =
    drivers.reduce((sum, d) => sum + d.correlation, 0) / drivers.length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-green-600">{strongDrivers}</p>
          <p className="text-xs text-muted-foreground">Drivers Fuertes (≥0.7)</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-yellow-600">{moderateDrivers}</p>
          <p className="text-xs text-muted-foreground">Drivers Moderados</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-slate-600">{weakDrivers}</p>
          <p className="text-xs text-muted-foreground">Drivers Débiles (&lt;0.5)</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-2xl font-bold">{avgCorrelation.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Correlación Promedio</p>
        </CardContent>
      </Card>
    </div>
  );
}
