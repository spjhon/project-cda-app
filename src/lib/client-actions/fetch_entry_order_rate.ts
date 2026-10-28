
"use client"

import { useQuery } from "@tanstack/react-query"

import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { calculateVehicleRateTotal } from "../utils/calculate-vehicle-rate-total"

interface UseOrderRateArgs {
  orderId: string | undefined
  companyId: string | null
}

interface OrderRateFee {
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

interface RateCompany {
  id: string;
  name: string;
}


interface OrderRateData {
  rate_id: string;
  base_price: number;
  iva_percentage: number | null;
  fees: OrderRateFee[];
  companies: RateCompany[];
}

export interface CalculatedOrderRate {
  rateId: string
  basePrice: number
  ivaPercentage: number | null
  fees: OrderRateFee[]
  totalPrice: number
}

export function useOrderRate({
  orderId,
  companyId,
}: UseOrderRateArgs) {
  const supabase = createSupabaseBrowserClient()

  return useQuery<CalculatedOrderRate, Error>({
    queryKey: ["order-rate", orderId, companyId],
    enabled: Boolean(orderId),
    staleTime: 0,

    queryFn: async (): Promise<CalculatedOrderRate> => {
      if (!orderId) {
        throw new Error("No se proporcionó un ID de orden válido")
      }

      const { data, error } = await supabase.rpc(
        "fetch_order_rate",
        {
          p_order_id: orderId,
          p_company_id: companyId ?? undefined,
        },
      )

      if (error) {
        throw new Error(error.message)
      }

      if (!data || data.length === 0) {
        throw new Error(
          "No se encontró una tarifa asociada a la orden",
        )
      }

      const rate = data[0] as unknown as OrderRateData

      const basePrice = Number(rate.base_price)

      
const totalPrice = calculateVehicleRateTotal({
  basePrice,
  ivaPercentage: rate.iva_percentage,
  fees: rate.fees ?? [],
})

      return {
        rateId: rate.rate_id,
        basePrice,
        ivaPercentage: rate.iva_percentage,
        fees: rate.fees ?? [],
        totalPrice,
      }
    },
  })
}
