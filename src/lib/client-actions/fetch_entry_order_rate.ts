"use client"

import { useQuery } from "@tanstack/react-query"

import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  calculateVehicleRateTotal,
  type CalculatedVehicleRate,
  type RateFeeForCalculation,
} from "../utils/calculate-vehicle-rate-total"

interface UseOrderRateArgs {
  orderId: string | undefined
  companyId: string | null
}

interface OrderRateData {
  rate_id: string
  base_price: number
  iva_percentage: number | null
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

      return calculateVehicleRateTotal({
        rates: rates.map((rate) => ({
          rateId: rate.rate_id,
          basePrice: Number(rate.base_price),
          ivaPercentage: rate.iva_percentage,
          fees: rate.fees ?? [],
        })),
      })
    },
  })
}