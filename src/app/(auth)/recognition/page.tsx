"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Medal,
  Target,
  PartyPopper,
  Award,
  Star,
} from "lucide-react";

// Hooks
import {
  useRecognitionData,
  usePodium,
  useRankings,
  useAreaOfMonth,
  useGoalsProgress,
  useAchievements,
  useRecognitionSummary,
} from "@/hooks/use-recognition";

// Components
import {
  Podium,
  RankingsTable,
  AreaOfMonthCard,
  GoalsProgress,
  AchievementsFeed,
  BadgesDisplay,
} from "@/components/recognition";

// Summary stats card
function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function RecognitionPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [hasAnimated, setHasAnimated] = useState(false);

  // Data hooks
  const { data: recognitionData, isLoading } = useRecognitionData();
  const { data: podium } = usePodium();
  const { data: rankings } = useRankings();
  const { data: areaOfMonth } = useAreaOfMonth();
  const { data: goals } = useGoalsProgress();
  const { data: achievements } = useAchievements();
  const { data: summary } = useRecognitionSummary();

  // Trigger confetti on first load if there are gold medals
  useEffect(() => {
    if (!hasAnimated && summary && summary.gold_medals > 0) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#fbbf24", "#f59e0b", "#22c55e"],
        });
        setHasAnimated(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [summary, hasAnimated]);

  return (
    <>
      <Header
        title="Reconocimiento y Gamificacion"
        description="Celebra los logros y el progreso de las areas de la organizacion"
        showYearSelector={false}
        showFilters={false}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        {!isLoading && summary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <SummaryCard
              icon={Trophy}
              label="Medallas de Oro"
              value={summary.gold_medals}
              color="bg-yellow-100 text-yellow-600"
            />
            <SummaryCard
              icon={Medal}
              label="Medallas de Plata"
              value={summary.silver_medals}
              color="bg-gray-100 text-gray-600"
            />
            <SummaryCard
              icon={Medal}
              label="Medallas de Bronce"
              value={summary.bronze_medals}
              color="bg-orange-100 text-orange-600"
            />
            <SummaryCard
              icon={Star}
              label="Compromiso Promedio"
              value={(summary.average_engagement ?? 0).toFixed(2)}
              color="bg-blue-100 text-blue-600"
            />
            <SummaryCard
              icon={Target}
              label="Metas en Camino"
              value={`${summary.goals_on_track}/${summary.goals_on_track + summary.goals_at_risk}`}
              color="bg-green-100 text-green-600"
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview" className="gap-1">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="rankings" className="gap-1">
              <Medal className="h-4 w-4" />
              <span className="hidden sm:inline">Rankings</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-1">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Metas</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-1">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-[350px]" />
                <div className="grid gap-6 lg:grid-cols-2">
                  <Skeleton className="h-[400px]" />
                  <Skeleton className="h-[400px]" />
                </div>
              </div>
            ) : (
              <>
                {/* Podium */}
                <Podium podium={podium || []} />

                {/* Area of Month + Achievements */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <AreaOfMonthCard data={areaOfMonth ?? null} />
                  <AchievementsFeed achievements={achievements || []} />
                </div>
              </>
            )}
          </TabsContent>

          {/* Rankings Tab */}
          <TabsContent value="rankings" className="space-y-6 mt-6">
            {isLoading ? (
              <Skeleton className="h-[600px]" />
            ) : (
              <RankingsTable rankings={rankings || []} />
            )}
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6 mt-6">
            {isLoading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <GoalsProgress goals={goals || []} />
            )}
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6 mt-6">
            {isLoading ? (
              <Skeleton className="h-[500px]" />
            ) : (
              <BadgesDisplay rankings={rankings || []} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
