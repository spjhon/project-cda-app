import { z } from "zod";
import { ServiceType } from "./order-schema";

// 1. Definimos los valores exactos para el dictamen
const ResultadoRevisionEnum = ["aprobado", "rechazado"] as const;

export const directorTecnicoOrderSchema = z
  .object({
    // Valida que se haya seleccionado una de las dos opciones válidas
    resultado_revision: z.enum(ResultadoRevisionEnum, {
      message: "Debe seleccionar el dictamen final (Aprobado o Rechazado)",
    }),

    // El FUR siempre es obligatorio en el cierre técnico (ISO 17020)
    consecutivo_fur: z
      .string()
      .trim()
      .min(1, {
        message: "El consecutivo del FUR es obligatorio para el cierre técnico",
      }),

    // RTM se inicializa permitiendo string vacío o nulo para la evaluación condicional
    consecutivo_rtm: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    serviceType: z.custom<ServiceType>(),
  })
  
  // 2. 🌟 Refinamiento condicional corregido
  .superRefine((data, ctx) => {
    // El consecutivo RTM SOLO es obligatorio si el servicio es estrictamente RTM.
    // No importa si es aprobado o rechazado.
    const requiresRTM = data.serviceType === "RTM";

    if (requiresRTM) {
      if (!data.consecutivo_rtm || data.consecutivo_rtm.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El consecutivo del certificado RTM es obligatorio (aplica para aprobados y rechazados).",
          path: ["consecutivo_rtm"],
        });
      }
    }
  });

// Tipo inferido para TypeScript
export type DirectorTecnicoOrderInput = z.infer<typeof directorTecnicoOrderSchema>;

export type ResultadoRevisionType = typeof ResultadoRevisionEnum[number];