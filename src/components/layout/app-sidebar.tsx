"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  TrendingUp,
  Bell,
  Download,
  FileText,
  BarChart3,
  Users,
  MessageSquareText,
  LineChart,
  Network,
  Trophy,
  Waypoints,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useNewAlertsCount } from "@/hooks/use-predictions";
import { CompanySelector } from "@/components/layout/company-selector";

// Items de navegación
interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  showAlertBadge?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    title: "Instrumento",
    href: "/instrumento",
    icon: BookOpen,
  },
  {
    title: "Ficha Técnica",
    href: "/ficha-tecnica",
    icon: FileText,
  },
  {
    title: "Panel General",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Indicadores",
    href: "/dimensions",
    icon: Layers,
  },
  {
    title: "Tendencias",
    href: "/trends",
    icon: TrendingUp,
  },
  {
    title: "Análisis",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Segmentación",
    href: "/segmentation",
    icon: Users,
  },
  {
    title: "Análisis de Texto",
    href: "/text-analysis",
    icon: MessageSquareText,
  },
  {
    title: "Predicciones",
    href: "/predictions",
    icon: LineChart,
    showAlertBadge: true,
  },
  {
    title: "Correlaciones",
    href: "/correlations",
    icon: Network,
  },
  {
    title: "Agrupaciones",
    href: "/clusters",
    icon: Waypoints,
  },
  {
    title: "Reconocimiento",
    href: "/recognition",
    icon: Trophy,
  },
  {
    title: "Alertas",
    href: "/alerts",
    icon: Bell,
  },
  {
    title: "Exportar",
    href: "/export",
    icon: Download,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { count: newAlertsCount } = useNewAlertsCount();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex flex-col gap-2">
          <Link href="/dashboard" className="text-sm font-bold text-sidebar-foreground tracking-tight">
            MRI
          </Link>
          <CompanySelector />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const showBadge = item.showAlertBadge && newAlertsCount > 0;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href} className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </span>
                        {showBadge && (
                          <Badge
                            variant="destructive"
                            className="h-5 min-w-[20px] px-1.5 text-xs justify-center"
                          >
                            {newAlertsCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver a la introducción
        </Link>
        <p className="text-xs text-sidebar-foreground/50">
          © 2026 MRI · Rizoma ·{" "}
          <a href="https://www.rizo.ma" target="_blank" rel="noopener noreferrer" className="underline hover:text-sidebar-foreground">
            rizo.ma
          </a>
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
