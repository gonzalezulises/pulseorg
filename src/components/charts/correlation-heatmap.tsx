"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Dimension } from "@/types/correlations";
import {
  getCorrelationColor,
  getCorrelationTextColor,
  getCorrelationLabel,
  getCorrelationDirection,
} from "@/types/correlations";
import { Grid3X3 } from "lucide-react";

interface CorrelationHeatmapProps {
  matrix: number[][];
  dimensions: Dimension[];
  onCellClick?: (dim1Index: number, dim2Index: number) => void;
  title?: string;
}

export function CorrelationHeatmap({
  matrix,
  dimensions,
  onCellClick,
  title = "Matriz de Correlación entre Indicadores",
}: CorrelationHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  if (matrix.length === 0 || dimensions.length === 0) {
    return (
      <Card>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          No hay datos de correlación disponibles
        </CardContent>
      </Card>
    );
  }

  const cellSize = 42;
  const labelWidth = 120;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          Haz clic en una celda para ver el scatter plot de esos indicadores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-fit">
            {/* Header row with dimension labels */}
            <div className="flex">
              <div style={{ width: labelWidth }} className="flex-shrink-0" />
              {dimensions.map((dim, i) => (
                <div
                  key={dim.code}
                  style={{ width: cellSize, height: labelWidth }}
                  className="flex items-end justify-center pb-2"
                >
                  <span
                    className="text-xs font-medium text-muted-foreground transform -rotate-45 origin-center whitespace-nowrap"
                    title={dim.name}
                  >
                    {dim.short}
                  </span>
                </div>
              ))}
            </div>

            {/* Matrix rows */}
            <TooltipProvider delayDuration={100}>
              {matrix.map((row, rowIndex) => (
                <div key={dimensions[rowIndex].code} className="flex">
                  {/* Row label */}
                  <div
                    style={{ width: labelWidth }}
                    className="flex-shrink-0 flex items-center justify-end pr-2"
                  >
                    <span
                      className="text-xs font-medium text-muted-foreground truncate"
                      title={dimensions[rowIndex].name}
                    >
                      {dimensions[rowIndex].short}
                    </span>
                  </div>

                  {/* Cells */}
                  {row.map((value, colIndex) => {
                    const isHovered =
                      hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;
                    const isDiagonal = rowIndex === colIndex;

                    return (
                      <Tooltip key={colIndex}>
                        <TooltipTrigger asChild>
                          <button
                            style={{
                              width: cellSize,
                              height: cellSize,
                              backgroundColor: getCorrelationColor(value),
                              color: getCorrelationTextColor(value),
                            }}
                            className={`
                              flex items-center justify-center text-xs font-medium
                              border border-white/20 transition-all
                              ${isDiagonal ? "cursor-default" : "cursor-pointer hover:scale-110 hover:z-10"}
                              ${isHovered ? "ring-2 ring-primary ring-offset-1" : ""}
                            `}
                            onClick={() => {
                              if (!isDiagonal && onCellClick) {
                                onCellClick(rowIndex, colIndex);
                              }
                            }}
                            onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                            onMouseLeave={() => setHoveredCell(null)}
                            disabled={isDiagonal}
                          >
                            {value.toFixed(2)}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {dimensions[rowIndex].name} vs {dimensions[colIndex].name}
                            </p>
                            <p className="text-sm">
                              Correlación: <strong>{value.toFixed(3)}</strong>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getCorrelationLabel(value)} {getCorrelationDirection(value)}
                            </p>
                            {!isDiagonal && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Clic para ver scatter plot
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </TooltipProvider>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
          <span className="text-xs text-muted-foreground">Correlación:</span>
          <div className="flex items-center gap-1">
            <div
              className="w-6 h-4 rounded"
              style={{ backgroundColor: getCorrelationColor(-0.8) }}
            />
            <span className="text-xs">-1</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-6 h-4 rounded"
              style={{ backgroundColor: getCorrelationColor(-0.4) }}
            />
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-6 h-4 rounded"
              style={{ backgroundColor: getCorrelationColor(0) }}
            />
            <span className="text-xs">0</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-6 h-4 rounded"
              style={{ backgroundColor: getCorrelationColor(0.4) }}
            />
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-6 h-4 rounded"
              style={{ backgroundColor: getCorrelationColor(0.8) }}
            />
            <span className="text-xs">+1</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for smaller displays
interface CorrelationHeatmapCompactProps {
  matrix: number[][];
  dimensions: Dimension[];
  selectedDimensions?: string[];
  onCellClick?: (dim1Index: number, dim2Index: number) => void;
}

export function CorrelationHeatmapCompact({
  matrix,
  dimensions,
  selectedDimensions,
  onCellClick,
}: CorrelationHeatmapCompactProps) {
  const filteredIndices = selectedDimensions
    ? dimensions
        .map((d, i) => (selectedDimensions.includes(d.code) ? i : -1))
        .filter((i) => i !== -1)
    : dimensions.map((_, i) => i);

  const cellSize = 36;

  return (
    <div className="overflow-auto">
      <div className="inline-block">
        <TooltipProvider delayDuration={100}>
          {filteredIndices.map((rowIndex) => (
            <div key={dimensions[rowIndex].code} className="flex">
              {filteredIndices.map((colIndex) => {
                const value = matrix[rowIndex][colIndex];
                const isDiagonal = rowIndex === colIndex;

                return (
                  <Tooltip key={colIndex}>
                    <TooltipTrigger asChild>
                      <button
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: getCorrelationColor(value),
                          color: getCorrelationTextColor(value),
                        }}
                        className={`
                          flex items-center justify-center text-[10px] font-medium
                          border border-white/20
                          ${isDiagonal ? "cursor-default" : "cursor-pointer hover:opacity-80"}
                        `}
                        onClick={() => {
                          if (!isDiagonal && onCellClick) {
                            onCellClick(rowIndex, colIndex);
                          }
                        }}
                        disabled={isDiagonal}
                      >
                        {value.toFixed(1)}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">
                        {dimensions[rowIndex].short} vs {dimensions[colIndex].short}
                      </p>
                      <p>r = {value.toFixed(3)}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
