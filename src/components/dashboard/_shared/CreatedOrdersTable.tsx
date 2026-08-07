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
import { Button } from "@/components/ui/button";
import PreviousDayOrdersAlert from "./PreviousDayOrdersAlertProps";
import { DownloadExcelButton } from "./DownloadExcelButton";

const columnHelper = createColumnHelper<EntryOrderListItem>();

// ==========================================
// DICCIONARIOS DE MAPEO Y TRADUCCIÓN
// ==========================================

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

const SERVICE_TYPE_MAP: Record<string, string> = {
  RTM: "RTM",
  preventiva: "Preventiva",
  peritaje: "Peritaje",
  otro: "Otro",
};

// Badges con soporte claro/oscuro
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  abierta: {
    label: "Abierta",
    className:
      "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/50 font-semibold tracking-wide shadow-sm transition-colors",
  },
  en_prueba: {
    label: "En Prueba",
    className:
      "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50 font-semibold tracking-wide shadow-sm transition-colors",
  },
  finalizada: {
    label: "Finalizada",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/50 font-semibold tracking-wide shadow-sm transition-colors",
  },
  anulada: {
    label: "Anulada",
    className:
      "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-900/50 font-semibold tracking-wide line-through opacity-90 shadow-sm transition-colors",
  },
};

const INSPECTION_TYPE_MAP: Record<
  string,
  { label: string; className: string }
