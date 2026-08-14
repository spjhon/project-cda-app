"use server";

import { cache } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
//import { cacheLife, cacheTag } from "next/cache";

// ======================================================
// Tipos de los módulos
// ======================================================

export interface TenantModule {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_enabled: boolean;
}

export interface TenantModulesFetchResult {
  data: TenantModule[] | null;
  error: string | PostgrestError | null;
}

// ======================================================
// Función principal
// ======================================================

export const fetchTenantModules = cache(
  async (tenantId: string): Promise<TenantModulesFetchResult> => {



    /** 
    // La directiva 'use cache' indica que esta función debe ser cacheada por Next.js
    // ESTE CACHE CAUSA ABORTOS EN DESARROLLO, DESCOMENTAR CUANDO SE VAYA A IR A PRODUCCION
    "use cache";

    // Definimos un tag único basado en el tenant para invalidación precisa
    cacheTag(`tenant-${tenantId}`);

    // Configuración de vida útil del caché en el servidor
    // Para un Tenant (datos que casi nunca cambian), 1 hora de revalidación es excelente
    cacheLife("hours");
*/




    try {
      if (!tenantId) {
        return {
          data: null,
          error: "No tenant ID provided",
        };
      }

      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .from("tenant_modules")
        .select(`
          id,
          is_enabled,
          module:modules (
            id,
            code,
            name,
            description,
            is_active
          )
        `)
        .eq("tenant_id", tenantId)
        .eq("is_enabled", true);

      if (error) {
        console.error(
          "❌ Error consultando tenant_modules:",
          error.message,
        );

        return {
          data: null,
          error: error.message,
        };
      }

      const modules: TenantModule[] =
        data
          ?.filter(
            (item) => item.module && item.module.is_active,
          )
          .map((item) => ({
            id: item.module.id,
            code: item.module.code,
            name: item.module.name,
            description: item.module.description,
            is_active: item.module.is_active,
            is_enabled: item.is_enabled,
          })) ?? [];

      return {
        data: modules,
        error: null,
      };
    } catch (e) {
      return {
        data: null,
        error:
          e instanceof Error
            ? e.message
            : "Error desconocido al consultar los módulos del tenant",
      };
    }
  },
);