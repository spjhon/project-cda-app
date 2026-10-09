
"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { createSupabaseBrowserClient } from "../supabase/client";
import { AnaliticaFilters } from "@/components/dashboard/admin/AnaliticicaRangoPersonalizado";

export function useAnaliticaPersonalizada(filters: AnaliticaFilters) {
  return useQuery({
    queryKey: ["analitica-personalizada", filters],

    queryFn: async (): Promise<number> => {
      const supabaseBrowser = createSupabaseBrowserClient();

      const { data, error } = await supabaseBrowser.rpc(
        "get_analitica_personalizada",
        {
          p_fecha_inicio: filters.dateRange?.from
            ? format(filters.dateRange.from, "yyyy-MM-dd")
            : undefined,

          p_fecha_fin: filters.dateRange?.to
            ? format(filters.dateRange.to, "yyyy-MM-dd")
            : undefined,

          p_vehicle_type:
            filters.vehicleType === "todos"
              ? undefined
              : filters.vehicleType,

          p_result:
            filters.result === "todos"
              ? undefined
              : filters.result,

          p_service_type:
            filters.serviceType === "todos"
              ? undefined
              : filters.serviceType,

          p_soat_purchased:
            filters.soatPurchased === "todos"
              ? undefined
              : filters.soatPurchased,
        }
      );

      if (error) {
        throw error;
      }

      

      return data ?? 0;
    },

    // No consultar automáticamente al montar el componente.
    enabled: false,

    // Mantener los datos en caché durante 30 segundos.
    staleTime: 30_000,
  });
}