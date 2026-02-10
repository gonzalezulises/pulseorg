"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DimensionStatistics, Classification } from "@/types/api";
import { DIMENSION_LABELS, DIMENSION_COLORS } from "@/types/api";

interface DimensionGridProps {
  dimensions: DimensionStatistics[];
  onDimensionClick?: (dimension: string) => void;
}

const classificationConfig: Record<
  Classification,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  fortaleza: { label: "Fortaleza", variant: "default" },
  oportunidad: { label: "Oportunidad", variant: "secondary" },
  debilidad: { label: "Debilidad", variant: "outline" },
  critico: { label: "Crítico", variant: "destructive" },
};

export function DimensionGrid({
  dimensions,
  onDimensionClick,
}: DimensionGridProps) {
  // Ordenar por favorabilidad descendente
  const sortedDimensions = [...dimensions].sort(
    (a, b) => b.favorability_pct - a.favorability_pct
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {sortedDimensions.map((dim) => {
        const config = classificationConfig[dim.classification];
        const color =
          DIMENSION_COLORS[dim.dimension as keyof typeof DIMENSION_COLORS] ||
          "#6b7280";

        return (
          <Card
            key={dim.dimension}
            className={cn(
              "transition-all",
              onDimensionClick && "cursor-pointer hover:shadow-md"
            )}
            onClick={() => onDimensionClick?.(dim.dimension)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {DIMENSION_LABELS[dim.dimension] || dim.dimension}
                </CardTitle>
                <Badge variant={config.variant} className="text-xs">
                  {config.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span
                    className="text-2xl font-bold"
                    style={{ color }}
                  >
                    {Math.round(dim.favorability_pct)}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    x̄ {dim.score_mean.toFixed(2)}
                  </span>
                </div>

                <Progress
                  value={dim.favorability_pct}
                  className="h-2"
                  style={
                    {
                      "--progress-foreground": color,
                    } as React.CSSProperties
                  }
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{dim.items_count} items</span>
                  <span>{dim.total_responses.toLocaleString()} respuestas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
