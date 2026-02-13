"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlobalFiltersPanel } from "@/components/filters/global-filters";
import { DASHBOARD_CONFIG } from "@/lib/constants";
import {
  Users,
  Building2,
  Clock,
  UserCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Hooks
import {
  useSegmentationData,
  useSegmentComparison,
  useRiskGroups,
  useHeatmapData,
  useGlobalStats,
} from "@/hooks/use-segmentation";

// Chart components
import {
  SegmentBarChart,
  RiskGroupsTable,
  HeatmapChart,
  SegmentComparisonCards,
} from "@/components/charts/segmentation-charts";

export default function SegmentationPage() {
  const [selectedYear, setSelectedYear] = useState<number>(DASHBOARD_CONFIG.defaultYear);
  const [activeTab, setActiveTab] = useState("overview");

  // Data hooks
  const { data: segmentationData, isLoading } = useSegmentationData();
  const { data: departmentComparison, globalScore } = useSegmentComparison("department");
  const { data: tenureComparison } = useSegmentComparison("tenure");
  const { data: genderComparison } = useSegmentComparison("gender");
  const { data: riskGroups } = useRiskGroups();
  const { data: heatmapData } = useHeatmapData();
  const { data: globalStats } = useGlobalStats();

  // Calculate summary stats
  const lowEngagementCount = (departmentComparison || []).filter(
    (s) => s.engagement_pct < 70
  ).length;

  const highPerformers = (departmentComparison || []).filter(
    (s) => s.vs_global > 0.1
  ).length;

  return (
    <>
      <Header
        title="Segmentación Demográfica"
        description="Análisis de clima por segmentos poblacionales (datos reales de encuestas)"
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Global Filters Panel */}
        <GlobalFiltersPanel />

        {/* Summary KPIs */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{globalStats?.totalRespondents ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Total Respuestas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <TrendingUp className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(globalStats?.globalScore ?? 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Puntuación Global</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(departmentComparison || []).length}</p>
                  <p className="text-xs text-muted-foreground">Áreas Analizadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={(riskGroups || []).length > 0 ? "border-red-200" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(riskGroups || []).length}</p>
                  <p className="text-xs text-muted-foreground">Grupos de Riesgo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview" className="gap-1">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Áreas</span>
            </TabsTrigger>
            <TabsTrigger value="tenure" className="gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Antigüedad</span>
            </TabsTrigger>
            <TabsTrigger value="gender" className="gap-1">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Género</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="gap-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Riesgo</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Departments */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="grid gap-6">
                <Skeleton className="h-[400px]" />
                <Skeleton className="h-[500px]" />
              </div>
            ) : (
              <>
                <SegmentBarChart
                  data={departmentComparison}
                  globalScore={globalScore}
                  title="Compromiso por Área"
                  description="Comparación de puntuaciones entre las 20 áreas organizacionales"
                />

                <SegmentComparisonCards
                  data={departmentComparison}
                  globalScore={globalScore}
                  title="Detalle por Área"
                />

                {/* Heatmap */}
                {heatmapData && (
                  <HeatmapChart
                    data={heatmapData}
                    title="Mapa de Calor: Indicadores por Área"
                  />
                )}
              </>
            )}
          </TabsContent>

          {/* Tab: Tenure */}
          <TabsContent value="tenure" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="grid gap-6">
                <Skeleton className="h-[300px]" />
                <Skeleton className="h-[400px]" />
              </div>
            ) : (
              <>
                <SegmentBarChart
                  data={tenureComparison}
                  globalScore={globalScore}
                  title="Compromiso por Antigüedad"
                  description="Evolución del compromiso según tiempo en la organización"
                />

                <SegmentComparisonCards
                  data={tenureComparison}
                  globalScore={globalScore}
                  title="Detalle por Rango de Antigüedad"
                />

                {/* Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Insights de Antigüedad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {tenureComparison?.length > 0 && tenureComparison[0] && tenureComparison[tenureComparison.length - 1] && (
                        <>
                          <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                            <p>
                              Los colaboradores con{" "}
                              <strong>{tenureComparison[0].segment_name}</strong> muestran el mayor
                              compromiso ({(tenureComparison[0].engagement_score ?? 0).toFixed(2)})
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <TrendingDown className="h-4 w-4 text-red-600 mt-0.5" />
                            <p>
                              El grupo con{" "}
                              <strong>{tenureComparison[tenureComparison.length - 1].segment_name}</strong>{" "}
                              presenta menor compromiso ({(tenureComparison[tenureComparison.length - 1].engagement_score ?? 0).toFixed(2)})
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Tab: Gender */}
          <TabsContent value="gender" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="grid gap-6">
                <Skeleton className="h-[300px]" />
                <Skeleton className="h-[400px]" />
              </div>
            ) : (
              <>
                <SegmentBarChart
                  data={genderComparison}
                  globalScore={globalScore}
                  title="Compromiso por Género"
                  description="Comparación entre grupos de género"
                />

                <SegmentComparisonCards
                  data={genderComparison}
                  globalScore={globalScore}
                  title="Detalle por Género"
                />

                {/* Gender Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Insights de Género</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {(genderComparison || []).length >= 2 && (
                        <>
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 text-primary mt-0.5" />
                            <p>
                              <strong>{genderComparison[0].segment_name}</strong> tiene el mayor
                              engagement ({(genderComparison[0].engagement_score ?? 0).toFixed(2)}) con{" "}
                              {genderComparison[0].respondent_count} respondentes
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p>
                              <strong>{genderComparison[1].segment_name}</strong> tiene un engagement de{" "}
                              {(genderComparison[1].engagement_score ?? 0).toFixed(2)} con{" "}
                              {genderComparison[1].respondent_count} respondentes
                            </p>
                          </div>
                          <div className="flex items-start gap-2 pt-2 border-t">
                            <p className="text-muted-foreground">
                              Diferencia de engagement entre géneros:{" "}
                              <strong className={Math.abs((genderComparison[0].engagement_score ?? 0) - (genderComparison[1].engagement_score ?? 0)) > 0.1 ? "text-yellow-600" : "text-green-600"}>
                                {Math.abs((genderComparison[0].engagement_score ?? 0) - (genderComparison[1].engagement_score ?? 0)).toFixed(2)} puntos
                              </strong>
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Tab: Risk Groups */}
          <TabsContent value="risk" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="grid gap-6">
                <Skeleton className="h-[400px]" />
              </div>
            ) : (
              <>
                {/* Risk summary */}
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Resumen de Riesgo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                        <p className="text-3xl font-bold text-red-600">
                          {(riskGroups || []).filter((r) => r.risk_level === "high").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Alto Riesgo</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                        <p className="text-3xl font-bold text-yellow-600">
                          {(riskGroups || []).filter((r) => r.risk_level === "medium").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Riesgo Medio</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-950/20">
                        <p className="text-3xl font-bold text-slate-600">
                          {(riskGroups || []).reduce((sum, r) => sum + r.respondent_count, 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Colaboradores Afectados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk groups table */}
                <RiskGroupsTable
                  data={riskGroups}
                  title="Grupos de Riesgo Identificados"
                />

                {/* Action recommendations */}
                {(riskGroups || []).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recomendaciones de Acción</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(riskGroups || []).slice(0, 3).map((group) => (
                          <div
                            key={group.id}
                            className="p-3 rounded-lg bg-muted/50 border-l-4 border-red-500"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-sm">
                                {group.department} - {group.tenure}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {(group.engagement_pct ?? 0).toFixed(1)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {group.critical_dimensions.length > 0
                                ? `Priorizar intervenciones en: ${group.critical_dimensions.join(", ")}`
                                : "Requiere análisis detallado de indicadores específicos"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(riskGroups || []).length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No se identificaron grupos de riesgo con engagement menor al 70%.
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
