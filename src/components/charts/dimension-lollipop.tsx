"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DimensionStatV2 } from "@/types/clima-v2";

interface DimensionLollipopProps {
  data: DimensionStatV2[];
  title?: string;
  maxItems?: number;
}

export function DimensionLollipop({
  data,
  title = "Puntuación por Indicador",
  maxItems = 10,
}: DimensionLollipopProps) {
  // Ordenar por score descendente y limitar
  const sortedData = [...data]
    .sort((a, b) => b.avg_score - a.avg_score)
    .slice(0, maxItems);

  // Calcular el ancho máximo basado en el score máximo (5)
  const maxScore = 5;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Top {maxItems} indicadores ordenados por puntuación
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedData.map((dimension) => {
            const widthPercent = (dimension.avg_score / maxScore) * 100;

            return (
              <div key={dimension.dimension_code} className="flex items-center gap-4">
                {/* Label */}
                <div className="w-44 text-right text-sm text-muted-foreground shrink-0">
                  {dimension.dimension_name}
                </div>

                {/* Lollipop line and circle */}
                <div className="flex-1 flex items-center">
                  <div className="relative w-full h-6 flex items-center">
                    {/* Line */}
                    <div
                      className="h-[3px] bg-[#3366FF] rounded-full"
                      style={{ width: `${widthPercent}%` }}
                    />
                    {/* Circle */}
                    <div
                      className="absolute w-4 h-4 bg-[#3366FF] rounded-full border-2 border-white shadow-sm"
                      style={{ left: `calc(${widthPercent}% - 8px)` }}
                    />
                  </div>
                </div>

                {/* Score value */}
                <div className="w-10 text-right font-semibold text-[#3366FF]">
                  {dimension.avg_score.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
