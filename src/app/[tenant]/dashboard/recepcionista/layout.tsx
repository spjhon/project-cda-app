import {
  SidebarInset,
  SidebarProvider,
  
} from "@/components/ui/sidebar";
import { ReactNode, Suspense } from "react";
import { AppSidebar } from "@/components/ui/app-sidebar";

import HeaderSidebar from "@/features/dashboard/HeaderSidebar";
import { fetchTenantDataCached } from "@/lib/dbFunctions/fetch_tenant_domain_cached";
import Loading from "@/components/ui/loading";
import DataLoaderContext from "@/features/dashboard/DataLoaderContex";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllTemplatesMemoized } from "@/lib/dbFunctions/fetch_orders_templates";

interface AdminDashboardLayout {
  children: ReactNode;
  params: Promise<{ tenant: string }>
}

export default async function ReceptionistDashboardLayout({
  children,
  params,
}: AdminDashboardLayout) {
  //la idea es crear aca las promesas y pasarlo al contex del dashboarddatalayer y que se comience a procesar desde aqui, pero que la promesa se espere en el cliente.

const { tenant } = await params;


const tenantPromise = fetchTenantDataCached(tenant);



const userPromise = (async () => {
  const supabase = await createSupabaseServerClient();
  
  // 1. Obtenemos la sesión/claims de autenticación
  const { data: authData, error: authError } = await supabase.auth.getClaims();
  if (authError || !authData?.claims) return null;

  const authId = authData.claims.sub;

  // 2. Consultamos la tabla de negocio 'service_user'
  // Ajusta 'auth_user_id' al nombre real de la columna que vincula con Auth
  const { data: serviceUserData, error: serviceError } = await supabase
    .from('service_users')
    .select('id, document_type, document_number')
    .eq('auth_user_id', authId)
    .single();

  if (serviceError) {
    console.error("Error al obtener service_user:", serviceError);
    // Decisión: ¿Retornar null o solo los datos de Auth? 
    // Aquí retornamos los de Auth con los campos extra en null por seguridad.
  }

  // 3. Consolidamos toda la información en un solo objeto
  return {
    // Datos de la cuenta (Auth)
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



// 2. CREAMOS la promesa de las plantillas DEPENDIENDO de la primera
  const templateTabelDataPromise = (async () => {
    // Esperamos a que el tenant se resuelva para obtener su ID
    const tenantResult = await tenantPromise;
    
    if (!tenantResult?.data?.id) return null;

    // Ahora que tenemos el ID, llamamos a las plantillas
    const templatesResult = await fetchAllTemplatesMemoized(tenantResult.data.id);
    
    return templatesResult.data; // Retornamos solo el array de objetos
  })();


  return (
    <Suspense fallback={<Loading />}>
      <DataLoaderContext tenantPromise={tenantPromise} userPromise={userPromise} templateTabelDataPromise={templateTabelDataPromise}>
        <SidebarProvider>
          

          <AppSidebar />

          <SidebarInset>
            <HeaderSidebar></HeaderSidebar>
            <main>{children}</main>
          </SidebarInset>

          


        </SidebarProvider>
      </DataLoaderContext>
    </Suspense>
  );
}

