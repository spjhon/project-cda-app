import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const host = headersList.get('host') || 'cda-app.com'

  // Aquí puedes personalizar las reglas dependiendo de qué subdominio esté entrando
  // Por ejemplo, si es tu landing page principal o el subdominio de un cliente
  if (host.includes('dashboard')) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/', // Bloquea el dashboard administrativo global para que no salga en Google
      },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'], // Evitas que indexen rutas privadas de Next o llamadas de API
    },
    sitemap: `https://${host}/sitemap.xml`, // El sitemap también se vuelve dinámico apuntando al host correcto
  }
}