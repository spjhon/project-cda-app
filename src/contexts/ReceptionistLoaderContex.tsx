"use client";

import { OrderTemplate } from "@/lib/server-actions/fetch_orders_templates";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, use, useContext } from "react";
import { PermissionsContext } from "./PermissionsLoaderContext";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";


// 3. Definimos el valor total del contexto
export interface ReceptionistContextType {
  ReceptionistContextValue: {
    rol: string;
   templateTableData: {
      query: TemplateQuery;
      
    };
  };
}

interface TemplateQuery {
  data: OrderTemplate[] | null;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
}




// Tipamos el Contexto
export const ReceptionistContext = createContext<ReceptionistContextType | null>(null);

interface ReceptionistLoaderContext {
  children: ReactNode;
  templateTabelDataPromise: Promise<OrderTemplate[] | null>;
  
  rol: string;
}

export default function ReceptionistLoaderContext({
  rol,
  templateTabelDataPromise,
  children,
}: ReceptionistLoaderContext) {
 


  const permissionscontextRecived = useContext(PermissionsContext);
  const tenantId = permissionscontextRecived?.PermissionsContextValue.tenantObject?.id;
  const templateTableData = use(templateTabelDataPromise);

  const pathname = usePathname();

  const supabaseBrowser = createSupabaseBrowserClient();

  //--------------------------------------------
  //TANSTAK QUERY PARA LOS TEMPLATES
  //--------------------------------------------

  //Llamado nuevaamente a los datos que llegaron inicialmente por medio de la promesa
  const { data, isFetching, isError, error, refetch, isSuccess } = useQuery({
    queryKey: ["templates", "list", pathname], //TODO, HAY QUE CUADRAR ESTE PATH NAME PARA QUE SOLO SE ACTUALIZE CUANDO SE ENTRE EN EL PAGE.TSX CORRECTO
    queryFn: async () => {
      console.log("se llamo la funcion de query");
      // LLAMADA DIRECTA A SUPABASE
      const { data, error } = await supabaseBrowser.rpc(
        "fetch_orders_templates",
        {
          p_tenant_id: tenantId ? tenantId : "",
        },
      );

      if (error) throw new Error(error.message);

      return (data as unknown as OrderTemplate[]) || [];
    },
    initialData: templateTableData,
    staleTime: 0,
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
  });






  const ReceptionistContextValue = {
    rol: rol,
    templateTableData: {
      query: {
        data: data,
        isFetching: isFetching,
        isError: isError,
        error: error,
        refetch: refetch,
        isSuccess: isSuccess,
      },
      
    },
  };

  return (
    <ReceptionistContext.Provider value={{ ReceptionistContextValue }}>
      {children}
    </ReceptionistContext.Provider>
  );
}
