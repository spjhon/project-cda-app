import HeaderSidebar from "@/components/dashboard/recepcionista/HeaderSidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import OficinaLoaderContext from "@/contexts/OficinaLoaderContext";

import { ReactNode } from "react";

interface ReceptionistDashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}







export default function OficinaDashboardLayout({
  children,
}: ReceptionistDashboardLayoutProps) {
  return (
    <OficinaLoaderContext rol={"oficina"}>
    <SidebarProvider>
          

          <AppSidebar rol={"oficina"}/>

          <SidebarInset>
            <HeaderSidebar></HeaderSidebar>
            <main>
              
              {children}
            
            </main>
          </SidebarInset>

          


        </SidebarProvider>
        </OficinaLoaderContext>
  );
}
