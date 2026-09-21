"use client";

import { useEffect, useState } from "react";

import { PDFDownloadLink } from "@react-pdf/renderer";

import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import dynamic from "next/dynamic";

import {
  OrderTemplate as OrderTemplateType,
} from "@/lib/server-actions/fetch_orders_templates";

// Importamos el documento y el hook
import OrderPDF from "./OrderPDF";

import {
  FetchEntryOrderResult,
  useFetchEntryOrder,
} from "@/lib/client-actions/fetch_entry_order_by_id";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface OrderDownloadPDFProps {
  orderId?: string | undefined;
  tenantId?: string | undefined;
  templateData?: OrderTemplateType;
}

function OrderDownloadPDF({
  orderId,
  tenantId,
  templateData,
}: OrderDownloadPDFProps) {
  const [readyToDownload, setReadyToDownload] =
    useState(false);

  const {
    data: orderData,
    isLoading,
    error,
  } = useFetchEntryOrder({
    orderId,
    tenantId,
    readyToProcess: readyToDownload,
  });

  // --------------------------------------------------
  // Firmas preparadas para el PDF
  // --------------------------------------------------

  const [preparedSignatures, setPreparedSignatures] =
    useState<FetchEntryOrderResult["firmas_orden"] | null>(
      null,
    );

  const [
    preparedRecepcionistaSignature,
    setPreparedRecepcionistaSignature,
  ] = useState<
    FetchEntryOrderResult["funcionario_firma"] | null
  >(null);

  const [
    preparedDirectorTecnicoSignature,
    setPreparedDirectorTecnicoSignature,
  ] = useState<
    FetchEntryOrderResult["director_tecnico_firma"] | null
  >(null);

  const [isPreparingSignatures, setIsPreparingSignatures] =
    useState(false);

  // --------------------------------------------------
  // Preparar firmas desde Storage
  // --------------------------------------------------

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

        // --------------------------------------------------
        // 1. FIRMA DEL RECEPCIONISTA / FUNCIONARIO
        // --------------------------------------------------

        const recepcionistaSignature =
          await downloadSignatureAsDataUrl(
            orderData.funcionario_firma,
          );

        // --------------------------------------------------
        // 2. FIRMA DEL DIRECTOR TÉCNICO
        // --------------------------------------------------

        const directorTecnicoSignature =
          await downloadSignatureAsDataUrl(
            orderData.director_tecnico_firma,
          );

        // --------------------------------------------------
        // 3. FIRMAS COMPLEMENTARIAS
        // --------------------------------------------------

        const firmasPreparadas =
          await Promise.all(
            (orderData.firmas_orden ?? []).map(
              async (firma) => {
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
                  signature_path:
                    signatureDataUrl,
                };
              },
            ),
          );

        // --------------------------------------------------
        // Guardamos todo cuando termina la preparación
        // --------------------------------------------------

        if (!cancelled) {
          setPreparedRecepcionistaSignature(
            recepcionistaSignature,
          );

          setPreparedDirectorTecnicoSignature(
            directorTecnicoSignature,
          );

          setPreparedSignatures(
            firmasPreparadas,
          );
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

    return () => {
      cancelled = true;
    };
  }, [orderData]);

  // --------------------------------------------------
  // Datos que finalmente recibe OrderPDF
  // --------------------------------------------------

  const orderDataForPDF = orderData
    ? {
        ...orderData,
        funcionario_firma:
          preparedRecepcionistaSignature,
        director_tecnico_firma:
          preparedDirectorTecnicoSignature,
        firmas_orden:
          preparedSignatures ??
          orderData.firmas_orden,
      }
    : undefined;

  // --------------------------------------------------
  // Botón inicial "Preparar PDF"
  // --------------------------------------------------

  if (!readyToDownload) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 border-border text-foreground hover:bg-muted"
        onClick={() => setReadyToDownload(true)}
      >
        <span>Preparar descarga</span>
      </Button>
    );
  }

  // --------------------------------------------------
  // Nombre del archivo
  // --------------------------------------------------

  const getFileName = () => {
    const nombrePlantilla =
      orderData?.plantilla_nombre ||
      templateData?.template_name ||
      "Orden_de_Ingreso";

    const placa = orderData?.vehiculo_placa
      ? `_${orderData.vehiculo_placa}`
      : "";

    const fecha = orderData?.fecha
      ? `_${new Date(orderData.fecha)
          .toISOString()
          .split("T")[0]}`
      : "";

    return `${nombrePlantilla}${placa}${fecha}.pdf`.replace(
      /\s+/g,
      "_",
    );
  };

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
          Error al cargar datos
        </span>
      )}

      {!isLoading &&
        !isPreparingSignatures &&
        (orderDataForPDF || templateData) && (
          <PDFDownloadLink
            document={
              <OrderPDF
                orderData={orderDataForPDF}
                templateData={templateData}
              />
            }
            fileName={getFileName()}
          >
            {({
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

                    <span className="text-[10px] font-medium">
                      Generando...
                    </span>
                  </Button>
                );
              }

              return (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 text-foreground hover:bg-muted px-2 border border-border shadow-xs"
                  onClick={() => {
                    setTimeout(
                      () => setReadyToDownload(false),
                      2000,
                    );
                  }}
                  title="Descargar ahora"
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

export default dynamic(
  () => Promise.resolve(OrderDownloadPDF),
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