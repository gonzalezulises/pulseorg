"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DimensionStatV2, SegmentType } from "@/types/clima-v2";
import { getSegmentColor, getSegmentLabel, getSegmentIcon } from "@/types/clima-v2";

interface DimensionGridV2Props {
  dimensions: DimensionStatV2[];
  onDimensionClick?: (dimension: DimensionStatV2) => void;
}

const segmentVariant: Record<
  SegmentType,
  "default" | "secondary" | "destructive" | "outline"
> = {
  fortaleza_excepcional: "default",
  fortaleza_solida: "default",
  aceptable: "secondary",
  atencion: "outline",
  crisis: "destructive",
};

export function DimensionGridV2({
  dimensions,
  onDimensionClick,
}: DimensionGridV2Props) {
  // Ya vienen ordenadas por rank del JSON
  const sortedDimensions = [...dimensions].sort((a, b) => a.rank - b.rank);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {sortedDimensions.map((dim) => {
        const color = getSegmentColor(dim.segment);
        const variant = segmentVariant[dim.segment] || "outline";

        return (
          <Card
            key={dim.dimension_code}
            className={cn(
              "transition-all",
              onDimensionClick && "cursor-pointer hover:shadow-md"
            )}
            onClick={() => onDimensionClick?.(dim)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{getSegmentIcon(dim.segment)}</span>
                  <CardTitle className="text-sm font-medium leading-tight">
                    {dim.dimension_name}
                  </CardTitle>
                </div>
                <Badge
                  variant={variant}
                  className="text-[10px] shrink-0"
                >
                  #{dim.rank}
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
                    {dim.avg_score.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {dim.favorability_pct.toFixed(0)}%
                  </span>
                </div>

                <Progress
                  value={(dim.avg_score / 5) * 100}
                  className="h-2"
                  style={
                    {
                      "--progress-foreground": color,
                    } as React.CSSProperties
                  }
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{dim.item_count} items</span>
                  <span
                    className={cn(
                      dim.gap_vs_benchmark >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {dim.gap_vs_benchmark >= 0 ? "+" : ""}
                    {dim.gap_vs_benchmark.toFixed(1)}pp vs bench
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
