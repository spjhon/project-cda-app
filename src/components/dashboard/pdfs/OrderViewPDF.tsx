"use client";

import { useState } from "react";
import { BlobProvider } from "@react-pdf/renderer";
import { Eye, Loader2, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Importamos el documento
import OrderPDF from "./OrderPDF";

interface OrderViewPDFProps {
  orderId: string | undefined;
  logoURL: string | undefined;
  tenantId: string | undefined;
}

function OrderViewPDF({ orderId, logoURL, tenantId }: OrderViewPDFProps) {



  const [readyToProcess, setReadyToProcess] = useState(false);







  // ==========================================
  // FETCH DE DATOS DE LA ORDEN CON TANSTACK QUERY
  // ==========================================
  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.rpc('fetch_entry_order_by_id', {
        p_order_id: orderId,
        p_tenant_id: tenantId
      });
      
      if (error) {
        console.error('Error en RPC:', error);
        throw error;
      }
      
      console.log('📦 Datos de la orden obtenidos:', data);
      
      const order = data?.[0];
      return order;
    },
    // 🔥 CAMBIO CLAVE: Solo se activa si hay orderId Y además readyToProcess es true
    enabled: !!orderId && readyToProcess, 
    retry: 1,
  });


  

  // Mostrar loading mientras carga
  if (isLoading) {
    console.log('⏳ Cargando datos de la orden...');
  }

  // Mostrar error si falló
  if (error) {
    console.error('❌ Error al cargar la orden:', error);
  }

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









  // Una vez solicitado, evaluamos si el Query está cargando antes de renderizar el BlobProvider
  // NOTA: Si necesitas pasar orderData a <OrderPDF />, deberías hacerlo aquí: <OrderPDF data={orderData} />
  return (
    <BlobProvider document={<OrderPDF logoURL={logoURL} orderData={orderData} />}>
      {({ url, loading, error: pdfError }) => {
        if (error || pdfError) {
          return (
            <span className="text-[10px] text-red-500 font-medium px-2">
              Error PDF
            </span>
          );
        }

        // Mostramos el spinner si TanStack Query está trayendo los datos O si react-pdf está construyendo el Blob
        if (isLoading || loading) {
          return (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="h-8 gap-2 text-slate-400 px-2"
            >
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
                setReadyToProcess(false); // Reset para que vuelva a "Preparar"
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
export default dynamic(() => Promise.resolve(OrderViewPDF), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" size="sm" disabled className="h-8 w-24">
      <Loader2 className="h-3 w-3 animate-spin" />
    </Button>
  ),
});