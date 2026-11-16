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
import { MonthReportExcelButton } from "./MonthReportExcel";

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
// FEATURES + COLUMN HELPER
// ============================================================

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, DesglosePrecioMesItem>();

// ============================================================
// TIPOS
// ============================================================

interface MonthReportTableProps {
  data: DesglosePrecioMesItem[];
  ano: number;
}

// ============================================================
// COMPONENTE
// ============================================================

export default function MonthReportTable({ data, ano }: MonthReportTableProps) {
  // ----------------------------------------------------------
  // Combinaciones únicas
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
  // 👇 TOTALES (calculados con useMemo)
  // ----------------------------------------------------------
  const totales = useMemo(() => {
    const t = {
      num_ordenes: 0,
      base_price: 0,
      base_iva_amount: 0,
      fee_sicov_amount: 0,
      fee_sicov_iva: 0,
      fee_entidad_amount: 0,
      fee_entidad_iva: 0,
      fee_runt_amount: 0,
      fee_runt_iva: 0,
      fee_ansv_amount: 0,
      fee_ansv_iva: 0,
      fees_subtotal: 0,
      fees_iva_total: 0,
      subtotal: 0,
      iva_total: 0,
      total: 0,
      combinaciones: {} as Record<string, number>,
    };

    for (const mes of data) {
      t.num_ordenes += mes.num_ordenes;
      t.base_price += mes.base_price;
      t.base_iva_amount += mes.base_iva_amount;
      t.fee_sicov_amount += mes.fee_sicov_amount;
      t.fee_sicov_iva += mes.fee_sicov_iva;
      t.fee_entidad_amount += mes.fee_entidad_amount;
      t.fee_entidad_iva += mes.fee_entidad_iva;
      t.fee_runt_amount += mes.fee_runt_amount;
      t.fee_runt_iva += mes.fee_runt_iva;
      t.fee_ansv_amount += mes.fee_ansv_amount;
      t.fee_ansv_iva += mes.fee_ansv_iva;
      t.fees_subtotal += mes.fees_subtotal;
      t.fees_iva_total += mes.fees_iva_total;
      t.subtotal += mes.subtotal;
      t.iva_total += mes.iva_total;
      t.total += mes.total;

      if (mes.combinaciones) {
        for (const [key, value] of Object.entries(mes.combinaciones)) {
          t.combinaciones[key] = (t.combinaciones[key] ?? 0) + value;
        }
      }
    }

    return t;
  }, [data]);

  // ----------------------------------------------------------
  // Columnas
  // ----------------------------------------------------------
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("mes_nombre", {
          header: "Mes",
          cell: (info) => (
            <span className="font-medium">{info.getValue()}</span>
          ),
        }),

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
                <span className="block text-right tabular-nums">{cantidad}</span>
              );
            },
          }),
        ),

        columnHelper.accessor("num_ordenes", {
          header: () => <span className="block text-right">Órdenes</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums">{info.getValue()}</span>
          ),
        }),

        columnHelper.accessor("base_price", {
          header: () => <span className="block text-right">Base</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),

        columnHelper.accessor("base_iva_amount", {
          header: () => <span className="block text-right">IVA base</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums text-muted-foreground">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),

        columnHelper.accessor("fee_sicov_amount", {
          header: () => <span className="block text-right">SICOV</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),

        columnHelper.accessor("fee_entidad_amount", {
          header: () => <span className="block text-right">Entidad</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),

        columnHelper.accessor("fee_runt_amount", {
          header: () => <span className="block text-right">RUNT</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),

        columnHelper.accessor("fee_ansv_amount", {
          header: () => <span className="block text-right">ANSV</span>,
          cell: (info) => (
            <span className="block text-right tabular-nums">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),

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

  const table = useTable({ features, columns, data });

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
      <div className="bg-muted/30 px-4 py-3 border-b border-border flex items-center justify-between gap-3">
  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
    Desglose mensual — {ano}
  </h3>

  <MonthReportExcelButton ano={ano} />
</div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-foreground h-9 whitespace-nowrap"
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
                    <TableCell key={cell.id} className="py-1">
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>

          {/* 👇 FILA DE TOTALES */}
          {data.length > 0 && (
            <tfoot className="bg-muted/50 border-t-2 border-border font-semibold">
              <TableRow className="hover:bg-transparent">
                {/* Mes: "Total" */}
                <TableCell className="py-1">
                  <span className="font-bold uppercase text-xs text-muted-foreground">
                    Total
                  </span>
                </TableCell>

                {/* Combinaciones */}
                {combinacionesUnicas.map((combinacion) => (
                  <TableCell
                    key={`total-${combinacion}`}
                    className="py-1 text-right tabular-nums"
                  >
                    {totales.combinaciones[combinacion] ?? 0}
                  </TableCell>
                ))}

                {/* Órdenes */}
                <TableCell className="py-1 text-right tabular-nums">
                  {totales.num_ordenes}
                </TableCell>

                {/* Base */}
                <TableCell className="py-1 text-right tabular-nums">
                  {formatCurrency(totales.base_price)}
                </TableCell>

                {/* IVA base */}
                <TableCell className="py-1 text-right tabular-nums text-muted-foreground">
                  {formatCurrency(totales.base_iva_amount)}
                </TableCell>

                {/* SICOV */}
                <TableCell className="py-1 text-right tabular-nums">
                  {formatCurrency(totales.fee_sicov_amount)}
                </TableCell>

                {/* Entidad */}
                <TableCell className="py-1 text-right tabular-nums">
                  {formatCurrency(totales.fee_entidad_amount)}
                </TableCell>

                {/* RUNT */}
                <TableCell className="py-1 text-right tabular-nums">
                  {formatCurrency(totales.fee_runt_amount)}
                </TableCell>

                {/* ANSV */}
                <TableCell className="py-1 text-right tabular-nums">
                  {formatCurrency(totales.fee_ansv_amount)}
                </TableCell>

                {/* Total */}
                <TableCell className="py-1 text-right tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(totales.total)}
                </TableCell>
              </TableRow>
            </tfoot>
          )}
        </Table>
      </div>
    </div>
  );
}