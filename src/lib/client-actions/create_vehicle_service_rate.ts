
"use client"

import { useMutation } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "../supabase/client";

import {
  CreateVehicleServiceRateInput,
  createVehicleServiceRateSchema,
} from "../zod-schemas/validaciones-formularios/create-vehicle-service-rate-schema";

import { Database } from "../../../supabase/types/database.types";

// ============================================================
// TIPOS
// ============================================================

type CreateVehicleServiceRateRpcArgs =
  Omit<
    Database["public"]["Functions"]["create_vehicle_service_rate"]["Args"],
    "p_iva_percentage"
  > & {
    p_iva_percentage: number | null;
  };

// ============================================================
// HOOK
// ============================================================

export function useCreateVehicleServiceRate() {
  return useMutation({

    mutationFn: async (rate: CreateVehicleServiceRateInput) => {

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

const rpcArgs: CreateVehicleServiceRateRpcArgs = {
  p_tenant_id: rate.tenant_id,
  p_vehicle_type: rate.vehicle_type,
  p_base_price_rtm: Number(rate.base_price_rtm),
  p_iva_percentage: rate.iva_percentage,
  p_service_type: rate.service_type,

  p_fuels: rate.fuels,
  p_classes: rate.classes,
  p_service_types: rate.service_types,

  p_fees: rate.fees,
};

      const { data, error } = await supabaseBrowser.rpc(
        "create_vehicle_service_rate",
        rpcArgs as Database["public"]["Functions"]["create_vehicle_service_rate"]["Args"]
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
