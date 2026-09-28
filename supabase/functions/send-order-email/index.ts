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
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>${cdaNombre}</title>
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

          <!-- Logo -->
          <tr>
            <td
              align="center"
              style="padding: 35px 30px 20px 30px;"
            >
              <img
                src="${cdaLogoUrl}"
                alt="${cdaNombre}"
                style="
                  max-width: 220px;
                  max-height: 100px;
                  display: block;
                  margin: 0 auto;
                "
              />
            </td>
          </tr>

          <!-- Título -->
          <tr>
            <td style="padding: 10px 40px 0 40px;">
              <h1
                style="
                  margin: 0;
                  color: #1f2937;
                  font-size: 24px;
                  line-height: 1.3;
                  text-align: center;
                "
              >
                ¡Gracias por visitarnos!
              </h1>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td
              style="
                padding: 25px 40px 10px 40px;
                font-size: 16px;
                line-height: 1.7;
                color: #4b5563;
              "
            >

              <p style="margin-top: 0;">
                Hola <strong>${nombreDestinatario}</strong>,
              </p>

              <p>
                Muchas gracias por confiar en
                <strong>${cdaNombre}</strong> y permitirnos acompañarte
                en el proceso de
                <strong>${servicio}</strong>
                de tu vehículo de placa
                <strong>${placa}</strong>.
              </p>

              <p>
                Para nosotros es muy importante brindarte un servicio
                confiable, transparente y de calidad. Esperamos que tu
                experiencia en nuestro Centro de Diagnóstico Automotor
                haya sido satisfactoria.
              </p>

              <!-- SOAT -->
              ${soatHtml}

              <!-- RUNT -->
              <p>
                Te recomendamos verificar la información y el resultado
                registrado de tu vehículo directamente en la plataforma
                oficial del RUNT:
              </p>

              <p style="text-align: center; margin: 25px 0;">
                <a
                  href="https://portalpublico.runt.gov.co/#/consulta-vehiculo/consulta/consulta-ciudadana"
                  target="_blank"
                  style="
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #1f2937;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                  "
                >
                  Consultar información en el RUNT
                </a>
              </p>

              <p>
                Recuerda que estamos para acompañarte cuando vuelvas a
                necesitar nuestros servicios. Será un gusto recibirte
                nuevamente en <strong>${cdaNombre}</strong>.
              </p>

            </td>
          </tr>

          <!-- PQRSF -->
          <tr>
            <td
              style="
                padding: 10px 40px 30px 40px;
              "
            >

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background-color: #f8fafc;
                  border-radius: 8px;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 25px;
                      text-align: center;
                    "
                  >

                    <h2
                      style="
                        margin: 0 0 12px 0;
                        color: #1f2937;
                        font-size: 19px;
                      "
                    >
                      Tu opinión es muy importante para nosotros
                    </h2>

                    <p
                      style="
                        margin: 0 0 20px 0;
                        color: #4b5563;
                        font-size: 15px;
                        line-height: 1.6;
                      "
                    >
                      Si tienes alguna sugerencia, queja, apelación,
                      felicitación o comentario sobre tu experiencia,
                      queremos escucharte.
                    </p>

                    <p
                      style="
                        margin: 0 0 20px 0;
                        color: #4b5563;
                        font-size: 15px;
                        line-height: 1.6;
                      "
                    >
                      Tus comentarios nos ayudan a identificar
                      oportunidades de mejora y a seguir ofreciendo
                      un mejor servicio a nuestros clientes.
                    </p>

                    <a
                      href="${pqrsfUrl}"
                      target="_blank"
                      style="
                        display: inline-block;
                        padding: 13px 28px;
                        background-color: #2563eb;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: bold;
                      "
                    >
                      Compartir mi opinión
                    </a>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Cierre -->
          <tr>
            <td
              style="
                padding: 0 40px 35px 40px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
                line-height: 1.6;
              "
            >

              <p style="margin: 0 0 8px 0;">
                Gracias nuevamente por confiar en nosotros.
              </p>

              <p style="margin: 0;">
                ¡Te esperamos nuevamente!
              </p>

              <p
                style="
                  margin: 15px 0 0 0;
                  font-weight: bold;
                  color: #374151;
                "
              >
                ${cdaNombre}
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
              ${cdaNombre}.
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
