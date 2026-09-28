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
          // Explicación:
          // 1. Excluye el dominio raíz (cda-app.com, cda-app:3000, etc.)
          // 2. Valida cualquier subdominio ([^.]+) seguido de \.cda-app
          // 3. Permite opcionalmente \.com (para producción) y/o :3000 (para local)
          value: "^(?!cda-app(\\.com)?(\\:[0-9]+)?$)[^.]+\\.cda-app(\\.com)?(\\:[0-9]+)?$",
        },
      ],
    },

    // Todo lo demás, excepto la raíz "/"
    "/((?!$|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico|json)$|.*\\.php$|wp-.*|\\.env).*)",
  ],
};