// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { headers } from "next/headers";

// ─────────────────────────────────────────────────────────────
// Helper: normalización de host (igual que en robots.ts)
// ─────────────────────────────────────────────────────────────
async function getNormalizedHost(): Promise<string> {
  const headersList = await headers();
  const rawHost =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "cda-app.com";

  // x-forwarded-host puede traer "a.com, a.com" en setups con proxy chain
  return rawHost.split(",")[0].trim().toLowerCase().split(":")[0];
}

// ─────────────────────────────────────────────────────────────
// Tipos de host detectables (alineados con robots.ts)
// ─────────────────────────────────────────────────────────────
type HostKind = "main" | "tenant" | "blocked";

function classifyHost(host: string): HostKind {
  const isMain =
    host === "cda-app.com" ||
    host === "www.cda-app.com" ||
    host === "cda-app" ||            // dev local
    host === "localhost" ||
    host.startsWith("127.0.0.1");

  if (isMain) return "main";

  // Demo y cualquier subdominio que no sea tenant real → bloqueado
  const isDemo = host === "demo.cda-app.com";
  const isTenant =
    !isDemo && host.endsWith(".cda-app.com") && host.split(".").length === 3;

  return isTenant ? "tenant" : "blocked";
}

// ─────────────────────────────────────────────────────────────
// Rutas estáticas por dominio
// ─────────────────────────────────────────────────────────────

// Fechas estables: solo cambian cuando realmente editas el contenido.
// Actualiza este valor cuando publiques un cambio significativo en la página.
const LANDING_LAST_MOD = new Date("2026-10-12");
const ABOUT_LAST_MOD = new Date("2026-10-12");
const PQAF_LAST_MOD = new Date("2026-10-12");

function buildMainSitemap(baseUrl: string): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      lastModified: LANDING_LAST_MOD,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: ABOUT_LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}

function buildTenantSitemap(baseUrl: string): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      lastModified: LANDING_LAST_MOD,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      // ⚠️ Antes era /pqaf → 404. Ruta real larga.
      url: `${baseUrl}/peticiones-quejas-apelaciones-felicitaciones`,
      lastModified: PQAF_LAST_MOD,
      changeFrequency: "yearly", // El formulario casi no cambia
      priority: 0.8,
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// Sitemap principal
// ─────────────────────────────────────────────────────────────
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = await getNormalizedHost();
  const kind = classifyHost(host);
  const baseUrl = `https://${host}`;

  switch (kind) {
    case "main":
      return buildMainSitemap(baseUrl);

    case "tenant":
      return buildTenantSitemap(baseUrl);

    case "blocked":
    default:
      // Demo y hosts desconocidos: NO devolver sitemap.
      // Esto evita el warning de Search Console
      // "Sitemap referenced URL not allowed" cuando robots.ts bloquea todo.
      return [];
  }
}