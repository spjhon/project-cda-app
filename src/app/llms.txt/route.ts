import { NextResponse } from "next/server";

export async function GET() {
  const content = `# cdApp - Plataforma SaaS Multi-Tenant para CDAs

## Información General
Plataforma web multi-tenant diseñada para Centros de Diagnóstico Automotor (CDA) en Colombia, bajo el estándar de gestión de calidad ISO 17020 y normativas locales (RUNT, Habeas Data Ley 1581).

## Stack Tecnológico Principal
- **Framework:** Next.js 15+ (App Router con Server Components y arquitectura de caching experimental).
- **Base de Datos y Backend:** Supabase (PostgreSQL) utilizando una arquitectura orientada a RPC (Remote Procedure Calls) para la lógica de negocio pesada en la capa de datos.
- **Estado y Fetching Front-End:** TanStack Ecosystem (TanStack Query para polling de dashboards y TanStack Start).
- **Estilos:** Tailwind CSS con soporte nativo para modo oscuro (colores principales: \`#051923\`, \`#003554\`, \`#006494\`, \`#00a6fb\`).
- **Componentes UI:** Shadcn UI (componentes accesibles basados en Radix Primitives).

## Arquitectura de Rutas (App Router)
- \`src/app/[tenant]/(public)/page.tsx\`: Landing page estática/comercial para cada CDA. Muestra información local, mapa, horarios y datos estructurados (Schema.org de tipo AutomotiveBusiness).
- \`src/app/[tenant]/pqaf/page.tsx\`: Formulario optimizado de radicación de peticiones, quejas, reclamos, sugerencias y felicitaciones. Utiliza pre-rendering mediante \`generateStaticParams\`.
- Grupos de rutas para dashboards privados protegidos bajo middleware y listeners de autenticación personalizados.

## Reglas de Desarrollo y Buenas Prácticas
- **Tipado Estricto:** TypeScript riguroso en todas las interfaces y promesas de parámetros de Next.js (\`params: Promise<{ tenant: string }>\`).
- **Asincronía en Clientes:** Pasar promesas de segmentos directamente a componentes cliente utilizando el hook \`use()\` de React dentro de contenedores \`<Suspense>\`.
- **Rendimiento:** Priorizar SSG (Static Site Generation) e ISR (Incremental Static Regeneration) para las secciones públicas de los inquilinos. Las variables de configuración de segmentos como \`dynamicParams\` deben omitirse si chocan con estrategias globales de \`cacheComponents\`.
- **Seguridad:** Los formularios expuestos incluyen mecanismos Honeypot anti-spam y modales inline con cláusulas de Habeas Data antes del envío de payloads.

## Enlaces e Información de Utilidad
- Web Oficial: https://cda-app.com
- Endpoint de PQRSF por Tenant: https://{tenant}.cda-app.com/peticiones-quejas-apelaciones-felicitaciones
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}