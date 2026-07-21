"use client";

import { AdminAnalyticsData, AdminAnalyticsDiaryData, PQAFListItem } from "@/app/[tenant]/(private)/dashboard/admin/layout";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode, use, useContext, useState } from "react";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { usePathname } from "next/navigation";
import { PermissionsContext } from "./PermissionsLoaderContext";



interface AdminLoaderContext {
  children: ReactNode;
  rol: string;
  adminAnalyticsPromise: Promise<AdminAnalyticsData>;
  adminAnalyticsDiaryPromise: Promise<AdminAnalyticsDiaryData>;
  initialPQAFPromise: Promise<PQAFListItem[]>;

}




export interface AdminContextType {
  AdminContextValue: {
    rol: string;
    analyticsData: AdminAnalyticsData;
    analyticsDataDiary: AdminAnalyticsDiaryData;
    
    PQAFQuery: {
      PQAFData: PQAFListItem[] | null;
      isFetchingPQAF: boolean;
      isPQAFError: boolean;
      PQAFError: Error | null;
      refetchPQAF: () => void;
      isPQAFSuccess: boolean;

      // Ordenamiento
      orderByColumn: string;
      setOrderByColumn: (column: string) => void;
      orderByDirection: "ASC" | "DESC";
      setOrderByDirection: (direction: "ASC" | "DESC") => void;

      // Rango de Fechas
      dateRange: DateRange | undefined;
      setDateRange: (range: DateRange | undefined) => void;

      // Búsqueda Avanzada
      searchColumn: string;
      setSearchColumn: (column: string) => void;
      searchTerm: string;
      setSearchTerm: (term: string) => void;

      // Paginación
      page: number;
      setPage: (page: number) => void;
      rowsPerPage: number;
      setRowsPerPage: (rows: number) => void;
    };
  };
}








export const AdminContext = createContext<AdminContextType | null>(null);

export default function ReceptionistLoaderContext({
  rol,
  children,
  adminAnalyticsPromise ,
  adminAnalyticsDiaryPromise,
  initialPQAFPromise
}: AdminLoaderContext) {

 const analyticsData = use(adminAnalyticsPromise);
 const initialAnalyticsDataDiary = use(adminAnalyticsDiaryPromise);
const initialPQAFData = use(initialPQAFPromise);



const pathname = usePathname();







 const permissionscontextRecived = useContext(PermissionsContext);
const tenantId = permissionscontextRecived?.PermissionsContextValue.tenantObject?.id;




const supabaseBrowser = createSupabaseBrowserClient()



// 1. Estados locales para simular el comportamiento del servidor
  const [orderByColumn, setOrderByColumn] = useState<string>("created_at");
  const [orderByDirection, setOrderByDirection] = useState<"ASC" | "DESC">("DESC");
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
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
      console.log(
        `Pidiendo PQAF: ${orderByColumn} ${orderByDirection}`,
      );

      //await new Promise((resolve) => setTimeout(resolve, 5000));

      // 🌟 Control preventivo de seguridad por si limpian el calendario
      // Si no hay fecha definida, por defecto no enviará solicitudes rotas al RPC
      const fechaDesde = dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : format(startOfMonth(new Date()), "yyyy-MM-dd");
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
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    // Casteas al tipo de lista de tu interfaz correspondiente (ej. PQAFListItem[])
    return (data as PQAFListItem[]) || [];

      


    },
    initialData: initialPQAFData,
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnWindowFocus: false,
  });
















const { data: analyticsDataDiary } = useQuery({
    queryKey: ["admin_analytics_diary", rol], // La key asegura que no se mezcle caché si cambias de rol
    queryFn: async () => {
      // Llamada directa al RPC
      const { data, error } = await supabaseBrowser.rpc("fetch_admin_analitics_diary");
      
      if (error) {
        console.error("Error en polling de analytics:", error);
        throw error;
      }
      
      // Supabase suele devolver un array de los ROWS de Postgres. 
      // Si tu función devuelve una sola fila con los datos consolidados, extraemos el índice 0.
      return data?.[0] as AdminAnalyticsDiaryData; 
    },
    // Le inyectamos la data del servidor para que haya CERO tiempo de carga inicial
    initialData: initialAnalyticsDataDiary, 
    // Tiempo en milisegundos para volver a consultar (ej: 15000 = 15 segundos)
    refetchInterval: 15000, 
    // Refresca si el administrador cambia de pestaña y vuelve
    refetchOnWindowFocus: true, 
  });















  const AdminContextValue = {
    rol: rol,
    analyticsData: analyticsData,
    analyticsDataDiary: analyticsDataDiary,
    PQAFQuery: {
      PQAFData,
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
    }
  };

  return (
    <AdminContext.Provider value={{ AdminContextValue }}>
      {children}
    </AdminContext.Provider>
  );
}
