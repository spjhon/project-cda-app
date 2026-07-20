"use client";

import { useContext, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
} from "@/components/ui/select"; // Asegúrate de que estos wrappers de tu UI apunten a Base UI

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowUpDown,
  Search,
  X,
  CalendarIcon,
 
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

// Importa aquí tu contexto específico de PQAF

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { AdminContext } from "@/contexts/AdminLoaderContext";
import { PQAFListItem } from "@/app/[tenant]/(private)/dashboard/admin/layout";
import DetallesPQAFDialog from "./DetallesPQAFDialog";

const columnHelper = createColumnHelper<PQAFListItem>();

const REQUERIMIENTO_MAP: Record<string, { label: string; className: string }> =
  {
    peticion: {
      label: "Petición",
      className:
        "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 font-semibold shadow-sm",
    },
    queja: {
      label: "Queja",
      className:
        "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 font-semibold shadow-sm",
    },
    apelacion: {
      label: "Apelación",
      className:
        "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 font-semibold shadow-sm",
    },
    felicitacion: {
      label: "Felicitación",
      className:
        "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 font-semibold shadow-sm",
    },
  };

const ESTADO_MAP: Record<string, { label: string; className: string }> = {
  pendiente: {
    label: "Pendiente",
    className:
      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 font-semibold shadow-sm",
  },
  en_revision: {
    label: "En Revision",
    className:
      "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 font-semibold shadow-sm",
  },
  resuelto: {
    label: "Resuelto",
    className:
      "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800 font-semibold shadow-sm",
  },
  finalizado: {
    label: "Finalizado",
    className:
      "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800 font-semibold shadow-sm",
  },
};

const SELECT_COLUMNAS = [
  { label: "Fecha Creación", value: "created_at" },
  { label: "Tipo Requerimiento", value: "requirement_type" },
  { label: "Estado", value: "status" },
  { label: "Ultima Actualizacion", value: "updated_at" },
];

const SELECT_DIRECCION = [
  { label: "Más recientes / Z-A", value: "DESC" },
  { label: "Más antiguos / A-Z", value: "ASC" },
];

const SELECT_ROWS = [
  { label: "5", value: "5" },
  { label: "20", value: "20" },
  { label: "50", value: "50" },
] as const;

