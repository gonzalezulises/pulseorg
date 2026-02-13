"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Trophy,
  TrendingUp,
  Star,
  Sparkles,
  PartyPopper,
  Flame,
  Target,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Achievement } from "@/types/recognition";

interface AchievementsFeedProps {
  achievements: Achievement[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  "trending-up": TrendingUp,
  star: Star,
  sparkles: Sparkles,
  flame: Flame,
  target: Target,
  award: Award,
};

const typeConfig = {
  milestone: {
    gradient: "from-yellow-400 to-orange-400",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    emoji: "🎉",
  },
  improvement: {
    gradient: "from-green-400 to-emerald-400",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    emoji: "📈",
  },
  dimension: {
    gradient: "from-rizoma-blue to-rizoma-cyan",
    textColor: "text-rizoma-blue",
    bgColor: "bg-rizoma-blue/5",
    emoji: "⭐",
  },
  streak: {
    gradient: "from-rizoma-cyan to-rizoma-cyan-light",
    textColor: "text-rizoma-cyan-dark",
    bgColor: "bg-rizoma-cyan/5",
    emoji: "🏆",
  },
};

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const config = typeConfig[achievement.type];
  const IconComponent = iconMap[achievement.icon] || Star;
  const date = new Date(achievement.date);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ delay: index * 0.1 }}
      className={`
        relative p-4 rounded-lg border
        ${config.bgColor} border-transparent
        hover:shadow-md transition-shadow
      `}
    >
      {/* Gradient accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-gradient-to-b ${config.gradient}`} />

      <div className="flex items-start gap-3 pl-2">
        {/* Icon */}
        <div className={`p-2 rounded-full bg-gradient-to-br ${config.gradient} text-white`}>
          <IconComponent className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm font-medium">
            <span className="mr-1">{config.emoji}</span>
            {achievement.message}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {achievement.area}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AchievementsFeed({ achievements }: AchievementsFeedProps) {
  const [showAll, setShowAll] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  const triggerConfetti = useCallback(() => {
    if (celebrated) return;

    // Fire confetti from left
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ["#fbbf24", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"],
    });

    // Fire confetti from right
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ["#fbbf24", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"],
    });

    setCelebrated(true);
  }, [celebrated]);

  const displayedAchievements = showAll ? achievements : achievements.slice(0, 5);
  const milestonesCount = achievements.filter((a) => a.type === "milestone").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-yellow-500" />
              Celebración de Logros
            </CardTitle>
            <CardDescription>
              Logros recientes de las áreas
            </CardDescription>
          </div>
          {milestonesCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={triggerConfetti}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Celebrar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {displayedAchievements.map((achievement, idx) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={idx}
              />
            ))}
          </AnimatePresence>
        </div>

        {achievements.length > 5 && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Ver menos" : `Ver todos (${achievements.length})`}
          </Button>
        )}

        {achievements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No hay logros recientes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
