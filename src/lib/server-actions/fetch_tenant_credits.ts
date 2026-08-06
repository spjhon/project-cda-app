"use server";

import { cache } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ======================================================
// Tipos de la respuesta de get_tenant_credits
// ======================================================

export interface TenantCredits {
  cupo_fupas: number;
  cupo_certificados: number;
  updated_at: string | null; // Permitimos string ISO o null si no se ha actualizado nunca
}

export interface FetchTenantCreditsParams {
  tenantId: string;
}

export interface TenantCreditsFetchResult {
  data: TenantCredits | null;
  error: string | PostgrestError | null;
}

// ======================================================
// Función principal
// ======================================================

export const fetchTenantCredits = cache(
  async ({ tenantId }: FetchTenantCreditsParams): Promise<TenantCreditsFetchResult> => {
    try {
      if (!tenantId) {
        return {
          data: null,
          error: "No tenant ID provided",
        };
      }

      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .rpc("get_tenant_credits", {
          p_tenant_id: tenantId,
        })
        .single();

      if (error) {
        console.error(`❌ RPC Error (get_tenant_credits):`, error.message);

        return {
          data: null,
          error: error.message,
        };
      }

      return {
        // Simplemente retornamos data tal cual la devuelve el RPC de Postgres
        data: data as TenantCredits,
        error: null,
      };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : "Error desconocido al consultar cupos del tenant",
      };
    }
  }
);