"use client";

import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { OrderTemplate as OrderTemplateType } from "@/lib/server-actions/fetch_orders_templates";

// Importamos el documento y el hook
import OrderPDF from "./OrderPDF";
import { useFetchEntryOrder } from "@/lib/client-actions/fetch_entry_order_by_id";

interface OrderDownloadPDFProps {
  orderId?: string | undefined;
  tenantId?: string | undefined;
  templateData?: OrderTemplateType; // ADAPTADO: Recibe la plantilla opcional
}

function OrderDownloadPDF({ orderId, tenantId, templateData }: OrderDownloadPDFProps) {
  const [readyToDownload, setReadyToDownload] = useState(false);

  const { data: orderData, isLoading, error } = useFetchEntryOrder({
    orderId,
    tenantId,
    readyToProcess: readyToDownload
  });

  // El botón inicial "Preparar PDF"
  if (!readyToDownload) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        onClick={() => setReadyToDownload(true)}
      >
        <span>Preparar descarga</span>
      </Button>
    );
  }

  // Fallback dinámico para construir el nombre del archivo de forma limpia y segura sin romper si es una plantilla
  const getFileName = () => {
    const nombrePlantilla = orderData?.plantilla_nombre || templateData?.template_name || "Orden_de_Ingreso";
    const placa = orderData?.vehiculo_placa ? `_${orderData.vehiculo_placa}` : "";
    const fecha = orderData?.fecha ? `_${new Date(orderData.fecha).toISOString().split('T')[0]}` : "";
    
    return `${nombrePlantilla}${placa}${fecha}.pdf`.replace(/\s+/g, "_");
  };

  return (
    <>
      {isLoading && (
        <Button variant="ghost" size="sm" disabled className="h-8 gap-2 text-slate-400 px-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-xs font-medium">Procesando...</span>
        </Button>
      )}

      {error && (
        <span className="text-[10px] text-red-500 font-medium px-2">
          Error al cargar datos
        </span>
      )}

      {/* ADAPTADO: Evaluamos y agrupamos con paréntesis para blindar el objeto templateData */}
      {!isLoading && (orderData || templateData) && (
        <PDFDownloadLink
          document={
            <OrderPDF 
              orderData={orderData ?? undefined} 
              templateData={templateData} 
            />
          }
          fileName={getFileName()}
        >
          {({ loading, error: pdfError }) => {
            if (pdfError) {
              return (
                <span className="text-[10px] text-red-500 font-medium px-2">
                  Error PDF
                </span>
              );
            }

            if (loading) {
              return (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="h-8 gap-2 text-slate-400 px-2"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-[10px] font-medium">Generando...</span>
                </Button>
              );
            }

            return (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 border border-emerald-100 shadow-sm"
                onClick={() => {
                  // Resetear el estado después de un breve delay para que el botón vuelva a "Preparar descarga"
                  setTimeout(() => setReadyToDownload(false), 2000);
                }}
                title="Descargar ahora"
              >
                <Download className="h-4 w-4" />
                <span className="text-xs font-medium">Descargar</span>
              </Button>
            );
          }}
        </PDFDownloadLink>
      )}
    </>
  );
}

export default dynamic(() => Promise.resolve(OrderDownloadPDF), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" size="icon" disabled className="h-8 w-8">
      <Loader2 className="h-3 w-3 animate-spin text-slate-300" />
    </Button>
  ),
});