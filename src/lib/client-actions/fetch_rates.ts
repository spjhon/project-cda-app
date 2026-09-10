"use client"

import { useQuery } from "@tanstack/react-query"

import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Database } from "../../../supabase/types/database.types"



// ===========================================================
// TIPOS DE ENUMS
// ============================================================

type VehicleType =
  Database["public"]["Enums"]["vehicle_type_enum"]

type ServiceType =
  Database["public"]["Enums"]["service_type_enum"]

type FuelType =
  Database["public"]["Enums"]["fuel_type_enum"]

type VehicleClass =
  Database["public"]["Enums"]["vehicle_class_enum"]

type VehicleServiceType =
  Database["public"]["Enums"]["vehicle_service_type_enum"]


// ============================================================
// TIPO DE FEE
// ============================================================

export interface VehicleRateFee {
  id: string
  tenant_id: string
  name: string
  description: string | null
  fee_amount: number
  iva_percentage: number | null
  vehicle_age_from: number | null
  vehicle_age_to: number | null
  created_at: string
  updated_at: string
}


// ============================================================
// TIPO DE RATE
// ============================================================

export interface VehicleRate {
  id: string
  tenant_id: string

  vehicle_type: VehicleType

  base_price: number
  iva_percentage: number | null

  service_type: ServiceType

  is_active: boolean
  created_at: string

  fuels: FuelType[]
  classes: VehicleClass[]
  service_types: VehicleServiceType[]

  fees: VehicleRateFee[]
}


// ============================================================
// PARÁMETROS DEL HOOK
// ============================================================

interface UseVehicleRatesParams {
  tenantId: string | undefined
  enabled?: boolean
}


// ============================================================
// HOOK: OBTENER VEHICLE RATES
// ============================================================

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
        "fetch_vehicle_service_rates",
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

      return (data ?? []) as unknown as VehicleRate[]
    },

    enabled: !!tenantId && enabled,

    staleTime: Infinity,

    refetchOnWindowFocus: false,

    retry: 1,
  })
}