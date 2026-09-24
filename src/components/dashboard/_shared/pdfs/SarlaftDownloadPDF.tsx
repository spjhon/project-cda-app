
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  SarlaftEvidence,
  useFetchSarlaftEvidence,
} from "@/lib/client-actions/fetch_sarlaft_evidence_by_entry_order_id";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import SarlaftPDF from "./SarlaftPDF";

interface SarlaftDownloadPDFProps {
  orderId?: string;
}

function SarlaftDownloadPDF({
  orderId,
}: SarlaftDownloadPDFProps) {
  // =========================================================
  // ESTADO PRINCIPAL
  // =========================================================

  // Inicialmente no hacemos la consulta.
  //
  // Solo comenzamos a cargar la evidencia SARLAFT cuando
  // el usuario presiona "Cargar descarga evidencia SARLAFT".
  const [readyToDownload, setReadyToDownload] = useState(false);

  // =========================================================
  // OBTENER EVIDENCIA SARLAFT
  // =========================================================

  const {
    data: sarlaftEvidence,
    isLoading,
    error,
  } = useFetchSarlaftEvidence({
    orderId,
    readyToProcess: readyToDownload,
  });

  // =========================================================
  // FIRMAS PREPARADAS
  // =========================================================
  //
  // Las firmas vienen inicialmente como rutas de Supabase
  // Storage.
  //
  // Para react-pdf necesitamos convertirlas a Data URL.
  // =========================================================

  // Firma del cliente.
  const [preparedClienteSignature, setPreparedClienteSignature] =
    useState<SarlaftEvidence["cliente_firma_path"] | null>(null);

  // Firma del funcionario / inspector.
  const [
    preparedFuncionarioSignature,
    setPreparedFuncionarioSignature,
  ] = useState<
    SarlaftEvidence["funcionario_firma_path"] | null
  >(null);

  // Indica que todavía estamos descargando y preparando
  // las firmas desde Supabase Storage.
  const [isPreparingSignatures, setIsPreparingSignatures] =
    useState(false);

  // =========================================================
  // PREPARAR FIRMAS DESDE STORAGE
  // =========================================================
  //
  // Flujo:
  //
  // Evidencia SARLAFT
  //        ↓
  // Rutas de firmas
  //        ↓
  // Descargar imágenes
  //        ↓
  // Blob → Data URL
  //        ↓
  // SarlaftPDF
  //
  useEffect(() => {
    if (!sarlaftEvidence) {
      return;
    }

    let cancelled = false;

    const prepareSignatures = async () => {
      setIsPreparingSignatures(true);

      try {
        const supabaseBrowser = createSupabaseBrowserClient();

        // =====================================================
        // FUNCIÓN AUXILIAR
        // =====================================================
        //
        // Descarga una firma desde Supabase Storage y la
        // convierte en Data URL.
        //
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

        // =====================================================
        // 1. FIRMA DEL CLIENTE
        // =====================================================

        const clienteSignature =
          await downloadSignatureAsDataUrl(
            sarlaftEvidence.cliente_firma_path,
          );

        // =====================================================
        // 2. FIRMA DEL FUNCIONARIO / INSPECTOR
        // =====================================================

        const funcionarioSignature =
          await downloadSignatureAsDataUrl(
            sarlaftEvidence.funcionario_firma_path,
          );

        // =====================================================
        // GUARDAR FIRMAS PREPARADAS
        // =====================================================

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

    // Evita actualizar estado si el componente se desmontó
    // mientras todavía se estaban descargando las firmas.
    return () => {
      cancelled = true;
    };
  }, [sarlaftEvidence]);

  // =========================================================
  // DATOS FINALES PARA SarlaftPDF
  // =========================================================
  //
  // Conservamos todos los datos originales de la evidencia
  // y sustituimos únicamente las rutas de las firmas por
  // las Data URLs preparadas.
  //
  const evidenceDataForPDF = sarlaftEvidence
    ? {
        ...sarlaftEvidence,

        cliente_firma_path:
          preparedClienteSignature,

        funcionario_firma_path:
          preparedFuncionarioSignature,
      }
    : undefined;

  // =========================================================
  // NOMBRE DEL ARCHIVO
  // =========================================================

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

  // =========================================================
  // ESTADO 1
  // =========================================================
  //
  // Todavía no hemos iniciado el proceso.
  //
  if (!readyToDownload) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 border-border text-foreground hover:bg-muted"
        onClick={() => setReadyToDownload(true)}
      >
        <span>Cargar descarga evidencia SARLAFT</span>
      </Button>
    );
  }

  // =========================================================
  // ESTADO 2
  // =========================================================
  //
  // Estamos consultando la evidencia SARLAFT.
  //
  if (isLoading) {
    return (
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
    );
  }

  // =========================================================
  // ERROR AL CARGAR EVIDENCIA
  // =========================================================

  if (error) {
    return (
      <span className="text-[10px] text-destructive font-medium px-2">
        Error al cargar datos SARLAFT
      </span>
    );
  }

  // =========================================================
  // ESTADO 3
  // =========================================================
  //
  // La evidencia ya llegó, pero todavía estamos preparando
  // las imágenes de las firmas.
  //
  if (isPreparingSignatures) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="h-8 gap-2 text-muted-foreground px-2"
      >
        <Loader2 className="h-3 w-3 animate-spin" />

        <span className="text-xs font-medium">
          Preparando documento...
        </span>
      </Button>
    );
  }

  // =========================================================
  // ESTADO 4
  // =========================================================
  //
  // Ya tenemos la evidencia y las firmas preparadas.
  //
  // Ahora react-pdf puede generar el documento.
  //
  if (evidenceDataForPDF) {
    return (
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
          // -----------------------------------------------
          // ERROR GENERANDO PDF
          // -----------------------------------------------

          if (pdfError) {
            return (
              <span className="text-[10px] text-destructive font-medium px-2">
                Error PDF
              </span>
            );
          }

          // -----------------------------------------------
          // REACT-PDF ESTÁ GENERANDO EL DOCUMENTO
          // -----------------------------------------------

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
                  Generando...
                </span>
              </Button>
            );
          }

          // -----------------------------------------------
          // DESCARGA LISTA
          // -----------------------------------------------

          return (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-foreground hover:bg-muted px-2 border border-border shadow-xs"
              title="Descargar evidencia SARLAFT"
              onClick={() => {
                // Dejamos un pequeño margen para que el navegador
                // inicie la descarga antes de volver al estado inicial.
                setTimeout(() => {
                  setReadyToDownload(false);
                }, 2000);
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
    );
  }

  // =========================================================
  // FALLBACK
  // =========================================================
  //
  // No debería ocurrir normalmente, pero evitamos dejar el
  // componente vacío si no existe evidencia para generar.
  //
  return (
    <span className="text-[10px] text-muted-foreground px-2">
      No hay evidencia SARLAFT disponible
    </span>
  );
}

// =============================================================
// EXPORT DINÁMICO
// =============================================================
//
// react-pdf utiliza APIs del navegador, por lo que este
// componente se mantiene fuera del SSR.
//
// También evitamos problemas con FileReader y Storage
// durante el renderizado del servidor.
// =============================================================

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
