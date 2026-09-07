"use client"

import { useMutation } from "@tanstack/react-query";

import { Database } from "../../../supabase/types/database.types";

import { createSupabaseBrowserClient } from "../supabase/client";

import { ServiceType } from "../zod-schemas/order-schema";

import { createVehicleServiceRateSchema } from "../zod-schemas/validaciones-formularios/create-vehicle-service-rate-schema";

// ============================================================
// TIPOS
// ============================================================

type VehicleType =
  Database["public"]["Enums"]["vehicle_type_enum"];

// ============================================================
// HOOK
// ============================================================

export function useCreateVehicleServiceRate() {
  return useMutation({
    mutationFn: async (rate: {
      tenant_id: string;
      vehicle_type: VehicleType;
      base_price_rtm: string;
      service_type: ServiceType;
    }) => {

      // ========================================================
      // VALIDAR DATOS
      // ========================================================

      const result = createVehicleServiceRateSchema.safeParse(rate);

    if (!result.success) {
  throw new Error(
    result.error.issues.map((issue) => issue.message).join("\n")
  );
}

      // ========================================================
      // CLIENTE SUPABASE
      // ========================================================

      const supabaseBrowser = createSupabaseBrowserClient();

      // ========================================================
      // CREAR RATE PRINCIPAL
      // ========================================================

      const { data, error } = await supabaseBrowser.rpc(
        "create_vehicle_service_rate",
        {
          p_tenant_id: rate.tenant_id,
          p_vehicle_type: rate.vehicle_type,
          p_base_price_rtm: Number(rate.base_price_rtm),
          p_service_type: rate.service_type,
        }
      );

      // ========================================================
      // ERROR DE SUPABASE / RPC
      // ========================================================

      if (error) {
        throw new Error(error.message);
      }

      // ========================================================
      // COMPROBAR QUE EL RPC RETORNÓ EL ID
      // ========================================================

      if (!data) {
        throw new Error(
          "La tarifa no pudo crearse. No se recibió el identificador de la tarifa. Verifica los permisos de escritura y las políticas RLS."
        );
      }

      // ========================================================
      // RETORNAR ID DE LA TARIFA CREADA
      // ========================================================

      return data;
    },
  });
}