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
      comment_attachments: {
        Row: {
          comment_id: string
          created_at: string
          file_path: string
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          file_path: string
          id?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          file_path?: string
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_attachments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_name: string
          comment_text: string
          created_at: string
          created_by: string
          id: string
          tenant_id: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          author_name: string
          comment_text: string
          created_at?: string
          created_by: string
          id?: string
          tenant_id: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          comment_text?: string
          created_at?: string
          created_by?: string
          id?: string
          tenant_id?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "service_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comments_to_tickets"
            columns: ["ticket_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id", "tenant_id"]
          },
        ]
      }
      entry_order_tire_pressures: {
        Row: {
          created_at: string
          deleted_at: string | null
          eje: number
          entry_order_id: string
          es_repuesto: boolean | null
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
          es_repuesto?: boolean | null
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
          es_repuesto?: boolean | null
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
          cliente_id: string
          consecutivo: number
          created_at: string
          deleted_at: string | null
          es_reinspeccion: boolean | null
          estado_orden: Database["public"]["Enums"]["order_status_enum"]
          fecha: string
          funcionario_id: string
          gas_numero_snapshot: string | null
          gas_vencimiento_snapshot: string | null
          id: string
          kilometraje: string | null
          observaciones: string | null
          plantilla_id: string
          propietario_id: string
          soat_vencimiento_snapshot: string | null
          tenant_id: string
          texto_contractual_snapshot: string | null
          updated_at: string
          vehiculo_id: string
        }
        Insert: {
          cliente_id: string
          consecutivo?: number
          created_at?: string
          deleted_at?: string | null
          es_reinspeccion?: boolean | null
          estado_orden?: Database["public"]["Enums"]["order_status_enum"]
          fecha?: string
          funcionario_id: string
          gas_numero_snapshot?: string | null
          gas_vencimiento_snapshot?: string | null
          id?: string
          kilometraje?: string | null
          observaciones?: string | null
          plantilla_id: string
          propietario_id: string
          soat_vencimiento_snapshot?: string | null
          tenant_id: string
          texto_contractual_snapshot?: string | null
          updated_at?: string
          vehiculo_id: string
        }
        Update: {
          cliente_id?: string
          consecutivo?: number
          created_at?: string
          deleted_at?: string | null
          es_reinspeccion?: boolean | null
          estado_orden?: Database["public"]["Enums"]["order_status_enum"]
          fecha?: string
          funcionario_id?: string
          gas_numero_snapshot?: string | null
          gas_vencimiento_snapshot?: string | null
          id?: string
          kilometraje?: string | null
          observaciones?: string | null
          plantilla_id?: string
          propietario_id?: string
          soat_vencimiento_snapshot?: string | null
          tenant_id?: string
          texto_contractual_snapshot?: string | null
          updated_at?: string
          vehiculo_id?: string
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
          special_value: boolean | null
          template_condition_id: string
          tenant_id: string
          updated_at: string
          value: Database["public"]["Enums"]["condition_response_enum"]
        }
        Insert: {
          created_at?: string
          entry_order_id: string
          id?: string
          special_value?: boolean | null
          template_condition_id: string
          tenant_id: string
          updated_at?: string
          value: Database["public"]["Enums"]["condition_response_enum"]
        }
        Update: {
          created_at?: string
          entry_order_id?: string
          id?: string
          special_value?: boolean | null
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
          signer_name: string
          template_signature_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          entry_order_id: string
          id?: string
          signature_url: string
          signer_name: string
          template_signature_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          entry_order_id?: string
          id?: string
          signature_url?: string
          signer_name?: string
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
          service_type: Database["public"]["Enums"]["service_type_enum"]
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
          service_type?: Database["public"]["Enums"]["service_type_enum"]
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
          service_type?: Database["public"]["Enums"]["service_type_enum"]
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
          updated_at?: string
        }
        Relationships: []
      }
      tenant_permissions: {
        Row: {
          created_at: string
          id: string
          role: string
          service_user_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          service_user_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
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
      tickets: {
        Row: {
          assignee: string | null
          assignee_name: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          status: string
          tenant_id: string
          ticket_number: number
          title: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          assignee_name?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          status?: string
          tenant_id: string
          ticket_number: number
          title: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          assignee_name?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          status?: string
          tenant_id?: string
          ticket_number?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assignee_fkey"
            columns: ["assignee"]
            isOneToOne: false
            referencedRelation: "service_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "service_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          blindaje: boolean | null
          capacidad_pasajeros: number | null
          cilindrada: number | null
          clase: string | null
          color: string | null
          combustible: string | null
          created_at: string
          deleted_at: string | null
          es_ensenanza: boolean | null
          id: string
          linea: string | null
          marca: string | null
          modelo: number | null
          placa: string
          propietario_actual_id: string | null
          tenant_id: string
          tipo_servicio_vehiculo: Database["public"]["Enums"]["vehicle_service_type_enum"]
          tipo_vehiculo: Database["public"]["Enums"]["vehicle_type_enum"]
          updated_at: string
        }
        Insert: {
          blindaje?: boolean | null
          capacidad_pasajeros?: number | null
          cilindrada?: number | null
          clase?: string | null
          color?: string | null
          combustible?: string | null
          created_at?: string
          deleted_at?: string | null
          es_ensenanza?: boolean | null
          id?: string
          linea?: string | null
          marca?: string | null
          modelo?: number | null
          placa: string
          propietario_actual_id?: string | null
          tenant_id: string
          tipo_servicio_vehiculo?: Database["public"]["Enums"]["vehicle_service_type_enum"]
          tipo_vehiculo: Database["public"]["Enums"]["vehicle_type_enum"]
          updated_at?: string
        }
        Update: {
          blindaje?: boolean | null
          capacidad_pasajeros?: number | null
          cilindrada?: number | null
          clase?: string | null
          color?: string | null
          combustible?: string | null
          created_at?: string
          deleted_at?: string | null
          es_ensenanza?: boolean | null
          id?: string
          linea?: string | null
          marca?: string | null
          modelo?: number | null
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
      create_full_order_template: { Args: { p_data: Json }; Returns: string }
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
          service_type: Database["public"]["Enums"]["service_type_enum"]
          signatures: Json
          template_name: string
          tenant_id: string
          updated_at: string
          version: number
        }[]
      }
      get_service_users_with_tenant: {
        Args: { target_tenant_id: string }
        Returns: {
          auth_user_id: string
          created_at: string
          document_number: string
          document_type: string
          full_name: string | null
          id: string
          is_active: boolean
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "service_users"
          isOneToOne: false
          isSetofReturn: true
        }
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
      order_status_enum: "abierta" | "en_prueba" | "finalizada" | "anulada"
      service_type_enum: "RTM" | "preventiva" | "peritaje" | "otro"
      vehicle_service_type_enum:
        | "particular"
        | "enseñanza"
        | "oficial"
        | "publico"
        | "diplomático"
        | "especial"
      vehicle_type_enum: "motocicleta" | "liviano" | "pesado" | "motocarro"
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
      order_status_enum: ["abierta", "en_prueba", "finalizada", "anulada"],
      service_type_enum: ["RTM", "preventiva", "peritaje", "otro"],
      vehicle_service_type_enum: [
        "particular",
        "enseñanza",
        "oficial",
        "publico",
        "diplomático",
        "especial",
      ],
      vehicle_type_enum: ["motocicleta", "liviano", "pesado", "motocarro"],
    },
  },
} as const

