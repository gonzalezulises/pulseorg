"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Theme, Comment } from "@/types/text-analysis";
import { SENTIMENT_COLORS, SENTIMENT_LABELS } from "@/types/text-analysis";
import { useTextAnalysisData } from "@/hooks/use-text-analysis";
import {
  ChevronDown,
  Hash,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  MessageSquareText,
} from "lucide-react";

interface RecurringThemesProps {
  data: Theme[];
  title?: string;
  description?: string;
}

export function RecurringThemes({
  data,
  title = "Temas Recurrentes",
  description = "Top 10 temas identificados en los comentarios",
}: RecurringThemesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No hay temas para mostrar
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.slice(0, 10).map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ThemeCard({ theme }: { theme: Theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: analysisData } = useTextAnalysisData();

  const exampleComments =
    analysisData?.comments?.filter((c) =>
      theme.example_comments.includes(c.id)
    ) || [];

  const getSentimentIcon = () => {
    if (theme.sentiment === "positive" || theme.sentiment_score > 0.3) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    if (theme.sentiment === "negative" || theme.sentiment_score < -0.3) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-slate-500" />;
  };

  const getSentimentColor = () => {
    if (theme.sentiment === "mixed") return SENTIMENT_COLORS.mixed;
    return SENTIMENT_COLORS[theme.sentiment as keyof typeof SENTIMENT_COLORS];
  };

  const getSentimentLabel = () => {
    if (theme.sentiment === "mixed") return "Mixto";
    return SENTIMENT_LABELS[theme.sentiment as keyof typeof SENTIMENT_LABELS];
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-card hover:bg-muted/30 transition-colors">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 text-left">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getSentimentIcon()}
                  <h4 className="font-medium text-sm truncate">{theme.name}</h4>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    <Hash className="h-3 w-3 mr-1" />
                    {theme.frequency} menciones
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: getSentimentColor(),
                      color: getSentimentColor(),
                    }}
                  >
                    {getSentimentLabel()}
                  </Badge>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-1 mt-3">
              {theme.keywords.slice(0, 5).map((keyword) => (
                <span
                  key={keyword}
                  className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  {keyword}
                </span>
              ))}
            </div>

            {/* Dimensions */}
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <span>Indicadores:</span>
              {theme.dimensions.slice(0, 2).map((dim) => (
                <span key={dim} className="capitalize">
                  {dim.replace(/_/g, " ")}
                  {theme.dimensions.indexOf(dim) < Math.min(theme.dimensions.length, 2) - 1 && ","}
                </span>
              ))}
              {theme.dimensions.length > 2 && (
                <span>+{theme.dimensions.length - 2}</span>
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2 mt-3">
              <MessageSquareText className="h-3 w-3 inline mr-1" />
              Comentarios de ejemplo
            </p>
            <div className="space-y-2">
              {exampleComments.slice(0, 3).map((comment) => (
                <div
                  key={comment.id}
                  className="text-xs p-2 rounded bg-muted/50 border-l-2"
                  style={{ borderLeftColor: SENTIMENT_COLORS[comment.sentiment] }}
                >
                  <p className="line-clamp-2">{comment.text}</p>
                </div>
              ))}
              {exampleComments.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No hay comentarios de ejemplo
                </p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface ThemesSummaryProps {
  themes: Theme[];
}

export function ThemesSummary({ themes }: ThemesSummaryProps) {
  const positiveThemes = themes.filter(
    (t) => t.sentiment === "positive" || t.sentiment_score > 0.3
  ).length;
  const negativeThemes = themes.filter(
    (t) => t.sentiment === "negative" || t.sentiment_score < -0.3
  ).length;
  const mixedThemes = themes.length - positiveThemes - negativeThemes;

  const totalMentions = themes.reduce((sum, t) => sum + t.frequency, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Resumen de Temas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">{themes.length}</p>
            <p className="text-xs text-muted-foreground">Temas Identificados</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
            <p className="text-2xl font-bold text-green-600">{positiveThemes}</p>
            <p className="text-xs text-muted-foreground">Temas Positivos</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
            <p className="text-2xl font-bold text-red-600">{negativeThemes}</p>
            <p className="text-xs text-muted-foreground">Temas Negativos</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{totalMentions}</p>
            <p className="text-xs text-muted-foreground">Total Menciones</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
