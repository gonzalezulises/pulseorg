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

// Rizoma shared base — warm off-white background, dark neutral sidebar
const RIZOMA_BASE = {
  "--background": "#F0EDE5",
  "--foreground": "#151414",
  "--card": "#FFFFFF",
  "--card-foreground": "#151414",
  "--popover": "#FFFFFF",
  "--popover-foreground": "#151414",
  "--muted": "#F9FAFB",
  "--muted-foreground": "#5F5F5F",
  "--destructive": "#C32421",
  "--border": "#D7D7D7",
  "--input": "#D7D7D7",
  "--sidebar": "#151414",
  "--sidebar-foreground": "#F9FAFB",
  "--sidebar-primary-foreground": "#FFFFFF",
  "--sidebar-accent": "#2d2d2d",
  "--sidebar-accent-foreground": "#F9FAFB",
  "--sidebar-border": "#383838",
} as const;

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
      ...RIZOMA_BASE,
      "--primary": "#289448",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#E8F5EC",
      "--secondary-foreground": "#1F7038",
      "--accent": "#1FACC0",
      "--accent-foreground": "#FFFFFF",
      "--ring": "#289448",
      "--chart-1": "#289448",
      "--chart-2": "#1FACC0",
      "--chart-3": "#2b5672",
      "--chart-4": "#4CAF6A",
      "--chart-5": "#767574",
      "--sidebar-primary": "#289448",
      "--sidebar-ring": "#289448",
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
      ...RIZOMA_BASE,
      "--primary": "#C32421",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#FDECEA",
      "--secondary-foreground": "#9C1D1A",
      "--accent": "#289448",
      "--accent-foreground": "#FFFFFF",
      "--ring": "#C32421",
      "--chart-1": "#C32421",
      "--chart-2": "#289448",
      "--chart-3": "#2b5672",
      "--chart-4": "#D94744",
      "--chart-5": "#767574",
      "--sidebar-primary": "#C32421",
      "--sidebar-ring": "#C32421",
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
      ...RIZOMA_BASE,
      "--primary": "#2b5672",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#E8F0F5",
      "--secondary-foreground": "#1A3A4F",
      "--accent": "#289448",
      "--accent-foreground": "#FFFFFF",
      "--ring": "#2b5672",
      "--chart-1": "#2b5672",
      "--chart-2": "#289448",
      "--chart-3": "#1FACC0",
      "--chart-4": "#116dff",
      "--chart-5": "#767574",
      "--sidebar-primary": "#2b5672",
      "--sidebar-ring": "#2b5672",
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
      ...RIZOMA_BASE,
      "--primary": "#1FACC0",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#E6F7FA",
      "--secondary-foreground": "#178A9A",
      "--accent": "#289448",
      "--accent-foreground": "#FFFFFF",
      "--ring": "#1FACC0",
      "--chart-1": "#1FACC0",
      "--chart-2": "#289448",
      "--chart-3": "#2b5672",
      "--chart-4": "#3FC5D6",
      "--chart-5": "#767574",
      "--sidebar-primary": "#1FACC0",
      "--sidebar-ring": "#1FACC0",
    },
  },
};

export const COMPANY_IDS = Object.keys(COMPANIES) as CompanyId[];
export const DEFAULT_COMPANY_ID: CompanyId = "novatech";
