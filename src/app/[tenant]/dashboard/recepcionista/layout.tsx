import {
  SidebarInset,
  SidebarProvider,
  
} from "@/components/ui/sidebar";
import { ReactNode, Suspense } from "react";
import { AppSidebar } from "@/components/ui/app-sidebar";

import HeaderSidebar from "@/features/dashboard/HeaderSidebar";
import { fetchTenantData } from "@/lib/dbFunctions/fetch_tenant_domain_cached";
import Loading from "@/components/ui/loading";


import { fetchAllTemplates, OrderTemplate } from "@/lib/dbFunctions/fetch_orders_templates";
import { redirect } from "next/navigation";
import ReceptionistLoaderContext from "@/features/dashboard/ReceptionistLoaderContex";

interface ReceptionistDashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>
}




export default function ReceptionistDashboardLayout({
  children,
  params,
}: ReceptionistDashboardLayoutProps) {
  //la idea es crear aca las promesas y pasarlo al contex del dashboarddatalayer y que se comience a procesar desde aqui, pero que la promesa se espere en el cliente.



// 2. CREAMOS la promesa de las plantillas DEPENDIENDO de la primera
  const templateTabelDataPromise: Promise<OrderTemplate[] | null> = (async () => {
    const { tenant } = await params;
    // Esperamos a que el tenant se resuelva para obtener su ID
    const tenantResult = await fetchTenantData(tenant);
    
    if (!tenantResult?.data?.id) {
    redirect(`/error?type=Error, no existe tenant en templateTabelDataPromise`);
  }

  if (tenantResult.error !== null){
    redirect(`/error?type=Error al extraer el tenant${tenantResult.error}`);
  }

    // Ahora que tenemos el ID, llamamos a las plantillas
    const templatesResult = await fetchAllTemplates(tenantResult.data.id);

    if (templatesResult.error !== null){
    redirect(`/error?type=Error al extraer las plantillas: ${tenantResult.error}`);
  }
    
    return templatesResult.data; // Retornamos solo el array de objetos
  })();





  return (
    <Suspense fallback={<Loading />}>
      <ReceptionistLoaderContext  templateTabelDataPromise={templateTabelDataPromise}>
        <SidebarProvider>
          

          <AppSidebar />

          <SidebarInset>
            <HeaderSidebar></HeaderSidebar>
            <main>
              
              {children}
            
            </main>
          </SidebarInset>

          


        </SidebarProvider>
      </ReceptionistLoaderContext>
    </Suspense>
  );
};

