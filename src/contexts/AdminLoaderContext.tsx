"use client";


import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { format, subMonths } from "date-fns";
import { usePathname } from "next/navigation";
import { PermissionsContext } from "./PermissionsLoaderContext";
import { Database } from "../../supabase/types/database.types";
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
  dia: string;
  mes: number;
  ano: number;
  total: number;
}

// Elemento utilizado en gráficos agrupados por mes.
// Ejemplo: { mes: "Enero", total: 120 }
export interface MonthChartItem {
  mes: string;
  numero_mes: number;
  ano: number;
  total: number;
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


export type ServiceTypeFilter = ServiceTypeEnum | null;

export type VehiclesByTypeData = Record<string, number>;




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
    analyticsQueryDiary: UseQueryResult<AdminAnalyticsDiaryData, Error>;

    // Query completa de TanStack Query para los analytics históricos.
    // Contiene data, estados, errores, refetch, etc.
    analyticsQuery: UseQueryResult<AdminAnalyticsData, Error>;
// ------------------------------------------------------------------------
// Selector de mes, año y servicio para analytics
// ------------------------------------------------------------------------

mesSeleccionado: number;
setMesSeleccionado: (mes: number) => void;

anoSeleccionado: number;
setAnoSeleccionado: (ano: number) => void;

servicioTipoSeleccionado: ServiceTypeFilter;
setServicioTipoSeleccionado: (servicio: ServiceTypeFilter) => void;



    // ------------------------------------------------------------------------
    // Analytics - Vehículos por tipo
    // ------------------------------------------------------------------------

    // Datos históricos agrupados por tipo de vehículo.
    vehiclesByTypeQuery: UseQueryResult<VehiclesByTypeData, Error>;

    // Datos correspondientes únicamente al día actual.
    vehiclesByTypeDiaryQuery: UseQueryResult<VehiclesByTypeData, Error>;

    // Rango de fechas utilizado para consultar los vehículos por tipo.
    dateVehicleTypeRange: DateRange | undefined;

    setDateVehicleTypeRange: (range: DateRange | undefined) => void;

// ------------------------------------------------------------------------
// Analytics - Pagos por método
// ------------------------------------------------------------------------

paymentsByMethodQuery: UseQueryResult<
  PaymentsByMethodData,
  Error
>;

paymentsByMethodDiaryQuery: UseQueryResult<
  PaymentsByMethodData,
  Error
>;

datePaymentMethodRange: DateRange | undefined;

setDatePaymentMethodRange: (
  range: DateRange | undefined,
) => void;

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

    
    // ------------------------------------------------------------------------
// Analytics - Contabilidad
// ------------------------------------------------------------------------

// Query completa de TanStack Query para los analytics contables históricos.
// Contiene data, estados, errores, refetch, etc.
analyticsContabilidadQuery: UseQueryResult<
  AdminContabilidadData,
  Error
>;

// Query de datos correspondientes únicamente al día actual.
analyticsContabilidadQueryDiary: UseQueryResult<
  AdminContabilidadDiaryData,
  Error
>;

// ------------------------------------------------------------------------
// Selector de mes, año y servicio para analytics contables
// ------------------------------------------------------------------------

mesContabilidadSeleccionado: number;

setMesContabilidadSeleccionado: (mes: number) => void;

anoContabilidadSeleccionado: number;

setAnoContabilidadSeleccionado: (ano: number) => void;

servicioTipoContabilidadSeleccionado: ServiceTypeFilter;

setServicioTipoContabilidadSeleccionado: (
  servicio: ServiceTypeFilter,
) => void;




  };
}


export type ServiceTypeEnum =
  Database["public"]["Enums"]["service_type_enum"] | null;


export const AdminContext = createContext<AdminContextType | null>(null);







export type AdminContabilidadData = {
  total_recaudado_ayer: number;
  total_recaudado_mes: number;
  total_recaudado_semana: number;
  total_recaudado_anio: number;

  chart_semana: {
    dia: string;
    numero_dia: number;
    fecha: string;
    total: number;
  }[];

  chart_mes: {
    dia: string;
    mes: number;
    ano: number;
    total: number;
  }[];

  chart_anio: {
    mes: string;
    numero_mes: number;
    ano: number;
    total: number;
  }[];
};


export type PaymentsByMethodData = {
  efectivo: number;
  tarjeta_debito: number;
  tarjeta_credito: number;
  sistecredito: number;
  addi: number;
  transferencia: number;
  qr: number;
};


