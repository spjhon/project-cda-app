"use server";

import { fetchTenantDataCached } from "@/lib/dbFunctions/fetch_tenant_domain_cached";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);



/**
 * This server action is responsible for registering a new user. The supabase function only creates the user in the auth schema; 
 * it is our responsibility to register the new user in the other tables, in service_users, and assign the respective tenant with which it was registered.
 * @param tenant
 * @param formData The object with the form data
 * @returns JSON message with the error or success of the new user registration
 */
export async function registerUserAction(tenant: string, formData: FormData) {


  // 1. Extracción de parámetros
  const userName = formData.get("fullName");
  const documentType = formData.get("documentType");
  const documentNumber = String(formData.get("documentNumber") || "");
  const phone = String(formData.get("phone") || "");
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role");

  // 2. Validaciones de tipo y contenido
  if (
    typeof userName !== "string" ||
    typeof documentType !== "string" ||
    typeof documentNumber !== "string" ||
    typeof phone !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof role !== "string"
  ) {
    return { error: "Los datos del formulario son inválidos." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const requiredFields = [userName, documentType, documentNumber, phone, email, password, role];
  const hasInvalidFields = requiredFields.some(
    (field) => typeof field !== "string" || field.trim() === ""
  );

  if (hasInvalidFields) {
    return { error: "Faltan datos obligatorios o el formato es incorrecto." };
  }



  // 3. Validación del Tenant y se optiene el id
  const { data: tenantData, error: errorFetchingTenantData } = await fetchTenantDataCached(tenant);
  const tenantDomainValidatedInDb = tenantData?.domain;

  if (!tenantDomainValidatedInDb || errorFetchingTenantData) {
    return { error: "El tenant no se encuentra en la base de datos." };
  }



  // 4. Preparación de datos
  const userNameTrimmed = userName.trim();
  const documentTypeTrimmed = documentType.trim();
  const documentNumberTrimmed = documentNumber.trim();
  const phoneTrimmed = phone.trim();
  const emailLowered = email.toLowerCase();
  const roleTrimmed = role.trim();



  const supabaseAdmin = createSupabaseAdminClient();



  // 5. Creación en Auth (Admin)
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: emailLowered,
    email_confirm: true,
    password: password,
    phone: phoneTrimmed,
    app_metadata: { tenants: [tenant] },
    user_metadata: { name: userNameTrimmed }
  });

  if (userError) {
    console.error("Error Auth:", userError.message);
    return { error: "Error creando el registro: " + userError.message };
  }





  // 6. This code performs the necessary queries and writes to the tables with a deletion system in case something goes wrong. 
// If any of the following operations fails, the error catch block will delete the user from supabase, the one in the auth schema, 
// and thanks to the cascading delete feature of the database, everything written within this try block will also be deleted.
  try {



    // Insert en service_users
    const { data: serviceUser, error: InsertNewServiceUserError } = await supabaseAdmin
      .from("service_users")
      .insert({
        auth_user_id: userData.user.id,
        full_name: userNameTrimmed,
        document_type: documentTypeTrimmed, // Corregido a snake_case según tu tabla
        document_number: documentNumberTrimmed, // Corregido a snake_case según tu tabla
        is_active: true,
      })
      .select()
      .single();

    if (InsertNewServiceUserError) throw new Error("Algo salio mal insertanto el service user" +  InsertNewServiceUserError.message || "Algo salio mal checkenado el nuevo user");

    

    // Insertar Permisos
    const { error: InsertNewTenantError } = await supabaseAdmin
      .from("tenant_permissions")
      .insert({
        tenant_id: tenantData.id,
        service_user_id: serviceUser.id,
        role: roleTrimmed
      });

    if (InsertNewTenantError) throw new Error("Error insertando permisos en tenant permissions" + InsertNewTenantError.message);




    // 7. Generar Link
    const { data: generateLinkData, error: errorGeneratingLink } = await supabaseAdmin.auth.admin.generateLink({
      email: emailLowered,
      type: "recovery"
    });

    if (errorGeneratingLink) throw new Error(errorGeneratingLink.message);

    const { hashed_token } = generateLinkData.properties;



    //8. Enviar correo
    const { error: resendError } = await resend.emails.send({
      from: 'Tu App <onboarding@cda-app.com>',
      to: [emailLowered],
      subject: `Bienvenido a ${tenant} - Confirma tu acceso`,
      html: `
        <h1>¡Hola ${userNameTrimmed}!</h1>
        <p>Has sido registrado en <strong>${tenant}</strong>.</p>
        <a href="http://${tenant}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/auth/confirm?tenant=${tenant}&token=${hashed_token}&type=recovery">
          Entrar a mi cuenta
        </a>
      `,
    });

    if (resendError) throw new Error("Error enviando email" + resendError.message);



    //9. Caso de exito
    return { success: true, message: "Usuario registrado correctamente." };




  } catch (err: unknown) {
    // ROLLBACK: Borrar el usuario de Auth si algo falló en la DB
    await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
    const errorMessage = err instanceof Error ? "Error rollback: " + err.message : "Ah ocurrido un error inesperado al crear un usuario";
    return { error: errorMessage || "Ocurrió un error inesperado." };
  }



}