"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Loader2 } from "lucide-react";
import { ZodFullFormDataType } from "@/lib/zod-schemas/order-schema";

interface RuntScraperModalProps {
  formData: ZodFullFormDataType;
  setFormData: React.Dispatch<React.SetStateAction<ZodFullFormDataType>>;
}

// Opciones de identificación según tu lista
export const ID_DOCUMENT_OPTIONS = [
  { label: "Cédula de Ciudadanía", value: "cedula_ciudadania" },
  { label: "NIT", value: "nit" },
  { label: "Pasaporte", value: "pasaporte" },
  { label: "Cédula de Extranjería", value: "cedula_extranjeria" },
  { label: "Tarjeta de Identidad", value: "tarjeta_identidad" },
  { label: "Registro Civil", value: "registro_civil" },
  { label: "Carnet Diplomático", value: "carnet_diplomatico" },
  { label: "N.N.", value: "nn" },
  { label: "TI2", value: "ti2" },
];

export default function RuntScraperModal({
  formData,
  setFormData,
}: RuntScraperModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Campos locales del formulario del RUNT
  // Estados locales independientes
  const [tipoDocumento, setTipoDocumento] = useState(
    formData.owner_data.tipo_documento || "",
  );
  const [numeroDocumento, setNumeroDocumento] = useState(
    formData.owner_data.numero_documento || "",
  );
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);

  const placa = formData?.vehicle?.placa || "";

  // 1. TANSTACK QUERY: Obtener el Captcha Inicial e ID de Sesión
  const {
    data: captchaData,
    isLoading: isLoadingCaptcha,
    isFetching: isFetchingCaptcha,
    isError: isErrorCaptcha,
  } = useQuery({
    queryKey: ["runtCaptcha", placa],
    queryFn: async () => {
      console.log(`🤖 Despertando scraper en casa para placa: ${placa}`);
      const response = await fetch(
        "https://runt-api.cda-app.com/api/scraper/init",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!response.ok) throw new Error("Error al conectar con el RUNT");

      return response.json(); // Retorna { success: true, sessionId, captchaBase64 }
    },
    enabled: isOpen && !!placa, // Solo se ejecuta si el modal está abierto y hay placa
    staleTime: 0, // Queremos que siempre vaya por un captcha fresco al abrirse
    refetchOnWindowFocus: false,
    // Apenas el componente se desmonte o el 'enabled' pase a false,
    // TanStack Query tirará el captcha viejo al camión de la basura inmediatamente.
    gcTime: 0,
    select: (data) => {
      if (data?.success && data?.captcha) {
        setCaptchaImage(data.captcha);
      } else {
        return;
      }
      return data;
    },
  });

  // 2. TANSTACK MUTATION: Enviar la solución del captcha y datos del RUNT
  const solveRuntMutation = useMutation({
    mutationFn: async (payload: {
      sessionId: string;
      tipoDocumento: string;
      numeroDocumento: string;
      captchaValue: string;
      placa: string;
    }) => {
      console.log("🚀 Enviando solución del captcha al servidor local...");
      const response = await fetch(
        "https://runt-api.cda-app.com/api/scraper/solve",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok)
        throw new Error("Error procesando los datos en el RUNT");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        console.log("✅ Datos extraídos del RUNT con éxito:", data.payload);

        setFormData((prev: ZodFullFormDataType) => ({
          ...prev,
          soat_vencimiento_snapshot:
            data.payload.soat || prev.soat_vencimiento_snapshot,
          vehicle: {
            ...prev.vehicle,
            capacidad_pasajeros:
              data.payload.capacidad_pasajeros ||
              prev.vehicle.capacidad_pasajeros,
            cilindrada:
              data.payload.cilindrada_vehiculo || prev.vehicle.cilindrada,
            clase: data.payload.clase_vehiculo || prev.vehicle.clase,
            color: data.payload.color_vehiculo || prev.vehicle.color,
            combustible:
              data.payload.combustible_vehiculo || prev.vehicle.combustible,
            es_ensenanza:
              data.payload.es_ensenanza || prev.vehicle.es_ensenanza,
            linea: data.payload.lineaVehiculo || prev.vehicle.linea,

            marca: data.payload.marca_vehiculo || prev.vehicle.marca,
            modelo: data.payload.modelo_vehiculo || prev.vehicle.modelo,
            tipo_servicio_vehiculo:
              data.payload.tipo_servicio || prev.vehicle.tipo_servicio_vehiculo,
          },
        }));

        setCaptchaValue(""); // Limpiamos el input
      } else {
        console.log("✅ Error desde el runt:", data.message);
      }
    },
    onError: (error: unknown) => {
      console.error("Error en la mutación:", error);
    },
  });

  // Manejador del cambio de estado del modal
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Sincronizar el documento actual que esté en el formulario antes de abrir
      setNumeroDocumento(formData.owner_data.numero_documento || "");
      setTipoDocumento(formData.owner_data.tipo_documento || "");
    }
    if (!open) setCaptchaValue(""); // Limpiamos el input
    setCaptchaImage(null);
    solveRuntMutation.reset();
  };

  const handleSubmitRunt = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!captchaValue || !numeroDocumento || !captchaData?.sessionId) return;

    // Disparamos la mutación con los datos recolectados
    solveRuntMutation.mutate({
      sessionId: captchaData.sessionId,
      tipoDocumento,
      numeroDocumento,
      captchaValue,
      placa,
    });
  };

  const mutationData = solveRuntMutation.data;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            disabled={!placa}
            className={`
            w-full h-16 gap-2 font-bold rounded-xl transition-all active:scale-95 text-lg
            ${
              placa
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
          >
            <Globe className="h-5 w-5" />
            <span className="hidden md:inline">ACTUALIZAR DATOS VIA RUNT</span>
            <span className="md:hidden">RUNT</span>
          </Button>
        }
      ></DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Consulta Automática RUNT
          </DialogTitle>

          <DialogDescription>
            Buscando información oficial para el vehículo con placas{" "}
            <strong className="text-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">
              {placa}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitRunt} className="space-y-4 pt-2">
          {/* SECCIÓN DE LA IMAGEN DEL CAPTCHA */}
          <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-xl p-3 bg-muted min-h-25 relative">
            {isLoadingCaptcha || isFetchingCaptcha ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Conectando con el RUNT en tiempo real...</span>
              </div>
            ) : captchaImage ? (
              <div className="flex flex-col items-center w-full gap-2">
                <img
                  src={captchaImage}
                  alt="Captcha RUNT"
                  className="h-14 object-contain border border-border bg-card rounded shadow-sm"
                />
              </div>
            ) : isErrorCaptcha ? (
              <div className="text-center p-2">
                <p className="text-xs text-destructive mb-2">
                  No se pudo conectar con el servidor.
                </p>
              </div>
            ) : null}
          </div>

          {/* INPUT PARA ESCRIBIR EL CAPTCHA */}
          <div className="space-y-1">
            <Label htmlFor="captcha" className="text-sm font-semibold">
              Escribe las letras del Captcha
            </Label>

            <Input
              id="captcha"
              type="text"
              placeholder="Ej: AB12"
              value={captchaValue}
              onChange={(e) => setCaptchaValue(e.target.value)}
              className="font-mono text-center tracking-widest text-lg h-11"
              maxLength={6}
              required
              disabled={
                isLoadingCaptcha ||
                solveRuntMutation.isPending ||
                !captchaData?.captcha
              }
            />
          </div>

          {/* SELECT TIPO DE DOCUMENTO */}
          <div className="space-y-1">
            <Label htmlFor="tipoDoc" className="text-sm font-semibold">
              Tipo de Documento del Propietario
            </Label>

            <Select
              items={ID_DOCUMENT_OPTIONS}
              value={tipoDocumento}
              onValueChange={(v) =>
                setTipoDocumento(v ? v : "cedula_ciudadania")
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>

              <SelectContent alignItemWithTrigger={false}>
                {ID_DOCUMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* INPUT NÚMERO DE DOCUMENTO */}
          <div className="space-y-1">
            <Label htmlFor="numDoc" className="text-sm font-semibold">
              Número de Documento
            </Label>

            <Input
              id="numDoc"
              type="text"
              placeholder="Número de identificación"
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
              className="h-11"
              required
              disabled={solveRuntMutation.isPending}
            />
          </div>

          {/* ESTADO */}
          {(solveRuntMutation.isPending ||
            solveRuntMutation.isError ||
            mutationData) && (
            <div
              className={`p-3 rounded-lg border text-sm text-center transition-all ${
                solveRuntMutation.isPending
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : solveRuntMutation.isError || mutationData?.success === false
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {solveRuntMutation.isPending && (
                <div className="flex items-center justify-center gap-2 font-medium animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Buscando datos en el RUNT... Por favor espera.</span>
                </div>
              )}

              {solveRuntMutation.isError && (
                <p className="font-semibold text-destructive">
                  ❌{" "}
                  {(solveRuntMutation.error as Error)?.message ??
                    "Hubo un error de conexión con tu PC local."}
                </p>
              )}

              {mutationData?.success === true && (
                <p className="font-medium">ℹ️ {mutationData.message}</p>
              )}

              {mutationData?.success === false && (
                <p className="font-medium text-destructive">
                  ❌ {mutationData.message}
                </p>
              )}
            </div>
          )}

          {/* BOTONES */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-1/3 h-11"
              disabled={solveRuntMutation.isPending}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="w-2/3 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2"
              disabled={
                isLoadingCaptcha ||
                solveRuntMutation.isPending ||
                !captchaValue ||
                !captchaData?.captcha ||
                solveRuntMutation.isSuccess
              }
            >
              {solveRuntMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {solveRuntMutation.isPending
                ? "Extrayendo..."
                : "Consultar e Importar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
