"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useClimaDataV2 } from "@/hooks/use-clima-v2";
import {
  DIMENSION_LABELS_V2,
  SEGMENT_COLORS,
  getSegmentIcon,
  type DimensionCodeV2,
} from "@/types/clima-v2";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TrendsPage() {
  const [selectedDimension, setSelectedDimension] = useState<DimensionCodeV2 | "all">("all");

  // Obtener todos los datos
  const { data: climaData, isLoading } = useClimaDataV2();

  // Preparar datos de tendencias por dimensión
  const trendData: {
    dimension_code: DimensionCodeV2;
    dimension_name: string;
    years: { year: number; score: number; favorability: number }[];
    totalChange: number;
    avgChange: number;
    pattern: "improving" | "declining" | "stable";
  }[] = [];

  if (climaData?.years) {
    const years = Object.keys(climaData.years).map(Number).sort();
    const dimensionMap = new Map<DimensionCodeV2, { year: number; score: number; favorability: number }[]>();

    // Agrupar por dimensión
    years.forEach((year) => {
      const yearData = climaData.years[String(year)];
      yearData?.dimensions?.forEach((dim) => {
        if (!dimensionMap.has(dim.dimension_code)) {
          dimensionMap.set(dim.dimension_code, []);
        }
        dimensionMap.get(dim.dimension_code)!.push({
          year,
          score: dim.avg_score,
          favorability: dim.favorability_pct,
        });
      });
    });

    // Calcular tendencias
    dimensionMap.forEach((yearData, dimCode) => {
      if (yearData.length >= 2) {
        const sortedYears = yearData.sort((a, b) => a.year - b.year);
        const firstScore = sortedYears[0].score;
        const lastScore = sortedYears[sortedYears.length - 1].score;
        const totalChange = lastScore - firstScore;
        const avgChange = totalChange / (sortedYears.length - 1);

        let pattern: "improving" | "declining" | "stable" = "stable";
        if (totalChange > 0.1) pattern = "improving";
        else if (totalChange < -0.1) pattern = "declining";

        trendData.push({
          dimension_code: dimCode,
          dimension_name: DIMENSION_LABELS_V2[dimCode],
          years: sortedYears,
          totalChange,
          avgChange,
          pattern,
        });
      }
    });
  }

  // Filtrar por dimensión
  const filteredTrends =
    selectedDimension === "all"
      ? trendData
      : trendData.filter((t) => t.dimension_code === selectedDimension);

  // Ordenar por cambio total
  const sortedTrends = [...filteredTrends].sort((a, b) => b.totalChange - a.totalChange);

  // Preparar datos para el gráfico de líneas
  const chartData = climaData?.years
    ? Object.keys(climaData.years)
        .map(Number)
        .sort()
        .map((year) => {
          const yearData = climaData.years[String(year)];
          const point: Record<string, number | string> = { year: String(year) };

          if (selectedDimension === "all") {
            // Mostrar engagement
            if (yearData?.engagement) {
              point["Engagement"] = yearData.engagement.engagement_score;
            }
          } else {
            // Mostrar dimensión seleccionada
            const dim = yearData?.dimensions?.find(
              (d) => d.dimension_code === selectedDimension
            );
            if (dim) {
              point[dim.dimension_name] = dim.avg_score;
            }
          }
          return point;
        })
    : [];

  const patternConfig = {
    improving: { icon: TrendingUp, color: "text-green-600", label: "Mejorando" },
    declining: { icon: TrendingDown, color: "text-red-600", label: "Declinando" },
    stable: { icon: Minus, color: "text-blue-600", label: "Estable" },
  };

  return (
    <>
      <Header
        title="Tendencias"
        description="Evolución del clima organizacional 2023-2026"
        showYearSelector={false}
        showFilters={false}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtrar por Dimensión</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedDimension}
              onValueChange={(value) =>
                setSelectedDimension(value as DimensionCodeV2 | "all")
              }
            >
              <SelectTrigger className="w-[320px]">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Engagement Global</SelectItem>
                {Object.entries(DIMENSION_LABELS_V2).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Gráfico de tendencias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Evolución Temporal{" "}
              {selectedDimension !== "all" && `- ${DIMENSION_LABELS_V2[selectedDimension]}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[3, 5]} />
                    <Tooltip />
                    <Legend />
                    {selectedDimension === "all" ? (
                      <Line
                        type="monotone"
                        dataKey="Engagement"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ) : (
                      <Line
                        type="monotone"
                        dataKey={DIMENSION_LABELS_V2[selectedDimension]}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla de tendencias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen de Tendencias por Dimensión</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : sortedTrends.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dimensión</TableHead>
                    <TableHead className="text-center">Años</TableHead>
                    <TableHead className="text-right">2023</TableHead>
                    <TableHead className="text-right">2026</TableHead>
                    <TableHead className="text-right">Cambio Total</TableHead>
                    <TableHead className="text-right">Cambio/Año</TableHead>
                    <TableHead>Tendencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTrends.map((trend) => {
                    const config = patternConfig[trend.pattern];
                    const Icon = config.icon;
                    const firstYear = trend.years[0];
                    const lastYear = trend.years[trend.years.length - 1];

                    return (
                      <TableRow key={trend.dimension_code}>
                        <TableCell className="font-medium">
                          {trend.dimension_name}
                        </TableCell>
                        <TableCell className="text-center">
                          {trend.years.length}
                        </TableCell>
                        <TableCell className="text-right">
                          {firstYear?.score.toFixed(2) || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {lastYear?.score.toFixed(2) || "-"}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium",
                            trend.totalChange > 0
                              ? "text-green-600"
                              : trend.totalChange < 0
                                ? "text-red-600"
                                : ""
                          )}
                        >
                          {trend.totalChange > 0 ? "+" : ""}
                          {trend.totalChange.toFixed(2)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right",
                            trend.avgChange > 0
                              ? "text-green-600"
                              : trend.avgChange < 0
                                ? "text-red-600"
                                : ""
                          )}
                        >
                          {trend.avgChange > 0 ? "+" : ""}
                          {trend.avgChange.toFixed(2)}/año
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Icon className={cn("h-4 w-4", config.color)} />
                            <span className={cn("text-sm", config.color)}>
                              {config.label}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay datos de tendencias disponibles.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
