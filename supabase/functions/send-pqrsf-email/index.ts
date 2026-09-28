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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuevo requerimiento - ${cda_name}</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f4f6f8;
    font-family: Arial, Helvetica, sans-serif;
    color: #374151;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    role="presentation"
    style="
      background-color: #f4f6f8;
      padding: 24px 12px;
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
          role="presentation"
          style="
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 8px;
          "
        >

          <!-- Encabezado -->
          <tr>
            <td
              style="
                padding: 30px 32px 20px 32px;
                text-align: center;
              "
            >
              <h1
                style="
                  margin: 0;
                  color: #111827;
                  font-size: 23px;
                  line-height: 1.3;
                  font-weight: 700;
                "
              >
                Nuevo requerimiento recibido
              </h1>

              <p
                style="
                  margin: 8px 0 0 0;
                  color: #6b7280;
                  font-size: 14px;
                  line-height: 1.5;
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
                padding: 8px 32px 30px 32px;
                font-size: 15px;
                line-height: 1.6;
                color: #4b5563;
              "
            >

              <p style="margin: 0 0 20px 0;">
                Se ha recibido un nuevo requerimiento a través
                del formulario de Peticiones, Quejas, Apelaciones
                y Felicitaciones.
              </p>

              <!-- Tipo -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                role="presentation"
                style="
                  background-color: #f8fafc;
                  border: 1px solid #e5e7eb;
                  border-radius: 6px;
                  margin-bottom: 24px;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 16px 18px;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 5px 0;
                        color: #6b7280;
                        font-size: 13px;
                      "
                    >
                      Tipo de requerimiento
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #111827;
                        font-size: 18px;
                        line-height: 1.4;
                        font-weight: 700;
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
                  margin: 0 0 12px 0;
                  color: #111827;
                  font-size: 17px;
                  line-height: 1.4;
                "
              >
                Datos del solicitante
              </h2>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                role="presentation"
                style="
                  margin-bottom: 24px;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 7px 0;
                      color: #6b7280;
                      width: 90px;
                      vertical-align: top;
                    "
                  >
                    <strong style="color: #374151;">
                      Nombre
                    </strong>
                  </td>

                  <td
                    style="
                      padding: 7px 0;
                      color: #374151;
                      vertical-align: top;
                    "
                  >
                    ${sender_name}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 7px 0;
                      color: #6b7280;
                      vertical-align: top;
                    "
                  >
                    <strong style="color: #374151;">
                      Correo
                    </strong>
                  </td>

                  <td
                    style="
                      padding: 7px 0;
                      color: #374151;
                      vertical-align: top;
                      word-break: break-word;
                    "
                  >
                    ${sender_email}
                  </td>
                </tr>

                ${
                  sender_phone
                    ? `
                <tr>
                  <td
                    style="
                      padding: 7px 0;
                      color: #6b7280;
                      vertical-align: top;
                    "
                  >
                    <strong style="color: #374151;">
                      Teléfono
                    </strong>
                  </td>

                  <td
                    style="
                      padding: 7px 0;
                      color: #374151;
                      vertical-align: top;
                    "
                  >
                    ${sender_phone}
                  </td>
                </tr>
                `
                    : ""
                }

                ${
                  placa
                    ? `
                <tr>
                  <td
                    style="
                      padding: 7px 0;
                      color: #6b7280;
                      vertical-align: top;
                    "
                  >
                    <strong style="color: #374151;">
                      Placa
                    </strong>
                  </td>

                  <td
                    style="
                      padding: 7px 0;
                      color: #374151;
                      vertical-align: top;
                      font-weight: 600;
                    "
                  >
                    ${placa}
                  </td>
                </tr>
                `
                    : ""
                }
              </table>

              <!-- Descripción -->
              <h2
                style="
                  margin: 0 0 12px 0;
                  color: #111827;
                  font-size: 17px;
                  line-height: 1.4;
                "
              >
                Descripción
              </h2>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                role="presentation"
                style="
                  background-color: #f8fafc;
                  border: 1px solid #e5e7eb;
                  border-left: 4px solid #2563eb;
                  border-radius: 6px;
                  margin-bottom: 22px;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 16px 18px;
                      color: #374151;
                      font-size: 15px;
                      line-height: 1.6;
                      white-space: pre-line;
                      word-break: break-word;
                    "
                  >
                    ${description}
                  </td>
                </tr>
              </table>

              <!-- Fecha -->
              <p
                style="
                  margin: 0;
                  color: #6b7280;
                  font-size: 13px;
                "
              >
                <strong>Fecha de radicación:</strong>
                ${created_at}
              </p>

              <!-- Botón -->
              <p
                style="
                  text-align: center;
                  margin: 28px 0 12px 0;
                "
              >
                <a
                  href="${dashboardUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #1f2937;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-size: 15px;
                    font-weight: 600;
                  "
                >
                  Ver requerimiento
                </a>
              </p>

              <p
                style="
                  margin: 16px 0 0 0;
                  color: #6b7280;
                  font-size: 13px;
                  line-height: 1.5;
                  text-align: center;
                "
              >
                Ingresa al panel administrativo para revisar
                y gestionar el requerimiento.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding: 0 32px 28px 32px;
                color: #9ca3af;
                font-size: 11px;
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
