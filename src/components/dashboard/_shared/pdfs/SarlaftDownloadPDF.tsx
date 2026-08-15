"use client";

import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// Importamos el documento PDF y el hook SARLAFT
import SarlaftPDF from "./SarlaftPDF";
import { useFetchSarlaftEvidence } from "@/lib/client-actions/fetch_sarlaft_evidence_by_entry_order_id";


interface SarlaftDownloadPDFProps {
  orderId?: string;
}

function SarlaftDownloadPDF({
  orderId,
}: SarlaftDownloadPDFProps) {
  const [readyToDownload, setReadyToDownload] = useState(false);

  const {
    data: sarlaftEvidence,
    isLoading,
    error,
  } = useFetchSarlaftEvidence({
    orderId,
    readyToProcess: readyToDownload,
  });

  // ============================================================
  // BOTÓN INICIAL
  // ============================================================

  if (!readyToDownload) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 border-border text-foreground hover:bg-muted"
        onClick={() => setReadyToDownload(true)}
      >
        <span>Cargar descarga evidencia Sarlaft</span>
      </Button>
    );
  }

  // ============================================================
  // NOMBRE DEL ARCHIVO
  // ============================================================

  const getFileName = () => {
    const customerEvidence = sarlaftEvidence?.find(
      (item) => item.person_type === "customer",
    );

    const placa = customerEvidence?.placa_snapshot
      ? `_${customerEvidence.placa_snapshot}`
      : "";

    const fecha = customerEvidence?.created_at
      ? `_${new Date(customerEvidence.created_at)
          .toISOString()
          .split("T")[0]}`
      : "";

    return `Evidencia_SARLAFT${placa}${fecha}.pdf`.replace(
      /\s+/g,
      "_",
    );
  };

  // ============================================================
  // ESTADOS DE CARGA / ERROR
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

          <span className="text-xs font-medium">
            Procesando...
          </span>
        </Button>
      )}

      {error && (
        <span className="text-[10px] text-destructive font-medium px-2">
          Error al cargar datos SARLAFT
        </span>
      )}

      {/* ========================================================
          PDF
          ======================================================== */}

      {!isLoading &&
        sarlaftEvidence &&
        sarlaftEvidence.length > 0 && (
          <PDFDownloadLink
            document={
              <SarlaftPDF
                evidenceData={sarlaftEvidence}
              />
            }
            fileName={getFileName()}
          >
            {({ loading, error: pdfError }) => {
              // ------------------------------------------------
              // ERROR GENERANDO PDF
              // ------------------------------------------------

              if (pdfError) {
                return (
                  <span className="text-[10px] text-destructive font-medium px-2">
                    Error PDF
                  </span>
                );
              }

              // ------------------------------------------------
              // GENERANDO PDF
              // ------------------------------------------------

              if (loading) {
                return (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-8 gap-2 text-muted-foreground px-2"
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />

                    <span className="text-[10px] font-medium">
                      Generando...
                    </span>
                  </Button>
                );
              }

              // ------------------------------------------------
              // DESCARGA LISTA
              // ------------------------------------------------

              return (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 text-foreground hover:bg-muted px-2 border border-border shadow-xs"
                  title="Descargar evidencia SARLAFT"
                  onClick={() => {
                    setTimeout(
                      () => setReadyToDownload(false),
                      2000,
                    );
                  }}
                >
                  <Download className="h-4 w-4 text-muted-foreground" />

                  <span className="text-xs font-medium">
                    Descargar
                  </span>
                </Button>
              );
            }}
          </PDFDownloadLink>
        )}
    </>
  );
}

// ============================================================
// EXPORT DINÁMICO
// ============================================================

export default dynamic(
  () => Promise.resolve(SarlaftDownloadPDF),
  {
    ssr: false,
    loading: () => (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="h-8 w-8"
      >
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50" />
      </Button>
    ),
  },
);