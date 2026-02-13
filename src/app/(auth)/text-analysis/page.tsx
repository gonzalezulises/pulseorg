"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Cloud,
  PieChart,
  Layers,
  Filter,
  X,
} from "lucide-react";

// Hooks
import {
  useTextAnalysisData,
  useWordCloudData,
  useSentimentAnalysis,
  useThemes,
  useTextAnalysisFilters,
  useFilteredComments,
} from "@/hooks/use-text-analysis";

// Components
import { WordCloud } from "@/components/charts/word-cloud";
import {
  SentimentDonut,
  SentimentTrendChart,
  CommentList,
} from "@/components/charts/sentiment-analysis";
import { RecurringThemes, ThemesSummary } from "@/components/charts/recurring-themes";

// Options
import { DIMENSION_LABELS_V2 } from "@/types/clima-v2";
import { useDepartmentOptions } from "@/hooks/use-segmentation";
import { SENTIMENT_LABELS, type SentimentType } from "@/types/text-analysis";

export default function TextAnalysisPage() {
  const [activeTab, setActiveTab] = useState("wordcloud");

  // Filters
  const { filters, updateFilter, resetFilters, activeFilterCount } =
    useTextAnalysisFilters();

  // Data hooks
  const { data: analysisData, isLoading } = useTextAnalysisData();
  const wordCloudData = useWordCloudData(filters);
  const { data: sentimentData, comments } = useSentimentAnalysis(filters);
  const { data: themes } = useThemes(filters);
  const { data: filteredComments } = useFilteredComments(filters);
  const departmentOptions = useDepartmentOptions();

  // Dimension options from the 17-dimension model
  const dimensionOptions = Object.entries(DIMENSION_LABELS_V2).map(
    ([code, label]) => ({
      value: code,
      label: label,
    })
  );

  return (
    <>
      <Header
        title="Análisis de Texto"
        description="Análisis de comentarios abiertos de la encuesta de clima"
        showYearSelector={false}
        showFilters={false}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* KPI Summary */}
        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {isLoading ? "-" : analysisData?.total_comments || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Comentarios Analizados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <PieChart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {isLoading
                      ? "-"
                      : `${(
                          ((analysisData?.sentiment_summary?.positive || 0) /
                            (analysisData?.total_comments || 1)) *
                          100
                        ).toFixed(0)}%`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sentimiento Positivo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Cloud className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {isLoading
                      ? "-"
                      : analysisData?.word_frequencies?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Palabras Clave
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Layers className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {isLoading ? "-" : analysisData?.themes?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Temas Identificados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpiar ({activeFilterCount})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Dimension filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Indicador
                </label>
                <Select
                  value={filters.dimension || "all"}
                  onValueChange={(v) =>
                    updateFilter("dimension", v === "all" ? null : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los indicadores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los indicadores</SelectItem>
                    {dimensionOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Departamento
                </label>
                <Select
                  value={filters.department || "all"}
                  onValueChange={(v) =>
                    updateFilter("department", v === "all" ? null : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los departamentos" />
                  </SelectTrigger>
                  <SelectContent>
                    {(departmentOptions || []).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sentiment filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Sentimiento
                </label>
                <Select
                  value={filters.sentiment || "all"}
                  onValueChange={(v) =>
                    updateFilter(
                      "sentiment",
                      v === "all" ? null : (v as SentimentType)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los sentimientos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los sentimientos</SelectItem>
                    <SelectItem value="positive">Positivo</SelectItem>
                    <SelectItem value="neutral">Neutro</SelectItem>
                    <SelectItem value="negative">Negativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters display */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Mostrando {(filteredComments || []).length} de{" "}
                  {analysisData?.total_comments || 0} comentarios
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="wordcloud" className="gap-1">
              <Cloud className="h-4 w-4" />
              <span className="hidden sm:inline">Nube de Palabras</span>
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="gap-1">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Sentimiento</span>
            </TabsTrigger>
            <TabsTrigger value="themes" className="gap-1">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Temas</span>
            </TabsTrigger>
          </TabsList>

          {/* Word Cloud Tab */}
          <TabsContent value="wordcloud" className="space-y-6 mt-6">
            {isLoading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <>
                <WordCloud
                  data={wordCloudData}
                  title="Nube de Palabras"
                  description="Haz clic en una palabra para ver los comentarios relacionados"
                />

                <CommentList
                  comments={(filteredComments || []).slice(0, 20)}
                  title="Comentarios Recientes"
                  maxHeight="350px"
                />
              </>
            )}
          </TabsContent>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-[350px]" />
                <Skeleton className="h-[350px]" />
              </div>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  <SentimentDonut data={sentimentData?.summary ?? { positive: 0, neutral: 0, negative: 0, total: 0 }} />
                  <SentimentTrendChart data={sentimentData?.trend ?? []} />
                </div>

                <CommentList
                  comments={filteredComments}
                  title="Todos los Comentarios"
                  maxHeight="500px"
                />
              </>
            )}
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="grid gap-6">
                <Skeleton className="h-[120px]" />
                <Skeleton className="h-[400px]" />
              </div>
            ) : (
              <>
                <ThemesSummary themes={themes || []} />
                <RecurringThemes data={themes || []} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
