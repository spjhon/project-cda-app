"use client";

import { useContext, useMemo } from "react";
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
import { AlertCircle, CheckCircle2, Loader2, ArrowUpDown } from "lucide-react";
import OrderViewPDF from "./pdfs/OrderViewPDF";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import OrderDownloadPDF from "./pdfs/OrderDownloadPDF";
import { Badge } from "../ui/badge";
import CancelOrder from "./CancelOrder";



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

  const tenantId = PermissioncontextRecived?.PermissionsContextValue.tenantObject?.id;
  const templates = ReceptionistcontextReceived?.ReceptionistContextValue.entryOrdersTableData.query.entryOrdersData || [];

  const { query, mutation } = ReceptionistcontextReceived?.ReceptionistContextValue.entryOrdersTableData || {};

  // 🌟 EXTRAEMOS LOS NUEVOS ESTADOS DIRECTAMENTE DEL CONTEXTO
  const {
    orderByColumn = "fecha",
    setOrderByColumn = () => {},
    orderByDirection = "DESC",
    setOrderByDirection = () => {},
  } = query || {};

  const total = query?.entryOrdersData?.[0]?.total_count ?? 0;

  // Renderizado del Badge de Estado de Sincronización
  const renderStatusBadge = () => {
    if (query?.isEntryOrdersError) {
      return (
        <Badge variant="destructive" className="gap-1.5 px-3 py-1 animate-pulse">
          <AlertCircle className="h-3.5 w-3.5" />
          Error de Sincronización
        </Badge>
      );
    }
    if (query?.isFetchingEntryOrders) {
      return (
        <Badge variant="default" className="gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Actualizando datos...
        </Badge>
      );
    }
    if (query?.isEntryOrdersSuccess) {
      return (
        <Badge variant="outline" className="gap-1.5 px-3 py-1 border-green-500 text-green-700 bg-green-50">
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
              <CancelOrder orden={orden} tenantId={tenantId} mutation={mutation} />
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
          <span className="text-sm font-medium text-slate-500">Total Encontrado:</span>
          <span className="text-xl font-bold text-slate-900 tracking-tight">{total}</span>
        </div>






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
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
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