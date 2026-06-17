"use client"


import { createContext, ReactNode, use, useContext } from "react";



import { OrderTemplate } from "@/lib/server-actions/fetch_orders_templates";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  UseMutateFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { PermissionsContext } from "./PermissionsLoaderContext";



interface DirectorTecnicoLoaderContext {
  children: ReactNode;
 rol: string;
 templateTabelDataPromise: Promise<OrderTemplate[] | null>;
}


export interface DirectorTecnicoContextType {
  DirectorTecnicoContextValue: {
    rol: string;
    templateTableData: {
      query: TemplateQuery;
      mutation: TemplateMutation; // Corregido el typo de muetation
    };
  };
}






// 1. Tipamos el objeto de la mutación para que sea reusable
/**
 * "Esta es una función que recibe un string (TVariables), retorna un string si todo sale bien (TData), puede lanzar un objeto de tipo Error si falla (TError), y no maneja contexto intermedio (TContext)."
 * UseMutateFunction<TData, TError, TVariables, TContext>
 */
interface TemplateMutation {
  updateIsActive: UseMutateFunction<
    { id: string; is_active: boolean },
    Error,
    { id: string; is_active: boolean },
    unknown
  >;
  isUpdating: boolean;
  deleteTemplate: UseMutateFunction<
    string,
    Error,
    { id: string; tenantId: string },
    unknown
  >;
  isDeletingTemplate: boolean;
  errorDeletingTemplate: Error | null;
  resetDeleteMutation: () => void;
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













export const DirectorTecnicoContext = createContext<DirectorTecnicoContextType | null>(null);


export default function DirectorTecnicoLoaderContext({
  rol,
  children,
  templateTabelDataPromise,
}: DirectorTecnicoLoaderContext) {





 const queryClient = useQueryClient();

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

  //useMutation utilizado para cambiar el state de is_active que esta en un switch en el componente hijo
  const { mutate: updateIsActive, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
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

  //Mutacion para la eliminacion de unn temmplate, primero reviza si ya existe uno y si si, no deja eliminar el template
  const {
    mutate: deleteTemplate,
    isPending: isDeletingTemplate,
    error: errorDeletingTemplate,
    reset: resetDeleteMutation,
  } = useMutation({
    mutationFn: async ({ id, tenantId }: { id: string; tenantId: string }) => {
      // 1. VERIFICACIÓN: Consultamos si el id de la plantilla ya está en entry_orders
      const { data: existingOrders, error: searchError } = await supabaseBrowser
        .from("entry_orders")
        .select("id") // Solo pedimos el ID para que sea ultra ligero
        .eq("plantilla_id", id)
        .eq("tenant_id", tenantId) // Seguridad Multi-tenant obligatoria
        .is("deleted_at", null) // Ignoramos órdenes eliminadas si tienes soft-delete
        .limit(1); // Con encontrar una sola, ya sabemos que no se puede borrar

      if (searchError) {
        throw new Error(
          `Error al verificar trazabilidad: ${searchError.message}`,
        );
      }

      // 2. CONDICIONAL: Si encuentra al menos un registro, arrojamos el error para TanStack Query
      if (existingOrders && existingOrders.length > 0) {
        throw new Error(
          "No se puede eliminar la plantilla. Ya se encuentra asociada a órdenes de entrada en el sistema y debe conservarse por auditoría.",
        );
      }

      // 3. ACCIÓN: Si pasó la verificación, procedemos con el Soft Delete de la plantilla
      const { data: deletedRows, error: deleteError } = await supabaseBrowser
        .from("order_template")
        .delete() // 🔥 Quita el .update(...) e inyecta el .delete() directamente
        .eq("id", id)
        .eq("tenant_id", tenantId) // Seguridad Multi-tenant para que solo borre lo suyo
        .select("id"); // 💥 LE PEDIMOS QUE RETORNE EL ID BORRADO

      if (deleteError) {
        throw new Error(
          `Error al eliminar la plantilla: ${deleteError.message}`,
        );
      }

      // 🚨 SI RLS FALLÓ: deletedRows vendrá vacío (length === 0)
      if (!deletedRows || deletedRows.length === 0) {
        throw new Error(
          "Violación de seguridad RLS: No tienes permisos para eliminar esta plantilla o no pertenece a tu organización.",
        );
      }

      return id;
    },

    // Al tener éxito, invalidamos la caché para actualizar tu tabla en la interfaz
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", "list"] });
      // Aquí puedes disparar tu toast de éxito: toast.success("Plantilla eliminada")
    },

    // Aquí es donde TanStack Query captura CUALQUIERA de los "throw new Error" de arriba
    onError: (err: Error) => {
      console.log("Operación rechazada:", err.message);
      // 💥 Aquí disparas tu toast de error pasándole el mensaje exacto que arrojamos
      // toast.error(err.message)
    },
  });












const DirectorTecnicoContextValue = {
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
      mutation: {
        //Mutacion para el cambio de plantilla activa a una inactiva
        updateIsActive: updateIsActive,
        isUpdating: isUpdating,
        //Mutacion para la eliminacion de un template
        deleteTemplate: deleteTemplate,
        isDeletingTemplate: isDeletingTemplate,
        errorDeletingTemplate: errorDeletingTemplate,
        resetDeleteMutation: resetDeleteMutation,
      },
    },
}


return (
  <DirectorTecnicoContext.Provider value={{ DirectorTecnicoContextValue }}>
        {children}
      </DirectorTecnicoContext.Provider>
)


}