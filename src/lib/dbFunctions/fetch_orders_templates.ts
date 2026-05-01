"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cache } from "react";
import { PostgrestError } from "@supabase/supabase-js";


// --- Interfaces ---
export interface OrderSignatureCondition {
  id: string;
  declaration_text: string;
}

export interface OrderTemplateCondition {
  id: string;
  label: string;
  is_special: boolean;
  special_condition_label: string | null;
  default_value: 'cumple' | 'no_cumple' | 'no_aplica';
}

export interface OrderTemplateSignature {
  id: string;
  representative_type: string;
  signature_label: string;
  declarations: OrderSignatureCondition[];
}

export type OrderTemplate = {
  id: string;
  tenant_id: string;
  template_name: string;
  version: number;
  is_active: boolean;
  document_date: string;
  document_code: string;
  logo_url: string | null;
  base_contract_text: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  service_type: 'RTM' | 'peritaje' | 'otro' | 'preventiva';
  conditions: OrderTemplateCondition[];
  signatures: OrderTemplateSignature[];
};

export interface TemplatesFetchResult {
  data: OrderTemplate[] | null;
  error: string | PostgrestError | null;
}

/**
 * fetchAllTemplates
 * -----------------
 * Combina memoización de React, persistencia de Next.js y revalidación por tiempo.
 */
export const fetchAllTemplates = cache(async (tenantId: string): Promise<TemplatesFetchResult> => {


  try {
    if (!tenantId) return { data: null, error: "No tenant ID provided" };

    const supabaseAdmin = await createSupabaseServerClient();

    const { data, error } = await supabaseAdmin.rpc("fetch_orders_templates", {
      p_tenant_id: tenantId,
    });

    if (error) {
      console.error(`❌ RPC Error (fetch_orders_templates) para tenant ${tenantId}:`, error.message);
      return { data: null, error: error.message };
    }

    return { 
      data: (data as unknown as OrderTemplate[]) || [], 
      error: null 
    };
    
  } catch (e) {
    return { 
      data: null, 
      error: e instanceof Error ? e.message : "Error desconocido al extraer plantillas" 
    };
  }
});