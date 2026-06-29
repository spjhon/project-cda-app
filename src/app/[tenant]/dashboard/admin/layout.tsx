import HeaderSidebar from "@/components/dashboard/recepcionista/HeaderSidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AdminLoaderContext from "@/contexts/AdminLoaderContext";
import { ReactNode } from "react";

interface AdminDashboardLayout {
  children: ReactNode;
   params: Promise<{ tenant: string }>;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayout) {

//la idea es crear aca las promesas y pasarlo al contex del dashboarddatalayer y que se comience a procesar desde aqui, pero que la promesa se espere en el cliente.
    
  return (
    <AdminLoaderContext rol={"admin"}>
    <SidebarProvider>
          

          <AppSidebar rol={"admin"}/>

          <SidebarInset className="">
            <HeaderSidebar></HeaderSidebar>
            
              
              {children}
            
            
          </SidebarInset>

          


        </SidebarProvider>
        </AdminLoaderContext>
  )
}
