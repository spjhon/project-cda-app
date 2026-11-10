
"use client";

// ============================================================
// Imports
// ============================================================

import { useEffect, useRef, useState } from "react";
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
  const [cameraError, setCameraError] = useState<string | null>(null);

  // ==========================================================
  // Activar cámara
  // ==========================================================

  const startCamera = async () => {
    try {
      setCameraError(null);

      // Solicitar acceso a la cámara.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

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
  };

  // ==========================================================
  // Tomar fotografía
  // ==========================================================

  const takePhoto = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

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
    };
  }, []);

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="flex w-full max-w-md flex-col gap-4">

      {/* Cámara */}

      {cameraActive && (
        <div className="relative overflow-hidden rounded-xl border border-border">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="aspect-[4/3] w-full bg-black object-cover"
          />

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

      {/* Fotografía capturada */}

      {photo && (
        <div className="flex flex-col gap-3">
          <img
            src={URL.createObjectURL(photo)}
            alt="Fotografía capturada"
            className="w-full rounded-xl border border-border object-contain"
          />

          <p className="text-sm text-muted-foreground">
            {photo.name} · {(photo.size / 1024).toFixed(2)} KB
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

      {/* Botones */}

      {!cameraActive && !photo && (
        <Button onClick={startCamera}>
          <Camera />
          Activar cámara
        </Button>
      )}

      {cameraActive && (
        <Button onClick={takePhoto}>
          <Camera />
          Tomar fotografía
        </Button>
      )}

      {/* Errores */}

      {cameraError && (
        <p className="text-sm text-destructive">
          {cameraError}
        </p>
      )}

    </div>
  );
}
