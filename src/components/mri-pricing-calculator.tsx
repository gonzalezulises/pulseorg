"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { CheckCircle2 } from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

interface BaseTier {
  id: string;
  range: string;
  minSize: number;
  maxSize: number;
  price: number;
  description: string;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  priceLabel?: string;
  description: string;
}

const BASE_TIERS: BaseTier[] = [
  { id: "mri-50-100", range: "50 – 100", minSize: 50, maxSize: 100, price: 3500, description: "Muestra pequeña, ~5-8 entrevistas. Ideal para startups y equipos enfocados." },
  { id: "mri-101-200", range: "101 – 200", minSize: 101, maxSize: 200, price: 4500, description: "Muestra robusta, ~10-15 entrevistas. Segmentación por área y antigüedad." },
  { id: "mri-201-350", range: "201 – 350", minSize: 201, maxSize: 350, price: 5500, description: "Segmentación real por área. ~15-20 entrevistas. Múltiples cortes demográficos." },
  { id: "mri-351-500", range: "351 – 500", minSize: 351, maxSize: 500, price: 6500, description: "Múltiples unidades de negocio. Complejidad de coordinación." },
  { id: "mri-500-plus", range: "500+", minSize: 501, maxSize: 999, price: 7500, description: "Punto de partida. Se ajusta según estructura y geografía." },
];

const ADDONS: Addon[] = [
  { id: "addon-ona", name: "Análisis de Redes (ONA)", price: 3500, description: "Mapeo de redes informales de influencia y colaboración." },
  { id: "addon-predictivo", name: "Modelo Predictivo de Rotación", price: 2500, description: "Variables predictoras de rotación voluntaria. Score de riesgo por segmento." },
  { id: "addon-comparativa", name: "Comparativa Sectorial", price: 1500, description: "Posicionamiento de indicadores vs sector en la región." },
  { id: "addon-taller", name: "Taller con Equipo Directivo", price: 2500, description: "Medio día facilitado con C-suite. Interpretar hallazgos, priorizar." },
  { id: "addon-sentimiento", name: "Análisis de Sentimiento", price: 3000, description: "NLP sobre comunicaciones internas. Tono, temas emergentes." },
  { id: "addon-transformacion", name: "Plan de Transformación", price: 3000, description: "Hoja de ruta a 6 meses con hitos, responsables y métricas." },
  { id: "addon-multi", name: "Multi-unidad / Multi-país", price: 4000, priceLabel: "$4,000+", description: "Extensión a múltiples sedes o países." },
];

const BASE_FEATURES = [
  "Encuesta validada (17 indicadores)",
  "Entrevistas con líderes clave",
  "Informe ejecutivo cuantificado",
  "Sesión de presentación (60 min)",
  "Resumen de fortalezas y alertas",
];

