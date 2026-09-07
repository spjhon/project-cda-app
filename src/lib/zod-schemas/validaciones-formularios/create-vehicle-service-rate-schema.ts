import { z } from "zod";

// ==========================================
// SCHEMA: CREAR RATE
// ==========================================

export const createVehicleServiceRateSchema = z.object({
  // ==========================================
  // TENANT
  // ==========================================

  tenant_id: z.string("No se encontró un tenant válido"),

  // ==========================================
  // TIPO DE VEHÍCULO
  // ==========================================

  vehicle_type: z.enum(
    [
      "liviano",
      "pesado",
      "motocicleta_4t",
      "motocicleta_2t",
      "motocarro_4t",
      "motocarro_2t",
      "motocicleta_electrica",
      "motocarro_diesel",
    ],
    "El tipo de vehículo seleccionado no es válido"
  ),

  // ==========================================
  // PRECIO BASE
  // ==========================================

  base_price_rtm: z
    .number("El precio base debe ser un número")
    .min(0, "El precio base no puede ser negativo"),

  // ==========================================
  // TIPO DE SERVICIO
  // ==========================================

  service_type: z.enum(
    [
      "RTM",
      "preventiva",
      "peritaje",
    ],
    "El tipo de servicio seleccionado no es válido"
  ),
});

// ==========================================
// TYPE INFERIDO
// ==========================================

export type CreateVehicleServiceRateInput = z.infer<
  typeof createVehicleServiceRateSchema
>;