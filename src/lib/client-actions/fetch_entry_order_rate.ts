"use client"

import { useQuery } from "@tanstack/react-query"

import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  calculateVehicleRateTotal,
  type CalculatedVehicleRate,
} from "../utils/calculate-vehicle-rate-total"


export interface RateFeeForCalculation {
  // ============ Identificación ============
  id: string
  tenant_id: string
  name: string
  description: string | null

  // ============ Montos base ============
  fee_amount: number
  iva_percentage: number | null

  // ============ Rango de edad ============
  vehicle_age_from: number | null
  vehicle_age_to: number | null

  // ============ Auditoría (vienen de la RPC) ============
  created_at: string
  updated_at: string
}


interface UseOrderRateArgs {
  orderId: string | undefined
  companyId: string | null
}

export interface OrderRateData {
  // ============ Identificación ============
  rate_id: string
  name: string

  // ============ Montos base ============
  base_price: number
  iva_percentage: number | null

  // ============ Edad del vehículo calculada por la RPC ============
  vehicle_age_years: number | null

  // ============ Fees aplicables ============
  fees: RateFeeForCalculation[]
}

export function useOrderRate({
  orderId,
  companyId,
}: UseOrderRateArgs) {
  const supabase = createSupabaseBrowserClient()

  return useQuery<CalculatedVehicleRate[], Error>({
    queryKey: ["order-rate", orderId, companyId],
    enabled: Boolean(orderId),
    staleTime: 0,

    queryFn: async (): Promise<CalculatedVehicleRate[]> => {
      if (!orderId) {
        throw new Error("No se proporcionó un ID de orden válido")
      }

      const { data, error } = await supabase.rpc("fetch_order_rate", {
        p_order_id: orderId,
        p_company_id: companyId ?? undefined,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data || data.length === 0) {
        throw new Error("No se encontraron tarifas asociadas a la orden")
      }

      const rates = data as unknown as OrderRateData[]

      return calculateVehicleRateTotal({rates})
    },
  })
}