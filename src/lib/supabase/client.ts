import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../../../supabase/types/database.types";


/**
 * Supabase Browser Client Factory
 * -------------------------------
 * Función utilitaria encargada de instanciar el cliente de Supabase optimizado para el 
 * entorno del navegador (lado del cliente). Utiliza la estrategia de @supabase/ssr.
 *
 * * * * Datos:
 * - 'url': Dirección del proyecto obtenida de 'NEXT_PUBLIC_SUPABASE_URL'.
 * - 'anonKey': Clave pública obtenida de 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'.
 * - 'Database': Genérico de TypeScript que inyecta los tipos generados de la base de datos.
 * * * * Flujo:
 * 1. Accede a las variables de entorno prefijadas con 'NEXT_PUBLIC' para su visibilidad en el cliente.
 * 2. Realiza una validación de seguridad: si las variables no están definidas, lanza una excepción inmediata para evitar fallos silenciosos.
 * 3. Utiliza 'createBrowserClient' para inicializar el cliente, configurando automáticamente el manejo de cookies para la persistencia de la sesión en el frontend.
 * 4. Retorna una instancia tipada que permite realizar consultas con autocompletado y validación de esquemas.
 * * * * @return SupabaseClient - Instancia configurada para interactuar con Supabase desde componentes cliente.
 */

export const createSupabaseBrowserClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createBrowserClient<Database>(url, anonKey);
};

