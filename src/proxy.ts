import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Landing de los tenants:
    // fullmotos.cda-app.com/
    // otro.cda-app.com/
    {
      source: "/",
      has: [
        {
          type: "header",
          key: "host",
          value: "^(?!cda-app\\.com$)[^.]+\\.cda-app\\.com$",
        },
      ],
    },

    // Todo lo demás, excepto la raíz "/"
    // Esto evita que cda-app.com/ ejecute Proxy.
    "/((?!$|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico|json)$|.*\\.php$|wp-.*|\\.env).*)",
  ],
};