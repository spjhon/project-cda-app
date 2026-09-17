"use client";


import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useState } from "react";
import { DateRange } from "react-day-picker";
import { format, subMonths } from "date-fns";
import { usePathname } from "next/navigation";
import { PermissionsContext } from "./PermissionsLoaderContext";
// ============================================================================
// ANALYTICS DIARIOS
// Datos del RPC: fetch_admin_analitics_diary
// ============================================================================

export interface AdminAnalyticsDiaryData {
  // Cantidad de RTM realizadas hoy
  total_rtm_hoy: number;
  // Cantidad de RTM rechazadas hoy
  total_rtm_rechazados_hoy: number;
}

// ============================================================================
// ESTRUCTURAS BASE PARA LOS GRÁFICOS
// ============================================================================

// Elemento utilizado en gráficos agrupados por día.
// Ejemplo: { dia: "01", total: 15 }
export interface DayChartItem {
  // Día del mes en formato "01", "02", "03", etc.
  dia: string;

  // Cantidad correspondiente a ese día
  total?: number;
}

// Elemento utilizado en gráficos agrupados por mes.
// Ejemplo: { mes: "Enero", total: 120 }
export interface MonthChartItem {
  // Nombre del mes
  mes: string;

  // Cantidad correspondiente a ese mes
  total?: number;
}

// ============================================================================
// ANALYTICS HISTÓRICOS
// Datos del RPC: fetch_admin_analitics
// ============================================================================

export interface AdminAnalyticsData {
  // --------------------------------------------------------------------------
  // Totales generales de RTM
  // --------------------------------------------------------------------------

  // Total de RTM realizadas ayer
  total_rtm_ayer: number;

  // Total de RTM realizadas durante el mes actual
  total_rtm_mes: number;

  // Total de RTM realizadas durante el año actual
  total_rtm_anio: number;

  // --------------------------------------------------------------------------
  // Totales de RTM rechazadas
  // --------------------------------------------------------------------------

  // Total de RTM rechazadas ayer
  total_rechazado_ayer: number;

  // Total de RTM rechazadas durante el mes actual
  total_rechazado_mes: number;

  // Total de RTM rechazadas durante el año actual
  total_rechazado_anio: number;

  // --------------------------------------------------------------------------
  // Datos para gráficos
  // --------------------------------------------------------------------------

  // RTM realizadas por día del mes solicitado
  chart_mes: DayChartItem[];

  // RTM realizadas por mes del año solicitado
  chart_anio: MonthChartItem[];

  // RTM rechazadas por día del mes solicitado
  chart_rechazado_mes: DayChartItem[];

  // RTM rechazadas por mes del año solicitado
  chart_rechazado_anio: MonthChartItem[];
}

// ============================================================================
// PQAF
// Elemento individual de la lista de Peticiones, Quejas, Apelaciones
// y Felicitaciones.
// ============================================================================

export interface PQAFListItem {
  id: string;
  tenant_id: string;

  // Información del remitente
  sender_name: string;
  sender_email: string;
  sender_phone: string;

  // Información relacionada con el vehículo
  placa: string;

  // Descripción de la solicitud
  description: string;

  // Tipo de requerimiento
  requirement_type:
    | "peticion"
    | "queja"
    | "apelacion"
    | "felicitacion";

  // Estado actual del requerimiento
  status:
    | "pendiente"
    | "en_revision"
    | "resuelto"
    | "nueva_revision"
    | "finalizado";

  // Fechas de creación y actualización
  created_at: string;
  updated_at: string | null;

  // Cantidad total de registros encontrados por el RPC
  total_count: number;
}

// ============================================================================
// CONTEXT
// Estructura completa de datos y funcionalidades expuestas por el Context
// ============================================================================

