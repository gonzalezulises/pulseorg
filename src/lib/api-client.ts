// Cliente HTTP para clima-api
import { API_BASE_URL, API_ENDPOINTS } from "./constants";
import type {
  DimensionStatistics,
  ItemStatistics,
  LongitudinalTrend,
  Alert,
  HealthResponse,
  HealthDetailResponse,
  DimensionStatsParams,
  TrendsParams,
  AlertsParams,
  ItemStatsParams,
  ExportParams,
} from "@/types/api";

// Error personalizado para errores de API
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Tipo genérico para parámetros de consulta
type QueryParams = Record<string, string | number | boolean | undefined>;

// Función helper para hacer peticiones
async function fetchApi<T>(
  endpoint: string,
  params?: QueryParams
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  // Agregar query params
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Error ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

// Cliente API
export const apiClient = {
  // Health
  health: {
    // Verificar estado básico
    check: () => fetchApi<HealthResponse>(API_ENDPOINTS.health),

    // Obtener detalles de salud
    detail: () => fetchApi<HealthDetailResponse>(API_ENDPOINTS.healthDetail),
  },

  // Statistics
  statistics: {
    // Obtener estadísticas por dimensión
    dimensions: (params?: DimensionStatsParams) =>
      fetchApi<DimensionStatistics[]>(API_ENDPOINTS.dimensionStats, params as QueryParams),

    // Obtener estadísticas por item
    items: (params?: ItemStatsParams) =>
      fetchApi<ItemStatistics[]>(API_ENDPOINTS.itemStats, params as QueryParams),

    // Obtener tendencias longitudinales
    trends: (params?: TrendsParams) =>
      fetchApi<LongitudinalTrend[]>(API_ENDPOINTS.trends, params as QueryParams),

    // Obtener alertas
    alerts: (params?: AlertsParams) =>
      fetchApi<Alert[]>(API_ENDPOINTS.alerts, params as QueryParams),

    // Exportar datos (retorna blob)
    export: async (params: ExportParams): Promise<Blob> => {
      const url = new URL(`${API_BASE_URL}${API_ENDPOINTS.export}`);

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new ApiError(
          response.status,
          `Error ${response.status}: ${response.statusText}`
        );
      }

      return response.blob();
    },
  },
};

// Helper para descargar archivo exportado
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
