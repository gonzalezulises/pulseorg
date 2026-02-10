"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type {
  OpenQuestionAnalysis,
  KeywordItem,
  BigramItem,
  SentimentAnalysis,
} from "@/types/unified-analysis";

interface KeywordCloudProps {
  keywords: KeywordItem[];
  title?: string;
  maxWords?: number;
}

/**
 * Visual keyword cloud using badges with varying sizes
 */
export function KeywordCloud({
  keywords,
  title = "Palabras Clave",
  maxWords = 25,
}: KeywordCloudProps) {
  const topKeywords = keywords.slice(0, maxWords);

  // Calculate size based on frequency
  const maxFreq = Math.max(...topKeywords.map((k) => k.frequency));
  const minFreq = Math.min(...topKeywords.map((k) => k.frequency));

  const getSize = (freq: number): string => {
    const normalized = (freq - minFreq) / (maxFreq - minFreq || 1);
    if (normalized > 0.7) return "text-xl font-bold";
    if (normalized > 0.4) return "text-base font-semibold";
    if (normalized > 0.2) return "text-sm font-medium";
    return "text-xs";
  };

  const getColor = (freq: number): string => {
    const normalized = (freq - minFreq) / (maxFreq - minFreq || 1);
    if (normalized > 0.7) return "bg-primary text-primary-foreground";
    if (normalized > 0.4) return "bg-cyan-500 text-white";
    if (normalized > 0.2) return "bg-emerald-500 text-white";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{topKeywords.length} palabras más frecuentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {topKeywords.map((keyword, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`${getSize(keyword.frequency)} ${getColor(keyword.frequency)} cursor-default`}
              title={`${keyword.count} menciones (${keyword.frequency}%)`}
            >
              {keyword.word}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface KeywordListProps {
  keywords: KeywordItem[];
  title?: string;
  maxItems?: number;
}

/**
 * Horizontal bar list of keywords with counts
 */
export function KeywordList({
  keywords,
  title = "Top Palabras",
  maxItems = 10,
}: KeywordListProps) {
  const topKeywords = keywords.slice(0, maxItems);
  const maxCount = Math.max(...topKeywords.map((k) => k.count));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topKeywords.map((keyword, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{keyword.word}</span>
                <span className="text-muted-foreground">{keyword.count}</span>
              </div>
              <Progress
                value={(keyword.count / maxCount) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface BigramListProps {
  bigrams: BigramItem[];
  title?: string;
  maxItems?: number;
}

/**
 * List of most common bigrams (phrase pairs)
 */
export function BigramList({
  bigrams,
  title = "Frases Comunes",
  maxItems = 10,
}: BigramListProps) {
  const topBigrams = bigrams.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Pares de palabras más frecuentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topBigrams.map((bigram, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 rounded-lg bg-muted/50"
            >
              <span className="font-medium text-sm">&quot;{bigram.phrase}&quot;</span>
              <Badge variant="secondary">{bigram.count}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface SentimentCardProps {
  sentiment: SentimentAnalysis;
  title?: string;
}

/**
 * Sentiment analysis visualization
 */
export function SentimentCard({
  sentiment,
  title = "Análisis de Sentimiento",
}: SentimentCardProps) {
  const { sentiment_distribution, top_positive_words, top_negative_words } =
    sentiment;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Distribution bars */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-24 text-sm text-green-600 font-medium">
                Positivo
              </div>
              <div className="flex-1">
                <Progress
                  value={sentiment_distribution.positive.percentage}
                  className="h-4 bg-muted [&>div]:bg-green-500"
                />
              </div>
              <span className="w-16 text-right text-sm font-bold text-green-600">
                {sentiment_distribution.positive.percentage}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 text-sm text-slate-500 font-medium">
                Neutral
              </div>
              <div className="flex-1">
                <Progress
                  value={sentiment_distribution.neutral.percentage}
                  className="h-4 bg-muted [&>div]:bg-slate-400"
                />
              </div>
              <span className="w-16 text-right text-sm font-bold text-slate-500">
                {sentiment_distribution.neutral.percentage}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 text-sm text-red-600 font-medium">
                Negativo
              </div>
              <div className="flex-1">
                <Progress
                  value={sentiment_distribution.negative.percentage}
                  className="h-4 bg-muted [&>div]:bg-red-500"
                />
              </div>
              <span className="w-16 text-right text-sm font-bold text-red-600">
                {sentiment_distribution.negative.percentage}%
              </span>
            </div>
          </div>

          {/* Top words by sentiment */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p className="text-xs font-medium text-green-600 mb-2">
                Palabras Positivas
              </p>
              <div className="flex flex-wrap gap-1">
                {top_positive_words.slice(0, 5).map(([word, count], i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 text-xs"
                  >
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-red-600 mb-2">
                Palabras Negativas
              </p>
              <div className="flex flex-wrap gap-1">
                {top_negative_words.slice(0, 5).map(([word, count], i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200 text-xs"
                  >
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OpenQuestionSummaryProps {
  data: OpenQuestionAnalysis;
  questionTitle: string;
}

/**
 * Complete summary card for an open question
 */
export function OpenQuestionSummary({
  data,
  questionTitle,
}: OpenQuestionSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{questionTitle}</CardTitle>
        <CardDescription>
          {data.response_count} respuestas analizadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Keywords */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Palabras Clave</h4>
          <div className="flex flex-wrap gap-2">
            {data.keywords.slice(0, 15).map((k, i) => (
              <Badge
                key={i}
                variant={i < 5 ? "default" : "secondary"}
                className="text-xs"
              >
                {k.word} ({k.count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Bigrams */}
        {data.bigrams.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Frases Frecuentes</h4>
            <div className="flex flex-wrap gap-2">
              {data.bigrams.slice(0, 5).map((b, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs"
                >
                  &quot;{b.phrase}&quot;
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sentiment summary */}
        <div className="pt-2 border-t">
          <h4 className="text-sm font-semibold mb-2">Sentimiento</h4>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600">
              +{data.sentiment.sentiment_distribution.positive.percentage}%
            </span>
            <span className="text-slate-500">
              ={data.sentiment.sentiment_distribution.neutral.percentage}%
            </span>
            <span className="text-red-600">
              -{data.sentiment.sentiment_distribution.negative.percentage}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
