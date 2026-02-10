"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel,
  className,
}: KPICardProps) {
  // Determinar icono y color de tendencia
  const TrendIcon =
    trend === undefined
      ? null
      : trend > 0
        ? TrendingUp
        : trend < 0
          ? TrendingDown
          : Minus;

  const trendColor =
    trend === undefined
      ? ""
      : trend > 0
        ? "text-green-600"
        : trend < 0
          ? "text-red-600"
          : "text-muted-foreground";

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>

        {(description || trend !== undefined) && (
          <div className="flex items-center gap-1 mt-1">
            {TrendIcon && (
              <TrendIcon className={cn("h-3 w-3", trendColor)} />
            )}
            {trend !== undefined && (
              <span className={cn("text-xs font-medium", trendColor)}>
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            )}
            {(trendLabel || description) && (
              <span className="text-xs text-muted-foreground">
                {trendLabel || description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
