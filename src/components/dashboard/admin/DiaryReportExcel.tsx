"use client";

import { useContext, useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { Workbook } from "exceljs";

import { Button } from "@/components/ui/button";
import { AdminContext } from "@/contexts/AdminLoaderContext";

// ============================================================
// HELPERS
// ============================================================

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ============================================================
// TIPOS
// ============================================================

interface DiaryReportExcelButtonProps {
  mesLabel: string; // "Noviembre"
  ano: number;
}

// ============================================================
// COMPONENTE
// ============================================================

export function DiaryReportExcelButton({
  mesLabel,
  ano,
}: DiaryReportExcelButtonProps) {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error(
      "DiaryReportExcelButton debe usarse dentro de AdminContext.Provider"
    );
  }

  const { 
    reportesDesglosePrecioQuery,
    servicioTipoContabilidadSeleccionado 
  } = context.AdminContextValue;
  
  const data = reportesDesglosePrecioQuery.data?.chart_mes ?? [];

  const [isExporting, setIsExporting] = useState(false);

  // ----------------------------------------------------------
  // Combinaciones únicas
  // ----------------------------------------------------------
  const combinacionesUnicas = Array.from(
    new Set(
      data.flatMap((dia) =>
        dia.combinaciones ? Object.keys(dia.combinaciones) : []
      )
    )
  ).sort();

  // ----------------------------------------------------------
  // Totales
  // ----------------------------------------------------------
  const totales = data.reduce(
    (acc, dia) => {
      acc.num_ordenes += dia.num_ordenes;
      acc.base_price += dia.base_price;
      acc.base_iva_amount += dia.base_iva_amount;
      acc.fee_sicov_amount += dia.fee_sicov_amount;
      acc.fee_entidad_amount += dia.fee_entidad_amount;
      acc.fee_runt_amount += dia.fee_runt_amount;
      acc.fee_ansv_amount += dia.fee_ansv_amount;
      acc.total += dia.total;

      if (dia.combinaciones) {
        for (const [key, value] of Object.entries(dia.combinaciones)) {
          acc.combinaciones[key] = (acc.combinaciones[key] ?? 0) + value;
        }
      }
      return acc;
    },
    {
      num_ordenes: 0,
      base_price: 0,
      base_iva_amount: 0,
      fee_sicov_amount: 0,
      fee_entidad_amount: 0,
      fee_runt_amount: 0,
      fee_ansv_amount: 0,
      total: 0,
      combinaciones: {} as Record<string, number>,
    }
  );

  // ============================================================
  // Función de exportación
  // ============================================================

  const handleExport = async () => {
    if (data.length === 0) return;
    setIsExporting(true);

    try {
      const servicioNombre = servicioTipoContabilidadSeleccionado 
        ? servicioTipoContabilidadSeleccionado.replace(/_/g, " ") 
        : "Todos";

      const sheetName = `${servicioNombre} ${mesLabel} ${ano}`.substring(0, 31);

      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // ----------------------------------------------------------
      // Columnas
      // ----------------------------------------------------------
      const columns = [
        { header: "Fecha", key: "fecha", width: 40 },
        ...combinacionesUnicas.map((combinacion) => ({
          header: combinacion.replace(/_/g, " "),
          key: `combo_${combinacion}`,
          width: 18,
        })),
        { header: "Órdenes", key: "num_ordenes", width: 12 },
        { header: "Base", key: "base_price", width: 16 },
        { header: "IVA base", key: "base_iva_amount", width: 16 },
        { header: "SICOV", key: "fee_sicov_amount", width: 16 },
        { header: "Entidad", key: "fee_entidad_amount", width: 16 },
        { header: "RUNT", key: "fee_runt_amount", width: 16 },
        { header: "ANSV", key: "fee_ansv_amount", width: 16 },
        { header: "Total", key: "total", width: 20 },
      ];

      worksheet.columns = columns;

      const lastCol = columns.length;
      const totalColIndex = lastCol;

      // ----------------------------------------------------------
      // 1. Encabezado
      // ----------------------------------------------------------
      const headerRow = worksheet.getRow(1);
      headerRow.height = 28;

      headerRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF356854" },
        };
        cell.font = {
          bold: true,
          color: { argb: "FFFFFFFF" },
          size: 12,
          name: "Calibri",
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FF2A5242" } },
          bottom: { style: "thin", color: { argb: "FF2A5242" } },
          left: { style: "thin", color: { argb: "FF2A5242" } },
          right: { style: "thin", color: { argb: "FF2A5242" } },
        };
      });

      // ----------------------------------------------------------
      // 2. Filas de datos
      // ----------------------------------------------------------
      data.forEach((dia, index) => {
        const row: Record<string, unknown> = {
          fecha: formatDateLong(dia.fecha),
          num_ordenes: dia.num_ordenes,
          base_price: dia.base_price,
          base_iva_amount: dia.base_iva_amount,
          fee_sicov_amount: dia.fee_sicov_amount,
          fee_entidad_amount: dia.fee_entidad_amount,
          fee_runt_amount: dia.fee_runt_amount,
          fee_ansv_amount: dia.fee_ansv_amount,
          total: dia.total,
        };

        for (const combinacion of combinacionesUnicas) {
          row[`combo_${combinacion}`] = dia.combinaciones?.[combinacion] ?? 0;
        }

        const addedRow = worksheet.addRow(row);
        addedRow.height = 20;

        const bgColor = index % 2 === 0 ? "FFFFFFFF" : "FFF6F8F9";

        addedRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: bgColor },
          };
          
          const isTotalColumn = colNumber === totalColIndex;

          cell.font = {
            size: 11,
            name: "Calibri",
            color: { argb: "FF1F2937" },
            bold: isTotalColumn,
          };

          cell.alignment = {
            vertical: "middle",
            horizontal: typeof cell.value === "number" ? "right" : "left",
          };

          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          };
        });
      });

      // ----------------------------------------------------------
      // 3. Fila de totales
      // ----------------------------------------------------------
      const totalRow: Record<string, unknown> = {
        fecha: "TOTAL",
        num_ordenes: totales.num_ordenes,
        base_price: totales.base_price,
        base_iva_amount: totales.base_iva_amount,
        fee_sicov_amount: totales.fee_sicov_amount,
        fee_entidad_amount: totales.fee_entidad_amount,
        fee_runt_amount: totales.fee_runt_amount,
        fee_ansv_amount: totales.fee_ansv_amount,
        total: totales.total,
      };

      for (const combinacion of combinacionesUnicas) {
        totalRow[`combo_${combinacion}`] = totales.combinaciones[combinacion] ?? 0;
      }

      const addedTotalRow = worksheet.addRow(totalRow);
      addedTotalRow.height = 24;

      addedTotalRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF0FDF4" },
        };
        cell.font = {
          bold: true,
          size: 14,
          name: "Calibri",
          color: { argb: "FF15803D" },
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: typeof cell.value === "number" ? "right" : "left",
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FF15803D" } },
          bottom: { style: "thin", color: { argb: "FF15803D" } },
          left: { style: "thin", color: { argb: "FF15803D" } },
          right: { style: "thin", color: { argb: "FF15803D" } },
        };
      });

      // ----------------------------------------------------------
      // 4. Formato de moneda y cantidades
      // ----------------------------------------------------------
      const columnasMoneda = [
        "base_price",
        "base_iva_amount",
        "fee_sicov_amount",
        "fee_entidad_amount",
        "fee_runt_amount",
        "fee_ansv_amount",
        "total",
      ];

      columnasMoneda.forEach((colKey) => {
        const col = worksheet.getColumn(colKey);
        if (col) {
          col.numFmt = '"$"#,##0';
        }
      });

      const columnasCantidad = [
        "num_ordenes",
        ...combinacionesUnicas.map((c) => `combo_${c}`),
      ];

      columnasCantidad.forEach((colKey) => {
        const col = worksheet.getColumn(colKey);
        if (col) {
          col.numFmt = "#,##0";
        }
      });

      // ----------------------------------------------------------
      // 5. Borde exterior
      // ----------------------------------------------------------
      const firstRow = 1;
      const lastRow = worksheet.rowCount;
      const firstCol = 1;

      for (let r = firstRow; r <= lastRow; r++) {
        const row = worksheet.getRow(r);

        if (r === firstRow) {
          for (let c = firstCol; c <= lastCol; c++) {
            const cell = row.getCell(c);
            cell.border = {
              ...cell.border,
              top: { style: "medium", color: { argb: "FF356854" } },
            };
          }
        }

        if (r === lastRow) {
          for (let c = firstCol; c <= lastCol; c++) {
            const cell = row.getCell(c);
            cell.border = {
              ...cell.border,
              bottom: { style: "medium", color: { argb: "FF356854" } },
            };
          }
        }

        const firstCell = row.getCell(firstCol);
        firstCell.border = {
          ...firstCell.border,
          left: { style: "medium", color: { argb: "FF356854" } },
        };

        const lastCell = row.getCell(lastCol);
        lastCell.border = {
          ...lastCell.border,
          right: { style: "medium", color: { argb: "FF356854" } },
        };
      }

      // ----------------------------------------------------------
      // 6. Generar archivo y descargar
      // ----------------------------------------------------------
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `reporte_diario_${servicioNombre.replace(/\s+/g, "-").toLowerCase()}_${mesLabel}_${ano}.xlsx`;
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error al exportar el reporte diario:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const isButtonDisabled = data.length === 0 || isExporting;

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 gap-2 border-border text-xs font-medium shadow-sm hover:bg-muted"
      onClick={handleExport}
      disabled={isButtonDisabled}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
      )}

      {isExporting ? "Generando Excel..." : "Exportar Excel"}
    </Button>
  );
}