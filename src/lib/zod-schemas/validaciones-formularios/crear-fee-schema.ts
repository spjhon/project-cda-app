import { z } from "zod"

// ==========================================
// SCHEMA: CREAR FEE
// ==========================================

export const createFeeSchema = z
  .object({

    tenant_id: z.string("No se encontró un tenant válido"),

    // ==========================================
    // NOMBRE
    // ==========================================

    name: z
      .string("El nombre del fee debe ser un texto")
      .trim()
      .min(1, "El nombre del fee es requerido"),

    // ==========================================
    // DESCRIPCIÓN
    // ==========================================

    description: z
      .string("La descripción debe ser un texto")
      .trim()
      .optional()
      .or(z.literal("")),

    // ==========================================
    // VALOR DEL FEE
    // ==========================================

    fee_amount: z
      .number("El valor del fee debe ser un número")
      .min(0, "El valor del fee no puede ser negativo"),

    // ==========================================
    // IVA
    // ==========================================

    iva_percentage: z
      .number("El IVA debe ser un número")
      .min(1, "El IVA no puede ser negativo o 0")
      .max(100, "El IVA no puede ser superior al 100%")
      .nullable(),

    // ==========================================
    // ANTIGÜEDAD DEL VEHÍCULO DESDE
    // ==========================================

    vehicle_age_from: z
      .number("La antigüedad inicial debe ser un número")
      .int("La antigüedad inicial debe ser un número entero")
      .min(0, "La antigüedad inicial no puede ser negativa")
      .optional()
      .nullable(),

    // ==========================================
    // ANTIGÜEDAD DEL VEHÍCULO HASTA
    // ==========================================

    vehicle_age_to: z
      .number("La antigüedad final debe ser un número")
      .int("La antigüedad final debe ser un número entero")
      .min(0, "La antigüedad final no puede ser negativa")
      .optional()
      .nullable(),
  })

  // ==========================================
  // VALIDAR RANGO DE ANTIGÜEDAD
  // ==========================================

  .refine(
    (data) => {

      // Si alguno de los dos límites no existe,
      // no hay nada que comparar.

      if (
        data.vehicle_age_from === null ||
        data.vehicle_age_from === undefined ||
        data.vehicle_age_to === null ||
        data.vehicle_age_to === undefined
      ) {
        return true
      }

      // La antigüedad inicial no puede ser superior
      // a la antigüedad final.

      return data.vehicle_age_from <= data.vehicle_age_to
    },
    {
      message:
        "La antigüedad inicial no puede ser superior a la antigüedad final",
      path: ["vehicle_age_to"],
    }
  )

// ==========================================
// TYPE INFERIDO
// ==========================================

export type CreateFeeInput = z.infer<typeof createFeeSchema>