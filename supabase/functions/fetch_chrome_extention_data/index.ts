
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "apikey, authorization, x-extension-secret",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const handler =  {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req) => {

      
      if (req.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

      if (req.method !== "GET") {
        return Response.json(
          { error: "Method not allowed" },
          {
            status: 405,
            headers: {
              ...corsHeaders,
              Allow: "GET, OPTIONS",
            },
          },
        );
      }

      const expectedSecret =
        Deno.env.get("EXTENSION_SECRET");

      if (!expectedSecret) {
        console.error("EXTENSION_SECRET is not configured");

        return Response.json(
          { error: "Internal server error" },
          { status: 500, headers: corsHeaders },
        );
      }

      const receivedSecret =
        req.headers.get("X-Extension-Secret");

      if (receivedSecret !== expectedSecret) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401, headers: corsHeaders },
        );
      }

      return Response.json(
        { message: "todo esta bien" },
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Cache-Control": "no-store",
          },
        },
      );
    },
  ),
};
export default handler;