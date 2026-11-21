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
import { GenericErrorDialog } from "@/components/feedbackDialogs/GenericErrorDialog";
import { useReadCaptchaAction } from "@/lib/client-actions/useReadCaptchaAction";

// ==========================================
// TIPOS GENÉRICOS PARA FLEXIBILIDAD (SIN 'any')
// ==========================================

interface RuntScraperModalProps<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
}

// Restricciones mínimas que necesitamos para que el componente funcione
export type MinimalFormData = {
  vehicle?: { placa?: string };
  owner_data?: { tipo_documento?: string; numero_documento?: string };
  soat_vencimiento_snapshot?: string;
  informacion_buscada?: boolean;
};

export const ID_DOCUMENT_OPTIONS = [
  { label: "Cédula de Ciudadanía", value: "cedula_ciudadania" },
  { label: "NIT", value: "nit" },
  { label: "Pasaporte", value: "pasaporte" },
  { label: "Cédula de Extranjería", value: "cedula_extranjeria" },
  { label: "Tarjeta de Identidad", value: "tarjeta_identidad" },
  { label: "Registro Civil", value: "registro_civil" },
  { label: "Carnet Diplomático", value: "carnet_diplomatico" },
  {
    label: "Permiso por Protección Temporal",
    value: "permiso_por_proteccion_temporal",
  },
];

type RuntExtensionResponse = {
  success: boolean;
  requestId: string;
  message: string;
  captcha?: string;
  tabId?: number | null;
  payload?: Record<string, unknown>;
};

const cerrarPestanaRunt = (tabId?: number) => {
  if (!tabId) return;
  window.postMessage(
    { type: "CLOSE_RUNT_TAB", tabId },
    window.location.origin
  );
};

async function sendExtensionMessage(
  type: string,
  payload: Record<string, unknown> = {}
): Promise<RuntExtensionResponse> {
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  return new Promise<RuntExtensionResponse>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener("message", handleResponse);
      reject(new Error("La extensión no respondió a tiempo"));
    }, 20000);

    function handleResponse(event: MessageEvent) {
      if (event.source !== window) return;
      if (event.data?.type !== "CDAPP_EXTENSION_RESPONSE") return;
      if (event.data?.requestId !== requestId) return;

      window.clearTimeout(timeout);
      window.removeEventListener("message", handleResponse);

      if (!event.data.response?.success) {
        reject(new Error(`Error en la extension: ${event.data.response.message}`));
        return;
      }

      resolve(event.data.response);
    }

    window.addEventListener("message", handleResponse);
    window.postMessage({ type, requestId, ...payload }, window.location.origin);
  });
}

// ==========================================
// COMPONENTE PRINCIPAL (GENÉRICO Y SEGURO)
// ==========================================

export default function RuntScraperModalFirefox<
  T extends MinimalFormData
