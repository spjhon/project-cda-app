"use client";

import { useState } from "react";
import { BlobProvider } from "@react-pdf/renderer";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useFetchSarlaftEvidence } from "@/lib/client-actions/fetch_sarlaft_evidence_by_entry_order_id";
import SarlaftPDF from "./SarlaftPDF";




interface OrderViewPDFProps {
  orderId?: string;
}

function SarlaftViewPDF({ orderId }: OrderViewPDFProps) {
  const [readyToProcess, setReadyToProcess] = useState(false);



  const { data: orderData, isLoading, error} = useFetchSarlaftEvidence({
    orderId,
    readyToProcess,
  });


 



  // ============================================================
  // BOTÓN INICIAL
  // ============================================================

  if (!readyToProcess) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 border-border text-foreground hover:bg-muted"
        onClick={() => setReadyToProcess(true)}
      >
        <span>Cargar Evidencia Sarlaft</span>
      </Button>
    );
  }

  // ============================================================
  // PROCESAMIENTO
  // ============================================================

  return (
    <>
      {isLoading && (
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-8 gap-2 text-muted-foreground px-2"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-xs font-medium">Procesando...</span>
        </Button>
      )}

      {error && (
        <span className="text-[10px] text-destructive font-medium px-2">
          Error al cargar datos.
        </span>
      )}

      {!isLoading && orderData && (
        <BlobProvider
          document={<SarlaftPDF evidenceData={orderData} />}
        >
          {({ url, loading, error: pdfError }) => {
            if (pdfError) {
              return (
                <span className="text-[10px] text-destructive font-medium px-2">
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
                  className="h-8 gap-2 text-muted-foreground px-2"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs font-medium">
                    Procesando...
                  </span>
                </Button>
              );
            }

            return (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-foreground hover:bg-muted px-2 shadow-xs border border-border"
                onClick={() => {
                  if (url) {
                    window.open(url, "_blank");
                    setReadyToProcess(false);
                  }
                }}
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Ver evidencia Sarlaft PDF</span>
              </Button>
            );
          }}
        </BlobProvider>
      )}
    </>
  );
}

export default dynamic(() => Promise.resolve(SarlaftViewPDF), {
  ssr: false,
  loading: () => (
    <Button
      variant="ghost"
      size="sm"
      disabled
      className="h-8 gap-2 text-muted-foreground px-2"
    >
      <Loader2 className="h-3 w-3 animate-spin" />
      <span className="text-xs font-medium">Cargando visor...</span>
    </Button>
  ),
});