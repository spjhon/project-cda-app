
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

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

      const tenantId =
        typeof body.tenant_id === "string"
          ? body.tenant_id.trim()
          : "";

      const placa =
        typeof body.placa === "string"
          ? body.placa.trim().toUpperCase()
          : "";

      if (!tenantId || !placa) {
        return Response.json(
          {
            success: false,
            error: "tenant_id y placa son obligatorios",
          },
          { status: 400 },
        );
      }

      // 4. Buscar la orden más reciente de la placa
      const { data: orden, error: errorOrden } =
        await ctx.supabaseAdmin
          .from("entry_orders")
          .select("id, fecha, es_reinspeccion")
          .eq("tenant_id", tenantId)
          .eq("vehiculo_placa_snapshot", placa)
          .is("deleted_at", null)
          .order("fecha", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (errorOrden) {
        console.error(
          "Error consultando la orden:",
          errorOrden.message,
        );

        return Response.json(
          {
            success: false,
            error: "No se pudo consultar la orden del vehículo",
          },
          { status: 500 },
        );
      }




      // 5. Si no existe ninguna orden para esa placa
      if (!orden) {
        return Response.json(
          {
            success: true,
            encontrado: false,
            orden: null,
            presiones: [],
            message: "No existen órdenes para esta placa",
          },
          {
            status: 200,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }




      

      // 6. Consultar las presiones de esa orden específica
      const { data: presiones, error: errorPresiones } =
        await ctx.supabaseAdmin
          .from("entry_order_tire_pressures")
          .select(`
            id,
            eje,
            posicion,
            presion_encontrada,
            presion_ajustada
          `)
          .eq("tenant_id", tenantId)
          .eq("entry_order_id", orden.id)
          .is("deleted_at", null)
          .order("eje", { ascending: true })
          .order("posicion", { ascending: true });

      if (errorPresiones) {
        console.error(
          "Error consultando las presiones:",
          errorPresiones.message,
        );

        return Response.json(
          {
            success: false,
            error: "No se pudieron consultar las presiones del vehículo",
          },
          { status: 500 },
        );
      }

      // 7. Devolver la orden más reciente y sus presiones
      return Response.json(
        {
          success: true,
          encontrado: true,
          orden: {
            id: orden.id,
            fecha: orden.fecha,
            es_reinspeccion: orden.es_reinspeccion,
          },
          cantidad_presiones: presiones.length,
          presiones,
          message:
            presiones.length > 0
              ? "Presiones consultadas correctamente"
              : "La orden más reciente no tiene presiones registradas",
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
