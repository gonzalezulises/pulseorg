"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCorrelationColor, getCorrelationLabel } from "@/types/correlations";
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Building2 } from "lucide-react";

interface BusinessCorrelationData {
  dimension: string;
  dimensionName: string;
  dimensionShort: string;
  rotation: number;
  absenteeism: number;
  productivity: number;
  nps: number;
}

interface BusinessCorrelationsTableProps {
  data: BusinessCorrelationData[];
  onDimensionClick?: (dimensionCode: string, indicator: string) => void;
  title?: string;
}

type SortField = "rotation" | "absenteeism" | "productivity" | "nps" | "dimensionName";
type SortOrder = "asc" | "desc";

export function BusinessCorrelationsTable({
  data,
  onDimensionClick,
  title = "Correlación con Indicadores de Negocio",
}: BusinessCorrelationsTableProps) {
  const [sortField, setSortField] = useState<SortField>("rotation");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let valueA: number | string;
    let valueB: number | string;

    if (sortField === "dimensionName") {
      valueA = a.dimensionName;
      valueB = b.dimensionName;
      return sortOrder === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    valueA = Math.abs(a[sortField]);
    valueB = Math.abs(b[sortField]);
    return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  const CorrelationCell = ({
    value,
    dimensionCode,
    indicator,
    isNegativeGood = false,
  }: {
    value: number;
    dimensionCode: string;
    indicator: string;
    isNegativeGood?: boolean;
  }) => {
    const displayColor = isNegativeGood ? getCorrelationColor(-value) : getCorrelationColor(value);
    const absValue = Math.abs(value);

    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="w-full h-full flex items-center justify-center gap-1 py-2 px-3 rounded hover:bg-muted/50 transition-colors"
              onClick={() => onDimensionClick?.(dimensionCode, indicator)}
            >
              {value < 0 ? (
                <TrendingDown className="h-3 w-3" style={{ color: displayColor }} />
              ) : (
                <TrendingUp className="h-3 w-3" style={{ color: displayColor }} />
              )}
              <span
                className="font-medium"
                style={{ color: displayColor }}
              >
                {value > 0 ? "+" : ""}
                {value.toFixed(2)}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{getCorrelationLabel(value)}</p>
            <p className="text-xs text-muted-foreground">
              Clic para ver scatter plot
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          Correlación de cada indicador con métricas clave del negocio. Haz clic en un valor para ver el scatter plot.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              No hay datos de indicadores de negocio disponibles.
            </p>
            <p className="text-sm text-muted-foreground/80 mt-1">
              Los indicadores de rotación, ausentismo, productividad y NPS requieren integración con sistemas externos.
            </p>
          </div>
        ) : (
        <>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 -ml-2"
                    onClick={() => handleSort("dimensionName")}
                  >
                    Indicador
                    <SortIcon field="dimensionName" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort("rotation")}
                  >
                    Rotación
                    <SortIcon field="rotation" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort("absenteeism")}
                  >
                    Ausentismo
                    <SortIcon field="absenteeism" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort("productivity")}
                  >
                    Productividad
                    <SortIcon field="productivity" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort("nps")}
                  >
                    NPS
                    <SortIcon field="nps" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row) => (
                <TableRow key={row.dimension}>
                  <TableCell className="font-medium">
                    <span title={row.dimensionName}>{row.dimensionShort}</span>
                  </TableCell>
                  <TableCell>
                    <CorrelationCell
                      value={row.rotation}
                      dimensionCode={row.dimension}
                      indicator="rotation"
                      isNegativeGood
                    />
                  </TableCell>
                  <TableCell>
                    <CorrelationCell
                      value={row.absenteeism}
                      dimensionCode={row.dimension}
                      indicator="absenteeism"
                      isNegativeGood
                    />
                  </TableCell>
                  <TableCell>
                    <CorrelationCell
                      value={row.productivity}
                      dimensionCode={row.dimension}
                      indicator="productivity"
                    />
                  </TableCell>
                  <TableCell>
                    <CorrelationCell
                      value={row.nps}
                      dimensionCode={row.dimension}
                      indicator="nps"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span>Correlación positiva (a mayor clima, mayor indicador)</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span>Correlación negativa (a mayor clima, menor indicador)</span>
            </div>
          </div>
        </div>
        </>
        )}
      </CardContent>
    </Card>
  );
}

// Summary card for key business correlations
interface BusinessCorrelationsSummaryProps {
  rotationImpact: { dimension: string; name: string; correlation: number };
  productivityImpact: { dimension: string; name: string; correlation: number };
  npsImpact: { dimension: string; name: string; correlation: number };
}

export function BusinessCorrelationsSummary({
  rotationImpact,
  productivityImpact,
  npsImpact,
}: BusinessCorrelationsSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Mayor impacto en Rotación</p>
              <p className="text-lg font-bold text-red-600">{rotationImpact.name}</p>
              <p className="text-xs text-muted-foreground">
                r = {rotationImpact.correlation.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Mayor impacto en Productividad</p>
              <p className="text-lg font-bold text-green-600">{productivityImpact.name}</p>
              <p className="text-xs text-muted-foreground">
                r = {productivityImpact.correlation.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Mayor impacto en NPS</p>
              <p className="text-lg font-bold text-blue-600">{npsImpact.name}</p>
              <p className="text-xs text-muted-foreground">
                r = {npsImpact.correlation.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
