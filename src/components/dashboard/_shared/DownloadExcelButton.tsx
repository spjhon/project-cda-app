
"use client";

import { useContext } from "react";

import { endOfDay, format, startOfDay } from "date-fns";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Workbook } from "exceljs";

import { Button } from "@/components/ui/button";
import { EntryOrdersContext } from "@/contexts/EntryOrdersContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ExportExcelButton() {
  // ============================================================
  // Contexto
  // ============================================================

  const context = useContext(EntryOrdersContext);

  const dateRange =
    context?.entryOrdersTableData?.query?.dateRange;

  const totalADescargar =
    context?.entryOrdersTableData?.query?.entryOrdersQuery.data?.[0]
      ?.total_count;

  // ============================================================
  // Mutation de exportación
  // ============================================================

  const exportMutation = useMutation({
    mutationFn: async () => {
      // ----------------------------------------------------------
      // Validar rango de fechas
      // ----------------------------------------------------------

      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("El rango de fechas no está definido");
      }

      const startDate = startOfDay(new Date(dateRange.from));
      const endDate = endOfDay(new Date(dateRange.to));

      // ----------------------------------------------------------
      // Obtener órdenes desde Supabase
      // ----------------------------------------------------------

      const supabaseBrowser = createSupabaseBrowserClient();

      const { data: orders, error } = await supabaseBrowser.rpc(
        "get_entry_orders_for_export",
        {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString(),
        },
      );

      if (error) {
        throw new Error(
          error.message || "Error al obtener las órdenes de entrada",
        );
      }

      if (!orders || orders.length === 0) {
        throw new Error(
          "No hay registros para exportar en el rango seleccionado",
        );
      }

      // ==========================================================
      // Crear libro de Excel
      // ==========================================================

      const workbook = new Workbook();

      const worksheet = workbook.addWorksheet("Órdenes de Entrada");

      // ----------------------------------------------------------
      // Definir columnas
      // ----------------------------------------------------------

      worksheet.columns = [
        // Vehículo
        {
          header: "Consecutivo",
          key: "consecutivo",
          width: 12,
        },
        {
          header: "Fecha",
          key: "fecha",
          width: 20,
        },
        {
          header: "Placa",
          key: "placa",
          width: 12,
        },
        {
          header: "Marca",
          key: "marca",
          width: 15,
        },
        {
          header: "Línea",
          key: "linea",
          width: 15,
        },
        {
          header: "Modelo",
          key: "modelo",
          width: 10,
        },
        {
          header: "Cilindraje",
          key: "cilindraje",
          width: 12,
        },

        // Propietario
        {
          header: "Propietario Nombre",
          key: "propietario_nombre",
          width: 25,
        },
        {
          header: "Propietario Tipo Doc",
          key: "propietario_tipo_documento",
          width: 15,
        },
        {
          header: "Propietario Doc",
          key: "propietario_documento",
          width: 18,
        },
        {
          header: "Propietario Teléfono",
          key: "propietario_telefono",
          width: 15,
        },
        {
          header: "Propietario Email",
          key: "propietario_email",
          width: 22,
        },
        {
          header: "Propietario Dirección",
          key: "propietario_direccion",
          width: 22,
        },

        // Cliente
        {
          header: "Cliente Nombre",
          key: "cliente_nombre",
          width: 25,
        },
        {
          header: "Cliente Tipo Doc",
          key: "cliente_tipo_documento",
          width: 15,
        },
        {
          header: "Cliente Doc",
          key: "cliente_documento",
          width: 18,
        },
        {
          header: "Cliente Teléfono",
          key: "cliente_telefono",
          width: 15,
        },
        {
          header: "Cliente Email",
          key: "cliente_email",
          width: 22,
        },
        {
          header: "Cliente Dirección",
          key: "cliente_direccion",
          width: 22,
        },

        // Operativos
        {
          header: "Tipo Servicio",
          key: "service_type",
          width: 15,
        },
        {
          header: "Reinspección",
          key: "es_reinspeccion",
          width: 14,
        },
        {
          header: "Kilometraje",
          key: "kilometraje",
          width: 14,
        },
        {
          header: "Vencimiento SOAT",
          key: "soat_vencimiento_snapshot",
          width: 18,
        },
        {
          header: "Tipo Vehículo",
          key: "vehiculo_tipo_snapshot",
          width: 18,
        },
        {
          header: "Servicio Vehículo",
          key: "vehiculo_tipo_servicio_snapshot",
          width: 20,
        },
        {
          header: "Estado Orden",
          key: "estado_orden",
          width: 15,
        },

        // Oficina / pago
        {
          header: "PIN Oficina",
          key: "oficina_pin",
          width: 15,
        },
        {
          header: "Factura",
          key: "oficina_consecutivo_factura",
          width: 18,
        },
        {
          header: "Precio Servicio",
          key: "rate_price_snapshot",
          width: 16,
        },
        {
          header: "Compró SOAT",
          key: "se_compro_soat",
          width: 14,
        },
        {
          header: "Resultado",
          key: "resultado_revision",
          width: 18,
        },

        // ISO 17020 / cierre
        {
          header: "FUR",
          key: "consecutivo_fur",
          width: 15,
        },
        {
          header: "RTM",
          key: "consecutivo_rtm",
          width: 15,
        },
      ];

      // ----------------------------------------------------------
      // Formato de encabezado
      // ----------------------------------------------------------

      worksheet.getRow(1).font = {
        bold: true,
      };

      // ==========================================================
      // Poblar datos
      // ==========================================================

      orders.forEach((row) => {
        worksheet.addRow({
          ...row,

          fecha: row.fecha
            ? format(new Date(row.fecha), "dd/MM/yyyy HH:mm")
            : "",

          es_reinspeccion: row.es_reinspeccion ? "SÍ" : "NO",

          se_compro_soat: row.se_compro_soat ? "SÍ" : "NO",

          rate_price_snapshot:
            row.rate_price_snapshot !== null &&
            row.rate_price_snapshot !== undefined
              ? Number(row.rate_price_snapshot)
              : null,
        });
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

      const fileName = `Ordenes_Entrada_${fromFormatted}_a_${toFormatted}.xlsx`;

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
      console.error("Error al exportar a Excel:", error);
    },
  });

  // ============================================================
  // Estado del botón
  // ============================================================

  const isButtonDisabled =
    !dateRange?.from ||
    !dateRange?.to ||
    exportMutation.isPending;

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
        : `Exportar Excel${totalCountLabel}`}
    </Button>
  );
}
