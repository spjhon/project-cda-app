"use client";

import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import {
  UseMutateFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createContext, ReactNode, use, useContext, useState } from "react";
import { DateRange } from "react-day-picker";
import { startOfMonth, format, startOfDay, subDays } from "date-fns";
import { PermissionsContext } from "./PermissionsLoaderContext";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { TenantCredits } from "@/lib/server-actions/fetch_tenant_credits";

interface ReceptionistLoaderContext {
  children: ReactNode;
  entryOrdersTableDataPromise: Promise<EntryOrderListItem[] | null>;
  tenantCreditsPromise: Promise<TenantCredits | null>;
}

export interface PendingPreviousDayOrder {
  id: string;
  consecutivo: number;
  fecha: string;
  estado_orden: "abierta" | "en_prueba" | "finalizada" | "anulada";
  vehiculo_placa_snapshot: string;
}

export interface EntryOrdersLoaderContextType {
  entryOrdersTableData: {
    query: {
      entryOrdersData: EntryOrderListItem[] | null;
      isFetchingEntryOrders: boolean;
      isEntryOrdersError: boolean;
      entryOrdersError: Error | null;
      refetchEntryOrders: () => void;
      isEntryOrdersSuccess: boolean;

      // Ordenamiento
      orderByColumn: string;
      setOrderByColumn: (column: string) => void;
      orderByDirection: "ASC" | "DESC";
      setOrderByDirection: (direction: "ASC" | "DESC") => void;

      // Ver anulados
      showDeleted: boolean;
      setShowDeleted: (show: boolean) => void;

      // Filtro por fechas
      dateRange: DateRange | undefined;
      setDateRange: (range: DateRange | undefined) => void;

      // Búsqueda
      searchColumn: string;
      setSearchColumn: (col: string) => void;
      searchTerm: string;
      setSearchTerm: (term: string) => void;

      // Paginación
      page: number;
      setPage: (page: number) => void;
      rowsPerPage: number;
      setRowsPerPage: (rows: number) => void;
    };

    ordenesDelDiaAnteriorQuery: {
      pendingPreviousDayOrders: PendingPreviousDayOrder[] | undefined;

      isLoadingPendingPreviousDayOrders: boolean;
      isPendingPreviousDayOrdersError: boolean;
      pendingPreviousDayOrdersError: Error | null;
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
}

export const EntryOrdersContext =
  createContext<EntryOrdersLoaderContextType | null>(null);

export default function EntryOrdersLoaderContext({
  entryOrdersTableDataPromise,
  tenantCreditsPromise,
  children,
}: ReceptionistLoaderContext) {
  //state para para que el query siepre mantenta el contexto de lo que debe mantener actualizado y en constante pooling
  //se modifica desde otro lado y se mantiene el state aqui.
  // 1. Creamos los dos estados limpios con sus valores por defecto
  const [orderByColumn, setOrderByColumn] = useState<string>("fecha");
  const [orderByDirection, setOrderByDirection] = useState<"ASC" | "DESC">(
    "DESC",
  );
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  // 🌟 Inicializado por defecto: Desde el primero de este mes hasta el último día de este mes
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  // 🌟 NUEVOS ESTADOS: Inicializados con fallbacks seguros para el CDA
  const [searchColumn, setSearchColumn] = useState<string>("placa"); // Por defecto busca por Placa
  const [searchTerm, setSearchTerm] = useState<string>("");

  //paginacion       // Texto vacío al inicio
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50); // Por defecto 10 filas

  const queryClient = useQueryClient();

  const permissionscontextRecived = useContext(PermissionsContext);

  const tenantId = permissionscontextRecived?.PermissionsContextValue.tenantObject?.id;

  const entryOrdersTableData = use(entryOrdersTableDataPromise);
  const tenantCredits = use(tenantCreditsPromise);

  console.log(tenantCredits);

  const pathname = usePathname();

  const supabaseBrowser = createSupabaseBrowserClient();

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
    queryKey: [
      "entry-orders",
      "list",
      pathname,
      orderByColumn,
      orderByDirection,
      showDeleted,
      dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "null",
      dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "null",
      searchTerm,
      searchColumn, // 🌟 NUEVO: Si cambian de 'placa' a 'marca', la caché debe cambiar
      searchTerm, // (Ya lo tenías, perfecto para el texto del input)
      page, // 🌟 NUEVO: Si cambian de página (1, 2, 3...), hay que traer datos nuevos
      rowsPerPage, // 🌟 NUEVO: Si cambian de ver 10 filas a ver 50 filas, cambia la consulta
    ],

    queryFn: async () => {
      console.log(
        `Pidiendo órdenes ordenadas por: ${orderByColumn} ${orderByDirection}`,
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
          p_search_term: searchTerm,
        },
      );

      if (error) throw new Error(error.message);

      return (data as unknown as EntryOrderListItem[]) || [];
    },
    initialData: entryOrdersTableData,
    staleTime: 0,
    refetchInterval: 15000,
  });

  //QUERY PARA VERIFICAR QUE NO HAYAN ORDENES DE ENTRADA ABIERTAS DEL DIA ANTERIOR
