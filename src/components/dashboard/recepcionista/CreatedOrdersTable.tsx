"use client";

import { useContext, useMemo, useState } from "react";
import { ReceptionistContext } from "@/contexts/ReceptionistLoaderContex";
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

// Importar componentes de Select de tu UI
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Importar iconos de Lucide
import { AlertCircle, CheckCircle2, Loader2, ArrowUpDown, Search, X } from "lucide-react";
import OrderViewPDF from "@/components/dashboard/recepcionista/pdfs/OrderViewPDF";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import OrderDownloadPDF from "@/components/dashboard/recepcionista/pdfs/OrderDownloadPDF";
import { Badge } from "@/components/ui/badge";
import CancelOrder from "@/components/dashboard/recepcionista/CancelOrder";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { DateRangePicker } from "./DateRangePicker";


const columnHelper = createColumnHelper<EntryOrderListItem>();

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

export default function CreatedOrdersTable() {
  const ReceptionistcontextReceived = useContext(ReceptionistContext);
  const PermissioncontextRecived = useContext(PermissionsContext);

  const tenantId =
    PermissioncontextRecived?.PermissionsContextValue.tenantObject?.id;
  const templates =
    ReceptionistcontextReceived?.ReceptionistContextValue.entryOrdersTableData
      .query.entryOrdersData || [];

  const { query, mutation } =
    ReceptionistcontextReceived?.ReceptionistContextValue
      .entryOrdersTableData || {};

  // 🌟 EXTRAEMOS LOS NUEVOS ESTADOS DIRECTAMENTE DEL CONTEXTO
  const {
    orderByColumn = "fecha",
    setOrderByColumn = () => {},
    orderByDirection = "DESC",
    setOrderByDirection = () => {},
    showDeleted = false, // 🌟 Extraemos el estado
    setShowDeleted = () => {}, // 🌟 Extraemos el mutador con fallback seguro
    dateRange = undefined,
    setDateRange = () => {},
    // 🌟 Extraemos los nuevos estados de la búsqueda por columna con sus fallbacks
    searchColumn = "placa", // Por defecto el selector mirará a 'placa'
    setSearchColumn = () => {}, // Función vacía por si el contexto llega undefined
    searchTerm = "", // Por defecto el texto de búsqueda es un string vacío
    setSearchTerm = () => {}, // Función vacía de respaldo seguro
    // 🌟 NUEVO: Extraemos los estados de la paginación con sus fallbacks seguros
    page = 1,                         // Por defecto inicia en la página 1
    setPage = () => {},               // Función vacía de respaldo
    rowsPerPage = 5,                 // Por defecto muestra 10 filas por página
    setRowsPerPage = () => {},        // Función vacía de respal
  } = query || {};

  // 🌟 NUEVO: Estado local únicamente para el valor visual del Input
  const [inputValue, setInputValue] = useState(searchTerm);




  // 🌟 NUEVO: Creamos una función "debounced" que sube el valor al contexto
  // Usamos useMemo para que no se re-cree en cada renderizado y dañe el temporizador
  const debouncedSetSearchTerm = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (val: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSearchTerm(val);
      }, 400); // 400ms de espera
    };
  }, [setSearchTerm]);


