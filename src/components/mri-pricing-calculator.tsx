"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CheckCircle2, ChevronDown } from "lucide-react";

// ─── Inline Data ────────────────────────────────────────────────────────────

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

const ROI_BOOSTS = {
  rotation: { "addon-ona": 0.15, "addon-predictivo": 0.25 } as Record<string, number>,
  absenteeism: { "addon-sentimiento": 0.1 } as Record<string, number>,
  productivity: { "addon-taller": 0.1, "addon-transformacion": 0.2 } as Record<string, number>,
};

const IMPL_COSTS = [
  { name: "Capacitación de líderes", pct: 0.015, desc: "Programas de desarrollo de liderazgo basados en hallazgos" },
  { name: "Programas de desarrollo", pct: 0.01, desc: "Planes de carrera, mentoring, upskilling" },
  { name: "Iniciativas de bienestar", pct: 0.008, desc: "Programas de salud, flexibilidad, balance" },
  { name: "Mejora de comunicación interna", pct: 0.005, desc: "Herramientas, rituales, transparencia" },
  { name: "Sistema de reconocimiento", pct: 0.005, desc: "Programas formales e informales de reconocimiento" },
];

// ─── Hooks & Helpers ────────────────────────────────────────────────────────

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

function fmtCompact(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return fmt(v);
}