const {
  data: pendingPreviousDayOrders = [],
  isLoading: isLoadingPendingPreviousDayOrders,
  isError: isPendingPreviousDayOrdersError,
  error: pendingPreviousDayOrdersError,
} = useQuery<PendingPreviousDayOrder[]>({
  queryKey: ["pending-previous-day-orders", tenantId],

  enabled: !!tenantId,

  staleTime: Infinity,
  gcTime: Infinity,

  queryFn: async () => {
    const fechaDesde = startOfDay(subDays(new Date(), 7)).toISOString();
    const fechaHasta = startOfDay(new Date()).toISOString();

    if (!tenantId) {
      throw new Error("Tenant ID no definido.");
    }

    const { data, error } = await supabaseBrowser
      .from("entry_orders")
      .select(`
        id,
        consecutivo,
        fecha,
        estado_orden,
        vehiculo_placa_snapshot
      `)
      .eq("tenant_id", tenantId)
      .gte("fecha", fechaDesde)
      .lt("fecha", fechaHasta)
      .in("estado_orden", ["abierta", "en_prueba"])
      .is("deleted_at", null)
      .order("consecutivo");

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
});



// Mutación para la ANULACIÓN de la orden
const {
  mutate: cancelOrder,
  isPending: isCancelingOrder,
  error: errorCancelingOrder,
  reset: resetCancelError,
} = useMutation({
  mutationFn: async ({ id, tenantId }: { id: string; tenantId: string }) => {
    // 🌟 1. Validar el estado actual de la orden en la base de datos antes de anular
    const { data: currentOrder, error: fetchError } = await supabaseBrowser
      .from("entry_orders")
      .select("estado_orden")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError) {
      throw new Error(
        `Error al verificar el estado de la orden: ${fetchError.message}`
      );
    }

    if (!currentOrder) {
      throw new Error("La orden de entrada no fue encontrada.");
    }

    console.log(currentOrder.estado_orden)

    // 🌟 2. Bloqueo si ya está finalizada o anulada
    if (
      currentOrder.estado_orden === "finalizada" ||
      currentOrder.estado_orden === "en_prueba"
    ) {
      throw new Error(
        `No se puede anular la orden porque ya se encuentra en estado "${currentOrder.estado_orden.toUpperCase()}".`
      );
    }

    // 🌟 3. Ejecutar el Soft Delete solo si pasa la validación
    const { data, error } = await supabaseBrowser
      .from("entry_orders")
      .update({
        deleted_at: new Date().toISOString(),
        estado_orden: "anulada",
      })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .neq("estado_orden", "finalizada") // Filtro defensivo extra a nivel de query
      .neq("estado_orden", "anulada")
      .select("id");

    if (error) {
      throw new Error(
        `Error al anular la orden de entrada: ${error.message}`
      );
    }

    if (!data || data.length === 0) {
      throw new Error(
        "No se pudo anular la orden. Es posible que haya cambiado de estado recientemente o no tengas permisos."
      );
    }

    return id;
  },

  onSuccess: () => {
    // Invalidamos la caché para refrescar la lista/tabla de órdenes
    queryClient.invalidateQueries({ queryKey: ["entry-orders", "list"] });
  },

  onError: (err: Error) => {
    console.error("Fallo en la anulación de orden:", err.message);
  },
});





  const EntryOrdersContextValue = {
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
        setRowsPerPage,
      },
      ordenesDelDiaAnteriorQuery: {
        pendingPreviousDayOrders,
        isLoadingPendingPreviousDayOrders,
        isPendingPreviousDayOrdersError,
        pendingPreviousDayOrdersError,
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
    <EntryOrdersContext.Provider value={EntryOrdersContextValue}>
      {children}
    </EntryOrdersContext.Provider>
  );
}
