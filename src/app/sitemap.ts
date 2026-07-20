import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  // Detectamos el host actual (ej: fullmotos.cda-app.com o tecnofresno.cda-app.com)
  const host = headersList.get("host") || "cda-app.com";
  const baseUrl = `https://${host}`;

  // Si estás usando subdominios independientes, cada tenant verá solo sus urls:
  const routes = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0, // Máxima prioridad para la landing page del CDA
    },
    {
      url: `${baseUrl}/pqaf`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7, // Prioridad alta para el formulario oficial
    },
  ];

  return routes;
}