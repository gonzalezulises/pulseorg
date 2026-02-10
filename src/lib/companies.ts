export type CompanyId = "novatech" | "meridian" | "atlas" | "vitacore";

export interface CompanyTheme {
  // Main
  "--primary": string;
  "--primary-foreground": string;
  "--secondary": string;
  "--secondary-foreground": string;
  "--accent": string;
  "--accent-foreground": string;
  "--background": string;
  "--foreground": string;
  "--card": string;
  "--card-foreground": string;
  "--popover": string;
  "--popover-foreground": string;
  "--muted": string;
  "--muted-foreground": string;
  "--destructive": string;
  "--border": string;
  "--input": string;
  "--ring": string;
  // Charts
  "--chart-1": string;
  "--chart-2": string;
  "--chart-3": string;
  "--chart-4": string;
  "--chart-5": string;
  // Sidebar
  "--sidebar": string;
  "--sidebar-foreground": string;
  "--sidebar-primary": string;
  "--sidebar-primary-foreground": string;
  "--sidebar-accent": string;
  "--sidebar-accent-foreground": string;
  "--sidebar-border": string;
  "--sidebar-ring": string;
}

export interface CompanyProfile {
  id: CompanyId;
  name: string;
  initials: string;
  industry: string;
  employeeCount: number;
  departments: string[];
  theme: CompanyTheme;
}

