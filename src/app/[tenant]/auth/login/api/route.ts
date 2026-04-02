import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildUrl } from "@/utils/url-helpers";

/**
 *This is a route handler that handles login via API when JavaScript is disabled in the browser.
 * @param request The request that requests the execution of this route handler
 * @param param1 The tenants.
 * @returns Redirections according to the URL structure in the request
 */
export async function POST(request: NextRequest, {params}: { params: Promise<{ tenant: string }>}) {

  //Extracting data from the URL
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const { tenant } = await params;



  const supabaseServer = await createSupabaseServerClient();


 //Checking the data types of email and password to ensure that they are at least strings.
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.redirect(buildUrl(`/error?type=invalid-form`, tenant, request), { status: 303 });
  }

  //The data is passed to the supabase function to perform the login
  const { data, error } = await supabaseServer.auth.signInWithPassword({ email, password });

  // We extract the user's information after they log in.
  const userData = data?.user;
  
  /* Security note: A correct password is not enough.
    We must confirm that the user has explicit access to this subdomain/tenant 
    by verifying the 'tenants' property within their app_metadata
  */
  if (error || !userData || !userData.app_metadata?.tenants?.includes(tenant)) {
    
    // If there is no tenant, a logout is executed and the user is redirected to the error page.
    await supabaseServer.auth.signOut();
    
    return NextResponse.redirect(buildUrl(`/error?type=${error?.message ?? "Error al intentar hacer login por medio de route handler"}`, tenant, request), { status: 303 });
  }

  //If everything goes well, you will be redirected to the protected area.
  return NextResponse.redirect(buildUrl("/tickets", tenant, request), { status: 303 });
}

/**
import { NextResponse } from "next/server";
export async function POST(request: Request) {
return NextResponse.json({ message: "Hello from Route Handler" });
}
*/
