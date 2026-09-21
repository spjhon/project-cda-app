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

import {
  OrderTemplate as OrderTemplateType,
} from "@/lib/server-actions/fetch_orders_templates";

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


  const [readyToProcess, setReadyToProcess] = useState(false);




  const {
    data: orderData,
    isLoading,
    error,
  } = useFetchEntryOrder({
    orderId,
    tenantId,
    readyToProcess,
  });






  const [preparedSignatures, setPreparedSignatures] =
  useState<FetchEntryOrderResult["firmas_orden"] | null>(null);

const [preparedRecepcionistaSignature, setPreparedRecepcionistaSignature] =
  useState<FetchEntryOrderResult["funcionario_firma"] | null>(null);

const [
  preparedDirectorTecnicoSignature,
  setPreparedDirectorTecnicoSignature,
] = useState<FetchEntryOrderResult["director_tecnico_firma"] | null>(null);

const [isPreparingSignatures, setIsPreparingSignatures] =
  useState(false);



console.log(orderData)


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
      // 1. FIRMA DEL RECEPCIONISTA
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







  // Botón inicial "Preparar PDF"
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
        (orderDataForPDF || templateData) && (
          <BlobProvider
            document={
              <OrderPDF
                orderData={orderDataForPDF}
                templateData={templateData}
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
                    Ver PDF
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