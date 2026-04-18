import { z } from "zod";

export const orderTemplateSchema = z.object({
  template_name: z.string().min(3, "El nombre es muy corto"),
  version: z.number().int().positive(),
  is_active: z.boolean(),
  document_date: z.date(),
  document_code: z.string().min(1, "El código es obligatorio"),
  service_type: z.enum(["RTM", "preventiva", "peritaje", "otros"]), // Validación del Enum
  base_contract_text: z.string().min(10, "El texto legal es muy corto"),
  
  
  
  // Validación de Condiciones
  conditions: z.array(z.object({
    label: z.string().min(1, "La descripción es obligatoria"),
    is_special: z.boolean(),
    special_condition_label: z.string().optional(),
    default_value: z.enum(["cumple", "no_cumple", "no_aplica"]),
  })),

  // Validación de Firmas y Declaraciones anidadas
  signatures: z.array(z.object({
    a_quien_representa: z.string().min(1, "Especifica a quién representa"),
    label_firma: z.string().min(1, "La etiqueta es obligatoria"),
    declarations: z.array(z.object({
      texto_declaracion: z.string().min(1, "El texto legal no puede estar vacío"),
    }))
  }))
});

// Esto crea automáticamente el tipo TypeScript basado en el esquema
export type OrderTemplateInput = z.infer<typeof orderTemplateSchema>;