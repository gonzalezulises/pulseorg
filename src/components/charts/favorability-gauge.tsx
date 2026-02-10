"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FavorabilityGaugeProps {
  value: number;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

function getColorClass(value: number): string {
  if (value >= 80) return "text-green-600";
  if (value >= 60) return "text-blue-600";
  if (value >= 40) return "text-yellow-600";
  return "text-red-600";
}

function getProgressColor(value: number): string {
  if (value >= 80) return "bg-green-600";
  if (value >= 60) return "bg-blue-600";
  if (value >= 40) return "bg-yellow-600";
  return "bg-red-600";
}

function getLabel(value: number): string {
  if (value >= 80) return "Excelente";
  if (value >= 60) return "Bueno";
  if (value >= 40) return "Mejorable";
  return "Crítico";
}

export function FavorabilityGauge({
  value,
  title = "Favorabilidad Global",
  description,
  size = "md",
}: FavorabilityGaugeProps) {
  const roundedValue = Math.round(value);
  const colorClass = getColorClass(roundedValue);
  const progressColor = getProgressColor(roundedValue);
  const label = getLabel(roundedValue);

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <span className={cn(sizeClasses[size], "font-bold", colorClass)}>
              {roundedValue}%
            </span>
            <p className={cn("text-sm font-medium", colorClass)}>{label}</p>
          </div>

          <div className="w-full">
            <Progress
              value={roundedValue}
              className="h-3"
              // Aplicar color personalizado al indicador
              style={
                {
                  "--progress-foreground": progressColor,
                } as React.CSSProperties
              }
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
