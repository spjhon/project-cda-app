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

        throw new Error(
          error.message || "Error al eliminar la tarifa"
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