"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlobalFiltersBar } from "@/components/filters/global-filters";
import { AVAILABLE_YEARS, DASHBOARD_CONFIG } from "@/lib/constants";

interface HeaderProps {
  title: string;
  description?: string;
  selectedYear?: number;
  onYearChange?: (year: number) => void;
  showYearSelector?: boolean;
  showFilters?: boolean;
}

export function Header({
  title,
  description,
  selectedYear = DASHBOARD_CONFIG.defaultYear,
  onYearChange,
  showYearSelector = true,
  showFilters = true,
}: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="flex flex-1 items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showFilters && <GlobalFiltersBar />}

          {showYearSelector && onYearChange && (
            <Select
              value={String(selectedYear)}
              onValueChange={(value) => onYearChange(Number(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_YEARS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </header>
  );
}
