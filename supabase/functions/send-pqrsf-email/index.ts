import "@supabase/functions-js/edge-runtime.d.ts";

import { withSupabase } from "@supabase/server";

console.log("send-pqrsf-email function started");

type PqrsfNotificationData = {
  cda_name: string;
  cda_domain: string;
  recipient_email: string;
  recipient_name: string | null;
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  placa: string | null;
  description: string;
  requirement_type: string;
  created_at: string;
};

const handler = {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    try {
      // ============================================================
      // Obtener requirementId
      // ============================================================

      const { requirementId } = await req.json();

      if (!requirementId) {
        return Response.json(
          {
            success: false,
            error: "Falta el requirementId.",
          },
          { status: 400 },
        );
      }

      // ============================================================
      // Obtener datos mediante RPC
      // ============================================================

      const { data, error } = await ctx.supabaseAdmin.rpc(
        "fetch_pqrsf_notification_data",
        {
          p_requirement_id: requirementId,
        },
      );

      if (error) {
        console.error("Error ejecutando RPC PQRSF:", error);

        return Response.json(
          {
            success: false,
            error: "No fue posible obtener los datos del requerimiento.",
          },
          { status: 500 },
        );
      }

      if (!data || data.length === 0) {
        return Response.json(
          {
            success: false,
            error:
              "No se encontraron datos para el requerimiento o no existen gerentes activos.",
          },
          { status: 404 },
        );
      }

      const notificationData = data as PqrsfNotificationData[];

      console.log(
        "Datos obtenidos correctamente del RPC fetch_pqrsf_notification_data",
      );

      // ============================================================
      // Datos generales del requerimiento
      // ============================================================

      const {
        cda_name,
        cda_domain,
        sender_name,
        sender_email,
        sender_phone,
        placa,
        description,
        requirement_type,
        created_at,
      } = notificationData[0];

      const dashboardUrl = `https://${cda_domain}.cda-app.com/dashboard/admin/pqaf`;

      // ============================================================
      // Obtener correos de los gerentes
      // ============================================================

      const destinatarios = notificationData
        .map((item) => item.recipient_email.trim().toLowerCase())
        .filter(
          (email, index, array) => email && array.indexOf(email) === index,
        );

      if (destinatarios.length === 0) {
        console.error("No se encontraron correos válidos de destinatarios.");

        return Response.json(
          {
            success: false,
            emailSent: false,
            error: "No se encontraron correos electrónicos válidos.",
          },
          { status: 404 },
        );
      }

      // ============================================================
      // Traducir tipo de requerimiento
      // ============================================================

      const requirementTypeLabels: Record<string, string> = {
        peticion: "Petición",
        queja: "Queja",
        apelacion: "Apelación",
        felicitacion: "Felicitación",
      };

      const requirementTypeLabel =
        requirementTypeLabels[requirement_type] ?? requirement_type;

      // ============================================================
      // Generar HTML del correo
      // ============================================================

      const crearEmailHtml = () => {
        return `
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Nuevo requerimiento - ${cda_name}</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f4f6f8;
    font-family: Arial, Helvetica, sans-serif;
    color: #333333;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background-color: #f4f6f8;
      padding: 30px 0;
    "
  >

    <tr>
      <td align="center">

        <!-- Contenedor principal -->
        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 600px;
            width: 100%;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
          "
        >

          <!-- Encabezado -->
          <tr>
            <td
              style="
                padding: 35px 40px 20px 40px;
                text-align: center;
              "
            >

              <h1
                style="
                  margin: 0;
                  color: #1f2937;
                  font-size: 24px;
                  line-height: 1.3;
                "
              >
                Nuevo requerimiento recibido
              </h1>

              <p
                style="
                  margin: 10px 0 0 0;
                  color: #6b7280;
                  font-size: 15px;
                "
              >
                ${cda_name}
              </p>

            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td
              style="
                padding: 10px 40px 30px 40px;
                font-size: 15px;
                line-height: 1.7;
                color: #4b5563;
              "
            >

              <p style="margin-top: 0;">
                Se ha recibido un nuevo requerimiento desde el
                formulario de Peticiones, Quejas, Apelaciones y
                Felicitaciones de
                <strong>${cda_name}</strong>.
              </p>

              <!-- Tipo de requerimiento -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background-color: #f8fafc;
                  border-radius: 8px;
                  margin: 20px 0;
                "
              >

                <tr>
                  <td style="padding: 20px;">

                    <p style="margin: 0 0 8px 0;">
                      <strong>Tipo de requerimiento:</strong>
                    </p>

                    <p
                      style="
                        margin: 0;
                        font-size: 18px;
                        font-weight: bold;
                        color: #1f2937;
                      "
                    >
                      ${requirementTypeLabel}
                    </p>

                  </td>
                </tr>

              </table>

              <!-- Datos del solicitante -->
              <h2
                style="
                  color: #1f2937;
                  font-size: 18px;
                  margin: 25px 0 12px 0;
                "
              >
                Datos del solicitante
              </h2>

              <p style="margin: 6px 0;">
                <strong>Nombre:</strong> ${sender_name}
              </p>

              <p style="margin: 6px 0;">
                <strong>Correo:</strong> ${sender_email}
              </p>

              ${
                sender_phone
                  ? `
              <p style="margin: 6px 0;">
                <strong>Teléfono:</strong> ${sender_phone}
              </p>
              `
                  : ""
              }

              ${
                placa
                  ? `
              <p style="margin: 6px 0;">
                <strong>Placa:</strong> ${placa}
              </p>
              `
                  : ""
              }

              <!-- Descripción -->
              <h2
                style="
                  color: #1f2937;
                  font-size: 18px;
                  margin: 25px 0 12px 0;
                "
              >
                Descripción
              </h2>

              <div
                style="
                  background-color: #f8fafc;
                  border-left: 4px solid #2563eb;
                  padding: 15px;
                  border-radius: 4px;
                  white-space: pre-line;
                "
              >
                ${description}
              </div>

              <!-- Fecha -->
              <p
                style="
                  margin-top: 20px;
                  color: #6b7280;
                  font-size: 13px;
                "
              >
                Fecha de radicación:
                ${created_at}
              </p>

              <!-- Botón -->
              <p
                style="
                  text-align: center;
                  margin: 30px 0 15px 0;
                "
              >

                <a
                  href="${dashboardUrl}"
                  target="_blank"
                  style="
                    display: inline-block;
                    padding: 13px 28px;
                    background-color: #1f2937;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                  "
                >
                  Ver requerimiento
                </a>

              </p>

              <p
                style="
                  margin: 20px 0 0 0;
                  color: #6b7280;
                  font-size: 13px;
                  text-align: center;
                "
              >
                Puedes ingresar al panel administrativo para
                revisar y gestionar este requerimiento.
              </p>

            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
        >

          <tr>
            <td
              align="center"
              style="
                padding: 20px;
                color: #9ca3af;
                font-size: 12px;
                line-height: 1.5;
              "
            >
              Este mensaje fue enviado automáticamente por
              ${cda_name}.
            </td>
          </tr>

        </table>

      </td>
    </tr>

  </table>

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
      // Enviar un solo correo a todos los gerentes
      // ============================================================

      const html = crearEmailHtml();

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },

        body: JSON.stringify({
          from: `${cda_name} <notificaciones@cda-app.com>`,

          to: destinatarios,

          subject: `Nuevo ${requirementTypeLabel} - ${cda_name}`,

          html,
        }),
      });

      const resendData = await response.json();

      console.log("Respuesta de Resend:", resendData);

      if (!response.ok) {
        console.error("Error enviando email de PQRSF:", resendData);

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
        recipientsCount: destinatarios.length,
      });
    } catch (error) {
      console.error("Error en send-pqrsf-email:", error);

      return Response.json(
        {
          success: false,
          error: "Ocurrió un error inesperado.",
        },
        { status: 500 },
      );
    }
  }),
};

export default handler;
