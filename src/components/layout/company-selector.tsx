"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompany } from "@/contexts/company-context";
import { COMPANIES, COMPANY_IDS, type CompanyId } from "@/lib/companies";

export function CompanySelector() {
  const { companyId, setCompanyId } = useCompany();

  return (
    <Select value={companyId} onValueChange={(v) => setCompanyId(v as CompanyId)}>
      <SelectTrigger className="w-full bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COMPANY_IDS.map((id) => {
          const company = COMPANIES[id];
          return (
            <SelectItem key={id} value={id}>
              <span className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold">
                  {company.initials}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{company.name}</span>
                  <span className="text-xs text-muted-foreground">{company.industry}</span>
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
