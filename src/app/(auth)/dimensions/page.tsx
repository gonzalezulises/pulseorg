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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilteredDimensionStats, useCurrentFilterLabel } from "@/hooks/use-filtered-clima";
import { DASHBOARD_CONFIG } from "@/lib/constants";
import {
  DIMENSION_LABELS_V2,
  SEGMENT_COLORS,
  getSegmentLabel,
  getSegmentIcon,
  type DimensionCodeV2,
  type SegmentType,
} from "@/types/clima-v2";
import { Filter } from "lucide-react";

export default function DimensionsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(DASHBOARD_CONFIG.defaultYear);
  const [selectedDimension, setSelectedDimension] = useState<DimensionCodeV2 | "all">("all");

  // Obtener datos V2 con filtros demográficos aplicados
  const { data: dimensions, isLoading, hasFilters } = useFilteredDimensionStats(selectedYear);
  const filterLabel = useCurrentFilterLabel();

  // Filtrar dimensiones
  const filteredDimensions = dimensions
    ? selectedDimension === "all"
      ? dimensions
      : dimensions.filter((d) => d.dimension_code === selectedDimension)
    : [];

  // Encontrar la dimensión seleccionada
  const selectedDimensionData =
    selectedDimension !== "all"
      ? dimensions?.find((d) => d.dimension_code === selectedDimension)
      : null;

  return (
    <>
      <Header
        title="Análisis por Dimensión"
        description="Detalle de las 17 dimensiones del clima organizacional"
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {/* Filter indicator */}
      {hasFilters && (
        <div className="px-6 py-2 bg-muted/50 border-b flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Vista filtrada:</span>
          <Badge variant="secondary">{filterLabel}</Badge>
        </div>
      )}

      <main className="flex-1 p-6 space-y-6">
        {/* Selector de dimensión */}
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
                <SelectValue placeholder="Seleccionar dimensión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las dimensiones (17)</SelectItem>
                {Object.entries(DIMENSION_LABELS_V2).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Resumen de la dimensión seleccionada */}
        {selectedDimension !== "all" && selectedDimensionData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {getSegmentIcon(selectedDimensionData.segment)}
                {selectedDimensionData.dimension_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold" style={{ color: SEGMENT_COLORS[selectedDimensionData.segment] }}>
                    {selectedDimensionData.avg_score.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Favorabilidad</p>
                  <p className="text-2xl font-bold">
                    {selectedDimensionData.favorability_pct.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Items</p>
                  <p className="text-2xl font-bold">
                    {selectedDimensionData.item_count}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ranking</p>
                  <p className="text-2xl font-bold">
                    #{selectedDimensionData.rank}/17
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Segmento</p>
                  <Badge
                    style={{
                      backgroundColor: SEGMENT_COLORS[selectedDimensionData.segment],
                      color: "white",
                    }}
                  >
                    {getSegmentLabel(selectedDimensionData.segment)}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Gap vs Benchmark ({selectedDimensionData.benchmark}%)
                </p>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(selectedDimensionData.avg_score / 5) * 100}
                    className="flex-1"
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedDimensionData.gap_vs_benchmark >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedDimensionData.gap_vs_benchmark >= 0 ? "+" : ""}
                    {selectedDimensionData.gap_vs_benchmark.toFixed(1)}pp
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de dimensiones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDimension === "all"
                ? "Todas las Dimensiones"
                : `Detalle: ${DIMENSION_LABELS_V2[selectedDimension]}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : filteredDimensions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Dimensión</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Favorabilidad</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Gap vs Bench</TableHead>
                    <TableHead>Segmento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDimensions
                    .sort((a, b) => a.rank - b.rank)
                    .map((dim) => (
                      <TableRow
                        key={dim.dimension_code}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          setSelectedDimension(
                            selectedDimension === dim.dimension_code
                              ? "all"
                              : dim.dimension_code
                          )
                        }
                      >
                        <TableCell className="font-mono text-sm font-bold">
                          #{dim.rank}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{getSegmentIcon(dim.segment)}</span>
                            <span className="font-medium">{dim.dimension_name}</span>
                          </div>
                        </TableCell>
                        <TableCell
                          className="text-right font-bold"
                          style={{ color: SEGMENT_COLORS[dim.segment] }}
                        >
                          {dim.avg_score.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {dim.favorability_pct.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">
                          {dim.item_count}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            dim.gap_vs_benchmark >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {dim.gap_vs_benchmark >= 0 ? "+" : ""}
                          {dim.gap_vs_benchmark.toFixed(1)}pp
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: SEGMENT_COLORS[dim.segment],
                              color: SEGMENT_COLORS[dim.segment],
                            }}
                          >
                            {getSegmentLabel(dim.segment)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay dimensiones disponibles para los filtros seleccionados.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
