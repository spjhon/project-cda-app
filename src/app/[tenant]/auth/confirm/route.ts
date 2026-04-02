import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildUrl, getHostnameAndPort } from "@/utils/url-helpers";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from 'next/server';

/**
 * This is a route handler that receives the links that arrive in emails for account verification, magic link login, and password recovery.
 * @param request The request that is making this api request
 * @returns Redirections according to the URL structure in the request
 */
export async function GET(request: NextRequest) {

  // Extraction of request parameters.
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")
  const type = searchParams.get("type") as EmailOtpType
  const redirect = searchParams.get("redirect")
  
  const supabaseServerClient = await createSupabaseServerClient();

  //host from the url, (fullmotos, viterbocaldas, autobig, tecnofresno)
  const [hostname] = getHostnameAndPort(request);
  
  const tenant = hostname;

  //if there is a token and a type from the redirect link form the email, do this logic
  if (token && type) {
    
    const { error } = await supabaseServerClient.auth.verifyOtp({ token_hash: token, type });

    if (!error) {
      // This redirect come from the email to create a new password, the user is loged in at this point
      if (redirect === "newpassword"){
        return NextResponse.redirect(buildUrl("/auth/update-password", tenant, request), { status: 303 });
      }else{
        return NextResponse.redirect(buildUrl("/tickets", tenant, request), { status: 303 });
      }
      
    } else {
      return NextResponse.redirect(buildUrl(`/error?type=${error.message ? "Error al verificar token: " + error.message : "Error al verificar token"}`, tenant, request), { status: 303 });
    }
  }

  //If there is neither a token nor a type, the user is redirected to the error page
  return NextResponse.redirect(buildUrl("/error?type=No existe el tocken o el tipo de verificacion es incorrecto", tenant, request), { status: 303 });
}




/**El por que de redirect en GET y por que el NextResponse en POST
 * entonces si es get se utiliza redirect y si se utiliza post se utiliza 
 * el return NextResponse por que el que llama tiene la oportunidad de recibir un error y asi hacer 
 * lo que tenga que hacer en lugar de ir a otro lado y que tambien no se recarge la pagina al ser redirigido a otro lado?
 * 
 * 1. En el GET (Navegación directa)
Cuando el usuario hace clic en un link de correo, el navegador cambia de página.
Usamos redirect() porque el flujo es: Link -> Route Handler -> Destino Final.
No hay datos pesados enviándose, así que el comportamiento por defecto de Next.js es suficiente.
 * 2. En el POST (Envío de datos)
Aquí es donde entra lo que mencionas sobre el error y la recarga. Usamos return NextResponse.redirect(..., 303) por tres razones clave:
El "Ataque" del botón Refresh: Si usas un redirect normal (302) tras un POST, y el usuario da a "Actualizar" en el navegador, le saldrá el molesto mensaje: "¿Desea volver a enviar el formulario?". El código 303 obliga al navegador a olvidar el POST y convertirse en un GET, limpiando el historial.
Control de Errores: Como bien dices, al ser un objeto que retornas, te permite hacer lógica antes. Por ejemplo: "Si el login falla, no redirijas, mejor responde con un JSON de error". redirect() es tan "agresivo" que corta la ejecución y no te deja decidir.
La oportunidad del cliente (Fetch): En tu componente LoginForm, el fetch está esperando una respuesta. Si devuelves un objeto NextResponse, el JS del cliente puede leer el response.redirected, capturar la URL y decidir si hace el window.location.href o si muestra un mensaje de error suave en el formulario sin cambiar de página.
 */