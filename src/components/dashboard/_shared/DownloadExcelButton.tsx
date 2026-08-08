"use client";

import { useContext } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { Workbook } from "exceljs";

import { Button } from "@/components/ui/button";
import { EntryOrdersContext } from "@/contexts/EntryOrdersContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ExportExcelButton() {
  const context = useContext(EntryOrdersContext);
  const dateRange = context?.entryOrdersTableData?.query?.dateRange;
  const totalAdescargar = context?.entryOrdersTableData?.query?.entryOrdersData?.[0]?.total_count;

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("El rango de fechas no está definido");
      }

      const startDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.to);

      if (format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd")) {
        endDate.setHours(23, 59, 59, 999);
      }

      const supabaseBrowser = createSupabaseBrowserClient();

      const { data: orders, error } = await supabaseBrowser.rpc(
        "get_entry_orders_for_export",
        {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString(),
        }
      );

      if (error) {
        throw new Error(error.message || "Error al obtener las órdenes de entrada");
      }

      if (!orders || orders.length === 0) {
        throw new Error("No hay registros para exportar en el rango seleccionado");
      }

      // 1. Crear libro y hoja
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("Órdenes de Entrada");

      // 2. Definir columnas
      worksheet.columns = [
        { header: "Consecutivo", key: "consecutivo", width: 12 },
        { header: "Fecha", key: "fecha", width: 20 },
        { header: "Placa", key: "placa", width: 12 },
        { header: "Marca", key: "marca", width: 15 },
        { header: "Línea", key: "linea", width: 15 },
        { header: "Modelo", key: "modelo", width: 10 },
        { header: "Cilindraje", key: "cilindraje", width: 12 },

        // Propietario
        { header: "Propietario Nombre", key: "propietario_nombre", width: 25 },
        { header: "Propietario Tipo Doc", key: "propietario_tipo_documento", width: 15 },
        { header: "Propietario Doc", key: "propietario_documento", width: 18 },
        { header: "Propietario Teléfono", key: "propietario_telefono", width: 15 },
        { header: "Propietario Email", key: "propietario_email", width: 22 },
        { header: "Propietario Dirección", key: "propietario_direccion", width: 22 },

        // Cliente
        { header: "Cliente Nombre", key: "cliente_nombre", width: 25 },
        { header: "Cliente Tipo Doc", key: "cliente_tipo_documento", width: 15 },
        { header: "Cliente Doc", key: "cliente_documento", width: 18 },
        { header: "Cliente Teléfono", key: "cliente_telefono", width: 15 },
        { header: "Cliente Email", key: "cliente_email", width: 22 },
        { header: "Cliente Dirección", key: "cliente_direccion", width: 22 },

        // Operativos
        { header: "Tipo Servicio", key: "service_type", width: 15 },
        { header: "Reinspección", key: "es_reinspeccion", width: 14 },
        { header: "Kilometraje", key: "kilometraje", width: 14 },
        { header: "Vencimiento SOAT", key: "soat_vencimiento_snapshot", width: 16 },
        { header: "Tipo Vehículo", key: "vehiculo_tipo_snapshot", width: 18 },
        { header: "Servicio Vehículo", key: "vehiculo_tipo_servicio_snapshot", width: 18 },
        { header: "Estado Orden", key: "estado_orden", width: 15 },

        // Oficina
        { header: "PIN Oficina", key: "oficina_pin", width: 15 },
        { header: "Pago", key: "oficina_pago", width: 14 },
        { header: "Factura", key: "oficina_consecutivo_factura", width: 15 },
        { header: "Tipo Pago", key: "oficina_tipo_pago", width: 15 },
        { header: "Aprobación", key: "oficina_num_aprobacion", width: 15 },
        { header: "Compró SOAT", key: "se_compro_soat", width: 14 },
        { header: "Resultado", key: "resultado_revision", width: 18 },

        // ISO 17020
        { header: "FUR", key: "consecutivo_fur", width: 15 },
        { header: "RTM", key: "consecutivo_rtm", width: 15 },
      ];

      // Formato negrita para la primera fila
      worksheet.getRow(1).font = { bold: true };

      // 3. Poblar datos
      orders.forEach((row) => {
        worksheet.addRow({
          ...row,
          fecha: row.fecha ? format(new Date(row.fecha), "dd/MM/yyyy HH:mm") : "",
          es_reinspeccion: row.es_reinspeccion ? "SÍ" : "NO",
          se_compro_soat: row.se_compro_soat ? "SÍ" : "NO",
          oficina_pago: row.oficina_pago ? Number(row.oficina_pago) : 0,
        });
      });

      // 4. Descargar archivo binario
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fromFormatted = format(startDate, "yyyy-MM-dd");
      const toFormatted = format(endDate, "yyyy-MM-dd");
      const fileName = `Ordenes_Entrada_${fromFormatted}_a_${toFormatted}.xlsx`;

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
      console.error("Error al exportar a Excel:", error);
    },
  });

  const isButtonDisabled =
    !dateRange?.from || !dateRange?.to || exportMutation.isPending;

  const totalCountLabel =
    totalAdescargar !== undefined && totalAdescargar !== null
      ? ` (${totalAdescargar})`
      : "";

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 gap-2 text-xs font-medium border-border shadow-sm hover:bg-muted"
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