> = {
  original: {
    label: "Primera Vez",
    className:
      "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/50 font-semibold tracking-wide transition-colors",
  },
  reinspeccion: {
    label: "Reinspección",
    className:
      "bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/50 font-semibold tracking-wide transition-colors",
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
    className: "bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 font-bold shadow-sm transition-colors",
    icon: CheckCircle2,
  },
  rechazado: {
    label: "Rechazado",
    className: "bg-rose-100 text-rose-800 border-rose-400 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 font-bold shadow-sm transition-colors",
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

  const rol =
    contextRecivedReceptionist?.ReceptionistContextValue.rol ||
    OficinaContextRecived?.OficinaContextValue.rol ||
    DirectorTecnicoContextRecived?.DirectorTecnicoContextValue.rol ||
    AdminContextRecived?.AdminContextValue.rol;

  const tenantId = PermissioncontextRecived?.PermissionsContextValue.tenantObject?.id;
  const EntryOrders = EntryOrdersContextRecived?.entryOrdersTableData.query.entryOrdersData || [];

  //con este state vamos a aislar el dialog de las acciones para que si se actualiza la tabla, no se actualice el dialog al mismo tiempo
const [selectedOrden, setSelectedOrden] = useState<EntryOrderListItem | null>(null);


  const { query} = EntryOrdersContextRecived?.entryOrdersTableData || {};

 

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
    rowsPerPage = 50,
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

  const total = query?.entryOrdersData?.[0]?.total_count ?? 0;

  const renderStatusBadge = () => {
    if (query?.isEntryOrdersError) {
      return (
        <Badge
          variant="destructive"
          className="gap-1.5 px-3 py-1 animate-pulse w-35 shadow-sm"
        >
          <AlertCircle className="h-3.5 w-4" />
          Error de Sincronización
        </Badge>
      );
    }
    if (query?.isFetchingEntryOrders) {
      return (
        <Badge
          variant="default"
          className="gap-1.5 w-35 px-3 py-1 bg-primary text-primary-foreground shadow-sm"
        >
          <Loader2 className="h-3.5 w-4 animate-spin" />
          Actualizando datos...
        </Badge>
      );
    }
    if (query?.isEntryOrdersSuccess) {
      return (
        <Badge
          variant="outline"
          className="gap-1.5 px-3 w-35 py-1 border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 shadow-sm transition-colors"
        >
          <CheckCircle2 className="h-3.5 w-4" />
          Datos Actualizados
        </Badge>
      );
    }
    return null;
  };

  // ==========================================
  // CONFIGURACIÓN DE COLUMNAS
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

          // Las placas mantienen colores fijos por ser representación del objeto real
          const STYLES_MAP: Record<
            string,
            { bg: string; text: string; border: string; line: string }
          > = {
            particular: {
              bg: "bg-[#FACC15]",
              text: "text-slate-900",
              border: "border-slate-800",
              line: "border-slate-800/30",
            },
            publico: {
              bg: "bg-white",
              text: "text-slate-900",
              border: "border-slate-800",
              line: "border-slate-800/30",
            },
            oficial: {
              bg: "bg-blue-700",
              text: "text-white",
              border: "border-blue-950",
              line: "border-white/30",
            },
          };

          const estilo = STYLES_MAP[servicioRaw] || STYLES_MAP.particular;
          const labelServicio = servicioRaw.toUpperCase();

          return (
            <div
              className={`inline-flex flex-col items-center justify-center ${estilo.bg} ${estilo.text} ${estilo.border} border-2 rounded-md px-3 py-1 min-w-26.25 tracking-wider text-center text-sm select-none transition-transform hover:scale-105 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]`}
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
            <span className="font-semibold text-foreground tracking-tight">
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
        cell: (info) => (
          <span className="text-foreground font-medium">{info.getValue()}</span>
        ),
      }),

      columnHelper.accessor("linea", {
        header: "Línea",
        cell: (info) => (
          <span className="text-muted-foreground">{info.getValue()}</span>
        ),
      }),

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
            <div className="flex items-center gap-2 font-medium text-foreground">
              <div className="p-1.5 rounded-md bg-muted text-primary border border-border">
                <IconComponent className="h-4 w-4 shrink-0" />
              </div>
              <span className="text-sm truncate">{config.label}</span>
            </div>
          );
        },
      }),

      columnHelper.accessor("service_type", {
        header: "Tipo de Servicio",
        cell: (info) => {
          const value = info.getValue() as string;
          const translatedLabel = SERVICE_TYPE_MAP[value] || value || "---";
          return (
            <span className="font-semibold text-foreground text-sm tracking-tight bg-muted px-2.5 py-1 rounded-md border border-border">
              {translatedLabel}
            </span>
          );
        },
      }),


     columnHelper.accessor("se_compro_soat", {
  header: "Se compró SOAT?",
  cell: (info) => {
    const boughtSoat = Boolean(info.getValue());

    return (
      <Badge
        variant="outline"
        className={
          boughtSoat
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold"
            : "text-muted-foreground border-border font-medium"
        }
      >
        {boughtSoat ? "Sí" : "No"}
      </Badge>
    );
  },
}),

      columnHelper.accessor("es_reinspeccion", {
        header: "Tipo Inspección",
        cell: ({ row }) => {
          const esReinspeccion = row.original.es_reinspeccion;
          const config = esReinspeccion
            ? INSPECTION_TYPE_MAP.reinspeccion
            : INSPECTION_TYPE_MAP.original;

          return (
            <Badge variant="outline" className={`${config.className} shadow-sm`}>
              {config.label}
            </Badge>
          );
        },
      }),

      columnHelper.accessor("estado_orden", {
        header: "Estado",
        cell: (info) => {
          const rawStatus = info.getValue() as string;
          const statusConfig = STATUS_MAP[rawStatus] || {
            label: rawStatus,
            className: "bg-muted text-foreground border-border",
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

          if (!rawResult) {
            return (
              <span className="text-xs text-muted-foreground italic pl-1 font-medium">
                Pendiente de firma
              </span>
            );
          }

          const config = REVISION_RESULT_MAP[rawResult] || {
            label: rawResult.toUpperCase(),
            className: "bg-muted text-foreground border-border",
            icon: AlertCircle,
          };

          const IconComponent = config.icon;

          return (
            <Badge
              variant="outline"
              className={`gap-1 px-2.5 py-0.5 text-xs shadow-sm ${config.className}`}
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

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSelectedOrden(orden)}
      >
        Acciones
      </Button>
    );
  },
}),





    ],
    [],
  );

  const table = useReactTable({
    data: EntryOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });






  

  return (
    <div className="space-y-5 p-6 bg-background rounded-2xl shadow-sm ">
      {/* DIÁLOGO ELEVADO (Fuera de la tabla) */}
{selectedOrden && (
  <AccionesOrderDialog
    orden={selectedOrden}
    tenantId={tenantId}
  
    rol={rol}
    open={Boolean(selectedOrden)}
    onOpenChange={(open) => {
      if (!open) setSelectedOrden(null);
    }}
  />
)}
      {/* SECCIÓN SUPERIOR: Info, Selects de Ordenamiento y Estado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
            Total Encontrado:
          </span>
          <span className="text-2xl font-bold text-primary tracking-tight">
            {total}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-semibold">
            <ArrowUpDown className="h-4 w-4 text-primary" />
            <span>Ordenar por:</span>
          </div>

          <Select
          items={SELECT_COLUMNAS}
            value={orderByColumn}
            onValueChange={(v) => setOrderByColumn(v ? v : "fecha")}
          >
            <SelectTrigger className="w-48 h-9 text-sm bg-background border-input shadow-sm focus:ring-ring transition-colors">
              <SelectValue placeholder="Columna" />
            </SelectTrigger>
            <SelectContent>
              {SELECT_COLUMNAS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={orderByDirection}
            onValueChange={(v) => {
              if (v === "ASC" || v === "DESC") {
                setOrderByDirection(v);
              } else {
                setOrderByDirection("DESC");
              }
            }}
          >
            <SelectTrigger className="w-48 h-9 text-sm bg-background border-input shadow-sm focus:ring-ring transition-colors">
              <SelectValue placeholder="Dirección" />
            </SelectTrigger>
            <SelectContent>
              {SELECT_DIRECCION.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative min-w-50 h-9">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Buscar por ${
                searchColumn === "placa"
                  ? "placa"
                  : searchColumn === "marca"
                  ? "marca"
                  : searchColumn === "linea"
                  ? "línea"
                  : "documento"
              }...`}
              value={inputValue}
              onChange={handleInputChange}
              className="w-full h-full pl-9 pr-8 bg-background border-input text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring transition-all rounded-md"
            />
            {inputValue && (
              <button
                onClick={() => {
                  setInputValue("");
                  setSearchTerm("");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <DateRangePicker
            date={dateRange}
            setDate={setDateRange}
          ></DateRangePicker>

          <div className="flex items-center space-x-2 bg-background px-3 py-1.5 h-9 rounded-md border border-input shadow-sm hover:border-accent transition-colors">
            <Switch
              id="show-deleted"
              checked={showDeleted}
              onCheckedChange={setShowDeleted}
              className="data-[state=checked]:bg-destructive"
            />
            <Label
              htmlFor="show-deleted"
              className="text-sm font-medium text-foreground cursor-pointer select-none"
            >
              Mostrar anuladas
            </Label>
          </div>
        </div>
      </div>

      {/* PIE DE PÁGINA CON COMPONENTES DE PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2 bg-muted/30 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Filas por página:
          </span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(val) => {
              setRowsPerPage(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-16 h-8 text-xs bg-background border-input shadow-sm focus:ring-ring transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
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

          <span className="text-xs font-medium text-muted-foreground ml-2">
            Mostrando {Math.min((page - 1) * rowsPerPage + 1, total)} -{" "}
            {Math.min(page * rowsPerPage, total)} de <span className="font-bold text-foreground">{total}</span>
          </span>
        </div>

        {/* Aquí puedes renderizar el botón de Excel */}
        <DownloadExcelButton 
          data={EntryOrders} 
          disabled={query?.isFetchingEntryOrders}
        />

        <div className="flex items-center">{renderStatusBadge()}</div>

        <Pagination className="mx-0 w-auto">
          <PaginationContent className="gap-1.5">
            <PaginationItem>
              <button
                onClick={() => setPage(Math.max(page - 1, 1))}
                disabled={page === 1}
                className="flex h-8 items-center justify-center gap-1 pl-2.5 pr-3.5 text-xs font-semibold rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                <span>Anterior</span>
              </button>
            </PaginationItem>

            <PaginationItem>
              <div className="flex h-8 min-w-8 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-xs font-bold text-primary px-3 shadow-sm select-none">
                Pág. {page} de {Math.max(Math.ceil(total / rowsPerPage), 1)}
              </div>
            </PaginationItem>

            <PaginationItem>
              <button
                onClick={() =>
                  setPage(Math.min(page + 1, Math.ceil(total / rowsPerPage)))
                }
                disabled={page >= Math.ceil(total / rowsPerPage)}
                className="flex h-8 items-center justify-center gap-1 pl-3.5 pr-2.5 text-xs font-semibold rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                <span>Siguiente</span>
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <PreviousDayOrdersAlert
  
/>

      {/* CONTENEDOR DE LA TABLA */}
      <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold text-foreground h-11">
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

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  className="hover:bg-muted/50 border-b border-border transition-colors data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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
                  className="text-center py-12 text-muted-foreground font-medium"
                >
                  No se encontraron órdenes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      
    </div>
  );
}