"use client";

import { useState, useCallback, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Grid3X3,
  Building2,
  Target,
  ScatterChart as ScatterIcon,
  Lightbulb,
} from "lucide-react";

// Hooks
import {
  useCorrelationsData,
  useCorrelationMatrix,
  useEngagementDrivers,
  useSortedBusinessCorrelations,
  useScatterPlotData,
  useCorrelationInsights,
  useDetailedCorrelation,
} from "@/hooks/use-correlations";

// Components
import { CorrelationHeatmap } from "@/components/charts/correlation-heatmap";
import {
  BusinessCorrelationsTable,
  BusinessCorrelationsSummary,
} from "@/components/charts/business-correlations";
import {
  EngagementDriversChart,
  EngagementDriversList,
  DriversSummary,
} from "@/components/charts/engagement-drivers";
import {
  CorrelationScatterPlot,
  InteractiveScatterPlot,
} from "@/components/charts/correlation-scatter";

// Types
import { calculateLinearRegression, calculatePearsonCorrelation } from "@/types/correlations";

export default function CorrelationsPage() {
  const [activeTab, setActiveTab] = useState("matrix");
  const [scatterDialog, setScatterDialog] = useState<{
    open: boolean;
    dim1Index: number;
    dim2Index: number;
  }>({ open: false, dim1Index: 0, dim2Index: 1 });

  // Data hooks
  const { data: correlationsData, isLoading } = useCorrelationsData();
  const { matrix, dimensions } = useCorrelationMatrix();
  const { data: engagementDrivers } = useEngagementDrivers();
  const { data: businessCorrelations } = useSortedBusinessCorrelations("rotation", "desc");
  const { data: insights } = useCorrelationInsights();

  // Handle cell click in heatmap
  const handleHeatmapCellClick = useCallback((dim1Index: number, dim2Index: number) => {
    setScatterDialog({ open: true, dim1Index, dim2Index });
  }, []);

  // Handle business correlation click
  const handleBusinessCorrelationClick = useCallback(
    (dimensionCode: string, indicator: string) => {
      // Find dimension index
      const dimIndex = dimensions.findIndex((d) => d.code === dimensionCode);
      if (dimIndex !== -1) {
        // For business indicators, we show scatter against engagement (D17)
        const engagementIndex = dimensions.findIndex((d) => d.code === "D17");
        setScatterDialog({
          open: true,
          dim1Index: dimIndex,
          dim2Index: engagementIndex !== -1 ? engagementIndex : 0,
        });
      }
    },
    [dimensions]
  );

  // Get scatter data for selected dimensions
  const getScatterData = useCallback(
    (dim1Code: string, dim2Code: string) => {
      if (!correlationsData?.scatter_data) {
        return { points: [], regression: null };
      }

      const dim1Scores = correlationsData.scatter_data.dimension_scores.find(
        (d) => d.dimension === dim1Code
      );
      const dim2Scores = correlationsData.scatter_data.dimension_scores.find(
        (d) => d.dimension === dim2Code
      );

      if (!dim1Scores || !dim2Scores) {
        return { points: [], regression: null };
      }

      const points = dim1Scores.scores.map((x, i) => ({
        x,
        y: dim2Scores.scores[i],
        month: correlationsData.scatter_data.months[i],
      }));

      const x = dim1Scores.scores;
      const y = dim2Scores.scores;

      const correlation = calculatePearsonCorrelation(x, y);
      const regression = calculateLinearRegression(x, y);

      return {
        points,
        regression: {
          ...regression,
          correlation,
          equation: `y = ${regression.slope.toFixed(2)}x + ${regression.intercept.toFixed(2)}`,
        },
      };
    },
    [correlationsData]
  );

  // Current scatter dialog data
  const scatterDialogData = useMemo(() => {
    if (!dimensions.length || scatterDialog.dim1Index < 0 || scatterDialog.dim2Index < 0) {
      return { points: [], regression: null, xLabel: "", yLabel: "", dim1Code: "", dim2Code: "" };
    }

    const dim1 = dimensions[scatterDialog.dim1Index];
    const dim2 = dimensions[scatterDialog.dim2Index];

    if (!dim1 || !dim2) {
      return { points: [], regression: null, xLabel: "", yLabel: "", dim1Code: "", dim2Code: "" };
    }

    const data = getScatterData(dim1.code, dim2.code);
    return {
      ...data,
      xLabel: dim1.name,
      yLabel: dim2.name,
      dim1Code: dim1.internal_code || dim1.code,
      dim2Code: dim2.internal_code || dim2.code,
    };
  }, [dimensions, scatterDialog, getScatterData]);

  // Get detailed stats from backend for current scatter selection
  const { data: detailedStats } = useDetailedCorrelation(
    scatterDialogData.dim1Code,
    scatterDialogData.dim2Code
  );

  // Function to get detailed stats for any dimension pair (for InteractiveScatterPlot)
  const getDetailedStats = useCallback(
    (dim1InternalCode: string, dim2InternalCode: string) => {
      if (!correlationsData?.detailed_correlations) return null;

      const detail = correlationsData.detailed_correlations.find(
        (d) =>
          (d.dim1 === dim1InternalCode && d.dim2 === dim2InternalCode) ||
          (d.dim1 === dim2InternalCode && d.dim2 === dim1InternalCode)
      );

      if (!detail) return null;

      return {
        pearsonR: detail.r,
        adjustedR: detail.adjusted_r,
        partialR: detail.partial_r,
        spearmanRho: detail.spearman,
        pValue: detail.p_value,
        rSquared: detail.r_squared,
        ciLower: detail.ci_lower,
        ciUpper: detail.ci_upper,
        effectSize: detail.effect_size,
        sampleSize: detail.n,
        isSignificant: detail.is_significant,
        nonlinear: detail.nonlinear,
      };
    },
    [correlationsData]
  );

  // Business impact summary
  const businessImpactSummary = useMemo(() => {
    if (!businessCorrelations.length) return null;

    const rotationImpact = [...businessCorrelations].sort(
      (a, b) => Math.abs(b.rotation) - Math.abs(a.rotation)
    )[0];
    const productivityImpact = [...businessCorrelations].sort(
      (a, b) => Math.abs(b.productivity) - Math.abs(a.productivity)
    )[0];
    const npsImpact = [...businessCorrelations].sort(
      (a, b) => Math.abs(b.nps) - Math.abs(a.nps)
    )[0];

    return {
      rotationImpact: {
        dimension: rotationImpact.dimension,
        name: rotationImpact.dimensionName,
        correlation: rotationImpact.rotation,
      },
      productivityImpact: {
        dimension: productivityImpact.dimension,
        name: productivityImpact.dimensionName,
        correlation: productivityImpact.productivity,
      },
      npsImpact: {
        dimension: npsImpact.dimension,
        name: npsImpact.dimensionName,
        correlation: npsImpact.nps,
      },
    };
  }, [businessCorrelations]);

  return (
    <>
      <Header
        title="Análisis de Correlaciones"
        description="Explora las relaciones entre dimensiones del clima y su impacto en indicadores de negocio"
        showYearSelector={false}
        showFilters={false}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Insights Summary */}
        {!isLoading && insights && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-primary">Insight Principal</p>
                  <p className="text-sm text-muted-foreground">
                    {insights.top_driver.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="matrix" className="gap-1">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Matriz</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="gap-1">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Negocio</span>
            </TabsTrigger>
            <TabsTrigger value="drivers" className="gap-1">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Drivers</span>
            </TabsTrigger>
            <TabsTrigger value="scatter" className="gap-1">
              <ScatterIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Scatter</span>
            </TabsTrigger>
          </TabsList>

          {/* Matrix Tab */}
          <TabsContent value="matrix" className="space-y-6 mt-6">
            {isLoading ? (
              <Skeleton className="h-[600px]" />
            ) : (
              <CorrelationHeatmap
                matrix={matrix}
                dimensions={dimensions}
                onCellClick={handleHeatmapCellClick}
              />
            )}
          </TabsContent>

          {/* Business Indicators Tab */}
          <TabsContent value="business" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-[100px]" />
                  ))}
                </div>
                <Skeleton className="h-[500px]" />
              </div>
            ) : (
              <>
                {businessImpactSummary && (
                  <BusinessCorrelationsSummary
                    rotationImpact={businessImpactSummary.rotationImpact}
                    productivityImpact={businessImpactSummary.productivityImpact}
                    npsImpact={businessImpactSummary.npsImpact}
                  />
                )}
                <BusinessCorrelationsTable
                  data={businessCorrelations}
                  onDimensionClick={handleBusinessCorrelationClick}
                />
              </>
            )}
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[80px]" />
                  ))}
                </div>
                <Skeleton className="h-[550px]" />
              </div>
            ) : (
              <>
                <DriversSummary drivers={engagementDrivers} />
                <EngagementDriversChart
                  data={engagementDrivers}
                  onBarClick={(dimCode) => {
                    const dimIndex = dimensions.findIndex((d) => d.code === dimCode);
                    const engIndex = dimensions.findIndex((d) => d.code === "D17");
                    if (dimIndex !== -1 && engIndex !== -1) {
                      setScatterDialog({ open: true, dim1Index: dimIndex, dim2Index: engIndex });
                    }
                  }}
                />
              </>
            )}
          </TabsContent>

          {/* Scatter Plot Tab */}
          <TabsContent value="scatter" className="space-y-6 mt-6">
            {isLoading ? (
              <Skeleton className="h-[550px]" />
            ) : (
              <InteractiveScatterPlot
                dimensions={dimensions}
                getScatterData={getScatterData}
                getDetailedStats={getDetailedStats}
                initialDim1="D02"
                initialDim2="D17"
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Scatter Plot Dialog */}
      <Dialog
        open={scatterDialog.open}
        onOpenChange={(open) => setScatterDialog({ ...scatterDialog, open })}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Correlación entre Dimensiones</DialogTitle>
            <DialogDescription>
              Análisis de dispersión y regresión lineal
            </DialogDescription>
          </DialogHeader>
          <CorrelationScatterPlot
            points={scatterDialogData.points}
            regression={scatterDialogData.regression}
            xLabel={scatterDialogData.xLabel}
            yLabel={scatterDialogData.yLabel}
            title=""
            backendStats={detailedStats}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
