"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { AlertListV2 } from "@/components/dashboard/alert-list-v2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilteredAlerts, useCurrentFilterLabel } from "@/hooks/use-filtered-clima";
import { DIMENSION_LABELS_V2, type DimensionCodeV2 } from "@/types/clima-v2";
import { AlertCircle, AlertTriangle, Info, Bell, Filter } from "lucide-react";

type AlertSeverity = "critical" | "warning" | "info";

export default function AlertsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<
    AlertSeverity | "all"
  >("all");
  const [selectedDimension, setSelectedDimension] = useState<
    DimensionCodeV2 | "all"
  >("all");

  // Obtener alertas V2 con filtros demográficos aplicados
  const { data: alerts, isLoading, hasFilters } = useFilteredAlerts();
  const filterLabel = useCurrentFilterLabel();

  // Filtrar por severidad y dimensión
  const filteredAlerts = alerts
    ?.filter((a) =>
      selectedSeverity === "all" ? true : a.severity === selectedSeverity
    )
    .filter((a) =>
      selectedDimension === "all"
        ? true
        : a.dimension_code === selectedDimension
    );

  // Contar alertas por severidad
  const criticalCount =
    alerts?.filter((a) => a.severity === "critical").length || 0;
  const warningCount =
    alerts?.filter((a) => a.severity === "warning").length || 0;
  const infoCount = 0; // No info alerts in current implementation

  return (
    <>
      <Header
        title="Panel de Alertas"
        description="Indicadores que requieren atención"
        showYearSelector={false}
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
        {/* Resumen de alertas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Alertas
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticas</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {criticalCount}
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Advertencias</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {warningCount}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Información</CardTitle>
              <Info className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Severidad</label>
              <Select
                value={selectedSeverity}
                onValueChange={(value) =>
                  setSelectedSeverity(value as AlertSeverity | "all")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Críticas</SelectItem>
                  <SelectItem value="warning">Advertencias</SelectItem>
                  <SelectItem value="info">Información</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Indicador</label>
              <Select
                value={selectedDimension}
                onValueChange={(value) =>
                  setSelectedDimension(value as DimensionCodeV2 | "all")
                }
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los indicadores</SelectItem>
                  {Object.entries(DIMENSION_LABELS_V2).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de alertas */}
        {isLoading ? (
          <Skeleton className="h-[400px]" />
        ) : filteredAlerts && filteredAlerts.length > 0 ? (
          <AlertListV2
            alerts={filteredAlerts}
            title={`Alertas (${filteredAlerts.length})`}
            showRecommendations
          />
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay alertas que coincidan con los filtros seleccionados.
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