export interface AdminContextType {
  AdminContextValue: {
    // ------------------------------------------------------------------------
    // Información general
    // ------------------------------------------------------------------------

    // Rol del usuario dentro del módulo
    rol: string;

    // ------------------------------------------------------------------------
    // Analytics
    // ------------------------------------------------------------------------

    // Datos de analytics diarios.
    // Puede ser undefined mientras la consulta inicial todavía está cargando.
    analyticsDataDiary: AdminAnalyticsDiaryData | undefined;

    // Query completa de TanStack Query para los analytics históricos.
    // Contiene data, estados, errores, refetch, etc.
    analyticsQuery: UseQueryResult<AdminAnalyticsData, Error>;

    // ------------------------------------------------------------------------
    // PQAF
    // ------------------------------------------------------------------------

    PQAFQuery: {
      // Datos obtenidos de la consulta
      PQAFData: PQAFListItem[];

      // Estado de carga/actualización
      isFetchingPQAF: boolean;
      isPQAFError: boolean;
      PQAFError: Error | null;
      isPQAFSuccess: boolean;

      // Permite volver a ejecutar manualmente la consulta
      refetchPQAF: () => void;

      // ----------------------------------------------------------------------
      // Ordenamiento
      // ----------------------------------------------------------------------

      orderByColumn: string;
      setOrderByColumn: (column: string) => void;

      orderByDirection: "ASC" | "DESC";
      setOrderByDirection: (direction: "ASC" | "DESC") => void;

      // ----------------------------------------------------------------------
      // Rango de fechas
      // ----------------------------------------------------------------------

      dateRange: DateRange | undefined;
      setDateRange: (range: DateRange | undefined) => void;

      // ----------------------------------------------------------------------
      // Búsqueda avanzada
      // ----------------------------------------------------------------------

      searchColumn: string;
      setSearchColumn: (column: string) => void;

      searchTerm: string;
      setSearchTerm: (term: string) => void;

      // ----------------------------------------------------------------------
      // Paginación
      // ----------------------------------------------------------------------

      page: number;
      setPage: (page: number) => void;

      rowsPerPage: number;
      setRowsPerPage: (rows: number) => void;
    };
  };
}





export const AdminContext = createContext<AdminContextType | null>(null);









interface AdminLoaderContext {
  children: ReactNode;
  rol: string;
}

