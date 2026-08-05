"use server";

import { cache } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ======================================================
// Tipos de una fila devuelta por fetch_entry_orders_list
// ======================================================

export interface TirePressureDetail {
  id: string;
  eje: number;
  posicion: 
    | "izquierda"
    | "derecha"
    | "centro"
    | "izquierda_interior"
    | "derecha_interior"
    | "repuesto";
  presion_encontrada: number | null;
  presion_ajustada: number | null;
}



export type OfficePaymentType = 
  | 'efectivo' 
  | 'tarjeta_debito' 
  | 'tarjeta_credito' 
  | 'sistecredito' 
  | 'addi' 
  | 'transferencia' 
  | 'qr';




  
export interface EntryOrderListItem {
  id: string;
  placa: string;
  fecha: string;
  marca: string;
  linea: string;

  // Datos del Propietario (Snapshots)
  propietario_nombre: string;
  propietario_documento: string;
  propietario_tipo_documento: string;
  propietario_telefono: string | null;  // 🌟 NUEVO
  propietario_email: string | null;     // 🌟 NUEVO
  propietario_direccion: string | null; // 🌟 NUEVO

  // Datos del Cliente (Snapshots)
  cliente_nombre: string;
  cliente_documento: string;
  cliente_tipo_documento: string;
  cliente_telefono: string | null;      // 🌟 NUEVO
  cliente_email: string | null;         // 🌟 NUEVO
  cliente_direccion: string | null;     // 🌟 NUEVO

  // Datos Operativos del Vehículo
  es_reinspeccion: boolean;
  kilometraje: string | null;
  soat_vencimiento_snapshot: string | null;
  service_type: "RTM" | string;
  vehiculo_tipo_snapshot: string;
  vehiculo_tipo_servicio_snapshot: string;
  estado_orden: string;

  // Información de Oficina
  oficina_pin: string | null;
  oficina_pago: number | null;
  oficina_consecutivo_factura: string | null;
  oficina_tipo_pago: OfficePaymentType | null;
  oficina_num_aprobacion: string | null;

  se_compro_soat: boolean;
  resultado_revision: string | null;

  // Consecutivos de cierre técnico (ISO 17020)
  consecutivo_fur: string | null;
  consecutivo_rtm: string | null;

  // 🌟 NUEVO: Presiones de Llantas (agrupadas como JSONB)
  presiones_llantas: TirePressureDetail[];

  // Metadata de paginación
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
    estado = undefined,
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
        data: (data as unknown as EntryOrderListItem[]) || [],
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