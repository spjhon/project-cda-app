import HeaderSidebar from "@/components/dashboard/recepcionista/HeaderSidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AdminLoaderContext from "@/contexts/AdminLoaderContext";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReactNode } from "react";


interface AdminDashboardLayout {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}

export interface DayChartItem {
  dia: string;
  total: number;
}

export interface MonthChartItem {
  mes: string;
  total: number;
}

export interface AdminAnalyticsData {
  total_rtm_ayer: number;
  total_rtm_mes_actual: number;
  total_rtm_anio_actual: number;
  chart_mes_actual: DayChartItem[];
  chart_anio_actual: MonthChartItem[];
}






export interface AdminAnalyticsDiaryData {
  total_rtm_hoy: number;
}






export default async function AdminDashboardLayout({
  children,
 
}: AdminDashboardLayout) {
  //la idea es crear aca las promesas y pasarlo al contex del dashboarddatalayer y que se comience a procesar desde aqui, pero que la promesa se espere en el cliente.










const adminAnalyticsPromise: Promise<AdminAnalyticsData> = (async () => {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc("fetch_admin_analitics");

  if (error) {
    console.error("Error al extraer métricas e históricos con gráficos:", error.message);
    return {
      total_rtm_ayer: 0,
      total_rtm_mes_actual: 0,
      total_rtm_anio_actual: 0,
      chart_mes_actual: [],
      chart_anio_actual: [],
    };
  }

  if (data && data.length > 0) {
    // Como Postgres devuelve JSON strings o estructuras JSON, 
    // el SDK de Supabase ya te los entrega parseados como objetos de JS listos para usar
    return data[0]as unknown as AdminAnalyticsData;
  }

  return {
    total_rtm_ayer: 0,
    total_rtm_mes_actual: 0,
    total_rtm_anio_actual: 0,
    chart_mes_actual: [],
    chart_anio_actual: [],
  };
})();





const adminAnalyticsDiaryPromise: Promise<AdminAnalyticsDiaryData> = (async () => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("fetch_admin_analitics_diary");

  if (error) {
    console.error(
      "❌ Error en RPC fetch_admin_analitics_diary:",
      error.message
    );
    return { total_rtm_hoy: 0 };
  }

  if (data && data.length > 0) {
    return data[0] as unknown as AdminAnalyticsDiaryData;
  }

  return { total_rtm_hoy: 0 };
})(); 










  return (
    <AdminLoaderContext rol={"admin"} adminAnalyticsPromise={adminAnalyticsPromise} adminAnalyticsDiaryPromise={adminAnalyticsDiaryPromise}>

      <SidebarProvider className="">


        <AppSidebar rol={"admin"} />

        <SidebarInset className="md:m-0! bg-[#FAFAFA] ">
          <HeaderSidebar></HeaderSidebar>

          {children}
        </SidebarInset>



      </SidebarProvider>
      
    </AdminLoaderContext>
  );
}
