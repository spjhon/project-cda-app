import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../supabase/types/database.types";

/**
 * Supabase Admin Client Factory
 * -------------------------------
 * Crea una instancia de Supabase con la SERVICE_ROLE_KEY.
 * ¡IMPORTANTE!: Este cliente se salta el RLS (Row Level Security). 
 * Solo debe usarse en entornos de servidor (Middleware, Route Handlers, Server Actions).
 * Jamás debe exponerse o usarse en el lado del cliente (Navegador).
 */
export const createSupabaseAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase Admin environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  // Retornamos el cliente tipado con nuestra base de datos
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};