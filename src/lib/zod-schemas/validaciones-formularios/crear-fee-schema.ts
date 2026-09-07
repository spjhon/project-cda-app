
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
      .min(0, "El IVA no puede ser negativo")
      .max(100, "El IVA no puede ser superior al 100%"),

    // ==========================================
    // AÑO MODELO DESDE
    // ==========================================

    model_year_from: z
      .number("El año inicial debe ser un número")
      .int("El año inicial debe ser un número entero")
      .min(1900, "El año inicial mínimo permitido es 1900")
      .optional()
      .nullable(),

    // ==========================================
    // AÑO MODELO HASTA
    // ==========================================

    model_year_to: z
      .number("El año final debe ser un número")
      .int("El año final debe ser un número entero")
      .min(1900, "El año final mínimo permitido es 1900")
      .optional()
      .nullable(),


 

  })

  // ==========================================
  // VALIDAR RANGO DE AÑOS
  // ==========================================

  .refine(
    (data) => {

      // Si alguno de los dos años no existe,
      // no hay nada que comparar.

      if (
        data.model_year_from === null ||
        data.model_year_from === undefined ||
        data.model_year_to === null ||
        data.model_year_to === undefined
      ) {
        return true
      }

      // El año inicial no puede ser superior
      // al año final.

      return data.model_year_from <= data.model_year_to
    },
    {
      message:
        "El año inicial no puede ser superior al año final",
      path: ["model_year_to"],
    }
  )

// ==========================================
// TYPE INFERIDO
// ==========================================

export type CreateFeeInput = z.infer<typeof createFeeSchema>
