
// src/app/robots.ts
import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

const ROOT_DOMAIN = 'cda-app.com'

const TENANT_SUBDOMAINS = new Set([
  'fullmotos',
  'tecnofresno',
  'autobig',
  'viterbocaldas',
])

const privateDisallows = [
  '/admin/',
  '/dashboard/',
  '/auth/',
  '/api/',
  '/error',
]

const aiBots = [
  'GPTBot',
  'Google-Extended',
  'ClaudeBot',
  'CCBot',
]

function getHostname(rawHost: string | null): string | null {
  if (!rawHost) return null

  const value = rawHost.split(',')[0].trim()

  try {
    return new URL(`http://${value}`).hostname.toLowerCase()
  } catch {
    return null
  }
}

function blockAll(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}

function allowPublicPages(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: aiBots,
        disallow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: privateDisallows,
      },
    ],
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()

  const host = getHostname(
    headersList.get('x-forwarded-host') ??
      headersList.get('host'),
  )

  if (!host) {
    return blockAll()
  }

  // 1. Dominio principal de cdApp.
  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) {
    return {
      ...allowPublicPages(),
      sitemap: `https://${ROOT_DOMAIN}/sitemap.xml`,
      host: `https://${ROOT_DOMAIN}`,
    }
  }

  // 2. Demo: bloquear todo el rastreo.
  if (
    host === `demo.${ROOT_DOMAIN}` ||
    host === 'localhost' ||
    host === '127.0.0.1'
  ) {
    return blockAll()
  }

  // 3. Permitir únicamente los subdominios registrados en esta lista.
  const tenantMatch = host.match(
    /^([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\.cda-app\.com$/,
  )

  if (!tenantMatch) {
    return blockAll()
  }

  const tenantSlug = tenantMatch[1]

  if (!TENANT_SUBDOMAINS.has(tenantSlug)) {
    return blockAll()
  }

  // 4. Landing pública de un tenant válido.
  return {
    ...allowPublicPages(),
    sitemap: `https://${host}/sitemap.xml`,
    host: `https://${host}`,
  }
}
