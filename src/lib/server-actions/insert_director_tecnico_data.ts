"use server"

import { DirectorTecnicoFormState } from "@/components/dashboard/director-tecnico/DirectorTecnicoOrderForm";
import { createSupabaseServerClient } from "../supabase/server";
import { directorTecnicoOrderSchema } from "@/lib/zod-schemas/directorTecnico-schema";

interface UpdateDirectorTecnicoOrderArgs {
  orderId: string;
  formData: DirectorTecnicoFormState;
}

export async function insertDirectorTecnicoData({ orderId, formData }: UpdateDirectorTecnicoOrderArgs) {

  // 1. Validaciones básicas previas
  if (!orderId || orderId === "") {
    return { 
      data: null, 
      error: "Error: No hay una orden de entrada válida" 
    };
  }

  if (!formData.resultado_revision) {
    return { 
      data: null, 
      error: "Error: No se ha seleccionado el resultado final de la revisión" 
    };
  }

  if (formData.consecutivo_fur.trim() === "") {
    return { 
      data: null, 
      error: "Error: El consecutivo del FUR es obligatorio" 
    };
  }

  // Regla de negocio explícita previa a Zod
  if (formData.resultado_revision === "aprobado" && (!formData.consecutivo_rtm || formData.consecutivo_rtm.trim() === "")) {
    return { 
      data: null, 
      error: "Error: Si la revisión es APROBADA, debe ingresar el consecutivo RTM" 
    };
  }

  // 2. Validación estricta con el Zod Schema (Maneja el superRefine condicional)
  const validatedFields = directorTecnicoOrderSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { 
      data: null, 
      error: validatedFields.error.issues // Devuelve el array $ZodIssue[] que lee tu ZodErrorDialog
    };
  }

  // 3. Extracción limpia de la data validada por Zod y control lógico preventivo
  const { resultado_revision, consecutivo_fur, consecutivo_rtm } = validatedFields.data;
  
  // 💡 Blindaje: Si fue rechazado por defectos, el certificado RTM obligatoriamente viaja como NULL a Postgres
  const rtmFinal = resultado_revision === "rechazado" ? null : consecutivo_rtm;

  // 4. Inicialización del cliente de Supabase con sesión del servidor
  const supabaseServer = await createSupabaseServerClient();

  // 5. Invocación segura mediante RPC-first pasando el payload a Postgres
  // 🌟 Nota: Recuerda crear esta función rpc ('update_director_tecnico_order') en tu Postgres si no la tienes
  const { data: dtUpdatedData, error } = await supabaseServer.rpc('update_director_tecnico_order', {
    p_order_id: orderId,
    p_resultado_revision: resultado_revision,
    p_consecutivo_fur: consecutivo_fur,
    p_consecutivo_rtm: rtmFinal ?? "",
    p_director_tecnico_tipo_documento_snapshot: formData.director_tecnico_tipo_documento_snapshot,
  p_director_tecnico_numero_documento_snapshot: formData.director_tecnico_numero_documento_snapshot,
  p_director_tecnico_nombre_snapshot: formData.director_tecnico_nombre_snapshot,
  p_director_tecnico_firma_base64_snapshot: formData.director_tecnico_firma_base64_snapshot
  });

  // 6. Gestión de errores provenientes del motor de base de datos
  if (error) {
    return { 
      data: null, 
      error: error.message 
    };
  }

  // 7. Trazabilidad limpia en logs de la consola del servidor (Coolify/Docker)
  console.log("Cierre técnico ISO 17020 actualizado correctamente:");
  console.log(`Orden ID: ${orderId} | Dictamen: ${resultado_revision.toUpperCase()} | FUR: ${consecutivo_fur}`);

  return { 
    data: `Éxito: ${dtUpdatedData || "Datos técnicos guardados con éxito"}`, 
    error: null
  };
}