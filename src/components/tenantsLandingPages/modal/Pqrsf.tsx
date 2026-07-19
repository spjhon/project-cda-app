"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { radicarPQAF } from "@/lib/server-actions/radicarPQAF";

interface PqrsfFormData {
  tipoTramite: string;
  nombreCompleto: string;
  telefono: string;
  correo: string;
  placa: string;
  descripcion: string;
  habeasData: boolean;
  honeypot: string;
}

const tramitesDisponibles = [
  { label: "Petición", value: "peticion" },
  { label: "Queja", value: "queja" },
  { label: "Apelación", value: "apelacion" },
  { label: "Felicitación", value: "felicitacion" },
];

interface PqrsfModalProps {
  tenant: string;
}

export default function PqrsfModal({ tenant }: PqrsfModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PqrsfFormData>({
    tipoTramite: "",
    nombreCompleto: "",
    telefono: "",
    correo: "",
    placa: "",
    descripcion: "",
    habeasData: false,
    honeypot: "",
  });

  const [actionResult, setActionResult] = useState<{
    success: boolean;
    motive: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      tipoTramite: value ?? "",
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      habeasData: checked,
    }));
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    // Si el diálogo se está abriendo, limpiamos el resultado de la acción anterior
    if (isOpen) {
      setActionResult(null);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsSubmitting(true);
    setActionResult(null);

    if (formData.honeypot) return;
    console.log("Datos listos para enviar para el tenant:", tenant, formData);

    try {
      // 1. Intentamos llamar al Server Action
      const result = await radicarPQAF(tenant, formData);

      // Si el servidor respondió (bien o mal), guardamos su respuesta
      if (result) {
        setActionResult({
          success: result.success,
          motive:
            result.motive ||
            "Ocurrió un error inesperado al procesar la solicitud.",
        });
      } else {
        setActionResult(null);
      }

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          tipoTramite: "",
          nombreCompleto: "",
          telefono: "",
          correo: "",
          placa: "",
          descripcion: "",
          habeasData: false,
          honeypot: "",
        }));
      }
    } catch (error) {
      // 2. CAPTURA DE CAÍDAS DE RED / SERVIDOR (Offline, Error 500, Red caída)
      console.error("Error de comunicación con el servidor:", error);

      // Aquí forzamos el estado de error en el cliente de forma manual
      setActionResult({
        success: false,
        motive:
          "No logramos conectar con el servidor. Por favor, revisa tu conexión a internet o inténtalo de nuevo en unos minutos.",
      });
    } finally {
      // Esto se ejecuta SIEMPRE (haya o no error) para apagar el estado "Cargando..."
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="w-full sm:w-auto h-12 bg-[#051923] dark:bg-[#00a6fb] text-white dark:text-[#051923] hover:bg-[#006494] dark:hover:bg-[#0582ca] text-sm font-bold tracking-tight rounded-xl px-10 shadow-md transition-all">
            Radicar una Solicitud Oficial
          </Button>
        }
      ></DialogTrigger>

      <DialogContent className="max-w-xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-[#051923] border border-[#006494]/10 dark:border-[#00a6fb]/20 rounded-2xl p-6 md:p-8 shadow-lg">
        <DialogHeader className="mb-4 text-center sm:text-left">
          <DialogTitle className="text-2xl font-extrabold text-[#051923] dark:text-[#00a6fb] tracking-tight">
            Radicar Solicitud Oficial
          </DialogTitle>
          <DialogDescription className="text-sm font-normal text-[#003554]/70 dark:text-white/60 mt-1">
            Por favor completa todos los campos obligatorios para dar trámite a
            tu requerimiento en cdApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5 overflow-y-auto pr-2 flex-1 max-h-[65vh]">
          {/* Honeypot anti-spam */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Tipo de Trámite */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#051923] dark:text-white uppercase tracking-wider">
              Tipo de Trámite <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.tipoTramite}
              onValueChange={handleSelectChange}
              items={tramitesDisponibles}
            >
              <SelectTrigger className="w-full h-11 border-black dark:border-white/20 rounded-xl bg-card">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {tramitesDisponibles.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Nombre Completo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#051923] dark:text-white uppercase tracking-wider">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <Input
              required
              type="text"
              name="nombreCompleto"
              placeholder="Ej. Juan Pérez"
              value={formData.nombreCompleto}
              onChange={handleChange}
              className="h-11 border-black dark:border-white/20 rounded-xl bg-card focus-visible:ring-[#006494]"
            />
          </div>

          {/* Teléfono y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#051923] dark:text-white uppercase tracking-wider">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <Input
                required
                type="tel"
                name="telefono"
                placeholder="Ej. 3001234567"
                value={formData.telefono}
                onChange={handleChange}
                className="h-11 border-black dark:border-white/20 rounded-xl bg-card focus-visible:ring-[#006494]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#051923] dark:text-white uppercase tracking-wider">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <Input
                required
                type="email"
                name="correo"
                placeholder="Ej. juan@correo.com"
                value={formData.correo}
                onChange={handleChange}
                className="h-11 border-black dark:border-white/20 rounded-xl bg-card focus-visible:ring-[#006494]"
              />
            </div>
          </div>

          {/* Placa de Vehículo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#051923] dark:text-white uppercase tracking-wider">
              Placa de Vehículo{" "}
              <span className="text-gray-400 dark:text-gray-500">
                (Opcional)
              </span>
            </label>
            <Input
              type="text"
              name="placa"
              placeholder="Ej. ABC12D"
              value={formData.placa}
              onChange={handleChange}
              className="h-11 border-black dark:border-white/20 rounded-xl bg-card focus-visible:ring-[#006494] uppercase"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#051923] dark:text-white uppercase tracking-wider">
              Descripción de los hechos <span className="text-red-500">*</span>
            </label>
            <Textarea
              required
              name="descripcion"
              rows={4}
              placeholder="Describe detalladamente los hechos, motivos o sugerencia..."
              value={formData.descripcion}
              onChange={handleChange}
              className="border-black dark:border-white/20 rounded-xl bg-card focus-visible:ring-[#006494] resize-none leading-relaxed"
            />
          </div>

          {/* Checkbox y Sub-Dialog de Habeas Data */}
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="habeasData"
              checked={formData.habeasData}
              onCheckedChange={handleCheckboxChange}
              className="mt-1 border-black dark:border-white/40 data-[state=checked]:bg-[#006494] dark:data-[state=checked]:bg-[#00a6fb]"
            />

            {/* Cambiamos <label> por <div> para permitir elementos interactivos dentro sin romper el DOM */}
            <div className="text-xs font-normal text-[#003554]/80 dark:text-white/70 leading-normal">
              {/* Este label solo envuelve el texto plano inicial, así el clic aquí sí activa el checkbox */}
              <label htmlFor="habeasData" className="cursor-pointer">
                Acepto los términos, condiciones y la política de tratamiento de
                datos personales de acuerdo con la ley de{" "}
              </label>

              <Dialog>
                <DialogTrigger className="font-bold underline text-[#006494] dark:text-[#00a6fb] cursor-pointer hover:opacity-80 transition-opacity bg-transparent p-0 border-none inline align-baseline">
                  Habeas Data
                </DialogTrigger>
                <DialogContent className="max-w-lg bg-white dark:bg-[#051923] border border-[#006494]/20 dark:border-[#00a6fb]/20 rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-[#051923] dark:text-white">
                      Política de Tratamiento de Datos (Ley 1581 de 2012)
                    </DialogTitle>
                    <DialogDescription className="text-sm font-normal text-[#003554]/70 dark:text-white/60 leading-relaxed pt-3 text-left space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                      En cumplimiento de la Ley Estatutaria 1581 de 2012 por la
                      cual se dictan disposiciones generales para la protección
                      de datos personales (Habeas Data), el sistema informa que
                      los datos suministrados en este formulario serán tratados
                      de forma segura y confidencial.
                      <br />
                      <br />
                      La finalidad de la recolección de estos datos es
                      exclusivamente gestionar, evaluar y dar respuesta formal a
                      las peticiones, quejas, reclamos, apelaciones y
                      felicitaciones interpuestas por nuestros usuarios,
                      garantizando la trazabilidad bajo las directrices exigidas
                      por nuestros entes reguladores de acreditación y
                      certificación.
                      <br />
                      <br />
                      Como titular de la información, usted tiene derecho a
                      conocer, actualizar, rectificar y solicitar la supresión
                      de sus datos personales en cualquier momento a través de
                      nuestros canales de atención oficiales habilitados.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <span>.</span>
              <span className="text-red-500">*</span>
            </div>
          </div>

          <div className="pt-3">
            {/* Div de Estado / Alerta del Server Action */}
            {actionResult && (
              <div
                className={`flex items-start gap-3 p-4 rounded-xl border text-sm transition-all animate-in fade-in duration-200 ${
                  actionResult.success
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400"
                    : "bg-destructive/10 dark:bg-destructive/10 border-destructive/20 dark:border-destructive/30 text-destructive dark:text-red-400"
                }`}
              >
                {actionResult.success ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">
                    {actionResult.success
                      ? "¡Radicado Exitoso!"
                      : "Error en el Radicado"}
                  </span>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {actionResult.motive}
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 my-3 bg-[#051923] dark:bg-[#00a6fb] text-white dark:text-[#051923] hover:bg-[#006494] dark:hover:bg-[#0582ca] text-sm font-bold tracking-tight rounded-xl shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Radicando..." : "Radicar Requerimiento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
