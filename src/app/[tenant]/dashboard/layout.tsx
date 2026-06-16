import Loading from "@/components/ui/loading";
import { fetchUserTenantRoles } from "@/lib/server-actions/fetch_get_tenant_roles";
import { fetchTenantData } from "@/lib/server-actions/fetch_tenant_domain_cached";
import { redirect } from "next/navigation";
import PermissionsLoaderContext from "@/contexts/PermissionsLoaderContext";
import { ReactNode, Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EntryOrderListItem, fetchEntryOrders } from "@/lib/server-actions/fetch_entry_orders_list";
import { startOfMonth, format } from "date-fns";
import EntryOrdersLoaderContext from "@/contexts/EntryOrdersContext";

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
  signature_base64?: string | null;
  is_active: boolean;
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
      .select("id, document_type, document_number, signature_base64, is_active")
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
      signature_base64: serviceUserData?.signature_base64,
      is_active: serviceUserData?.is_active
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



  

const entryOrdersTableDataPromise: Promise<EntryOrderListItem[] | null> =
  (async () => {

    const { tenant } = await params;

    // ==========================================
    // 1. Resolver tenant slug -> tenant real
    // ==========================================
    const tenantResult = await fetchTenantData(tenant);

    if (!tenantResult?.data?.id) {
      redirect( `/error?type=Error, no existe tenant en entryOrdersTableDataPromise`);
    }

    if (tenantResult.error !== null) {
      redirect( `/error?type=Error al extraer tenant: ${tenantResult.error}`);
    }

    const fechaDesde = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const fechaHasta = format(new Date(), "yyyy-MM-dd");

    // ==========================================
    // 3. Traer órdenes iniciales
    // ==========================================
    const ordersResult = await fetchEntryOrders({
      tenantId: tenantResult.data.id,

      limit: 5,
      fechaDesde: fechaDesde,
      fechaHasta: fechaHasta,
      offset: 0,

   
    });

    if (ordersResult.error !== null) {
      redirect( `/error?type=Error al extraer órdenes: ${ordersResult.error}`);
    }

    return ordersResult.data;
  })();






  return (
    <>
      {/**Este suspence se activa al tener que espera las promesas que se mandan al componente PermissionsLoaderContext*/}
      <Suspense fallback={<Loading />}>
        {/**Componnete cliente que se carga paralelo a todo lo que se cargue dentro de children en modo client y tener acceso inmediato en el cliente a
         * la informacion que se encuentra ya resuelta en PermissionsLoaderContext, esta informacion viaja por medio de context, como page.tsx que esta debajo
         * de este layout es client tambien, entonces tiene acceso tambien al context.
         * Como children esta dentro de PermissionsLoaderContext, estos children no van a cargar sino hasta que lo que este dentro de PermissionsLoaderContext termine de cargar
         */}
        <PermissionsLoaderContext tenantPromise={tenantPromise} userPromise={userPromise} RolesDataPromise={RolesDataPromise}>
          <EntryOrdersLoaderContext entryOrdersTableDataPromise={entryOrdersTableDataPromise}>
          {children}
          </EntryOrdersLoaderContext>
        </PermissionsLoaderContext>
      </Suspense>
    </>
  );
}
