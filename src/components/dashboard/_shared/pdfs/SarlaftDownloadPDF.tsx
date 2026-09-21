"use client";

import { useEffect, useState } from "react";

import { PDFDownloadLink } from "@react-pdf/renderer";

import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import dynamic from "next/dynamic";

// Importamos el documento PDF y el hook SARLAFT
import SarlaftPDF from "./SarlaftPDF";

import {
  SarlaftEvidence,
  useFetchSarlaftEvidence,
} from "@/lib/client-actions/fetch_sarlaft_evidence_by_entry_order_id";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface SarlaftDownloadPDFProps {
  orderId?: string;
}

function SarlaftDownloadPDF({
  orderId,
}: SarlaftDownloadPDFProps) {
  const [readyToDownload, setReadyToDownload] =
    useState(false);

  const {
    data: sarlaftEvidence,
    isLoading,
    error,
  } = useFetchSarlaftEvidence({
    orderId,
    readyToProcess: readyToDownload,
  });

  // ============================================================
  // FIRMAS PREPARADAS PARA EL PDF
  // ============================================================

  const [preparedClienteSignature, setPreparedClienteSignature] =
    useState<
      SarlaftEvidence["cliente_firma_path"] | null
    >(null);

  const [
    preparedFuncionarioSignature,
    setPreparedFuncionarioSignature,
  ] = useState<
    SarlaftEvidence[
      "funcionario_firma_path"
    ] | null
  >(null);

  const [isPreparingSignatures, setIsPreparingSignatures] =
    useState(false);


console.log("firma del funcionario", sarlaftEvidence?.funcionario_firma_path)



  // ============================================================
  // PREPARAR FIRMAS DESDE STORAGE
  // ============================================================

  useEffect(() => {
    if (!sarlaftEvidence) {
      return;
    }

    let cancelled = false;

    const prepareSignatures = async () => {
      setIsPreparingSignatures(true);

      try {
        const supabaseBrowser =
          createSupabaseBrowserClient();

        // --------------------------------------------------
        // Función auxiliar para descargar una firma
        // y convertirla en Data URL
        // --------------------------------------------------

        const downloadSignatureAsDataUrl = async (
          path: string | null,
        ): Promise<string | null> => {
          if (!path) {
            return null;
          }

          const { data, error } =
            await supabaseBrowser.storage
              .from("signatures")
              .download(path);

          if (error || !data) {
            console.error(
              `No se pudo descargar la firma ${path}:`,
              error?.message,
            );

            return null;
          }

          return await new Promise<string>(
            (resolve, reject) => {
              const reader = new FileReader();

              reader.onloadend = () => {
                if (
                  typeof reader.result === "string"
                ) {
                  resolve(reader.result);
                } else {
                  reject(
                    new Error(
                      "No se pudo convertir la firma a Data URL.",
                    ),
                  );
                }
              };

              reader.onerror = () => {
                reject(
                  new Error(
                    "No se pudo leer la imagen de la firma.",
                  ),
                );
              };

              reader.readAsDataURL(data);
            },
          );
        };

        // ==================================================
        // 1. FIRMA DEL CLIENTE
        // ==================================================

        const clienteSignature =
          await downloadSignatureAsDataUrl(
            sarlaftEvidence.cliente_firma_path,
          );

        // ==================================================
        // 2. FIRMA DEL FUNCIONARIO / INSPECTOR
        // ==================================================

        const funcionarioSignature =
          await downloadSignatureAsDataUrl(
            sarlaftEvidence.funcionario_firma_path,
          );

        // ==================================================
        // GUARDAMOS LAS FIRMAS PREPARADAS
        // ==================================================

        if (!cancelled) {
          setPreparedClienteSignature(
            clienteSignature,
          );

          setPreparedFuncionarioSignature(
            funcionarioSignature,
          );
        }
      } catch (error) {
        console.error(
          "Error preparando las firmas para el PDF SARLAFT:",
          error,
        );

        if (!cancelled) {
          setPreparedClienteSignature(null);
          setPreparedFuncionarioSignature(null);
        }
      } finally {
        if (!cancelled) {
          setIsPreparingSignatures(false);
        }
      }
    };

    prepareSignatures();

    return () => {
      cancelled = true;
    };
  }, [sarlaftEvidence]);

  // ============================================================
  // DATOS QUE FINALMENTE RECIBE SarlaftPDF
  // ============================================================

  const evidenceDataForPDF = sarlaftEvidence
    ? {
        ...sarlaftEvidence,

        cliente_firma_path:
          preparedClienteSignature,

        funcionario_firma_path:
          preparedFuncionarioSignature,
      }
    : undefined;

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
    const placa = sarlaftEvidence?.placa_snapshot
      ? `_${sarlaftEvidence.placa_snapshot}`
      : "";

    const fecha = sarlaftEvidence?.created_at
      ? `_${new Date(
          sarlaftEvidence.created_at,
        )
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

      {!isLoading &&
        !isPreparingSignatures &&
        evidenceDataForPDF && (
          <PDFDownloadLink
            document={
              <SarlaftPDF
                evidenceData={evidenceDataForPDF}
              />
            }
            fileName={getFileName()}
          >
            {({
              loading,
              error: pdfError,
            }) => {
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