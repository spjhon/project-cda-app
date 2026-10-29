
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

interface DeleteVehicleRateParams {
  id: string
}

export function useDeleteVehicleRate() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeleteVehicleRateParams>({
    mutationFn: async ({ id }) => {
      const supabase = createSupabaseBrowserClient()

      const { error } = await supabase
        .from("vehicle_service_rate")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Error al eliminar la tarifa:", error)

        // Error de llave foránea: la tarifa está siendo utilizada.
        if (
          error.code === "23503" ||
          error.message.includes(
            "entry_orders_vehicle_service_rate_id_fkey",
          )
        ) {
          throw new Error(
            "No se puede eliminar esta tarifa porque está asociada a una o varias órdenes de ingreso.",
          )
        }

        throw new Error(
          "No fue posible eliminar la tarifa. Inténtalo nuevamente.",
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicle-rates"],
      })
    },
  })
}
