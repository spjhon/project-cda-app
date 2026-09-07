"use client"

import { useQuery } from "@tanstack/react-query"

import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { TipoVehiculoEnumType } from "@/lib/zod-schemas/order-schema"

export interface VehicleRate {
  id: string
  tenant_id: string
  vehicle_type: TipoVehiculoEnumType
  base_price: number
  service_type: "RTM" | "preventiva" | "peritaje" | "otro"
  created_at: string
}

interface UseVehicleRatesParams {
  tenantId: string | undefined
  enabled?: boolean
}

export function useVehicleRates({
  tenantId,
  enabled = true,
}: UseVehicleRatesParams) {
  return useQuery<VehicleRate[], Error>({
    queryKey: ["vehicle-rates", tenantId],

    queryFn: async () => {
      if (!tenantId) {
        throw new Error("No se encontró el ID del tenant")
      }

      const supabase = createSupabaseBrowserClient()

      const { data, error } = await supabase.rpc(
        "fetch_active_vehicle_service_rates",
        {
          p_tenant_id: tenantId,
        }
      )

      if (error) {
        console.error("Error en RPC:", error)
        throw new Error(
          error.message || "Error al obtener las tarifas"
        )
      }

    await new Promise((resolve) => setTimeout(resolve, 3000))

      return (data ?? []) as VehicleRate[]
    },

    enabled: !!tenantId && enabled,

    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}