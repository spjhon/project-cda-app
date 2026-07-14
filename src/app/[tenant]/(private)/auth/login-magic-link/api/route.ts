/*

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const emailRaw = formData.get("email");

  // Validación real
  if (typeof emailRaw !== "string") {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const email = emailRaw.trim();

  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await (await supabase).auth.signInWithOtp({ email, options: { shouldCreateUser: false } });

  if (error) {
    return NextResponse.redirect(
      new URL("/error?type=magiclink", request.url),
      302
    );
  }

  const thanksUrl = new URL("/auth/magic-thanks", request.url);
  return NextResponse.redirect(thanksUrl, 302);


}

*/

/**
 * This route handler code is incomplete; it only displays a message when accessing this API from a login without JavaScript, which redirects to this route handler.
 */
import { NextResponse } from "next/server";
export async function GET(request: Request) {
return NextResponse.json({ message: "Si vez este mensaje llama al +57 3215224583" });
}

