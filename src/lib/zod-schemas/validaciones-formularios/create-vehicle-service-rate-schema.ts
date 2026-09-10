import { z } from "zod";

import { createFeeSchema } from "./crear-fee-schema";

import { Database } from "../../../../supabase/types/database.types";

// ==========================================
// VALORES VÁLIDOS DE LOS ENUMS
// ==========================================

const VEHICLE_TYPES: Database["public"]["Enums"]["vehicle_type_enum"][] = [
  "liviano",
  "pesado",
  "motocicleta_4t",
  "motocicleta_2t",
  "motocarro_4t",
  "motocarro_2t",
  "motocicleta_electrica",
  "motocarro_diesel",
];

const SERVICE_TYPES: Database["public"]["Enums"]["service_type_enum"][] = [
  "RTM",
  "preventiva",
  "peritaje",
];

const FUEL_TYPES: Database["public"]["Enums"]["fuel_type_enum"][] = [
  "gasolina",
  "gas_natural_vehicular",
  "diesel",
  "gas_gasolina",
  "hibrido",
  "electrico",
  "etanol",
  "biodiesel",
  "hidrogeno",
];

const VEHICLE_CLASS_TYPES: Database["public"]["Enums"]["vehicle_class_enum"][] = [
  "automovil",
  "bus",
  "buseta",
  "camion",
  "camioneta",
  "campero",
  "microbus",
  "tractocamion",
  "motocicleta",
  "motocarro",
  "mototriciclo",
  "cuatrimoto",
  "remolque",
  "semiremolque",
  "volqueta",
  "sin_clase",
  "maquinaria_construccion_o_minera",
  "ciclomotor",
  "tricimoto",
  "cuadriciclo",
];

const VEHICLE_SERVICE_TYPE_TYPES: Database["public"]["Enums"]["vehicle_service_type_enum"][] = [
  "particular",
  "enseñanza",
  "oficial",
  "publico",
  "diplomático",
  "especial",
];

// ==========================================
// SCHEMA: CREAR RATE
// ==========================================

export const createVehicleServiceRateSchema = z.object({
  // ==========================================
  // TENANT
  // ==========================================

  tenant_id: z.string(
    "No se encontró un tenant válido"
  ),

  // ==========================================
  // TIPO DE VEHÍCULO
  // ==========================================

  vehicle_type: z.enum(
    VEHICLE_TYPES,
    "El tipo de vehículo seleccionado no es válido"
  ),

  // ==========================================
  // PRECIO BASE
  // ==========================================

  base_price_rtm: z
    .number("El precio base debe ser un número")
    .min(
      0,
      "El precio base no puede ser negativo"
    ),

  // ==========================================
  // IVA DEL PRECIO BASE
  // ==========================================

  iva_percentage: z
    .number("El IVA debe ser un número")
    .min(
      1,
      "El IVA no puede ser negativo O 0"
    )
    .max(
      100,
      "El IVA no puede ser superior al 100%"
    )
    .nullable(),

  // ==========================================
  // TIPO DE SERVICIO
  // ==========================================

  service_type: z.enum(
    SERVICE_TYPES,
    "El tipo de servicio seleccionado no es válido"
  ),

  // ==========================================
  // FUELS
  // ==========================================

  fuels: z.array(
    z.enum(
      FUEL_TYPES,
      "El tipo de combustible seleccionado no es válido"
    )
  ),

  // ==========================================
  // CLASSES
  // ==========================================

  classes: z.array(
    z.enum(
      VEHICLE_CLASS_TYPES,
      "La clase de vehículo seleccionada no es válida"
    )
  ),

  // ==========================================
  // SERVICE TYPES
  // ==========================================

  service_types: z.array(
    z.enum(
      VEHICLE_SERVICE_TYPE_TYPES,
      "El tipo de servicio de vehículo seleccionado no es válido"
    )
  ),

  // ==========================================
  // FEES
  // ==========================================

  fees: z.array(createFeeSchema),
});

// ==========================================
// TYPE INFERIDO
// ==========================================

export type CreateVehicleServiceRateInput = z.infer<
  typeof createVehicleServiceRateSchema
>;