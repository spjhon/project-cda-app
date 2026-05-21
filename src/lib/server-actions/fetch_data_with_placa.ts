"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cache } from "react";
import { PostgrestError } from "@supabase/supabase-js";
//import { ZodFullFormDataType } from "@/lib/zod-schemas/order-schema";

// --- Interfaces de Salida (Estructuradas para encajar en el formData) ---

export interface ExtractedVehicleData {
  id: string; // UUID de la DB
  placa: string;
  marca: string;
  linea: string;
  modelo: string;
  color: string;
  tipo_vehiculo: string;
  clase: string;
  combustible: string;
  cilindrada: string;
  blindaje: boolean;
  capacidad_pasajeros: string;
  es_ensenanza: boolean;
  tipo_servicio_vehiculo: string;
  propietario_actual_id: string | null;
  es_extranjero: boolean;
}

export interface ExtractedPersonData {
  id: string | null;
  tipo_documento: string;
  numero_documento: string;
  nombre_completo: string;
  telefono: string;
  correo: string;
  direccion: string;
}

// Lo que nos responderá el RPC unificado
export interface ExtensiveVehicleQueryResult {
  vehicle: ExtractedVehicleData | null;
  customer_data: ExtractedPersonData | null;
  owner_data: ExtractedPersonData | null;
  is_owner_same_as_customer: boolean;
  // Podemos prever snapshots pasados si el CDA los requiere visualizar de inmediato
  last_soat_vencimiento: string | null;
  last_gas_numero: string | null;
  last_gas_vencimiento: string | null;
}

export interface VehicleFetchResult {
  data: ExtensiveVehicleQueryResult | null;
  error: string | PostgrestError | null;
  found: boolean; // Flag rápido para saber si el vehículo existe o es nuevo en el CDA
}

/**
 * fetchVehicleExtensiveData
 * -------------------------
 * Busca un vehículo por placa de forma extensiva trayendo el histórico 
 * del último cliente y propietario registrado para agilizar la recepción.
 */



export const fetchDataWithPlaca = cache(async (placa: string, tenantId: string): Promise<VehicleFetchResult> => {



  try {
    if (!placa) return { data: null, error: "No se suministro una placa", found: false };
    if (!tenantId) return { data: null, error: "No se suministro el tenant ID", found: false };

    const supabaseServer = await createSupabaseServerClient();

    // Ejecutamos el RPC unificado mandando placa y tenant (aislamiento multi-tenant)
    const { data, error } = await supabaseServer.rpc("fetch_data_with_placa", {
      p_placa: placa.toUpperCase().trim(),
      p_tenant_id: tenantId
    });

    if (error) {
      console.error(`❌ RPC Error (fetch_data_with_placa) para placa ${placa}:`, error.message);
      return { data: null, error: error.message, found: false };
    }

    // Si el RPC retorna data pero el objeto interno del vehículo viene nulo, significa que no existe
    const typedData = data as unknown as ExtensiveVehicleQueryResult;
    if (!typedData || !typedData.vehicle) {
      return { data: null, error: null, found: false };
    }

    return { 
      data: typedData, 
      error: null,
      found: true
    };
    
  } catch (e) {

    return { 
      data: null, 
      error: e instanceof Error ? "Error desconocido: " + e.message : "Error desconocido al buscar la placa",
      found: false
    };

  }
});