export const COMPANIES: Record<CompanyId, CompanyProfile> = {
  novatech: {
    id: "novatech",
    name: "NovaTech Solutions",
    initials: "NT",
    industry: "Tech / SaaS",
    employeeCount: 450,
    departments: [
      "Engineering",
      "Product",
      "Design",
      "DevOps",
      "Data Science",
      "Sales",
      "Customer Success",
      "Marketing",
      "People Ops",
      "Finance",
    ],
    theme: {
      "--primary": "#7C3AED",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#F0EBFF",
      "--secondary-foreground": "#2D1B69",
      "--accent": "#06B6D4",
      "--accent-foreground": "#FFFFFF",
      "--background": "#FFFFFF",
      "--foreground": "#1E1B4B",
      "--card": "#FFFFFF",
      "--card-foreground": "#1E1B4B",
      "--popover": "#FFFFFF",
      "--popover-foreground": "#1E1B4B",
      "--muted": "#F1F0FB",
      "--muted-foreground": "#6B7280",
      "--destructive": "#DC2626",
      "--border": "#E5E0FF",
      "--input": "#E5E0FF",
      "--ring": "#7C3AED",
      "--chart-1": "#7C3AED",
      "--chart-2": "#06B6D4",
      "--chart-3": "#2D1B69",
      "--chart-4": "#A78BFA",
      "--chart-5": "#64748B",
      "--sidebar": "#2D1B69",
      "--sidebar-foreground": "#FFFFFF",
      "--sidebar-primary": "#06B6D4",
      "--sidebar-primary-foreground": "#FFFFFF",
      "--sidebar-accent": "#3D2B7A",
      "--sidebar-accent-foreground": "#FFFFFF",
      "--sidebar-border": "#4C3D89",
      "--sidebar-ring": "#06B6D4",
    },
  },
  meridian: {
    id: "meridian",
    name: "Meridian Stores",
    initials: "MS",
    industry: "Retail",
    employeeCount: 1200,
    departments: [
      "Ventas Tienda",
      "Logística",
      "E-Commerce",
      "Marketing",
      "RRHH",
      "Finanzas",
      "Compras",
      "Atención al Cliente",
      "IT",
      "Operaciones",
    ],
    theme: {
      "--primary": "#EA580C",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#FFF7ED",
      "--secondary-foreground": "#134E4A",
      "--accent": "#0D9488",
      "--accent-foreground": "#FFFFFF",
      "--background": "#FFFFFF",
      "--foreground": "#134E4A",
      "--card": "#FFFFFF",
      "--card-foreground": "#134E4A",
      "--popover": "#FFFFFF",
      "--popover-foreground": "#134E4A",
      "--muted": "#F0FDF4",
      "--muted-foreground": "#6B7280",
      "--destructive": "#DC2626",
      "--border": "#D1FAE5",
      "--input": "#D1FAE5",
      "--ring": "#EA580C",
      "--chart-1": "#EA580C",
      "--chart-2": "#0D9488",
      "--chart-3": "#134E4A",
      "--chart-4": "#FB923C",
      "--chart-5": "#64748B",
      "--sidebar": "#134E4A",
      "--sidebar-foreground": "#FFFFFF",
      "--sidebar-primary": "#EA580C",
      "--sidebar-primary-foreground": "#FFFFFF",
      "--sidebar-accent": "#1A5E5A",
      "--sidebar-accent-foreground": "#FFFFFF",
      "--sidebar-border": "#236E6A",
      "--sidebar-ring": "#EA580C",
    },
  },
  atlas: {
    id: "atlas",
    name: "Atlas Capital Group",
    initials: "AC",
    industry: "Finanzas",
    employeeCount: 350,
    departments: [
      "Banca Privada",
      "Cumplimiento",
      "Riesgos",
      "Tesorería",
      "Operaciones",
      "Tecnología",
      "Legal",
      "Auditoría",
      "RRHH",
      "Marketing",
    ],
    theme: {
      "--primary": "#1E40AF",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#EFF6FF",
      "--secondary-foreground": "#0C1929",
      "--accent": "#059669",
      "--accent-foreground": "#FFFFFF",
      "--background": "#FFFFFF",
      "--foreground": "#0C1929",
      "--card": "#FFFFFF",
      "--card-foreground": "#0C1929",
      "--popover": "#FFFFFF",
      "--popover-foreground": "#0C1929",
      "--muted": "#F0F9FF",
      "--muted-foreground": "#6B7280",
      "--destructive": "#DC2626",
      "--border": "#DBEAFE",
      "--input": "#DBEAFE",
      "--ring": "#1E40AF",
      "--chart-1": "#1E40AF",
      "--chart-2": "#059669",
      "--chart-3": "#0C1929",
      "--chart-4": "#60A5FA",
      "--chart-5": "#64748B",
      "--sidebar": "#0C1929",
      "--sidebar-foreground": "#FFFFFF",
      "--sidebar-primary": "#059669",
      "--sidebar-primary-foreground": "#FFFFFF",
      "--sidebar-accent": "#1A2D44",
      "--sidebar-accent-foreground": "#FFFFFF",
      "--sidebar-border": "#253D55",
      "--sidebar-ring": "#059669",
    },
  },
  vitacore: {
    id: "vitacore",
    name: "VitaCore Health",
    initials: "VC",
    industry: "Salud",
    employeeCount: 800,
    departments: [
      "Medicina General",
      "Enfermería",
      "Farmacia",
      "Laboratorio",
      "Administración",
      "TI Salud",
      "Recursos Humanos",
      "Calidad",
      "Urgencias",
      "Investigación",
    ],
    theme: {
      "--primary": "#16A34A",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#F0FDF4",
      "--secondary-foreground": "#14532D",
      "--accent": "#0EA5E9",
      "--accent-foreground": "#FFFFFF",
      "--background": "#FFFFFF",
      "--foreground": "#14532D",
      "--card": "#FFFFFF",
      "--card-foreground": "#14532D",
      "--popover": "#FFFFFF",
      "--popover-foreground": "#14532D",
      "--muted": "#ECFDF5",
      "--muted-foreground": "#6B7280",
      "--destructive": "#DC2626",
      "--border": "#D1FAE5",
      "--input": "#D1FAE5",
      "--ring": "#16A34A",
      "--chart-1": "#16A34A",
      "--chart-2": "#0EA5E9",
      "--chart-3": "#14532D",
      "--chart-4": "#4ADE80",
      "--chart-5": "#64748B",
      "--sidebar": "#14532D",
      "--sidebar-foreground": "#FFFFFF",
      "--sidebar-primary": "#0EA5E9",
      "--sidebar-primary-foreground": "#FFFFFF",
      "--sidebar-accent": "#1E6B3D",
      "--sidebar-accent-foreground": "#FFFFFF",
      "--sidebar-border": "#28834D",
      "--sidebar-ring": "#0EA5E9",
    },
  },
};

export const COMPANY_IDS = Object.keys(COMPANIES) as CompanyId[];
export const DEFAULT_COMPANY_ID: CompanyId = "novatech";
