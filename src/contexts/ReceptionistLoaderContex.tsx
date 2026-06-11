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
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth, format } from "date-fns";

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

        //la habilidad de poder ver los anulados
        showDeleted: boolean;
        setShowDeleted: (show: boolean) => void;

        // 🌟 NUEVOS TIPOS PARA EL COMPONENTE DATE-PICKER
        dateRange: DateRange | undefined;
        setDateRange: (range: DateRange | undefined) => void;

        // 🌟 NUEVOS ESTADOS PARA LA BÚSQUEDA AVANZADA
        searchColumn: string
        setSearchColumn: (col: string) => void
        searchTerm: string
        setSearchTerm: (term: string) => void

        //🌟 tipado para la paginacion
        page: number
        setPage: (page: number) => void
        rowsPerPage: number
        setRowsPerPage: (rows: number) => void
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
const [showDeleted, setShowDeleted] = useState<boolean>(false);
// 🌟 Inicializado por defecto: Desde el primero de este mes hasta el último día de este mes
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  // 🌟 NUEVOS ESTADOS: Inicializados con fallbacks seguros para el CDA
  const [searchColumn, setSearchColumn] = useState<string>("placa") // Por defecto busca por Placa
  const [searchTerm, setSearchTerm] = useState<string>("")   

  //paginacion       // Texto vacío al inicio
  const [page, setPage] = useState<number>(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(5) // Por defecto 10 filas


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
   
    

    queryKey: ["entry-orders", 
      "list", 
      pathname, 
      orderByColumn, 
      orderByDirection, 
      showDeleted,
      dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "null",
      dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "null",
      searchTerm,
      searchColumn, // 🌟 NUEVO: Si cambian de 'placa' a 'marca', la caché debe cambiar
      searchTerm,   // (Ya lo tenías, perfecto para el texto del input)
      page,         // 🌟 NUEVO: Si cambian de página (1, 2, 3...), hay que traer datos nuevos
      rowsPerPage   // 🌟 NUEVO: Si cambian de ver 10 filas a ver 50 filas, cambia la consulta
    ],

    queryFn: async () => {
      console.log(`Pidiendo órdenes ordenadas por: ${orderByColumn} ${orderByDirection}`);

      //await new Promise((resolve) => setTimeout(resolve, 5000));



      // 🌟 Control preventivo de seguridad por si limpian el calendario
      // Si no hay fecha definida, por defecto no enviará solicitudes rotas al RPC
      const fechaDesde = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : format(startOfMonth(new Date()), "yyyy-MM-dd");
      const fechaHasta = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");


      const { data, error } = await supabaseBrowser.rpc(
        "fetch_entry_orders_list",
        {
          p_tenant_id: tenantId ?? "",
          p_limit: rowsPerPage,
          // 🌟 MATEMÁTICA LÓGICA: Calculamos el offset en tiempo real para saltar las filas correctas
    // Ejemplo: Si estás en Pág 2 y ves de a 10 filas: (2 - 1) * 10 = Saltarse las primeras 10 filas (p_offset: 10)
    p_offset: (page - 1) * rowsPerPage,
          // 🌟 Pasamos los estados DIRECTOS, sin mapeos ni arrays raros
          p_order_by_column: orderByColumn,
          p_order_by_direction: orderByDirection,
          p_show_deleted: showDeleted, // 🌟 ¡Inyectamos el nuevo parámetro al RPC!
          // 🌟 PASAMOS LAS FECHAS FORMATEADAS AL RPC DE POSTGRESQL
        p_fecha_desde: fechaDesde,
        p_fecha_hasta: fechaHasta,
        p_search_column: "placa",
        p_search_term: searchTerm
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

        //habilidad de poder ver los anulados
        showDeleted,
        setShowDeleted,

        // 🌟 EXPONEMOS EL STATE AL CONTEXTO CONSUMIDOR
        dateRange,
        setDateRange,

        // 🌟 Inyectamos las nuevas propiedades en el Provider
        searchColumn,
        setSearchColumn,
        searchTerm,
        setSearchTerm,

        //Paginacion
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage
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
