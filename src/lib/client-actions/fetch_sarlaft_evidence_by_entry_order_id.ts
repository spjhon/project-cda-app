import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// ==========================================
// INTERFACE DE LA EVIDENCIA SARLAFT
// ==========================================

export interface SarlaftEvidence {
  id: string;
  tenant_id: string;
  entry_order_id: string;
  person_type: "customer" | "owner";

  // ========================================
  // Datos de la persona consultada
  // ========================================

  placa_snapshot: string;

  nombre_completo_snapshot: string;
  tipo_documento_snapshot: string;
  numero_documento_snapshot: string;

  actividad_economica_snapshot: string;
  origen_fondos_snapshot: string;
  es_persona_publicamente_expuesta_snapshot: boolean;

  // ========================================
  // Auditoría
  // ========================================

  created_at: string;

  // ========================================
  // Firmas
  // ========================================

  // Primera firma registrada para la orden.
  // Corresponde a la firma del cliente.
  cliente_firma_url: string | null;

  // Firma del funcionario / inspector.
  // Se obtiene del snapshot almacenado
  // directamente en entry_orders.
  funcionario_firma_base64_snapshot: string | null;
}

// ==========================================
// PARÁMETROS DEL HOOK
// ==========================================

interface UseFetchSarlaftEvidenceParams {
  orderId: string | undefined;
  readyToProcess: boolean;
}

// ==========================================
// CUSTOM HOOK
// ==========================================

export function useFetchSarlaftEvidence({
  orderId,
  readyToProcess,
}: UseFetchSarlaftEvidenceParams) {
  return useQuery<SarlaftEvidence[], Error>({
    queryKey: ["sarlaft-evidence", orderId],

    queryFn: async () => {
      if (!orderId) {
        return [];
      }

      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.rpc(
        "fetch_sarlaft_evidence_by_entry_order_id",
        {
          p_entry_order_id: orderId,
        },
      );

      if (error) {
        console.error("❌ Error en RPC SARLAFT:", error);
        throw new Error(error.message);
      }

      console.log("📦 Evidencias SARLAFT obtenidas:", data);

      if (!data || data.length === 0) {
        throw new Error(
          "No se encontraron evidencias SARLAFT para esta orden",
        );
      }

      const result = data as unknown as SarlaftEvidence[];

      console.log(
        "📦 Evidencias SARLAFT procesadas:",
        result.length,
      );

      return result;
    },

    enabled: !!orderId && readyToProcess,

    retry: 1,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}