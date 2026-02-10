"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarRange,
  Layers,
  BarChart3,
  Users,
  CheckCircle2,
} from "lucide-react";
import {
  SEGMENT_COLORS,
  getSegmentLabel,
  type SegmentType,
} from "@/types/clima-v2";

// 17 dimensiones agrupadas por categoría
const DIMENSIONS = [
  {
    category: "Bienestar",
    color: "bg-emerald-100 text-emerald-800",
    items: [
      { name: "Orgullo Institucional", description: "Sentido de pertenencia y orgullo de formar parte de la organización." },
      { name: "Propósito del Trabajo", description: "Conexión entre las tareas diarias y un propósito significativo." },
      { name: "Seguridad Física", description: "Percepción de un entorno laboral seguro y protegido." },
      { name: "Balance Vida-Trabajo", description: "Equilibrio entre las demandas laborales y la vida personal." },
      { name: "Cuidado Mutuo", description: "Grado de preocupación y apoyo entre compañeros de trabajo." },
    ],
  },
  {
    category: "Liderazgo",
    color: "bg-blue-100 text-blue-800",
    items: [
      { name: "Liderazgo Efectivo", description: "Calidad de la dirección, comunicación y apoyo de los líderes." },
      { name: "Autonomía", description: "Libertad para tomar decisiones y organizar el propio trabajo." },
      { name: "Comunicación Interna", description: "Fluidez, transparencia y oportunidad de la información organizacional." },
      { name: "Confianza Institucional", description: "Credibilidad en las decisiones y dirección estratégica de la empresa." },
    ],
  },
  {
    category: "Compensación",
    color: "bg-amber-100 text-amber-800",
    items: [
      { name: "Compensación", description: "Percepción de justicia y competitividad del salario y beneficios." },
      { name: "Reconocimiento", description: "Valoración y agradecimiento por el desempeño y las contribuciones." },
      { name: "Beneficios Exclusivos", description: "Acceso a programas y ventajas diferenciadas para los colaboradores." },
      { name: "Equidad en Ascensos", description: "Transparencia y justicia en los procesos de promoción interna." },
    ],
  },
  {
    category: "Cultura",
    color: "bg-purple-100 text-purple-800",
    items: [
      { name: "Cohesión de Equipo", description: "Trabajo colaborativo, confianza y sentido de unidad en los equipos." },
      { name: "Innovación y Cambio", description: "Apertura a nuevas ideas y capacidad de adaptación organizacional." },
      { name: "Resultados y Logros", description: "Orientación hacia metas claras y celebración de los resultados." },
      { name: "Desarrollo Profesional", description: "Oportunidades de crecimiento, capacitación y plan de carrera." },
    ],
  },
];

// Escala de clasificación con rangos
const CLASSIFICATION_SCALE: { segment: SegmentType; range: string }[] = [
  { segment: "fortaleza_excepcional", range: "90 – 100" },
  { segment: "fortaleza_solida", range: "80 – 89" },
  { segment: "aceptable", range: "70 – 79" },
  { segment: "atencion", range: "60 – 69" },
  { segment: "crisis", range: "< 60" },
];

const CAPABILITIES = [
  "Segmentación demográfica por género, antigüedad y departamento",
  "Análisis predictivo con proyección a 12 meses",
  "Correlaciones entre las 17 dimensiones de clima",
  "Text mining sobre comentarios abiertos de colaboradores",
  "Heatmaps de dimensiones por departamento",
  "Módulo de reconocimiento con red de interacciones",
  "Exportación de reportes en PDF y Excel",
];

export default function InstrumentoPage() {
  return (
    <>
      <Header
        title="Acerca del Instrumento"
        showYearSelector={false}
        showFilters={false}
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Section 1: Capacidades Principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <CalendarRange className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">2023–2026</p>
                <p className="text-sm text-muted-foreground">Análisis multi-año</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">17</p>
                <p className="text-sm text-muted-foreground">Dimensiones de clima</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Niveles de clasificación</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">Perfiles de engagement</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Las 17 Dimensiones */}
        <Card>
          <CardHeader>
            <CardTitle>Las 17 Dimensiones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {DIMENSIONS.map((group) => (
              <div key={group.category}>
                <Badge className={`mb-3 ${group.color}`} variant="secondary">
                  {group.category}
                </Badge>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((dim) => (
                    <div
                      key={dim.name}
                      className="rounded-lg border p-3"
                    >
                      <p className="font-medium text-sm">{dim.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dim.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section 3: Escala de Clasificación */}
        <Card>
          <CardHeader>
            <CardTitle>Escala de Clasificación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:rounded-lg sm:overflow-hidden sm:border">
              {CLASSIFICATION_SCALE.map((item) => (
                <div
                  key={item.segment}
                  className="flex flex-1 items-center justify-between gap-2 rounded-lg sm:rounded-none border sm:border-0 sm:border-r last:sm:border-r-0 p-4"
                  style={{ borderLeftColor: SEGMENT_COLORS[item.segment], borderLeftWidth: 4 }}
                >
                  <div>
                    <p className="font-medium text-sm">{getSegmentLabel(item.segment)}</p>
                    <p className="text-xs text-muted-foreground">{item.range}</p>
                  </div>
                  <div
                    className="h-4 w-4 rounded-full shrink-0"
                    style={{ backgroundColor: SEGMENT_COLORS[item.segment] }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Fortalezas del Instrumento */}
        <Card>
          <CardHeader>
            <CardTitle>Fortalezas del Instrumento</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {CAPABILITIES.map((cap) => (
                <li key={cap} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{cap}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
