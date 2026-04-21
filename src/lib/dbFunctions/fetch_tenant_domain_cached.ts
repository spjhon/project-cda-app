
"use server"

import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "../supabase/admin";
import { cache } from "react";
import { PostgrestError } from "@supabase/supabase-js";



type TenantData = {
  domain: string,
  name: string,
  id: string,
  logo_url: string
}

// Definimos la interfaz de lo que devuelve la función para que TS sea feliz
interface TenantFetchResult {
  data: TenantData | null; // Aquí podrías poner el tipo de tu tabla si lo tienes
  error: string | PostgrestError | null;
}





export async function fetchTenantData(tenantSlug: string): Promise<TenantFetchResult> {
  try {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    await delay(5000);
    if (!tenantSlug) return { data: null, error: "No slug provided" };

    const supabaseAdmin = createSupabaseAdminClient();

    const { data, error } = await supabaseAdmin.rpc("get_tenant_data", {
      p_tenant_slug: tenantSlug,
    });

    if (error) {
      return { data: null, error: error };
    }

    return { data: data[0], error: null };
    
  } catch (e) {
    // Captura errores inesperados (conexión, timeout, etc.)
    return { 
      data: null, 
      error: e instanceof PostgrestError ? e.message : "Error desconocido al extraer el tenant" 
    };
  }
}





/** 
 * Versión cacheada del Tenant Data
 * - unstable_cache: Guarda el resultado en el servidor por 60 segundos (Data Cache).
 * - cache (React): Evita llamadas duplicadas durante el renderizado de una misma página (Memoization).
 */
export const fetchTenantDataCached = cache(async (tenantSlug: string) => { 
  return await unstable_cache(
    async () => fetchTenantData(tenantSlug),
    ["tenant-data", tenantSlug], // Llave única por cada tenant
    {
      revalidate: 10, // TTL de 60 segundos
      tags: [`tenant-${tenantSlug}`, "all-tenants"], // Tags para invalidación manual
    }
  )();
});





 /** 
"use server"

import { createSupabaseAdminClient } from "../supabase/admin";
import { PostgrestError } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";

type TenantData = {
  domain: string;
  name: string;
  id: string;
}

interface TenantFetchResult {
  data: TenantData | null;
  error: string | PostgrestError | null;
}

/**
 * Nueva versión usando 'use cache' (Next.js 15+)
 * Sustituye a unstable_cache y react cache.
 
export async function fetchTenantDataCached(tenantSlug: string): Promise<TenantFetchResult> {
  'use cache'
  
  // 1. Definimos el tiempo de vida (equivalente a revalidate: 60)
  // Puedes usar perfiles como 'minutes', 'hours' o segundos exactos.
  cacheLife("minutes"); 
  
  // 2. Definimos los tags para invalidación manual (revalidateTag)
  cacheTag(`tenant-${tenantSlug}`, "all-tenants");

  try {
    if (!tenantSlug) return { data: null, error: "No slug provided" };

    const supabaseAdmin = createSupabaseAdminClient();

    const { data, error } = await supabaseAdmin.rpc("get_tenant_data", {
      p_tenant_slug: tenantSlug,
    });

    if (error) {
      return { data: null, error: error };
    }

    return { data: data[0], error: null };
    
  } catch (e) {
    return { 
      data: null, 
      error: e instanceof Error ? e.message : "Error desconocido al extraer el tenant" 
    };
  }
}

*/
