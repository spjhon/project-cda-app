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

// ============================================================================
// STRUCTS BASE PARA LOS ARRAYS DE LOS GRÁFICOS
// ============================================================================

export interface DayChartItem {
  dia: string;             // '01', '02', '03'...
  total?: number;          // Para el gráfico de RTM aprobadas
  total_rechazado?: number; // Para el gráfico de Rechazos
}

export interface MonthChartItem {
  mes: string;             // 'Enero', 'Febrero'...
  total?: number;          // Para el gráfico de RTM aprobadas
  total_rechazado?: number; // Para el gráfico de Rechazos
}

// ============================================================================
// INTERFAZ PRINCIPAL CONSOLIDADA
// ============================================================================

export interface AdminAnalyticsData {
  // 1. Totales Simples: RTM General
  total_rtm_ayer: number;
  total_rtm_mes_actual: number;
  total_rtm_anio_actual: number;

  // 2. Totales Simples: Rechazos (Nuevos)
  total_rechazado_ayer: number;
  total_rechazado_mes: number;
  total_rechazado_anio: number;

  // 3. Arrays para Gráficos
  chart_mes_actual: DayChartItem[];
  chart_anio_actual: MonthChartItem[];
  chart_rechazado_mes: DayChartItem[];
  chart_rechazado_anio: MonthChartItem[];
}





export interface AdminAnalyticsDiaryData {
  total_rtm_hoy: number;
  total_rtm_rechazados_hoy: number;
}






export default async function AdminDashboardLayout({
  children,
 
}: AdminDashboardLayout) {
  //la idea es crear aca las promesas y pasarlo al contex del dashboarddatalayer y que se comience a procesar desde aqui, pero que la promesa se espere en el cliente.










const adminAnalyticsPromise: Promise<AdminAnalyticsData> = (async () => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("fetch_admin_analitics");

  if (error) {
    console.error("Error al extraer métricas e históricos con gráficos:", error.message);
    return {
      total_rtm_ayer: 0,
      total_rtm_mes_actual: 0,
      total_rtm_anio_actual: 0,
      // NUEVO: Fallbacks para errores de Rechazos
      total_rechazado_ayer: 0,
      total_rechazado_mes: 0,
      total_rechazado_anio: 0,
      chart_mes_actual: [],
      chart_anio_actual: [],
      chart_rechazado_mes: [],
      chart_rechazado_anio: [],
    };
  }

  if (data && data.length > 0) {
    // El SDK de Supabase ya entrega los JSON de Postgres parseados como objetos/arrays listos
    return data[0] as unknown as AdminAnalyticsData;
  }

  // Fallback en caso de que la respuesta venga vacía (length === 0)
  return {
    total_rtm_ayer: 0,
    total_rtm_mes_actual: 0,
    total_rtm_anio_actual: 0,
    // NUEVO: Fallbacks para Rechazos
    total_rechazado_ayer: 0,
    total_rechazado_mes: 0,
    total_rechazado_anio: 0,
    chart_mes_actual: [],
    chart_anio_actual: [],
    chart_rechazado_mes: [],
    chart_rechazado_anio: [],
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
    return { 
      total_rtm_hoy: 0,
      total_rtm_rechazados_hoy: 0 // ◄ Fallback seguro
    };
  }

  if (data && data.length > 0) {
    return data[0] as unknown as AdminAnalyticsDiaryData;
  }

  return { 
    total_rtm_hoy: 0,
    total_rtm_rechazados_hoy: 0 // ◄ Fallback seguro
  };
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
