"use client";

import { useState } from "react";
import { BlobProvider } from "@react-pdf/renderer";
import { Eye, Loader2, } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import {  OrderTemplate as OrderTemplateType } from "@/lib/server-actions/fetch_orders_templates";

// Importamos el documento
import OrderPDF from "./OrderPDF";
import { useFetchEntryOrder } from "@/lib/client-actions/fetch_entry_order_by_id";

interface OrderViewPDFProps {
  orderId?: string | undefined;
  tenantId?: string | undefined;
  templateData?: OrderTemplateType;
  
}





function OrderViewPDF({ orderId, tenantId, templateData }: OrderViewPDFProps) {
  const [readyToProcess, setReadyToProcess] = useState(false);

  // 2. REEMPLAZAS TODO TU ANTERIOR USEQUERY POR ESTA LÍNEA:
  const { data: orderData, isLoading, error } = useFetchEntryOrder({
    orderId,
    tenantId,
    readyToProcess
  });

  // El botón inicial "Preparar PDF"
  if (!readyToProcess) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        onClick={() => setReadyToProcess(true)}
      >
        <span>Preparar documento</span>
      </Button>
    );
  }



  

  // Renderizado final con los spinners ordenados (como lo organizamos antes)
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
        Error al cargar datos.
      </span>
    )}

    {/* CORREGIDO: Evaluamos limpiamente y agrupamos con paréntesis para proteger el objeto */}
    {!isLoading && (orderData || templateData) && (
      <BlobProvider 
        document={
          <OrderPDF 
            orderData={orderData ?? undefined} 
            templateData={templateData}
          />
        }
       >
        {({ url, loading, error: pdfError }) => {
          if (pdfError) {
            return <span className="text-[10px] text-red-500 font-medium px-2">Error PDF</span>;
          }

          if (loading) { 
            return (
              <Button variant="ghost" size="sm" disabled className="h-8 gap-2 text-slate-400 px-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs font-medium">Procesando...</span>
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
                  setReadyToProcess(false);
                }
              }}
            >
              <Eye className="h-4 w-4" />
              <span className="text-xs font-medium">Ver PDF</span>
            </Button>
          );
        }}
      </BlobProvider>
    )}

     
  </>
);
}

export default dynamic(() => Promise.resolve(OrderViewPDF), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" size="sm" disabled className="h-8 gap-2 text-slate-400 px-2">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span className="text-xs font-medium">Cargando visor...</span>
    </Button>
  )
});