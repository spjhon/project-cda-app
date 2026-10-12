


//------------------------------------------
//FUNCTION: get_tenant_roles
//FILE NAME: function_get_tenant_roles
//--------------------------------------------

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

