
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

const ROOT_DOMAIN = 'cda-app.com'

const TENANT_SUBDOMAINS = new Set([
  'fullmotos',
  'tecnofresno',
  'autobig',
  'viterbocaldas',
])

type HostKind = 'main' | 'tenant' | 'blocked'

async function getNormalizedHost(): Promise<string | null> {
  const headersList = await headers()

  const rawHost =
    headersList.get('x-forwarded-host') ??
    headersList.get('host')

  if (!rawHost) return null

  try {
    // Normaliza mayúsculas, elimina el puerto y valida el formato.
    const value = rawHost.split(',')[0].trim()
    return new URL(`http://${value}`).hostname.toLowerCase()
  } catch {
    return null
  }
}

function classifyHost(host: string): HostKind {
  // Dominio principal.
  if (
    host === ROOT_DOMAIN ||
    host === `www.${ROOT_DOMAIN}`
  ) {
    return 'main'
  }

  // Demo y entornos locales: bloqueados.
  if (
    host === `demo.${ROOT_DOMAIN}` ||
    host === 'localhost' ||
    host === '127.0.0.1'
  ) {
    return 'blocked'
  }

  // Solo acepta los subdominios registrados explícitamente.
  const match = host.match(
    /^([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\.cda-app\.com$/,
  )

  if (!match) return 'blocked'

  return TENANT_SUBDOMAINS.has(match[1])
    ? 'tenant'
    : 'blocked'
}

// No inventar fechas de modificación.
// Añade lastModified cuando tengas la fecha real de actualización
// del contenido, por ejemplo, desde la base de datos.

function buildMainSitemap(
  baseUrl: string,
): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}

function buildTenantSitemap(
  baseUrl: string,
): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/peticiones-quejas-apelaciones-felicitaciones`,
      changeFrequency: 'yearly',
      priority: 0.8,
    },
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = await getNormalizedHost()

  if (!host) return []

  const kind = classifyHost(host)

  switch (kind) {
    case 'main':
      // Mantiene una URL canónica, incluso si llega por www.
      return buildMainSitemap(`https://${ROOT_DOMAIN}`)

    case 'tenant':
      return buildTenantSitemap(`https://${host}`)

    case 'blocked':
    default:
      return []
  }
}
