"use client";

// ============================================================
// Imports
// ============================================================

import { useContext } from "react";

import { endOfDay, format, startOfDay } from "date-fns";

import { FileSpreadsheet, Loader2 } from "lucide-react";

import { useMutation } from "@tanstack/react-query";

import { Workbook } from "exceljs";

import { Button } from "@/components/ui/button";

import { EntryOrdersContext } from "@/contexts/EntryOrdersContext";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";

// ============================================================
// Tipado de los registros
// ============================================================

interface AutobigReportRow {
  fecha: string | null;
  consecutivo_fur: string | null;
  placa: string | null;
  pin: string | null;
  tipo_inspeccion: string | null;
  servicio: string | null;
  vehiculo_tipo: string | null;
  metodos_pago: string[] | null;
  forma_pago: string | null;
  empresa: string | null;
  valor_recaudado: number | string | null;
  certificado_runt: string | null;
  resultado_inspeccion: string | null;
  es_reinspeccion: boolean | null;
}

/**
 * Normaliza el tipo de inspección:
 * - Si es reinspección (es_reinspeccion === true) -> "REINSPECCION"
 * - Si es RTM -> "CERTIFICACION"
 */
export function normalizeTipoInspeccion<
  T extends { tipo_inspeccion: string | null; es_reinspeccion: boolean | null },
>(data: T[]): T[] {
  return data.map((item) => {
    // 1. Reinspección (tiene prioridad sobre RTM)
    if (item.es_reinspeccion === true) {
      return {
        ...item,
        tipo_inspeccion: "REINSPECCION",
      };
    }

    // 2. RTM -> CERTIFICACION
    if (item.tipo_inspeccion === "RTM") {
      return {
        ...item,
        tipo_inspeccion: "CERTIFICACION",
      };
    }

    return item;
  });
}

// ============================================================
// Componente
// ============================================================

