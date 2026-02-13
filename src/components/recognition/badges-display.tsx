"use client";

import { motion } from "framer-motion";
import {
  Star,
  CheckCircle,
  Heart,
  Users,
  Award,
  Zap,
  Shield,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AreaRanking, Badge as BadgeType } from "@/types/recognition";

interface BadgesDisplayProps {
  rankings: AreaRanking[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  "check-circle": CheckCircle,
  heart: Heart,
  users: Users,
  award: Award,
  zap: Zap,
  shield: Shield,
  crown: Crown,
};

const colorMap: Record<string, string> = {
  yellow: "bg-yellow-100 text-yellow-600 border-yellow-300",
  green: "bg-green-100 text-green-600 border-green-300",
  pink: "bg-pink-100 text-pink-600 border-pink-300",
  blue: "bg-blue-100 text-blue-600 border-blue-300",
  purple: "bg-purple-100 text-purple-600 border-purple-300",
  orange: "bg-orange-100 text-orange-600 border-orange-300",
};

function BadgeIcon({ badge }: { badge: BadgeType }) {
  const IconComponent = iconMap[badge.icon] || Award;
  const colorClass = colorMap[badge.color] || colorMap.blue;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            className={`
              p-2 rounded-full border-2 cursor-pointer
              ${colorClass}
            `}
          >
            <IconComponent className="h-4 w-4" />
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{badge.name}</p>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AreaBadgesRow({ area, index }: { area: AreaRanking; index: number }) {
  if (area.badges.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="font-medium text-sm w-48 truncate" title={area.area}>
          {area.area}
        </span>
        <Badge variant="outline" className="text-xs">
          {area.engagement.toFixed(2)}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        {area.badges.map((badge) => (
          <BadgeIcon key={badge.id} badge={badge} />
        ))}
      </div>
    </motion.div>
  );
}

// Badge definitions for legend
const badgeDefinitions = [
  {
    id: "rising_star",
    name: "Estrella en Ascenso",
    description: "Mayor mejora vs periodo anterior",
    icon: "star",
    color: "yellow",
  },
  {
    id: "consistency",
    name: "Consistencia",
    description: "Mantiene compromiso superior a 4.3",
    icon: "check-circle",
    color: "green",
  },
  {
    id: "wellness_leader",
    name: "Lider en Bienestar",
    description: "Top en Balance Vida-Trabajo",
    icon: "heart",
    color: "pink",
  },
  {
    id: "team_spirit",
    name: "Espiritu de Equipo",
    description: "Excelente cohesion de equipo",
    icon: "users",
    color: "blue",
  },
  {
    id: "leadership_excellence",
    name: "Excelencia en Liderazgo",
    description: "Liderazgo destacado",
    icon: "award",
    color: "purple",
  },
];

export function BadgesDisplay({ rankings }: BadgesDisplayProps) {
  const areasWithBadges = rankings.filter((a) => a.badges.length > 0);
  const totalBadges = areasWithBadges.reduce((sum, a) => sum + a.badges.length, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Badges y Reconocimientos
            </CardTitle>
            <CardDescription>
              Insignias ganadas por cada area
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {totalBadges} badges otorgados
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="mb-6 p-4 rounded-lg bg-muted/30 border">
          <p className="text-sm font-medium mb-3">Tipos de Badges:</p>
          <div className="flex flex-wrap gap-4">
            {badgeDefinitions.map((badge) => {
              const IconComponent = iconMap[badge.icon] || Award;
              const colorClass = colorMap[badge.color] || colorMap.blue;
              return (
                <div key={badge.id} className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-full border ${colorClass}`}>
                    <IconComponent className="h-3 w-3" />
                  </div>
                  <span className="text-xs text-muted-foreground">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Areas with badges */}
        <div className="space-y-2">
          {areasWithBadges.length > 0 ? (
            areasWithBadges.map((area, idx) => (
              <AreaBadgesRow key={area.area} area={area} index={idx} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aun no hay badges otorgados</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
