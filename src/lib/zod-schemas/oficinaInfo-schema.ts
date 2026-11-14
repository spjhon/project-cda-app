import { z } from "zod"

// ============================================================
// ENUMS DE PAGO
// ============================================================

const TipoPagoEnum = [
  "efectivo",
  "tarjeta_debito",
  "tarjeta_credito",
  "sistecredito",
  "addi",
  "transferencia",
  "qr",
] as const

// ============================================================
// SCHEMA: OFFICE ORDER (el que ya tienes)
// ============================================================

export const officeOrderSchema = z.object({
  oficina_consecutivo_factura: z
    .string()
    .trim()
    .min(1, { message: "El consecutivo de la factura es obligatorio" }),

  se_compro_soat: z.boolean({
    message: "Debe especificar si se gestionó el SOAT",
  }),
})

// ============================================================
// SCHEMA: PRICE SNAPSHOT (NUEVO)
// ============================================================
// Valida el desglose que envía el frontend cuando se confirma
// el pago. Se pasa tal cual a la RPC update_office_order_data,
// que lo inserta en entry_order_price_snapshot (cabecera) y
// entry_order_fee_snapshot (detalle).
//
// Reglas:
//   - Montos >= 0 (no aceptamos negativos)
//   - IVA% entre 0 y 100 (o null)
//   - Nombres no vacíos (trim)
//   - `total` debe ser coherente: subtotal + ivaTotal
//     (validación cruzada con .refine)
// ============================================================

export const priceSnapshotFeeSchema = z.object({
  feeName: z
    .string()
    .trim()
    .min(1, { message: "El nombre del fee es obligatorio" }),

  feeDescription: z.string().nullable(),

  vehicleAgeYears: z
    .number()
    .int()
    .min(0, { message: "La edad del vehículo no puede ser negativa" })
    .nullable(),

  vehicleAgeFrom: z
    .number()
    .int()
    .min(0)
    .nullable(),

  vehicleAgeTo: z
    .number()
    .int()
    .min(0)
    .nullable(),

  feeAmount: z
    .number()
    .min(0, { message: "El monto del fee no puede ser negativo" }),

  ivaPercentage: z
    .number()
    .min(0)
    .max(100, { message: "El IVA debe estar entre 0 y 100" })
    .nullable(),

  ivaAmount: z
    .number()
    .min(0, { message: "El IVA del fee no puede ser negativo" }),

  feeTotal: z
    .number()
    .min(0, { message: "El total del fee no puede ser negativo" }),
})

export const priceSnapshotSchema = z
  .object({
    rateName: z
      .string()
      .trim()
      .min(1, { message: "El nombre de la tarifa es obligatorio" }),

    basePrice: z
      .number()
      .min(0, { message: "El precio base no puede ser negativo" }),

    baseIvaPercentage: z
      .number()
      .min(0)
      .max(100, { message: "El IVA base debe estar entre 0 y 100" })
      .nullable(),

    baseIvaAmount: z
      .number()
      .min(0, { message: "El IVA base no puede ser negativo" }),

    feesSubtotal: z.number().min(0),
    feesIvaTotal: z.number().min(0),
    subtotal: z.number().min(0),
    ivaTotal: z.number().min(0),
    total: z.number().min(0),

    fees: z.array(priceSnapshotFeeSchema),
  })
  // --------------------------------------------------------
  // Validaciones cruzadas (coherencia aritmética)
  // --------------------------------------------------------
  .refine(
    (data) => data.subtotal === data.basePrice + data.feesSubtotal,
    {
      message:
        "El subtotal no coincide con basePrice + feesSubtotal",
      path: ["subtotal"],
    },
  )
  .refine(
    (data) => data.ivaTotal === data.baseIvaAmount + data.feesIvaTotal,
    {
      message:
        "El ivaTotal no coincide con baseIvaAmount + feesIvaTotal",
      path: ["ivaTotal"],
    },
  )
  .refine((data) => data.total === data.subtotal + data.ivaTotal, {
    message: "El total no coincide con subtotal + ivaTotal",
    path: ["total"],
  })
  // Validación cruzada opcional: suma de feesSubtotal
  .refine(
    (data) => {
      const sum = data.fees.reduce((acc, f) => acc + f.feeAmount, 0)
      return sum === data.feesSubtotal
    },
    {
      message:
        "feesSubtotal no coincide con la suma de feeAmount de los fees",
      path: ["feesSubtotal"],
    },
  )
  // Validación cruzada opcional: suma de feesIvaTotal
  .refine(
    (data) => {
      const sum = data.fees.reduce((acc, f) => acc + f.ivaAmount, 0)
      return sum === data.feesIvaTotal
    },
    {
      message:
        "feesIvaTotal no coincide con la suma de ivaAmount de los fees",
      path: ["feesIvaTotal"],
    },
  )

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type OfficeOrderInput = z.infer<typeof officeOrderSchema>
export type PriceSnapshotInput = z.infer<typeof priceSnapshotSchema>
export type PriceSnapshotFeeInput = z.infer<typeof priceSnapshotFeeSchema>
export type TipoPago = (typeof TipoPagoEnum)[number]