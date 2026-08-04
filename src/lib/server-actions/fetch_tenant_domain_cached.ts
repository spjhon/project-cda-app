"use server"

import { createSupabaseAdminClient } from "../supabase/admin";
import { PostgrestError } from "@supabase/supabase-js";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";

type TenantData = {
  domain: string;
  name: string;
  id: string;
  logo_url: string;
}

export interface TenantFetchResult {
  data: TenantData | null;
  error: string | PostgrestError | null;
}

/**
 * fetchTenantData
 * ---------------
 * Implementa 'use cache' para persistencia y 'cache' de React para memoización.
 */
export const fetchTenantData = cache(async (tenantSlug: string): Promise<TenantFetchResult> => {






  
  // La directiva 'use cache' indica que esta función debe ser cacheada por Next.js
  //ESTE CACHE CAUSA ABORTOS EN DESARROLLO, DESCOMENTAR CUANDO SE VAYA A IR A PRODUCCION
  "use cache";

  // Definimos un tag único basado en el slug para invalidación precisa
  cacheTag(`tenant-${tenantSlug}`);

 // Configuración de vida útil del caché en el servidor
    // Para un Tenant (datos que casi nunca cambian), 1 hora de revalidación es excelente
    cacheLife("hours");
 



  

  try {
    if (!tenantSlug) return { data: null, error: "No slug provided" };

    const supabaseAdmin = createSupabaseAdminClient();

    const { data, error } = await supabaseAdmin.rpc("get_tenant_data", {
      p_tenant_slug: tenantSlug,
    });

    if (error) {
      console.error(`❌ Error RPC Tenant (${tenantSlug}):`, error.message);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: null, error: "Tenant not found" };
    }

    return { data: data[0], error: null };
    
  } catch (e) {
    return { 
      data: null, 
      error: e instanceof Error ? e.message : "Error desconocido al extraer el tenant" 
    };
  }
});