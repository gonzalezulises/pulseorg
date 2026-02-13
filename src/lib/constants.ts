// Constantes de la aplicación

// URL base de la API de clima organizacional
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://clima-api-pied.vercel.app";

// Endpoints de la API
export const API_ENDPOINTS = {
  // Health
  health: "/health",
  healthDetail: "/health/detail",
  healthDb: "/health/db",

  // Statistics
  dimensionStats: "/api/v1/statistics/dimensions",
  itemStats: "/api/v1/statistics/items",
  trends: "/api/v1/statistics/trends",
  alerts: "/api/v1/statistics/alerts",
  export: "/api/v1/statistics/export",

  // CRUD
  surveys: "/api/v1/surveys",
  items: "/api/v1/items",
  responses: "/api/v1/responses",
} as const;

// Configuración de React Query
export const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 30 * 60 * 1000, // 30 minutos
  refetchOnWindowFocus: false,
  retry: 2,
} as const;

// Años disponibles para análisis
export const AVAILABLE_YEARS = [2023, 2024, 2025, 2026] as const;

// Configuración del dashboard
export const DASHBOARD_CONFIG = {
  defaultYear: 2026,
  minResponsesForStats: 10,
  maxAlertsToShow: 10,
  chartColors: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    neutral: "#6b7280",
  },
} as const;

// Navegación del sidebar
export const NAVIGATION_ITEMS = [
  {
    title: "Panel General",
    href: "/dashboard",
    icon: "LayoutDashboard",
    description: "Vista general de métricas",
  },
  {
    title: "Indicadores",
    href: "/dimensions",
    icon: "Layers",
    description: "Análisis por indicador",
  },
  {
    title: "Tendencias",
    href: "/trends",
    icon: "TrendingUp",
    description: "Evolución temporal",
  },
  {
    title: "Alertas",
    href: "/alerts",
    icon: "Bell",
    description: "Items que requieren atención",
  },
  {
    title: "Exportar",
    href: "/export",
    icon: "Download",
    description: "Descargar datos",
  },
] as const;
