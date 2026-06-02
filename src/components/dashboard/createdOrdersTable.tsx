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

// Importar iconos de Lucide
import { Download, Ban } from "lucide-react";
import OrderViewPDF from "./pdfs/OrderViewPDF";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";

const columnHelper = createColumnHelper<EntryOrderListItem>();

export default function CreatedOrdersTable() {
  const ReceptionistcontextReceived = useContext(ReceptionistContext);
  const PermissioncontextRecived = useContext(PermissionsContext);

  const tenantId = PermissioncontextRecived?.PermissionsContextValue.tenantObject?.id
  const logo_url = PermissioncontextRecived?.PermissionsContextValue.tenantObject?.logo_url
  const data = ReceptionistcontextReceived?.ReceptionistContextValue.entryOrdersTableData.query.data || [];


 

  
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
        header: "Fecha",
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString("es-CO"),
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

      // NUEVA COLUMNA DE ACCIONES
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const orden = row.original;
        
          const handleDescargar = () => {
            console.log("Descargar orden:", orden);
            // Aquí tu lógica para descargar
          };
          
          const handleAnular = () => {
            console.log("Anular orden:", orden);
            // Aquí tu lógica para anular
          };
          
          return (
            <div className="flex gap-2">
              <OrderViewPDF orderId={orden.id} tenantId={tenantId} logoURL={logo_url}></OrderViewPDF>
              
              <button
                onClick={handleDescargar}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Descargar"
              >
                <Download className="h-4 w-4 text-green-600" />
              </button>
              
              <button
                onClick={handleAnular}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Anular orden"
              >
                <Ban className="h-4 w-4 text-red-600" />
              </button>
            </div>
          );
        },
      }),
    ],
    [tenantId, logo_url] // Dependencias vacías porque las funciones son internas
  );





  // ==========================================
  // INSTANCIA DE LA TABLA
  // ==========================================
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });






  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <Table>
        {/* HEADER */}
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        {/* BODY */}
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
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
  );
}