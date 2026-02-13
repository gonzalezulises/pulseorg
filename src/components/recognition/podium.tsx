"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AreaRanking } from "@/types/recognition";

interface PodiumProps {
  podium: AreaRanking[];
}

const medalColors = {
  gold: {
    bg: "bg-gradient-to-br from-yellow-300 to-yellow-500",
    border: "border-yellow-400",
    text: "text-yellow-700",
    shadow: "shadow-yellow-200",
  },
  silver: {
    bg: "bg-gradient-to-br from-gray-200 to-gray-400",
    border: "border-gray-400",
    text: "text-gray-700",
    shadow: "shadow-gray-200",
  },
  bronze: {
    bg: "bg-gradient-to-br from-orange-300 to-orange-500",
    border: "border-orange-400",
    text: "text-orange-700",
    shadow: "shadow-orange-200",
  },
};

const podiumHeights = ["h-32", "h-24", "h-20"];
const podiumDelays = [0.2, 0, 0.4]; // 2nd place, 1st place, 3rd place animation order
const podiumOrder = [1, 0, 2]; // Display order: 2nd, 1st, 3rd

function TrendIcon({ trend }: { trend: string }) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    case "down":
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    default:
      return <Minus className="h-3 w-3 text-gray-400" />;
  }
}

export function Podium({ podium }: PodiumProps) {
  if (podium.length < 3) return null;

  // Reorder for visual display (2nd, 1st, 3rd)
  const displayOrder = [podium[1], podium[0], podium[2]];
  const medals: ("silver" | "gold" | "bronze")[] = ["silver", "gold", "bronze"];
  const positions = ["2do", "1ro", "3ro"];
  const icons = [
    <Medal key="silver" className="h-8 w-8 text-gray-500" />,
    <Trophy key="gold" className="h-10 w-10 text-yellow-500" />,
    <Medal key="bronze" className="h-8 w-8 text-orange-500" />,
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Podio de Excelencia
        </CardTitle>
        <CardDescription>
          Las 3 áreas con mejor compromiso del período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-center gap-4 pt-8 pb-4">
          {displayOrder.map((area, idx) => (
            <motion.div
              key={area.area}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: podiumDelays[idx], duration: 0.5, type: "spring" }}
              className="flex flex-col items-center"
            >
              {/* Medal icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: podiumDelays[idx] + 0.3, duration: 0.3, type: "spring" }}
                className="mb-2"
              >
                {icons[idx]}
              </motion.div>

              {/* Area info card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`
                  w-36 rounded-t-lg p-3 text-center
                  ${medalColors[medals[idx]].bg}
                  ${medalColors[medals[idx]].border}
                  border-2 border-b-0
                  shadow-lg ${medalColors[medals[idx]].shadow}
                `}
              >
                <p className="text-xs font-semibold text-white/90 truncate" title={area.area}>
                  {area.area.length > 20 ? area.area.substring(0, 20) + "..." : area.area}
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {area.engagement.toFixed(2)}
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendIcon trend={area.trend} />
                  <span className={`text-xs ${area.change >= 0 ? "text-green-200" : "text-red-200"}`}>
                    {area.change >= 0 ? "+" : ""}{area.change.toFixed(2)}
                  </span>
                </div>
              </motion.div>

              {/* Podium stand */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ delay: podiumDelays[idx] + 0.1, duration: 0.4 }}
                className={`
                  w-36 ${podiumHeights[idx]}
                  ${medalColors[medals[idx]].bg}
                  ${medalColors[medals[idx]].border}
                  border-2 border-t-0
                  rounded-b-lg
                  flex items-center justify-center
                  shadow-lg ${medalColors[medals[idx]].shadow}
                `}
              >
                <span className="text-4xl font-bold text-white/80">
                  {positions[idx]}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span>Oro (4.5+)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>Plata (4.2-4.5)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
            <span>Bronce (4.0-4.2)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
