import HeaderSidebar from "@/components/dashboard/recepcionista/HeaderSidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DirectorTecnicoLoaderContext from "@/contexts/DirectorTecnicoLoaderContext";


import { fetchAllTemplates, OrderTemplate } from "@/lib/server-actions/fetch_orders_templates";
import { redirect } from "next/navigation";
import { fetchTenantData } from "@/lib/server-actions/fetch_tenant_domain_cached";

import { ReactNode } from "react";

interface DirectorTecnicoDashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}







export default function DirectorTecnicoDashboardLayout({
  children,
  params
}: DirectorTecnicoDashboardLayoutProps) {









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
    <DirectorTecnicoLoaderContext rol={"director-tecnico"} templateTabelDataPromise={templateTabelDataPromise} >
    <SidebarProvider>
          

          <AppSidebar rol={"director-tecnico"}/>

          <SidebarInset>
            <HeaderSidebar></HeaderSidebar>
            <main>
              
              {children}
            
            </main>
          </SidebarInset>

          


        </SidebarProvider>
        </DirectorTecnicoLoaderContext>
  );
}