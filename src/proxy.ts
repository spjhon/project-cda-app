import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request: NextRequest) {
  const res = await updateSession(request)
  return res
}

export const config = {
  matcher: [
    /*
     * 1. Mantenemos tus exclusiones: _next, favicon e imágenes.
     * 2. Agregamos protección contra bots: 
     * - Archivos .php (ataques comunes)
     * - Prefijos wp- (WordPress scans)
     * - Archivos .env (intentos de robo de credenciales)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|.*\\.php$|wp-.*|\\.env).*)",
  ],
}