export type AdminContabilidadDiaryData = {
  total_recaudado_hoy: number;
};


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
  //STATES DEL MES Y AÑO A BUSCAR
  //--------------------------------------------

const ahora = new Date();

const mesActual = Number(
  ahora.toLocaleString("en-US", {
    timeZone: "America/Bogota",
    month: "numeric",
  })
);

const anoActual = Number(
  ahora.toLocaleString("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
  })
);

//STATES DE LA CONSULTA POR VEHICLE TYPE

// STATES DE LA CONSULTA POR VEHICLE TYPE
// Las fechas se obtienen según el calendario de Colombia.
// Usamos las 12:00 del día para evitar problemas de cambio
// de fecha al convertir posteriormente el Date.

const fechaColombia = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Bogota",
}).format(new Date());

const [anoColombia, mesColombia, diaColombia] = fechaColombia
  .split("-")
  .map(Number);

const [dateVehicleTypeRange, setDateVehicleTypeRange] = useState<
  DateRange | undefined
>({
  from: new Date(anoColombia, mesColombia - 1, 1, 12, 0, 0),
  to: new Date(anoColombia, mesColombia - 1, diaColombia, 12, 0, 0),
});

const [datePaymentMethodRange, setDatePaymentMethodRange] = useState<
  DateRange | undefined
>({
  from: new Date(anoColombia, mesColombia - 1, 1, 12, 0, 0),
  to: new Date(anoColombia, mesColombia - 1, diaColombia, 12, 0, 0),
});

const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
const [anoSeleccionado, setAnoSeleccionado] = useState(anoActual);
const [servicioTipoSeleccionado, setServicioTipoSeleccionado] = useState<ServiceTypeEnum | null>("RTM");



const [mesContabilidadSeleccionado, setMesContabilidadSeleccionado] =
  useState<number>(mesActual);

const [anoContabilidadSeleccionado, setAnoContabilidadSeleccionado] =
  useState<number>(anoActual);

