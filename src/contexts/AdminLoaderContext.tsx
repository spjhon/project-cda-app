"use client";

import { AdminAnalyticsData, AdminAnalyticsDiaryData } from "@/app/[tenant]/dashboard/admin/layout";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode, use } from "react";

interface AdminLoaderContext {
  children: ReactNode;
  rol: string;
  adminAnalyticsPromise: Promise<AdminAnalyticsData>;
  adminAnalyticsDiaryPromise: Promise<AdminAnalyticsDiaryData>;

}

export interface AdminContextType {
  AdminContextValue: {
    rol: string;
    analyticsData: AdminAnalyticsData;
    analyticsDataDiary: AdminAnalyticsDiaryData;
  },
  
}

export const AdminContext = createContext<AdminContextType | null>(null);

export default function ReceptionistLoaderContext({
  rol,
  children,
  adminAnalyticsPromise ,
  adminAnalyticsDiaryPromise
}: AdminLoaderContext) {




 const analyticsData = use(adminAnalyticsPromise);
 const initialAnalyticsDataDiary = use(adminAnalyticsDiaryPromise);

const supabaseBrowser = createSupabaseBrowserClient()


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
    analyticsDataDiary: analyticsDataDiary
  };

  return (
    <AdminContext.Provider value={{ AdminContextValue }}>
      {children}
    </AdminContext.Provider>
  );
}
