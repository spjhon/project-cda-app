import Loading from "@/components/ui/loading";
import { fetchUserTenantRoles } from "@/lib/dbFunctions/fetch_get_tenant_roles";
import { fetchTenantData } from "@/lib/dbFunctions/fetch_tenant_domain_cached";
import { redirect } from "next/navigation";
import PermissionsLoaderContext from "@/features/dashboard/PermissionsLoaderContext";
import { ReactNode, Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface DashboardLayout {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}

export interface UserContextData {
  authId: string;
  email?: string;
  name?: string;
  id?: string; // Este es el UUID de la tabla service_users
  document_type?: string | null;
  document_number?: string | null;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayout) {
  const { tenant } = await params;




  const tenantPromise = fetchTenantData(tenant);




  const userPromise: Promise<UserContextData> = (async () => {
    const supabase = await createSupabaseServerClient();

    // 1. Obtenemos la sesión/claims de autenticación
    const { data: authData, error: authError } =
      await supabase.auth.getClaims();
    if (authError || !authData?.claims) {
      redirect(
        `/error?type=Error al extraer los datos del usuario: ${authError?.message ? authError.message : "No hay usuario."}`,
      );
    }

    const authId = authData.claims.sub;

    // 2. Consultamos la tabla de negocio 'service_user'
    // Ajusta 'auth_user_id' al nombre real de la columna que vincula con Auth
    const { data: serviceUserData, error: serviceError } = await supabase
      .from("service_users")
      .select("id, document_type, document_number")
      .eq("auth_user_id", authId)
      .single();

    if (serviceError) {
      redirect(
        `/error?type=Error al extraer los datos del usuario: ${serviceError.message}`,
      );
    }

    // 3. Consolidamos toda la información en un solo objeto
    return {
      // Datos de la cuenta (Auth)ag
      authId: authId,
      email: authData.claims.email,
      name: authData.claims.user_metadata?.name,

      // Datos de perfil de negocio (Base de datos pública)
      // Usamos el ID de esta tabla para el 'created_by' de tus plantillas
      id: serviceUserData?.id,
      document_type: serviceUserData?.document_type,
      document_number: serviceUserData?.document_number,
    };
  })();






  const RolesDataPromise: Promise<string[]> = (async () => {
    // Esperamos a que el tenant se resuelva para obtener su ID
    const tenantResult = await fetchTenantData(tenant);

    if (!tenantResult?.data?.id || tenantResult.error) {
      redirect(`/error?type=tenant_fail`);
    }

    if (!tenantResult?.data?.id) {
      redirect(`/error?type=Error trallendo los roles`);
    }

    // Ahora que tenemos el ID, llamamos los roles asignados
    const { data, error } = await fetchUserTenantRoles(tenantResult.data.id);

    if (!data || error) {
      redirect(`/error?type=Error trallendo los roles` + error);
    }

    return data; // Retornamos solo el array de objetos
  })();



  



  return (
    <>
      <Suspense fallback={<Loading />}>
        <PermissionsLoaderContext
          tenantPromise={tenantPromise}
          userPromise={userPromise}
          RolesDataPromise={RolesDataPromise}
        >
          {children}
        </PermissionsLoaderContext>
      </Suspense>
    </>
  );
}
