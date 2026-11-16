"use client";

import { useMemo } from "react";
import {
  createColumnHelper,
  FlexRender,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DesglosePrecioMesItem } from "@/types/functions_types";

// ============================================================
// HELPERS
// ============================================================

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

// ============================================================
// FEATURES (v9: mínimo, solo core)
// ============================================================

const features = tableFeatures({});

// ============================================================
// COLUMN HELPER (tipado automático de info)
// ============================================================

const columnHelper = createColumnHelper<
  typeof features,
  DesglosePrecioMesItem
>();

// ============================================================
// TIPOS DE PROPS
// ============================================================

interface MonthReportTableProps {
  data: DesglosePrecioMesItem[];
  ano: number;
}

// ============================================================
// COMPONENTE
// ============================================================

export default function MonthReportTable({
  data,
  ano,
}: MonthReportTableProps) {
  // ----------------------------------------------------------
  // Combinaciones únicas presentes en los datos
  // ----------------------------------------------------------
  const combinacionesUnicas = useMemo(() => {
    const set = new Set<string>();

    for (const mes of data) {
      if (mes.combinaciones) {
        for (const key of Object.keys(mes.combinaciones)) {
          set.add(key);
        }
      }
    }

    return Array.from(set).sort();
  }, [data]);

  // ----------------------------------------------------------
  // Columnas con columnHelper.columns([...])
  // ----------------------------------------------------------
  const columns = useMemo(
    () =>
      columnHelper.columns([
        // Mes
        columnHelper.accessor("mes_nombre", {
          header: "Mes",
          cell: (info) => (
            <span className="font-medium">{info.getValue()}</span>
          ),
        }),

        // Columnas dinámicas: una por cada combinación
        ...combinacionesUnicas.map((combinacion) =>
          columnHelper.display({
            id: `count_${combinacion}`,
            header: () => (
              <span className="block text-right capitalize">
                {combinacion.replace(/_/g, " ")}
              </span>
            ),
            cell: (info) => {
              const mes = info.row.original;
              const cantidad = mes.combinaciones?.[combinacion] ?? 0;
              return (
                <span className="block text-right tabular-nums">
                  {cantidad}
                </span>
              );
            },
          }),
        ),

        // Órdenes
        columnHelper.accessor("num_ordenes", {
          header: () => <span className="block text-right">Órdenes</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums">
              {info.getValue()}
            </span>
          ),
        }),

        // Base
        columnHelper.accessor("base_price", {
          header: () => <span className="block text-right">Base</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),

        // IVA base
        columnHelper.accessor("base_iva_amount", {
          header: () => <span className="block text-right">IVA base</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums text-muted-foreground">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),

        // SICOV
        columnHelper.accessor("fee_sicov_amount", {
          header: () => <span className="block text-right">SICOV</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),

        // Entidad
        columnHelper.accessor("fee_entidad_amount", {
          header: () => <span className="block text-right">Entidad</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),

        // RUNT
        columnHelper.accessor("fee_runt_amount", {
          header: () => <span className="block text-right">RUNT</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),

        // ANSV
        columnHelper.accessor("fee_ansv_amount", {
          header: () => <span className="block text-right">ANSV</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),

        // Total
        columnHelper.accessor("total", {
          header: () => <span className="block text-right">Total</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),
      ]),
    [combinacionesUnicas],
  );

  // ----------------------------------------------------------
  // Tabla
  // ----------------------------------------------------------
  const table = useTable({
    features,
    columns,
    data,
  });

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
      {/* Título dentro de la tabla */}
      <div className="bg-muted/30 px-4 py-3 border-b border-border">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Desglose mensual — {ano}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-foreground h-11 whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : (
                      <FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-muted-foreground font-medium"
                >
                  No hay datos para el año seleccionado.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50 border-b border-border transition-colors"
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}