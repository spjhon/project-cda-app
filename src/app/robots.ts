// src/app/robots.ts
import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const rawHost =
    headersList.get('x-forwarded-host') ??
    headersList.get('host') ??
    'cda-app.com'

  // Normaliza: quita puerto, lower case, primer host si viene CSV
  const host = rawHost.split(',')[0].trim().toLowerCase().split(':')[0]

  const isMainDomain =
    host === 'cda-app.com' ||
    host === 'www.cda-app.com' ||
    host === 'cda-app' ||
    host === 'localhost' ||
    host.startsWith('127.0.0.1')

  const isDemoDomain = host === 'demo.cda-app.com'
  const isTenantSubdomain =
    !isMainDomain && !isDemoDomain && host.endsWith('.cda-app.com')

  const privateDisallows = [
    '/admin/',
    '/dashboard/',
    '/auth/',
    '/cdn/',
    '/error',
    '/api/',
    '/_next/',
  ]

  // 1. Dominio principal: marketing indexable
  if (isMainDomain) {
    return {
      rules: [
        // Opcional: bots de IA
        { userAgent: 'GPTBot', disallow: '/' },
        { userAgent: 'Google-Extended', disallow: '/' },
        { userAgent: 'ClaudeBot', disallow: '/' },
        { userAgent: 'CCBot', disallow: '/' },
        {
          userAgent: '*',
          allow: '/',
          disallow: privateDisallows,
        },
      ],
      sitemap: `https://${host}/sitemap.xml`,
      host: `https://${host}`,
    }
  }

  // 2. Subdominio de tenant: landing indexable
  if (isTenantSubdomain) {
    return {
      rules: [
        { userAgent: 'GPTBot', disallow: '/' },
        { userAgent: 'Google-Extended', disallow: '/' },
        { userAgent: 'ClaudeBot', disallow: '/' },
        { userAgent: 'CCBot', disallow: '/' },
        {
          userAgent: '*',
          allow: '/',
          disallow: privateDisallows,
        },
      ],
      sitemap: `https://${host}/sitemap.xml`,
      host: `https://${host}`,
    }
  }

  // 3. Demo y cualquier otro host: bloquear todo
  return {
    rules: { userAgent: '*', disallow: '/' },
  }
}