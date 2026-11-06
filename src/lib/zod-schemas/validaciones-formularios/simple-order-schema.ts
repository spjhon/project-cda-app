
import { z } from "zod";

export const simpleOrderSchema = z.object({
  // ==========================================
  // DATOS DE LA ORDEN
  // ==========================================

  id: z.string().nullable(),

  tenant_id: z.string().min(1, "El tenant es obligatorio"),

  funcionario_id: z.string().min(1, "El funcionario es obligatorio"),

  id_reprobado: z.string(),

  es_reinspeccion: z.boolean(),

  informacion_buscada: z.boolean(),

  service_type: z.string().min(1, "El tipo de servicio es obligatorio"),

  estado_orden: z.string().min(1, "El estado de la orden es obligatorio"),

  soat_vencimiento_snapshot: z.string(),

  // ==========================================
  // DATOS DEL VEHÍCULO
  // ==========================================

  vehicle: z.object({
    id: z.string(),

    placa: z.string().min(1, "La placa es obligatoria"),

    marca: z.string().min(1, "La marca es obligatoria"),

    linea: z.string().min(1, "La línea es obligatoria"),

    modelo: z.string().min(1, "El modelo es obligatorio"),

    // Opcionales
    color: z.string(),

    // Obligatorios
    tipo_vehiculo: z.string().min(1, "El tipo de vehículo es obligatorio"),

    clase: z.string().min(1, "La clase del vehículo es obligatoria"),

    // Obligatorio
    combustible: z.string().min(1, "El combustible es obligatorio"),

    // Opcionales
    cilindrada: z.string(),

    // Obligatorios: booleanos que pueden ser true o false
    blindaje: z.boolean(),

    es_ensenanza: z.boolean(),

    es_extranjero: z.boolean(),

    // Opcional
    capacidad_pasajeros: z.string(),

    // Obligatorio
    tipo_servicio_vehiculo: z
      .string()
      .min(1, "El tipo de servicio del vehículo es obligatorio"),

    // Opcionales: información obtenida del RUNT
    soat_vigente_de_acuerdo_al_runt: z.string(),

    fecha_vencimiento_rtm: z.string(),

    organismo_que_expidio_ultima_rtm: z.string(),

    rtm_vigente_de_acuerdo_al_runt: z.string(),

    se_encontro_fecha_vencimiento_rtm: z.string(),

    fecha_matricula: z.string(),
  }),
});

export type SimpleOrderSchema = z.infer<typeof simpleOrderSchema>;
