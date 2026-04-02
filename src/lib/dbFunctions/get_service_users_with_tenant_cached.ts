// lib/dbFunctions/get_service_users_cached.ts
"use server"

import { ServiceUser } from "@/features/tickets/components/CreateTicketForm";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PostgrestError } from "@supabase/supabase-js";



/**
 * Función cacheada con el nuevo modelo de Next.js
 * 1. 'use cache' -> Almacena el resultado en el Servidor (Data Cache).
 * 2. Los argumentos (tenantId) -> Se vuelven automáticamente la "Cache Key".
 * 3. Al ser una función exportada, React la memoiza durante el render.
 */
export async function fetchServiceUsersCached(tenantId: string) {
  
  

  const supabaseAdmin = createSupabaseAdminClient();

  const { data, error } = await supabaseAdmin.rpc("get_service_users_with_tenant", { 
    target_tenant_id: tenantId 
  });

  if (error) {
    console.log("RPC Error:", error);
    return { data: null, error: error as PostgrestError };
  }

  return { data: data as ServiceUser[], error: null };
}