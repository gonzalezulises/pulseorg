"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { WordCloudWord, Comment } from "@/types/text-analysis";
import { SENTIMENT_COLORS, SENTIMENT_LABELS } from "@/types/text-analysis";
import { useCommentsByWord, useTextAnalysisData } from "@/hooks/use-text-analysis";
import { MessageSquare, RefreshCw } from "lucide-react";

interface WordCloudProps {
  data: WordCloudWord[];
  title?: string;
  description?: string;
}

export function WordCloud({
  data,
  title = "Nube de Palabras",
  description = "Palabras mas frecuentes en los comentarios",
}: WordCloudProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const comments = useCommentsByWord(selectedWord);
  const { data: analysisData } = useTextAnalysisData();

  // Lista de palabras para mostrar debajo de la imagen
  const topWords = data.slice(0, 10);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              No hay datos para mostrar
            </div>
          ) : (
            <>
              {/* Imagen generada por Python */}
              <div className="relative w-full rounded-lg overflow-hidden bg-white dark:hidden">
                <img
                  src="/images/wordcloud.png"
                  alt="Nube de palabras"
                  className="w-full h-auto"
                  style={{ maxHeight: "500px", objectFit: "contain" }}
                />
              </div>

              {/* Version dark mode */}
              <div className="relative w-full rounded-lg overflow-hidden hidden dark:block bg-slate-800">
                <img
                  src="/images/wordcloud-dark.png"
                  alt="Nube de palabras"
                  className="w-full h-auto"
                  style={{ maxHeight: "500px", objectFit: "contain" }}
                />
              </div>

              {/* Lista interactiva de palabras principales */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Haz clic en una palabra para ver los comentarios relacionados:
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.map((word) => (
                    <Button
                      key={word.text}
                      variant="outline"
                      size="sm"
                      className="h-auto py-1 px-2"
                      style={{
                        borderColor: getSentimentColor(word.sentiment),
                        color: getSentimentColor(word.sentiment),
                      }}
                      onClick={() => setSelectedWord(word.text)}
                    >
                      {word.text}
                      <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                        {word.value}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Positivo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-muted-foreground">Neutro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-muted-foreground">Negativo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Dialog */}
      <Dialog open={!!selectedWord} onOpenChange={() => setSelectedWord(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Comentarios con &quot;{selectedWord}&quot;
              <Badge variant="secondary">{comments.length}</Badge>
            </DialogTitle>
            <DialogDescription>
              Comentarios que contienen o se relacionan con esta palabra
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
              {comments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No se encontraron comentarios
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case "positive":
      return "#22c55e";
    case "negative":
      return "#ef4444";
    default:
      return "#3b82f6";
  }
}

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="p-3 rounded-lg border bg-card">
      <p className="text-sm mb-2">{comment.text}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          style={{
            borderColor: SENTIMENT_COLORS[comment.sentiment],
            color: SENTIMENT_COLORS[comment.sentiment],
          }}
        >
          {SENTIMENT_LABELS[comment.sentiment]}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {comment.dimension.replace(/_/g, " ")}
        </Badge>
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(comment.date).toLocaleDateString("es-ES")}
        </span>
      </div>
    </div>
  );
}