export default function ReceptionistLoaderContext({
  rol,
  children,
}: AdminLoaderContext) {

  
 


  const pathname = usePathname();

  const permissionscontextRecived = useContext(PermissionsContext);
  const tenantId = permissionscontextRecived?.PermissionsContextValue.tenantObject?.id;

  const supabaseBrowser = createSupabaseBrowserClient();

  // 1. Estados locales para simular el comportamiento del servidor
  const [orderByColumn, setOrderByColumn] = useState<string>("created_at");
  const [orderByDirection, setOrderByDirection] = useState<"ASC" | "DESC">(
    "DESC",
  );

 // 1. Rango de fechas por defecto: Desde hace 1 mes hasta Hoy
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });

  const [searchColumn, setSearchColumn] = useState<string>("placa"); // Por defecto busca por Placa
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);




  //--------------------------------------------
  //TANSTAK QUERY PARA LOS PQAF
  //--------------------------------------------

  //Manejo del query para mantener los datos actualizados
  const {
    data: PQAFData,
    isFetching: isFetchingPQAF,
    isError: isPQAFError,
    error: PQAFError,
    refetch: refetchPQAF,
    isSuccess: isPQAFSuccess,
  } = useQuery({
    queryKey: [
      "pqaf",
      "list",
      pathname,
      orderByColumn,
      orderByDirection,
      dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "null",
      dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "null",

      searchColumn, // 🌟 NUEVO: Si cambian de 'placa' a 'marca', la caché debe cambiar
      searchTerm, // (Ya lo tenías, perfecto para el texto del input)
      page, // 🌟 NUEVO: Si cambian de página (1, 2, 3...), hay que traer datos nuevos
      rowsPerPage, // 🌟 NUEVO: Si cambian de ver 10 filas a ver 50 filas, cambia la consulta
    ],

    queryFn: async () => {
      console.log(`Pidiendo PQAF: ${orderByColumn} ${orderByDirection}`);

      //await new Promise((resolve) => setTimeout(resolve, 5000));

      // 🌟 Control preventivo de seguridad por si limpian el calendario
      // Si no hay fecha definida, por defecto no enviará solicitudes rotas al RPC
     // 🌟 Control preventivo de seguridad por si limpian el calendario
      const fechaDesde = dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : format(subMonths(new Date(), 1), "yyyy-MM-dd"); // 👈 Cambiado a hace 1 mes
        
      const fechaHasta = dateRange?.to
        ? format(dateRange.to, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");

      // Petición directa al nuevo RPC de Postgres
      const { data, error } = await supabaseBrowser.rpc(
        "fetch_service_requirements_list",
        {
          p_tenant_id: tenantId ?? "",
          p_limit: rowsPerPage,
          // MATEMÁTICA LÓGICA: Saltamos las filas según la página actual
          p_offset: (page - 1) * rowsPerPage,
          p_order_by_column: orderByColumn,
          p_order_by_direction: orderByDirection,
          p_fecha_desde: fechaDesde,
          p_fecha_hasta: fechaHasta,
          p_search_column: searchColumn, // Pasa la columna dinámica seleccionada en tu UI
          p_search_term: searchTerm,
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      // Casteas al tipo de lista de tu interfaz correspondiente (ej. PQAFListItem[])
      return (data as PQAFListItem[]) || [];
    },
    
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnWindowFocus: false,
  });












const analyticsQuery = useQuery({
  queryKey: ["admin_analytics", rol, 8, 2026],

  queryFn: async () => {
    console.log("Pidiendo analytics de agosto de 2026");

    const { data, error } = await supabaseBrowser.rpc(
      "fetch_admin_analitics",
      {
        p_mes_solicitado: 8,
        p_ano_solicitado: 2026,
      },
    );

    if (error) {
      console.error(
        "Error al extraer métricas e históricos con gráficos:",
        error.message,
      );

      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      return data[0] as unknown as AdminAnalyticsData;
    }

    throw new Error(
      "El RPC no devolvió datos de analytics.",
    );
  },

  staleTime: Infinity,
  refetchOnWindowFocus: false,
});












  const { data: analyticsDataDiary } = useQuery({
    queryKey: ["admin_analytics_diary", rol], // La key asegura que no se mezcle caché si cambias de rol
    queryFn: async () => {

      console.log("Pidiendo datos a analyticsDataDiary")
      // Llamada directa al RPC
      const { data, error } = await supabaseBrowser.rpc(
        "fetch_admin_analitics_diary",
      );

      if (error) {
        console.error("Error en polling de analytics:", error);
        throw error;
      }

      // Supabase suele devolver un array de los ROWS de Postgres.
      // Si tu función devuelve una sola fila con los datos consolidados, extraemos el índice 0.
      return data?.[0] as AdminAnalyticsDiaryData;
    },
    
    // Tiempo en milisegundos para volver a consultar (ej: 15000 = 15 segundos)
    refetchInterval: 15000,
    // Refresca si el administrador cambia de pestaña y vuelve
    refetchOnWindowFocus: true,
  });





  const AdminContextValue = {
    rol: rol,
    analyticsQuery: analyticsQuery,
    analyticsDataDiary: analyticsDataDiary,
    PQAFQuery: {
      PQAFData: PQAFData || [],
      isFetchingPQAF,
      isPQAFError,
      PQAFError,
      refetchPQAF,
      isPQAFSuccess,

      // Ordenamiento
      orderByColumn,
      setOrderByColumn,
      orderByDirection,
      setOrderByDirection,

      // Rango de Fechas
      dateRange,
      setDateRange,

      // Búsqueda Avanzada
      searchColumn,
      setSearchColumn,
      searchTerm,
      setSearchTerm,

      // Paginación
      page,
      setPage,
      rowsPerPage,
      setRowsPerPage,
    },
  };

  return (
    <AdminContext.Provider value={{ AdminContextValue }}>
      {children}
    </AdminContext.Provider>
  );
}