"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, RotateCcw } from "lucide-react";
import type {
  ClusteringFilters,
  ClusterFilterState,
  EngagementProfile,
  SentimentType,
} from "@/types/clustering";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  filters: ClusterFilterState;
  filterOptions: ClusteringFilters;
  onFilterChange: <K extends keyof ClusterFilterState>(
    key: K,
    value: ClusterFilterState[K]
  ) => void;
  onReset: () => void;
  stats: {
    totalNodes: number;
    participantCount: number;
    themeCount: number;
    totalEdges: number;
    isFiltered: boolean;
  };
}

export function FilterPanel({
  filters,
  filterOptions,
  onFilterChange,
  onReset,
  stats,
}: FilterPanelProps) {
  const toggleDepartment = (deptId: string) => {
    const current = filters.departments;
    if (current.includes(deptId)) {
      onFilterChange(
        "departments",
        current.filter((d) => d !== deptId)
      );
    } else {
      onFilterChange("departments", [...current, deptId]);
    }
  };

  const toggleProfile = (profile: EngagementProfile) => {
    const current = filters.profiles;
    if (current.includes(profile)) {
      onFilterChange(
        "profiles",
        current.filter((p) => p !== profile)
      );
    } else {
      onFilterChange("profiles", [...current, profile]);
    }
  };

  const toggleSentiment = (sentiment: SentimentType) => {
    const current = filters.sentiments;
    if (current.includes(sentiment)) {
      onFilterChange(
        "sentiments",
        current.filter((s) => s !== sentiment)
      );
    } else {
      onFilterChange("sentiments", [...current, sentiment]);
    }
  };

  const toggleTheme = (themeId: string) => {
    const current = filters.themes;
    if (current.includes(themeId)) {
      onFilterChange(
        "themes",
        current.filter((t) => t !== themeId)
      );
    } else {
      onFilterChange("themes", [...current, themeId]);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
        {stats.isFiltered && (
          <p className="text-sm text-muted-foreground">
            Mostrando {stats.participantCount} participantes, {stats.themeCount} temas
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="space-y-6 p-4 pt-0">
            {/* Edge Type Toggles */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de Conexiones</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="participant-edges" className="text-sm font-normal">
                    Participante - Participante
                  </Label>
                  <Switch
                    id="participant-edges"
                    checked={filters.showParticipantEdges}
                    onCheckedChange={(checked) =>
                      onFilterChange("showParticipantEdges", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-edges" className="text-sm font-normal">
                    Participante - Tema
                  </Label>
                  <Switch
                    id="theme-edges"
                    checked={filters.showThemeEdges}
                    onCheckedChange={(checked) =>
                      onFilterChange("showThemeEdges", checked)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Node Size Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Tamano de Nodos</Label>
                <span className="text-sm text-muted-foreground">
                  {(filters.nodeSize * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[filters.nodeSize]}
                onValueChange={([value]) => onFilterChange("nodeSize", value)}
                min={0.2}
                max={1.5}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Min Common Themes Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Temas en Comun (min)</Label>
                <span className="text-sm text-muted-foreground">
                  {filters.minCommonThemes}
                </span>
              </div>
              <Slider
                value={[filters.minCommonThemes]}
                onValueChange={([value]) => onFilterChange("minCommonThemes", value)}
                min={1}
                max={8}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Conectar participantes con al menos {filters.minCommonThemes} temas compartidos
              </p>
            </div>

            {/* Min Connections Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Peso de Conexion (min)</Label>
                <span className="text-sm text-muted-foreground">
                  {filters.minConnections}
                </span>
              </div>
              <Slider
                value={[filters.minConnections]}
                onValueChange={([value]) => onFilterChange("minConnections", value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Profiles Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Perfiles de Engagement</Label>
              <div className="flex flex-wrap gap-1">
                {filterOptions.profiles.map((profile) => (
                  <Badge
                    key={profile.id}
                    variant={filters.profiles.includes(profile.id as EngagementProfile) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      filters.profiles.includes(profile.id as EngagementProfile) &&
                        "text-white"
                    )}
                    style={
                      filters.profiles.includes(profile.id as EngagementProfile)
                        ? { backgroundColor: profile.color }
                        : undefined
                    }
                    onClick={() => toggleProfile(profile.id as EngagementProfile)}
                  >
                    {profile.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sentiments Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Sentimiento</Label>
              <div className="flex flex-wrap gap-1">
                {filterOptions.sentiments.map((sentiment) => (
                  <Badge
                    key={sentiment.id}
                    variant={filters.sentiments.includes(sentiment.id as SentimentType) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      filters.sentiments.includes(sentiment.id as SentimentType) &&
                        "text-white"
                    )}
                    style={
                      filters.sentiments.includes(sentiment.id as SentimentType)
                        ? { backgroundColor: sentiment.color }
                        : undefined
                    }
                    onClick={() => toggleSentiment(sentiment.id as SentimentType)}
                  >
                    {sentiment.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Departments Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Departamentos</Label>
              <div className="flex flex-wrap gap-1">
                {filterOptions.departments.map((dept) => (
                  <Badge
                    key={dept.id}
                    variant={filters.departments.includes(dept.id) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleDepartment(dept.id)}
                  >
                    {dept.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Themes Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Temas</Label>
              <div className="flex flex-wrap gap-1">
                {filterOptions.themes.map((theme) => (
                  <Badge
                    key={theme.id}
                    variant={filters.themes.includes(theme.id.replace("T_", "")) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleTheme(theme.id.replace("T_", ""))}
                  >
                    {theme.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