export function DownloadAutobigExcelButton() {
  const context = useContext(EntryOrdersContext);
  const permissionscontextRecived = useContext(PermissionsContext);

  const tenantId =
    permissionscontextRecived?.PermissionsContextValue.tenantObject?.id;

  const dateRange = context?.entryOrdersTableData?.query?.dateRange;
  const totalADescargar =
    context?.entryOrdersTableData?.query?.entryOrdersQuery.data?.[0]
      ?.total_count;

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!tenantId) {
        throw new Error("No se encontró el CDA seleccionado.");
      }
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("El rango de fechas no está definido.");
      }

      const startDate = startOfDay(new Date(dateRange.from));
      const endDate = endOfDay(new Date(dateRange.to));

      const supabaseBrowser = createSupabaseBrowserClient();

      const { data: orders, error } = await supabaseBrowser.rpc(
        "get_autobig_entry_orders_for_export",
        {
          p_tenant_id: tenantId,
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString(),
        },
      );

      if (error) {
        throw new Error(error.message || "Error al obtener los registros.");
      }

      if (!orders || orders.length === 0) {
        throw new Error("No hay registros para exportar.");
      }

      const ordersParaExcel = normalizeTipoInspeccion(orders);

      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("Reporte AUTOBIG");

      // ----------------------------------------------------------
      // Definir columnas
      // ----------------------------------------------------------
      worksheet.columns = [
        { header: "FECHA", key: "fecha", width: 16 },
        { header: "#", key: "numero", width: 8 },
        { header: "FUR", key: "consecutivo_fur", width: 16 },
        { header: "PLACA", key: "placa", width: 14 },
        { header: "PIN", key: "pin", width: 14 },
        { header: "TIPO DE VEHÍCULO", key: "vehiculo_tipo", width: 20 },
        { header: "TIPO DE INSPECCION", key: "tipo_inspeccion", width: 22 },
        { header: "SERVICIO", key: "servicio", width: 18 },
        { header: "METODOS DE PAGO", key: "forma_pago", width: 18 },
        { header: "EMPRESA", key: "empresa", width: 25 },
        { header: "VALOR RECAUDADO", key: "valor_recaudado", width: 20 },
        { header: "NUMERO CERTIFICADO RUNT", key: "certificado_runt", width: 25 },
        { header: "FUPAS RESTANTES", key: "fupas_restantes", width: 18 },
        { header: "RESULTADO INSPECCION", key: "resultado_inspeccion", width: 24 },
        { header: "CERTIFICADOS RESTANTES", key: "certificados_restantes", width: 25 },
        { header: "NUMERO LATERAL", key: "numero_lateral", width: 18 },
      ];

      // ==========================================================
      // 1. Formato de encabezados (Verde #92D050, negra, negrilla)
      // ==========================================================
      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF92D050" },
        };
        cell.font = {
          name: "Calibri",
          size: 11,
          bold: true,
          color: { argb: "FF000000" },
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        // Los bordes de la cabecera los pondremos al final junto con todos los demás
      });

      // ==========================================================
      // 2. Poblar datos y aplicar estilos por celda
      // ==========================================================
      (ordersParaExcel as AutobigReportRow[]).forEach((row) => {
        const addedRow = worksheet.addRow({
          fecha: row.fecha ? format(new Date(row.fecha), "dd/MM/yyyy") : "",
          consecutivo_fur: row.consecutivo_fur ?? "",
          placa: (row.placa ?? "").toUpperCase(),
          pin: row.pin ?? "",
          vehiculo_tipo: (row.vehiculo_tipo ?? "").toUpperCase(),
          tipo_inspeccion: (row.tipo_inspeccion ?? "").toUpperCase(),
          servicio: (row.servicio ?? "").toUpperCase(),
          valor_recaudado:
            row.valor_recaudado !== null && row.valor_recaudado !== undefined
              ? Number(row.valor_recaudado)
              : null,
          certificado_runt: (row.certificado_runt ?? "").toUpperCase(),
          resultado_inspeccion: (row.resultado_inspeccion ?? "").toUpperCase(),
          numero: "",
          forma_pago: (row.metodos_pago?.join(", ") ?? "").toUpperCase(),
          fupas_restantes: "",
          certificados_restantes: "",
          empresa: row.empresa ?? "",
          numero_lateral: "",
        });

        // --- ¿Es preventiva? (se usa tanto para tipo como para resultado) ---
        const esPreventiva = String(
          addedRow.getCell("tipo_inspeccion").value ?? "",
        )
          .toLowerCase()
          .includes("preventiva");

        // --- Fecha ---
        addedRow.getCell("fecha").font = {
          name: "Calibri",
          size: 14,
          bold: true,
        };

        // --- Placa ---
        addedRow.getCell("placa").font = {
          name: "Calibri",
          size: 11,
          bold: true,
          color: { argb: "FFFF0000" },
        };

        // --- Tipo de Vehículo ---
        const cellVehiculo = addedRow.getCell("vehiculo_tipo");
        cellVehiculo.font = {
          name: "Calibri",
          size: 11,
          bold: true,
        };

        // --- PIN ---
        const cellPin = addedRow.getCell("pin");
        cellPin.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDBE5F1" },
        };
        cellPin.font = {
          name: "Calibri",
          size: 11,
          color: { argb: "FF314F8E" },
        };

        // --- Tipo de Inspección ---
        const cellTipoInsp = addedRow.getCell("tipo_inspeccion");
        const tipoInspeccion = String(cellTipoInsp.value ?? "").toLowerCase();

        if (tipoInspeccion.includes("preventiva")) {
          cellTipoInsp.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFEB9C" },
          };
          cellTipoInsp.font = {
            name: "Calibri",
            size: 11,
            color: { argb: "FFB08B00" },
          };
        }

        if (
          tipoInspeccion.includes("reinspeccion") ||
          tipoInspeccion.includes("reinspección")
        ) {
          cellTipoInsp.font = {
            name: "Calibri",
            size: 11,
            bold: true,
            color: { argb: "FFFF0000" },
          };
        }

        // --- Servicio ---
        const cellServicio = addedRow.getCell("servicio");
        const servicio = String(cellServicio.value ?? "").toLowerCase().trim();

        if (servicio === "particular") {
          cellServicio.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFEB9C" },
          };
        }

        // --- Valor Recaudado ---
        const cellValor = addedRow.getCell("valor_recaudado");
        cellValor.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDBE5F1" },
        };
        cellValor.font = {
          name: "Calibri",
          size: 11,
          bold: true,
          color: { argb: "FF000000" },
        };

        // --- Certificado RUNT ---
        const cellRunt = addedRow.getCell("certificado_runt");
        cellRunt.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDBE5F1" },
        };
        cellRunt.font = {
          name: "Calibri",
          size: 11,
          color: { argb: "FF000000" },
        };

        // --- Resultado de Inspección ---
        const cellResultado = addedRow.getCell("resultado_inspeccion");
        const resultado = String(cellResultado.value ?? "").toLowerCase();

        if (esPreventiva) {
          // Mismo estilo que la preventiva del tipo de inspección
          cellResultado.value = "PREVENTIVA";
          cellResultado.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFEB9C" },
          };
          cellResultado.font = {
            name: "Calibri",
            size: 11,
            color: { argb: "FFB08B00" },
          };
        } else if (resultado === "aprobado") {
          cellResultado.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFC6EFCE" },
          };
          cellResultado.font = {
            name: "Calibri",
            size: 11,
            bold: true,
            color: { argb: "FF006100" },
          };
        } else if (resultado === "rechazado") {
          cellResultado.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" },
          };
          cellResultado.font = {
            name: "Calibri",
            size: 11,
            bold: true,
            color: { argb: "FF9C0006" },
          };
        }
      });

      // ==========================================================
      // 3. Formato de valores numéricos generales
      // ==========================================================
      worksheet.getColumn("valor_recaudado").numFmt = '"$"#,##0.00';

      // ==========================================================
      // 4. Alineación general y BORDES NEGROS
      // ==========================================================
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell) => {
          // Alineación
          if (rowNumber > 1) {
            cell.alignment = {
              vertical: "middle",
              horizontal: typeof cell.value === "number" ? "right" : "left",
            };
          }

          // 👇 APLICAR BORDE NEGRO A TODAS LAS CELDAS
          cell.border = {
            top: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } },
          };
        });
      });

      // ==========================================================
      // 5. Generar archivo y descargar
      // ==========================================================
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fromFormatted = format(startDate, "yyyy-MM-dd");
      const toFormatted = format(endDate, "yyyy-MM-dd");
      const fileName = `Reporte_AUTOBIG_${fromFormatted}_a_${toFormatted}.xlsx`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    },

    onError: (error) => {
      console.error("Error al exportar el reporte AUTOBIG:", error);
    },
  });

  const isButtonDisabled =
    !dateRange?.from || !dateRange?.to || !tenantId || exportMutation.isPending;

  const totalCountLabel =
    totalADescargar !== undefined && totalADescargar !== null
      ? ` (${totalADescargar})`
      : "";

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 gap-2 border-border text-xs font-medium shadow-sm hover:bg-muted"
      onClick={() => exportMutation.mutate()}
      disabled={isButtonDisabled}
    >
      {exportMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
      )}

      {exportMutation.isPending
        ? "Generando Excel..."
        : `Descargar Excel AUTOBIG${totalCountLabel}`}
    </Button>
  );
}