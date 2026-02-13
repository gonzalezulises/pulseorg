"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Area,
} from "recharts";
import type { Dimension, CorrelationStatistics, RegressionStatistics } from "@/types/correlations";
import {
  getCorrelationColor,
  getCorrelationLabel,
  calculateFullStatistics,
  generatePredictionBands,
} from "@/types/correlations";
import {
  ScatterChart as ScatterIcon,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface ScatterPoint {
  x: number;
  y: number;
  month: string;
}

interface RegressionData {
  slope: number;
  intercept: number;
  rSquared: number;
  correlation: number;
  equation: string;
}

// Backend stats from pre-calculated correlations
interface BackendCorrelationStats {
  pearsonR: number;
  adjustedR: number;
  partialR: number;
  spearmanRho: number;
  pValue: number;
  rSquared: number;
  ciLower: number;
  ciUpper: number;
  effectSize: string;
  sampleSize: number;
  isSignificant: boolean;
  nonlinear?: {
    is_nonlinear: boolean;
    curvature: number;
    optimal_transform: string;
  };
}

interface CorrelationScatterPlotProps {
  points: ScatterPoint[];
  regression: RegressionData | null;
  xLabel: string;
  yLabel: string;
  title?: string;
  backendStats?: BackendCorrelationStats | null;
}

// Significance badge component
function SignificanceBadge({ pValue, isSignificant }: { pValue: number; isSignificant: boolean }) {
  if (isSignificant) {
    return (
      <Badge variant="default" className="bg-green-600 text-xs gap-1">
        <CheckCircle className="h-3 w-3" />
        {pValue < 0.001 ? "p<0.001" : pValue < 0.01 ? "p<0.01" : "p<0.05"}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs gap-1">
      <XCircle className="h-3 w-3" />
      No significativo
    </Badge>
  );
}

// Statistics panel component
function StatisticsPanel({
  correlation,
  regression,
  warnings,
}: {
  correlation: CorrelationStatistics;
  regression: RegressionStatistics;
  warnings: string[];
}) {
  return (
    <div className="space-y-4">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              {warnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="correlation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="correlation">Correlación</TabsTrigger>
          <TabsTrigger value="regression">Regresión</TabsTrigger>
        </TabsList>

        <TabsContent value="correlation" className="space-y-4 mt-4">
          {/* Correlation Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Pearson (r)"
              value={correlation.pearsonR.toFixed(3)}
              color={getCorrelationColor(correlation.pearsonR)}
              tooltip="Coeficiente de correlación de Pearson. Mide la fuerza de la relación lineal."
            />
            <StatCard
              label="Spearman (ρ)"
              value={correlation.spearmanRho.toFixed(3)}
              color={getCorrelationColor(correlation.spearmanRho)}
              tooltip="Coeficiente de Spearman. Más robusto ante valores atípicos y relaciones no lineales."
            />
            <StatCard
              label="t-statistic"
              value={correlation.tStatistic.toFixed(2)}
              tooltip="Estadístico t para probar H₀: ρ = 0"
            />
            <StatCard
              label="p-value"
              value={correlation.pValue < 0.001 ? "<0.001" : correlation.pValue.toFixed(3)}
              badge={<SignificanceBadge pValue={correlation.pValue} isSignificant={correlation.isSignificant} />}
              tooltip="Probabilidad de observar esta correlación si no existe relación real (α = 0.05)"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard
              label="95% IC para r"
              value={`[${correlation.confidenceInterval.lower.toFixed(3)}, ${correlation.confidenceInterval.upper.toFixed(3)}]`}
              tooltip="Intervalo de confianza al 95% para el coeficiente de correlación (Fisher z-transformation)"
            />
            <StatCard
              label="Tamaño de efecto"
              value={correlation.effectSize}
              subValue={`Cohen's d = ${correlation.cohenD.toFixed(2)}`}
              tooltip="Magnitud práctica del efecto: negligible (<0.1), pequeño (0.1-0.3), medio (0.3-0.5), grande (>0.5)"
            />
            <StatCard
              label="n (gl)"
              value={`${correlation.n} (${correlation.degreesOfFreedom})`}
              tooltip="Tamaño de muestra y grados de libertad (n-2)"
            />
          </div>
        </TabsContent>

        <TabsContent value="regression" className="space-y-4 mt-4">
          {/* Regression Stats */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-mono text-center text-lg">{regression.equation}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="R²"
              value={`${(regression.rSquared * 100).toFixed(1)}%`}
              tooltip="Proporción de varianza explicada por el modelo"
            />
            <StatCard
              label="R² ajustado"
              value={`${(regression.adjustedRSquared * 100).toFixed(1)}%`}
              tooltip="R² penalizado por número de predictores. Mejor para comparar modelos."
            />
            <StatCard
              label="Error Estándar"
              value={regression.standardErrorEstimate.toFixed(3)}
              tooltip="Error estándar de la estimación (SEE). Desviación típica de los residuos."
            />
            <StatCard
              label="F-statistic"
              value={regression.fStatistic.toFixed(2)}
              badge={
                <SignificanceBadge
                  pValue={regression.pValueModel}
                  isSignificant={regression.pValueModel < 0.05}
                />
              }
              tooltip="Prueba F para significancia global del modelo"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-2">Pendiente (β₁)</p>
              <p className="font-bold">{regression.slope.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">
                SE = {regression.standardErrorSlope.toFixed(4)} | t = {regression.tStatisticSlope.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                95% IC: [{regression.slopeCI.lower.toFixed(4)}, {regression.slopeCI.upper.toFixed(4)}]
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-2">Intercepto (β₀)</p>
              <p className="font-bold">{regression.intercept.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">
                SE = {regression.standardErrorIntercept.toFixed(4)}
              </p>
              <p className="text-xs text-muted-foreground">
                95% IC: [{regression.interceptCI.lower.toFixed(4)}, {regression.interceptCI.upper.toFixed(4)}]
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stat card component
function StatCard({
  label,
  value,
  subValue,
  color,
  badge,
  tooltip,
}: {
  label: string;
  value: string;
  subValue?: string;
  color?: string;
  badge?: React.ReactNode;
  tooltip?: string;
}) {
  const content = (
    <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        {label}
        {tooltip && <Info className="h-3 w-3" />}
      </div>
      <p className="font-bold text-lg" style={color ? { color } : undefined}>
        {value}
      </p>
      {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
      {badge && <div className="mt-1">{badge}</div>}
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

// Simple stats panel for backend-provided statistics
function BackendStatsPanel({ stats }: { stats: {
  pearsonR: number;
  spearmanRho: number;
  rSquared: number;
  pValue: number;
  isSignificant: boolean;
  ciLower: number;
  ciUpper: number;
  sampleSize: number;
  effectSize: string;
  warnings: string[];
}}) {
  const effectSizeLabels: Record<string, string> = {
    negligible: "Negligible",
    small: "Pequeño",
    medium: "Mediano",
    large: "Grande",
    very_large: "Muy Grande",
  };

  return (
    <div className="space-y-4">
      {/* Warnings */}
      {stats.warnings.length > 0 && (
        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              {stats.warnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Pearson (r)"
          value={stats.pearsonR.toFixed(3)}
          color={getCorrelationColor(stats.pearsonR)}
          tooltip="Coeficiente de correlación de Pearson"
        />
        <StatCard
          label="Spearman (ρ)"
          value={stats.spearmanRho.toFixed(3)}
          color={getCorrelationColor(stats.spearmanRho)}
          tooltip="Correlación de rangos de Spearman"
        />
        <StatCard
          label="R²"
          value={(stats.rSquared * 100).toFixed(1) + "%"}
          tooltip="Varianza explicada"
        />
        <StatCard
          label="p-value"
          value={stats.pValue < 0.001 ? "<0.001" : stats.pValue.toFixed(4)}
          badge={<SignificanceBadge pValue={stats.pValue} isSignificant={stats.isSignificant} />}
          tooltip="Significancia estadística"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="IC 95%"
          value={`[${stats.ciLower.toFixed(3)}, ${stats.ciUpper.toFixed(3)}]`}
          tooltip="Intervalo de confianza al 95% para r"
        />
        <StatCard
          label="Tamaño de efecto"
          value={effectSizeLabels[stats.effectSize] || stats.effectSize}
          tooltip="Clasificación de Cohen para el tamaño del efecto"
        />
        <StatCard
          label="Muestra (n)"
          value={stats.sampleSize.toLocaleString()}
          tooltip="Número de respondientes en el análisis"
        />
      </div>
    </div>
  );
}

export function CorrelationScatterPlot({
  points,
  regression,
  xLabel,
  yLabel,
  title = "Scatter Plot",
  backendStats,
}: CorrelationScatterPlotProps) {
  const [showBands, setShowBands] = useState(true);

  // Always calculate stats from points for visualization (trend line, bands)
  const visualStats = useMemo(() => {
    if (points.length < 3) return null;
    const x = points.map((p) => p.x);
    const y = points.map((p) => p.y);
    return calculateFullStatistics(x, y);
  }, [points]);

  // Generate prediction bands for visualization (always from points)
  const predictionBands = useMemo(() => {
    if (!visualStats || points.length < 3) return [];
    const x = points.map((p) => p.x);
    return generatePredictionBands(x, visualStats.regression, 30);
  }, [points, visualStats]);

  // Unified display stats - prefer backend stats for statistics panel
  const displayStats = useMemo(() => {
    if (backendStats) {
      return {
        pearsonR: backendStats.pearsonR,
        spearmanRho: backendStats.spearmanRho,
        rSquared: backendStats.rSquared,
        pValue: backendStats.pValue,
        isSignificant: backendStats.isSignificant,
        ciLower: backendStats.ciLower,
        ciUpper: backendStats.ciUpper,
        sampleSize: backendStats.sampleSize,
        effectSize: backendStats.effectSize,
        warnings: backendStats.nonlinear?.is_nonlinear
          ? ["Posible relación no lineal detectada."]
          : [],
      };
    }
    if (visualStats) {
      return {
        pearsonR: visualStats.correlation.pearsonR,
        spearmanRho: visualStats.correlation.spearmanRho,
        rSquared: Math.pow(visualStats.correlation.pearsonR, 2),
        pValue: visualStats.correlation.pValue,
        isSignificant: visualStats.correlation.isSignificant,
        ciLower: visualStats.correlation.confidenceInterval.lower,
        ciUpper: visualStats.correlation.confidenceInterval.upper,
        sampleSize: visualStats.correlation.n,
        effectSize: visualStats.correlation.effectSize,
        warnings: visualStats.warnings,
      };
    }
    return null;
  }, [backendStats, visualStats]);

  if (points.length === 0) {
    return (
      <Card>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          Selecciona dos indicadores para ver el scatter plot
        </CardContent>
      </Card>
    );
  }

  // Calculate domain with padding
  const xValues = points.map((p) => p.x);
  const yValues = points.map((p) => p.y);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const xPadding = (xMax - xMin) * 0.15 || 0.2;
  const yPadding = (yMax - yMin) * 0.15 || 0.2;

  // Combine data for chart
  const chartData = predictionBands.length > 0 ? predictionBands : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ScatterIcon className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              {xLabel} vs {yLabel}
              {backendStats && (
                <span className="block text-xs mt-1 text-muted-foreground/70">
                  Estadísticas calculadas con n={backendStats.sampleSize.toLocaleString()} respondientes
                </span>
              )}
            </CardDescription>
          </div>
          {displayStats && (
            <div className="text-right space-y-1">
              <Badge
                variant="outline"
                style={{
                  borderColor: getCorrelationColor(displayStats.pearsonR),
                  color: getCorrelationColor(displayStats.pearsonR),
                }}
              >
                r = {displayStats.pearsonR.toFixed(3)}
              </Badge>
              <div>
                <SignificanceBadge
                  pValue={displayStats.pValue}
                  isSignificant={displayStats.isSignificant}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
              data={chartData}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[xMin - xPadding, xMax + xPadding]}
                tick={{ fontSize: 11 }}
                label={{
                  value: xLabel,
                  position: "insideBottom",
                  offset: -10,
                  fontSize: 12,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[yMin - yPadding, yMax + yPadding]}
                tick={{ fontSize: 11 }}
                label={{
                  value: yLabel,
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 12,
                }}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload as ScatterPoint;
                    if (point.month) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <p className="font-medium">{point.month}</p>
                          <p className="text-sm">
                            {xLabel}: <strong>{point.x.toFixed(2)}</strong>
                          </p>
                          <p className="text-sm">
                            {yLabel}: <strong>{point.y.toFixed(2)}</strong>
                          </p>
                        </div>
                      );
                    }
                  }
                  return null;
                }}
              />

              {/* Prediction interval band (wider) */}
              {showBands && predictionBands.length > 0 && (
                <Area
                  type="monotone"
                  dataKey="upperPI"
                  stroke="none"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
              )}
              {showBands && predictionBands.length > 0 && (
                <Area
                  type="monotone"
                  dataKey="lowerPI"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                />
              )}

              {/* Confidence interval band (narrower) */}
              {showBands && predictionBands.length > 0 && (
                <Area
                  type="monotone"
                  dataKey="upperCI"
                  stroke="none"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              )}
              {showBands && predictionBands.length > 0 && (
                <Area
                  type="monotone"
                  dataKey="lowerCI"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                />
              )}

              {/* Trend line */}
              {predictionBands.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke={displayStats ? getCorrelationColor(displayStats.pearsonR) : "#3b82f6"}
                  strokeWidth={2}
                  dot={false}
                />
              )}

              {/* Scatter points */}
              <Scatter data={points} fill="#3b82f6" shape="circle" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Toggle bands */}
        {predictionBands.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <label className="text-xs text-muted-foreground flex items-center gap-2">
              <input
                type="checkbox"
                checked={showBands}
                onChange={(e) => setShowBands(e.target.checked)}
                className="rounded"
              />
              Mostrar bandas de confianza/predicción
            </label>
          </div>
        )}

        {/* Statistics panel - use backend stats if available, otherwise calculated */}
        {displayStats && (
          <div className="mt-4 pt-4 border-t">
            {!backendStats && visualStats ? (
              <StatisticsPanel
                correlation={visualStats.correlation}
                regression={visualStats.regression}
                warnings={visualStats.warnings}
              />
            ) : (
              <BackendStatsPanel stats={displayStats} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Interactive scatter plot with dimension selectors
interface InteractiveScatterPlotProps {
  dimensions: Dimension[];
  getScatterData: (dim1: string, dim2: string) => {
    points: ScatterPoint[];
    regression: RegressionData | null;
  };
  getDetailedStats?: (dim1InternalCode: string, dim2InternalCode: string) => BackendCorrelationStats | null;
  initialDim1?: string;
  initialDim2?: string;
}

export function InteractiveScatterPlot({
  dimensions,
  getScatterData,
  getDetailedStats,
  initialDim1,
  initialDim2,
}: InteractiveScatterPlotProps) {
  const [dim1, setDim1] = useState(initialDim1 || dimensions[0]?.code || "");
  const [dim2, setDim2] = useState(initialDim2 || dimensions[1]?.code || "");
  const [showBands, setShowBands] = useState(true);

  const { points } = getScatterData(dim1, dim2);

  const dim1Data = dimensions.find((d) => d.code === dim1);
  const dim2Data = dimensions.find((d) => d.code === dim2);
  const dim1Name = dim1Data?.name || dim1;
  const dim2Name = dim2Data?.name || dim2;

  // Get backend stats if function provided
  const backendStats = useMemo(() => {
    if (!getDetailedStats || !dim1Data || !dim2Data) return null;
    const dim1Internal = dim1Data.internal_code || dim1;
    const dim2Internal = dim2Data.internal_code || dim2;
    return getDetailedStats(dim1Internal, dim2Internal);
  }, [getDetailedStats, dim1Data, dim2Data, dim1, dim2]);

  // Always calculate stats from points for visualization (trend line, bands)
  const visualStats = useMemo(() => {
    if (points.length < 3) return null;
    const x = points.map((p) => p.x);
    const y = points.map((p) => p.y);
    return calculateFullStatistics(x, y);
  }, [points]);

  // Unified display stats - prefer backend stats for statistics panel
  const displayStats = useMemo(() => {
    if (backendStats) {
      return {
        pearsonR: backendStats.pearsonR,
        spearmanRho: backendStats.spearmanRho,
        rSquared: backendStats.rSquared,
        pValue: backendStats.pValue,
        isSignificant: backendStats.isSignificant,
        ciLower: backendStats.ciLower,
        ciUpper: backendStats.ciUpper,
        sampleSize: backendStats.sampleSize,
        effectSize: backendStats.effectSize,
        warnings: backendStats.nonlinear?.is_nonlinear
          ? ["Posible relación no lineal detectada."]
          : [],
      };
    }
    if (visualStats) {
      return {
        pearsonR: visualStats.correlation.pearsonR,
        spearmanRho: visualStats.correlation.spearmanRho,
        rSquared: Math.pow(visualStats.correlation.pearsonR, 2),
        pValue: visualStats.correlation.pValue,
        isSignificant: visualStats.correlation.isSignificant,
        ciLower: visualStats.correlation.confidenceInterval.lower,
        ciUpper: visualStats.correlation.confidenceInterval.upper,
        sampleSize: visualStats.correlation.n,
        effectSize: visualStats.correlation.effectSize,
        warnings: visualStats.warnings,
      };
    }
    return null;
  }, [backendStats, visualStats]);

  // Generate prediction bands for visualization (always from points)
  const predictionBands = useMemo(() => {
    if (!visualStats || points.length < 3) return [];
    const x = points.map((p) => p.x);
    return generatePredictionBands(x, visualStats.regression, 30);
  }, [points, visualStats]);

  // Calculate domain
  const xValues = points.map((p) => p.x);
  const yValues = points.map((p) => p.y);
  const xMin = points.length > 0 ? Math.min(...xValues) : 0;
  const xMax = points.length > 0 ? Math.max(...xValues) : 1;
  const yMin = points.length > 0 ? Math.min(...yValues) : 0;
  const yMax = points.length > 0 ? Math.max(...yValues) : 1;
  const xPadding = (xMax - xMin) * 0.15 || 0.2;
  const yPadding = (yMax - yMin) * 0.15 || 0.2;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ScatterIcon className="h-5 w-5" />
              Análisis de Correlación
            </CardTitle>
            <CardDescription>
              Selecciona dos indicadores para explorar su correlación con análisis estadístico completo
            </CardDescription>
          </div>
          {displayStats && (
            <div className="text-right space-y-1">
              <Badge
                variant="outline"
                style={{
                  borderColor: getCorrelationColor(displayStats.pearsonR),
                  color: getCorrelationColor(displayStats.pearsonR),
                }}
              >
                r = {displayStats.pearsonR.toFixed(3)} ({getCorrelationLabel(displayStats.pearsonR)})
              </Badge>
              <div>
                <SignificanceBadge
                  pValue={displayStats.pValue}
                  isSignificant={displayStats.isSignificant}
                />
              </div>
            </div>
          )}
        </div>
        {backendStats && (
          <p className="text-xs text-muted-foreground mt-1">
            Estadísticas calculadas con n={backendStats.sampleSize.toLocaleString()} respondientes
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* Selectors */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Indicador X (horizontal)
            </label>
            <Select value={dim1} onValueChange={setDim1}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona indicador" />
              </SelectTrigger>
              <SelectContent>
                {dimensions.map((d) => (
                  <SelectItem key={d.code} value={d.code} disabled={d.code === dim2}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Indicador Y (vertical)
            </label>
            <Select value={dim2} onValueChange={setDim2}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona indicador" />
              </SelectTrigger>
              <SelectContent>
                {dimensions.map((d) => (
                  <SelectItem key={d.code} value={d.code} disabled={d.code === dim1}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart */}
        {points.length > 0 ? (
          <>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
                  data={predictionBands}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={[xMin - xPadding, xMax + xPadding]}
                    tick={{ fontSize: 11 }}
                    label={{
                      value: dim1Name,
                      position: "insideBottom",
                      offset: -10,
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={[yMin - yPadding, yMax + yPadding]}
                    tick={{ fontSize: 11 }}
                    label={{
                      value: dim2Name,
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 11,
                    }}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const point = payload[0].payload as ScatterPoint;
                        if (point.month) {
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-sm">
                              <p className="font-medium">{point.month}</p>
                              <p className="text-sm">{dim1Name}: {point.x.toFixed(2)}</p>
                              <p className="text-sm">{dim2Name}: {point.y.toFixed(2)}</p>
                            </div>
                          );
                        }
                      }
                      return null;
                    }}
                  />

                  {/* Prediction interval band */}
                  {showBands && predictionBands.length > 0 && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="upperPI"
                        stroke="none"
                        fill="#94a3b8"
                        fillOpacity={0.15}
                      />
                      <Area
                        type="monotone"
                        dataKey="lowerPI"
                        stroke="#94a3b8"
                        strokeDasharray="2 2"
                        fill="none"
                        strokeOpacity={0.5}
                      />
                    </>
                  )}

                  {/* Confidence interval band */}
                  {showBands && predictionBands.length > 0 && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="upperCI"
                        stroke="none"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="lowerCI"
                        stroke="#3b82f6"
                        strokeDasharray="3 3"
                        fill="none"
                        strokeOpacity={0.5}
                      />
                    </>
                  )}

                  {/* Trend line */}
                  {predictionBands.length > 0 && (
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke={displayStats ? getCorrelationColor(displayStats.pearsonR) : "#3b82f6"}
                      strokeWidth={2}
                      dot={false}
                    />
                  )}

                  {/* Scatter points */}
                  <Scatter data={points} fill="#3b82f6" shape="circle" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Toggle and legend */}
            {predictionBands.length > 0 && (
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showBands}
                    onChange={(e) => setShowBands(e.target.checked)}
                    className="rounded"
                  />
                  Mostrar intervalos
                </label>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-2 bg-blue-500/20 rounded"></span>
                    IC 95% (media)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-2 bg-slate-400/15 rounded"></span>
                    IP 95% (predicción)
                  </span>
                </div>
              </div>
            )}

            {/* Statistics panel - use backend stats if available */}
            {displayStats && (
              <div className="mt-4 pt-4 border-t">
                {!backendStats && visualStats ? (
                  <StatisticsPanel
                    correlation={visualStats.correlation}
                    regression={visualStats.regression}
                    warnings={visualStats.warnings}
                  />
                ) : (
                  <BackendStatsPanel stats={displayStats} />
                )}
              </div>
            )}
          </>
        ) : (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            Selecciona dos indicadores diferentes
          </div>
        )}
      </CardContent>
    </Card>
  );
}
