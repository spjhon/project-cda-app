import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildUrl } from "@/utils/url-helpers";
import { NextRequest, NextResponse } from "next/server";


/**
 * Route handler that performs a logout through this API if JavaScript is not enabled in the login at the time of login.
 * @param request The request that requests the execution of this route handler
 * @param param1 The tenants.
 * @returns Redirections according to the URL structure in the request
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ tenant: string }> }) {

  // We obtain the tenant from the parameters
  const { tenant } = await params;

  // We created the client and logged out.
  // This will clear the cookies on the server
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();;

  if (error){
    return NextResponse.redirect(buildUrl(`/error?type=Error al intentar hace logout por medio de api`, tenant, request), { status: 303 });
  }

  // We construct the absolute URL using the helper
  // This ensures that the user remains on fullmotos.cda-app.com/auth/login
  const redirectUrl = buildUrl("/auth/login", tenant, request);

  // We redirected with status 303 (standard for after a POST)
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
