"use client";

import { X, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useFilters } from "@/contexts/filter-context";
import { useDepartmentOptions } from "@/hooks/use-segmentation";
import {
  TENURE_OPTIONS,
  GENDER_OPTIONS,
} from "@/types/segmentation";

interface FilterDropdownProps {
  label: string;
  value: string | null;
  options: readonly { value: string; label: string }[] | { value: string; label: string }[];
  onChange: (value: string | null) => void;
  placeholder?: string;
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "Seleccionar...",
}: FilterDropdownProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <Select
        value={value || "all"}
        onValueChange={(v) => onChange(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Compact filter bar for header
 */
export function GlobalFiltersBar() {
  const { filters, updateFilter, resetFilters, activeFilterCount } = useFilters();
  const departmentOptions = useDepartmentOptions();

  return (
    <div className="flex items-center gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[320px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Demográficos
            </SheetTitle>
            <SheetDescription>
              Filtra los datos por segmentos demográficos
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <FilterDropdown
              label="Área / Departamento"
              value={filters.department}
              options={departmentOptions}
              onChange={(v) => updateFilter("department", v)}
            />

            <FilterDropdown
              label="Antigüedad"
              value={filters.tenure}
              options={TENURE_OPTIONS}
              onChange={(v) => updateFilter("tenure", v)}
            />

            <FilterDropdown
              label="Género"
              value={filters.gender}
              options={GENDER_OPTIONS}
              onChange={(v) => updateFilter("gender", v)}
            />

            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={resetFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros ({activeFilterCount})
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="hidden md:flex items-center gap-1.5">
          {filters.department && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {departmentOptions.find((o) => o.value === filters.department)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("department", null)}
              />
            </Badge>
          )}
          {filters.tenure && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {TENURE_OPTIONS.find((o) => o.value === filters.tenure)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("tenure", null)}
              />
            </Badge>
          )}
          {filters.gender && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {GENDER_OPTIONS.find((o) => o.value === filters.gender)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("gender", null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Expanded filter panel for dedicated pages
 */
export function GlobalFiltersPanel() {
  const { filters, updateFilter, resetFilters, activeFilterCount } = useFilters();
  const departmentOptions = useDepartmentOptions();

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Filtros Demográficos</h3>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpiar ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FilterDropdown
          label="Área / Departamento"
          value={filters.department}
          options={departmentOptions}
          onChange={(v) => updateFilter("department", v)}
        />

        <FilterDropdown
          label="Antigüedad"
          value={filters.tenure}
          options={TENURE_OPTIONS}
          onChange={(v) => updateFilter("tenure", v)}
        />

        <FilterDropdown
          label="Género"
          value={filters.gender}
          options={GENDER_OPTIONS}
          onChange={(v) => updateFilter("gender", v)}
        />
      </div>
    </div>
  );
}

/**
 * Popover filter button (alternative compact design)
 */
export function GlobalFiltersPopover() {
  const { filters, updateFilter, resetFilters, activeFilterCount } = useFilters();
  const departmentOptions = useDepartmentOptions();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros Demográficos</h4>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Limpiar
              </Button>
            )}
          </div>

          <FilterDropdown
            label="Área / Departamento"
            value={filters.department}
            options={departmentOptions}
            onChange={(v) => updateFilter("department", v)}
          />

          <FilterDropdown
            label="Antigüedad"
            value={filters.tenure}
            options={TENURE_OPTIONS}
            onChange={(v) => updateFilter("tenure", v)}
          />

          <FilterDropdown
            label="Género"
            value={filters.gender}
            options={GENDER_OPTIONS}
            onChange={(v) => updateFilter("gender", v)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
