"use client";

import { useContext, useMemo, useState } from "react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 🌟 Importación de nuevos íconos para los tipos de vehículos
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowUpDown,
  Search,
  X,
  Car,
  Truck,
  Bike,
} from "lucide-react";

import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";

import { Badge } from "@/components/ui/badge";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { DateRangePicker } from "./DateRangePicker";
import { EntryOrdersContext } from "@/contexts/EntryOrdersContext";
import { ReceptionistContext } from "@/contexts/ReceptionistLoaderContex";
import { OficinaContext } from "@/contexts/OficinaLoaderContext";
import AccionesOrderDialog from "./AccionesOrderDialog";
import { DirectorTecnicoContext } from "@/contexts/DirectorTecnicoLoaderContext";
import { AdminContext } from "@/contexts/AdminLoaderContext";


const columnHelper = createColumnHelper<EntryOrderListItem>();

// ==========================================
// DICCIONARIOS DE MAPEO Y TRADUCCIÓN
// ==========================================

// 🌟 Mapeo para Tipo de Vehículo con íconos y etiquetas formateadas
const VEHICLE_TYPE_MAP: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  liviano: { label: "Automóvil (Liviano)", icon: Car },
  pesado: { label: "Camión / Bus (Pesado)", icon: Truck },
  motocicleta_4t: { label: "Motocicleta 4T", icon: Bike },
  motocicleta_2t: { label: "Motocicleta 2T", icon: Bike },
  motocarro_4t: { label: "Motocarro 4T", icon: Bike },
  motocarro_2t: { label: "Motocarro 2T", icon: Bike },
};

// 🌟 Mapeo para Tipo de Servicio
const SERVICE_TYPE_MAP: Record<string, string> = {
  RTM: "RTM",
  preventiva: "Preventiva",
  peritaje: "Peritaje",
  otro: "Otro",
};

// 🌟 Mapeo para Estados de la Orden con estilos de Badge dedicados
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  abierta: {
    label: "Abierta",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 font-medium tracking-wide",
  },
  en_prueba: {
    label: "En Prueba",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-medium tracking-wide",
  },
  finalizada: {
    label: "Finalizada",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-medium tracking-wide",
  },
  anulada: {
    label: "Anulada",
    className:
      "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 font-medium tracking-wide line-through opacity-80",
  },
};

// 🌟 Mapeo para discriminar si es Inspección Original o Reinspección
const INSPECTION_TYPE_MAP: Record<
  string,
  { label: string; className: string }
> = {
  original: {
    label: "Primera Vez",
    className:
      "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 font-medium tracking-wide",
  },
  reinspeccion: {
    label: "Reinspección",
    className:
      "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 font-medium tracking-wide",
  },
};

const SELECT_COLUMNAS = [
  { label: "Fecha y Hora", value: "fecha" },
  { label: "Placa", value: "vehiculo_placa_snapshot" },
  { label: "Marca", value: "vehiculo_marca_snapshot" },
  { label: "Línea", value: "vehiculo_linea_snapshot" },
  { label: "Estado", value: "estado_orden" },
];

const SELECT_DIRECCION = [
  { label: "Más recientes / Z-A", value: "DESC" },
  { label: "Más antiguos / A-Z", value: "ASC" },
];

// 🌟 Mapeo para el Dictamen o Resultado de la Revisión Técnico-Mecánica
const REVISION_RESULT_MAP: Record<
  string,
  {
    label: string;
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  aprobado: {
    label: "Aprobado",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/60 font-bold",
    icon: CheckCircle2,
  },
  rechazado: {
    label: "Rechazado",
    className: "bg-rose-50 text-rose-700 border-rose-200/40 font-bold",
    icon: AlertCircle,
  },
};

