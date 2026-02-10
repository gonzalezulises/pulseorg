import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN", // Previene clickjacking
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff", // Previene MIME sniffing
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Necesario para Next.js
      "style-src 'self' 'unsafe-inline'", // Necesario para CSS-in-JS
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'self'", // Complementa X-Frame-Options
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Security headers para todas las rutas
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Desactivar el header X-Powered-By
  poweredByHeader: false,

  // Configuración adicional de seguridad
  experimental: {
    // Strict mode para React
  },
};

export default nextConfig;