const [servicioTipoContabilidadSeleccionado, setServicioTipoContabilidadSeleccionado] =
  useState<ServiceTypeEnum | null>("RTM");



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

    enabled: pathname === "/dashboard/admin/pqaf",
    queryKey: [
      "pqaf",
      "list",
      
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
  queryKey: [
    "admin_analytics",
    rol,
  ],

  queryFn: async () => {
    console.log(
      `Pidiendo analytics de ${mesSeleccionado}/${anoSeleccionado}`,
    );

    const { data, error } = await supabaseBrowser.rpc(
      "fetch_admin_analitics",
      {
        p_mes_solicitado: mesSeleccionado,
        p_ano_solicitado: anoSeleccionado,
        p_servicio_tipo: servicioTipoSeleccionado ?? undefined,
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

    throw new Error("El RPC no devolvió datos de analytics.");
  },

  staleTime: Infinity,
  refetchOnWindowFocus: false,
  enabled: pathname === "/dashboard/admin/analitica",
});







const analyticsQueryDiary = useQuery({
  queryKey: [
    "admin_analytics_diary",
    rol,
  ],
  queryFn: async () => {
    console.log(
      `Pidiendo analytics diarios - servicio: ${
        servicioTipoSeleccionado ?? "todos"
      }`,
    );

    const { data, error } = await supabaseBrowser.rpc(
      "fetch_admin_analitics_diary",
      {
        p_servicio_tipo: servicioTipoSeleccionado ?? undefined,
      },
    );

    if (error) {
      console.error(
        "Error al extraer analytics diarios:",
        error.message,
      );
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      return data[0] as AdminAnalyticsDiaryData;
    }

    throw new Error("El RPC diario no devolvió datos.");
  },

  refetchInterval: 15000,
  staleTime: 0,
  enabled: pathname === "/dashboard/admin/analitica",
});

useEffect(() => {
  if (pathname !== "/dashboard/admin/analitica") {
    return;
  }
  analyticsQuery.refetch();
  analyticsQueryDiary.refetch();
}, [
  mesSeleccionado,
  anoSeleccionado,
  servicioTipoSeleccionado,
]);













const vehiclesByTypeQuery = useQuery<VehiclesByTypeData, Error>({
  queryKey: [
    "admin_vehicles_by_type",
    rol,
    dateVehicleTypeRange?.from
      ? format(dateVehicleTypeRange.from, "yyyy-MM-dd")
      : "null",
    dateVehicleTypeRange?.to
      ? format(dateVehicleTypeRange.to, "yyyy-MM-dd")
      : "null",
  ],

  queryFn: async () => {
    console.log(
      `Pidiendo vehículos por tipo: ${
        dateVehicleTypeRange?.from
          ? format(dateVehicleTypeRange.from, "yyyy-MM-dd")
          : "sin fecha"
      } - ${
        dateVehicleTypeRange?.to
          ? format(dateVehicleTypeRange.to, "yyyy-MM-dd")
          : "sin fecha"
      }`,
    );

    const fechaDesde = dateVehicleTypeRange?.from
      ? format(dateVehicleTypeRange.from, "yyyy-MM-dd")
      : format(subMonths(new Date(), 1), "yyyy-MM-dd");

    const fechaHasta = dateVehicleTypeRange?.to
      ? format(dateVehicleTypeRange.to, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");

    const { data, error } = await supabaseBrowser.rpc(
      "fetch_admin_vehicles_by_type",
      {
       
        p_fecha_desde: fechaDesde,
        p_fecha_hasta: fechaHasta,
      },
    );

    if (error) {
      console.error(
        "Error al extraer vehículos por tipo:",
        error.message,
      );

      throw new Error(error.message);
    }

    if (data) {
      return data as VehiclesByTypeData;
    }

    throw new Error(
      "El RPC de vehículos por tipo no devolvió datos.",
    );
  },


  staleTime: Infinity,
  enabled: pathname === "/dashboard/admin/analitica",
});










const vehiclesByTypeDiaryQuery = useQuery<VehiclesByTypeData, Error>({
  queryKey: [
    "admin_vehicles_by_type_diary",
    rol,
  ],

  queryFn: async () => {
    console.log("Pidiendo vehículos por tipo - diario");

    const { data, error } = await supabaseBrowser.rpc(
      "fetch_admin_vehicles_by_type_diary",
      {
        p_tenant_id: tenantId ?? "",
      },
    );

    if (error) {
      console.error(
        "Error al extraer vehículos por tipo diarios:",
        error.message,
      );

      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(
        "El RPC de vehículos por tipo diario no devolvió datos.",
      );
    }

    return data as unknown as Record<string, number>;
  },

  
  refetchInterval: 15000,
  staleTime: 0,
  enabled: pathname === "/dashboard/admin/analitica",
});





useEffect(() => {
  if (pathname !== "/dashboard/admin/analitica") {
    return;
  }
  vehiclesByTypeQuery.refetch();
  vehiclesByTypeDiaryQuery.refetch();
}, [dateVehicleTypeRange]);
















const analyticsContabilidadQuery = useQuery({
  queryKey: [
    "admin_analytics_contabilidad",
    rol,
     mesContabilidadSeleccionado,
    anoContabilidadSeleccionado,
    servicioTipoContabilidadSeleccionado,
  ],

  queryFn: async () => {
    console.log(
      `Pidiendo analytics contabilidad de ${mesSeleccionado}/${anoSeleccionado}`,
    );

    const { data, error } = await supabaseBrowser.rpc(
      "fetch_admin_contabilidad_analitics",
      {
        p_mes_solicitado: mesContabilidadSeleccionado,
        p_ano_solicitado: anoContabilidadSeleccionado,
        p_servicio_tipo:
          servicioTipoContabilidadSeleccionado ?? undefined,
      },
    );

    if (error) {
      console.error(
        "Error al extraer métricas e históricos de contabilidad:",
        error.message,
      );

      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      return data[0] as unknown as AdminContabilidadData;
    }

    throw new Error(
      "El RPC no devolvió datos de analytics de contabilidad.",
    );
  },

  staleTime: Infinity,
  refetchOnWindowFocus: false,

  enabled: pathname === "/dashboard/admin/analitica-contable",
});













const analyticsContabilidadQueryDiary = useQuery({
  queryKey: [
    "admin_analytics_contabilidad_diary",
    rol,
    servicioTipoContabilidadSeleccionado,
  ],

  queryFn: async () => {
    const { data, error } = await supabaseBrowser.rpc(
      "fetch_admin_contabilidad_diary",
      {
        p_servicio_tipo:
          servicioTipoContabilidadSeleccionado ?? undefined,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      return data[0] as AdminContabilidadDiaryData;
    }

    throw new Error(
      "El RPC diario de contabilidad no devolvió datos.",
    );
  },

  refetchInterval: 15000,
  staleTime: 0,

  enabled: pathname === "/dashboard/admin/analitica-contable",
});



useEffect(() => {
  if (pathname !== "/dashboard/admin/analitica-contable") {
    return;
  }

  analyticsContabilidadQuery.refetch();
  analyticsContabilidadQueryDiary.refetch();
}, [
  mesContabilidadSeleccionado,
  anoContabilidadSeleccionado,
  servicioTipoContabilidadSeleccionado,
]);











const paymentsByMethodQuery = useQuery<PaymentsByMethodData, Error>({
  queryKey: [
    "admin_payments_by_method",
    rol,
    datePaymentMethodRange?.from
      ? format(datePaymentMethodRange.from, "yyyy-MM-dd")
      : "null",
    datePaymentMethodRange?.to
      ? format(datePaymentMethodRange.to, "yyyy-MM-dd")
      : "null",
  ],

  queryFn: async () => {
    console.log(
      `Pidiendo pagos por método: ${
        datePaymentMethodRange?.from
          ? format(datePaymentMethodRange.from, "yyyy-MM-dd")
          : "sin fecha"
      } - ${
        datePaymentMethodRange?.to
          ? format(datePaymentMethodRange.to, "yyyy-MM-dd")
          : "sin fecha"
      }`,
    );

    const fechaDesde = datePaymentMethodRange?.from
      ? format(datePaymentMethodRange.from, "yyyy-MM-dd")
      : format(subMonths(new Date(), 1), "yyyy-MM-dd");

    const fechaHasta = datePaymentMethodRange?.to
      ? format(datePaymentMethodRange.to, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");

    const { data, error } = await supabaseBrowser.rpc(
      "fetch_admin_payments_by_method",
      {
        p_fecha_desde: fechaDesde,
        p_fecha_hasta: fechaHasta,
      },
    );

    if (error) {
      console.error(
        "Error al extraer pagos por método:",
        error.message,
      );

      throw new Error(error.message);
    }

    if (data) {
      return data as PaymentsByMethodData;
    }

    throw new Error(
      "El RPC de pagos por método no devolvió datos.",
    );
  },

  staleTime: Infinity,

  enabled: pathname === "/dashboard/admin/analitica-contable",
});










const paymentsByMethodDiaryQuery = useQuery<
  PaymentsByMethodData,
  Error
>({
  queryKey: [
    "admin_payments_by_method_diary",
    rol,
  ],

  queryFn: async () => {
    console.log("Pidiendo pagos por método - diario");

    const { data, error } = await supabaseBrowser.rpc(
      "fetch_admin_payments_by_method_diary",
    );

    if (error) {
      console.error(
        "Error al extraer pagos por método diarios:",
        error.message,
      );

      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(
        "El RPC de pagos por método diario no devolvió datos.",
      );
    }

    return data as unknown as PaymentsByMethodData;
  },

  refetchInterval: 15000,

  staleTime: 0,

  enabled: pathname === "/dashboard/admin/analitica-contable",
});




useEffect(() => {
  if (pathname !== "/dashboard/admin/analitica") {
    return;
  }

  paymentsByMethodQuery.refetch();
  paymentsByMethodDiaryQuery.refetch();
}, [datePaymentMethodRange]);






  const AdminContextValue = {
    rol: rol,
    analyticsQuery: analyticsQuery,
    analyticsQueryDiary: analyticsQueryDiary,
      mesSeleccionado,
      setMesSeleccionado,
      anoSeleccionado,
      setAnoSeleccionado,
      servicioTipoSeleccionado,
      setServicioTipoSeleccionado,
    
    vehiclesByTypeQuery: vehiclesByTypeQuery,
    vehiclesByTypeDiaryQuery: vehiclesByTypeDiaryQuery,
      dateVehicleTypeRange,
      setDateVehicleTypeRange,

    analyticsContabilidadQuery: analyticsContabilidadQuery,
    analyticsContabilidadQueryDiary: analyticsContabilidadQueryDiary,
      mesContabilidadSeleccionado,
      anoContabilidadSeleccionado,
      servicioTipoContabilidadSeleccionado,
      setMesContabilidadSeleccionado,
      setAnoContabilidadSeleccionado,
      setServicioTipoContabilidadSeleccionado,   
      
    paymentsByMethodQuery: paymentsByMethodQuery,
    paymentsByMethodDiaryQuery: paymentsByMethodDiaryQuery,
      datePaymentMethodRange,
      setDatePaymentMethodRange,
    
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