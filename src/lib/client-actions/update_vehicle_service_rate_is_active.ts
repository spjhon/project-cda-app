"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createSupabaseBrowserClient } from "@/lib/supabase/client"

interface UpdateVehicleRateActiveParams {
  id: string
  is_active: boolean
}

export function useUpdateVehicleRateActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: UpdateVehicleRateActiveParams) => {

        

      const supabase = createSupabaseBrowserClient()

      const { data, error } = await supabase
        .from("vehicle_service_rate")
        .update({
          is_active,
        })
        .eq("id", id)
        .select("id, is_active")
        .single()

      if (error) {
        console.error("Error al actualizar el estado de la tarifa:", error)

        throw new Error(
          error.message ||
            "No se pudo actualizar el estado de la tarifa"
        )
      }

      return data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicle-rates"],
      })
    },
  })
}