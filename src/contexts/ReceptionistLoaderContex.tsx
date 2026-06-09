"use client";

import { OrderTemplate } from "@/lib/server-actions/fetch_orders_templates";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  UseMutateFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createContext, ReactNode, use, useContext, useState } from "react";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import { usePathname } from "next/navigation";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";

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

// 3. Definimos el valor total del contexto
export interface ReceptionistContextType {
  ReceptionistContextValue: {
    templateTableData: {
      query: TemplateQuery;
      mutation: TemplateMutation; // Corregido el typo de muetation
    };
    entryOrdersTableData: {
      query: {
        entryOrdersData: EntryOrderListItem[] | null;
        isFetchingEntryOrders: boolean;
        isEntryOrdersError: boolean;
        entryOrdersError: Error | null;
        refetchEntryOrders: () => void;
        isEntryOrdersSuccess: boolean;

        // 🌟 CAMBIAMOS A ESTADOS SIMPLES Y LEGIBLES
        orderByColumn: string;
        setOrderByColumn: (column: string) => void;
        orderByDirection: "ASC" | "DESC";
        setOrderByDirection: (direction: "ASC" | "DESC") => void;
      };
      mutation: {
        cancelOrder: UseMutateFunction<
          string,
          Error,
          { id: string; tenantId: string },
          unknown
        >;
        isCancelingOrder: boolean;
        errorCancelingOrder: Error | null;
        resetCancelError: () => void;
      };
    };
  };
}

// Tipamos el Contexto
export const ReceptionistContext = createContext<ReceptionistContextType | null>(null);

interface ReceptionistLoaderContext {
  children: ReactNode;
  templateTabelDataPromise: Promise<OrderTemplate[] | null>;
  entryOrdersTableDataPromise: Promise<EntryOrderListItem[] | null>;
}

export default function ReceptionistLoaderContext({
  templateTabelDataPromise,
  entryOrdersTableDataPromise,
  children,
}: ReceptionistLoaderContext) {

//state para para que el query siepre mantenta el contexto de lo que debe mantener actualizado y en constante pooling
//se modifica desde otro lado y se mantiene el state aqui.
// 1. Creamos los dos estados limpios con sus valores por defecto
const [orderByColumn, setOrderByColumn] = useState<string>("fecha");
const [orderByDirection, setOrderByDirection] = useState<"ASC" | "DESC">("DESC");



  const queryClient = useQueryClient();

  const permissionscontextRecived = useContext(PermissionsContext);
  const tenantId = permissionscontextRecived?.PermissionsContextValue.tenantObject?.id;
  const templateTableData = use(templateTabelDataPromise);
  const entryOrdersTableData = use(entryOrdersTableDataPromise);

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
  refetchOnWindowFocus: false
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










  //--------------------------------------------
  //TANSTAK QUERY PARA LAS ORDENES DE ENTRADA
  //--------------------------------------------

  //Manejo del query para mantener los datos actualizados
  const {
    data: entryOrdersData,
    isFetching: isFetchingEntryOrders,
    isError: isEntryOrdersError,
    error: entryOrdersError,
    refetch: refetchEntryOrders,
    isSuccess: isEntryOrdersSuccess,
  } = useQuery({
   

    queryKey: ["entry-orders", "list", pathname, orderByColumn, orderByDirection],

    queryFn: async () => {
      console.log(`Pidiendo órdenes ordenadas por: ${orderByColumn} ${orderByDirection}`);

      const { data, error } = await supabaseBrowser.rpc(
        "fetch_entry_orders_list",
        {
          p_tenant_id: tenantId ?? "",
          p_limit: 20,
          p_offset: 0,
          // 🌟 Pasamos los estados DIRECTOS, sin mapeos ni arrays raros
          p_order_by_column: orderByColumn,
          p_order_by_direction: orderByDirection,
        }
      );

      if (error) throw new Error(error.message);
      return (data as EntryOrderListItem[]) || [];
    },
  initialData: entryOrdersTableData,
  staleTime: 0,
  refetchInterval: 10000,
  refetchOnWindowFocus: false
});






  //Mutaciioon para la anulacion de la orden
  // Estructura de la mutación de TanStack Query
  const {
    mutate: cancelOrder,
    isPending: isCancelingOrder,
    error: errorCancelingOrder,
    reset: resetCancelError,
  } = useMutation({
    // Recibe un objeto con el ID de la orden y el tenant_id actual del contexto de permisos
    mutationFn: async ({ id, tenantId }: { id: string; tenantId: string }) => {
      // Ejecutamos el Soft Delete real mediante un .update()
      const { data, error } = await supabaseBrowser
        .from("entry_orders")
        .update({
          deleted_at: new Date().toISOString(),
          estado_orden: "anulada", // Ajusta este string según tus enums o reglas de estado actuales
        })
        .eq("id", id)
        .eq("tenant_id", tenantId) // Garantía multi-tenant estricta
        .select("id"); // Usamos select para confirmar si la fila existía y el RLS aprobó la acción

      if (error) {
        throw new Error(
          `Error al anular la orden de entrada: ${error.message}`,
        );
      }

      // Si pasó con éxito pero el RLS bloqueó o no se encontró la fila (array vacío)
      if (!data || data.length === 0) {
        throw new Error(
          "No se pudo anular la orden. No tienes los permisos necesarios o el registro no pertenece a tu organización.",
        );
      }

      return id;
    },

    // Al completarse de forma exitosa en la base de datos
    onSuccess: () => {
      // Invalidamos la caché de la lista de órdenes para que la tabla se refresque automáticamente
      queryClient.invalidateQueries({ queryKey: ["entry-orders", "list"] });
      // Aquí puedes meter tu toast: toast.success("Orden anulada correctamente")
    },

    // Captura de errores para la auditoría de consola
    onError: (err: Error) => {
      console.error("Fallo en la anulación de orden:", err.message);
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
    entryOrdersTableData: {
      query: {
        entryOrdersData: entryOrdersData,
        isFetchingEntryOrders: isFetchingEntryOrders,
        isEntryOrdersError: isEntryOrdersError,
        entryOrdersError: entryOrdersError,
        refetchEntryOrders: refetchEntryOrders,
        isEntryOrdersSuccess: isEntryOrdersSuccess,

        // 🌟 Compartimos los nuevos estados y sus funciones mutadoras
        orderByColumn,
        setOrderByColumn,
        orderByDirection,
        setOrderByDirection,
      },
      mutation: {
        cancelOrder: cancelOrder,
        isCancelingOrder: isCancelingOrder,
        errorCancelingOrder: errorCancelingOrder,
        resetCancelError: resetCancelError,
      },
    },
  };







  return (
    <ReceptionistContext.Provider value={{ ReceptionistContextValue }}>
      {children}
    </ReceptionistContext.Provider>
  );
}
