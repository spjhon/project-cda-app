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
}

export function replaceRTMWithCertificacion<
  T extends { tipo_inspeccion: string | null },
>(data: T[]): T[] {
  return data.map((item) => {
    // Si tipo_inspeccion es exactamente "RTM", lo cambiamos.
    // Si no, lo dejamos tal cual.
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
  // ============================================================
  // Contexto
  // ============================================================

  const context = useContext(EntryOrdersContext);

  const permissionscontextRecived = useContext(PermissionsContext);

  const tenantId =
    permissionscontextRecived?.PermissionsContextValue.tenantObject?.id;

  const dateRange = context?.entryOrdersTableData?.query?.dateRange;

  const totalADescargar =
    context?.entryOrdersTableData?.query?.entryOrdersQuery.data?.[0]
      ?.total_count;

  // ============================================================
  // Mutation de exportación
  // ============================================================

  const exportMutation = useMutation({
    mutationFn: async () => {
      // ----------------------------------------------------------
      // Validar información necesaria
      // ----------------------------------------------------------

      if (!tenantId) {
        throw new Error("No se encontró el CDA seleccionado.");
      }

      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("El rango de fechas no está definido.");
      }

      const startDate = startOfDay(new Date(dateRange.from));

      const endDate = endOfDay(new Date(dateRange.to));

      // ----------------------------------------------------------
      // Obtener registros desde Supabase
      // ----------------------------------------------------------

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
        throw new Error(
          error.message || "Error al obtener los registros del reporte.",
        );
      }

      if (!orders || orders.length === 0) {
        throw new Error(
          "No hay registros para exportar en el rango seleccionado.",
        );
      }

      const ordersParaExcel = replaceRTMWithCertificacion(orders);

      // ==========================================================
      // Crear libro de Excel
      // ==========================================================

      const workbook = new Workbook();

      const worksheet = workbook.addWorksheet("Reporte AUTOBIG");

      // ----------------------------------------------------------
      // Definir columnas
      // ----------------------------------------------------------

      worksheet.columns = [
        {
          header: "FECHA",
          key: "fecha",
          width: 16,
        },
        {
          header: "#",
          key: "numero",
          width: 8,
        },
        {
          header: "FUR",
          key: "consecutivo_fur",
          width: 16,
        },
        {
          header: "PLACA",
          key: "placa",
          width: 14,
        },
        {
          header: "PIN",
          key: "pin",
          width: 14,
        },
        {
          header: "TIPO DE VEHÍCULO",
          key: "vehiculo_tipo",
          width: 20,
        },
        {
          header: "TIPO DE INSPECCION",
          key: "tipo_inspeccion",
          width: 22,
        },
        {
          header: "SERVICIO",
          key: "servicio",
          width: 18,
        },
        {
          header: "METODOS DE PAGO",
          key: "forma_pago",
          width: 18,
        },
        {
          header: "EMPRESA",
          key: "empresa",
          width: 25,
        },
        {
          header: "VALOR RECAUDADO",
          key: "valor_recaudado",
          width: 20,
        },
        {
          header: "NUMERO CERTIFICADO RUNT",
          key: "certificado_runt",
          width: 25,
        },
        {
          header: "FUPAS RESTANTES",
          key: "fupas_restantes",
          width: 18,
        },
        {
          header: "RESULTADO INSPECCION",
          key: "resultado_inspeccion",
          width: 24,
        },
        {
          header: "CERTIFICADOS RESTANTES",
          key: "certificados_restantes",
          width: 25,
        },
        {
          header: "NUMERO LATERAL",
          key: "numero_lateral",
          width: 18,
        },
      ];

      // ==========================================================
      // Formato de encabezados
      // ==========================================================

      const headerRow = worksheet.getRow(1);

      headerRow.font = {
        bold: true,
      };

      headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      headerRow.height = 25;

      // ==========================================================
      // Poblar datos
      // ==========================================================

      (ordersParaExcel as AutobigReportRow[]).forEach((row) => {
        worksheet.addRow({
          // ------------------------------------------------------
          // Datos provenientes de la RPC
          // ------------------------------------------------------

          fecha: row.fecha ? format(new Date(row.fecha), "dd/MM/yyyy") : "",

          consecutivo_fur: row.consecutivo_fur ?? "",

          placa: row.placa ?? "",

          pin: row.pin ?? "",

          vehiculo_tipo: row.vehiculo_tipo ?? "",

          tipo_inspeccion: row.tipo_inspeccion ?? "",

          servicio: row.servicio ?? "",

          // Monto recaudado
          valor_recaudado:
            row.valor_recaudado !== null && row.valor_recaudado !== undefined
              ? Number(row.valor_recaudado)
              : null,

          certificado_runt: row.certificado_runt ?? "",

          resultado_inspeccion: row.resultado_inspeccion ?? "",

          // ------------------------------------------------------
          // Campos que quedan vacíos por ahora
          // ------------------------------------------------------

          numero: "",

          forma_pago: row.metodos_pago?.join(", ") ?? "",

          fupas_restantes: "",

          certificados_restantes: "",
          empresa: row.empresa ?? "",

          numero_lateral: "",
        });
      });

      // ==========================================================
      // Estilos por columna
      // ==========================================================

      // FECHA
      worksheet.getColumn("fecha").font = {
        name: "Calibri",
        size: 14,
        bold: true,
      };

      worksheet.getColumn("placa").eachCell((cell, rowNumber) => {
        if (rowNumber > 1) {
          cell.font = {
            name: "Calibri",
            size: 11,
            bold: true,
            color: { argb: "FFFF0000" }, // Rojo
          };
        }
      });

      worksheet.getColumn("tipo_inspeccion").eachCell((cell, rowNumber) => {
        if (rowNumber > 1) {
          const tipoInspeccion = String(cell.value ?? "").toLowerCase();

          if (tipoInspeccion.includes("preventiva")) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF4B183" },
            };
          }

          if (
            tipoInspeccion.includes("reinspeccion") ||
            tipoInspeccion.includes("reinspección")
          ) {
            cell.font = {
              name: "Calibri",
              size: 11,
              bold: true,
              color: { argb: "FFFF0000" },
            };
          }
        }
      });

      worksheet.getColumn("servicio").eachCell((cell, rowNumber) => {
        if (rowNumber > 1) {
          const servicio = String(cell.value ?? "")
            .toLowerCase()
            .trim();

          if (servicio === "particular") {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF4B183" },
            };
          }
        }
      });

      // ==========================================================
      // Formato de valores numéricos
      // ==========================================================

      worksheet.getColumn("valor_recaudado").numFmt = '"$"#,##0.00';

      // ==========================================================
      // Alineación de datos
      // ==========================================================

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.alignment = {
            vertical: "middle",
          };
        }
      });

      // ==========================================================
      // Generar archivo
      // ==========================================================

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // ----------------------------------------------------------
      // Nombre del archivo
      // ----------------------------------------------------------

      const fromFormatted = format(startDate, "yyyy-MM-dd");

      const toFormatted = format(endDate, "yyyy-MM-dd");

      const fileName = `Reporte_AUTOBIG_${fromFormatted}_a_${toFormatted}.xlsx`;

      // ----------------------------------------------------------
      // Descargar
      // ----------------------------------------------------------

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = downloadUrl;

      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    },

    // ============================================================
    // Error
    // ============================================================

    onError: (error) => {
      console.error("Error al exportar el reporte AUTOBIG:", error);
    },
  });

  // ============================================================
  // Estado del botón
  // ============================================================

  const isButtonDisabled =
    !dateRange?.from || !dateRange?.to || !tenantId || exportMutation.isPending;

  const totalCountLabel =
    totalADescargar !== undefined && totalADescargar !== null
      ? ` (${totalADescargar})`
      : "";

  // ============================================================
  // Render
  // ============================================================

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
