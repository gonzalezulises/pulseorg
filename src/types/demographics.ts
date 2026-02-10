// Tipos para datos demográficos y ficha técnica

// Ficha técnica
export interface FichaTecnica {
  population_n: number;
  sample_n: number;
  response_rate: number;
  margin_of_error: number;
  confidence_level: number;
}

// Datos demográficos
export interface DemographicsData {
  departments: Record<string, number>;
  genders: Record<string, number>;
  tenures: Record<string, number>;
  generations: Record<string, number>;
}

// eNPS
export interface ENPSData {
  enps: number;
  promoters_n?: number;
  promoters_pct?: number;
  passives_n?: number;
  passives_pct?: number;
  detractors_n?: number;
  detractors_pct?: number;
}

// Item evaluado (Top/Bottom)
export interface EvaluatedItem {
  item: string;
  question: string;
  avg_score: number;
  favorability: number;
  n: number;
}

// Datos de un año demográfico
export interface YearDemographicsData {
  year: number;
  ficha_tecnica: FichaTecnica;
  demographics: DemographicsData;
  enps: ENPSData;
  top_5_items: EvaluatedItem[];
  bottom_5_items: EvaluatedItem[];
}

// Estructura completa del JSON de demografía
export interface DemographicsJSON {
  generated_at: string;
  model_version: string;
  years: Record<string, YearDemographicsData>;
}

// Labels para género
export const GENDER_LABELS: Record<string, string> = {
  Masculino: "Masculino",
  Femenino: "Femenino",
  Otro: "Otro / No binario",
  "Sin especificar": "Sin especificar",
};

// Colores para género
export const GENDER_COLORS: Record<string, string> = {
  Masculino: "#0052CC",    // Azul corporativo
  Femenino: "#00B4D8",     // Cyan
  Otro: "#1dc47c",         // Verde
  "Sin especificar": "#94A3B8",
};

// Labels para antigüedad
export const TENURE_LABELS: Record<string, string> = {
  "<1 año": "Menos de 1 año",
  "1-3 años": "1 a 3 años",
  "3-5 años": "3 a 5 años",
  "5-7 años": "5 a 7 años",
  ">7 años": "Más de 7 años",
  "Sin especificar": "Sin especificar",
};

// Orden de antigüedad
export const TENURE_ORDER = ["<1 año", "1-3 años", "3-5 años", "5-7 años", ">7 años", "Sin especificar"];

// Colores para antigüedad - Gradiente
export const TENURE_COLORS: Record<string, string> = {
  "<1 año": "#1dc47c",      // Verde claro (nuevos)
  "1-3 años": "#00B4D8",    // Cyan
  "3-5 años": "#0052CC",    // Azul corporativo
  "5-7 años": "#003D99",    // Azul oscuro
  ">7 años": "#001E50",     // Navy
  "Sin especificar": "#94A3B8",
};

// Labels para generación
export const GENERATION_LABELS: Record<string, string> = {
  "Gen Z / Nuevos": "Gen Z",
  "Millennials Recientes": "Millennials Jr",
  Millennials: "Millennials",
  "Gen X / Senior": "Gen X",
  Veteranos: "Veteranos",
  "Sin especificar": "Sin especificar",
};

// Colores para generación
export const GENERATION_COLORS: Record<string, string> = {
  "Gen Z / Nuevos": "#1dc47c",
  "Millennials Recientes": "#00B4D8",
  Millennials: "#0052CC",
  "Gen X / Senior": "#003D99",
  Veteranos: "#001E50",
  "Sin especificar": "#94A3B8",
};

// Colores para departamentos (dinámico)
export const DEPARTMENT_COLORS = [
  "#0052CC", "#00B4D8", "#001E50", "#1dc47c", "#003D99",
  "#0066FF", "#00D4FF", "#004080", "#33FF99", "#0080FF",
  "#1E90FF", "#00CED1", "#191970", "#98FB98", "#4169E1",
];

// Helper para obtener color de departamento
export function getDepartmentColor(index: number): string {
  return DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length];
}

// Helper para calcular margen de error (cliente)
export function calculateMarginOfError(N: number, n: number, confidenceLevel: number = 0.95): number {
  const z = confidenceLevel === 0.95 ? 1.96 : 2.576;
  const p = 0.5;

  if (n === 0 || N === 0) return 0;

  if (n >= N) {
    // Muestra >= población
    const margin = z * Math.sqrt(p * (1 - p) / n);
    return Math.round(margin * 1000) / 10; // Porcentaje con 1 decimal
  }

  // Factor de corrección para población finita
  const fpc = (N - n) / (N - 1);
  const margin = z * Math.sqrt((p * (1 - p) / n) * fpc);

  return Math.round(margin * 1000) / 10;
}

// Helper para convertir objeto a array ordenado para gráficos
export function objectToChartData(
  data: Record<string, number>,
  labelMap?: Record<string, string>,
  colorMap?: Record<string, string>
): { name: string; value: number; label: string; color: string }[] {
  return Object.entries(data)
    .filter(([key]) => key !== "Sin especificar")
    .map(([key, value], index) => ({
      name: key,
      value,
      label: labelMap?.[key] || key,
      color: colorMap?.[key] || getDepartmentColor(index),
    }))
    .sort((a, b) => b.value - a.value);
}
