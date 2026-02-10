"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Comment, SentimentSummary, SentimentTrend } from "@/types/text-analysis";
import { SENTIMENT_COLORS, SENTIMENT_LABELS } from "@/types/text-analysis";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";

interface SentimentDonutProps {
  data: SentimentSummary;
  title?: string;
}

export function SentimentDonut({ data, title = "Distribución de Sentimiento" }: SentimentDonutProps) {
  const chartData = [
    { name: "Positivo", value: data.positive, color: SENTIMENT_COLORS.positive },
    { name: "Neutro", value: data.neutral, color: SENTIMENT_COLORS.neutral },
    { name: "Negativo", value: data.negative, color: SENTIMENT_COLORS.negative },
  ].filter((item) => item.value > 0);

  const total = data.total || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{total} comentarios analizados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
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
                    const item = payload[0].payload;
                    const pct = ((item.value / total) * 100).toFixed(1);
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="font-medium" style={{ color: item.color }}>
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.value} comentarios ({pct}%)
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{data.positive}</p>
            <p className="text-xs text-muted-foreground">Positivos</p>
            <p className="text-xs text-green-600">
              {((data.positive / total) * 100).toFixed(0)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-500">{data.neutral}</p>
            <p className="text-xs text-muted-foreground">Neutros</p>
            <p className="text-xs text-slate-500">
              {((data.neutral / total) * 100).toFixed(0)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{data.negative}</p>
            <p className="text-xs text-muted-foreground">Negativos</p>
            <p className="text-xs text-red-600">
              {((data.negative / total) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SentimentTrendChartProps {
  data: SentimentTrend[];
  title?: string;
}

export function SentimentTrendChart({
  data,
  title = "Tendencia de Sentimiento",
}: SentimentTrendChartProps) {
  const formatMonth = (month: string) => {
    const [year, m] = month.split("-");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${months[parseInt(m) - 1]} ${year.slice(2)}`;
  };

  const chartData = data.map((item) => ({
    ...item,
    monthLabel: formatMonth(item.month),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Evolución mensual del sentimiento</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <p className="font-medium mb-2">{label}</p>
                        {payload.map((p, i) => (
                          <p key={i} className="text-sm" style={{ color: p.color }}>
                            {p.name}: {p.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="positive"
                name="Positivo"
                stroke={SENTIMENT_COLORS.positive}
                strokeWidth={2}
                dot={{ fill: SENTIMENT_COLORS.positive }}
              />
              <Line
                type="monotone"
                dataKey="neutral"
                name="Neutro"
                stroke={SENTIMENT_COLORS.neutral}
                strokeWidth={2}
                dot={{ fill: SENTIMENT_COLORS.neutral }}
              />
              <Line
                type="monotone"
                dataKey="negative"
                name="Negativo"
                stroke={SENTIMENT_COLORS.negative}
                strokeWidth={2}
                dot={{ fill: SENTIMENT_COLORS.negative }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface CommentListProps {
  comments: Comment[];
  title?: string;
  maxHeight?: string;
}

export function CommentList({
  comments,
  title = "Comentarios Recientes",
  maxHeight = "400px",
}: CommentListProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          {comments.length} comentarios clasificados por sentimiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          <div className="space-y-3 pr-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  {getSentimentIcon(comment.sentiment)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{comment.text}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: SENTIMENT_COLORS[comment.sentiment],
                          color: SENTIMENT_COLORS[comment.sentiment],
                        }}
                      >
                        {SENTIMENT_LABELS[comment.sentiment]}
                        <span className="ml-1 opacity-70">
                          ({comment.sentiment_score > 0 ? "+" : ""}
                          {comment.sentiment_score.toFixed(2)})
                        </span>
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {comment.dimension.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(comment.date).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No hay comentarios para mostrar
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
