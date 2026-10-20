

"use client"


import { z } from "zod";

export const companySchema = z.object({
    tenant_id: z.string().min(1, "El tenant es obligatorio"),
  nit: z
    .string()
    .trim()
    .min(8, "El NIT debe tener al menos 8 caracteres"),

  name: z
    .string()
    .trim()
    .min(2, "La razón social debe tener al menos 2 caracteres"),

  address: z
    .string()
    .trim()
    .min(1, "La dirección no puede estar vacía"),

  phone: z
    .string()
    .trim()
    .min(10, "El teléfono debe tener al menos 10 caracteres")
    .refine(
      (value) => /\d/.test(value),
      "El teléfono debe contener al menos un número",
    ),

  email: z
    .string()
    .trim()
    .pipe(z.email("Ingresa un correo electrónico válido")),
});

export type CompanyFormData = z.infer<typeof companySchema>;
