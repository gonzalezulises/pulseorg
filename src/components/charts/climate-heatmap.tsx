"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DimensionStatV2 } from "@/types/clima-v2";

interface ClimateHeatmapProps {
  dimensions: DimensionStatV2[];
  title?: string;
}

// Función para obtener color según score (semáforo)
function getScoreColor(score: number): string {
  if (score < 3.0) return "#DC2626"; // Rojo
  if (score < 3.5) return "#F59E0B"; // Amarillo oscuro
  if (score < 4.0) return "#FCD34D"; // Amarillo
  if (score < 4.5) return "#00B4D8"; // Cyan
  return "#1dc47c"; // Verde
}

// Función para obtener color de texto según fondo
function getTextColor(score: number): string {
  if (score < 3.0) return "#FFFFFF";
  if (score < 3.5) return "#000000";
  if (score < 4.0) return "#000000";
  return "#000000";
}

export function ClimateHeatmap({
  dimensions,
  title = "Mapa de Calor - Dimensiones del Clima",
}: ClimateHeatmapProps) {
  // Ordenar dimensiones por score descendente
  const sortedDimensions = [...dimensions].sort((a, b) => b.avg_score - a.avg_score);

  // Agrupar en filas de 4 para mejor visualización
  const rows: DimensionStatV2[][] = [];
  for (let i = 0; i < sortedDimensions.length; i += 4) {
    rows.push(sortedDimensions.slice(i, i + 4));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#DC2626" }} />
            <span className="text-xs">&lt;3.0</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#F59E0B" }} />
            <span className="text-xs">3.0-3.5</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#FCD34D" }} />
            <span className="text-xs">3.5-4.0</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#00B4D8" }} />
            <span className="text-xs">4.0-4.5</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#1dc47c" }} />
            <span className="text-xs">&gt;4.5</span>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid gap-2">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-4 gap-2">
                {row.map((dim) => (
                  <Tooltip key={dim.dimension_code}>
                    <TooltipTrigger asChild>
                      <div
                        className="p-3 rounded-lg cursor-pointer transition-transform hover:scale-105"
                        style={{
                          backgroundColor: getScoreColor(dim.avg_score),
                          color: getTextColor(dim.avg_score),
                        }}
                      >
                        <p className="text-xs font-medium truncate">
                          {dim.dimension_name}
                        </p>
                        <p className="text-lg font-bold mt-1">
                          {dim.avg_score.toFixed(2)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">{dim.dimension_name}</p>
                        <p className="text-sm">Score: {dim.avg_score.toFixed(2)}/5.00</p>
                        <p className="text-sm">Favorabilidad: {dim.favorability_pct.toFixed(1)}%</p>
                        <p className="text-sm">Ranking: #{dim.rank}/17</p>
                        <p className="text-sm">
                          Gap vs Benchmark:{" "}
                          <span className={dim.gap_vs_benchmark >= 0 ? "text-green-600" : "text-red-600"}>
                            {dim.gap_vs_benchmark >= 0 ? "+" : ""}{dim.gap_vs_benchmark.toFixed(1)}pp
                          </span>
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {/* Rellenar celdas vacías si la última fila está incompleta */}
                {row.length < 4 &&
                  Array(4 - row.length)
                    .fill(null)
                    .map((_, i) => (
                      <div key={`empty-${i}`} className="p-3 rounded-lg bg-muted/30" />
                    ))}
              </div>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

// Heatmap de comparación año a año
interface YearComparisonHeatmapProps {
  currentDimensions: DimensionStatV2[];
  previousDimensions: DimensionStatV2[];
  currentYear: number;
  previousYear: number;
  title?: string;
}

export function YearComparisonHeatmap({
  currentDimensions,
  previousDimensions,
  currentYear,
  previousYear,
  title = "Cambio vs Año Anterior",
}: YearComparisonHeatmapProps) {
  // Calcular cambios
  const changes = currentDimensions.map((current) => {
    const previous = previousDimensions.find(
      (p) => p.dimension_code === current.dimension_code
    );
    return {
      ...current,
      previousScore: previous?.avg_score || current.avg_score,
      change: previous ? current.avg_score - previous.avg_score : 0,
    };
  }).sort((a, b) => b.change - a.change);

  // Función para color de cambio
  const getChangeColor = (change: number): string => {
    if (change >= 0.3) return "#1dc47c";
    if (change >= 0.1) return "#00B4D8";
    if (change >= -0.1) return "#64748B";
    if (change >= -0.3) return "#F59E0B";
    return "#DC2626";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          Comparación {previousYear} → {currentYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-2">
            {changes.map((dim) => (
              <Tooltip key={dim.dimension_code}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div
                      className="w-16 h-8 rounded flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: getChangeColor(dim.change),
                        color: Math.abs(dim.change) >= 0.1 ? "#000" : "#FFF",
                      }}
                    >
                      {dim.change >= 0 ? "+" : ""}{dim.change.toFixed(2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{dim.dimension_name}</p>
                    </div>
                    <div className="text-right text-sm">
                      <span className="text-muted-foreground">{dim.previousScore.toFixed(2)}</span>
                      <span className="mx-1">→</span>
                      <span className="font-bold">{dim.avg_score.toFixed(2)}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{dim.dimension_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {previousYear}: {dim.previousScore.toFixed(2)} → {currentYear}: {dim.avg_score.toFixed(2)}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
