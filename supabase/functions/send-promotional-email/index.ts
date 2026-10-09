import "@supabase/functions-js/edge-runtime.d.ts";

import { withSupabase } from "@supabase/server";

console.log("send-promotional-email function started");

type PromotionalEmailData = {
  email: string;
};

const handler = {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req, _ctx) => {
      try {
        // ============================================================
        // Obtener email
        // ============================================================

        const { email } = (await req.json()) as PromotionalEmailData;

        if (!email) {
          return Response.json(
            {
              success: false,
              error: "Falta el correo electrónico.",
            },
            { status: 400 },
          );
        }

        // ============================================================
        // Validar email
        // ============================================================

        const normalizedEmail = email.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
          return Response.json(
            {
              success: false,
              error: "El correo electrónico no es válido.",
            },
            { status: 400 },
          );
        }

        console.log(`Enviando correo promocional a: ${normalizedEmail}`);

        // ============================================================
        // HTML del correo
        // ============================================================

        const crearEmailHtml = () => {
          return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>cdApp - Email</title>
</head>

<body style="margin: 0; padding: 24px 16px; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

  <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #000000; border-radius: 16px; padding: 32px 28px; overflow: hidden;">

    <!-- Logo -->
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      align="center"
      bgcolor="#ffffff"
      style="margin: 0 auto 28px auto; background-color: #ffffff !important; border-radius: 12px;"
    >
      <tr>
        <td
          align="center"
          valign="middle"
          bgcolor="#ffffff"
          style="background-color: #ffffff !important; padding: 12px 20px; border-radius: 12px;"
        >
          <img
            src="https://lyktizihszlbmzzjrqye.supabase.co/storage/v1/object/public/tenants-public/public/emailAd/emailLogo.png"
            alt="cdApp"
            style="max-width: 170px; width: 100%; height: auto; display: block;"
          >
        </td>
      </tr>
    </table>

    <!-- Título -->
    <h1 style="font-size: 26px; font-weight: 600; color: #000000; letter-spacing: -0.3px; text-align: left; line-height: 1.3; margin: 0 0 12px 0;">
      Organiza tu CDA: desde la orden de entrada hasta las métricas de tu negocio
    </h1>

    <!-- Separador -->
    <div style="height: 1px; border: none; margin: 0 0 24px 0; background: linear-gradient(to right, transparent 0%, #000000 15%, #000000 85%, transparent 100%);"></div>

    <!-- Banner -->
    <img
      src="https://lyktizihszlbmzzjrqye.supabase.co/storage/v1/object/public/tenants-public/public/emailAd/Captura%20de%20pantalla%202026-09-30%20155043.jpeg"
      alt="cdApp - Organiza tu CDA"
      style="width: 100%; display: block; border-radius: 12px; margin-bottom: 24px; object-fit: cover;"
    >

    <!-- Intro -->
    <p style="font-size: 15px; color: #333333; line-height: 1.6; text-align: left; margin: 0;">
      Con nuestra plataforma, toda la información de tus vehículos, clientes y métricas
      queda en un solo lugar, disponible desde cualquier dispositivo. Automatiza tus órdenes
      de entrada, la recolección de datos y el manejo de estadísticas de las revisiones
      técnico-mecánicas y de emisiones contaminantes, y mantén a tus clientes regresando
      a tu CDA gracias a nuestro sistema de envío automático de correos electrónicos.
    </p>

    <!-- Features -->
    <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e5e5;">

      <h2 style="font-size: 20px; font-weight: 600; color: #000000; text-align: center; margin: 0 0 32px 0; letter-spacing: -0.2px;">
        Todo lo que tu CDA necesita
      </h2>

      <!-- Feature 1 -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
        <tr>
          <td width="45%" valign="middle" style="padding-right: 20px;">
            <img
              src="https://lyktizihszlbmzzjrqye.supabase.co/storage/v1/object/public/tenants-public/public/emailAd/email001.jpg"
              alt="Órdenes de entrada 100% digitales"
              style="width: 100%; height: auto; display: block; border-radius: 10px; border: 1px solid #e5e5e5;"
            >
          </td>

          <td width="55%" valign="middle">
            <h3 style="font-size: 16px; font-weight: 600; color: #000000; margin: 0 0 6px 0; line-height: 1.3;">
              Órdenes de entrada 100% digitales
            </h3>

            <p style="font-size: 13.5px; color: #555555; line-height: 1.5; margin: 0;">
              Olvídate del papel. Crea, gestiona y firma órdenes de entrada en segundos.
            </p>
          </td>
        </tr>
      </table>

      <!-- Feature 2 -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
        <tr>
          <td width="55%" valign="middle" style="padding-right: 20px;">
            <h3 style="font-size: 16px; font-weight: 600; color: #000000; margin: 0 0 6px 0; line-height: 1.3;">
              Datos del RUNT automáticos
            </h3>

            <p style="font-size: 13.5px; color: #555555; line-height: 1.5; margin: 0;">
              Carga los datos del vehículo sin escribir nada. Cero errores, cero tiempo perdido.
            </p>
          </td>

          <td width="45%" valign="middle">
            <img
              src="https://lyktizihszlbmzzjrqye.supabase.co/storage/v1/object/public/tenants-public/public/emailAd/email002.jpg"
              alt="Extracción automática de datos del RUNT"
              style="width: 100%; height: auto; display: block; border-radius: 10px; border: 1px solid #e5e5e5;"
            >
          </td>
        </tr>
      </table>

      <!-- Feature 3 -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
        <tr>
          <td width="45%" valign="middle" style="padding-right: 20px;">
            <img
              src="https://lyktizihszlbmzzjrqye.supabase.co/storage/v1/object/public/tenants-public/public/emailAd/email003.png"
              alt="Reportes PDF + firma digital ISO-17020"
              style="width: 100%; height: auto; display: block; border-radius: 10px; border: 1px solid #e5e5e5;"
            >
          </td>

          <td width="55%" valign="middle">
            <h3 style="font-size: 16px; font-weight: 600; color: #000000; margin: 0 0 6px 0; line-height: 1.3;">
              Reportes PDF + firma digital
            </h3>

            <p style="font-size: 13.5px; color: #555555; line-height: 1.5; margin: 0;">
              Genera documentos listos para auditoría con firma electrónica, cumpliendo ISO-17020.
            </p>
          </td>
        </tr>
      </table>

      <!-- Feature 4 -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
        <tr>
          <td width="55%" valign="middle" style="padding-right: 20px;">
            <h3 style="font-size: 16px; font-weight: 600; color: #000000; margin: 0 0 6px 0; line-height: 1.3;">
              Métricas y recordatorios
            </h3>

            <p style="font-size: 13.5px; color: #555555; line-height: 1.5; margin: 0;">
              Visualiza el rendimiento de tu CDA y haz que tus clientes vuelvan con recordatorios automáticos.
            </p>
          </td>

          <td width="45%" valign="middle">
            <img
              src="https://lyktizihszlbmzzjrqye.supabase.co/storage/v1/object/public/tenants-public/public/emailAd/email004.jpg"
              alt="Dashboard de métricas + recordatorios automáticos"
              style="width: 100%; height: auto; display: block; border-radius: 10px; border: 1px solid #e5e5e5;"
            >
          </td>
        </tr>
      </table>

      <!-- Feature 5 -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 0;">
        <tr>
          <td width="45%" valign="middle" style="padding-right: 20px;">
            <img
              src="https://lyktizihszlbmzzjrqye.supabase.co/storage/v1/object/public/tenants-public/public/emailAd/email005.jpg"
              alt="Landing page personalizada por CDA"
              style="width: 100%; height: auto; display: block; border-radius: 10px; border: 1px solid #e5e5e5;"
            >
          </td>

          <td width="55%" valign="middle">
            <h3 style="font-size: 16px; font-weight: 600; color: #000000; margin: 0 0 6px 0; line-height: 1.3;">
              Tu propia landing page
            </h3>

            <p style="font-size: 13.5px; color: #555555; line-height: 1.5; margin: 0;">
              Cada CDA obtiene su página web personalizada con su marca, dominio y contenido propio.
            </p>
          </td>
        </tr>
      </table>

    </div>

    <!-- CTA -->
    <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e5e5; text-align: center;">

      <h2 style="font-size: 20px; font-weight: 600; color: #000000; margin: 0 0 8px 0; letter-spacing: -0.2px; line-height: 1.3;">
        ¿Listo para transformar tu CDA?
      </h2>

      <p style="font-size: 14px; color: #666666; margin: 0 0 24px 0; line-height: 1.5;">
        Conoce la plataforma o agenda una demostración personalizada por Zoom.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
        <tr>
          <td align="center" valign="middle" style="padding: 0 6px 0 0;">
            <a
              href="https://wa.me/573215224583?text=Hola%2C%20quiero%20agendar%20una%20demostraci%C3%B3n%20de%20cdApp"
              target="_blank"
              style="display: inline-block; padding: 13px 22px; background-color: #000000; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; border: 1px solid #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"
            >
              Agendar demo por WhatsApp
            </a>
          </td>

          <td align="center" valign="middle" style="padding: 0 0 0 6px;">
            <a
              href="https://cda-app.com/"
              target="_blank"
              style="display: inline-block; padding: 13px 22px; background-color: #ffffff; color: #000000; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; border: 1px solid #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"
            >
              Conocer más
            </a>
          </td>
        </tr>
      </table>

    </div>

    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 28px; border-top: 1px solid #e5e5e5; text-align: center;">

      <div style="font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 12px; letter-spacing: 0.3px;">
        cdApp
      </div>

      <div style="margin-bottom: 16px;">
        <a href="https://cda-app.com/" target="_blank" style="font-size: 13px; color: #555555; text-decoration: none; margin: 0 8px;">
          Sitio web
        </a>

        <a href="https://demo.cda-app.com/" target="_blank" style="font-size: 13px; color: #555555; text-decoration: none; margin: 0 8px;">
          Demo
        </a>

        <a href="https://demo.cda-app.com/auth/login" target="_blank" style="font-size: 13px; color: #555555; text-decoration: none; margin: 0 8px;">
          Demo de la app
        </a>

        <a href="https://wa.me/573215224583" target="_blank" style="font-size: 13px; color: #555555; text-decoration: none; margin: 0 8px;">
          Contacto
        </a>
      </div>

      <p style="font-size: 11px; color: #999999; line-height: 1.5; margin: 0 0 12px 0;">
        Este correo fue enviado por cdApp. La información aquí contenida es de carácter
        informativo y comercial. Si recibiste este mensaje por error, por favor ignóralo.
      </p>

      <p style="font-size: 11px; color: #999999; margin: 0;">
        Si no deseas recibir más correos, responde a este mensaje con la palabra
        <strong>"Cancelar suscripción"</strong>.
      </p>

    </div>

  </div>

</body>
</html>
          `;
        };

        // ============================================================
        // Resend API Key
        // ============================================================

        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

        if (!RESEND_API_KEY) {
          console.error("No está configurada la variable RESEND_API_KEY.");

          return Response.json(
            {
              success: false,
              error: "No está configurado el servicio de correo.",
            },
            { status: 500 },
          );
        }

        // ============================================================
        // Enviar correo mediante Resend
        // ============================================================

        const html = crearEmailHtml();

        const response = await fetch(
          "https://api.resend.com/emails",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "cdApp <notificaciones@cda-app.com>",
              to: [normalizedEmail],
              subject:
                "Organiza tu CDA: desde la orden de entrada hasta las métricas de tu negocio.",
              html,
            }),
          },
        );

        const resendData = await response.json();

        console.log("Respuesta de Resend:", resendData);

        if (!response.ok) {
          console.error(
            "Error enviando email promocional:",
            resendData,
          );

          return Response.json(
            {
              success: false,
              emailSent: false,
              error: "No se pudo enviar el correo electrónico.",
            },
            { status: 500 },
          );
        }

        // ============================================================
        // Respuesta final
        // ============================================================

        return Response.json({
          success: true,
          emailSent: true,
          recipient: normalizedEmail,
          resendId: resendData.id ?? null,
        });
      } catch (error) {
        console.error(
          "Error en send-promotional-email:",
          error,
        );

        return Response.json(
          {
            success: false,
            error: "Ocurrió un error inesperado.",
          },
          { status: 500 },
        );
      }
    },
  ),
};

export default handler;