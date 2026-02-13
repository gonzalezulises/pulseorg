"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MRIPricingCalculator from "@/components/mri-pricing-calculator";
import {
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Building2,
  Send,
  BarChart3,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";

type Slide = 0 | 1 | 2;

export default function Home() {
  const [slide, setSlide] = useState<Slide>(0);

  const goNext = useCallback(
    () => setSlide((s) => Math.min(s + 1, 2) as Slide),
    [],
  );
  const goPrev = useCallback(
    () => setSlide((s) => Math.max(s - 1, 0) as Slide),
    [],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" && slide < 2) goNext();
      if (e.key === "ArrowLeft" && slide > 0) goPrev();
      if (e.key === "Enter" && slide === 2) {
        window.location.href = "/dashboard";
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slide, goNext, goPrev]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <div className="flex-1 relative">
        {/* Slide 0 — Qué es */}
        <div
          className="absolute inset-0 transition-all duration-300 ease-in-out overflow-y-auto"
          style={{
            opacity: slide === 0 ? 1 : 0,
            transform: slide === 0 ? "translateX(0)" : "translateX(-100%)",
            pointerEvents: slide === 0 ? "auto" : "none",
          }}
        >
          <div className="min-h-full flex flex-col px-6 py-12 md:py-16">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
              {/* Logo + Badge */}
              <div className="text-center mb-10 space-y-4">
                <a href="https://www.rizo.ma" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/images/brand/logo-plenos-color.png"
                    alt="Rizoma"
                    width={160}
                    height={77}
                    className="mx-auto"
                    priority
                  />
                </a>
                <Badge variant="secondary" className="text-sm">
                  MRI · Diagnóstico de Clima Organizacional
                </Badge>
              </div>

              {/* Bloque 1: Qué es */}
              <div className="text-center mb-14">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                  La radiografía completa de tu clima organizacional
                </h1>
                <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  El MRI mide 17 indicadores clave de clima a través de una encuesta
                  breve y anónima. Transforma las respuestas de tu equipo en un
                  diagnóstico visual, segmentado y accionable — en tiempo real.
                </p>
              </div>

              {/* Bloque 2: Por qué te importa */}
              <div className="mb-14">
                <h2 className="text-xl md:text-2xl font-semibold text-center mb-8">
                  ¿Por qué necesitas medir el clima?
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      number: "67%",
                      text: "de las empresas en Latinoamérica no mide su clima organizacional de forma sistemática",
                    },
                    {
                      number: "25%",
                      text: "de reducción en rotación voluntaria en empresas que miden y actúan sobre su clima",
                    },
                    {
                      number: "3x",
                      text: "más probabilidad de retener talento clave cuando los indicadores de compromiso están en zona saludable",
                    },
                  ].map((item) => (
                    <Card key={item.number}>
                      <CardContent className="pt-6 text-center">
                        <p className="text-4xl md:text-5xl font-bold text-primary">
                          {item.number}
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {item.text}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Bloque 3: Qué podrás hacer */}
              <div className="mb-14">
                <h2 className="text-xl md:text-2xl font-semibold text-center mb-8">
                  ¿Qué podrás hacer con los resultados?
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      icon: Target,
                      title: "Identificar focos críticos",
                      text: "Saber exactamente qué áreas y equipos requieren intervención urgente",
                    },
                    {
                      icon: TrendingUp,
                      title: "Medir el impacto de tus decisiones",
                      text: "Comparar resultados año a año y ver si las acciones funcionaron",
                    },
                    {
                      icon: Users,
                      title: "Entender a tu gente por segmento",
                      text: "Ver diferencias por departamento, antigüedad y perfil de compromiso",
                    },
                    {
                      icon: AlertTriangle,
                      title: "Anticipar riesgos antes de que escalen",
                      text: "Recibir alertas tempranas de deterioro en indicadores clave",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                    >
                      <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones + dots */}
              <div className="mt-auto text-center space-y-6 pb-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button size="lg" className="text-base" onClick={goNext}>
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button asChild variant="ghost" size="lg" className="text-base text-muted-foreground">
                    <Link href="/dashboard">
                      Ir directo al demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <Dots active={0} />
              </div>
            </div>
          </div>
        </div>

        {/* Slide 1 — Así de simple funciona */}
        <div
          className="absolute inset-0 transition-all duration-300 ease-in-out overflow-y-auto"
          style={{
            opacity: slide === 1 ? 1 : 0,
            transform:
              slide === 1
                ? "translateX(0)"
                : slide === 0
                  ? "translateX(100%)"
                  : "translateX(-100%)",
            pointerEvents: slide === 1 ? "auto" : "none",
          }}
        >
          <div className="min-h-full flex flex-col px-6 py-12 md:py-16">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
              {/* Título */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-14">
                Así de simple funciona
              </h1>

              {/* Timeline / Steps */}
              <div className="mb-14">
                {/* Desktop: horizontal */}
                <div className="hidden md:grid md:grid-cols-4 gap-0">
                  {STEPS.map((step, i) => (
                    <div key={step.title} className="flex flex-col items-center text-center px-3">
                      {/* Circle + connector */}
                      <div className="flex items-center w-full mb-4">
                        <div className={`flex-1 h-0.5 ${i === 0 ? "bg-transparent" : "bg-border"}`} />
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                          {i + 1}
                        </div>
                        <div className={`flex-1 h-0.5 ${i === STEPS.length - 1 ? "bg-transparent" : "bg-border"}`} />
                      </div>
                      <step.icon className="h-6 w-6 text-primary mb-3" />
                      <p className="font-semibold text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground mt-2">{step.description}</p>
                    </div>
                  ))}
                </div>

                {/* Mobile: vertical */}
                <div className="md:hidden space-y-6">
                  {STEPS.map((step, i) => (
                    <div key={step.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                          {i + 1}
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2" />
                        )}
                      </div>
                      <div className="pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <step.icon className="h-4 w-4 text-primary" />
                          <p className="font-semibold text-sm">{step.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qué incluye esta demostración */}
              <div className="rounded-lg bg-muted/30 border p-6 md:p-8 mb-14">
                <h3 className="font-semibold text-base mb-4">
                  ¿Qué incluye esta demostración?
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Esta demostración incluye datos simulados para que explores todas
                  las capacidades de la plataforma:
                </p>
                <ul className="space-y-3">
                  {[
                    "4 empresas de diferentes industrias (tecnología, retail, finanzas, salud)",
                    "4 años de datos históricos (2023–2026)",
                    "Análisis completo: tendencias, segmentación, correlaciones, predicciones y análisis de texto",
                    "Interfaz idéntica al producto real",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botones + dots */}
              <div className="mt-auto text-center space-y-6 pb-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button size="lg" className="text-base" onClick={goNext}>
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button asChild variant="ghost" size="lg" className="text-base text-muted-foreground">
                    <Link href="/dashboard">
                      Explorar la demostración
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="text-base text-muted-foreground" onClick={goPrev}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                  </Button>
                </div>
                <Dots active={1} />
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2 — Inversión y retorno */}
        <div
          className="absolute inset-0 transition-all duration-300 ease-in-out overflow-y-auto"
          style={{
            opacity: slide === 2 ? 1 : 0,
            transform: slide === 2 ? "translateX(0)" : "translateX(100%)",
            pointerEvents: slide === 2 ? "auto" : "none",
          }}
        >
          <div className="min-h-full flex flex-col px-6 py-12 md:py-16">
            <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
              {/* Título */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-4">
                Inversión y retorno
              </h1>
              <p className="text-base text-muted-foreground text-center max-w-2xl mx-auto mb-10">
                Configura tu diagnóstico a medida y proyecta el retorno sobre la inversión
              </p>

              {/* Calculator */}
              <div className="mb-14">
                <MRIPricingCalculator ctaUrl="https://www.rizo.ma/agendar" />
              </div>

              {/* Botones + dots */}
              <div className="mt-auto text-center space-y-6 pb-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button asChild size="lg" className="text-base">
                    <Link href="/dashboard">
                      Explorar la demostración
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="text-base text-muted-foreground" onClick={goPrev}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                  </Button>
                </div>
                <Dots active={2} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-6 text-center relative z-10">
        <p className="text-xs text-muted-foreground">
          © 2026 MRI · Rizoma ·{" "}
          <a
            href="https://www.rizo.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            rizo.ma
          </a>
        </p>
      </footer>
    </div>
  );
}

const STEPS = [
  {
    icon: Building2,
    title: "Configuramos tu empresa",
    description:
      "Ajustamos departamentos, demografía y estructura organizacional junto contigo.",
  },
  {
    icon: Send,
    title: "Lanzamos la encuesta",
    description:
      "Cada colaborador recibe un enlace único y anónimo. Responde en menos de 10 minutos.",
  },
  {
    icon: BarChart3,
    title: "Visualiza los resultados",
    description:
      "17 indicadores con cortes por área, antigüedad y perfiles de compromiso. Todo en tiempo real.",
  },
  {
    icon: Lightbulb,
    title: "Actúa con evidencia",
    description:
      "Alertas tempranas, análisis predictivo y recomendaciones concretas para intervenir donde más importa.",
  },
];

function Dots({ active }: { active: Slide }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {([0, 1, 2] as const).map((i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            active === i ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}
