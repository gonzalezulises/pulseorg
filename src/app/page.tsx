import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Search,
  Target,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <Badge variant="secondary" className="mb-6 text-sm">
          Diagnóstico de Clima Organizacional
        </Badge>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
          Mide lo que importa en tu organización
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
          PulseOrg diagnostica tu clima organizacional con 17 indicadores
          diseñados con rigor científico. Datos claros, decisiones informadas.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="text-base">
            <Link href="/dashboard">
              Ver demostración
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <a href="#para-que-sirve">
              Conocer más
              <ChevronDown className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Para qué sirve */}
      <section id="para-que-sirve" className="px-6 py-20 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            ¿Para qué sirve?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Mide</h3>
                <p className="text-muted-foreground text-sm">
                  17 indicadores de clima organizacional en una encuesta de
                  menos de 10 minutos por persona.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Entiende</h3>
                <p className="text-muted-foreground text-sm">
                  Resultados inmediatos por área, antigüedad, perfiles de
                  compromiso y tendencias históricas.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Actúa</h3>
                <p className="text-muted-foreground text-sm">
                  Alertas tempranas y recomendaciones basadas en evidencia para
                  intervenir donde más importa.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Para quién */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            ¿Para quién?
          </h2>
          <p className="text-muted-foreground text-lg">
            Empresas de 50 a 1,000+ colaboradores que quieren gestionar su clima
            con datos, no con intuición. Ideal para Recursos Humanos, Gerencia
            General y equipos de transformación organizacional.
          </p>
        </div>
      </section>

      {/* Qué puedes esperar */}
      <section className="px-6 py-20 bg-muted/40">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            ¿Qué puedes esperar?
          </h2>
          <ul className="space-y-4">
            {[
              "Diagnóstico claro con indicadores validados científicamente",
              "Perfiles de compromiso y segmentación demográfica",
              "Análisis predictivo y alertas tempranas de riesgo",
              "Comparativas con referencias del sector",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/dashboard">
                Ver demostración
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 PulseOrg ·{" "}
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
