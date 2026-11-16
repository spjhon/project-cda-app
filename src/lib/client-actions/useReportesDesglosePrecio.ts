"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Database } from "../../../supabase/types/database.types";
import { DesglosePrecioData } from "@/types/functions_types";

// ============================================================
// TIPOS (importados de un archivo aparte o definidos aquí)
// ============================================================
// (asume que los tipos DesglosePrecioDiaItem, DesglosePrecioMesItem
//  y DesglosePrecioData están definidos en un archivo de tipos)

type ServiceTypeEnum = Database["public"]["Enums"]["service_type_enum"] | null;

// ============================================================
// PARÁMETROS DEL HOOK
// ============================================================

interface UseReportesDesglosePrecioArgs {
  // Tenant activo (obligatorio)
  tenantId: string | undefined;

  // Mes y año solicitados (obligatorios)
  mes: number;
  ano: number;

  // Filtro opcional por tipo de servicio (RTM, preventiva, prueba_gases)
  serviceType: ServiceTypeEnum;

  // Habilitar/deshabilitar la query (útil para controlar desde el context)
  enabled?: boolean;
}

// ============================================================
// HOOK
// ============================================================

export function useReportesDesglosePrecio({
  tenantId,
  mes,
  ano,
  serviceType,
  enabled = true,
}: UseReportesDesglosePrecioArgs) {
  const supabase = createSupabaseBrowserClient();

  return useQuery<DesglosePrecioData, Error>({
    // Query key: cambia cuando cambian los filtros, para que TanStack
    // Query vuelva a llamar la RPC y no use caché vieja.
    queryKey: [
      "admin_reportes_desglose_precio",
      tenantId,
      mes,
      ano,
      serviceType,
    ],

    queryFn: async (): Promise<DesglosePrecioData> => {
      if (!tenantId) {
        throw new Error("No se encontró el tenant activo");
      }

      const { data, error } = await supabase.rpc(
        "fetch_reportes_desglose_precio",
        {
          p_tenant_id: tenantId,
          p_ano: ano,
          p_mes: mes,
          p_service_type: serviceType ?? undefined,
        },
      );

      if (error) {
        console.error(
          "Error al extraer desglose de precios:",
          error.message,
        );
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        throw new Error(
          "El RPC de desglose de precios no devolvió datos",
        );
      }

      // La RPC devuelve una sola fila con dos columnas JSON
      return data[0] as unknown as DesglosePrecioData;
    },

    // Habilitar solo si hay tenantId y el context lo permite
    enabled: Boolean(tenantId) && enabled,

    // Mantener datos anteriores mientras se carga el nuevo mes/año
    // (evita parpadeos al cambiar de mes)
    placeholderData: keepPreviousData,

    // Sin refresco automático: los datos son históricos (hasta ayer),
    // el cron de la vista se encarga de actualizarlos a las 00:01.
    // Si quieres refresco periódico, descomenta:
    // refetchInterval: 60000,

    // No refrescar al volver a la pestaña (datos históricos)
    refetchOnWindowFocus: false,

    // Los datos cambian solo cuando cambia el cron (diario), así
    // que la caché puede durar bastante. Pero si el usuario cambia
    // de mes, la queryKey cambia y se vuelve a llamar.
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}