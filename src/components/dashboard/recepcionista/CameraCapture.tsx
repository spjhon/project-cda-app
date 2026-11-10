
"use client";

// ============================================================
// Imports
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";

// ============================================================
// Componente
// ============================================================

export function CameraCapture() {
  // ==========================================================
  // Refs
  // ==========================================================

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

      setCameraError(
        "No fue posible mostrar la imagen de la cámara."
      );
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

      // Detectar dispositivo móvil.
      const isMobile = /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      );

      // Celular: cámara trasera.
      // Computador: cámara frontal.
      const facingMode = isMobile ? "environment" : "user";

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      setCameraActive(true);
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);

      setCameraError(
        error instanceof Error
          ? error.message
          : "No fue posible acceder a la cámara."
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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("No fue posible procesar la fotografía.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

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
    <div className="flex w-full max-w-md flex-col gap-4">

      {/* ================================================== */}
      {/* Vista de cámara */}
      {/* ================================================== */}

      {cameraActive && (
        <div className="relative overflow-hidden rounded-xl border border-border bg-black">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="aspect-[4/3] w-full object-cover"
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
        <div className="flex flex-col gap-3">

          <img
            src={photoPreview}
            alt="Fotografía capturada"
            className="w-full rounded-xl border border-border object-contain"
          />

          <p className="text-sm text-muted-foreground">
            {photo?.name} ·{" "}
            {((photo?.size ?? 0) / 1024).toFixed(2)} KB
          </p>

          <Button
            variant="outline"
            onClick={() => setPhoto(null)}
          >
            <RefreshCw />
            Tomar otra fotografía
          </Button>

        </div>
      )}

      {/* ================================================== */}
      {/* Botones */}
      {/* ================================================== */}

      {!cameraActive && !photo && (
        <Button onClick={startCamera}>
          <Camera />
          Activar cámara
        </Button>
      )}

      {cameraActive && (
        <Button
          onClick={takePhoto}
          disabled={!videoReady}
        >
          <Camera />
          Tomar fotografía
        </Button>
      )}

      {/* ================================================== */}
      {/* Errores */}
      {/* ================================================== */}

      {cameraError && (
        <p className="text-sm text-destructive">
          {cameraError}
        </p>
      )}

    </div>
  );
}
