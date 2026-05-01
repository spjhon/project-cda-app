"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import Loading from "@/components/ui/loading";





/**
 * AuthListener (Client Component)
 * ------------------------------
 * Este componente se encarga de escuchar los cambios en el estado de autenticación 
 * de Supabase y sincronizar la sesión con la lógica multi-tenant de la aplicación.
 * * @param {string} tenant - El identificador del tenant actual para validación de acceso.
 * * Flujo:
 * 1. Inicializa el hook useRouter para gestionar redirecciones en el cliente.
 * 2. Crea la instancia de Supabase dentro de un useEffect para asegurar que se ejecute en el navegador.
 * 3. Establece una suscripción activa a los eventos de cambio de sesión (onAuthStateChange).
 * 4. Al detectar un ingreso (SIGNED_IN), valida si el tenant actual está en la lista de permitidos del usuario.
 * 5. Si el usuario cierra sesión (SIGNED_OUT), fuerza una recarga completa hacia la página de login.
 * 6. Ejecuta una función de limpieza para cancelar la suscripción y evitar fugas de memoria.
 * * @return null - No renderiza contenido visual, actúa como un proveedor de efectos secundarios.
 */

export default function AuthListener({children}: Readonly<{ children: React.ReactNode }>) {
  const [isReady, setIsReady] = useState(false);
  // 1. Herramienta de enrutamiento de Next.js.
  const router = useRouter();

  const params = useParams();
  const tenant = params.tenant as string; // Captura el tenant de la URL automáticamente

  useEffect(() => {

    // 2. Creación de la instancia del cliente de Supabase para el navegador.
    const supabase = createSupabaseBrowserClient();

    // 3. Suscripción a los cambios de estado de autenticación.
    const {data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {

      // 4. Lógica para el evento SIGNED_IN:
      // Verifica si el usuario tiene acceso al tenant actual.
      if (event === "SIGNED_IN") {
        console.log("el useEffect dice que el usuario esta signed INNNN")
        if (!session?.user.app_metadata.tenants?.includes(tenant)) {
          supabase.auth.signOut();
          
          alert("No se puede ingresar, el tenant no concuerda");
        }
      
      }

      // 5. Lógica para el evento SIGNED_OUT:
      // Redirige a la página de login del tenant.
      if (event === "SIGNED_OUT") {
        console.log("El useEffect dice que el usuario esta singed out")
        window.location.href = '/auth/login';
        
      }
      setIsReady(true)
    });

    // 6. Limpieza de la suscripción al desmontar el componente.
     return () => subscription.unsubscribe();
 

  

  }, [router, tenant]);

  if (!isReady) return <Loading/>; // BLOQUEO MANUAL

  // Este componente no renderiza nada, solo maneja efectos secundarios.
  return <>{children}</>; // Ahora sí, adelante los niños
}



