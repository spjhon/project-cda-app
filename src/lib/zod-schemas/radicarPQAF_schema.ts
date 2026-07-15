import { z } from "zod";

export const peticionEnum = [
  "peticion",
  "queja",
  "apelacion",
  "felicitacion",
] as const;

// 1. Esquema de validación estricta con Zod
export const pqafSchema = z.object({
  tipoTramite: z.enum(peticionEnum, "Error, peticion no encontrada"),
  nombreCompleto: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .max(100),
  correo: z.email("Correo inválido"),
  telefono: z
    .string()
    .regex(/^[0-9+\s-]{7,15}$/, "El número de teléfono no es válido."),
  placa: z
    .string()
    .toUpperCase()
    .regex(
      /^[A-Z]{3}[0-9]{3}$|^[A-Z]{3}[0-9]{2}[A-Z]$|^[A-Z]{2}[0-9]{3}[A-Z]$/,
      "La placa debe ser un formato válido en Colombia (Ej: AAA123 o AAA12B).",
    )
    .optional()
    .or(z.literal("")),
  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(2000),
  habeasData: z.literal(true, {
    message:
      "Debes autorizar el tratamiento de tus datos personales (Habeas Data).",
  }),
  honeypot: z.string().max(0, "Petición rechazada por sospecha de spam."), // Debe estar vacío
});

// Tipado exportable para tu frontend si lo necesitas
export type PqrsfFormData = z.infer<typeof pqafSchema>;
