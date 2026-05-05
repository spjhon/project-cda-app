"use client";

import { OrderTemplate } from "@/lib/dbFunctions/fetch_orders_templates";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { UseMutateFunction, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, use, useContext } from "react";
import { PermissionsContext } from "./PermissionsLoaderContext";
import { usePathname } from "next/navigation";



// 1. Tipamos el objeto de la mutación para que sea reusable
interface TemplateMutation {
  mutate: UseMutateFunction<{ id: string; is_active: boolean; }, Error, { id: string; is_active: boolean; }, unknown>;
  isPending: boolean;
}

// 2. Tipamos el objeto de la query
interface TemplateQuery {
  data: OrderTemplate[] | null;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
}

// 3. Definimos el valor total del contexto
export interface ReceptionistContextType {
  ReceptionistContextValue: {
    templateTableData: {
      query: TemplateQuery;
      mutation: TemplateMutation; // Corregido el typo de muetation
    };
  };
}

// Tipamos el Contexto
export const ReceptionistContext = createContext<ReceptionistContextType | null>(null);





interface ReceptionistLoaderContext {
  children: ReactNode;
  templateTabelDataPromise: Promise<OrderTemplate[] | null>;
}





export default function ReceptionistLoaderContext({templateTabelDataPromise, children}: ReceptionistLoaderContext) {

 const queryClient = useQueryClient();
 
  const permissionscontextRecived = useContext(PermissionsContext);
  const tenantId = permissionscontextRecived?.PermissionsContextValue.tenantObject?.id;
  const templateTableData = use(templateTabelDataPromise);

const pathname = usePathname();


 const supabaseBrowser = createSupabaseBrowserClient();

  //Llamado nuevaamente a los datos que llegaron inicialmente por medio de la promesa
  const { data, isFetching, isError, error, refetch, isSuccess } = useQuery({
    queryKey: ["templates", "list", pathname],
    queryFn: async () => {
      console.log("se llamo la funcion de query")
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
    staleTime: 10000,
  });








 //useMutation utilizado para cambiar el state de is_active que esta en un switch en el componente hijo
  const { mutate, isPending: isUpdating } = useMutation({
    mutationFn: async ({id, is_active}: {id: string;is_active: boolean}) => {

      const { error } = await supabaseBrowser
        .from("order_template") // Asegúrate de que este sea el nombre de tu tabla
        .update({ is_active })
        .eq("id", id);

      if (error) throw new Error(error.message);
      return { id, is_active };
    },


    // Al tener éxito, invalidamos la cache para que useQuery vuelva a pedir los datos
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", "list"] });
    },

    onError: (err) => {
      console.error("Error al actualizar:", err);
      // Aquí podrías disparar un toast de error
    },


  });





  const ReceptionistContextValue = {
    templateTableData: {
      query: {
        data: data,
        isFetching: isFetching,
        isError: isError,
        error: error,
        refetch: refetch,
        isSuccess: isSuccess
      },
      mutation: {
        mutate: mutate,
        isPending: isUpdating
      }
      
    },
  };





  return (
    <ReceptionistContext.Provider value={{ ReceptionistContextValue }}>
      {children}
    </ReceptionistContext.Provider>
  );
}
