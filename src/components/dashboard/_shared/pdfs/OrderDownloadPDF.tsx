
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";

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

interface OrderDownloadPDFProps {
  orderId?: string;
  tenantId?: string;
  templateData?: OrderTemplateType;
}

function OrderDownloadPDF({
  orderId,
  tenantId,
  templateData,
}: OrderDownloadPDFProps) {
  // =========================================================
  // ESTADO PRINCIPAL
  // =========================================================

  // Controla cuándo comenzamos a consultar la orden.
  //
  // Inicialmente false para NO hacer el trabajo pesado hasta
  // que el usuario realmente quiera descargar el documento.
  const [readyToDownload, setReadyToDownload] = useState(false);

  // =========================================================
  // OBTENER DATOS DE LA ORDEN
  // =========================================================

  const {
    data: orderData,
    isLoading,
    error,
  } = useFetchEntryOrder({
    orderId,
    tenantId,
    readyToProcess: readyToDownload,
  });

  // =========================================================
  // ESTADO DE LAS FIRMAS PREPARADAS
  // =========================================================

  // Firmas complementarias de la orden.
  //
  // Las rutas originales de Supabase Storage serán reemplazadas
  // temporalmente por Data URLs para que react-pdf pueda utilizarlas.
  const [preparedSignatures, setPreparedSignatures] =
    useState<FetchEntryOrderResult["firmas_orden"] | null>(null);

  // Firma del funcionario/recepcionista.
  const [
    preparedRecepcionistaSignature,
    setPreparedRecepcionistaSignature,
  ] = useState<FetchEntryOrderResult["funcionario_firma"] | null>(null);

  // Firma del director técnico.
  const [
    preparedDirectorTecnicoSignature,
    setPreparedDirectorTecnicoSignature,
  ] = useState<
    FetchEntryOrderResult["director_tecnico_firma"] | null
  >(null);

  // Indica que todavía estamos descargando y preparando
  // las imágenes de las firmas.
  const [isPreparingSignatures, setIsPreparingSignatures] =
    useState(false);

  // =========================================================
  // PREPARAR FIRMAS
  // =========================================================
  //
  // Este efecto solamente se ejecuta cuando tenemos los datos
  // completos de la orden.
  //
  // Flujo:
  //
  // 1. Obtener ruta de cada firma.
  // 2. Descargar imagen desde Supabase Storage.
  // 3. Convertir Blob -> Data URL.
  // 4. Guardar las firmas preparadas en estado.
  // 5. Permitir que react-pdf genere el documento.
  //
  useEffect(() => {
    if (!orderData) {
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
        // Descarga una imagen desde Supabase Storage y la
        // convierte en Data URL.
        //
        // react-pdf trabaja mucho mejor con la imagen ya
        // convertida que con la ruta privada de Storage.
        //
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

        // =====================================================
        // 1. FIRMA DEL RECEPCIONISTA / FUNCIONARIO
        // =====================================================

        const recepcionistaSignature =
          await downloadSignatureAsDataUrl(
            orderData.funcionario_firma,
          );

        // =====================================================
        // 2. FIRMA DEL DIRECTOR TÉCNICO
        // =====================================================

        const directorTecnicoSignature =
          await downloadSignatureAsDataUrl(
            orderData.director_tecnico_firma,
          );

        // =====================================================
        // 3. FIRMAS COMPLEMENTARIAS
        // =====================================================

        const firmasPreparadas = await Promise.all(
          (orderData.firmas_orden ?? []).map(async (firma) => {
            // Si la firma no tiene archivo asociado,
            // simplemente conservamos el registro.
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

        // =====================================================
        // GUARDAR TODO CUANDO TERMINÓ LA PREPARACIÓN
        // =====================================================

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

    // Evita actualizar estado si el componente se desmontó
    // mientras las firmas todavía se estaban descargando.
    return () => {
      cancelled = true;
    };
  }, [orderData]);

  // =========================================================
  // DATOS FINALES PARA OrderPDF
  // =========================================================
  //
  // Construimos una copia de orderData.
  //
  // Lo único que cambia son las firmas:
  //
  // ruta privada de Storage
  //        ↓
  // Data URL
  //
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

  // =========================================================
  // NOMBRE DEL ARCHIVO
  // =========================================================

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

  // =========================================================
  // ESTADO 1
  // =========================================================
  //
  // Todavía no hemos iniciado el proceso.
  //
  // Mostramos únicamente el botón inicial.
  //
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

  // =========================================================
  // ESTADO 2
  // =========================================================
  //
  // Estamos consultando los datos de la orden.
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
          Cargando datos...
        </span>
      </Button>
    );
  }

  // =========================================================
  // ERROR AL CARGAR LA ORDEN
  // =========================================================

  if (error) {
    return (
      <span className="text-[10px] text-destructive font-medium px-2">
        Error al cargar datos
      </span>
    );
  }

  // =========================================================
  // ESTADO 3
  // =========================================================
  //
  // Los datos ya llegaron, pero todavía estamos descargando
  // las firmas desde Storage.
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
  // Aquí ya tenemos:
  //
  // - Datos de la orden.
  // - Firmas preparadas.
  // - Datos listos para react-pdf.
  //
  // Ahora PDFDownloadLink puede generar el documento.
  //
  if (orderDataForPDF || templateData) {
    return (
      <PDFDownloadLink
        document={
          <OrderPDF
            orderData={orderDataForPDF}
            templateData={templateData}
          />
        }
        fileName={getFileName()}
      >
        {({ loading, error: pdfError }) => {
          // -----------------------------------------------
          // Error generando el PDF
          // -----------------------------------------------

          if (pdfError) {
            return (
              <span className="text-[10px] text-destructive font-medium px-2">
                Error PDF
              </span>
            );
          }

          // -----------------------------------------------
          // React-PDF todavía está generando el documento
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
          // PDF LISTO
          // -----------------------------------------------

          return (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-foreground hover:bg-muted px-2 border border-border shadow-xs"
              title="Descargar documento"
              onClick={() => {
                // Después de iniciar la descarga dejamos
                // que el navegador tenga tiempo para comenzar
                // el proceso antes de regresar al estado inicial.
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
  // En teoría no deberíamos llegar aquí, pero evitamos dejar
  // el componente completamente vacío si no hay datos.
  //
  return (
    <span className="text-[10px] text-muted-foreground px-2">
      No hay datos para generar el documento
    </span>
  );
}

// =============================================================
// EXPORT
// =============================================================
//
// react-pdf necesita APIs del navegador. Por eso evitamos
// renderizar este componente durante SSR.
//
// Esto también evita problemas con Blob, FileReader y la
// generación del PDF durante el renderizado del servidor.
//
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
