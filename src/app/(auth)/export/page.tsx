"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AVAILABLE_YEARS, DASHBOARD_CONFIG } from "@/lib/constants";
import { DIMENSION_LABELS_V2, type DimensionCodeV2 } from "@/types/clima-v2";
import { useClimaDataV2 } from "@/hooks/use-clima-v2";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

type ExportFormat = "csv" | "json";
type ExportScope = "dimensions" | "engagement" | "all";

const formatConfig: Record<
  ExportFormat,
  { label: string; icon: typeof FileSpreadsheet; extension: string }
> = {
  csv: { label: "CSV (.csv)", icon: FileText, extension: "csv" },
  json: { label: "JSON (.json)", icon: FileSpreadsheet, extension: "json" },
};

const scopeConfig: Record<ExportScope, { label: string; description: string }> =
  {
    dimensions: {
      label: "Indicadores",
      description: "Estadísticas de los 17 indicadores",
    },
    engagement: {
      label: "Compromiso",
      description: "Datos de compromiso y perfiles",
    },
    all: {
      label: "Todos los datos",
      description: "Indicadores y compromiso completos",
    },
  };

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (typeof val === "string" && val.includes(",")) {
        return `"${val}"`;
      }
      return String(val ?? "");
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export default function ExportPage() {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [scope, setScope] = useState<ExportScope>("dimensions");
  const [year, setYear] = useState<number | "all">(DASHBOARD_CONFIG.defaultYear);
  const [dimension, setDimension] = useState<DimensionCodeV2 | "all">("all");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: climaData, isLoading: isLoadingData } = useClimaDataV2();

  const handleExport = () => {
    if (!climaData) {
      setError("No hay datos disponibles para exportar");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // Filtrar por año
      const yearsToExport =
        year === "all"
          ? Object.keys(climaData.years)
          : [String(year)];

      let exportData: Record<string, unknown>[] = [];

      if (scope === "dimensions" || scope === "all") {
        yearsToExport.forEach((y) => {
          const yearData = climaData.years[y];
          if (yearData?.dimensions) {
            const dims =
              dimension === "all"
                ? yearData.dimensions
                : yearData.dimensions.filter((d) => d.dimension_code === dimension);

            dims.forEach((d) => {
              exportData.push({
                year: y,
                dimension_code: d.dimension_code,
                dimension_name: d.dimension_name,
                avg_score: d.avg_score,
                favorability_pct: d.favorability_pct,
                benchmark: d.benchmark,
                gap_vs_benchmark: d.gap_vs_benchmark,
                segment: d.segment,
                rank: d.rank,
                item_count: d.item_count,
              });
            });
          }
        });
      }

      if (scope === "engagement" || scope === "all") {
        yearsToExport.forEach((y) => {
          const yearData = climaData.years[y];
          if (yearData?.engagement) {
            const eng = yearData.engagement;
            exportData.push({
              year: y,
              type: "engagement_summary",
              engagement_score: eng.engagement_score,
              engagement_pct: eng.engagement_pct,
              respondent_count: eng.respondent_count,
              embajadores_n: eng.profiles["Embajadores"]?.n || 0,
              embajadores_pct: eng.profiles["Embajadores"]?.pct || 0,
              comprometidos_pragmaticos_n: eng.profiles["Comprometidos Pragmáticos"]?.n || 0,
              comprometidos_pragmaticos_pct: eng.profiles["Comprometidos Pragmáticos"]?.pct || 0,
              neutrales_n: eng.profiles["Neutrales"]?.n || 0,
              neutrales_pct: eng.profiles["Neutrales"]?.pct || 0,
              desvinculados_n: eng.profiles["Desvinculados"]?.n || 0,
              desvinculados_pct: eng.profiles["Desvinculados"]?.pct || 0,
            });
          }
        });
      }

      // Generar archivo
      const timestamp = new Date().toISOString().split("T")[0];
      const yearSuffix = year !== "all" ? `_${year}` : "_all";
      const scopeSuffix = `_${scope}`;
      const filename = `clima_v2${scopeSuffix}${yearSuffix}_${timestamp}.${formatConfig[format].extension}`;

      if (format === "json") {
        downloadFile(
          JSON.stringify(exportData, null, 2),
          filename,
          "application/json"
        );
      } else {
        downloadFile(convertToCSV(exportData), filename, "text/csv");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al exportar los datos"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Header
        title="Exportar Datos"
        description="Descargar datos del clima organizacional V2"
        showYearSelector={false}
        showFilters={false}
      />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Configuración de exportación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Formato */}
              <div className="space-y-2">
                <Label>Formato</Label>
                <Select
                  value={format}
                  onValueChange={(value) => setFormat(value as ExportFormat)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(formatConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Alcance */}
              <div className="space-y-2">
                <Label>Datos a exportar</Label>
                <Select
                  value={scope}
                  onValueChange={(value) => setScope(value as ExportScope)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(scopeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {scopeConfig[scope].description}
                </p>
              </div>

              {/* Año */}
              <div className="space-y-2">
                <Label>Año</Label>
                <Select
                  value={String(year)}
                  onValueChange={(value) =>
                    setYear(value === "all" ? "all" : Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los años</SelectItem>
                    {AVAILABLE_YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dimensión (solo si scope incluye dimensiones) */}
              {(scope === "dimensions" || scope === "all") && (
                <div className="space-y-2">
                  <Label>Indicador</Label>
                  <Select
                    value={dimension}
                    onValueChange={(value) =>
                      setDimension(value as DimensionCodeV2 | "all")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los indicadores (17)</SelectItem>
                      {Object.entries(DIMENSION_LABELS_V2).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Botón de exportar */}
              <Button
                onClick={handleExport}
                disabled={isExporting || isLoadingData || !climaData}
                className="w-full"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Datos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Vista previa / información */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h4 className="font-medium">Resumen de exportación</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Formato:</span>
                    <span className="font-medium text-foreground">
                      {formatConfig[format].label}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Datos:</span>
                    <span className="font-medium text-foreground">
                      {scopeConfig[scope].label}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Año:</span>
                    <span className="font-medium text-foreground">
                      {year === "all" ? "Todos (2023-2026)" : year}
                    </span>
                  </li>
                  {(scope === "dimensions" || scope === "all") && (
                    <li className="flex justify-between">
                      <span>Indicador:</span>
                      <span className="font-medium text-foreground">
                        {dimension === "all"
                          ? "Todos (17)"
                          : DIMENSION_LABELS_V2[dimension]}
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">Modelo V2 - 17 Indicadores</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Datos procesados del informe ejecutivo</li>
                  <li>17 indicadores del clima organizacional</li>
                  <li>4 perfiles de compromiso</li>
                  <li>Datos históricos 2023-2026</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
