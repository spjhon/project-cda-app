"use server"

import { Resend } from "resend";
import { createSupabaseAdminClient } from "../supabase/admin";


/**
 * Genera un Magic Link/OTP en Supabase y lo envía a través de Resend.
 * Estilo minimalista Shadcn.
 */
export async function enviarEmailMagicLink(email: string, tenant: string) {
 
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabaseAdmin = createSupabaseAdminClient();




  // 1. GENERAR EL LINK / OTP
  // Usamos 'recovery' o 'magiclink' según tu configuración de Supabase
  const { data: generateLinkData, error: errorGeneratingLink } = 
    await supabaseAdmin.auth.admin.generateLink({ 
      email, 
      type: "recovery" 
    });

  if (errorGeneratingLink) {
    console.error("Error Supabase Auth:", errorGeneratingLink.message);
    return { data: null, error: "No se pudo generar el acceso: " + errorGeneratingLink.message };
  }



  const { email_otp } = generateLinkData.properties;
  const userName = generateLinkData.user.user_metadata?.name || "Usuario";
  





  // 2. ENVIAR EL CORREO POR RESEND
  const { data: resendData, error: resendError } = await resend.emails.send({
    from: "Tu App <otp-email@cda-app.com>",
    to: [email],
    subject: `Tu código de acceso para ${tenant}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 40px auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px; color: #09090b;">
        
        <div style="margin-bottom: 24px;">
          <h1 style="font-size: 24px; font-weight: 600; letter-spacing: -0.025em; margin: 0;">Inicia sesión en ${tenant}</h1>
          <p style="font-size: 14px; color: #71717a; margin-top: 8px;">Hola ${userName}, usa el código a continuación.</p>
        </div>

        <div style="background-color: #f4f4f5; border-radius: 6px; padding: 16px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; display: block; margin-bottom: 8px;">Tu código de verificación</span>
          <strong style="font-family: monospace; font-size: 32px; letter-spacing: 0.2em; color: #09090b;">${email_otp}</strong>
        </div>

        

        <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        
        <footer style="font-size: 12px; color: #a1a1aa; line-height: 1.6;">
          <p style="margin: 0;">Si no solicitaste este código, puedes ignorar este mensaje de forma segura.</p>
          <p style="margin: 8px 0 0;">Este enlace y código expirarán en 10 minutos.</p>
        </footer>
      </div>
    `,
  });

  if (resendError) {
    console.error("Error Resend:", resendError.message);
    return { data: null, error: resendError.message };
  }

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
    from: "Tu App <new-pass@cda-app.com>", // Cámbialo cuando verifiques tu dominio
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