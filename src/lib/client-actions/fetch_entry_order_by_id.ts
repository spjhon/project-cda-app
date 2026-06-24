import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// ==========================================
// INTERFACES DE TIPADO (Mapeo estricto del RPC)
// ==========================================


export interface TirePressureDetail {
  eje: number;
  posicion: string;
  encontrada: string;
  ajustada: string;
}

export interface TemplateConditionDetail {
  id: string;
  label: string;
  is_special: boolean;
  special_condition_label: string | null;
  default_value: string;
}

export interface SignatureConditionDetail {
  condition_id: string;
  declaration_text: string;
}

export interface OrderSignatureDetail {
  template_signature_id: string;
  representative_type: string;
  signature_label: string;
  signature_url: string;
  conditions: SignatureConditionDetail[];
}

export interface FetchEntryOrderResult {
  id: string;
  tenant_id: string;
  consecutivo: number;
  fecha: string;
  kilometraje: string;
  es_reinspeccion: boolean;
  observaciones: string | null;
  estado_orden: string;
  soat_vencimiento_snapshot: string | null;
  gas_numero_snapshot: string | null;
  gas_vencimiento_snapshot: string | null;
  service_type: string;
  created_at: string;
  updated_at: string;
  vehiculo_id: string;
  propietario_id: string;
  cliente_id: string;
  funcionario_id: string;
  plantilla_id: string;
  plantilla_nombre: string;
  plantilla_version: number;
  plantilla_fecha_documento: string;
  plantilla_codigo_documento: string;
  plantilla_logo_url: string | null;
  plantilla_texto_contractual: string;
  vehiculo_placa: string;
  vehiculo_marca: string;
  vehiculo_linea: string;
  vehiculo_modelo: number;
  vehiculo_color: string;
  vehiculo_tipo_vehiculo: string;
  vehiculo_clase: string;
  vehiculo_combustible: string;
  vehiculo_cilindrada: number;
  vehiculo_blindaje: boolean;
  vehiculo_capacidad_pasajeros: number;
  vehiculo_es_ensenanza: boolean;
  vehiculo_tipo_servicio_vehiculo: string;
  vehiculo_es_extranjero: boolean;
  propietario_nombre: string;
  propietario_documento: string;
  propietario_tipo_documento: string;
  cliente_nombre: string;
  cliente_documento: string;
  cliente_tipo_documento: string;
  funcionario_nombre: string;
  funcionario_documento: string;
  funcionario_firma: string | null;
  director_tecnico_nombre: string | null;
  director_tecnico_documento: string | null;
  director_tecnico_tipo_documento: string | null;
  director_tecnico_firma: string | null;
  presiones_llantas: TirePressureDetail[] | null;
  condiciones_plantilla: TemplateConditionDetail[] | null;
  firmas_orden: OrderSignatureDetail[] | null;
}

// Parámetros que requiere el hook para funcionar
interface UseFetchEntryOrderParams {
  orderId: string | undefined;
  tenantId: string | undefined;
  readyToProcess: boolean;
}

// El Custom Hook
export function useFetchEntryOrder({ orderId, tenantId, readyToProcess }: UseFetchEntryOrderParams) {
  return useQuery<FetchEntryOrderResult | null, Error>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.rpc('fetch_entry_order_by_id', {
        p_order_id: orderId,
        p_tenant_id: tenantId
      });
      
      if (error) {
        console.error('Error en RPC:', error);
        
      }
      
      console.log('📦 Datos de la orden obtenidos:', data);
      
      if (!data || data.length === 0) throw new Error;
      
      return data[0] as unknown as FetchEntryOrderResult;
    },
    enabled: !!orderId && readyToProcess, 
    retry: 1,
    
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}