const ADDON_ROI_BADGES: Record<string, string> = {
  "addon-ona": "\u2197 +15% precisión en rotación",
  "addon-predictivo": "\u2197 +25% efectividad en retención",
  "addon-taller": "\u2197 +10% impacto en productividad",
  "addon-sentimiento": "\u2197 +10% reducción de ausentismo",
  "addon-transformacion": "\u2197 +20% impacto en productividad",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function useAnimatedValue(target: number, duration = 600): number {
  const [display, setDisplay] = useState(target);
  const currentRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = currentRef.current;
    if (Math.abs(from - target) < 1) {
      currentRef.current = target;
      setDisplay(target);
      return;
    }
    const startTime = performance.now();
    cancelAnimationFrame(rafRef.current);

    function step(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (target - from) * eased;
      currentRef.current = value;
      setDisplay(Math.round(value));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

function fmt(v: number): string {
  return `$${v.toLocaleString("en-US")}`;
}

function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const animated = useAnimatedValue(value);
  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {fmt(animated)}
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface Props {
  ctaUrl: string;
}

export default function MRIPricingCalculator({ ctaUrl }: Props) {
  const [selectedTierId, setSelectedTierId] = useState(BASE_TIERS[0].id);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  const selectedTier = BASE_TIERS.find((t) => t.id === selectedTierId) ?? BASE_TIERS[0];

  const toggleAddon = useCallback((id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Investment ──
  const addonsTotal = useMemo(
    () => ADDONS.reduce((s, a) => s + (selectedAddons.has(a.id) ? a.price : 0), 0),
    [selectedAddons],
  );
  const inversionMRI = selectedTier.price + addonsTotal;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ═══ LEFT: Investment configurator ═══ */}
        <div className="space-y-6">
          {/* Tier selector */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              1. Colaboradores
            </h3>
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
              {BASE_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    selectedTierId === tier.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-foreground border border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {tier.range}
                </button>
              ))}
            </div>

            {/* Base card */}
            <div className="mt-4 p-4 bg-muted rounded-xl border">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium">Diagnóstico base</span>
                <span className="text-2xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {fmt(selectedTier.price)} <span className="text-sm font-normal text-muted-foreground">USD</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{selectedTier.description}</p>
              <ul className="space-y-1.5">
                {BASE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              2. Análisis adicionales <span className="font-normal normal-case">(opcional)</span>
            </h3>
            <div className="space-y-2">
              {ADDONS.map((addon) => {
                const selected = selectedAddons.has(addon.id);
                const badge = ADDON_ROI_BADGES[addon.id];
                return (
                  <label
                    key={addon.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleAddon(addon.id)}
                      className="mt-1 h-4 w-4 rounded accent-[var(--primary)]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium">{addon.name}</span>
                        <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                          +{addon.priceLabel ?? fmt(addon.price)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{addon.description}</p>
                      {selected && badge && (
                        <span className="inline-block mt-1.5 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {badge}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Summary + CTA ═══ */}
        <div className="space-y-6 lg:sticky lg:top-12 lg:self-start">
          {/* Investment card */}
          <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: "#1a3a2a" }}>
            <p className="text-sm opacity-60 mb-1">Inversión estimada</p>
            <div className="flex items-baseline gap-2">
              <AnimatedPrice value={inversionMRI} className="text-4xl font-bold" />
              <span className="text-sm opacity-60">USD</span>
            </div>
            {addonsTotal > 0 && (
              <p className="text-sm opacity-50 mt-2">
                Base {fmt(selectedTier.price)} + Add-ons {fmt(addonsTotal)}
              </p>
            )}
          </div>

          {/* Benefits card */}
          <div className="rounded-2xl border p-6">
            <p className="text-sm font-semibold mb-4">Qué incluye tu diagnóstico</p>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Diagnóstico cuantificado de 17 indicadores de clima</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Entrevistas con líderes clave de tu organización</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Informe ejecutivo con fortalezas, alertas y plan de acción</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Sesión de presentación con equipo directivo (60 min)</span>
              </li>
              {selectedAddons.has("addon-ona") && (
                <li className="flex items-start gap-2 text-sm text-primary animate-in fade-in slide-in-from-top-1 duration-200">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Mapa de redes informales de influencia y colaboración</span>
                </li>
              )}
              {selectedAddons.has("addon-predictivo") && (
                <li className="flex items-start gap-2 text-sm text-primary animate-in fade-in slide-in-from-top-1 duration-200">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Score de riesgo de rotación por segmento</span>
                </li>
              )}
              {selectedAddons.has("addon-comparativa") && (
                <li className="flex items-start gap-2 text-sm text-primary animate-in fade-in slide-in-from-top-1 duration-200">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Posicionamiento de tus indicadores vs tu sector</span>
                </li>
              )}
              {selectedAddons.has("addon-taller") && (
                <li className="flex items-start gap-2 text-sm text-primary animate-in fade-in slide-in-from-top-1 duration-200">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Taller facilitado de medio día con C-suite</span>
                </li>
              )}
              {selectedAddons.has("addon-sentimiento") && (
                <li className="flex items-start gap-2 text-sm text-primary animate-in fade-in slide-in-from-top-1 duration-200">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Análisis de sentimiento en comunicaciones internas</span>
                </li>
              )}
              {selectedAddons.has("addon-transformacion") && (
                <li className="flex items-start gap-2 text-sm text-primary animate-in fade-in slide-in-from-top-1 duration-200">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Hoja de ruta de transformación a 6 meses</span>
                </li>
              )}
              {selectedAddons.has("addon-multi") && (
                <li className="flex items-start gap-2 text-sm text-primary animate-in fade-in slide-in-from-top-1 duration-200">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Extensión a múltiples sedes o países</span>
                </li>
              )}
            </ul>
          </div>

          {/* CTA */}
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3.5 px-6 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center"
          >
            Agendar sesión diagnóstica (30 min)
          </a>
          <p className="text-xs text-muted-foreground text-center">
            Sin compromiso · Conversación exploratoria gratuita
          </p>
        </div>
      </div>
    </div>
  );
}
