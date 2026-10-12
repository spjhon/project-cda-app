import HeaderSidebar from "@/components/dashboard/recepcionista/HeaderSidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DirectorTecnicoLoaderContext from "@/contexts/DirectorTecnicoLoaderContext";
import { ReactNode} from "react";



interface DirectorTecnicoDashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}


export default function DirectorTecnicoDashboardLayout({
  children,
}: DirectorTecnicoDashboardLayoutProps) {





  return (
    
      <DirectorTecnicoLoaderContext rol={"director-tecnico"}>
        <SidebarProvider>
          <AppSidebar rol={"director-tecnico"} />

          <SidebarInset className="md:m-0!">
            <HeaderSidebar></HeaderSidebar>
            <main>{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </DirectorTecnicoLoaderContext>
   
  );
}