export default function CreatedOrdersTable() {
  const PermissioncontextRecived = useContext(PermissionsContext);
  const EntryOrdersContextRecived = useContext(EntryOrdersContext);

  const contextRecivedReceptionist = useContext(ReceptionistContext);
  const OficinaContextRecived = useContext(OficinaContext);
  const DirectorTecnicoContextRecived = useContext(DirectorTecnicoContext);
  const AdminContextRecived = useContext(AdminContext);

  //extraccion del rol desde el contexto
  const rol =
    contextRecivedReceptionist?.ReceptionistContextValue.rol ||
    OficinaContextRecived?.OficinaContextValue.rol ||
    DirectorTecnicoContextRecived?.DirectorTecnicoContextValue.rol ||
    AdminContextRecived?.AdminContextValue.rol;

  const tenantId = PermissioncontextRecived?.PermissionsContextValue.tenantObject?.id;
  const EntryOrders = EntryOrdersContextRecived?.entryOrdersTableData.query.entryOrdersData || [];

  


  const { query, mutation } =
    EntryOrdersContextRecived?.entryOrdersTableData || {};

  const {
    orderByColumn = "fecha",
    setOrderByColumn = () => {},
    orderByDirection = "DESC",
    setOrderByDirection = () => {},
    showDeleted = false,
    setShowDeleted = () => {},
    dateRange = undefined,
    setDateRange = () => {},
    searchColumn = "placa",
    setSearchColumn = () => {},
    searchTerm = "",
    setSearchTerm = () => {},
    page = 1,
    setPage = () => {},
    rowsPerPage = 5,
    setRowsPerPage = () => {},
  } = query || {};

  const [inputValue, setInputValue] = useState(searchTerm);

  const debouncedSetSearchTerm = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (val: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSearchTerm(val);
      }, 400);
    };
  }, [setSearchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearchTerm(value);
    setPage(1);
  };

  const handleColumnChange = (newColumn: string) => {
    setSearchColumn(newColumn);
    setInputValue("");
    setSearchTerm("");
    setPage(1);
  };

  const total = query?.entryOrdersData?.[0]?.total_count ?? 0;

  const renderStatusBadge = () => {
    if (query?.isEntryOrdersError) {
      return (
        <Badge
          variant="destructive"
          className="gap-1.5 px-3 py-1 animate-pulse w-35"
        >
          <AlertCircle className="h-3.5 w-" />
          Error de Sincronización
        </Badge>
      );
    }
    if (query?.isFetchingEntryOrders) {
      return (
        <Badge
          variant="default"
          className="gap-1.5 w-35 px-3 py-1 bg-blue-600 hover:bg-blue-700"
        >
          <Loader2 className="h-3.5 w-6 animate-spin" />
          Actualizando datos...
        </Badge>
      );
    }
    if (query?.isEntryOrdersSuccess) {
      return (
        <Badge
          variant="outline"
          className="gap-1.5 px-3 w-35 py-1 border-green-500 text-green-700 bg-green-50"
        >
          <CheckCircle2 className="h-3.5" />
          Datos Actualizados
        </Badge>
      );
    }
    return null;
  };

  // ==========================================
  // CONFIGURACIÓN DE COLUMNAS RE-DISEÑADAS
  // ==========================================
  const columns = useMemo(
    () => [



      columnHelper.accessor("placa", {
        header: "Placa",
        cell: ({ row }) => {
          const placaText =
            row.original.placa?.toString().toUpperCase() || "---";
          const servicioRaw =
            row.original.vehiculo_tipo_servicio_snapshot
              ?.toString()
              .toLowerCase() || "particular";

          // Mapeo dinámico de estilos según la regulación colombiana
          const STYLES_MAP: Record<
            string,
            { bg: string; text: string; border: string; line: string }
          > = {
            particular: {
              bg: "bg-amber-400",
              text: "text-slate-900",
              border: "border-slate-950",
              line: "border-slate-950/20",
            },
            publico: {
              bg: "bg-white",
              text: "text-slate-900",
              border: "border-slate-400",
              line: "border-slate-300",
            },
            oficial: {
              bg: "bg-blue-700",
              text: "text-white",
              border: "border-blue-900",
              line: "border-white/20",
            },
          };

          // Obtenemos los estilos correspondientes (o fallback a particular si no coincide)
          const estilo = STYLES_MAP[servicioRaw] || STYLES_MAP.particular;
          const labelServicio = servicioRaw.toUpperCase();

          return (
            <div
              className={`inline-flex flex-col items-center justify-center ${estilo.bg} ${estilo.text} ${estilo.border} border-2 rounded-md  px-3 py-1 min-w-26.25 tracking-wider text-center text-sm select-none transition-colors shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]`}
            >
              <span className="leading-none text-base font-black">
                {placaText}
              </span>
              <div className={`w-full border-t ${estilo.line} my-0.5`} />
              <span className="text-[7.5px] font-black tracking-widest leading-none opacity-90">
                {labelServicio}
              </span>
            </div>
          );
        },
      }),




      columnHelper.accessor("fecha", {
        header: "Fecha y Hora",
        cell: (info) => {
          const date = new Date(info.getValue());
          return (
            <span className="font-bold text-slate-800 tracking-tight">
              {date.toLocaleString("es-CO", {
                dateStyle: "short",
                timeStyle: "short",
                hour12: true,
              })}
            </span>
          );
        },
      }),

      columnHelper.accessor("marca", {
        header: "Marca",
        cell: (info) => info.getValue(),
      }),

      columnHelper.accessor("linea", {
        header: "Línea",
        cell: (info) => info.getValue(),
      }),

      // 🌟 REEMPLAZADO: Tipo de Vehículo con íconos dinámicos y texto enriquecido
      columnHelper.accessor("vehiculo_tipo_snapshot", {
        header: "Tipo de Vehículo",
        cell: (info) => {
          const value = info.getValue() as string;
          const config = VEHICLE_TYPE_MAP[value] || {
            label: value || "No especificado",
            icon: Car,
          };
          const IconComponent = config.icon;

          return (
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <div className="p-1 rounded-md bg-slate-100 text-slate-600">
                <IconComponent className="h-4 w-4 shrink-0" />
              </div>
              <span className="text-sm truncate">{config.label}</span>
            </div>
          );
        },
      }),

      // 🌟 REEMPLAZADO: Tipo de Servicio (Texto limpio en negrita)
      columnHelper.accessor("service_type", {
        header: "Tipo de Servicio",
        cell: (info) => {
          const value = info.getValue() as string;
          const translatedLabel = SERVICE_TYPE_MAP[value] || value || "---";
          return (
            <span className="font-bold text-slate-900 text-sm tracking-tight">
              {translatedLabel}
            </span>
          );
        },
      }),

      // 🌟 NUEVA COLUMNA: Identifica si es Primera Vez (Original) o Reinspección
      columnHelper.accessor("es_reinspeccion", {
        header: "Tipo Inspección",
        cell: ({ row }) => {
          const esReinspeccion = row.original.es_reinspeccion;
          const config = esReinspeccion
            ? INSPECTION_TYPE_MAP.reinspeccion
            : INSPECTION_TYPE_MAP.original;

          return (
            <Badge variant="outline" className={config.className}>
              {config.label}
            </Badge>
          );
        },
      }),

      // 🌟 REFORMADO: Estado de la Orden utilizando Badges de color condicionales
      columnHelper.accessor("estado_orden", {
        header: "Estado",
        cell: (info) => {
          const rawStatus = info.getValue() as string;
          const statusConfig = STATUS_MAP[rawStatus] || {
            label: rawStatus,
            className: "bg-slate-100 text-slate-700",
          };

          return (
            <Badge variant="outline" className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          );
        },
      }),

      columnHelper.accessor("resultado_revision", {
        header: "Dictamen Técnico",
        cell: (info) => {
          const rawResult = info.getValue() as string;

          // Si no hay resultado asignado aún en la base de datos
          if (!rawResult) {
            return (
              <span className="text-xs text-slate-400 italic pl-1">
                Pendiente de firma
              </span>
            );
          }

          const config = REVISION_RESULT_MAP[rawResult] || {
            label: rawResult.toUpperCase(),
            className: "bg-slate-50 text-slate-600 border-slate-200",
            icon: AlertCircle,
          };

          const IconComponent = config.icon;

          return (
            <Badge
              variant="outline"
              className={`gap-1 px-2.5 py-0.5 text-xs shadow-xs ${config.className}`}
            >
              <IconComponent className="h-3.5 w-3.5 shrink-0" />
              {config.label}
            </Badge>
          );
        },
      }),

      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const orden = row.original;
          if (!mutation) return null;

          return (
            <AccionesOrderDialog
              orden={orden}
              tenantId={tenantId}
              mutation={mutation}
              rol={rol}
            />
          );
        },
      }),
    ],
    [tenantId, mutation, rol],
  );

  const table = useReactTable({
    data: EntryOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4 p-5 bg-[#FAFAFA]">
      {/* SECCIÓN SUPERIOR: Info, Selects de Ordenamiento y Estado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">



        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-slate-500">
            Total Encontrado:
          </span>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            {total}
          </span>
        </div>
        


        <div className="flex flex-wrap items-center justify-center gap-6">
          
          <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <span>Ordenar por:</span>
          </div>

          <Select
            items={SELECT_COLUMNAS}
            value={orderByColumn}
            onValueChange={(v) => setOrderByColumn(v ? v : "fecha")}
          >
            <SelectTrigger className="w-50 bg-white h-9 text-sm">
              <SelectValue placeholder="Columna" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {SELECT_COLUMNAS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            modal
            items={SELECT_DIRECCION}
            value={orderByDirection}
            onValueChange={(v) => {
              if (v === "ASC" || v === "DESC") {
                setOrderByDirection(v);
              } else {
                setOrderByDirection("DESC");
              }
            }}
          >
            <SelectTrigger className="w-50 h-9 bg-white text-sm">
              <SelectValue placeholder="Dirección" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {SELECT_DIRECCION.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative min-w-40 h-8">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 " />
            <Input
              placeholder={`Buscar por ${searchColumn === "placa" ? "placa" : searchColumn === "marca" ? "marca" : searchColumn === "linea" ? "línea" : "documento"}...`}
              value={inputValue}
              onChange={handleInputChange}
              className="w-full h-full pl-9 pr-8 border bg-white text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {inputValue && (
              <button
                onClick={() => {
                  setInputValue("");
                  setSearchTerm("");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2   transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          

          <DateRangePicker
            date={dateRange}
            setDate={setDateRange}
          ></DateRangePicker>

          <div className="flex items-center space-x-2 bg-white px-3 h-9 rounded-md border border-slate-200 shadow-sm">
            <Switch
              id="show-deleted"
              checked={showDeleted}
              onCheckedChange={setShowDeleted}
            />
            <Label
              htmlFor="show-deleted"
              className="text-sm font-medium text-slate-600 cursor-pointer select-none"
            >
              Mostrar órdenes anuladas
            </Label>
          </div>
        </div>

        
      </div>


      {/* PIE DE PÁGINA CON COMPONENTES DE PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Filas por página:
          </span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(val) => {
              setRowsPerPage(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-16 h-8 text-xs bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              <SelectItem value="5" className="text-xs">
                5
              </SelectItem>
              <SelectItem value="20" className="text-xs">
                20
              </SelectItem>
              <SelectItem value="50" className="text-xs">
                50
              </SelectItem>
            </SelectContent>
          </Select>

          <span className="text-xs text-slate-400 ml-2">
            Mostrando {Math.min((page - 1) * rowsPerPage + 1, total)} -{" "}
            {Math.min(page * rowsPerPage, total)} de {total}
          </span>
        </div>


            <div className="flex items-center">{renderStatusBadge()}</div>

        <Pagination className="mx-0 w-auto">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <button
                onClick={() => setPage(Math.max(page - 1, 1))}
                disabled={page === 1}
                className="flex h-8 items-center justify-center gap-1 pl-2.5 pr-3.5 text-xs font-medium rounded-md border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <span className="">Anterior</span>
              </button>
            </PaginationItem>

            <PaginationItem>
              <div className="flex h-8 min-w-8 items-center justify-center rounded-md border border-blue-100 bg-blue-50 text-xs font-semibold text-blue-600 px-2 shadow-sm select-none">
                Pág. {page} de {Math.max(Math.ceil(total / rowsPerPage), 1)}
              </div>
            </PaginationItem>

            <PaginationItem>
              <button
                onClick={() =>
                  setPage(Math.min(page + 1, Math.ceil(total / rowsPerPage)))
                }
                disabled={page >= Math.ceil(total / rowsPerPage)}
                className="flex h-8 items-center justify-center gap-1 pl-3.5 pr-2.5 text-xs font-medium rounded-md border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <span className="">Siguiente</span>
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      

      {/* CONTENEDOR DE LA TABLA */}
      <div className=" ">
        <Table className="">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8"
                >
                  No hay órdenes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      
    </div>
  );
}
