import HeaderSidebar from "@/components/dashboard/recepcionista/HeaderSidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AdminLoaderContext from "@/contexts/AdminLoaderContext";
import { fetchTenantData } from "@/lib/server-actions/fetch_tenant_domain_cached";

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
  
}

export interface MonthChartItem {
  mes: string;             // 'Enero', 'Febrero'...
  total?: number;          // Para el gráfico de RTM aprobadas
  
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


// ============================================================================
// INTERFAZ DE REGISTRO INDIVIDUAL DE REQUERIMIENTO (RETORNO DE RPC)
// ============================================================================
export interface PQAFListItem {
  id: string;
  tenant_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  placa: string;
  description: string;
  requirement_type: "peticion" | "queja" | "apelacion" | "felicitacion";
  status: 'pendiente' | 'en_revision' | 'resuelto' | 'nueva_revision' | 'finalizado';
  created_at: string;
  updated_at: string | null;
  total_count: number;
}



export default function AdminDashboardLayout({
  children,
 params,
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





const initialPQAFPromise: Promise<PQAFListItem[]> = (async () => {
  const { tenant } = await params;
  const tenantId = (await fetchTenantData(tenant)).data?.id



  if (!tenantId){
    console.error("❌ error al extrear el tenant");
    return []
  }


  const supabaseServer = await createSupabaseServerClient();

  // Para emular el comportamiento inicial de TanStack Query donde no hay fechas seleccionadas,
  // pasamos un rango amplio (por ejemplo, los últimos 12 meses) ya que tu función
  // en Postgres filtra obligatoriamente por fechas y por defecto usa CURRENT_DATE.
  const fechaHasta = new Date();
  const fechaDesde = new Date();
  fechaDesde.setMonth(fechaDesde.getMonth() - 12);

  const { data, error } = await supabaseServer.rpc("fetch_service_requirements_list", {
    p_tenant_id: tenantId,
    p_limit: 5,                                 // Rows per page inicial
    p_offset: 0,                                // (page - 1) * rowsPerPage
    p_fecha_desde: fechaDesde.toISOString().split("T")[0],
    p_fecha_hasta: fechaHasta.toISOString().split("T")[0],
    p_order_by_column: "created_at",
    p_order_by_direction: "DESC",
    p_search_column: undefined,
    p_search_term: undefined,
  });

  if (error) {
    console.error("❌ Error en RPC fetch_service_requirements_list inicial:", error.message);
    return [];
  }

  return (data || []) as unknown as PQAFListItem[];
})();




  return (
    <AdminLoaderContext rol={"admin"} adminAnalyticsPromise={adminAnalyticsPromise} adminAnalyticsDiaryPromise={adminAnalyticsDiaryPromise} initialPQAFPromise={initialPQAFPromise}>

      <SidebarProvider className="">


        <AppSidebar rol={"admin"} />

        <SidebarInset className="md:m-0!  ">
          <HeaderSidebar></HeaderSidebar>

          {children}
        </SidebarInset>



      </SidebarProvider>
      
    </AdminLoaderContext>
  );
}
