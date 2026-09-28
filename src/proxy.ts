import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Landing de los tenants (Funciona tanto en producción .com como en local con :3000)
    {
      source: "/",
      has: [
        {
          type: "header",
          key: "host",
          // Explicación de la regex:
          // 1. Evita que sea exactamente cda-app.com o cda-app:3000 (con (?!...))
          // 2. Valida que empiece por un subdominio ([^.]+) seguido obligatoriamente de \.cda-app
          // 3. Permite opcionalmente un puerto numérico al final (:\d+)?
          value: "^(?!cda-app\\.com$|cda-app\\:[0-9]+$)[^.]+\\.cda-app(\\:[0-9]+)?$",
        },
      ],
    },

    // Todo lo demás, excepto la raíz "/"
    "/((?!$|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico|json)$|.*\\.php$|wp-.*|\\.env).*)",
  ],
};