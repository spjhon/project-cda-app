import { NextRequest } from "next/server";




//Identificar al Cliente (Tenant), Manejo del Puerto (Entorno de Desarrollo), vitar el "Hardcoding"
export function getHostnameAndPort(request: NextRequest) {
  
  const hostnameWithPort = request.headers.get("host") ?? "";
  const [hostname, port] = hostnameWithPort.split(":");
  return [hostname, port];
}









export function urlPath(applicationPath: string, tenant: string) {
  // Ya no incluimos /${tenant} porque el subdominio ya nos dice quién es el cliente
  return applicationPath; 
}


/**
 * entonces buildUrl me entrega la ruta absoluta para devolver al navegador, luego el navegador entra a esa url 
 * absoluta y el proxy la re transforma para la ruta interior y si la ruta interior va a mandar algo para el navegador 
 * o el exterior entonces manda la abosoluta
 * entonnces la funcion buildUrl es para cuando se va a sacar la ruta al exterior y en el proxy se utilizan las otras dos 
 * para la direccion navegador -> app
 * @returns 
 */
export function buildUrl(applicationPath: string, tenant: string, request: NextRequest) {
  const [hostname, port] = getHostnameAndPort(request);
  const portSuffix = port && port !== "443" && port !== "80" ? `:${port}` : "";
  const protocol = request.nextUrl.protocol; 
  
  const tenantUrl = `${protocol}//${hostname}${portSuffix}`;
  
  // Retornamos una URL absoluta: ej: http://fullmotos.cda-app.com:3000/tickets
  return new URL(urlPath(applicationPath, tenant), tenantUrl).toString();
}

/**
 * ¿Vas a hacer un NextResponse.rewrite? Usa rutas internas (carpetas).
 * ¿Vas a hacer un redirect o NextResponse.redirect? Usa siempre buildUrl.
 */




/**
 * EXPLICACION DE getHostnameAndPort
 * 
 * 1. Identificar al Cliente (Tenant)

Como tu aplicación ahora depende del subdominio (ej: fullmotos.cda-app.com), necesitas extraer ese texto constantemente.

    En lugar de escribir el código de split(":") en cada archivo, llamas a esta función.

    Al obtener el hostname, puedes consultar tu TENANT_MAP para saber si el cliente es "fullmotos", "autobig", etc.

2. Manejo del Puerto (Entorno de Desarrollo)

En producción, las URLs no suelen mostrar el puerto (https://cda-app.com), pero en tu computadora usas localhost:3000.

    Si intentas redirigir a un usuario de vuelta a su subdominio y olvidas el puerto :3000, la URL se romperá.

    Esta función captura el puerto dinámicamente para que buildUrl pueda reconstruir la dirección completa sin importar si estás en local o en internet.

3. Evitar el "Hardcoding"

Imagina que mañana decides cambiar el puerto de tu aplicación del 3000 al 4000.

    Sin esta función: Tendrías que buscar en todo tu proyecto dónde escribiste :3000 a mano.

    Con esta función: El código simplemente lee lo que el navegador envía en los headers (request.headers.get("host")), por lo que siempre será correcto automáticamente.
 */