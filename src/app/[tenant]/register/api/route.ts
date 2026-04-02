
import {fetchTenantDataCached } from "@/lib/dbFunctions/fetch_tenant_domain_cached";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { buildUrl } from "@/utils/url-helpers";
import { NextRequest, NextResponse } from "next/server";

import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * This route handler is responsible for registering a new user. The supabase function only creates the user in the auth schema; 
 * it is our responsibility to register the new user in the other tables, in service_users, and assign the respective tenant with which it was registered.
 * @param request The request that is making this API request, the way in which errors are returned from this API is done in such a way that the page.tsx
 * file that is making the request receives an error and can render it on screen.
 * @param param1 The request that is making this api request
 * @returns JSON message with the error or success of the new user registration
 */
export async function POST(request: NextRequest, {params}: { params: Promise<{ tenant: string }>}) {

  //Extraction of request parameters.
  const { tenant } = await params;
  const formData = await request.formData();
  const userName = formData.get("userName");
  const email = formData.get("email");
  const password = formData.get("password");
  const profecion = formData.get("profecion");


  //Extracción de parámetros de la solicitud.
  if (typeof email !== "string" || typeof password !== "string" || typeof userName !== "string" || typeof profecion !== "string"){
      
      return NextResponse.json(
        { message: "Los datos del formulario son inválidos." }, 
        { status: 400 } 
      );
  }


  if (password.length<3){
    return NextResponse.json(
        { message: "La contraseña no tiene el largor que es" }, 
        { status: 400 } 
      );
  }

  const isNonEmptyString = (value: string) => typeof value === "string" && value.trim().length > 0;

  if (!isNonEmptyString(userName) || !isNonEmptyString(email) || !isNonEmptyString(password) || !isNonEmptyString(profecion)) {
      return NextResponse.json(
        { message: "No hay datos" }, 
        { status: 400 } 
      );
    }

//VALIDATION THAT THE TENANT ARRIVING VIA PARAMS IS IN THE DATABASE IN ORDER TO BE PROCESSED
  const {data: tenantData, error: errorFetchingTenantData} = await fetchTenantDataCached(tenant);
  const tenantDomainValidatedInDb = tenantData?.domain

  if (!tenantDomainValidatedInDb || errorFetchingTenantData ) {
    return NextResponse.redirect(buildUrl("/not-found", tenant, request), { status: 303 });
  } 



  //Spaces are adjusted and the email address is converted to lowercase so that it is saved in the correct format.
  const emailLowered = email.toLowerCase()
  const passwordLowered = password
  const userNameTrimmed = userName.trim()
  const profecionTrimmed = profecion.trim()


const supabaseAdmin = createSupabaseAdminClient();

//The user is created through the supabase system, which only registers it in the auth schema; 
// to register it in our schema table which is service_users, it has to be done manually.
const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
  email: emailLowered, 
  email_confirm: false,
  password: passwordLowered,
  app_metadata: {tenants: [tenant]},
  user_metadata: { name:`${userNameTrimmed}`}
});

//This is a way to display a complete error in the log; keep in mind that in production this log is the one located on the hosting server.
if (userError) {
  console.log("Error creando el nuevo usuario")
  console.log({
    code: userError.code,
    status: userError.status,
    message: userError.message, 
    name: userError.name,
    cause: userError.cause
  });
  return NextResponse.json(
        { message: "Error creando el registro: " + userError.message }, 
        { status: 400 } 
      );
}



//This code performs the necessary queries and writes to the tables with a deletion system in case something goes wrong. 
// If any of the following operations fails, the error catch block will delete the user from supabase, the one in the auth schema, 
// and thanks to the cascading delete feature of the database, everything written within this try block will also be deleted.
try{


  const { data: serviceUser, error: InsertNewServiceUserError } = await supabaseAdmin
  .from("service_users")
  .insert({auth_user_id: userData.user.id, full_name: userNameTrimmed, job_title: profecionTrimmed })
  .select()
  .single();

  if (InsertNewServiceUserError){
    throw new Error(InsertNewServiceUserError.message || "Algo salio mal checkenado el nuevo user");
  }


  //FETCH We look up the tenant ID using the slug (tenant) that comes in the params
  const { data: tenantID, error: fetchTenantError } = await supabaseAdmin
  .from("tenants")
  .select("id")
  .eq("domain", tenantDomainValidatedInDb)
  .single();

  if (fetchTenantError){
    throw {
        contexto: "Error al insertar en la tabla de comentarios", // Tu mensaje personalizado
        supabaseError: fetchTenantError // El objeto completo de Supabase
      };
  }



  if ( !tenantID || !serviceUser ){
    throw new Error("Algo salio mal con el tenant o con el usuario en la base de datos");
  }


  //INSERT we insert into the tenant_permissions table to create the link
  const {error: InsertNewTenantError} = await supabaseAdmin
  .from("tenant_permissions")
  .insert({ tenant_id: tenantID.id, service_user_id: serviceUser.id});

  if (InsertNewTenantError){
    console.log(InsertNewTenantError)
    throw new Error(InsertNewTenantError.message || "Algo salio mal al insertar un tenant");
  }


  //An email activation link is generated, which is the same as the magic link used to generate a login and validate the email.
  const { data: generateLinkData, error:errorGeneratinLink } = await supabaseAdmin.auth.admin.generateLink({email, type: "recovery"});

  if (errorGeneratinLink){
    //Se logea el error object
    console.dir(errorGeneratinLink, { depth: null });
    //se lanza el error personalizado.
    throw new Error("Algo salio mal generando el magic link: " + errorGeneratinLink.message || "Algo salio mal generando el magic link.");
  }

  const { hashed_token } = generateLinkData.properties;

  const { error: resendError } = await resend.emails.send({
    from: 'Tu App <onboarding@cda-app.com>', // Usa tu dominio verificado aquí
    to: [emailLowered],
    subject: `Bienvenido a ${tenant} - Confirma tu acceso`,
    html: `
      <h1>¡Hola ${userNameTrimmed}!</h1>
      <p>Has sido registrado en <strong>${tenant}</strong>.</p>
      <p>Para comenzar a utilizar la plataforma, haz clic en el siguiente botón:</p>
      <a href="http://${tenant}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/auth/confirm?tenant=${tenant}&token=${hashed_token}&type=recovery" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Entrar a mi cuenta
      </a>
      <p>Este enlace expirará pronto.</p>
    `,
  });

  if (resendError) {
    console.log("Error de Resend:", resendError);
    throw new Error("No pudimos enviarte el correo de bienvenida.");
  }



  }catch(err: unknown){
    //If an error is caught, the user is deleted from the supabase auth schema, erasing everything inserted in the try block, thus achieving a basic manual rollback.
    await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
    const errorMessage = err instanceof Error ? err.message : "Ah ocurrido un error inesperado al crear un usuario";
    return NextResponse.json(
      { message: errorMessage }, 
      { status: 400 } 
    );
  }finally{

  }

  

  return NextResponse.json({
    message: "Usuario Registrado Correctamente API funcionando",
  });
 
  
} 