function tierMidpoint(tier: BaseTier): number {
  if (tier.maxSize === 999) return 750;
  return Math.round((tier.minSize + tier.maxSize) / 2 / 10) * 10;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const animated = useAnimatedValue(value);
  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {fmt(animated)}
    </span>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  scale,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  scale?: string;
}) {
  const [localStr, setLocalStr] = useState(String(value));
  useEffect(() => setLocalStr(String(value)), [value]);

  const commitLocal = () => {
    const v = Number(localStr);
    if (!isNaN(v)) {
      const clamped = Math.max(min, Math.min(max, Math.round(v / step) * step));
      onChange(clamped);
      setLocalStr(String(clamped));
    } else {
      setLocalStr(String(value));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-3">
        <Slider
          value={[value]}
          onValueChange={(vals) => onChange(vals[0])}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        <div className="flex items-center gap-1 shrink-0">
          {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
          <Input
            type="text"
            inputMode="numeric"
            value={localStr}
            onChange={(e) => setLocalStr(e.target.value)}
            onBlur={commitLocal}
            onKeyDown={(e) => e.key === "Enter" && commitLocal()}
            className="w-20 text-right text-sm"
            style={{ fontVariantNumeric: "tabular-nums" }}
          />
          {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
        </div>
      </div>
      {scale && <p className="text-[11px] text-muted-foreground">{scale}</p>}
    </div>
  );
}

function BenefitRow({
  emoji,
  label,
  value,
  pct,
  sublabel,
  boosted,
}: {
  emoji: string;
  label: string;
  value: number;
  pct: number;
  sublabel: string;
  boosted: boolean;
}) {
  const animatedVal = useAnimatedValue(value);
  return (
    <div
      className={`rounded-xl p-4 transition-colors duration-300 ${
        boosted ? "bg-primary/5 ring-1 ring-primary/20" : "bg-muted"
      }`}
    >
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-medium">
          {emoji} {label}
        </span>
        <span className="text-lg font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
          {fmt(animatedVal)}
        </span>
      </div>
      <Progress value={Math.max(pct, 2)} className="h-2" />
      <p className="text-xs text-muted-foreground mt-1.5">{sublabel}</p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface Props {
  ctaUrl: string;
}

export default function MRIPricingCalculator({ ctaUrl }: Props) {
  const [selectedTierId, setSelectedTierId] = useState(BASE_TIERS[0].id);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [rotation, setRotation] = useState(18);
  const [salary, setSalary] = useState(1200);
  const [headcount, setHeadcount] = useState(() => tierMidpoint(BASE_TIERS[0]));
  const [implOpen, setImplOpen] = useState(false);

  const selectedTier = BASE_TIERS.find((t) => t.id === selectedTierId) ?? BASE_TIERS[0];

  useEffect(() => {
    setHeadcount(tierMidpoint(selectedTier));
  }, [selectedTierId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── ROI ──
  const roi = useMemo(() => {
    const rotPct = rotation / 100;
    const salAnual = salary * 12;
    const payroll = headcount * salAnual;

    const salidasAnuales = headcount * rotPct;
    const costoPorSalida = salary * 6;
    const costoRotTotal = salidasAnuales * costoPorSalida;
    let redRotation = 0.2;
    for (const [id, boost] of Object.entries(ROI_BOOSTS.rotation)) {
      if (selectedAddons.has(id)) redRotation += boost;
    }
    const ahorroRotacion = costoRotTotal * redRotation;
    const salidasEvitadas = salidasAnuales * redRotation;

    const diasAusencia = 8;
    const costoDiario = salary / 22;
    const costoAusentTotal = headcount * diasAusencia * costoDiario;
    let redAusentismo = 0.15;
    for (const [id, boost] of Object.entries(ROI_BOOSTS.absenteeism)) {
      if (selectedAddons.has(id)) redAusentismo += boost;
    }
    const ahorroAusentismo = costoAusentTotal * redAusentismo;
    const diasRecuperados = Math.round(headcount * diasAusencia * redAusentismo);

    let incProductividad = 0.05;
    for (const [id, boost] of Object.entries(ROI_BOOSTS.productivity)) {
      if (selectedAddons.has(id)) incProductividad += boost;
    }
    const gananciaProductividad = payroll * incProductividad;

    const costoImpl = payroll * 0.043;
    const implItems = IMPL_COSTS.map((c) => ({ ...c, monto: payroll * c.pct }));

    const retornoBruto = ahorroRotacion + ahorroAusentismo + gananciaProductividad;
    const inversionTotal = inversionMRI + costoImpl;
    const retornoNeto = retornoBruto - inversionTotal;
    const roiMultiple = inversionTotal > 0 ? retornoBruto / inversionTotal : 0;

    const rotBoosted = Object.keys(ROI_BOOSTS.rotation).some((id) => selectedAddons.has(id));
    const absBoosted = Object.keys(ROI_BOOSTS.absenteeism).some((id) => selectedAddons.has(id));
    const prodBoosted = Object.keys(ROI_BOOSTS.productivity).some((id) => selectedAddons.has(id));

    return {
      ahorroRotacion, salidasEvitadas, ahorroAusentismo, diasRecuperados,
      gananciaProductividad, payroll, costoImpl, implItems,
      retornoBruto, inversionTotal, retornoNeto, roiMultiple,
      rotBoosted, absBoosted, prodBoosted,
    };
  }, [headcount, rotation, salary, selectedAddons, inversionMRI]);

  const benefits = useMemo(() => {
    const items = [
      { emoji: "\uD83D\uDCC9", label: "Reducción de rotación", value: roi.ahorroRotacion, sublabel: `~${roi.salidasEvitadas.toFixed(1)} salidas evitadas al año`, boosted: roi.rotBoosted },
      { emoji: "\uD83D\uDCCA", label: "Reducción de ausentismo", value: roi.ahorroAusentismo, sublabel: `~${roi.diasRecuperados} días productivos recuperados`, boosted: roi.absBoosted },
      { emoji: "\uD83D\uDCC8", label: "Ganancia por productividad", value: roi.gananciaProductividad, sublabel: `Sobre nómina anual de ${fmtCompact(roi.payroll)}`, boosted: roi.prodBoosted },
    ];
    const maxVal = Math.max(...items.map((i) => i.value), 1);
    return items.map((i) => ({ ...i, pct: (i.value / maxVal) * 100 }));
  }, [roi]);

  const roiColor = roi.roiMultiple > 5 ? "text-primary" : roi.roiMultiple >= 2 ? "text-yellow-500" : "text-muted-foreground";

  return (
    <div className="w-full">
      {/* Two-column layout */}
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

          {/* Total investment */}
          <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: "#1a3a2a" }}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-base font-semibold opacity-90">Inversión estimada</span>
              <AnimatedPrice value={inversionMRI} className="text-3xl font-bold" />
            </div>
            <div className="flex items-baseline justify-between">
              <span />
              <span className="text-sm opacity-70">USD</span>
            </div>
            {addonsTotal > 0 && (
              <p className="text-sm opacity-60 mt-2">
                Base {fmt(selectedTier.price)} + Add-ons {fmt(addonsTotal)}
              </p>
            )}
          </div>
        </div>

        {/* ═══ RIGHT: ROI Calculator ═══ */}
        <div className="space-y-6">
          {/* Sliders */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Retorno esperado
            </h3>
            <SliderRow
              label="Rotación anual (%)"
              value={rotation}
              onChange={setRotation}
              min={5}
              max={40}
              step={1}
              suffix="%"
              scale="5% — Baja | 15% — Promedio | 25% — Alta | 40% — Crítica"
            />
            <SliderRow
              label="Salario mensual promedio (USD)"
              value={salary}
              onChange={setSalary}
              min={600}
              max={5000}
              step={50}
              prefix="$"
              scale="$800 — Operativo | $1,500 — Profesional | $3,000 — Gerencial"
            />
            <SliderRow
              label="Colaboradores en la organización"
              value={headcount}
              onChange={setHeadcount}
              min={50}
              max={1000}
              step={10}
            />
          </div>

          {/* Benefit bars */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Beneficios proyectados
            </h3>
            {benefits.map((b) => (
              <BenefitRow key={b.label} {...b} />
            ))}
          </div>

          {/* Implementation costs (collapsible) */}
          <Collapsible open={implOpen} onOpenChange={setImplOpen}>
            <div className="border rounded-xl overflow-hidden">
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Inversión en implementación</span>
                  <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    Estimado
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${implOpen ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <p className="text-[11px] text-muted-foreground mb-3">
                    Para materializar el retorno, la organización típicamente invierte en programas de mejora.
                    Costos estimados como % de nómina anual:
                  </p>
                  <div className="space-y-2">
                    {roi.implItems.map((item) => (
                      <div key={item.name} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {fmtCompact(item.monto)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{(item.pct * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex items-baseline justify-between">
                    <span className="text-sm font-semibold">Subtotal implementación</span>
                    <AnimatedPrice value={roi.costoImpl} className="text-sm font-bold" />
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* ROI result */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1a3a2a" }}>
            <div className="p-6 text-white">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[11px] uppercase tracking-wide opacity-60 mb-1">Retorno bruto</p>
                  <AnimatedPrice value={roi.retornoBruto} className="text-lg font-bold" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide opacity-60 mb-1">Inversión total</p>
                  <AnimatedPrice value={roi.inversionTotal} className="text-lg font-bold opacity-80" />
                  <p className="text-[10px] opacity-50 mt-0.5">MRI + implementación</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide opacity-60 mb-1">ROI</p>
                  <p className={`text-lg font-bold ${roiColor}`} style={{ fontVariantNumeric: "tabular-nums" }}>
                    {roi.roiMultiple.toFixed(1)}x
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="rounded-xl p-4" style={{ backgroundColor: "#142e22" }}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-white/70">Retorno neto</span>
                  <AnimatedPrice value={roi.retornoNeto} className="text-xl font-bold text-[#34A856]" />
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-2">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3.5 px-6 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center"
            >
              Agendar sesión diagnóstica (30 min)
            </a>
            <p className="text-xs text-muted-foreground">
              Sin compromiso · Conversación exploratoria gratuita
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-muted rounded-xl p-4">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground/70">Nota metodológica:</strong>{" "}
              Proyecciones basadas en promedios de industria (SHRM 2022, Gallup 2023, OIT Latinoamérica).
              Supuestos conservadores: reducción de rotación 20%, ausentismo 15%, productividad 5% —
              incrementados por add-ons seleccionados. Los resultados reales dependen de la implementación
              de las intervenciones recomendadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
