import HeaderSidebar from "@/components/dashboard/recepcionista/HeaderSidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import OficinaLoaderContext from "@/contexts/OficinaLoaderContext";

import { ReactNode } from "react";

interface OficinaDashboardLayout {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}







export default function OficinaDashboardLayout({
  children,
}: OficinaDashboardLayout) {
  return (
    <OficinaLoaderContext rol={"oficina"}>
    <SidebarProvider>
          

          <AppSidebar rol={"oficina"}/>

          <SidebarInset className="md:m-0! bg-[#FAFAFA]">
            <HeaderSidebar></HeaderSidebar>
            <main>
              
              {children}
            
            </main>
          </SidebarInset>

          


        </SidebarProvider>
        </OficinaLoaderContext>
  );
}
