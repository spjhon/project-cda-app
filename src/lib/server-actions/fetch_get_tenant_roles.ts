import { createSupabaseServerClient } from "../supabase/server"; // Cliente con sesión de usuario
import { PostgrestError } from "@supabase/supabase-js";

// Tipamos el resultado del RPC (un array de strings con los roles)
export interface UserRolesResult {
  data: string[] | null;
  error: string | PostgrestError | null;
}

/**
 * fetchUserTenantRoles
 * -------------------
 * Extrae los roles específicos de un usuario para un tenant determinado
 * utilizando el contexto de autenticación del servidor (auth.uid()).
 */
export async function fetchUserTenantRoles(tenantId: string): Promise<UserRolesResult> {
  try {
    // 1. Validación básica de entrada
    if (!tenantId) {
      return { data: null, error: "No tenant ID provided" };
    }

    // 2. Usamos el cliente de servidor para que auth.uid() funcione en el RPC
    const supabase = await createSupabaseServerClient();

    // 3. Llamada al RPC que creamos anteriormente
    // El RPC ya se encarga de buscar el service_user_id internamente
    const { data, error } = await supabase.rpc("get_tenant_roles", {
      p_tenant_id: tenantId,
    });

    // 4. Manejo de errores de base de datos
    if (error) {
      console.error("❌ Error en RPC get_tenant_roles:", error.message);
      return { data: null, error: error.message };
    }

    // 5. Retornamos los roles (el RPC ya devuelve un array, p.ej: ['director_tecnico'])
    return { data: data, error: null };

  } catch (e) {
    // 6. Captura de errores de ejecución o excepciones inesperadas
    console.error("💥 Excepción en fetchUserTenantRoles:", e);
    return { 
      data: null, 
      error: e instanceof Error ? e.message : "Error desconocido al extraer roles del usuario" 
    };
  }
}