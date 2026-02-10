"use client";

import { motion } from "framer-motion";
import { Star, TrendingUp, Calendar, Sparkles, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AreaOfMonth } from "@/types/recognition";

interface AreaOfMonthProps {
  data: AreaOfMonth | null;
}

export function AreaOfMonthCard({ data }: AreaOfMonthProps) {
  if (!data) {
    return (
      <Card>
        <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
          No hay datos disponibles
        </CardContent>
      </Card>
    );
  }

  const { current, history } = data;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Star className="h-6 w-6 fill-white" />
          </motion.div>
          Area del Mes
        </CardTitle>
        <CardDescription className="text-white/80">
          {current.month}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Current Winner */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-center mb-6"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 mb-3"
          >
            <Sparkles className="h-5 w-5 text-yellow-600" />
            <span className="font-bold text-lg text-yellow-800">{current.area}</span>
          </motion.div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Anterior</p>
              <p className="text-xl font-semibold">{current.previous_score.toFixed(2)}</p>
            </div>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <TrendingUp className="h-8 w-8 text-green-500" />
            </motion.div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Actual</p>
              <p className="text-xl font-semibold text-green-600">{current.current_score.toFixed(2)}</p>
            </div>
          </div>

          <Badge className="mt-3 bg-green-100 text-green-700 hover:bg-green-100">
            +{current.improvement.toFixed(2)} puntos de mejora
          </Badge>
        </motion.div>

        {/* Top Improving Dimensions */}
        {current.top_improving_dimensions.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Dimensiones que mas crecieron:
            </p>
            <div className="space-y-2">
              {current.top_improving_dimensions.map((dim, idx) => (
                <motion.div
                  key={dim.dimension}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <span className="text-sm">{dim.name}</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    +{dim.improvement.toFixed(2)}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
            <History className="h-3 w-3" />
            Historial
          </p>
          <div className="space-y-2">
            {history.map((entry, idx) => (
              <motion.div
                key={entry.month}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{entry.month}</span>
                </div>
                <span className="font-medium">{entry.area}</span>
                <Badge variant="secondary" className="text-xs">
                  +{entry.improvement.toFixed(2)}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
