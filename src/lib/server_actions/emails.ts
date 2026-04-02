"use server"

import { Resend } from "resend";
import { createSupabaseAdminClient } from "../supabase/admin";


/**
 * Genera un Magic Link en Supabase y lo envía a través de Resend.
 * Sigue el patrón { data, error } para consistencia con el SDK de Supabase.
 */
export async function enviarEmailMagicLink(email: string, tenant: string ) {

  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabaseAdmin = createSupabaseAdminClient();

  //aqui falta arreglar un hueco de seguridad: 
  // El atacante podría intentar generar links para cualquier email en cualquier tenant
  //await enviarEmailMagicLink("victima@gmail.com", "tenant-que-no-le-pertenece");

  const { data: generateLinkData, error: errorGeneratinLink } = await supabaseAdmin.auth.admin.generateLink({ email, type: "recovery" });

  if (errorGeneratinLink) {
    console.log("Error al generar el magic link: " + errorGeneratinLink.message);
    return { data: null, error: "Error la generar el link: " + errorGeneratinLink.message };
  }



  const { hashed_token } = generateLinkData.properties;
  const userName = generateLinkData.user.user_metadata?.name || "Usuario";



  // 2. Enviar el correo por Resend
  const { data: resendData, error: resendError } = await resend.emails.send({
    from: "Tu App <onboarding@cda-app.com>", // Cámbialo cuando verifiques tu dominio
    to: [email],
    subject: `Bienvenido a ${tenant} - Ingresar con Magic Link`,
    html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>¡Hola ${userName}!</h1>
          <p>Este es tu enlace mágico para ingresar a: <strong>${tenant}</strong>.</p>
          <p>Para ingresar a la plataforma, haz clic en el siguiente botón:</p>
          <div style="margin: 30px 0;">
            <a href="http://${tenant}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/auth/confirm?tenant=${tenant}&token=${hashed_token}&type=recovery" 
               style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Entrar a mi cuenta
            </a>
          </div>
          <p style="color: #666; font-size: 0.9em;">Si no solicitaste este correo, puedes ignorarlo. El enlace expirará pronto.</p>
        </div>
      `,
  });

  if (resendError) {
    return { data: null, error: resendError.message };
  }

  // Éxito total
  return { data: resendData, error: null };
}







//Correo pra recuperar la contraseña

export async function enviarEmailRecuperacionContrasena(email: string, tenant: string ) {

  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabaseAdmin = createSupabaseAdminClient();



  const { data: generateLinkData, error: errorGeneratinLink } = await supabaseAdmin.auth.admin.generateLink({ email, type: "recovery" });

  if (errorGeneratinLink) {
    console.log("Error al generar el link de recuperacion de contraseña: " + errorGeneratinLink.message);
    return { data: null, error: "Error la generar el link: " + errorGeneratinLink.message };
  }



  const { hashed_token } = generateLinkData.properties;
  const userName = generateLinkData.user.user_metadata?.name || "Usuario";



  // 2. Enviar el correo por Resend
  const { data: resendData, error: resendError } = await resend.emails.send({
    from: "Tu App <onboarding@cda-app.com>", // Cámbialo cuando verifiques tu dominio
    to: [email],
    subject: `Bienvenido a ${tenant} - Recupera la contraseña`,
    html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>¡Hola ${userName}!</h1>
          <p>Este es tu enlace mágico para recuperar la contraseña en : <strong>${tenant}</strong>.</p>
          <p>Ingresa al siguiente link para ingresas una nueva contraseña:</p>
          <div style="margin: 30px 0;">
            <a href="http://${tenant}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/auth/confirm?tenant=${tenant}&token=${hashed_token}&type=recovery&redirect=newpassword" 
               style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Recuperar contraseña
            </a>
          </div>
          <p style="color: #666; font-size: 0.9em;">Si no solicitaste este correo, puedes ignorarlo. El enlace expirará pronto.</p>
        </div>
      `,
  });

  if (resendError) {
    return { data: null, error: resendError.message };
  }

  // Éxito total
  return { data: resendData, error: null };
}