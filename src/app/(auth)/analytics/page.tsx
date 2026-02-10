"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DASHBOARD_CONFIG } from "@/lib/constants";

// Hooks
import {
  useUnifiedAnalysis,
  useKeywordAnalysis,
  useEngagementTrend,
  useDimensionTrends,
  useGroupedBarData,
  useYearComparison,
} from "@/hooks/use-unified-analysis";

// Chart components
import {
  EngagementTrendChart,
  DimensionTrendChart,
  TopBottomTrendChart,
} from "@/components/charts/historical-trend-chart";
import {
  YearComparisonBarChart,
  YearChangeChart,
  HorizontalYearComparison,
} from "@/components/charts/year-comparison-chart";
import {
  KeywordCloud,
  KeywordList,
  BigramList,
  SentimentCard,
  OpenQuestionSummary,
} from "@/components/charts/keyword-analysis";

// Question labels for display
const QUESTION_LABELS = {
  future_suggestions: "Sugerencias para el Futuro",
  ia_processes: "IA en Procesos de Trabajo",
  ia_training: "Capacitación en IA",
  change_synthesis: "Proceso de Cambio",
};

export default function AnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(DASHBOARD_CONFIG.defaultYear);
  const [activeTab, setActiveTab] = useState("trends");

  // Data hooks
  const { data: analysisData, isLoading: analysisLoading } = useUnifiedAnalysis();
  const { data: keywordData, isLoading: keywordsLoading } = useKeywordAnalysis(selectedYear);
  const { data: engagementTrend, isLoading: trendLoading } = useEngagementTrend();
  const { data: dimensionTrends, dimensions, isLoading: dimTrendLoading } = useDimensionTrends();
  const { data: groupedBarData, isLoading: barLoading } = useGroupedBarData();
  const { data: yearComparisonData, isLoading: compLoading } = useYearComparison();

  const isLoading = analysisLoading || trendLoading || dimTrendLoading || barLoading;

  // Available years for keyword analysis
  const availableYears = analysisData?.years_analyzed || [2023, 2024, 2025, 2026];

  return (
    <>
      <Header
        title="Análisis Avanzado"
        description="Tendencias históricas y análisis de texto"
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        showFilters={false}
      />

      <main className="flex-1 p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="comparison">Comparación</TabsTrigger>
            <TabsTrigger value="keywords">Texto Abierto</TabsTrigger>
          </TabsList>

          {/* Tab 1: Historical Trends */}
          <TabsContent value="trends" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="grid gap-6">
                <Skeleton className="h-[350px]" />
                <Skeleton className="h-[400px]" />
              </div>
            ) : (
              <>
                {/* Global Engagement Evolution */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">
                    Evolución del Engagement Global
                  </h2>
                  {engagementTrend && engagementTrend.length > 0 && (
                    <EngagementTrendChart data={engagementTrend} />
                  )}
                </section>

                {/* Top/Bottom Dimensions */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">
                    Dimensiones: Mejores vs Peores
                  </h2>
                  {dimensionTrends && dimensionTrends.length > 0 && (
                    <TopBottomTrendChart data={dimensionTrends} dimensions={dimensions} />
                  )}
                </section>

                {/* Multi-line dimension trends */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">
                    Evolución de Todas las Dimensiones
                  </h2>
                  {dimensionTrends && dimensionTrends.length > 0 && (
                    <DimensionTrendChart
                      data={dimensionTrends}
                      dimensions={dimensions}
                      selectedDimensions={[
                        "orgullo_institucional",
                        "liderazgo_efectivo",
                        "innovacion_cambio",
                        "compensacion",
                        "confianza_institucional",
                      ]}
                      title="5 Dimensiones Clave - Evolución Histórica"
                    />
                  )}
                </section>
              </>
            )}
          </TabsContent>

          {/* Tab 2: Year Comparison */}
          <TabsContent value="comparison" className="space-y-6 mt-6">
            {barLoading || compLoading ? (
              <div className="grid gap-6">
                <Skeleton className="h-[500px]" />
                <Skeleton className="h-[500px]" />
              </div>
            ) : (
              <>
                {/* Year over Year Change */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">
                    Cambio 2025 → 2026
                  </h2>
                  {yearComparisonData && yearComparisonData.length > 0 && (
                    <YearChangeChart
                      data={yearComparisonData}
                      fromYear={2025}
                      toYear={2026}
                    />
                  )}
                </section>

                {/* Grouped Bar Comparison */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">
                    Comparación Multi-Año
                  </h2>
                  {groupedBarData && groupedBarData.length > 0 && (
                    <YearComparisonBarChart
                      data={groupedBarData}
                      selectedYears={["2024", "2025", "2026"]}
                      sortBy="latest"
                    />
                  )}
                </section>

                {/* Historical comparison from 2023 */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">
                    Cambio Total (2023 → 2026)
                  </h2>
                  {yearComparisonData && yearComparisonData.length > 0 && (
                    <YearChangeChart
                      data={yearComparisonData}
                      fromYear={2023}
                      toYear={2026}
                      title="Evolución Completa 3 Años"
                    />
                  )}
                </section>
              </>
            )}
          </TabsContent>

          {/* Tab 3: Open Text / Keywords */}
          <TabsContent value="keywords" className="space-y-6 mt-6">
            {/* Year Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Año:</span>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {keywordData && (
                <Badge variant="outline">
                  {Object.keys(keywordData).length} preguntas analizadas
                </Badge>
              )}
            </div>

            {keywordsLoading ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-[300px]" />
                <Skeleton className="h-[300px]" />
                <Skeleton className="h-[300px]" />
                <Skeleton className="h-[300px]" />
              </div>
            ) : keywordData ? (
              <>
                {/* Question summaries */}
                {Object.entries(keywordData).map(([key, data]) => {
                  if (!data) return null;

                  const questionKey = key as keyof typeof QUESTION_LABELS;
                  const title = QUESTION_LABELS[questionKey] || key;

                  return (
                    <section key={key} className="space-y-4">
                      <h2 className="text-lg font-semibold border-b pb-2">
                        {title}
                      </h2>

                      <div className="grid gap-4 lg:grid-cols-2">
                        {/* Keyword Cloud */}
                        <KeywordCloud
                          keywords={data.keywords}
                          title={`Palabras Clave - ${title}`}
                        />

                        {/* Sentiment */}
                        <SentimentCard
                          sentiment={data.sentiment}
                          title={`Sentimiento - ${title}`}
                        />
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        {/* Top Keywords List */}
                        <KeywordList
                          keywords={data.keywords}
                          title="Top 10 Palabras"
                        />

                        {/* Bigrams */}
                        <BigramList
                          bigrams={data.bigrams}
                          title="Frases Comunes"
                        />
                      </div>
                    </section>
                  );
                })}

                {/* No data message */}
                {Object.keys(keywordData).length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No hay datos de preguntas abiertas para el año {selectedYear}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No se encontraron datos de análisis de texto
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
