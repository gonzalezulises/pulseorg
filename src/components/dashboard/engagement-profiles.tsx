"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EngagementData, EngagementProfile } from "@/types/clima-v2";
import { PROFILE_COLORS } from "@/types/clima-v2";

interface EngagementProfilesProps {
  data: EngagementData;
  title?: string;
}

interface ProfileDataPoint {
  name: EngagementProfile;
  value: number;
  pct: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

export function EngagementProfiles({
  data,
  title = "Perfiles de Compromiso",
}: EngagementProfilesProps) {
  // Preparar datos para el pie chart
  const chartData: ProfileDataPoint[] = (
    Object.entries(data.profiles) as [EngagementProfile, { n: number; pct: number }][]
  )
    .filter(([_, profile]) => profile.n > 0)
    .map(([name, profile]) => ({
      name,
      value: profile.n,
      pct: profile.pct,
      color: PROFILE_COLORS[name],
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">
            {data.engagement_pct.toFixed(0)}%
          </span>
          <span className="text-sm text-muted-foreground">
            ({data.engagement_score.toFixed(2)}/5.00)
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {data.respondent_count} colaboradores encuestados
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pie Chart */}
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ProfileDataPoint;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <p className="font-medium" style={{ color: data.color }}>
                            {data.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {data.value} personas ({data.pct.toFixed(1)}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend / Stats */}
          <div className="space-y-3">
            {chartData.map((profile) => (
              <div
                key={profile.name}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: profile.color }}
                  />
                  <span className="text-sm font-medium">{profile.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">{profile.pct.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({profile.value})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interpretation */}
        <div className="mt-4 p-3 rounded-lg bg-muted/30 text-sm">
          <p className="font-medium mb-1">Interpretación:</p>
          <ul className="text-muted-foreground space-y-1">
            <li>
              <span className="font-medium text-green-600">Embajadores:</span>{" "}
              Máximo compromiso, embajadores naturales
            </li>
            <li>
              <span className="font-medium text-blue-600">Comprometidos Pragmáticos:</span>{" "}
              Comprometidos con enfoque práctico
            </li>
            <li>
              <span className="font-medium text-yellow-600">Neutrales:</span>{" "}
              Riesgo de desenganche, requieren atención
            </li>
            <li>
              <span className="font-medium text-red-600">Desvinculados:</span>{" "}
              Críticos, prioridad de intervención
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
