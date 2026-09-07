"use client";

import { useMemo } from "react";

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

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddFeeDialog from "./AddFee";
import { RateFeeFormState } from "./AddRate";



// -----------------------------------------------------------------------------
// CONFIGURACIÓN DE COLUMNAS
// -----------------------------------------------------------------------------

const columnHelper = createColumnHelper<RateFeeFormState>();

// -----------------------------------------------------------------------------
// PROPS
// -----------------------------------------------------------------------------

interface FeesTableProps {
  fees: RateFeeFormState[];
  onFeesChange: (fees: RateFeeFormState[]) => void;
}

// -----------------------------------------------------------------------------
// COMPONENTE
// -----------------------------------------------------------------------------

export default function FeesTable({
  fees,
  onFeesChange,
}: FeesTableProps) {
  // ===========================================================================
  // CONFIGURACIÓN DE COLUMNAS
  // ===========================================================================

  const columns = useMemo(
    () => [
      // -----------------------------------------------------------------------
      // FEE
      // -----------------------------------------------------------------------

      columnHelper.accessor("name", {
        header: "Fee",
        cell: (info) => {
          const value = info.getValue();

          return (
            <span className="font-semibold text-foreground text-sm whitespace-nowrap">
              {value || "---"}
            </span>
          );
        },
      }),

    

      // -----------------------------------------------------------------------
      // DESCRIPCIÓN
      // -----------------------------------------------------------------------

      columnHelper.accessor("description", {
        header: "Descripción",
        cell: (info) => {
          const value = info.getValue();

          return (
            <span className="text-sm text-muted-foreground max-w-64 truncate block">
              {value || "---"}
            </span>
          );
        },
      }),

      // -----------------------------------------------------------------------
      // VALOR DEL FEE
      // -----------------------------------------------------------------------

      columnHelper.accessor("fee_amount", {
        header: "Valor",
        cell: (info) => {
          const amount = info.getValue();

          return (
            <span className="font-bold text-primary text-sm whitespace-nowrap">
              ${Number(amount || 0).toLocaleString("es-CO")}
            </span>
          );
        },
      }),

      // -----------------------------------------------------------------------
      // IVA
      // -----------------------------------------------------------------------

      columnHelper.accessor("iva_percentage", {
        header: "IVA",
        cell: (info) => {
          const iva = info.getValue();

          return (
            <span className="text-sm font-medium whitespace-nowrap">
              {Number(iva || 0) === 0
                ? "Sin IVA"
                : `${Number(iva)}%`}
            </span>
          );
        },
      }),

      // -----------------------------------------------------------------------
      // AÑOS DEL MODELO
      // -----------------------------------------------------------------------

      columnHelper.display({
        id: "model_year_range",
        header: "Años modelo",
        cell: ({ row }) => {
          const from = row.original.model_year_from;
          const to = row.original.model_year_to;

          let label = "Todos los años";

          if (from !== "" && to !== "") {
            label = `${from} - ${to}`;
          } else if (from !== "") {
            label = `${from} en adelante`;
          } else if (to !== "") {
            label = `Hasta ${to}`;
          }

          return (
            <span className="text-sm font-medium whitespace-nowrap">
              {label}
            </span>
          );
        },
      }),


      // -----------------------------------------------------------------------
      // ACCIONES
      // -----------------------------------------------------------------------

      columnHelper.display({
  id: "actions",
  header: "",
  cell: ({ row }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={() => {
        onFeesChange(
          fees.filter((_, index) => index !== row.index)
        );
      }}
      title="Eliminar fee"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  ),
}),
    ],
    [fees, onFeesChange]
  );

  // ===========================================================================
  // CONFIGURACIÓN DE LA TABLA
  // ===========================================================================

  const table = useReactTable({
    data: fees,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="space-y-5 p-6 bg-background rounded-2xl shadow-sm">
      

      {/* =====================================================================
          ACCIONES DE LA TABLA
      ====================================================================== */}

      <div className="flex justify-end">
        <AddFeeDialog
          onFeeCreated={(fee) => {
            onFeesChange([...fees, fee]);
          }}
        />
      </div>

      {/* =====================================================================
          CONTENEDOR DE LA TABLA
      ====================================================================== */}

      <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background overflow-x-auto">
        <Table>
          {/* ===================================================================
              HEADER
          ==================================================================== */}

          <TableHeader className="bg-muted/50 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-foreground h-11 whitespace-nowrap"
                  >
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

          {/* ===================================================================
              BODY
          ==================================================================== */}

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50 border-b border-border transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-3"
                    >
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
                  className="text-center py-12 text-muted-foreground font-medium"
                >
                  No se han agregado fees a este rate
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}