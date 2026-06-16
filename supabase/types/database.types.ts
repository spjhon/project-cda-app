export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      entry_order_tire_pressures: {
        Row: {
          created_at: string
          deleted_at: string | null
          eje: number
          entry_order_id: string
          id: string
          posicion: string
          presion_ajustada: number | null
          presion_encontrada: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          eje: number
          entry_order_id: string
          id?: string
          posicion: string
          presion_ajustada?: number | null
          presion_encontrada?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          eje?: number
          entry_order_id?: string
          id?: string
          posicion?: string
          presion_ajustada?: number | null
          presion_encontrada?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tire_pressures_order_id_fkey"
            columns: ["entry_order_id"]
            isOneToOne: false
            referencedRelation: "entry_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tire_pressures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_orders: {
        Row: {
          cliente_direccion_snapshot: string | null
          cliente_email_snapshot: string | null
          cliente_id: string
          cliente_nombre_snapshot: string
          cliente_numero_documento_snapshot: string
          cliente_telefono_snapshot: string | null
          cliente_tipo_documento_snapshot: string
          consecutivo: number
          created_at: string
          deleted_at: string | null
          es_reinspeccion: boolean | null
          estado_orden: Database["public"]["Enums"]["order_status_enum"]
          fecha: string
          funcionario_firma_base64_snapshot: string
          funcionario_id: string
          funcionario_nombre_snapshot: string
          funcionario_numero_documento_snapshot: string
          funcionario_tipo_documento_snapshot: string
          gas_numero_snapshot: string | null
          gas_vencimiento_snapshot: string | null
          id: string
          kilometraje: string | null
          observaciones: string | null
          oficina_consecutivo_factura: string | null
          oficina_pago: number | null
          oficina_pin: string | null
          oficina_tipo_pago:
            | Database["public"]["Enums"]["office_payment_type_enum"]
            | null
          plantilla_id: string
          propietario_direccion_snapshot: string | null
          propietario_email_snapshot: string | null
          propietario_id: string
          propietario_nombre_snapshot: string
          propietario_numero_documento_snapshot: string
          propietario_telefono_snapshot: string | null
          propietario_tipo_documento_snapshot: string
          resultado_revision: string | null
          se_compro_soat: boolean
          service_type: Database["public"]["Enums"]["service_type_enum"]
          soat_vencimiento_snapshot: string | null
          tenant_id: string
          updated_at: string
          vehiculo_blindaje_snapshot: boolean
          vehiculo_capacidad_pasajeros_snapshot: number
          vehiculo_cilindrada_snapshot: number
          vehiculo_clase_snapshot: string
          vehiculo_color_snapshot: string
          vehiculo_combustible_snapshot: string
          vehiculo_es_ensenanza_snapshot: boolean
          vehiculo_es_extranjero_snapshot: boolean
          vehiculo_id: string
          vehiculo_linea_snapshot: string
          vehiculo_marca_snapshot: string
          vehiculo_modelo_snapshot: number
          vehiculo_placa_snapshot: string
          vehiculo_tipo_servicio_snapshot: Database["public"]["Enums"]["vehicle_service_type_enum"]
          vehiculo_tipo_snapshot: Database["public"]["Enums"]["vehicle_type_enum"]
        }
        Insert: {
          cliente_direccion_snapshot?: string | null
          cliente_email_snapshot?: string | null
          cliente_id: string
          cliente_nombre_snapshot: string
          cliente_numero_documento_snapshot: string
          cliente_telefono_snapshot?: string | null
          cliente_tipo_documento_snapshot: string
          consecutivo: number
          created_at?: string
          deleted_at?: string | null
          es_reinspeccion?: boolean | null
          estado_orden?: Database["public"]["Enums"]["order_status_enum"]
          fecha?: string
          funcionario_firma_base64_snapshot: string
          funcionario_id: string
          funcionario_nombre_snapshot: string
          funcionario_numero_documento_snapshot: string
          funcionario_tipo_documento_snapshot: string
          gas_numero_snapshot?: string | null
          gas_vencimiento_snapshot?: string | null
          id?: string
          kilometraje?: string | null
          observaciones?: string | null
          oficina_consecutivo_factura?: string | null
          oficina_pago?: number | null
          oficina_pin?: string | null
          oficina_tipo_pago?:
            | Database["public"]["Enums"]["office_payment_type_enum"]
            | null
          plantilla_id: string
          propietario_direccion_snapshot?: string | null
          propietario_email_snapshot?: string | null
          propietario_id: string
          propietario_nombre_snapshot: string
          propietario_numero_documento_snapshot: string
          propietario_telefono_snapshot?: string | null
          propietario_tipo_documento_snapshot: string
          resultado_revision?: string | null
          se_compro_soat?: boolean
          service_type?: Database["public"]["Enums"]["service_type_enum"]
          soat_vencimiento_snapshot?: string | null
          tenant_id: string
          updated_at?: string
          vehiculo_blindaje_snapshot: boolean
          vehiculo_capacidad_pasajeros_snapshot: number
          vehiculo_cilindrada_snapshot: number
          vehiculo_clase_snapshot: string
          vehiculo_color_snapshot: string
          vehiculo_combustible_snapshot: string
          vehiculo_es_ensenanza_snapshot: boolean
          vehiculo_es_extranjero_snapshot: boolean
          vehiculo_id: string
          vehiculo_linea_snapshot: string
          vehiculo_marca_snapshot: string
          vehiculo_modelo_snapshot: number
          vehiculo_placa_snapshot: string
          vehiculo_tipo_servicio_snapshot: Database["public"]["Enums"]["vehicle_service_type_enum"]
          vehiculo_tipo_snapshot: Database["public"]["Enums"]["vehicle_type_enum"]
        }
        Update: {
          cliente_direccion_snapshot?: string | null
          cliente_email_snapshot?: string | null
          cliente_id?: string
          cliente_nombre_snapshot?: string
          cliente_numero_documento_snapshot?: string
          cliente_telefono_snapshot?: string | null
          cliente_tipo_documento_snapshot?: string
          consecutivo?: number
          created_at?: string
          deleted_at?: string | null
          es_reinspeccion?: boolean | null
          estado_orden?: Database["public"]["Enums"]["order_status_enum"]
          fecha?: string
          funcionario_firma_base64_snapshot?: string
          funcionario_id?: string
          funcionario_nombre_snapshot?: string
          funcionario_numero_documento_snapshot?: string
          funcionario_tipo_documento_snapshot?: string
          gas_numero_snapshot?: string | null
          gas_vencimiento_snapshot?: string | null
          id?: string
          kilometraje?: string | null
          observaciones?: string | null
          oficina_consecutivo_factura?: string | null
          oficina_pago?: number | null
          oficina_pin?: string | null
          oficina_tipo_pago?:
            | Database["public"]["Enums"]["office_payment_type_enum"]
            | null
          plantilla_id?: string
          propietario_direccion_snapshot?: string | null
          propietario_email_snapshot?: string | null
          propietario_id?: string
          propietario_nombre_snapshot?: string
          propietario_numero_documento_snapshot?: string
          propietario_telefono_snapshot?: string | null
          propietario_tipo_documento_snapshot?: string
          resultado_revision?: string | null
          se_compro_soat?: boolean
          service_type?: Database["public"]["Enums"]["service_type_enum"]
          soat_vencimiento_snapshot?: string | null
          tenant_id?: string
          updated_at?: string
          vehiculo_blindaje_snapshot?: boolean
          vehiculo_capacidad_pasajeros_snapshot?: number
          vehiculo_cilindrada_snapshot?: number
          vehiculo_clase_snapshot?: string
          vehiculo_color_snapshot?: string
          vehiculo_combustible_snapshot?: string
          vehiculo_es_ensenanza_snapshot?: boolean
          vehiculo_es_extranjero_snapshot?: boolean
          vehiculo_id?: string
          vehiculo_linea_snapshot?: string
          vehiculo_marca_snapshot?: string
          vehiculo_modelo_snapshot?: number
          vehiculo_placa_snapshot?: string
          vehiculo_tipo_servicio_snapshot?: Database["public"]["Enums"]["vehicle_service_type_enum"]
          vehiculo_tipo_snapshot?: Database["public"]["Enums"]["vehicle_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "entry_orders_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_orders_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "service_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_orders_plantilla_id_fkey"
            columns: ["plantilla_id"]
            isOneToOne: false
            referencedRelation: "order_template"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_orders_propietario_id_fkey"
            columns: ["propietario_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_orders_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_condition_results: {
        Row: {
          created_at: string
          entry_order_id: string
          id: string
          template_condition_id: string
          tenant_id: string
          updated_at: string
          value: Database["public"]["Enums"]["condition_response_enum"]
        }
        Insert: {
          created_at?: string
          entry_order_id: string
          id?: string
          template_condition_id: string
          tenant_id: string
          updated_at?: string
          value: Database["public"]["Enums"]["condition_response_enum"]
        }
        Update: {
          created_at?: string
          entry_order_id?: string
          id?: string
          template_condition_id?: string
          tenant_id?: string
          updated_at?: string
          value?: Database["public"]["Enums"]["condition_response_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "ocr_order_fkey"
            columns: ["entry_order_id"]
            isOneToOne: false
            referencedRelation: "entry_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_tenant_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_signatures: {
        Row: {
          created_at: string
          entry_order_id: string
          id: string
          signature_url: string
          template_signature_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          entry_order_id: string
          id?: string
          signature_url: string
          template_signature_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          entry_order_id?: string
          id?: string
          signature_url?: string
          template_signature_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_order_fkey"
            columns: ["entry_order_id"]
            isOneToOne: false
            referencedRelation: "entry_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_template_sig_fkey"
            columns: ["template_signature_id"]
            isOneToOne: false
            referencedRelation: "order_template_signatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_tenant_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_template: {
        Row: {
          base_contract_text: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          document_code: string
          document_date: string
          id: string
          is_active: boolean
          logo_url: string | null
          template_name: string
          tenant_id: string
          updated_at: string
          version: number
        }
        Insert: {
          base_contract_text?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_code: string
          document_date?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          template_name: string
          tenant_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          base_contract_text?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_code?: string
          document_date?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          template_name?: string
          tenant_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_template_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "service_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_template_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_template_conditions: {
        Row: {
          created_at: string
          default_value: Database["public"]["Enums"]["condition_response_enum"]
          deleted_at: string | null
          id: string
          is_special: boolean
          label: string
          order_template_id: string
          special_condition_label: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_value?: Database["public"]["Enums"]["condition_response_enum"]
          deleted_at?: string | null
          id?: string
          is_special?: boolean
          label: string
          order_template_id: string
          special_condition_label?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_value?: Database["public"]["Enums"]["condition_response_enum"]
          deleted_at?: string | null
          id?: string
          is_special?: boolean
          label?: string
          order_template_id?: string
          special_condition_label?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_template_conditions_template_id_fkey"
            columns: ["order_template_id"]
            isOneToOne: false
            referencedRelation: "order_template"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_template_conditions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_template_signature_conditions: {
        Row: {
          created_at: string
          declaration_text: string
          deleted_at: string | null
          id: string
          order_template_signature_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          declaration_text: string
          deleted_at?: string | null
          id?: string
          order_template_signature_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          declaration_text?: string
          deleted_at?: string | null
          id?: string
          order_template_signature_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signature_conditions_signature_id_fkey"
            columns: ["order_template_signature_id"]
            isOneToOne: false
            referencedRelation: "order_template_signatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_conditions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_template_signatures: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          order_template_id: string
          representative_type: string
          signature_label: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          order_template_id: string
          representative_type: string
          signature_label: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          order_template_id?: string
          representative_type?: string
          signature_label?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_template_signatures_template_id_fkey"
            columns: ["order_template_id"]
            isOneToOne: false
            referencedRelation: "order_template"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_template_signatures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          correo: string | null
          created_at: string
          deleted_at: string | null
          direccion: string | null
          id: string
          nombre_completo: string
          numero_documento: string
          telefono: string | null
          tenant_id: string
          tipo_documento: Database["public"]["Enums"]["document_type_enum"]
          updated_at: string
        }
        Insert: {
          correo?: string | null
          created_at?: string
          deleted_at?: string | null
          direccion?: string | null
          id?: string
          nombre_completo: string
          numero_documento: string
          telefono?: string | null
          tenant_id: string
          tipo_documento: Database["public"]["Enums"]["document_type_enum"]
          updated_at?: string
        }
        Update: {
          correo?: string | null
          created_at?: string
          deleted_at?: string | null
          direccion?: string | null
          id?: string
          nombre_completo?: string
          numero_documento?: string
          telefono?: string | null
          tenant_id?: string
          tipo_documento?: Database["public"]["Enums"]["document_type_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "personas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      service_users: {
        Row: {
          auth_user_id: string
          created_at: string
          document_number: string
          document_type: string
          full_name: string | null
          id: string
          is_active: boolean
          signature_base64: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          document_number: string
          document_type?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          signature_base64?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          document_number?: string
          document_type?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          signature_base64?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tenant_permissions: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role_enum"]
          service_user_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          service_user_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          service_user_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_permissions_service_user_id_fkey"
            columns: ["service_user_id"]
            isOneToOne: false
            referencedRelation: "service_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          domain: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          blindaje: boolean
          capacidad_pasajeros: number
          cilindrada: number
          clase: string
          color: string
          combustible: string
          created_at: string
          deleted_at: string | null
          es_ensenanza: boolean
          es_extranjero: boolean
          id: string
          linea: string
          marca: string
          modelo: number
          placa: string
          propietario_actual_id: string | null
          tenant_id: string
          tipo_servicio_vehiculo: Database["public"]["Enums"]["vehicle_service_type_enum"]
          tipo_vehiculo: Database["public"]["Enums"]["vehicle_type_enum"]
          updated_at: string
        }
        Insert: {
          blindaje?: boolean
          capacidad_pasajeros: number
          cilindrada: number
          clase: string
          color: string
          combustible: string
          created_at?: string
          deleted_at?: string | null
          es_ensenanza?: boolean
          es_extranjero?: boolean
          id?: string
          linea: string
          marca: string
          modelo: number
          placa: string
          propietario_actual_id?: string | null
          tenant_id: string
          tipo_servicio_vehiculo?: Database["public"]["Enums"]["vehicle_service_type_enum"]
          tipo_vehiculo: Database["public"]["Enums"]["vehicle_type_enum"]
          updated_at?: string
        }
        Update: {
          blindaje?: boolean
          capacidad_pasajeros?: number
          cilindrada?: number
          clase?: string
          color?: string
          combustible?: string
          created_at?: string
          deleted_at?: string | null
          es_ensenanza?: boolean
          es_extranjero?: boolean
          id?: string
          linea?: string
          marca?: string
          modelo?: number
          placa?: string
          propietario_actual_id?: string | null
          tenant_id?: string
          tipo_servicio_vehiculo?: Database["public"]["Enums"]["vehicle_service_type_enum"]
          tipo_vehiculo?: Database["public"]["Enums"]["vehicle_type_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_propietario_fkey"
            columns: ["propietario_actual_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_full_order: { Args: { p_data: Json }; Returns: string }
      create_full_order_template: { Args: { p_data: Json }; Returns: string }
      fetch_data_with_placa: {
        Args: { p_placa: string; p_tenant_id: string }
        Returns: Json
      }
      fetch_entry_order_by_id: {
        Args: { p_order_id: string; p_tenant_id?: string }
        Returns: {
          cliente_documento: string
          cliente_id: string
          cliente_nombre: string
          cliente_tipo_documento: string
          condiciones_plantilla: Json
          consecutivo: number
          created_at: string
          es_reinspeccion: boolean
          estado_orden: Database["public"]["Enums"]["order_status_enum"]
          fecha: string
          firmas_orden: Json
          funcionario_documento: string
          funcionario_firma: string
          funcionario_id: string
          funcionario_nombre: string
          gas_numero_snapshot: string
          gas_vencimiento_snapshot: string
          id: string
          kilometraje: string
          observaciones: string
          plantilla_codigo_documento: string
          plantilla_fecha_documento: string
          plantilla_id: string
          plantilla_logo_url: string
          plantilla_nombre: string
          plantilla_texto_contractual: string
          plantilla_version: number
          presiones_llantas: Json
          propietario_documento: string
          propietario_id: string
          propietario_nombre: string
          propietario_tipo_documento: string
          service_type: Database["public"]["Enums"]["service_type_enum"]
          soat_vencimiento_snapshot: string
          tenant_id: string
          updated_at: string
          vehiculo_blindaje: boolean
          vehiculo_capacidad_pasajeros: number
          vehiculo_cilindrada: number
          vehiculo_clase: string
          vehiculo_color: string
          vehiculo_combustible: string
          vehiculo_es_ensenanza: boolean
          vehiculo_es_extranjero: boolean
          vehiculo_id: string
          vehiculo_linea: string
          vehiculo_marca: string
          vehiculo_modelo: number
          vehiculo_placa: string
          vehiculo_tipo_servicio_vehiculo: Database["public"]["Enums"]["vehicle_service_type_enum"]
          vehiculo_tipo_vehiculo: Database["public"]["Enums"]["vehicle_type_enum"]
        }[]
      }
      fetch_entry_orders_list: {
        Args: {
          p_cliente_documento?: string
          p_estado?: Database["public"]["Enums"]["order_status_enum"]
          p_fecha_desde?: string
          p_fecha_hasta?: string
          p_limit?: number
          p_offset?: number
          p_order_by_column?: string
          p_order_by_direction?: string
          p_placa?: string
          p_propietario_documento?: string
          p_search_column?: string
          p_search_term?: string
          p_show_deleted?: boolean
          p_tenant_id: string
        }
        Returns: {
          cliente_documento: string
          cliente_nombre: string
          cliente_tipo_documento: string
          es_reinspeccion: boolean
          estado_orden: Database["public"]["Enums"]["order_status_enum"]
          fecha: string
          id: string
          kilometraje: string
          linea: string
          marca: string
          oficina_consecutivo_factura: string
          oficina_pago: number
          oficina_pin: string
          oficina_tipo_pago: Database["public"]["Enums"]["office_payment_type_enum"]
          placa: string
          propietario_documento: string
          propietario_nombre: string
          propietario_tipo_documento: string
          resultado_revision: string
          se_compro_soat: boolean
          service_type: Database["public"]["Enums"]["service_type_enum"]
          soat_vencimiento_snapshot: string
          total_count: number
          vehiculo_tipo_servicio_snapshot: Database["public"]["Enums"]["vehicle_service_type_enum"]
          vehiculo_tipo_snapshot: Database["public"]["Enums"]["vehicle_type_enum"]
        }[]
      }
      fetch_orders_templates: {
        Args: { p_tenant_id: string }
        Returns: {
          base_contract_text: string
          conditions: Json
          created_at: string
          created_by: string
          document_code: string
          document_date: string
          id: string
          is_active: boolean
          logo_url: string
          signatures: Json
          template_name: string
          tenant_id: string
          updated_at: string
          version: number
        }[]
      }
      get_tenant_data: {
        Args: { p_tenant_slug: string }
        Returns: {
          domain: string
          id: string
          logo_url: string
          name: string
        }[]
      }
      get_tenant_name: { Args: { p_tenant_slug: string }; Returns: string }
      get_tenant_roles: { Args: { p_tenant_id: string }; Returns: string[] }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_office_order_data: {
        Args: {
          p_consecutivo_factura: string
          p_order_id: string
          p_pago: number
          p_pin: string
          p_se_compro_soat: boolean
          p_tipo_pago: string
        }
        Returns: undefined
      }
    }
    Enums: {
      condition_response_enum: "cumple" | "no_cumple" | "no_aplica"
      document_type_enum:
        | "cedula_ciudadania"
        | "nit"
        | "nn"
        | "pasaporte"
        | "cedula_extranjeria"
        | "tarjeta_identidad"
        | "registro_civil"
        | "carnet_diplomatico"
        | "ti2"
      office_payment_type_enum:
        | "efectivo"
        | "tarjeta_debito"
        | "tarjeta_credito"
        | "sistecredito"
        | "addi"
        | "transferencia"
        | "qr"
      order_status_enum: "abierta" | "en_prueba" | "finalizada" | "anulada"
      service_type_enum: "RTM" | "preventiva" | "peritaje" | "otro"
      user_role_enum:
        | "gerente"
        | "recepcionista"
        | "aux_administrativo"
        | "director_tecnico"
      vehicle_service_type_enum:
        | "particular"
        | "enseñanza"
        | "oficial"
        | "publico"
        | "diplomático"
        | "especial"
      vehicle_type_enum:
        | "liviano"
        | "pesado"
        | "motocicleta_4t"
        | "motocicleta_2t"
        | "motocarro_4t"
        | "motocarro_2t"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      condition_response_enum: ["cumple", "no_cumple", "no_aplica"],
      document_type_enum: [
        "cedula_ciudadania",
        "nit",
        "nn",
        "pasaporte",
        "cedula_extranjeria",
        "tarjeta_identidad",
        "registro_civil",
        "carnet_diplomatico",
        "ti2",
      ],
      office_payment_type_enum: [
        "efectivo",
        "tarjeta_debito",
        "tarjeta_credito",
        "sistecredito",
        "addi",
        "transferencia",
        "qr",
      ],
      order_status_enum: ["abierta", "en_prueba", "finalizada", "anulada"],
      service_type_enum: ["RTM", "preventiva", "peritaje", "otro"],
      user_role_enum: [
        "gerente",
        "recepcionista",
        "aux_administrativo",
        "director_tecnico",
      ],
      vehicle_service_type_enum: [
        "particular",
        "enseñanza",
        "oficial",
        "publico",
        "diplomático",
        "especial",
      ],
      vehicle_type_enum: [
        "liviano",
        "pesado",
        "motocicleta_4t",
        "motocicleta_2t",
        "motocarro_4t",
        "motocarro_2t",
      ],
    },
  },
} as const

