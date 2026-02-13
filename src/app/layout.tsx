import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MRI · Diagnóstico de Clima Organizacional",
  description:
    "Diagnóstico integral de clima organizacional con 17 indicadores. Analítica avanzada, segmentación y análisis predictivo.",
  authors: [{ name: "Ulises González" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sourceSerif.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
