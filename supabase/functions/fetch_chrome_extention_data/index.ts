
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";




function separarNombreCompleto(nombreCompleto: string | null) {
  const palabras = (nombreCompleto ?? "").trim().split(/\s+/).filter(Boolean);

  if (palabras.length === 0) {
    return { propietario_nombres: "", propietario_apellidos: "" };
  }

  if (palabras.length === 1) {
    return {
      propietario_nombres: palabras[0],
      propietario_apellidos: "",
    };
  }

  if (palabras.length === 2) {
    return {
      propietario_nombres: palabras[0],
      propietario_apellidos: palabras[1],
    };
  }

  return {
    propietario_nombres: palabras.slice(0, -2).join(" "),
    propietario_apellidos: palabras.slice(-2).join(" "),
  };
}




const handler = {
  fetch: withSupabase(
    {
      auth: ["publishable"],
      cors: {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "authorization, apikey, content-type, x-client-info, x-extension-secret",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      },
    },
    async (req, ctx) => {





      // 1. Validar método HTTP
      if (req.method !== "POST") {
        return Response.json(
          { success: false, error: "Method not allowed" },
          { status: 405 },
        );
      }





      // 2. Validar secreto de la extensión
      const expectedSecret = Deno.env.get("EXTENSION_SECRET");
      const receivedSecret = req.headers.get("X-Extension-Secret");

      if (!expectedSecret || receivedSecret !== expectedSecret) {
        console.error("Secret key inválida o no configurada");

        return Response.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }





      // 3. Leer y validar los datos recibidos
      let body: { tenant_id?: unknown; placa?: unknown };

      try {
        body = await req.json();
      } catch {
        return Response.json(
          { success: false, error: "JSON inválido" },
          { status: 400 },
        );
      }





      const tenantId = typeof body.tenant_id === "string" ? body.tenant_id : "";

      const placa = typeof body.placa === "string" ? body.placa.trim().toUpperCase() : "";

      if (!tenantId || !placa) {
        return Response.json(
          {
            success: false,
            error: "tenant_id y placa son obligatorios",
          },
          { status: 400 },
        );
      }





      // 4. Calcular el día actual en Colombia
      const hoy = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Bogota",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());






      const inicioDia = new Date(`${hoy}T00:00:00-05:00`);
      const inicioManana = new Date( inicioDia.getTime() + 24 * 60 * 60 * 1000, );

      // 5. Consultar la orden más reciente de hoy
      const { data: orden, error } = await ctx.supabaseAdmin
        .from("entry_orders")
        .select(`
          kilometraje,
          vehiculo_tipo_snapshot,
          propietario_tipo_documento_snapshot,
          propietario_numero_documento_snapshot,
          propietario_nombre_snapshot,
          propietario_telefono_snapshot,
          propietario_email_snapshot,
          propietario_direccion_snapshot,
          fecha,
          es_reinspeccion
        `)
        .eq("tenant_id", tenantId)
        .eq("vehiculo_placa_snapshot", placa)
        .gte("fecha", inicioDia.toISOString())
        .lt("fecha", inicioManana.toISOString())
        .is("deleted_at", null)
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {console.error("Error consultando la orden:", error.message);

        return Response.json(
          {
            success: false,
            error: "No se pudo consultar el kilometraje",
          },
          { status: 500 },
        );
      }




      // 6. Si no existe una orden para hoy
      if (!orden) {
        return Response.json(
          {
            success: true,
            encontrado: false,
            kilometraje: null,
            vehiculo_tipo_snapshot: null,
            propietario_tipo_documento_snapshot: null,
            propietario_numero_documento_snapshot: null,
            propietario_nombre_snapshot: null,
            propietario_telefono_snapshot: null,
            propietario_email_snapshot: null,
            propietario_direccion_snapshot: null,
            message: "No existe una orden de hoy para esta placa",
          },
          {
            status: 200,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }








const {
  propietario_nombres,
  propietario_apellidos,
} = separarNombreCompleto(orden.propietario_nombre_snapshot);






      // 7. Devolver el kilometraje de la orden más reciente
      return Response.json(
          {
            success: true,
            encontrado: true,
            kilometraje: orden.kilometraje,
            vehiculo_tipo_snapshot: orden.vehiculo_tipo_snapshot,

            propietario_tipo_documento_snapshot:
              orden.propietario_tipo_documento_snapshot,
            propietario_numero_documento_snapshot:
              orden.propietario_numero_documento_snapshot,
            propietario_nombres,
            propietario_apellidos,
            propietario_telefono_snapshot:
              orden.propietario_telefono_snapshot,
            propietario_email_snapshot:
              orden.propietario_email_snapshot,
            propietario_direccion_snapshot:
              orden.propietario_direccion_snapshot,
          },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        },
      );




    },
  ),
};

export default handler;
