"use client"

import { fetchTenantDataCached } from "@/lib/dbFunctions/fetch_tenant_domain_cached";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Check, UserX, Loader2 } from "lucide-react"; // Importamos un icono de carga
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AvailabilitySelect } from "./AvailabilitySelect";
import { ServiceUser } from "./CreateTicketForm";

export default function UsersTable() {
  const { tenant } = useParams();
  const router = useRouter();

  // 1. Empezamos en true porque el useEffect corre de inmediato
  const [isLoading, setIsLoading] = useState(true);
  const [usersData, setUsersData] = useState<ServiceUser[]>([]); // Inicializa como array vacío para evitar errores de .map
  const [currentAuthId, setCurrentAuthId] = useState<string | undefined>("");

  useEffect(() => {
    async function loadTenantData() {
      const supabase = createSupabaseBrowserClient();
      try {
        setIsLoading(true); // Aseguramos que se active al cambiar de tenant
        
        const { data: tenantData, error: errorTenantData } = await fetchTenantDataCached(tenant as string);

        if (errorTenantData || !tenantData) {
          router.push(`/error?type=Error trayendo informacion del tenant`);
          return;
        }

        const { data: usersFetched, error: usersFetchedError } = await supabase.rpc("get_service_users_with_tenant", {
          target_tenant_id: tenantData.id
        });
      
        if (usersFetchedError) {
          router.push("/error?type=No fue posible obtener informacion" + usersFetchedError.message);
          return;
        }

        setUsersData(usersFetched || []);

        const { data: sessionInfo, error: sessionInforError } = await supabase.auth.getClaims();
        
        if (sessionInforError) {
          router.push("/error?type=No fue posible obtener sesion");
          return;
        }

        setCurrentAuthId(sessionInfo?.claims?.sub);

      } catch (err) {
        router.push(`/error?type=Error inesperado`);
      } finally {
        setIsLoading(false);
      }
    }

    loadTenantData();
  }, [router, tenant]);

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="text-sm font-bold bg-gray-50 border-b border-gray-200">
            <th className="py-3 px-4">Nombre</th>
            <th className="py-3 px-4">Trabajo</th>
            <th className="py-3 px-4 text-center">Estado</th>
          </tr>
        </thead>

        <tbody className="text-gray-800 relative">
          {/* 2. UI de Cargando sobre la tabla */}
          {isLoading ? (
            <tr>
              <td colSpan={3} className="py-10 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                  <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                  <p className="text-sm font-medium">Buscando operarios...</p>
                </div>
              </td>
            </tr>
          ) : usersData.length === 0 ? (
            // 3. Caso sin datos
            <tr>
              <td colSpan={3} className="py-10 text-center text-gray-500">
                No se encontraron usuarios para este tenant.
              </td>
            </tr>
          ) : (
            // 4. Renderizado normal de la data
            usersData.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-3 px-4 flex items-center gap-2">
                  {user.is_active ? (
                    <Check className="text-green-500" />
                  ) : (
                    <UserX className="text-red-500" />
                  )}
                  <span className="font-medium">{user.full_name}</span>
                </td>

                <td className="py-3 px-4 text-gray-700">{user.document_number}</td>

                <td className="py-3 px-4 text-center">
                  {currentAuthId === user.auth_user_id ? (
                    <AvailabilitySelect user_id={user.id} is_available={user.is_active} setUsersData={setUsersData}/>
                  ) : user.is_active ? (
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full font-semibold">
                      Disponible
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full font-semibold">
                      No disponible
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}