console.log(searchTerm)


  // 🌟 NUEVO: Cuando el usuario escribe, actualiza el input e inicia el debounce
  // Modifica las funciones existentes en tu tabla:
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearchTerm(value);
    setPage(1); // 🔥 Resetea a la primera página al escribir
  };

  const handleColumnChange = (newColumn: string) => {
    setSearchColumn(newColumn);
    setInputValue("");
    setSearchTerm("");
    setPage(1); // 🔥 Resetea a la primera página al cambiar de columna
  };

  const total = query?.entryOrdersData?.[0]?.total_count ?? 0;

  // Renderizado del Badge de Estado de Sincronización
  const renderStatusBadge = () => {
    if (query?.isEntryOrdersError) {
      return (
        <Badge
          variant="destructive"
          className="gap-1.5 px-3 py-1 animate-pulse"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Error de Sincronización
        </Badge>
      );
    }
    if (query?.isFetchingEntryOrders) {
      return (
        <Badge
          variant="default"
          className="gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Actualizando datos...
        </Badge>
      );
    }
    if (query?.isEntryOrdersSuccess) {
      return (
        <Badge
          variant="outline"
          className="gap-1.5 px-3 py-1 border-green-500 text-green-700 bg-green-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Datos Actualizados
        </Badge>
      );
    }
    return null;
  };

  // ==========================================
  // COLUMNAS
  // ==========================================
  const columns = useMemo(
    () => [
      columnHelper.accessor("placa", {
        header: "Placa",
        cell: (info) => info.getValue(),
      }),

      columnHelper.accessor("fecha", {
        header: "Fecha y Hora",
        cell: (info) => {
          const date = new Date(info.getValue());
          return date.toLocaleString("es-CO", {
            dateStyle: "short",
            timeStyle: "short",
            hour12: true,
          });
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

      columnHelper.accessor("propietario_nombre", {
        header: "Propietario",
        cell: (info) => info.getValue(),
      }),

      columnHelper.accessor("cliente_nombre", {
        header: "Cliente",
        cell: (info) => info.getValue(),
      }),

      columnHelper.accessor("estado_orden", {
        header: "Estado",
        cell: (info) => info.getValue(),
      }),

      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const orden = row.original;
          if (!mutation) return null;

          return (
            <div className="flex gap-2">
              <OrderViewPDF orderId={orden.id} tenantId={tenantId} />
              <OrderDownloadPDF orderId={orden.id} tenantId={tenantId} />
              <CancelOrder
                orden={orden}
                tenantId={tenantId}
                mutation={mutation}
              />
            </div>
          );
        },
      }),
    ],
    [tenantId, mutation],
  );

  // ==========================================
  // INSTANCIA DE LA TABLA
  // ==========================================
  const table = useReactTable({
    data: templates,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* SECCIÓN SUPERIOR: Info, Selects de Ordenamiento y Estado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        {/* Total Registros */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-slate-500">
            Total Encontrado:
          </span>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            {total}
          </span>
        </div>

        {/* CONTROLES DE ORDENAMIENTO Y FILTROS */}
        <div className="flex flex-wrap items-center gap-6">
          {/* CONTROLES DE ORDENAMIENTO (SELECTS CON SINTAXIS BASE UI) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <span>Ordenar por:</span>
            </div>

            {/* Select de Columnas al estilo Base UI */}
            <Select
              items={SELECT_COLUMNAS}
              value={orderByColumn}
              onValueChange={(v) => setOrderByColumn(v ? v : "fecha")}
            >
              <SelectTrigger className="w-40 bg-white h-9 text-sm">
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

            {/* Select de Dirección al estilo Base UI */}
            <Select
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
              <SelectTrigger className="w-45 bg-white h-9 text-sm">
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

            {/* Input de texto libre */}
                <div className="relative flex-1 h-full">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder={`Buscar por ${searchColumn === 'placa' ? 'placa' : searchColumn === 'marca' ? 'marca' : searchColumn === 'linea' ? 'línea' : 'documento'}...`}
                    value={inputValue} // 🌟 Conectado al estado síncrono local
                    onChange={handleInputChange} // 🌟 Despacha el cambio y el debounce juntos
                    className="w-full h-full pl-9 pr-8 border-none bg-transparent rounded-l-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  {/* Botón X para limpiar rápido */}
                  {inputValue && (
                    <button
                      onClick={() => {
                        setInputValue("");
                        setSearchTerm(""); // Limpia el contexto inmediatamente sin esperar debounce
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>


          </div>

          <DateRangePicker
            date={dateRange}
            setDate={setDateRange}
          ></DateRangePicker>

          {/* 🌟 NUEVO FILTRO: MOSTRAR ANULADOS (SWITCH) */}
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

        {/* Estado de Sincronización */}
        <div className="flex items-center">{renderStatusBadge()}</div>
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <Table>
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

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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


      {/* 🌟 NUEVO: PIE DE PÁGINA CON COMPONENTES DE PAGINACIÓN SHADCN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
        
        {/* Selector de Filas por Página (Izquierda) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Filas por página:
          </span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(val) => {
              setRowsPerPage(Number(val));
              setPage(1); // Al cambiar la densidad de filas, volvemos a la pág 1
            }}
          >
            <SelectTrigger className="w-16 h-8 text-xs bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="5" className="text-xs">5</SelectItem>
              <SelectItem value="20" className="text-xs">20</SelectItem>
              <SelectItem value="50" className="text-xs">50</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Indicador de posición actual */}
          <span className="text-xs text-slate-400 ml-2 hidden md:inline">
            Mostrando {Math.min((page - 1) * rowsPerPage + 1, total)} - {Math.min(page * rowsPerPage, total)} de {total}
          </span>
        </div>

        {/* Control de Navegación de Páginas (Derecha) */}
        <Pagination className="mx-0 w-auto">
          <PaginationContent className="gap-1">
            
            {/* Botón Anterior */}
            <PaginationItem>
              <button
                onClick={() => setPage(Math.max(page - 1, 1))}
                disabled={page === 1}
                className="flex h-8 items-center justify-center gap-1 pl-2.5 pr-3.5 text-xs font-medium rounded-md border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {/* Nota: Reutilizamos la estructura visual interna de Shadcn */}
                <span className="hidden sm:inline">Anterior</span>
              </button>
            </PaginationItem>

            {/* Número de Página Actual Estático o Compacto */}
            <PaginationItem>
              <div className="flex h-8 min-w-8 items-center justify-center rounded-md border border-blue-100 bg-blue-50 text-xs font-semibold text-blue-600 px-2 shadow-sm select-none">
                Pág. {page} de {Math.max(Math.ceil(total / rowsPerPage), 1)}
              </div>
            </PaginationItem>

            {/* Botón Siguiente */}
            <PaginationItem>
              <button
                onClick={() => setPage(Math.min(page + 1, Math.ceil(total / rowsPerPage)))}
                disabled={page >= Math.ceil(total / rowsPerPage)}
                className="flex h-8 items-center justify-center gap-1 pl-3.5 pr-2.5 text-xs font-medium rounded-md border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <span className="hidden sm:inline">Siguiente</span>
              </button>
            </PaginationItem>

          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
