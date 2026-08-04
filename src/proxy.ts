import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Excluimos explícitamente:
     * - _next/static, _next/image
     * - Archivos estáticos comunes (imágenes, fuentes, favicons, json, txt)
     * - Ataques de bots (.php, wp-, .env)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico|json)$|.*\\.php$|wp-.*|\\.env).*)",
  ],
};