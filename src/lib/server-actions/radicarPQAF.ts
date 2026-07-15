"use server";



import { pqafSchema } from "@/lib/zod-schemas/radicarPQAF_schema";
import { createSupabaseServerClient } from "../supabase/server";
import { fetchTenantData } from "./fetch_tenant_domain_cached";


// Tipado del resultado para el frontend
export type ActionResult = {
  success: boolean;
 
  motive?: string;  // Para detallar errores amigables
 
};

export async function radicarPQAF(
  tenant: string, 
  formData: unknown
): Promise<ActionResult> {
  try {

   const tenantData= await fetchTenantData(tenant)



    if (!tenantData || tenantData.error || tenantData.data?.id == null) {
      return {
        success: false,
        motive: "El identificador del centro de inspección (CDA) no es válido.",
      };
    }


    const tenantId = tenantData.data.id

    // 2. Validar los datos del formulario con Zod
    const validation = pqafSchema.safeParse(formData);



    if (!validation.success) {
      // Extrae y formatea los errores de validación para el front

      const errorMessage = validation.error.issues.map(issue => issue.message).join(', ');

     console.log(errorMessage)
      
      return {
        success: false,
        motive: "hubo errores de validacion:, " + errorMessage,
        
      };
    }



    const data = validation.data;

    
    const supabaseServer =  await createSupabaseServerClient();

    // 4. Mapear datos del frontend al esquema de base de datos de Postgres
    const payload = {
      tenant_id: tenantId,
      sender_name: data.nombreCompleto.trim(),
      sender_email: data.correo.trim().toLowerCase(),
      sender_phone: data.telefono?.trim() || null,
      placa: data.placa ? data.placa.trim().toUpperCase() : null,
      description: data.descripcion.trim(),
      requirement_type: data.tipoTramite,
      status: "pendiente" // Aseguramos el estado por defecto desde el servidor
    };

    // 5. Insertar en la Base de Datos
    // Al usar el cliente anon del servidor, la política RLS "allow_anon_and_auth_insert_requirements"
    // validará que se pueda insertar. La base de datos verificará el tenant_id mediante FK.
    const { error: insertError } = await supabaseServer
      .from("service_requirements")
      .insert(payload);



    if (insertError) {
      console.error("Error insertando PQAF en Supabase:", insertError);
      
      // Control de error específico si el tenant_id no existe en la base de datos (Violación de FK)
      if (insertError.code === "23503") {
        return {
          success: false,
          motive: "El centro de inspección especificado no está registrado en nuestra plataforma, " + insertError.message,
        };
      }

      throw new Error("Base de datos rechazó la inserción.");
    }

    // 6. Retornar éxito
    return {
      success: true,
      motive: "Tu requerimiento ha sido radicado con éxito. Nuestro equipo se pondrá en contacto pronto.",
    };

  } catch (error) {
    console.error("Fallo crítico en radicarPQAF Server Action:", error);
    return {
      success: false,
      motive: "Ocurrió un error inesperado al procesar tu solicitud. Por favor, inténtalo de nuevo.",
    };
  }
}