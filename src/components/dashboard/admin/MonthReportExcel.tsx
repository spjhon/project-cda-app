"use client";

import { useContext, useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { Workbook } from "exceljs";

import { Button } from "@/components/ui/button";
import { AdminContext } from "@/contexts/AdminLoaderContext";

interface MonthReportExcelButtonProps {
  ano: number;
}

export function MonthReportExcelButton({ ano }: MonthReportExcelButtonProps) {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error(
      "MonthReportExcelButton debe usarse dentro de AdminContext.Provider"
    );
  }

  const { reportesDesglosePrecioQuery } = context.AdminContextValue;
  const data = reportesDesglosePrecioQuery.data?.chart_anio ?? [];

  const [isExporting, setIsExporting] = useState(false);

  const combinacionesUnicas = Array.from(
    new Set(
      data.flatMap((mes) =>
        mes.combinaciones ? Object.keys(mes.combinaciones) : []
      )
    )
  ).sort();

  const totales = data.reduce(
    (acc, mes) => {
      acc.num_ordenes += mes.num_ordenes;
      acc.base_price += mes.base_price;
      acc.base_iva_amount += mes.base_iva_amount;
      acc.fee_sicov_amount += mes.fee_sicov_amount;
      acc.fee_entidad_amount += mes.fee_entidad_amount;
      acc.fee_runt_amount += mes.fee_runt_amount;
      acc.fee_ansv_amount += mes.fee_ansv_amount;
      acc.total += mes.total;

      if (mes.combinaciones) {
        for (const [key, value] of Object.entries(mes.combinaciones)) {
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

  const handleExport = async () => {
    if (data.length === 0) return;
    setIsExporting(true);

    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("Informe Mensual");

      // Columnas
      const columns = [
        { header: "Mes", key: "mes_nombre", width: 20 },
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
        { header: "Total", key: "total", width: 20 }, // La última columna
      ];

      worksheet.columns = columns;

      const lastCol = columns.length;
      const totalColIndex = lastCol; // El índice de la columna "Total"

      // 1. Encabezado
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

      // 2. Filas de datos
      data.forEach((mes, index) => {
        const row: Record<string, unknown> = {
          mes_nombre: mes.mes_nombre,
          num_ordenes: mes.num_ordenes,
          base_price: mes.base_price,
          base_iva_amount: mes.base_iva_amount,
          fee_sicov_amount: mes.fee_sicov_amount,
          fee_entidad_amount: mes.fee_entidad_amount,
          fee_runt_amount: mes.fee_runt_amount,
          fee_ansv_amount: mes.fee_ansv_amount,
          total: mes.total,
        };

        for (const combinacion of combinacionesUnicas) {
          row[`combo_${combinacion}`] = mes.combinaciones?.[combinacion] ?? 0;
        }

        const addedRow = worksheet.addRow(row);
        addedRow.height = 20;

        const bgColor = index % 2 === 0 ? "FFFFFFFF" : "FFF6F8F9";

        addedRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          // Estilo base para todas las celdas
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: bgColor },
          };
          
          // Si es la columna de "Total", aplicamos negrilla
          const isTotalColumn = colNumber === totalColIndex;

          cell.font = {
            size: 11,
            name: "Calibri",
            color: { argb: "FF1F2937" },
            bold: isTotalColumn, // 👈 Negrilla solo en la columna Total
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

      // 3. Fila de totales (horizontal, abajo)
      const totalRow: Record<string, unknown> = {
        mes_nombre: "TOTAL",
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
          fgColor: { argb: "FFF0FDF4" }, // Fondo verde claro
        };
        cell.font = {
          bold: true,
          size: 14, // Más grande
          name: "Calibri",
          color: { argb: "FF15803D" }, // Verde oscuro
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

      // 4. Formato de moneda y cantidades (AQUI SE MANTIENE EL FORMATO DE DINERO)
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
          col.numFmt = '"$"#,##0'; // 👈 Se mantiene el formato de dinero
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

      // 5. Borde exterior
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

      // 6. Congelar encabezado
      worksheet.views = [
        {
          state: "frozen",
          xSplit: 0,
          ySplit: 1,
          topLeftCell: "A2",
          activeCell: "A2",
        },
      ];

      // 7. Generar archivo y descargar
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `informe_mensual_${ano}.xlsx`;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error al exportar el informe mensual:", error);
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