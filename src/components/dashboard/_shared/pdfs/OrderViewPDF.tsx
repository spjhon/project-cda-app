"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import { BlobProvider } from "@react-pdf/renderer";

import { Eye, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  FetchEntryOrderResult,
  useFetchEntryOrder,
} from "@/lib/client-actions/fetch_entry_order_by_id";

import { OrderTemplate as OrderTemplateType } from "@/lib/server-actions/fetch_orders_templates";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import OrderPDF from "./OrderPDF";

interface OrderViewPDFProps {
  orderId?: string | undefined;
  tenantId?: string | undefined;
  templateData?: OrderTemplateType;
}

function OrderViewPDF({
  orderId,
  tenantId,
  templateData,
}: OrderViewPDFProps) {
  // ============================================================
  // CONTROL PRINCIPAL
  // ============================================================
  // El documento NO empieza a prepararse hasta que el usuario
  // presiona "Preparar documento".
  const [readyToProcess, setReadyToProcess] = useState(false);

  // ============================================================
  // OBTENER LOS DATOS DE LA ORDEN
  // ============================================================
  const {
    data: orderData,
    isLoading,
    error,
  } = useFetchEntryOrder({
    orderId,
    tenantId,
    readyToProcess,
  });

  // ============================================================
  // FIRMAS PREPARADAS
  // ============================================================
  // Las firmas originalmente vienen como paths de Storage.
  // Para react-pdf necesitamos convertirlas a Data URLs.
  const [preparedSignatures, setPreparedSignatures] =
    useState<FetchEntryOrderResult["firmas_orden"] | null>(null);

  const [
    preparedRecepcionistaSignature,
    setPreparedRecepcionistaSignature,
  ] = useState<FetchEntryOrderResult["funcionario_firma"] | null>(null);

  const [
    preparedDirectorTecnicoSignature,
    setPreparedDirectorTecnicoSignature,
  ] = useState<
    FetchEntryOrderResult["director_tecnico_firma"] | null
  >(null);

  // Indica que ya recibimos la orden y estamos preparando
  // las firmas para poder construir el PDF.
  const [isPreparingSignatures, setIsPreparingSignatures] =
    useState(false);

  // ============================================================
  // PREPARAR FIRMAS
  // ============================================================
  useEffect(() => {
    if (!orderData) {
      return;
    }

    let cancelled = false;

    const prepareSignatures = async () => {
      setIsPreparingSignatures(true);

      try {
        const supabaseBrowser = createSupabaseBrowserClient();

        // --------------------------------------------------------
        // FUNCIÓN AUXILIAR
        // --------------------------------------------------------
        // Descarga una firma desde Supabase Storage y la convierte
        // en Data URL para que react-pdf pueda utilizarla.
        const downloadSignatureAsDataUrl = async (
          path: string | null,
        ): Promise<string | null> => {
          if (!path) {
            return null;
          }

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

        // --------------------------------------------------------
        // 1. FIRMA DEL RECEPCIONISTA
        // --------------------------------------------------------
        const recepcionistaSignature =
          await downloadSignatureAsDataUrl(
            orderData.funcionario_firma,
          );

        // --------------------------------------------------------
        // 2. FIRMA DEL DIRECTOR TÉCNICO
        // --------------------------------------------------------
        const directorTecnicoSignature =
          await downloadSignatureAsDataUrl(
            orderData.director_tecnico_firma,
          );

        // --------------------------------------------------------
        // 3. FIRMAS COMPLEMENTARIAS
        // --------------------------------------------------------
        const firmasPreparadas = await Promise.all(
          (orderData.firmas_orden ?? []).map(async (firma) => {
            // Si no existe path, conservamos la firma pero
            // dejamos el valor como null.
            if (!firma.signature_path) {
              return {
                ...firma,
                signature_path: null,
              };
            }

            const signatureDataUrl =
              await downloadSignatureAsDataUrl(
                firma.signature_path,
              );

            return {
              ...firma,
              signature_path: signatureDataUrl,
            };
          }),
        );

        // --------------------------------------------------------
        // GUARDAR TODO CUANDO TERMINÓ LA PREPARACIÓN
        // --------------------------------------------------------
        // Si el componente ya no existe o cambió la orden,
        // evitamos actualizar estado viejo.
        if (!cancelled) {
          setPreparedRecepcionistaSignature(
            recepcionistaSignature,
          );

          setPreparedDirectorTecnicoSignature(
            directorTecnicoSignature,
          );

          setPreparedSignatures(firmasPreparadas);
        }
      } catch (error) {
        console.error(
          "Error preparando las firmas para el PDF:",
          error,
        );

        if (!cancelled) {
          setPreparedRecepcionistaSignature(null);
          setPreparedDirectorTecnicoSignature(null);
          setPreparedSignatures([]);
        }
      } finally {
        if (!cancelled) {
          setIsPreparingSignatures(false);
        }
      }
    };

    prepareSignatures();

    // ----------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------
    return () => {
      cancelled = true;
    };
  }, [orderData]);

  // ============================================================
  // DATOS FINALES PARA EL PDF
  // ============================================================
  // Partimos de los datos originales de la orden y reemplazamos
  // los paths de las firmas por sus Data URLs preparadas.
  const orderDataForPDF = orderData
    ? {
        ...orderData,

        funcionario_firma:
          preparedRecepcionistaSignature,

        director_tecnico_firma:
          preparedDirectorTecnicoSignature,

        firmas_orden:
          preparedSignatures ?? orderData.firmas_orden,
      }
    : undefined;

  // ============================================================
  // ESTADO UNIFICADO DEL PROCESAMIENTO
  // ============================================================
  // ESTE ES EL ARREGLO IMPORTANTE.
  //
  // Antes teníamos dos estados independientes:
  //
  //   isLoading
  //   isPreparingSignatures
  //
  // y podía existir un pequeño momento donde ambos fueran false.
  //
  // Ahora conceptualmente tratamos ambas cosas como una sola
  // operación: "preparar documento".
  const isPreparingDocument =
    isLoading || isPreparingSignatures;

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
        <span>Preparar documento</span>
      </Button>
    );
  }

  // ============================================================
  // ESTADO DE ERROR
  // ============================================================
  if (error) {
    return (
      <span className="text-[10px] text-destructive font-medium px-2">
        Error al cargar datos.
      </span>
    );
  }

  // ============================================================
  // ESTADO DE PREPARACIÓN
  // ============================================================
  // Mientras se descargan los datos O las firmas,
  // mostramos exactamente el mismo estado visual.
  //
  // Así desaparece el "hueco" donde antes no aparecía nada.
  if (isPreparingDocument) {
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

  // ============================================================
  // GENERACIÓN DEL PDF
  // ============================================================
  // Llegados aquí:
  //
  // - ya tenemos orderData
  // - ya terminaron las firmas
  // - ya podemos construir el documento
  //
  // Por eso BlobProvider solamente se monta cuando realmente
  // estamos listos.
  if (!orderDataForPDF && !templateData) {
    return null;
  }

  return (
    <BlobProvider
      document={
        <OrderPDF
          orderData={orderDataForPDF}
          templateData={templateData}
        />
      }
    >
      {({ url, loading, error: pdfError }) => {
        // --------------------------------------------------------
        // ERROR GENERANDO EL PDF
        // --------------------------------------------------------
        if (pdfError) {
          return (
            <span className="text-[10px] text-destructive font-medium px-2">
              Error PDF
            </span>
          );
        }

        // --------------------------------------------------------
        // REACT-PDF TODAVÍA ESTÁ GENERANDO EL BLOB
        // --------------------------------------------------------
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

        // --------------------------------------------------------
        // PDF LISTO
        // --------------------------------------------------------
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-foreground hover:bg-muted px-2 shadow-xs border border-border"
            onClick={() => {
              if (url) {
                window.open(url, "_blank");

                // Después de abrir el PDF, volvemos al estado
                // inicial para que el usuario pueda prepararlo
                // nuevamente si lo necesita.
                setReadyToProcess(false);
              }
            }}
          >
            <Eye className="h-4 w-4 text-muted-foreground" />

            <span className="text-xs font-medium">
              Ver PDF
            </span>
          </Button>
        );
      }}
    </BlobProvider>
  );
}

// ================================================================
// SSR DESACTIVADO
// ================================================================
// react-pdf necesita APIs del navegador para este componente,
// por eso mantenemos ssr: false.
export default dynamic(
  () => Promise.resolve(OrderViewPDF),
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