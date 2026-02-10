"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  useYearDemographics,
  useFichaTecnicaComparison,
  useTopBottomItems,
} from "@/hooks/use-demographics";
import {
  GENDER_COLORS,
  TENURE_COLORS,
  TENURE_ORDER,
  TENURE_LABELS,
  GENDER_LABELS,
  getDepartmentColor,
} from "@/types/demographics";
import { DASHBOARD_CONFIG, AVAILABLE_YEARS } from "@/lib/constants";
import {
  Users,
  UserCheck,
  Percent,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function FichaTecnicaPage() {
  const [selectedYear, setSelectedYear] = useState<number>(DASHBOARD_CONFIG.defaultYear);

  const { data: yearData, isLoading } = useYearDemographics(selectedYear);
  const { data: comparisonData } = useFichaTecnicaComparison();
  const { topItems, bottomItems } = useTopBottomItems(selectedYear);

  const ficha = yearData?.ficha_tecnica;
  const demographics = yearData?.demographics;

  // Preparar datos para gráficos
  const genderData = demographics
    ? Object.entries(demographics.genders)
        .filter(([key]) => key !== "Sin especificar")
        .map(([name, value]) => {
          const total = Object.values(demographics.genders).reduce((a, b) => a + b, 0);
          return {
            name: GENDER_LABELS[name] || name,
            value,
            pct: Math.round((value / total) * 100),
            color: GENDER_COLORS[name] || "#94A3B8",
          };
        })
    : [];

  const tenureData = demographics
    ? TENURE_ORDER.filter((key) => demographics.tenures[key] && demographics.tenures[key] > 0)
        .map((name) => {
          const value = demographics.tenures[name] || 0;
          const total = Object.values(demographics.tenures).reduce((a, b) => a + b, 0);
          return {
            name: TENURE_LABELS[name] || name,
            value,
            pct: Math.round((value / total) * 100),
            color: TENURE_COLORS[name] || "#94A3B8",
          };
        })
    : [];

  const departmentData = demographics
    ? Object.entries(demographics.departments)
        .filter(([key]) => key !== "Sin especificar")
        .map(([name, value], index) => ({
          name: name.length > 20 ? name.substring(0, 20) + "..." : name,
          fullName: name,
          value,
          color: getDepartmentColor(index),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12)
    : [];

  return (
    <>
      <Header
        title="Ficha Técnica"
        description="Validez estadística y demografía de la encuesta"
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        showFilters={false}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* KPIs de Ficha Técnica */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Población (N)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-primary">
                  {ficha?.population_n || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Empleados totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Muestra (n)</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-[#00B4D8]">
                  {ficha?.sample_n || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Respuestas recibidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-[#1dc47c]">
                    {ficha?.response_rate || 0}%
                  </div>
                  <Progress
                    value={ficha?.response_rate || 0}
                    className="mt-2 h-2"
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margen de Error</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    ±{ficha?.margin_of_error || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nivel de confianza: {ficha?.confidence_level || 95}%
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fórmula y explicación */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metodología Estadística</CardTitle>
            <CardDescription>
              Cálculo del margen de error para poblaciones finitas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
              <p className="mb-2">
                <strong>Fórmula:</strong> e = z × √[(p × (1-p) / n) × ((N-n) / (N-1))]
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
                <div>
                  <span className="text-muted-foreground">z (95%):</span>{" "}
                  <strong>1.96</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">p (variabilidad):</span>{" "}
                  <strong>0.5</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">N (población):</span>{" "}
                  <strong>{ficha?.population_n}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">n (muestra):</span>{" "}
                  <strong>{ficha?.sample_n}</strong>
                </div>
              </div>
            </div>
            {(ficha?.response_rate || 0) >= 80 && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  La tasa de respuesta del {ficha?.response_rate}% garantiza representatividad estadística
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección de Demografía */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Distribución por Género */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribución por Género</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px]" />
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={(props: any) => `${props.name}: ${props.pct}%`}
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {data.value} personas ({data.pct}%)
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
              )}
            </CardContent>
          </Card>

          {/* Distribución por Antigüedad */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribución por Antigüedad</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px]" />
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tenureData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {data.value} personas ({data.pct}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {tenureData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Distribución por Departamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución por Departamento</CardTitle>
            <CardDescription>Top 12 departamentos con mayor participación</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px]" />
            ) : (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={150}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm max-w-xs">
                              <p className="font-medium text-sm">{data.fullName}</p>
                              <p className="text-sm text-muted-foreground">
                                {data.value} personas
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 y Bottom 5 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top 5 */}
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top 5 - Mejor Evaluados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm flex-1">{item.question}</p>
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          {item.avg_score.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Favorabilidad: {item.favorability}%</span>
                        <span>n={item.n}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom 5 */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Bottom 5 - Requieren Atención
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {bottomItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm flex-1">{item.question}</p>
                        <Badge variant="outline" className="text-red-600 border-red-300">
                          {item.avg_score.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Favorabilidad: {item.favorability}%</span>
                        <span>n={item.n}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Evolución histórica */}
        {comparisonData && comparisonData.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolución de la Participación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-sm">
                              <p className="font-medium mb-2">{label}</p>
                              {payload.map((p, i) => (
                                <p key={i} className="text-sm" style={{ color: p.color }}>
                                  {p.name}: {p.value}
                                  {p.name === "Tasa (%)" ? "%" : ""}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sample_n" name="Muestra (n)" fill="#0052CC" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="response_rate" name="Tasa (%)" fill="#00B4D8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
