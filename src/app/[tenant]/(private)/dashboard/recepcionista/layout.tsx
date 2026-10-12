import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { AppSidebar } from "@/components/ui/app-sidebar";
import HeaderSidebar from "@/components/dashboard/recepcionista/HeaderSidebar";

import ReceptionistLoaderContext from "@/contexts/ReceptionistLoaderContex";

interface ReceptionistDashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}

export default function ReceptionistDashboardLayout({
  children,
}: ReceptionistDashboardLayoutProps) {
  

  return (
  
      <ReceptionistLoaderContext rol={"recepcionista"}>
        <SidebarProvider>
          <AppSidebar rol={"recepcionista"} />

          <SidebarInset className="md:m-0! ">
            <HeaderSidebar></HeaderSidebar>
            <main>{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </ReceptionistLoaderContext>
   
  );
}