export default function PQAFTable() {
  

  const adminContrextRecived = useContext(AdminContext);

  const pqafData = adminContrextRecived?.AdminContextValue.PQAFQuery.PQAFData || [];

  const { PQAFQuery } = adminContrextRecived?.AdminContextValue || {};

  const {
    orderByColumn = "created_at",
    setOrderByColumn = () => {},
    orderByDirection = "DESC",
    setOrderByDirection = () => {},
    dateRange = undefined,
    setDateRange = () => {},
    searchTerm = "",
    setSearchTerm = () => {},
    page = 1,
    setPage = () => {},
    rowsPerPage = 5,
    setRowsPerPage = () => {},
  } = PQAFQuery || {};

  const [inputValue, setInputValue] = useState(searchTerm);

// NUVOS ESTADOS: Estado intermedio para las fechas y control de apertura del Popover
  const [localRange, setLocalRange] = useState<DateRange | undefined>(dateRange);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);


  // Sincronizar el estado local si el dateRange global cambia externamente (ej. al limpiar filtros)
  useMemo(() => {
    setLocalRange(dateRange);
  }, [dateRange]);

  const handleApplyDates = () => {
    setDateRange(localRange);
    setPage(1);
    setIsPopoverOpen(false); // Cierra el popover al aplicar
  };


  // Debounce para optimizar consultas de texto libre
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

  const total = pqafData?.[0]?.total_count ?? 0;

  const renderStatusBadge = () => {
    if (PQAFQuery?.isPQAFError) {
      return (
        <Badge
          variant="destructive"
          className="gap-1.5 px-3 py-1 animate-pulse shadow-sm"
        >
          <AlertCircle className="h-3.5 w-4" />
          Error de Sincronización
        </Badge>
      );
    }
    if (PQAFQuery?.isFetchingPQAF) {
      return (
        <Badge
          variant="default"
          className="gap-1.5 px-3 py-1 bg-primary text-primary-foreground shadow-sm"
        >
          <Loader2 className="h-3.5 w-4 animate-spin" />
          Actualizando...
        </Badge>
      );
    }
    if (PQAFQuery?.isPQAFSuccess) {
      return (
        <Badge
          variant="outline"
          className="gap-1.5 px-3 py-1 border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 shadow-sm"
        >
          <CheckCircle2 className="h-3.5 w-4" />
          Sincronizado
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
      columnHelper.accessor("created_at", {
        header: "Fecha de Creación",
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

      columnHelper.accessor("requirement_type", {
        header: "Tipo de Requerimiento",
        cell: (info) => {
          const value = info.getValue();
          const config = REQUERIMIENTO_MAP[value] || {
            label: value,
            className: "bg-muted text-foreground border-border",
          };
          return (
            <Badge
              variant="outline"
              className={`${config.className} uppercase tracking-wide text-[10px]`}
            >
              {config.label}
            </Badge>
          );
        },
      }),

      columnHelper.accessor("status", {
        header: "Estado",
        cell: (info) => {
          const value = info.getValue();
          const config = ESTADO_MAP[value] || {
            label: value,
            className: "bg-muted text-foreground border-border",
          };
          return (
            <Badge
              variant="outline"
              className={`${config.className} text-[11px]`}
            >
              {config.label}
            </Badge>
          );
        },
      }),

      columnHelper.accessor("updated_at", {
        header: "Fecha Ultima Actualizacion",
        cell: (info) => {
          const rawValue = info.getValue();
          if (!rawValue) {
            return (
              <span className="text-xs text-muted-foreground italic font-medium">
                En gestión / Pendiente
              </span>
            );
          }
          const date = new Date(rawValue);
          return (
            <span className="font-medium text-muted-foreground tracking-tight">
              {date.toLocaleString("es-CO", {
                dateStyle: "short",
                timeStyle: "short",
                hour12: true,
              })}
            </span>
          );
        },
      }),

      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const pqaf = row.original;
          return <DetallesPQAFDialog pqaf={pqaf} ></DetallesPQAFDialog>;
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: pqafData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-5 p-6 bg-background rounded-2xl shadow-sm border border-border/50">
      {/* SECCIÓN SUPERIOR: Controles, Filtros y Búsqueda */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border shadow-sm">
        {/* Contador Total */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
            Total Encontrados:
          </span>
          <span className="text-2xl font-bold text-primary tracking-tight">
            {total}
          </span>
        </div>

        {/* Controles de Filtrado y Ordenamiento */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-semibold">
            <ArrowUpDown className="h-4 w-4 text-primary" />
            <span>Ordenar por:</span>
          </div>

          {/* Selector de Columna de Orden (Base UI compatible con prop items) */}
          <Select
            value={orderByColumn}
            onValueChange={(v) => setOrderByColumn(v ? v : "fecha")}
            items={SELECT_COLUMNAS}
          >
            <SelectTrigger className="w-48 h-9 text-sm bg-background border-input shadow-sm focus:ring-ring transition-colors">
              <SelectValue placeholder="Columna" />
            </SelectTrigger>
            <SelectContent>
              {SELECT_COLUMNAS.map((col) => (
                <SelectItem key={col.value} value={col.value}>
                  {col.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Selector de Dirección (Base UI compatible con prop items) */}
          <Select
            value={orderByDirection}
            onValueChange={(v) => {
              if (v === "ASC" || v === "DESC") {
                setOrderByDirection(v);
              } else {
                setOrderByDirection("DESC");
              }
            }}
            items={SELECT_DIRECCION}
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

          {/* Buscador de Texto Libre */}
          <div className="relative min-w-50 h-9">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar requerimiento..."
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

          {/* Selector de Fechas */}
          {/* Selector de Fecha de Shadcn */}
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger
              render={
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-auto justify-start text-left font-normal border-slate-300",
                    !dateRange && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-500" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd LLL, yyyy", { locale: es })} -{" "}
                        {format(dateRange.to, "dd LLL, yyyy", { locale: es })}
                      </>
                    ) : (
                      format(dateRange.from, "dd LLL, yyyy", { locale: es })
                    )
                  ) : (
                    <span>Elegir periodo</span>
                  )}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0 flex flex-col" align="start">
              {/* El calendario ahora lee y escribe en el estado LOCAL */}
              <Calendar
                autoFocus
                mode="range"
                defaultMonth={localRange?.from || dateRange?.from}
                selected={localRange}
                onSelect={setLocalRange}
                numberOfMonths={2}
                locale={es}
                className="rounded-t-lg"
                captionLayout="dropdown"
                showOutsideDays={false}
              />
              
              {/* Barra de acciones inferior del calendario */}
              <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-end gap-2 rounded-b-lg">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setLocalRange(dateRange); // Revierte al filtro activo actual
                    setIsPopoverOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleApplyDates}
                  disabled={!localRange?.from} // Opcional: deshabilita si no hay selección mínima
                >
                  Aplicar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* COMPONENTES DE PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2 bg-muted/30 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Filas por página:
          </span>

          {/* Selector de Filas por página usando prop items para compatibilidad con Base UI */}
          <Select
            value={String(rowsPerPage)}
            onValueChange={(val) => {
              setRowsPerPage(Number(val));
              setPage(1);
            }}
            items={SELECT_ROWS}
          >
            <SelectTrigger className="w-16 h-8 text-xs bg-background border-input shadow-sm focus:ring-ring transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {SELECT_ROWS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs font-medium text-muted-foreground ml-2">
            Mostrando {Math.min((page - 1) * rowsPerPage + 1, total)} -{" "}
            {Math.min(page * rowsPerPage, total)} de{" "}
            <span className="font-bold text-foreground">{total}</span>
          </span>
        </div>

        {/* Sincronización en la base */}
        <div className="flex items-center">{renderStatusBadge()}</div>

        {/* Paginador */}
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

      {/* CONTENEDOR DE LA TABLA PRINCIPAL */}
      <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-foreground h-11"
                  >
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
                  className="hover:bg-muted/50 border-b border-border transition-colors"
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
                  No se encontraron requerimientos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
