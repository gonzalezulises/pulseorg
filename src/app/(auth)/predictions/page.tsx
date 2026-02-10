"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  LineChart as LineChartIcon,
  Bell,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

// Hooks
import {
  usePredictionsData,
  useRotationRisk,
  useProjections,
  useEarlyAlerts,
  usePredictionsSummary,
} from "@/hooks/use-predictions";

// Components
import {
  RotationGauge,
  RiskFactorsList,
  HighRiskAreasTable,
  EngagementRotationCorrelation,
} from "@/components/charts/rotation-gauge";
import {
  ProjectionChart,
  DimensionProjections,
} from "@/components/charts/projection-chart";
import {
  EarlyAlertsList,
  AlertsSummaryCards,
} from "@/components/charts/early-alerts";

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState("rotation");

  // Data hooks
  const { data: predictionsData, isLoading } = usePredictionsData();
  const { data: rotationRisk } = useRotationRisk();
  const { data: projections } = useProjections();
  const { data: alerts } = useEarlyAlerts();
  const { data: summary } = usePredictionsSummary();

  return (
    <>
      <Header
        title="Predicciones y Alertas"
        description="Analisis predictivo y sistema de alertas tempranas del clima organizacional"
        showYearSelector={false}
        showFilters={false}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Summary KPIs */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-[100px]" />
            ))}
          </div>
        ) : (
          <AlertsSummaryCards
            totalAlerts={summary?.total_alerts || 0}
            newAlerts={summary?.new_alerts || 0}
            highSeverity={summary?.high_severity_alerts || 0}
            dimensionsImproving={summary?.dimensions_improving || 0}
            dimensionsDeclining={summary?.dimensions_declining || 0}
          />
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="rotation" className="gap-1">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Rotacion</span>
            </TabsTrigger>
            <TabsTrigger value="projections" className="gap-1">
              <LineChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Proyecciones</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-1">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
              {summary && summary.new_alerts > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs justify-center">
                  {summary.new_alerts}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Rotation Risk Tab */}
          <TabsContent value="rotation" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-[400px]" />
                <Skeleton className="h-[400px]" />
                <Skeleton className="h-[300px] lg:col-span-2" />
                <Skeleton className="h-[350px] lg:col-span-2" />
              </div>
            ) : rotationRisk ? (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  <RotationGauge
                    riskIndex={rotationRisk.overall_index}
                    trend={rotationRisk.trend}
                  />
                  <RiskFactorsList factors={rotationRisk.risk_factors} />
                </div>

                <HighRiskAreasTable areas={rotationRisk.high_risk_areas} />

                <EngagementRotationCorrelation
                  data={rotationRisk.engagement_rotation_correlation}
                />
              </>
            ) : (
              <EmptyState message="No hay datos de riesgo de rotacion disponibles" />
            )}
          </TabsContent>

          {/* Projections Tab */}
          <TabsContent value="projections" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-[450px]" />
                <Skeleton className="h-[500px]" />
              </div>
            ) : projections ? (
              <>
                <ProjectionChart data={projections.overall} />
                <DimensionProjections data={projections.by_dimension} />
              </>
            ) : (
              <EmptyState message="No hay datos de proyecciones disponibles" />
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6 mt-6">
            {isLoading ? (
              <Skeleton className="h-[500px]" />
            ) : (
              <EarlyAlertsList alerts={alerts} />
            )}
          </TabsContent>
        </Tabs>

        {/* Last updated */}
        {summary && (
          <p className="text-xs text-muted-foreground text-center">
            Ultima actualizacion:{" "}
            {new Date(summary.last_updated).toLocaleString("es-ES", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </main>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="h-[300px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
