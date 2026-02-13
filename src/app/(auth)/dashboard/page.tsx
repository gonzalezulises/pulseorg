"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { AlertListV2 } from "@/components/dashboard/alert-list-v2";
import { DimensionGridV2 } from "@/components/dashboard/dimension-grid-v2";
import { DimensionLollipop } from "@/components/charts/dimension-lollipop";
import { EngagementProfiles } from "@/components/dashboard/engagement-profiles";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useYearComparisonV2 } from "@/hooks/use-clima-v2";
import {
  useFilteredDashboardKPIs,
  useFilteredDimensionStats,
  useFilteredEngagement,
  useFilteredAlerts,
  useCurrentFilterLabel,
} from "@/hooks/use-filtered-clima";
import { DASHBOARD_CONFIG } from "@/lib/constants";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Layers,
  Heart,
  Target,
  Filter,
} from "lucide-react";

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState<number>(DASHBOARD_CONFIG.defaultYear);

  // Obtener KPIs y datos V2 con filtros aplicados
  const { data: kpis, isLoading: kpisLoading, hasFilters } = useFilteredDashboardKPIs(selectedYear);
  const { data: dimensions, isLoading: dimensionsLoading } = useFilteredDimensionStats(selectedYear);
  const { data: engagement, isLoading: engagementLoading } = useFilteredEngagement(selectedYear);
  const { data: alerts, isLoading: alertsLoading } = useFilteredAlerts({ limit: 5 });
  const { data: comparison } = useYearComparisonV2(selectedYear, selectedYear - 1);
  const filterLabel = useCurrentFilterLabel();

  const isLoading = kpisLoading || dimensionsLoading || engagementLoading;

  return (
    <>
      <Header
        title="Panel General"
        description="Clima Organizacional - 17 Indicadores"
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
        {/* KPIs */}
        <section>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-[120px]" />
                ))}
              </>
            ) : (
              <>
                <KPICard
                  title="Compromiso"
                  value={`${kpis?.engagementPct.toFixed(0) || 0}%`}
                  icon={Heart}
                  trend={kpis?.yearOverYearChange}
                  trendLabel="vs año anterior"
                />
                <KPICard
                  title="Puntuación Global"
                  value={kpis?.engagementScore.toFixed(2) || "0.00"}
                  icon={Target}
                  description="Promedio /5.00"
                />
                <KPICard
                  title="Respuestas"
                  value={kpis?.totalResponses.toLocaleString() || "0"}
                  icon={Users}
                  description={`Año ${selectedYear}`}
                />
                <KPICard
                  title="Indicadores"
                  value={kpis?.dimensionsAnalyzed || 0}
                  icon={Layers}
                  description="analizados"
                />
                <KPICard
                  title="Requieren Atención"
                  value={kpis?.criticalDimensions || 0}
                  icon={AlertTriangle}
                  description="Indicadores críticos"
                />
                <KPICard
                  title="Mejor Indicador"
                  value={kpis?.topDimension?.avg_score.toFixed(2) || "-"}
                  icon={TrendingUp}
                  description={kpis?.topDimension?.dimension_name || "-"}
                />
              </>
            )}
          </div>
        </section>

        {/* Gráficos principales: Engagement + Radar */}
        <section className="grid gap-6 lg:grid-cols-2">
          {isLoading ? (
            <>
              <Skeleton className="h-[400px]" />
              <Skeleton className="h-[400px]" />
            </>
          ) : (
            <>
              {engagement && <EngagementProfiles data={engagement} />}
              {dimensions && <DimensionLollipop data={dimensions} maxItems={10} />}
            </>
          )}
        </section>

        {/* Grid de las 17 dimensiones */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            17 Indicadores del Clima Organizacional
          </h2>
          {dimensionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((i) => (
                <Skeleton key={i} className="h-[150px]" />
              ))}
            </div>
          ) : (
            dimensions && <DimensionGridV2 dimensions={dimensions} />
          )}
        </section>

        {/* Alertas */}
        <section>
          {alertsLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <AlertListV2 alerts={alerts || []} />
          )}
        </section>
      </main>
    </>
  );
}
