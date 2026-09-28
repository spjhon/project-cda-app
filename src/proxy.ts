import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Landing de los tenants (Funciona tanto en producción como en local con :3000)
    {
      source: "/",
      has: [
        {
          type: "header",
          key: "host",
          // Esta regex valida:
          // 1. Que NO sea cda-app.com (con o sin :3000)
          // 2. Que SÍ sea un subdominio válido (ej: fullmotos.cda-app.com o fullmotos.cda-app:3000)
          value: "^(?!cda-app(\\:[0-9]+)?$)[^.]+\\.cda-app(\\:[0-9]+)?$",
        },
      ],
    },

    // Todo lo demás, excepto la raíz "/"
    "/((?!$|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico|json)$|.*\\.php$|wp-.*|\\.env).*)",
  ],
};