>({ formData, setFormData }: RuntScraperModalProps<T>) {
  const { readCaptcha } = useReadCaptchaAction();

  const [isOpen, setIsOpen] = useState(false);

  // Optional chaining seguro para que funcione incluso si owner_data no existe en el tipo T
  const [tipoDocumento, setTipoDocumento] = useState(
    formData.owner_data?.tipo_documento || "cedula_ciudadania"
  );
  const [numeroDocumento, setNumeroDocumento] = useState(
    formData.owner_data?.numero_documento || ""
  );
  const [captchaValue, setCaptchaValue] = useState("");

  const [isRtmWarningOpen, setIsRtmWarningOpen] = useState(false);
  const [rtmWarningMessage, setRtmWarningMessage] = useState<string | null>(null);

  const validateRtmExpiration = (fechaStr?: string | null) => {
    if (!fechaStr) return;

    let fechaVencimiento: Date;
    if (fechaStr.includes("T")) {
      const parsedDate = new Date(fechaStr);
      if (Number.isNaN(parsedDate.getTime())) return;
      fechaVencimiento = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
      );
    } else {
      const partes = fechaStr.split(/[-/]/);
      if (partes.length !== 3) return;
      const [year, month, day] = fechaStr.includes("-")
        ? partes.map(Number)
        : [Number(partes[2]), Number(partes[1]), Number(partes[0])];

      fechaVencimiento = new Date(year, month - 1, day);
      if (
        fechaVencimiento.getFullYear() !== year ||
        fechaVencimiento.getMonth() !== month - 1 ||
        fechaVencimiento.getDate() !== day
      ) {
        return;
      }
    }

    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const diasVigentes = Math.round(
      (fechaVencimiento.getTime() - hoy.getTime()) / 86_400_000
    );

    if (diasVigentes > 10) {
      setRtmWarningMessage(
        `ADVERTENCIA: A la RTM todavía le quedan ${diasVigentes} días de vigencia. Por favor, compruebe la fecha y, si corresponde, informe al cliente para solicitar confirmación.`
      );
      setIsRtmWarningOpen(true);
    } else {
      setRtmWarningMessage(null);
      setIsRtmWarningOpen(false);
    }
  };

  // Optional chaining seguro para la placa
  const placa = formData?.vehicle?.placa || "";

  // 1. TANSTACK QUERY: Obtener el Captcha Inicial
  const {
    data: captchaData,
    isLoading: isLoadingCaptcha,
    isFetching: isFetchingCaptcha,
    isError: isErrorCaptcha,
  } = useQuery({
    queryKey: ["runtCaptcha", placa],
    queryFn: async () => {
      console.log("🦊 Solicitando CAPTCHA a Firefox...");
      const response = await sendExtensionMessage("REQUEST_CAPTCHA");
      console.log("🦊 Informacion de Firefox Recibida Correctamente.");

      if (response.success && response.captcha) {
        try {
          const textoCaptcha = await readCaptcha(response.captcha);
          if (textoCaptcha) {
            setCaptchaValue(textoCaptcha);
          }
        } catch (error) {
          console.warn("No se pudo autocompletar el captcha con IA:", error);
        }
      }
      return response;
    },
    enabled: isOpen && !!placa,
    staleTime: 0,
    refetchOnWindowFocus: false,
    gcTime: 0,
  });

  const captchaImage =
    captchaData?.success && captchaData?.captcha ? captchaData.captcha : null;

  // 2. TANSTACK MUTATION: Enviar la solución del captcha
  const solveRuntMutation = useMutation({
    mutationFn: async (payload: {
      tabId: number | null;
      tipoDocumento: string;
      numeroDocumento: string;
      captchaValue: string;
      placa: string;
    }) => {
      console.log("🚀 Enviando solución del captcha a la extensión...");
      const response = await sendExtensionMessage("REQUEST_DATA", {
        tabId: payload.tabId,
        tipoDocumento: payload.tipoDocumento,
        numeroDocumento: payload.numeroDocumento,
        captchaValue: payload.captchaValue,
        placa: payload.placa,
      });
      return response;
    },
    onSuccess: (data) => {
      if (!data.success || !data.payload) {
        console.log("⚠️ La extensión devolvió error o sin payload:", data);
        return;
      }

      const runtPayload = data.payload as Record<string, unknown>;
      validateRtmExpiration(runtPayload.fecha_vencimiento_RTM as string);

      setFormData((prev) => {
        // Tipado estricto sin usar 'any'. Intersectamos T con la forma que esperamos actualizar.
        type PrevShape = T & {
          soat_vencimiento_snapshot?: string;
          vehicle?: {
            placa?: string;
            capacidad_pasajeros?: string;
            cilindrada?: string;
            clase?: string;
            color?: string;
            combustible?: string;
            es_ensenanza?: boolean;
            linea?: string;
            marca?: string;
            modelo?: string;
            tipo_servicio_vehiculo?: string;
            fecha_vencimiento_rtm?: string;
            organismo_que_expidio_ultima_rtm?: string;
            rtm_vigente_de_acuerdo_al_runt?: string | boolean;
            se_encontro_fecha_vencimiento_rtm?: string | boolean;
            fecha_matricula?: string;
            soat_vigente_de_acuerdo_al_runt?: string | boolean;
          };
        };

        const prevData = prev as PrevShape;
        const currentVehicle = prevData.vehicle || {};

        // Construimos el nuevo objeto de forma segura
        const updatedForm: PrevShape = {
          ...prev,
          informacion_buscada: true,
          vehicle: {
            ...currentVehicle,
            placa: currentVehicle.placa || placa,
            capacidad_pasajeros:
              (runtPayload.capacidad_pasajeros as string) ||
              currentVehicle.capacidad_pasajeros ||
              "",
            cilindrada:
              (runtPayload.cilindrada_vehiculo as string) ||
              currentVehicle.cilindrada ||
              "",
            clase:
              (runtPayload.clase_vehiculo as string) || currentVehicle.clase || "",
            color:
              (runtPayload.color_vehiculo as string) || currentVehicle.color || "",
            combustible:
              (runtPayload.combustible_vehiculo as string) ||
              currentVehicle.combustible ||
              "",
            es_ensenanza:
              (runtPayload.es_ensenanza as boolean) ??
              currentVehicle.es_ensenanza ??
              false,
            linea:
              (runtPayload.lineaVehiculo as string) || currentVehicle.linea || "",
            marca:
              (runtPayload.marca_vehiculo as string) || currentVehicle.marca || "",
            modelo:
              (runtPayload.modelo_vehiculo as string) || currentVehicle.modelo || "",
            tipo_servicio_vehiculo:
              (runtPayload.tipo_servicio as string) ||
              currentVehicle.tipo_servicio_vehiculo ||
              "",
            fecha_vencimiento_rtm:
              (runtPayload.fecha_vencimiento_RTM as string) ||
              currentVehicle.fecha_vencimiento_rtm ||
              "",
            organismo_que_expidio_ultima_rtm:
              (runtPayload.organismo_que_expidio_la_ultima_RTM as string) ||
              currentVehicle.organismo_que_expidio_ultima_rtm ||
              "",
            rtm_vigente_de_acuerdo_al_runt:
              runtPayload.RTM_vigente_de_acuerdo_al_runt !== undefined
                ? String(runtPayload.RTM_vigente_de_acuerdo_al_runt)
                : currentVehicle.rtm_vigente_de_acuerdo_al_runt || "",
            se_encontro_fecha_vencimiento_rtm:
              runtPayload.se_encontro_fecha_vencimiento_RTM !== undefined
                ? String(runtPayload.se_encontro_fecha_vencimiento_RTM)
                : currentVehicle.se_encontro_fecha_vencimiento_rtm || "",
            fecha_matricula:
              (runtPayload.fecha_matricula as string) ||
              currentVehicle.fecha_matricula ||
              "",
            soat_vigente_de_acuerdo_al_runt:
              (runtPayload.SOAT_vigente_de_acuerdo_al_RUNT as string) ||
              currentVehicle.soat_vigente_de_acuerdo_al_runt ||
              "",
          },
        };

        // Actualizamos condicionalmente solo si la propiedad ya existía en el estado anterior
        if (prevData.soat_vencimiento_snapshot !== undefined) {
          updatedForm.soat_vencimiento_snapshot =
            (runtPayload.soat as string) || prevData.soat_vencimiento_snapshot;
        }

        // Retornamos casteado a T, que es el tipo que espera setFormData
        return updatedForm as T;
      });

      setCaptchaValue("");
    },
    onError: (error: unknown) => {
      console.error("Error en la mutación:", error);
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (open) {
      setNumeroDocumento(formData.owner_data?.numero_documento || "");
      setTipoDocumento(formData.owner_data?.tipo_documento || "cedula_ciudadania");
    }

    if (!open) {
      setCaptchaValue("");
      cerrarPestanaRunt(captchaData?.tabId ?? undefined);
    }

    solveRuntMutation.reset();
  };

  const handleSubmitRunt = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!captchaValue || !numeroDocumento || !captchaData?.requestId) return;

    solveRuntMutation.mutate({
      tabId: captchaData.tabId ?? null,
      tipoDocumento,
      numeroDocumento,
      captchaValue,
      placa,
    });
  };

  const mutationData = solveRuntMutation.data;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {/* Sintaxis exacta de tu código original con la prop 'render' */}
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
              <span className="hidden md:inline">
                ACTUALIZAR DATOS VIA RUNT
              </span>
              <span className="md:hidden">RUNT</span>
            </Button>
          }
        ></DialogTrigger>

        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Consulta Automática RUNT
            </DialogTitle>
            <DialogDescription>
              Buscando información oficial para el vehículo con placas{" "}
              <strong className="text-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">
                {placa || "N/A"}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRunt} className="space-y-4 pt-2">
            {/* SELECT TIPO DE DOCUMENTO */}
            <div className="space-y-1">
              <Label htmlFor="tipoDoc" className="text-sm font-semibold">
                Tipo de Documento del Propietario
              </Label>
              <Select
                items={ID_DOCUMENT_OPTIONS}
                value={tipoDocumento}
                onValueChange={(v) => setTipoDocumento(v || "cedula_ciudadania")}
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

            {/* SECCIÓN DE LA IMAGEN DEL CAPTCHA */}
            <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-xl p-3 bg-muted min-h-[100px] relative">
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
                {solveRuntMutation.isPending ? "Extrayendo..." : "Consultar e Importar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <GenericErrorDialog
        isOpen={isRtmWarningOpen}
        setIsOpen={setIsRtmWarningOpen}
        headerText="Advertencia sobre la vigencia de la RTM"
        descriptionText="Verifica la información obtenida del RUNT."
        errors={rtmWarningMessage}
      />
    </>
  );
}