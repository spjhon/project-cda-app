"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cache } from "react";
import { PostgrestError } from "@supabase/supabase-js";

export interface OrderSignatureCondition {
  id: string;
  declaration_text: string;
}

export interface OrderTemplateCondition {
  id: string;
  label: string;
  is_special: boolean;
  special_condition_label: string | null;
  default_value: 'cumple' | 'no_cumple' | 'no_aplica'; // Ajusta según tu enum
}


// Nueva interfaz para las firmas basada en tu tabla order_template_signatures
export interface OrderTemplateSignature {
  id: string;
  representative_type: string; // Ej: 'inspector', 'cliente', 'propietario'
  signature_label: string;     // Ej: 'Firma del Técnico Responsable'
  declarations: OrderSignatureCondition[]; // Agregado el array de declaraciones
}

// Definimos el tipo basado en las columnas exactas de tu RPC
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
  service_type: 'RTM' | 'peritaje' | 'otro' | 'preventiva'; // Ajusta según tu enum;
  conditions: OrderTemplateCondition[]; // El nuevo array
  signatures: OrderTemplateSignature[]; // Añadido para coincidir con el RPC actualizado
};





export interface TemplatesFetchResult {
  data: OrderTemplate[] | null;
  error: string | PostgrestError | null;
}

/**
 * Función base para extraer las plantillas vía RPC
 */
export async function fetchAllTemplates(tenantId: string) {
  try {
    // Simulación de carga para probar el Suspense (quitar en producción)
    // await new Promise((res) => setTimeout(res, 3000));

    if (!tenantId) return { data: null, error: "No tenant ID provided" };

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("fetch_orders_templates", {
      p_tenant_id: tenantId,
    })

    

    if (error) {
      console.error("RPC Error:", error);
      return { data: null, error: error.message };
    }


    
    return { data: (data as unknown as OrderTemplate[]) || [], error: null };
    
  } catch (e) {
    return { 
      data: null, 
      error: e instanceof Error ? e.message : "Error desconocido al extraer plantillas" 
    };
  }
}

/** * Versión memoizada con React cache.
 * Esto asegura que si llamas a esta función en el Layout y en la Page,
 * solo se haga una sola petición a Supabase durante ese renderizado.
 */
export const fetchAllTemplatesMemoized = cache(async (tenantId: string) => {
  return await fetchAllTemplates(tenantId);
});