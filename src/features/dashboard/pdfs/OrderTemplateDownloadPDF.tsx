"use client";

import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { OrderTemplate } from "@/lib/dbFunctions/fetch_orders_templates";

// Importamos el documento
import { OrderTemplatePDF } from "./OrderTemplatePDF";

interface OrderTemplateDownloadPDFProps {
  data: OrderTemplate;
}

function OrderTemplateDownloadPDF({ data }: OrderTemplateDownloadPDFProps) {
  const [readyToDownload, setReadyToDownload] = useState(false);

  // Estado inicial: Botón para preparar la descarga
  if (!readyToDownload) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
        onClick={() => setReadyToDownload(true)}
        title="Preparar descarga"
      >
        <FileDown className="h-4 w-4" />
      </Button>
    );
  }
  

  return (
    <PDFDownloadLink
      document={<OrderTemplatePDF data={data} />}
      fileName={`orden-${data.id || "sin-nombre"}.pdf`}
    >
      {({ loading, error }) => {
        if (error) {
          return (
            <span className="text-[10px] text-red-500 font-medium px-2">
              Error
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
              // Resetear el estado después de un breve delay para que el botón vuelva a "Preparar"
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
  );
}

export default dynamic(() => Promise.resolve(OrderTemplateDownloadPDF), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" size="icon" disabled className="h-8 w-8">
      <Loader2 className="h-3 w-3 animate-spin text-slate-300" />
    </Button>
  ),
});