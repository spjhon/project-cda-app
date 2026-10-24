


//------------------------------------------
//FUNCTION: get_tenant_roles
//FILE NAME: function_get_tenant_roles
//--------------------------------------------

import { Database } from "../../supabase/types/database.types";

export type get_tenant_roles_type = string[];




//------------------------------------------
//FUNCTION: get_tenant_data
//FILE NAME: function_get_tenant_data
//--------------------------------------------

export type get_tenant_data_type = {
  domain: string;
  name: string;
  id: string;
  logo_url: string;
}



//------------------------------------------
//FUNCTION: fetch_orders_templates
//FILE NAME: function_fetch_orders_templates
//--------------------------------------------

// --- Interfaces ---
export interface OrderSignatureCondition {
  id: string;
  declaration_text: string;
}

export interface OrderTemplateCondition {
  id: string;
  label: string;
  is_special: boolean;
  special_condition_label: string | undefined;
  default_value: 'cumple' | 'no_cumple' | 'no_aplica';
}

export interface OrderTemplateSignature {
  id: string;
  representative_type: string;
  signature_label: string;
  declarations: OrderSignatureCondition[];
}

export type OrderTemplateType = {
  id: string;
  tenant_id: string;
  template_name: string;
  version: number;
  is_active: boolean;
  document_date: string;
  document_code: string;
  logo_url: string | null;
  base_contract_text: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  conditions: OrderTemplateCondition[];
  signatures: OrderTemplateSignature[];
};





//------------------------------------------
//FUNCTION: fetch_entry_orders_list
//FILE NAME: function_fetch_entry_orders_list
//--------------------------------------------

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

// ======================================================
// Tipo de pagos de una orden
// ======================================================

export interface EntryOrderPaymentDetail {
  id: string;
  payment_method: Database["public"]["Enums"]["office_payment_type_enum"] | null;
  monto_bruto: number;
  num_comprobante: string | null;
  created_at: string;
  updated_at: string;
}


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
  propietario_telefono: string | null;
  propietario_email: string | null;
  propietario_direccion: string | null;

  // Datos del Cliente (Snapshots)
  cliente_nombre: string;
  cliente_documento: string;
  cliente_tipo_documento: string;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_direccion: string | null;

  // Datos Operativos del Vehículo
  es_reinspeccion: boolean;
  kilometraje: string | null;
  soat_vencimiento_snapshot: string | null;
  service_type: Database["public"]["Enums"]["service_type_enum"];
  vehiculo_tipo_snapshot: Database["public"]["Enums"]["vehicle_type_enum"];
vehiculo_tipo_servicio_snapshot: Database["public"]["Enums"]["vehicle_service_type_enum"];
  estado_orden: string;

  // Información de Oficina
  oficina_pin: string | null;
  oficina_consecutivo_factura: string | null;
  se_compro_soat: boolean;
  rate_price_snapshot: number | null;
  company_nit_snapshot: string | null;

  // Resultado de la inspección
  resultado_revision: string | null;

  // Consecutivos de cierre técnico (ISO 17020)
  consecutivo_fur: string | null;
  consecutivo_rtm: string | null;

  // Presiones de Llantas
  presiones_llantas: TirePressureDetail[];

  // Pagos de la orden
  payments: EntryOrderPaymentDetail[];

  // Metadata de paginación
  total_count: number;
}
