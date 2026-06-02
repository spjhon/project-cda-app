"use server";

import { cache } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ======================================================
// Tipos de una fila devuelta por fetch_entry_orders_list
// ======================================================

export interface EntryOrderListItem {
  id: string;

  fecha: string;
  placa: string;

  marca: string;
  linea: string;

  estado_orden: "abierta" | "anulada" | "en_prueba" | "finalizada";

  cliente_nombre: string;
  cliente_documento: string;

  propietario_nombre: string;
  propietario_documento: string;

  total_count: number;
}

// ======================================================
// Parámetros de búsqueda
// ======================================================

export interface FetchEntryOrdersParams {
  tenantId: string;

  limit?: number;
  offset?: number;

  placa?: string;
  estado?: "abierta" | "anulada" | "en_prueba" | "finalizada" | undefined;

  fechaDesde?: string;
  fechaHasta?: string;

  clienteDocumento?: string;
  propietarioDocumento?: string;
}

// ======================================================
// Resultado
// ======================================================

export interface EntryOrdersFetchResult {
  data: EntryOrderListItem[] | null;
  error: string | PostgrestError | null;
}

// ======================================================
// Función principal
// ======================================================

/**
 * fetchEntryOrders
 *
 * Trae órdenes paginadas desde la RPC:
 * fetch_entry_orders_list
 *
 * Incluye:
 * - filtros opcionales
 * - paginación
 * - total_count para frontend
 */
export const fetchEntryOrders = cache(
  async ({
    tenantId,
    limit = 20,
    offset = 0,
    placa = undefined,
    estado = "abierta",
    fechaDesde = undefined,
    fechaHasta = undefined,
    clienteDocumento = undefined,
    propietarioDocumento = undefined,
  }: FetchEntryOrdersParams): Promise<EntryOrdersFetchResult> => {
    
    try {
      if (!tenantId) {
        return {
          data: null,
          error: "No tenant ID provided",
        };
      }

      const supabase = await createSupabaseServerClient();


    

      const { data, error } = await supabase.rpc("fetch_entry_orders_list",
        {
          p_tenant_id: tenantId,
          p_limit: limit,
          p_offset: offset,
          p_placa: placa,
          p_estado: estado,
          p_fecha_desde: fechaDesde,
          p_fecha_hasta: fechaHasta,
          p_cliente_documento: clienteDocumento,
          p_propietario_documento: propietarioDocumento,
        }
      );

     

      if (error) {
        console.error(`❌ RPC Error (fetch_entry_orders_list):`, error.message);

        return {
          data: null,
          error: error.message,
        };
      }

      

      return {
        data: (data as EntryOrderListItem[]) || [],
        error: null,
      };


    } catch (e) {
      return {
        data: null,
        error: e instanceof Error? e.message : "Error desconocido al extraer órdenes"
      };
    }
  }
);