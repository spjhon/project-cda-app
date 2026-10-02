import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";



console.log("Hello from Edge Functions!");

const handler = {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {

    
    const { orderId } = await req.json();

    const { data: order, error } = await ctx.supabaseAdmin
      .from("entry_orders")
      .select(
        `
    id,
    tenant_id,
    service_type,
    vehiculo_placa_snapshot,
    propietario_email_snapshot,
    propietario_nombre_snapshot,
    cliente_email_snapshot,
    cliente_nombre_snapshot,
    se_compro_soat,
    resultado_revision
  `,
      )
      .eq("id", orderId)
      .eq("estado_orden", "finalizada")
      .eq("resultado_revision", "aprobado")
      .single();

    if (error) {
      console.error("Error consultando la orden:", error);

      return Response.json(
        {
          success: false,
          error: "No se pudo obtener la orden aprobada.",
        },
        { status: 500 },
      );
    }

    console.log("Orden obtenida:", order);







    const { data: tenantData, error: tenantError } = await ctx.supabaseAdmin
      .from("tenants")
      .select(
        `
    name,
    domain,
    logo_url
  `,
      )
      .eq("id", order.tenant_id)
      .single();

    if (tenantError) {
      console.error("Error consultando el CDA:", tenantError);

      return Response.json(
        {
          success: false,
          error: "No se pudo obtener la información del CDA.",
        },
        { status: 500 },
      );
    }

    console.log("CDA obtenido:", tenantData);



// ============================================================
// Datos para el email
// ============================================================

const cdaNombre = tenantData.name;
const cdaLogoUrl = tenantData.logo_url;

const nombreCliente = order.cliente_nombre_snapshot;
const emailCliente = order.cliente_email_snapshot;

const nombrePropietario = order.propietario_nombre_snapshot;
const emailPropietario = order.propietario_email_snapshot;

const servicio = order.service_type;
const placa = order.vehiculo_placa_snapshot;

const comproSoat = order.se_compro_soat;

const pqrsfUrl = `https://${tenantData.domain}.cda-app.com/peticiones-quejas-apelaciones-felicitaciones`;


// ============================================================
// Destinatarios
// ============================================================

const destinatarios = [
  {
    email: emailCliente,
    nombre: nombreCliente,
  },
  {
    email: emailPropietario,
    nombre: nombrePropietario,
  },
]
  .filter(
    (destinatario) =>
      Boolean(destinatario.email) &&
      !/^notiene@/i.test(destinatario.email.trim()),
  )
  .map((destinatario) => ({
    email: destinatario.email.trim().toLowerCase(),
    nombre: destinatario.nombre.trim(),
  }))
  .filter(
    (destinatario, index, array) =>
      array.findIndex(
        (item) => item.email === destinatario.email,
      ) === index,
  );

if (destinatarios.length === 0) {
  console.log("No hay destinatarios válidos para enviar el email.");

  return Response.json({
    success: true,
    emailSent: false,
    reason: "No hay correos electrónicos válidos.",
  });
}


// ============================================================
// Generar HTML personalizado
// ============================================================

const crearEmailHtml = (nombreDestinatario: string) => {
  const soatHtml = comproSoat
    ? `
      <p>
        También queremos agradecerte por confiar en nosotros
        para la compra de tu <strong>SOAT</strong>. Esperamos que
        este servicio adicional haya sido útil y conveniente para ti.
      </p>

      <p>
        Recuerda verificar la información de tu póliza y cualquier
        detalle relacionado con ella directamente en la página web
        oficial de la aseguradora que aparece en el documento
        que te entregamos.
      </p>
    `
    : "";

  return `

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de servicio - ${cdaNombre}</title>
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

        <!-- Contenedor -->
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

          <!-- Logo -->
          <tr>
            <td
              align="center"
              style="padding: 32px 24px 20px 24px;"
            >
              <img
                src="${cdaLogoUrl}"
                alt="${cdaNombre}"
                width="180"
                style="
                  display: block;
                  width: 180px;
                  max-width: 100%;
                  height: auto;
                  border: 0;
                "
              />
            </td>
          </tr>

          <!-- Título -->
          <tr>
            <td
              style="
                padding: 8px 32px 0 32px;
                text-align: center;
              "
            >
              <h1
                style="
                  margin: 0;
                  color: #111827;
                  font-size: 24px;
                  line-height: 1.3;
                  font-weight: 700;
                "
              >
                Servicio realizado correctamente
              </h1>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td
              style="
                padding: 24px 32px 10px 32px;
                font-size: 16px;
                line-height: 1.6;
                color: #4b5563;
              "
            >

              <p style="margin: 0 0 18px 0;">
                Hola, <strong>${nombreDestinatario}</strong>,
              </p>

              <p style="margin: 0 0 18px 0;">
                Gracias por confiar en
                <strong>${cdaNombre}</strong>.
              </p>

              <p style="margin: 0 0 24px 0;">
                Para nosotros es muy importante brindarte un servicio confiable, transparente y de calidad. Esperamos que tu experiencia 
                en nuestro Centro de Diagnóstico Automotor haya sido satisfactoria.
              </p>

              <!-- Resumen -->
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
                  margin: 0 0 24px 0;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 18px 20px;
                      font-size: 15px;
                      line-height: 1.6;
                    "
                  >
                    <strong style="color: #111827;">
                      Resumen del servicio
                    </strong>

                    <p style="margin: 12px 0 0 0;">
                      <strong>Servicio:</strong> ${servicio}<br />
                      <strong>Placa:</strong> ${placa}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 18px 0;">
                Te recomendamos verificar la información y el resultado registrado de tu vehiculo 
                directamente en la plataforma oficial del <strong>RUNT</strong>:
              </p>

              <!-- RUNT -->
              <p style="text-align: center; margin: 24px 0;">
                <a
                  href="https://portalpublico.runt.gov.co/#/consulta-vehiculo/consulta/consulta-ciudadana"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    display: inline-block;
                    padding: 12px 22px;
                    background-color: #1f2937;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-size: 15px;
                    font-weight: 600;
                  "
                >
                  Consultar en el RUNT
                </a>
              </p>

              ${soatHtml}

              <p style="margin: 24px 0 0 0;">
                Si tienes alguna inquietud sobre el servicio,
                estamos disponibles para atenderte.
              </p>

            </td>
          </tr>

          <!-- PQRSF -->
          <tr>
            <td
              style="
                padding: 10px 32px 28px 32px;
              "
            >
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                role="presentation"
                style="
                  background-color: #f8fafc;
                  border-radius: 6px;
                  border: 1px solid #e5e7eb;
                "
              >
                <tr>
                  <td
                    align="center"
                    style="padding: 22px 20px;"
                  >

                    <h2
                      style="
                        margin: 0 0 10px 0;
                        color: #111827;
                        font-size: 18px;
                        line-height: 1.4;
                      "
                    >
                      ¿Cómo fue tu experiencia?
                    </h2>

                    <p
                      style="
                        margin: 0 0 18px 0;
                        color: #4b5563;
                        font-size: 14px;
                        line-height: 1.6;
                      "
                    >
                      Tus comentarios nos ayudan a mejorar nuestro servicio.
                       Si tienes alguna Petición, Queja, Apelación o Felicitación te invitamos a que nos escribas
                a nuestro buzón.
                    </p>

                    <a
                      href="${pqrsfUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="
                        display: inline-block;
                        padding: 11px 22px;
                        background-color: #2563eb;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 600;
                      "
                    >
                      Compartir mi opinión
                    </a>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding: 0 32px 30px 32px;
                color: #6b7280;
                font-size: 13px;
                line-height: 1.5;
              "
            >

              <p style="margin: 0 0 8px 0;">
                Gracias por confiar en
                <strong>${cdaNombre}</strong>.
              </p>

              <p style="margin: 0;">
                Este mensaje fue enviado automáticamente.
              </p>

            </td>
          </tr>

        </table>

        <!-- Identificación del remitente -->
        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          role="presentation"
          style="width: 100%; max-width: 600px;"
        >
          <tr>
            <td
              align="center"
              style="
                padding: 16px 20px;
                color: #9ca3af;
                font-size: 11px;
                line-height: 1.5;
              "
            >
              ${cdaNombre}<br />
              Centro de Diagnóstico Automotor
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
// Enviar emails con Resend
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
};

for (const destinatario of destinatarios) {
  const html = crearEmailHtml(destinatario.nombre);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `${cdaNombre} <notificaciones@cda-app.com>`,
      to: [destinatario.email],
      subject: `Gracias por visitar ${cdaNombre}`,
      html,
    }),
  });

  const data = await response.json();

  console.log("Respuesta de Resend:", data);

  if (!response.ok) {
    console.error(
      `Error enviando email a ${destinatario.email}:`,
      data,
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
}













    return Response.json({
      success: true,
      order,
      tenantData,
      emailSent: true,
    });
  }),
};

export default handler;
