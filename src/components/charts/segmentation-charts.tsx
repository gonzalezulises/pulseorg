"use client";

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, AlertCircle, Users, TrendingDown, TrendingUp } from "lucide-react";
import type { SegmentComparison, RiskGroup, HeatmapData, HeatmapCell } from "@/types/segmentation";

// Color scale for scores
function getScoreColor(score: number): string {
  if (score >= 4.50) return "#1dc47c"; // Verde
  if (score >= 4.20) return "#00B4D8"; // Cyan
  if (score >= 4.00) return "#FCD34D"; // Amarillo
  if (score >= 3.50) return "#F59E0B"; // Naranja
  return "#DC2626"; // Rojo
}

interface SegmentBarChartProps {
  data: SegmentComparison[];
  globalScore: number;
  title?: string;
  description?: string;
}

/**
 * Bar chart comparing engagement across segments
 */
export function SegmentBarChart({
  data,
  globalScore,
  title = "Compromiso por Segmento",
  description,
}: SegmentBarChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload as SegmentComparison;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-bold text-sm mb-2">{d.segment_name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Puntuación:</span>
              <span className="font-bold">{(d.engagement_score ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Compromiso:</span>
              <span>{(d.engagement_pct ?? 0).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Respuestas:</span>
              <span>{d.respondent_count}</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t">
              <span>vs Global:</span>
              <span className={(d.vs_global ?? 0) >= 0 ? "text-green-600" : "text-red-600"}>
                {(d.vs_global ?? 0) >= 0 ? "+" : ""}{(d.vs_global ?? 0).toFixed(2)}
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
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height: Math.max(300, data.length * 40) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[3, 5]} ticks={[3, 3.5, 4, 4.5, 5]} />
              <YAxis
                dataKey="segment_name"
                type="category"
                width={140}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={globalScore}
                stroke="#64748B"
                strokeDasharray="3 3"
                label={{
                  value: `Global: ${globalScore.toFixed(2)}`,
                  position: "top",
                  fontSize: 10,
                }}
              />
              <Bar dataKey="engagement_score" radius={[0, 4, 4, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getScoreColor(entry.engagement_score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface RiskGroupsTableProps {
  data: RiskGroup[];
  title?: string;
}

/**
 * Table showing risk groups with low engagement
 */
export function RiskGroupsTable({
  data,
  title = "Grupos de Riesgo",
}: RiskGroupsTableProps) {
  const getRiskBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive">Alto Riesgo</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Medio</Badge>;
      default:
        return <Badge variant="secondary">Bajo</Badge>;
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Users className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          {title}
        </CardTitle>
        <CardDescription>
          Combinaciones demográficas con compromiso menor al 70%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Segmento</TableHead>
              <TableHead className="text-center">N</TableHead>
              <TableHead className="text-center">Compromiso</TableHead>
              <TableHead>Indicadores Críticos</TableHead>
              <TableHead className="text-center">Riesgo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((group) => (
              <TableRow key={group.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{group.department}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.tenure} | {group.hierarchy} | {group.location}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium">{group.respondent_count}</span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {getRiskIcon(group.risk_level)}
                    <span
                      className={`font-bold ${
                        (group.engagement_pct ?? 0) < 65
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {(group.engagement_pct ?? 0).toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {group.critical_dimensions.slice(0, 3).map((dim, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {dim.length > 15 ? dim.substring(0, 15) + "..." : dim}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {getRiskBadge(group.risk_level)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface HeatmapChartProps {
  data: HeatmapData;
  title?: string;
}

/**
 * Heatmap comparing dimensions vs segments
 */
export function HeatmapChart({
  data,
  title = "Mapa de Calor: Indicadores por Segmento",
}: HeatmapChartProps) {
  if (!data) return null;

  // Group cells by segment for display
  const segmentRows = data.segment_keys.map((segKey: string, segIdx: number) => {
    const segmentCells = data.cells.filter((c) => c.segment === segKey);
    return {
      segment: data.segments[segIdx],
      segmentKey: segKey,
      cells: segmentCells,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#DC2626" }} />
            <span className="text-xs">&lt;3.5</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#F59E0B" }} />
            <span className="text-xs">3.5-4.0</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#FCD34D" }} />
            <span className="text-xs">4.0-4.2</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#00B4D8" }} />
            <span className="text-xs">4.2-4.5</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#1dc47c" }} />
            <span className="text-xs">&gt;4.5</span>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <TooltipProvider>
          <div className="min-w-[900px]">
            {/* Header row with dimension names */}
            <div className="flex gap-1 mb-2">
              <div className="w-28 shrink-0" /> {/* Empty corner */}
              {data.dimensions.map((dim, i) => (
                <div
                  key={i}
                  className="flex-1 text-center"
                  title={dim}
                >
                  <span className="text-[10px] text-muted-foreground writing-vertical">
                    {dim.length > 10 ? dim.substring(0, 10) + "..." : dim}
                  </span>
                </div>
              ))}
            </div>

            {/* Data rows */}
            {segmentRows.map((row: { segment: string; segmentKey: string; cells: HeatmapCell[] }) => (
              <div key={row.segmentKey} className="flex gap-1 mb-1">
                <div className="w-28 shrink-0 flex items-center">
                  <span className="text-xs font-medium truncate" title={row.segment}>
                    {row.segment}
                  </span>
                </div>
                {row.cells.map((cell: HeatmapCell, cellIdx: number) => (
                  <UITooltip key={cellIdx}>
                    <TooltipTrigger asChild>
                      <div
                        className="flex-1 h-8 rounded cursor-pointer transition-transform hover:scale-105 flex items-center justify-center"
                        style={{ backgroundColor: cell.color }}
                      >
                        <span
                          className="text-[10px] font-bold"
                          style={{
                            color: (cell.score ?? 0) < 4.0 ? "#FFF" : "#000",
                          }}
                        >
                          {(cell.score ?? 0).toFixed(1)}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="text-sm">
                        <p className="font-medium">{cell.dimension_name}</p>
                        <p className="text-muted-foreground">{cell.segment_name}</p>
                        <p className="mt-1">
                          Puntuación: <strong>{(cell.score ?? 0).toFixed(2)}</strong>
                        </p>
                        <p>Favorabilidad: {(cell.favorability ?? 0).toFixed(1)}%</p>
                      </div>
                    </TooltipContent>
                  </UITooltip>
                ))}
              </div>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

interface SegmentComparisonCardsProps {
  data: SegmentComparison[];
  globalScore: number;
  title?: string;
}

/**
 * Card grid showing segment comparisons
 */
export function SegmentComparisonCards({
  data,
  globalScore,
  title = "Comparación de Segmentos",
}: SegmentComparisonCardsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((segment, index) => {
          const isAboveAvg = segment.vs_global >= 0;

          return (
            <Card
              key={index}
              className={`transition-shadow hover:shadow-md ${
                segment.engagement_pct < 70 ? "border-red-200" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm truncate" title={segment.segment_name}>
                    {segment.segment_name}
                  </p>
                  {isAboveAvg ? (
                    <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 shrink-0" />
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: getScoreColor(segment.engagement_score ?? 0) }}
                  >
                    {(segment.engagement_score ?? 0).toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground mb-1">
                    / 5.00
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2 text-xs">
                  <span className="text-muted-foreground">
                    {segment.respondent_count} respuestas
                  </span>
                  <span
                    className={`font-medium ${
                      isAboveAvg ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isAboveAvg ? "+" : ""}
                    {(segment.vs_global ?? 0).toFixed(2)} vs global
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${((segment.engagement_score ?? 0) / 5) * 100}%`,
                      backgroundColor: getScoreColor(segment.engagement_score ?? 0),
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
