import { z } from "zod";

// 1. Definimos los valores exactos para el dictamen
const ResultadoRevisionEnum = ["aprobado", "rechazado"] as const;

export const directorTecnicoOrderSchema = z
  .object({
    // Valida que se haya seleccionado una de las dos opciones válidas
    resultado_revision: z.enum(ResultadoRevisionEnum, { message: "Debe seleccionar el dictamen final (Aprobado o Rechazado)" }),

    // El FUR siempre es obligatorio en el cierre técnico (ISO 17020)
    consecutivo_fur: z
      .string()
      .trim()
      .min(1, { message: "El consecutivo del FUR es obligatorio para el cierre técnico" }),

    // RTM se inicializa permitiendo string vacío o nulo para la evaluación condicional
    consecutivo_rtm: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
  })
  // 2. 🌟 Refinamiento condicional para la regla de negocio del RUNT / ONAC
  .superRefine((data, ctx) => {
    if (data.resultado_revision === "aprobado") {
      if (!data.consecutivo_rtm || data.consecutivo_rtm.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Si la revisión es APROBADA, debe ingresar el consecutivo del certificado RTM",
          path: ["consecutivo_rtm"], // Pinta el error exactamente sobre el input de la RTM
        });
      }
    }
  });

// Tipo inferido para TypeScript (Reemplaza o mapea tu DirectorTecnicoFormState)
export type DirectorTecnicoOrderInput = z.infer<typeof directorTecnicoOrderSchema>;

export type ResultadoRevisionType = typeof ResultadoRevisionEnum[number];