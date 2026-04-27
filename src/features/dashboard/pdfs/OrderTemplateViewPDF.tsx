"use client";

import { useState } from "react";
import { BlobProvider } from "@react-pdf/renderer";
import { Eye, Loader2, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { OrderTemplate } from "@/lib/dbFunctions/fetch_orders_templates";

// Importamos el documento (Asumo que lo tienes en el mismo directorio o ajusta la ruta)
import { OrderTemplatePDF } from "./OrderTemplatePDF";

interface OrderTemplateViewPDFProps {
  data: OrderTemplate;
}

function OrderTemplateViewPDF({ data }: OrderTemplateViewPDFProps) {
  const [readyToProcess, setReadyToProcess] = useState(false);

  
  // Si no se ha solicitado procesar, mostramos el botón de "Preparar"
  if (!readyToProcess) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-2"
        onClick={() => setReadyToProcess(true)}
        title="Preparar documento para visualizar"
      >
        <FileType className="h-4 w-4" />
        <span className="text-xs font-medium">Preparar vista PDF</span>
      </Button>
    );
  }

  // Una vez solicitado, BlobProvider toma el control
  return (
    <BlobProvider document={<OrderTemplatePDF data={data} />}>
      {({ url, loading, error }) => {
        if (error) {
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
              <span className="text-xs font-medium">Cocinando...</span>
            </Button>
          );
        }

        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 shadow-sm border border-indigo-100"
            onClick={() => {
              if (url) {
                window.open(url, "_blank");
                setReadyToProcess(false); // Reset para que vuelva a "Preparar" si se cierra
              }
            }}
            title="Ver PDF ahora"
          >
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium">Ver PDF</span>
          </Button>
        );
      }}
    </BlobProvider>
  );
}

// Exportación dinámica para evitar errores de SSR en Next.js
export default dynamic(() => Promise.resolve(OrderTemplateViewPDF), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" size="sm" disabled className="h-8 w-24">
      <Loader2 className="h-3 w-3 animate-spin" />
    </Button>
  ),
});