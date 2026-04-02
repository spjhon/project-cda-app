import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildUrl } from "@/utils/url-helpers";
import { NextRequest, NextResponse } from "next/server";

/**
 * This is the route handler that is responsible for verifying the code that arrives from Google. Google specifies the redirection to reach this API and execute the login code.
 * @param request The request that requests the execution of this route handler
 * @param param1 The tenants.
 * @returns Redirections according to the URL structure in the request
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ tenant: string }>}) {
  
  // We obtain the tenant from the parameters and the code from google
  const { tenant } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
    next = "/";
  }
  
  // If there is no code, redirect to the error page indicating what is happening
  if (!code) {
    return NextResponse.redirect(buildUrl("/error?type=No hay codigo de autenticacion de google", tenant, request), { status: 303 });
  }
  
  
  const supabase = await createSupabaseServerClient();
  //This is where the code received from Google is used for verification (IMPORTANT: the user is authenticated at this point and a session is created)
  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError || !sessionData?.user) {
    return NextResponse.redirect(buildUrl("/error?type=Fallo el login con google", tenant, request), { status: 303 });
  }

  
  const user = sessionData.user;

  // THE SECURITY FILTER
  // We check if the user exists in the 'service_users' table.
  //Since the user is already registered and authenticated, they are already created in supabase, 
  //but the desired outcome is that if they are already registered, even in another tenant, they are not allowed to log in via Google.
  const { data: profile, error: profileError } = await supabase
  .from("service_users")
  .select("id")
  .eq("auth_user_id", user.id)
  .single();

    

  // If the user does not exist in the service_users table, then the session is closed and the user is deleted.
  if (profileError || !profile) {
    // First, we log out of the current client.
    await supabase.auth.signOut();; 

    // We used the Admin client to remove the user from the auth.users table
    const supabaseAdmin = createSupabaseAdminClient();
    await supabaseAdmin.auth.admin.deleteUser(user.id);

    // We redirect to the error message informing that it is not registered
    const errorType = "Usuario no registrado, primero registrate para poder acceder";
    return NextResponse.redirect(buildUrl(`/error?type=${errorType}`, tenant, request), { status: 303 });
  }

  return NextResponse.redirect(buildUrl("/tickets", tenant, request), { status: 303 });
  
}