"use client";

import { useQuery } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface UseOrderRateArgs {
  orderId: string | undefined;
}

interface OrderRateFee {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  fee_amount: number;
  iva_percentage: number | null;
  vehicle_age_from: number | null;
  vehicle_age_to: number | null;
  created_at: string;
  updated_at: string;
}

interface OrderRateData {
  rate_id: string;
  base_price: number;
  iva_percentage: number | null;
  fees: OrderRateFee[];
}

export interface CalculatedOrderRate {
  rateId: string;
  basePrice: number;
  ivaPercentage: number | null;
  fees: OrderRateFee[];
  totalPrice: number;
}

export function useOrderRate({ orderId }: UseOrderRateArgs) {
  const supabase = createSupabaseBrowserClient();

  return useQuery<CalculatedOrderRate, Error>({
    queryKey: ["order-rate", orderId],
    enabled: !!orderId,
     staleTime: Infinity,
    queryFn: async (): Promise<CalculatedOrderRate> => {
      if (!orderId) {
        throw new Error("No se proporcionó un ID de orden válido");
      }


    //await new Promise((resolve) => setTimeout(resolve, 3000));

      const { data, error } = await supabase.rpc(
        "fetch_order_rate",
        {
          p_order_id: orderId,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        throw new Error(
          "No se encontró una tarifa asociada a la orden"
        );
      }

      const rate = data[0] as unknown as OrderRateData;

      const basePrice = Number(rate.base_price);

      /**
       * IVA del precio base de la tarifa.
       *
       * Se redondea individualmente antes de sumarlo.
       */
      const baseIva =
        rate.iva_percentage != null
          ? Math.round(
              basePrice * (Number(rate.iva_percentage) / 100)
            )
          : 0;

      /**
       * Calcular el valor de cada fee incluyendo
       * únicamente su propio IVA cuando corresponda.
       *
       * El IVA de cada fee se redondea individualmente.
       */
      const feesTotal = (rate.fees ?? []).reduce(
        (total, fee) => {
          const feeAmount = Number(fee.fee_amount);

          const feeIva =
            fee.iva_percentage != null
              ? Math.round(
                  feeAmount *
                    (Number(fee.iva_percentage) / 100)
                )
              : 0;

          return total + feeAmount + feeIva;
        },
        0
      );

      /**
       * Precio final:
       *
       * precio base
       * + IVA del precio base ya redondeado
       * + fees
       * + IVA de cada fee ya redondeado
       *
       * Finalmente se redondea nuevamente el total.
       */
      const totalPrice = Math.round(
        basePrice + baseIva + feesTotal
      );

      return {
        rateId: rate.rate_id,
        basePrice,
        ivaPercentage: rate.iva_percentage,
        fees: rate.fees ?? [],
        totalPrice,
      };
    },
  });
}