
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { BlobProvider } from "@react-pdf/renderer";
import { Eye, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  useFetchSarlaftEvidence,
  SarlaftEvidence,
} from "@/lib/client-actions/fetch_sarlaft_evidence_by_entry_order_id";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import SarlaftPDF from "./SarlaftPDF";

// ============================================================
// PROPS
// ============================================================

interface SarlaftViewPDFProps {
  orderId?: string;
}

// ============================================================
// COMPONENTE
// ============================================================

function SarlaftViewPDF({ orderId }: SarlaftViewPDFProps) {
  // ============================================================
  // ESTADO PRINCIPAL
  // ============================================================
  // Controla cuándo comienza todo el proceso:
  //
  // false → solamente mostramos "Cargar Evidencia Sarlaft"
  // true  → comenzamos a consultar y preparar el PDF
  // ============================================================

  const [readyToProcess, setReadyToProcess] = useState(false);

  // ============================================================
  // CONSULTA DE LA EVIDENCIA SARLAFT
  // ============================================================

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
  //
  // La consulta devuelve paths de Supabase Storage.
  //
  // react-pdf necesita poder consumir la imagen directamente,
  // por eso descargamos cada firma y la convertimos a Data URL.
  // ============================================================

  const [preparedClienteSignature, setPreparedClienteSignature] =
    useState<SarlaftEvidence["cliente_firma_path"] | null>(null);

  const [
    preparedFuncionarioSignature,
    setPreparedFuncionarioSignature,
  ] = useState<SarlaftEvidence["funcionario_firma_path"] | null>(null);

  // ============================================================
  // ESTADO DE PREPARACIÓN DE FIRMAS
  // ============================================================

  const [isPreparingSignatures, setIsPreparingSignatures] =
    useState(false);

  // ============================================================
  // PREPARAR FIRMAS DESDE SUPABASE STORAGE
  // ============================================================

  useEffect(() => {
    // Todavía no tenemos los datos de la evidencia.
    if (!orderData) {
      return;
    }

    let cancelled = false;

    const prepareSignatures = async () => {
      setIsPreparingSignatures(true);

      try {
        const supabaseBrowser = createSupabaseBrowserClient();

        // ======================================================
        // FUNCIÓN AUXILIAR
        // Descargar firma y convertir Blob → Data URL
        // ======================================================

        const downloadSignatureAsDataUrl = async (
          path: string | null,
        ): Promise<string | null> => {
          // No existe firma.
          if (!path) {
            return null;
          }

          // ----------------------------------------------------
          // Descargar archivo desde Supabase Storage
          // ----------------------------------------------------

          const { data, error } = await supabaseBrowser.storage
            .from("signatures")
            .download(path);

          if (error || !data) {
            console.error(
              `No se pudo descargar la firma ${path}:`,
              error?.message,
            );

            return null;
          }

          // ----------------------------------------------------
          // Convertir Blob → Data URL
          // ----------------------------------------------------

          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => {
              if (typeof reader.result === "string") {
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
          });
        };

        // ======================================================
        // 1. FIRMA DEL CLIENTE
        // ======================================================

        const clienteSignature =
          await downloadSignatureAsDataUrl(
            orderData.cliente_firma_path,
          );

        // ======================================================
        // 2. FIRMA DEL FUNCIONARIO / INSPECTOR
        // ======================================================

        const funcionarioSignature =
          await downloadSignatureAsDataUrl(
            orderData.funcionario_firma_path,
          );

        // ======================================================
        // GUARDAR FIRMAS PREPARADAS
        // ======================================================

        if (!cancelled) {
          setPreparedClienteSignature(clienteSignature);

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

    // ==========================================================
    // CLEANUP
    // ==========================================================

    return () => {
      cancelled = true;
    };
  }, [orderData]);

  // ============================================================
  // DATOS FINALES PARA SarlaftPDF
  // ============================================================
  //
  // Aquí reemplazamos los paths de Storage por los Data URL
  // preparados anteriormente.
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
      {/* ======================================================
          1. CARGANDO DATOS SARLAFT
          ====================================================== */}

      {isLoading && (
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-8 gap-2 text-muted-foreground px-2"
        >
          <Loader2 className="h-3 w-3 animate-spin" />

          <span className="text-xs font-medium">
            Cargando evidencia...
          </span>
        </Button>
      )}

      {/* ======================================================
          2. ERROR CARGANDO DATOS
          ====================================================== */}

      {error && (
        <span className="text-[10px] text-destructive font-medium px-2">
          Error al cargar datos.
        </span>
      )}

      {/* ======================================================
          3. PREPARANDO FIRMAS
          ====================================================== */}
     

      {!isLoading && isPreparingSignatures && (
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-8 gap-2 text-muted-foreground px-2"
        >
          <Loader2 className="h-3 w-3 animate-spin" />

          <span className="text-xs font-medium">
            Preparando firmas...
          </span>
        </Button>
      )}

      {/* ======================================================
          4. GENERACIÓN DEL PDF
          ====================================================== */}

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
              // PDF TODAVÍA GENERÁNDOSE
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

                    <span className="text-xs font-medium">
                      Generando PDF...
                    </span>
                  </Button>
                );
              }

              // ------------------------------------------------
              // PDF LISTO
              // ------------------------------------------------

              return (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 text-foreground hover:bg-muted px-2 shadow-xs border border-border"
                  onClick={() => {
                    if (url) {
                      window.open(url, "_blank");

                      // Permitimos volver a ejecutar el proceso
                      // la próxima vez que el usuario quiera
                      // consultar la evidencia.
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

// ============================================================
// EXPORT DINÁMICO
// ============================================================
//
// @react-pdf/renderer trabaja del lado del navegador.
//
// ssr: false evita que BlobProvider intente ejecutarse durante
// SSR.
// ============================================================

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
