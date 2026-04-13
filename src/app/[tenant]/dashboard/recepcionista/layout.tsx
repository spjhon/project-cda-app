import {
  SidebarInset,
  SidebarProvider,
  
} from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { AppSidebar } from "@/components/ui/app-sidebar";

import HeaderSidebar from "@/features/dashboard/HeaderSidebar";

interface AdminDashboardLayout {
  children: ReactNode;
}

export default function ReceptionistDashboardLayout({
  children,
}: AdminDashboardLayout) {
  //la idea es crear aca las promesas y pasarlo al contex del dashboarddatalayer y que se comience a procesar desde aqui, pero que la promesa se espere en el cliente.

  return (
    <SidebarProvider>
      

      <AppSidebar />

      <SidebarInset>
        <HeaderSidebar></HeaderSidebar>
        <main>{children}</main>
      </SidebarInset>

      


    </SidebarProvider>
  );
}

