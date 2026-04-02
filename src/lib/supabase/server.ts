import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../../../supabase/types/database.types'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()


/**
 * Supabase Server Client Factory
 * ------------------------------
 * Función asíncrona que instancia el cliente de Supabase para su uso en Server Components,
 * Server Actions y Route Handlers. Gestiona la persistencia de sesión mediante cookies.
 *
 * * * * Datos:
 * - 'cookieStore': Almacén de cookies de Next.js para lectura y escritura desde el servidor.
 * - 'Database': Interfaz de TypeScript que proporciona tipado estricto basado en el esquema de la base de datos.
 * - Variables de entorno: Utiliza la URL y la Key pública para la conexión inicial.
 * * * * Flujo:
 * 1. Recupera de forma asíncrona el almacén de cookies del encabezado de la petición.
 * 2. Utiliza 'createServerClient' para configurar la comunicación con Supabase desde el backend.
 * 3. Implementa 'getAll': Permite que el cliente de Supabase lea todas las cookies necesarias para verificar la sesión.
 * 4. Implementa 'setAll': Intenta escribir o actualizar las cookies de sesión en la respuesta del servidor.
 * 5. Gestión de errores en 'setAll': Captura fallos cuando se intenta escribir cookies desde componentes que solo permiten lectura, delegando la actualización al middleware si es necesario.
 * 6. Retorna una instancia de cliente capaz de realizar operaciones privilegiadas o de bypass de RLS según la configuración.
 * * * * @return Promise<SupabaseClient> - Instancia del cliente de Supabase para entornos de servidor.
 */

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {

      cookies: {

        getAll() {
            /* code for getting all cookies */
          return cookieStore.getAll()
        },

        setAll(cookiesToSet) {
            /* a list of cookies to set*/
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        
      },

    }
  )
}