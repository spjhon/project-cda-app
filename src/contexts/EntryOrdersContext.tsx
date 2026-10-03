"use client";


import {
  UseMutateFunction,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { startOfMonth, format, startOfDay, subDays } from "date-fns";
import { PermissionsContext } from "./PermissionsLoaderContext";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Database } from "../../supabase/types/database.types";


interface ReceptionistLoaderContext {
  children: ReactNode;
}



export interface TirePressureDetail {
  id: string;
  eje: number;
  posicion:
    | "izquierda"
    | "derecha"
    | "centro"
    | "izquierda_interior"
    | "derecha_interior"
    | "repuesto";
  presion_encontrada: number | null;
  presion_ajustada: number | null;

}

// ======================================================
// Tipo de pagos de una orden
// ======================================================

export interface EntryOrderPaymentDetail {
  id: string;
  payment_method: Database["public"]["Enums"]["office_payment_type_enum"] | null;
  monto_bruto: number;
  num_comprobante: string | null;
  created_at: string;
  updated_at: string;
}

export type OfficePaymentType = Database["public"]["Enums"]["office_payment_type_enum"];


export interface EntryOrderListItem {
  id: string;
  placa: string;
  fecha: string;
  marca: string;
  linea: string;

  // Datos del Propietario (Snapshots)
  propietario_nombre: string;
  propietario_documento: string;
  propietario_tipo_documento: string;
  propietario_telefono: string | null;
  propietario_email: string | null;
  propietario_direccion: string | null;

  // Datos del Cliente (Snapshots)
  cliente_nombre: string;
  cliente_documento: string;
  cliente_tipo_documento: string;
  cliente_telefono: string | null;
  cliente_email: string | null;
  cliente_direccion: string | null;

  // Datos Operativos del Vehículo
  es_reinspeccion: boolean;
  kilometraje: string | null;
  soat_vencimiento_snapshot: string | null;
  service_type: Database["public"]["Enums"]["service_type_enum"];
  vehiculo_tipo_snapshot: Database["public"]["Enums"]["vehicle_type_enum"];
vehiculo_tipo_servicio_snapshot: Database["public"]["Enums"]["vehicle_service_type_enum"];
  estado_orden: string;

  // Información de Oficina
  oficina_pin: string | null;
  oficina_consecutivo_factura: string | null;
  se_compro_soat: boolean;
  rate_price_snapshot: number | null;

  // Resultado de la inspección
  resultado_revision: string | null;

  // Consecutivos de cierre técnico (ISO 17020)
  consecutivo_fur: string | null;
  consecutivo_rtm: string | null;

  // Presiones de Llantas
  presiones_llantas: TirePressureDetail[];

  // Pagos de la orden
  payments: EntryOrderPaymentDetail[];

  // Metadata de paginación
  total_count: number;
}
// ======================================================
// Parámetros de búsqueda
// ======================================================

export interface FetchEntryOrdersParams {
  tenantId: string;
  limit?: number;
  offset?: number;
  placa?: string;
  estado?: "abierta" | "anulada" | "en_prueba" | "finalizada" | undefined;
  fechaDesde?: string;
  fechaHasta?: string;
  clienteDocumento?: string;
  propietarioDocumento?: string;
}






export interface PendingPreviousDayOrder {
  id: string;
  consecutivo: number;
  fecha: string;
  estado_orden: "abierta" | "en_prueba" | "finalizada" | "anulada";
  vehiculo_placa_snapshot: string;
}

export interface TenantCredits {
  cupo_fupas: number;
  cupo_certificados: number;
  updated_at: string | null; // Permitimos string ISO o null si no se ha actualizado nunca
}

export interface EntryOrdersLoaderContextType {
  entryOrdersTableData: {
    query: {
      // Query completa de TanStack Query
      entryOrdersQuery: UseQueryResult<EntryOrderListItem[], Error>;

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

    tenantCreditsQuery: UseQueryResult<TenantCredits, Error>;

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


const hoyColombia = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Bogota",
}).format(new Date());

const hoy = new Date(`${hoyColombia}T12:00:00`);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: hoy,
    to: hoy,
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

  

  const pathname = usePathname();

  const supabaseBrowser = createSupabaseBrowserClient();







  //--------------------------------------------
  //TANSTAK QUERY PARA LAS ORDENES DE ENTRADA
  //--------------------------------------------

const entryOrdersQuery = useQuery({
  queryKey: ["entry_orders", "list"],

  queryFn: async () => {
    console.log(
      `Pidiendo órdenes ordenadas por: ${orderByColumn} ${orderByDirection}`,
    );

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
        p_offset: (page - 1) * rowsPerPage,
        p_order_by_column: orderByColumn,
        p_order_by_direction: orderByDirection,
        p_show_deleted: showDeleted,
        p_fecha_desde: fechaDesde,
        p_fecha_hasta: fechaHasta,
        p_search_column: searchColumn,
        p_search_term: searchTerm,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return (data as unknown as EntryOrderListItem[]) || [];
  },

  staleTime: 0,
  refetchInterval: 15000,
  enabled:
    pathname === "/dashboard/admin" ||
    pathname === "/dashboard/recepcionista/ordenes-de-entrada" ||
    pathname === "/dashboard/director-tecnico" ||
    pathname === "/dashboard/oficina",
});




useEffect(() => {
  const rutasPermitidas = [
    "/dashboard/admin",
    "/dashboard/recepcionista/ordenes-de-entrada",
    "/dashboard/director-tecnico",
    "/dashboard/oficina",
  ];

  if (!rutasPermitidas.includes(pathname)) {
    return;
  }

  entryOrdersQuery.refetch();
}, [
  pathname,
  orderByColumn,
  orderByDirection,
  showDeleted,
  dateRange,
  searchColumn,
  searchTerm,
  page,
  rowsPerPage,
]);




































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
        .select(
          `
        id,
        consecutivo,
        fecha,
        estado_orden,
        vehiculo_placa_snapshot
      `,
        )
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
          `Error al verificar el estado de la orden: ${fetchError.message}`,
        );
      }

      if (!currentOrder) {
        throw new Error("La orden de entrada no fue encontrada.");
      }

      // 🌟 2. Bloqueo si ya está finalizada o anulada
      if (
        currentOrder.estado_orden === "finalizada" ||
        currentOrder.estado_orden === "en_prueba"
      ) {
        throw new Error(
          `No se puede anular la orden porque ya se encuentra en estado "${currentOrder.estado_orden.toUpperCase()}".`,
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
          `Error al anular la orden de entrada: ${error.message}`,
        );
      }

      if (!data || data.length === 0) {
        throw new Error(
          "No se pudo anular la orden. Es posible que haya cambiado de estado recientemente o no tengas permisos.",
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







  //QUERY PARA MANTENER ACTUALIZADAS LAS FUPAS
  //QUERY PARA OBTENER LOS CRÉDITOS DEL TENANT
 const tenantCreditsQuery = useQuery({
  queryKey: ["tenant-credits", tenantId],
  enabled: !!tenantId,

  staleTime: Infinity,
  refetchInterval: 15000,

  queryFn: async () => {
    if (!tenantId) {
      throw new Error("Tenant ID no definido.");
    }

    const { data, error } = await supabaseBrowser
      .rpc("get_tenant_credits", {
        p_tenant_id: tenantId,
      })
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as TenantCredits;
  },
});







  const EntryOrdersContextValue = {
    entryOrdersTableData: {
      query: {
        entryOrdersQuery,

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
      // Dentro de entryOrdersTableData
      tenantCreditsQuery,
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

