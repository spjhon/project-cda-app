"use client";

//media.devices.insecure.enabled
//media.getusermedia.insecure.enabled
//next dev --experimental-https

// ============================================================
// Imports
// ============================================================

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Camera, RefreshCw, X, Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { initialOrderFormData } from "./NewEntryOrder/NewSimpleEntryOrderComponent";
import { NormalizedVehicleData, useExtractVehicleData } from "@/lib/client-actions/useReadCarCardPropertyAction";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";


// Ajusta la importación de initialOrderFormData según tu estructura de carpetas real.
// Asumimos que el tipo es el que me compartiste previamente. 

// ============================================================
// Types
// ============================================================

interface CameraCaptureProps {
  formData: typeof initialOrderFormData;
  setFormData: React.Dispatch<React.SetStateAction<typeof initialOrderFormData>>;
}

// ============================================================
// Componente
// ============================================================

export function CameraCapture({ formData, setFormData }: CameraCaptureProps) {

  const PermissionsContextReceived = useContext(PermissionsContext);
  
      const tenant_id = PermissionsContextReceived?.PermissionsContextValue.tenantObject?.id ?? "";
    const user_id =
      PermissionsContextReceived?.PermissionsContextValue.user.id ?? "";

      
  // ==========================================================
  // Refs
  // ==========================================================

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ==========================================================
  // Hooks de IA
  // ==========================================================
  
  const { extractData, isLoading: isExtracting, error: extractError } = useExtractVehicleData();

  // ==========================================================
  // States
  // ==========================================================

  const [photo, setPhoto] = useState<File | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // ==========================================================
  // Preview
  // ==========================================================

  const photoPreview = useMemo(() => {
    if (!photo) return null;
    return URL.createObjectURL(photo);
  }, [photo]);

  // Liberar URL de la fotografía anterior o al desmontar.
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // ==========================================================
  // Conectar cámara al elemento video
  // ==========================================================

  useEffect(() => {
    if (!cameraActive) return;

    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream) return;

    video.srcObject = stream;

    const handleVideoReady = () => {
      setVideoReady(true);
    };

    video.addEventListener("loadedmetadata", handleVideoReady);

    video.play().catch((error) => {
      console.error("Error reproduciendo la cámara:", error);
      setCameraError("No fue posible mostrar la imagen de la cámara.");
    });

    return () => {
      video.removeEventListener("loadedmetadata", handleVideoReady);
      video.pause();
      video.srcObject = null;
    };
  }, [cameraActive]);

  // ==========================================================
  // Activar cámara
  // ==========================================================

  const startCamera = async () => {
    try {
      setCameraError(null);
      setVideoReady(false);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Tu navegador no permite acceder a la cámara. Verifica que estés utilizando HTTPS."
        );
      }

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const facingMode = isMobile ? "environment" : "user";

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      streamRef.current = stream;
      setCameraActive(true);
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      setCameraError(
        error instanceof Error ? error.message : "No fue posible acceder a la cámara."
      );
    }
  };

  // ==========================================================
  // Detener cámara
  // ==========================================================

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
    setVideoReady(false);
  };

  // ==========================================================
  // Tomar fotografía
  // ==========================================================

  const takePhoto = () => {
    const video = videoRef.current;

    if (!video || !videoReady || !video.videoWidth) {
      setCameraError("La cámara todavía no está lista.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("No fue posible procesar la fotografía.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("No fue posible capturar la fotografía.");
          return;
        }

        const file = new File(
          [blob],
          `fotografia-${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );

        setPhoto(file);
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  // ==========================================================
  // Procesar imagen con IA y actualizar estado
  // ==========================================================

 const handleExtractData = async () => {
    if (!photo) return;

    const data: NormalizedVehicleData | null = await extractData(photo);
    
    if (data && data.placa) {
      console.log("🚀 Datos extraídos por la IA:", data);

      // ==========================================================
      // 1. VALIDACIÓN DE NEGOCIO (Copiada del diálogo manual)
      // ==========================================================
      
      const placaLimpia = data.placa.toUpperCase();
      const supabaseBrowser = createSupabaseBrowserClient();
      let isValid = true;

      // --- RTM PRIMERA VEZ ---
      if (!formData.es_reinspeccion && formData.service_type === "RTM") {
        const { data: RTMcheckInfo, error: ErrorRTMcheckInfo } = await supabaseBrowser.rpc(
          "check_rtm_primera_vez_eligibility",
          { p_placa: placaLimpia, p_tenant_id: tenant_id }
        );

        if (ErrorRTMcheckInfo) {
          setCameraError(`Error de comunicación: ${ErrorRTMcheckInfo.message}`);
          isValid = false;
        } else if (!RTMcheckInfo || !RTMcheckInfo[0].puede_primera_vez) {
          setCameraError(RTMcheckInfo?.[0]?.motivo || "No aplica para primera vez RTM.");
          isValid = false;
        }
      }

      // --- RTM REINSPECCIÓN ---
      if (isValid && formData.es_reinspeccion && formData.service_type === "RTM") {
        const { data: rpcData, error: rpcError } = await supabaseBrowser.rpc(
          "check_rtm_reinspection_eligibility",
          { p_placa: placaLimpia, p_tenant_id: tenant_id }
        );
        
        if (rpcError) {
          setCameraError(`Error de comunicación: ${rpcError.message}`);
          isValid = false;
        } else if (!rpcData || !rpcData[0].merece_reinspeccion) {
          setCameraError(rpcData?.[0]?.motivo || "No aplica para reinspección RTM.");
          isValid = false;
        } else {
          // Si es válido, guardamos el id_reprobado
          setFormData((prev) => ({
            ...prev,
            id_reprobado: rpcData[0].id_reprobado,
          }));
        }
      }

      // --- PREVENTIVA REINSPECCIÓN ---
      if (isValid && formData.es_reinspeccion && formData.service_type === "preventiva") {
        const { data: rpcData, error: rpcError } = await supabaseBrowser.rpc(
          "check_preventiva_reinspection_eligibility",
          { p_placa: placaLimpia, p_tenant_id: tenant_id }
        );
        
        if (rpcError) {
          setCameraError(`Error de comunicación: ${rpcError.message}`);
          isValid = false;
        } else if (!rpcData || !rpcData[0].merece_reinspeccion) {
          setCameraError(rpcData?.[0]?.motivo || "No aplica para reinspección preventiva.");
          isValid = false;
        } else {
           setFormData((prev) => ({
            ...prev,
            id_reprobado: rpcData[0].id_reprobado,
          }));
        }
      }

      // ==========================================================
      // 2. SI TODO ES VÁLIDO, ACTUALIZAMOS EL FORMULARIO
      // ==========================================================
      if (isValid) {
        setFormData((prev) => ({
          ...prev,
          tenant_id: tenant_id,
          funcionario_id: user_id,
          informacion_buscada: true, // Marcamos que la búsqueda fue exitosa
          vehicle: {
            ...prev.vehicle,
            placa: placaLimpia,
            marca: data.marca || prev.vehicle.marca,
            linea: data.linea || prev.vehicle.linea,
            modelo: data.modelo || prev.vehicle.modelo,
            combustible: data.combustible,
            clase: data.clase,
            tipo_servicio_vehiculo: data.tipo_servicio_vehiculo,
          },
        }));
      }
    }
  };

  // ==========================================================
  // Limpiar recursos al desmontar
  // ==========================================================

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="flex w-full flex-col gap-4">
      {/* ================================================== */}
      {/* Vista de cámara */}
      {/* ================================================== */}
      {cameraActive && (
        <div className="relative overflow-hidden rounded-xl border border-border bg-black flex items-center justify-center w-full min-h-[250px] md:min-h-[350px]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-130 md:h-130 object-cover"
          />

          {!videoReady && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white">
              Iniciando cámara...
            </div>
          )}

          <Button
            size="icon"
            variant="destructive"
            className="absolute right-3 top-3"
            onClick={stopCamera}
          >
            <X />
          </Button>
        </div>
      )}

      {/* ================================================== */}
      {/* Fotografía capturada */}
      {/* ================================================== */}
      {photoPreview && (
        <div className="flex flex-col gap-3 w-full">
          <img
            src={photoPreview}
            alt="Fotografía capturada"
            className="w-full rounded-xl border border-border object-contain bg-black/5"
          />

          <p className="text-sm text-muted-foreground">
            {photo?.name} · {((photo?.size ?? 0) / 1024).toFixed(2)} KB
          </p>

          {/* BOTONES DE ACCIÓN POST-CAPTURA */}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setPhoto(null)}
              disabled={isExtracting}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tomar otra
            </Button>

            <Button 
              onClick={handleExtractData} 
              disabled={isExtracting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extrayendo...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Extraer Datos (IA)
                </>
              )}
            </Button>
          </div>

          {/* MOSTRAR ERROR DE LA IA SI FALLA */}
          {extractError && (
            <p className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded">
              {extractError}
            </p>
          )}
        </div>
      )}

      {/* ================================================== */}
      {/* Botones principales */}
      {/* ================================================== */}
      {!cameraActive && !photo && (
        <Button 
          onClick={startCamera}
          className="w-full h-14 md:h-16 text-lg font-bold gap-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
        >
          <Camera />
          Activar cámara
        </Button>
      )}

      {cameraActive && (
        <Button
          onClick={takePhoto}
          disabled={!videoReady}
          className="w-full h-14 text-lg font-bold"
        >
          <Camera className="mr-2" />
          Tomar fotografía
        </Button>
      )}

      {/* ================================================== */}
      {/* Errores de cámara */}
      {/* ================================================== */}
      {cameraError && (
        <p className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded">
          {cameraError}
        </p>
      )}
    </div>
  );
}