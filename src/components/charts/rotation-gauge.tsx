"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { RotationRisk, RiskFactor, HighRiskArea, EngagementRotationPoint } from "@/types/predictions";
import { SCORE_COLORS, getScoreColor } from "@/types/predictions";
import { AlertTriangle, TrendingDown, TrendingUp, Minus, Users, Target } from "lucide-react";

interface RotationGaugeProps {
  riskIndex: number;
  trend?: "up" | "down" | "stable";
}

export function RotationGauge({ riskIndex, trend = "stable" }: RotationGaugeProps) {
  // Create gauge data
  const gaugeData = [
    { value: riskIndex, color: getRiskColor(riskIndex) },
    { value: 100 - riskIndex, color: "#e5e7eb" },
  ];

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-5 w-5" />
          Indice de Riesgo de Rotacion
        </CardTitle>
        <CardDescription>Probabilidad estimada de rotacion en los proximos 12 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="h-[200px] w-full max-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center -mt-16">
            <div className="flex items-center justify-center gap-2">
              <span
                className="text-5xl font-bold"
                style={{ color: getRiskColor(riskIndex) }}
              >
                {riskIndex}%
              </span>
              {getTrendIcon()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {getRiskLevel(riskIndex)}
            </p>
          </div>

          {/* Risk scale */}
          <div className="w-full mt-6 pt-4 border-t">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Bajo</span>
              <span>Moderado</span>
              <span>Alto</span>
              <span>Critico</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden">
              <div className="flex-1 bg-green-500" />
              <div className="flex-1 bg-yellow-500" />
              <div className="flex-1 bg-orange-500" />
              <div className="flex-1 bg-red-500" />
            </div>
            <div className="relative h-4">
              <div
                className="absolute w-3 h-3 bg-foreground rounded-full -top-1 transform -translate-x-1/2"
                style={{ left: `${riskIndex}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getRiskColor(risk: number): string {
  if (risk < 25) return SCORE_COLORS.good;
  if (risk < 50) return SCORE_COLORS.warning;
  if (risk < 75) return "#f97316"; // orange
  return SCORE_COLORS.danger;
}

function getRiskLevel(risk: number): string {
  if (risk < 25) return "Riesgo Bajo";
  if (risk < 50) return "Riesgo Moderado";
  if (risk < 75) return "Riesgo Alto";
  return "Riesgo Critico";
}

interface RiskFactorsListProps {
  factors: RiskFactor[];
}

export function RiskFactorsList({ factors }: RiskFactorsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Factores de Riesgo
        </CardTitle>
        <CardDescription>Principales factores que contribuyen al riesgo de rotacion</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {factors.map((factor, index) => (
            <div key={factor.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}.
                  </span>
                  <div>
                    <p className="text-sm font-medium">{factor.factor}</p>
                    <p className="text-xs text-muted-foreground">
                      Afecta al {factor.affected_percentage}% de empleados
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  style={{
                    borderColor: getImpactColor(factor.impact_score),
                    color: getImpactColor(factor.impact_score),
                  }}
                >
                  Impacto: {(factor.impact_score * 100).toFixed(0)}%
                </Badge>
              </div>
              <Progress
                value={factor.impact_score * 100}
                className="h-2"
                style={
                  {
                    "--progress-foreground": getImpactColor(factor.impact_score),
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getImpactColor(impact: number): string {
  if (impact >= 0.7) return SCORE_COLORS.danger;
  if (impact >= 0.5) return SCORE_COLORS.warning;
  return SCORE_COLORS.good;
}

interface HighRiskAreasTableProps {
  areas: HighRiskArea[];
}

export function HighRiskAreasTable({ areas }: HighRiskAreasTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-5 w-5" />
          Areas de Mayor Riesgo
        </CardTitle>
        <CardDescription>Departamentos con mayor probabilidad de rotacion</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>
              <TableHead className="text-center">Riesgo</TableHead>
              <TableHead className="text-center">Compromiso</TableHead>
              <TableHead className="text-center">Empleados</TableHead>
              <TableHead>Problemas Clave</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.map((area) => (
              <TableRow key={area.area}>
                <TableCell className="font-medium">{area.area}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: getRiskColor(area.risk_level),
                      color: getRiskColor(area.risk_level),
                    }}
                  >
                    {area.risk_level}%
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span style={{ color: getScoreColor(area.engagement_score) }}>
                    {area.engagement_score.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="text-center">{area.headcount}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {area.key_issues.map((issue) => (
                      <Badge key={issue} variant="secondary" className="text-xs">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface EngagementRotationCorrelationProps {
  data: EngagementRotationPoint[];
}

export function EngagementRotationCorrelation({
  data,
}: EngagementRotationCorrelationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Correlación Compromiso vs Rotación</CardTitle>
        <CardDescription>
          Relación histórica entre niveles de compromiso y tasas de rotación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                dataKey="engagement"
                name="Compromiso"
                domain={[2, 5]}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Puntuación de Compromiso",
                  position: "insideBottom",
                  offset: -10,
                  fontSize: 12,
                }}
              />
              <YAxis
                type="number"
                dataKey="rotation"
                name="Rotacion"
                domain={[0, 50]}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Tasa de Rotacion (%)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 12,
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <p className="text-sm font-medium">
                          Compromiso: {data.engagement.toFixed(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rotacion: {data.rotation}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                x={4.0}
                stroke={SCORE_COLORS.good}
                strokeDasharray="3 3"
                label={{ value: "Meta", position: "top", fontSize: 10 }}
              />
              <ReferenceLine
                x={3.5}
                stroke={SCORE_COLORS.warning}
                strokeDasharray="3 3"
              />
              <Scatter
                data={data}
                fill="#3b82f6"
                line={{ stroke: "#3b82f6", strokeWidth: 2 }}
                lineType="fitting"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <span>A mayor engagement, menor rotacion</span>
        </div>
      </CardContent>
    </Card>
  );
}
