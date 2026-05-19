// lib/schemas/order-form.schema.ts




import { z } from "zod";

/* =========================================================
   ENUMS
========================================================= */

// Ajusta estos valores a los reales de tu proyecto
const TipoVehiculoEnum = [
  "liviano",
  "pesado",
  "motocicleta_4t",
  "motocicleta_2t",
  "motocarro_4t",
  "motocarro_2t",
] as const;


const ClaseVehiculoEnum = [
  "automovil",
  "bus",
  "buseta",
  "camion",
  "camioneta",
  "campero",
  "microbus",
  "tractocamion",
  "motocicleta",
  "motocarro",
  "mototriciclo",
  "cuatrimoto", // Ajustado de 'cuadrimoto' a 'cuatrimoto' según tu lista
  "remolque",
  "semiremolque", // Ajustado con una sola 'r' según tu lista
  "volqueta",
  "sin_clase",
  "maquinaria_construccion_o_minera", // Ajustado para coincidir con MAQ. CONSTRUCCION...
  "ciclomotor",
  "tricimoto",
  "cuadriciclo",
] as const;


export const CombustibleEnum = [
  "gasolina",
  "gas_natural_vehicular",
  "diesel",
  "gas_gasolina",
  "hibrido",
  "electrico",
  "etanol",
  "biodiesel",
  "hidrogeno",
] as const;



export const TipoServicioVehiculoEnum = [
  "particular",
  "ensenanza",
  "oficial",
  "publico",
  "diplomatico",
  "especial",
] as const;



const TirePositionEnum = [
  "izquierda",
  "derecha",
  "centro",
  "izquierda_interior",
  "derecha_interior",
  "repuesto",
] as const;

const ServiceTypeEnum = [
    "RTM", 
    "preventiva", 
    "peritaje"] as const;

const EstadoOrdenEnum = [
    "abierta", 
    "en_proceso", 
    "cerrada", 
    "cancelada"] as const;

const TipoDocumentoEnum = [
    "cedula_ciudadania", 
    "nit", 
    "pasaporte", 
    "cedula_extranjeria", 
    "tarjeta_identidad", 
    "registro_civil", 
    "carnet_diplomatico", 
    "nn", "ti2"] as const;


export const ConditionResponseEnum = [
  "cumple",
  "no_cumple",
  "no_aplica",
] as const;

/* =========================================================
   PERSONA
========================================================= */

export const PersonFormSchema = z.object({
  id: z.uuid().nullable(),

  tipo_documento: z.enum(TipoDocumentoEnum, "Tipo de documento de identificacion erroneo"),

  numero_documento: z
    .string()
    .min(3, "Número de documento requerido"),

  nombre_completo: z
    .string()
    .min(3, "Nombre completo requerido"),

  telefono: z
    .string(),
  

  correo: z.email("Correo inválido").or(z.literal("")),

  direccion: z.string(),
});

/* =========================================================
   VEHÍCULO
========================================================= */

export const VehicleDataSchema = z.object({
  id: z.uuid().nullable(),

 placa: z
  .string()
  .trim() // 1. Limpiamos espacios primero
  .min(5, "La placa debe tener al menos 5 caracteres") // 2. Validamos tamaño mínimo
  .max(10, "La placa no puede exceder los 10 caracteres") // 3. Validamos tamaño máximo
  .toUpperCase(), // 4. Al final, si todo es válido, lo transformamos a MAYÚSCULAS

  marca: z.string().min(1, "La marca es requerida"),

  linea: z.string().min(1, "La línea es requerida"),

  modelo: z
  .string()
  .length(4, { message: "El modelo debe tener exactamente 4 dígitos" })
  .regex(/^\d+$/, { message: "El modelo solo debe contener números" }),

  color: z.string().min(1, "El color es requerido"),

  tipo_vehiculo: z.union([
 z.enum(TipoVehiculoEnum),
 z.literal("")
  ],{error: () => ({ message: "El tipo de vehiculo es requerido o es invalido" })}),
  
  
  
  
 

  clase: z.union([
     z.enum(ClaseVehiculoEnum),
     z.literal("")

  ], {error: () => ({ message: "La clase de vehiculo es requerido o es invalido" })}),
  
  
 

  combustible: z.union([
    z.enum(CombustibleEnum),
    z.literal("")
  ], {error: () => ({ message: "El tipo de combustible es requerido o es invalido" })}),

  cilindrada: z
  .string()
  .min(2, { message: "Cilindrada inválida" }) // Al menos 2 dígitos (ej. 50)
  .regex(/^\d+$/, { message: "La cilindrada solo debe contener números" })
  .refine((val) => Number(val) >= 50, {
    message: "La cilindrada mínima es 50",
  }),

  blindaje: z.boolean(),

  capacidad_pasajeros: z
  .string()
  .min(1, { message: "La capacidad es obligatoria" })
  .regex(/^\d+$/, { message: "Solo se permiten números" })
  .refine((val) => Number(val) >= 1, {
    message: "La capacidad mínima es 1 pasajero",
  }),

  es_ensenanza: z.boolean(),

  //tipo_servicio_vehiculo: z.enum(TipoServicioVehiculoEnum, "Tipo de servicio requerido o esta erroneo").or(z.literal("", "El campo puede estar erroneo")),


tipo_servicio_vehiculo: z.union(
  [
    z.enum(TipoServicioVehiculoEnum),
    z.literal("")
  ],
  {
    // En lugar de errorMap, se usa 'error' así:
    error: () => ({ message: "El tipo de servicio es requerido o es inválido" })
  }
),

  propietario_actual_id: z.uuid().nullable(),

  es_extranjero: z.boolean(),
});

