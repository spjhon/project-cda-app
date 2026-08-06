"react-bootstrap";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryOrderListItem, TirePressureDetail } from "@/lib/server-actions/fetch_entry_orders_list";


interface DownloadExcelButtonProps {
  data: EntryOrderListItem[];
  disabled?: boolean;
}

export const DownloadExcelButton: React.FC<DownloadExcelButtonProps> = ({
  data,
  disabled = false,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Helper para formatear presiones de llantas JSONB en un String entendible
  const formatTirePressures = (pressures: TirePressureDetail[]): string => {
    if (!pressures || pressures.length === 0) return "N/A";
    return pressures
      .map((p) => {
        const enc = p.presion_encontrada !== null ? `${p.presion_encontrada} PSI` : "N/R";
        const aju = p.presion_ajustada !== null ? `${p.presion_ajustada} PSI` : "N/R";
        return `Eje ${p.eje} (${p.posicion}): Enc=${enc}, Ajus=${aju}`;
      })
      .join(" | ");
  };

  // Helper para formatear fechas ISO
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handleExportExcel = () => {
    if (!data || data.length === 0) return;

    setIsExporting(true);

    try {
      // 1. Transformar y aplanar los datos para las filas de Excel
      const formattedRows = data.map((item) => ({
        "Fecha Registro": formatDate(item.fecha),
        Placa: item.placa?.toUpperCase() || "",
        Marca: item.marca || "",
        Línea: item.linea || "",
        "Tipo Vehículo": item.vehiculo_tipo_snapshot || "",
        Servicio: item.vehiculo_tipo_servicio_snapshot || "",
        "Tipo de Servicio": item.service_type || "",
        "Estado Orden": item.estado_orden?.toUpperCase() || "",
        "Es Reinspección": item.es_reinspeccion ? "SÍ" : "NO",
        "¿Gestión SOAT en CDA?": item.se_compro_soat ? "SÍ" : "NO",
        "Resultado Revisión": item.resultado_revision || "PENDIENTE",

        // Datos del Propietario
        "Propietario Nombre": item.propietario_nombre || "",
        "Propietario Tipo Doc": item.propietario_tipo_documento || "",
        "Propietario Doc": item.propietario_documento || "",
        "Propietario Teléfono": item.propietario_telefono || "",
        "Propietario Email": item.propietario_email || "",
        "Propietario Dirección": item.propietario_direccion || "",

        // Datos del Cliente
        "Cliente Nombre": item.cliente_nombre || "",
        "Cliente Tipo Doc": item.cliente_tipo_documento || "",
        "Cliente Doc": item.cliente_documento || "",
        "Cliente Teléfono": item.cliente_telefono || "",
        "Cliente Email": item.cliente_email || "",
        "Cliente Dirección": item.cliente_direccion || "",

        // Datos Operativos
        Kilometraje: item.kilometraje || "",
        "Vencimiento SOAT": formatDate(item.soat_vencimiento_snapshot),
        "Consecutivo FUR": item.consecutivo_fur || "",
        "Consecutivo RTM": item.consecutivo_rtm || "",
        "Presión de Llantas": formatTirePressures(item.presiones_llantas),

        // Información de Oficina / Pago
        "PIN Oficina": item.oficina_pin || "",
        "Valor Pago": item.oficina_pago ?? 0,
        "Consecutivo Factura": item.oficina_consecutivo_factura || "",
        "Medio de Pago": item.oficina_tipo_pago ? item.oficina_tipo_pago.toUpperCase() : "",
        "Nº Aprobación": item.oficina_num_aprobacion || "",
      }));

      // 2. Crear Worksheet
      const worksheet = XLSX.utils.json_to_sheet(formattedRows);

      // 3. Auto-ajustar ancho de las columnas dinámicamente
      const colWidths = Object.keys(formattedRows[0] || {}).map((key) => {
        const maxContentLength = Math.max(
          key.length,
          ...formattedRows.map((row) => String((row as Record<string, unknown>)[key] || "").length)
        );
        return { wch: Math.min(Math.max(maxContentLength + 3, 12), 50) };
      });
      worksheet["!cols"] = colWidths;

      // 4. Crear Workbook y guardar archivo
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ordenes_Entrada");

      const today = new Date().toISOString().split("T")[0];
      const filename = `Ordenes_Entrada_${today}.xlsx`;

      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Error exportando a Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExportExcel}
      disabled={disabled || isExporting || !data.length}
      className="gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40 transition-colors shadow-sm"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      )}
      <span>Exportar Excel ({data.length})</span>
    </Button>
  );
};