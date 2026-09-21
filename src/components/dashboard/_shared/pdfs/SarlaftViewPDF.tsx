"use client";

import { useEffect, useState } from "react";

import { BlobProvider } from "@react-pdf/renderer";

import { Eye, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import dynamic from "next/dynamic";

import {
  useFetchSarlaftEvidence,
  SarlaftEvidence,
} from "@/lib/client-actions/fetch_sarlaft_evidence_by_entry_order_id";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import SarlaftPDF from "./SarlaftPDF";

interface OrderViewPDFProps {
  orderId?: string;
}

function SarlaftViewPDF({ orderId }: OrderViewPDFProps) {
  const [readyToProcess, setReadyToProcess] =
    useState(false);

  const {
    data: orderData,
    isLoading,
    error,
  } = useFetchSarlaftEvidence({
    orderId,
    readyToProcess,
  });

  // ============================================================
  // FIRMAS PREPARADAS PARA EL PDF
  // ============================================================

  const [preparedClienteSignature, setPreparedClienteSignature] =
    useState<SarlaftEvidence["cliente_firma_path"] | null>(
      null,
    );

  const [
    preparedFuncionarioSignature,
    setPreparedFuncionarioSignature,
  ] = useState<
    SarlaftEvidence["funcionario_firma_path"] | null
  >(null);

  const [isPreparingSignatures, setIsPreparingSignatures] =
    useState(false);

  // ============================================================
  // PREPARAR FIRMAS DESDE STORAGE
  // ============================================================

  useEffect(() => {
    if (!orderData) {
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
            orderData.cliente_firma_path,
          );

        // ==================================================
        // 2. FIRMA DEL FUNCIONARIO / INSPECTOR
        // ==================================================

        const funcionarioSignature =
          await downloadSignatureAsDataUrl(
            orderData.funcionario_firma_path,
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
  }, [orderData]);

  // ============================================================
  // DATOS QUE FINALMENTE RECIBE SarlaftPDF
  // ============================================================

  const evidenceDataForPDF = orderData
    ? {
        ...orderData,

        cliente_firma_path:
          preparedClienteSignature,

        funcionario_firma_path:
          preparedFuncionarioSignature,
      }
    : undefined;

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

          <span className="text-xs font-medium">
            Procesando...
          </span>
        </Button>
      )}

      {error && (
        <span className="text-[10px] text-destructive font-medium px-2">
          Error al cargar datos.
        </span>
      )}

      {!isLoading &&
        !isPreparingSignatures &&
        evidenceDataForPDF && (
          <BlobProvider
            document={
              <SarlaftPDF
                evidenceData={evidenceDataForPDF}
              />
            }
          >
            {({
              url,
              loading,
              error: pdfError,
            }) => {
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

                  <span className="text-xs font-medium">
                    Ver evidencia Sarlaft PDF
                  </span>
                </Button>
              );
            }}
          </BlobProvider>
        )}
    </>
  );
}

export default dynamic(
  () => Promise.resolve(SarlaftViewPDF),
  {
    ssr: false,
    loading: () => (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="h-8 gap-2 text-muted-foreground px-2"
      >
        <Loader2 className="h-3 w-3 animate-spin" />

        <span className="text-xs font-medium">
          Cargando visor...
        </span>
      </Button>
    ),
  },
);