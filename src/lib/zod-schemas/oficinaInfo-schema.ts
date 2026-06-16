import { z } from "zod";


const TipoPagoEnum = ["efectivo", "tarjeta_debito", "tarjeta_credito", "sistecredito", "addi", "transferencia", "qr"] as const;


export const officeOrderSchema = z.object({
  // Valida que el PIN no esté vacío y limpia espacios fantasmas
  oficina_pin: z
    .string()
    .trim()
    .min(1, { message: "El PIN de operación es obligatorio" }),

  // Coacciona y valida el consecutivo de la factura
  oficina_consecutivo_factura: z
    .string()
    .trim()
    .min(1, { message: "El consecutivo de la factura es obligatorio" }),

  // Control numérico estricto para evitar desbordar el NUMERIC(12,2) de Postgres
  oficina_pago: z
    .number("Debe ingresar un número válido")
    .min(1, { message: "El valor recaudado debe ser mayor a $0" })
    .max(9999999999.99, { message: "El valor excede el límite permitido" }),

  // Valida contra los valores exactos de tu Enum de la base de datos
  oficina_tipo_pago: z.enum(TipoPagoEnum, { message: "Seleccione un método de pago válido"}),

  // Booleano simple para el Switch del SOAT
  se_compro_soat: z.boolean({
    message: "Debe especificar si se gestionó el SOAT",
  }),
});

// Tipo inferido para TypeScript si lo necesitas
export type OfficeOrderInput = z.infer<typeof officeOrderSchema>;

export type TipoPago = typeof TipoPagoEnum[number];