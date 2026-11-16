"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import { DesglosePrecioDiaItem } from "@/types/functions_types";
import { DiaryReportExcelButton } from "./DiaryReportExcel";

// ============================================================
// HELPERS
// ============================================================

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
}

// ============================================================
// FEATURES + COLUMN HELPER
// ============================================================

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, DesglosePrecioDiaItem>();

// ============================================================
// TIPOS
// ============================================================

interface DiaryReportTableProps {
  data: DesglosePrecioDiaItem[];
  mesLabel: string;
  ano: number;
}

// ============================================================
// COMPONENTE
// ============================================================

export default function DiaryReportTable({
  data,
  mesLabel,
  ano,
}: DiaryReportTableProps) {
  // ----------------------------------------------------------
  // Combinaciones únicas
  // ----------------------------------------------------------
  const combinacionesUnicas = useMemo(() => {
    const set = new Set<string>();
    for (const dia of data) {
      if (dia.combinaciones) {
        for (const key of Object.keys(dia.combinaciones)) {
          set.add(key);
        }
      }
    }
    return Array.from(set).sort();
  }, [data]);

  // ----------------------------------------------------------
  // Totales
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

    for (const dia of data) {
      t.num_ordenes += dia.num_ordenes;
      t.base_price += dia.base_price;
      t.base_iva_amount += dia.base_iva_amount;
      t.fee_sicov_amount += dia.fee_sicov_amount;
      t.fee_sicov_iva += dia.fee_sicov_iva;
      t.fee_entidad_amount += dia.fee_entidad_amount;
      t.fee_entidad_iva += dia.fee_entidad_iva;
      t.fee_runt_amount += dia.fee_runt_amount;
      t.fee_runt_iva += dia.fee_runt_iva;
      t.fee_ansv_amount += dia.fee_ansv_amount;
      t.fee_ansv_iva += dia.fee_ansv_iva;
      t.fees_subtotal += dia.fees_subtotal;
      t.fees_iva_total += dia.fees_iva_total;
      t.subtotal += dia.subtotal;
      t.iva_total += dia.iva_total;
      t.total += dia.total;

      if (dia.combinaciones) {
        for (const [key, value] of Object.entries(dia.combinaciones)) {
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
        columnHelper.accessor("fecha", {
          header: "Fecha",
          cell: (info) => (
            <span className="capitalize">{formatDateLong(info.getValue())}</span>
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
              const dia = info.row.original;
              const cantidad = dia.combinaciones?.[combinacion] ?? 0;
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
      {/* 👇 TÍTULO CON BOTÓN (un solo bloque, sin duplicar) */}
      <div className="bg-muted/30 px-4 py-3 border-b border-border flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Desglose diario — {mesLabel} {ano}
        </h3>

        <DiaryReportExcelButton mesLabel={mesLabel} ano={ano} />
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
                    style={{
                      width: header.column.id === "fecha" ? 220 : undefined,
                    }}
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
                  No hay datos para el mes seleccionado.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50 border-b border-border transition-colors"
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-1"
                      style={{
                        width: cell.column.id === "fecha" ? 220 : undefined,
                      }}
                    >
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>

          {data.length > 0 && (
            <tfoot className="bg-muted/50 border-t-2 border-border font-semibold">
              <TableRow className="hover:bg-transparent">
                <TableCell className="py-1" style={{ width: 220 }}>
                  <span className="font-bold uppercase text-xs text-muted-foreground">
                    Total
                  </span>
                </TableCell>

                {combinacionesUnicas.map((combinacion) => (
                  <TableCell
                    key={`total-${combinacion}`}
                    className="py-1 text-right tabular-nums"
                  >
                    {totales.combinaciones[combinacion] ?? 0}
                  </TableCell>
                ))}

                <TableCell className="py-1 text-right tabular-nums">
                  {totales.num_ordenes}
                </TableCell>

                <TableCell className="py-1 text-right tabular-nums">
                  {formatCurrency(totales.base_price)}
                </TableCell>

                <TableCell className="py-1 text-right tabular-nums text-muted-foreground">
                  {formatCurrency(totales.base_iva_amount)}
                </TableCell>

                <TableCell className="py-1 text-right tabular-nums">
                  {formatCurrency(totales.fee_sicov_amount)}
                </TableCell>

                <TableCell className="py-1 text-right tabular-nums">
                  {formatCurrency(totales.fee_entidad_amount)}
                </TableCell>

                <TableCell className="py-1 text-right tabular-nums">
                  {formatCurrency(totales.fee_runt_amount)}
                </TableCell>

                <TableCell className="py-1 text-right tabular-nums">
                  {formatCurrency(totales.fee_ansv_amount)}
                </TableCell>

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