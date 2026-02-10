"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Medal, Trophy, Award, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AreaRanking } from "@/types/recognition";

interface RankingsTableProps {
  rankings: AreaRanking[];
}

function getMedalIcon(medal: string, rank: number) {
  switch (medal) {
    case "gold":
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case "silver":
      return <Medal className="h-5 w-5 text-gray-400" />;
    case "bronze":
      return <Medal className="h-5 w-5 text-orange-500" />;
    default:
      return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
  }
}

function TrendBadge({ trend, change }: { trend: string; change: number }) {
  const colors = {
    up: "bg-green-100 text-green-700 border-green-200",
    down: "bg-red-100 text-red-700 border-red-200",
    stable: "bg-gray-100 text-gray-600 border-gray-200",
    new: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const icons = {
    up: <TrendingUp className="h-3 w-3" />,
    down: <TrendingDown className="h-3 w-3" />,
    stable: <Minus className="h-3 w-3" />,
    new: <Award className="h-3 w-3" />,
  };

  return (
    <Badge variant="outline" className={`${colors[trend as keyof typeof colors]} gap-1`}>
      {icons[trend as keyof typeof icons]}
      {trend === "new" ? "Nuevo" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}`}
    </Badge>
  );
}

function MedalBadge({ medal }: { medal: string }) {
  const config = {
    gold: { label: "Oro", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    silver: { label: "Plata", className: "bg-gray-100 text-gray-700 border-gray-300" },
    bronze: { label: "Bronce", className: "bg-orange-100 text-orange-700 border-orange-300" },
    none: { label: "", className: "" },
  };

  if (medal === "none") return null;

  return (
    <Badge variant="outline" className={config[medal as keyof typeof config].className}>
      {config[medal as keyof typeof config].label}
    </Badge>
  );
}

export function RankingsTable({ rankings }: RankingsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Ranking Completo de Areas
        </CardTitle>
        <CardDescription>
          Todas las areas ordenadas por engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Pos</TableHead>
              <TableHead>Area</TableHead>
              <TableHead className="text-center">Engagement</TableHead>
              <TableHead className="text-center">Medalla</TableHead>
              <TableHead className="text-center">Tendencia</TableHead>
              <TableHead className="text-center">
                <Users className="h-4 w-4 inline" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((area, idx) => (
              <motion.tr
                key={area.area}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center justify-center">
                    {getMedalIcon(area.medal, area.rank)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{area.area}</span>
                    {area.badges.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {area.badges.slice(0, 2).map((badge) => (
                          <Badge
                            key={badge.id}
                            variant="secondary"
                            className="text-xs py-0"
                          >
                            {badge.name}
                          </Badge>
                        ))}
                        {area.badges.length > 2 && (
                          <Badge variant="secondary" className="text-xs py-0">
                            +{area.badges.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`
                      text-lg font-bold
                      ${area.engagement >= 4.5 ? "text-green-600" : ""}
                      ${area.engagement >= 4.0 && area.engagement < 4.5 ? "text-blue-600" : ""}
                      ${area.engagement < 4.0 ? "text-orange-600" : ""}
                    `}
                  >
                    {area.engagement.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <MedalBadge medal={area.medal} />
                </TableCell>
                <TableCell className="text-center">
                  <TrendBadge trend={area.trend} change={area.change} />
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {area.respondents}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