/* =========================================================
   PRESIONES
========================================================= */

export const TirePressureEntrySchema = z.object({
  eje: z.number().min(1),

  posicion: z.enum(TirePositionEnum, "Se requeire tener una posicion o esta errada"),

  presion_encontrada: z
  .string()
  .trim()
  .min(1, "La presión es requerida"), // Evita que envíen campos vacíos

  presion_ajustada: z.string(),

  _requiere_ajuste: z.boolean(),
});

/* =========================================================
   CONDICIONES
========================================================= */

export const ConditionResultEntrySchema = z.object({
  template_condition_id: z.uuid(),

  value: z.enum(ConditionResponseEnum),
});

/* =========================================================
   FIRMAS
========================================================= */

export const SignatureResultSchema = z.object({
  template_signature_id: z.uuid(),

  representative_type: z.string(),

  // base64 o URL
  signature_url: z
    .string()
    .min(1, "La firma es requerida"),
});

/* =========================================================
   FORMULARIO PRINCIPAL
========================================================= */

export const ZodFullFormDataSchema = z.object({
  /* ---------------------------
     CONTROL
  ---------------------------- */
  id: z.string().nullable(),

  tenant_id: z.string(),

  funcionario_id: z.uuid(),

  plantilla_id: z.uuid(),

  /* ---------------------------
     ORDEN
  ---------------------------- */

  kilometraje: z
    .string()
    .min(1, "El kilometraje es requerido"),

  es_reinspeccion: z.boolean(),

  service_type: z.enum(ServiceTypeEnum),

  estado_orden: z.enum(EstadoOrdenEnum),

  observaciones: z.string(),

  /* ---------------------------
     SNAPSHOTS
  ---------------------------- */

  soat_vencimiento_snapshot: z.string(),

  gas_numero_snapshot: z.string(),

  gas_vencimiento_snapshot: z.string(),

  texto_contractual_snapshot: z.string(),

  /* ---------------------------
     VEHÍCULO
  ---------------------------- */

  vehicle: VehicleDataSchema,

  /* ---------------------------
     CLIENTE / PROPIETARIO
  ---------------------------- */

  customer_data: PersonFormSchema,

  owner_data: PersonFormSchema,

  is_owner_same_as_customer: z.boolean(),

  /* ---------------------------
     LLANTAS
  ---------------------------- */

  tire_pressures: z.array(TirePressureEntrySchema),

  /* ---------------------------
     RESULTADOS
  ---------------------------- */

  condition_results: z.array(ConditionResultEntrySchema),

  /* ---------------------------
     FIRMAS
  ---------------------------- */

  signatures: z.array(SignatureResultSchema),
});

/* =========================================================
   TYPES INFERIDOS
========================================================= */


export type ZodFullFormDataType = z.infer<typeof ZodFullFormDataSchema>;

export type ConditionResultEntry = z.infer<typeof ConditionResultEntrySchema>;

export type ConditionResponse = (typeof ConditionResponseEnum)[number];

export type TirePressureEntry = z.infer<typeof TirePressureEntrySchema>;

export type TirePosition = (typeof TirePositionEnum)[number];

export type ServiceType = (typeof ServiceTypeEnum)[number];

export type CombustibleType = (typeof CombustibleEnum)[number];

export type ClaseVehiculoType = (typeof ClaseVehiculoEnum)[number];





