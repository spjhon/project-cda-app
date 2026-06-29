"use client";

import React, { useContext, useState } from "react";
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
import { Loader2, ShieldCheck, ShieldAlert, FileSearch, Ban } from "lucide-react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import OrderViewPDF from "../_shared/pdfs/OrderViewPDF";
import OrderDownloadPDF from "../_shared/pdfs/OrderDownloadPDF";
import { $ZodIssue } from "zod/v4/core";

import { ZodErrorDialog } from "../recepcionista/ZodErrorDialog";
import { UseMutateFunction, useQueryClient } from "@tanstack/react-query";
import { insertDirectorTecnicoData } from "@/lib/server-actions/insert_director_tecnico_data";
import CancelOrder from "../_shared/CancelOrder";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import { ServiceType } from "@/lib/zod-schemas/order-schema";

export type ResultadoRevision = "aprobado" | "rechazado" | null;

export interface DirectorTecnicoFormState {
  resultado_revision: ResultadoRevision;
  consecutivo_rtm: string;
  consecutivo_fur: string;
  director_tecnico_tipo_documento_snapshot: string | null;
  director_tecnico_numero_documento_snapshot: string | null;
  director_tecnico_nombre_snapshot: string | null;
  director_tecnico_firma_base64_snapshot: string | null;
}

interface DirectorTecnicoOrderFormProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
  mutation: {
    cancelOrder: UseMutateFunction<string, Error, { id: string; tenantId: string; }, unknown>;
    isCancelingOrder: boolean;
    errorCancelingOrder: Error | null;
    resetCancelError: () => void;
  };
}

const SELECT_RESULTADO = [
  { label: "Aprobado (Emitir Certificado)", value: "aprobado" },
  { label: "Rechazado (Formato de Defectos)", value: "rechazado" },
];

export default function DirectorTecnicoOrderForm({
  orden,
  tenantId,
  mutation
}: DirectorTecnicoOrderFormProps) {

  const PermissioncontextRecived = useContext(PermissionsContext);

  const user = PermissioncontextRecived?.PermissionsContextValue.user;



  const queryClient = useQueryClient();

  // Estados para el Dialog de errores de Zod
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<$ZodIssue[] | null | string>(null);

  // Inicialización mapeando los datos existentes de la orden
  const [formData, setFormData] = useState<DirectorTecnicoFormState>({
    resultado_revision: (orden.resultado_revision as ResultadoRevision) || null,
    consecutivo_rtm: orden.consecutivo_rtm || "",
    consecutivo_fur: orden.consecutivo_fur || "",
    director_tecnico_tipo_documento_snapshot: user?.document_type ?? null,
    director_tecnico_numero_documento_snapshot: user?.document_number ?? null,
    director_tecnico_nombre_snapshot: user?.name ?? null,
    director_tecnico_firma_base64_snapshot: user?.signature_base64 ?? null

  });

  // 🌟 CONTROL: Identificar si es un tipo de servicio que exime de certificado oficial RTM
  const tipoServicioLower = orden.service_type?.toLowerCase() || "";
  const noAplicaRTM = tipoServicioLower === "preventiva" || tipoServicioLower === "peritaje";

  // Manejador para inputs de texto (RTM y FUR)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejador para el Select de Aprobado/Rechazado
  const handleSelectChange = (value: "aprobado" | "rechazado") => {
    setFormData((prev) => ({ ...prev, resultado_revision: value }));
  };

  // Validación local y envío de datos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setServerError(null);

    if (!formData.resultado_revision) {
      alert("Debe seleccionar el resultado final de la revisión (Aprobado o Rechazado)");
      setIsSubmitting(false);
      return;
    }

    if (formData.consecutivo_fur.trim() === "") {
      alert("El consecutivo del FUR es obligatorio para el cierre técnico");
      setIsSubmitting(false);
      return;
    }

    // 🌟 AJUSTADO: Solo exige RTM si es aprobado Y NO es ni preventiva ni peritaje
    if (!noAplicaRTM && formData.resultado_revision === "aprobado" && formData.consecutivo_rtm.trim() === "") {
      alert("Si la revisión es APROBADA, debe ingresar el consecutivo del certificado RTM");
      setIsSubmitting(false);
      return;
    }

    // Aseguramos mandar data limpia al server action en caso de que no aplique RTM
    const payloadData = {
      ...formData,
      consecutivo_rtm: noAplicaRTM ? "" : formData.consecutivo_rtm,
     
    };

    

    try {
      const { data, error } = await insertDirectorTecnicoData({
        orderId: orden.id,
        formData: payloadData,
        serviceType: orden.service_type as ServiceType,
      });

      if (error || !data) {
        setServerError(error);
        setShowErrorDialog(true);
        return;
      } else {
        alert(data);
        queryClient.invalidateQueries({ queryKey: ["entry-orders", "list"] });
      }
    } catch (error: unknown) {
      alert("Ocurrió un error inesperado en la validación técnica: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* SECCIÓN DEL FORMULARIO: Adaptada dinámicamente según el dictamen técnico */}
      <div className={`p-4 rounded-xl border transition-all duration-300 space-y-4 ${
        formData.resultado_revision === "aprobado"
          ? "bg-emerald-50/20 border-emerald-200/60"
          : formData.resultado_revision === "rechazado"
          ? "bg-rose-50/10 border-rose-200/40"
          : "bg-slate-50 border-slate-200"
      }`}>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-200 pb-1.5">
          Cierre Técnico de Inspección (ISO 17020)
        </span>

        {/* Rejilla de Inputs de digitación técnica */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Select: Resultado de la Revisión */}
          <div className="space-y-1.5">
            <Label htmlFor="resultado_revision" className="text-slate-700 font-semibold text-xs">
              Resultado Final de la Inspección
            </Label>
            <Select
              items={SELECT_RESULTADO}
              value={formData.resultado_revision || ""}
              onValueChange={(value) => handleSelectChange(value as "aprobado" | "rechazado")}
              disabled={orden.estado_orden !== "en_prueba"} 
            >
              <SelectTrigger id="resultado_revision" className="bg-white border-slate-200 font-medium text-xs h-9">
                <SelectValue placeholder="Seleccione el dictamen final" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {SELECT_RESULTADO.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input: Consecutivo FUR */}
          <div className="space-y-1.5">
            <Label htmlFor="consecutivo_fur" className="text-slate-700 font-medium text-xs">
              Consecutivo FUR (Formato Único de Resultados)
            </Label>
            <Input
              id="consecutivo_fur"
              name="consecutivo_fur"
              placeholder="Ej: FUR-482012"
              value={formData.consecutivo_fur}
              onChange={handleChange}
              disabled={orden.estado_orden !== "en_prueba"} 
              className="bg-white border-slate-200 font-mono text-xs h-9"
            />
          </div>

          {/* Input: Consecutivo RTM (Controlado por tipo de servicio) */}
          <div className="space-y-1.5">
            <Label 
              htmlFor="consecutivo_rtm" 
              className={`text-slate-700 font-medium text-xs ${
                formData.resultado_revision === "aprobado" && !noAplicaRTM ? "after:content-['_*_'] after:text-red-500" : ""
              }`}
            >
              Consecutivo Certificado RTM
            </Label>
            <Input
              id="consecutivo_rtm"
              name="consecutivo_rtm"
              placeholder={
                noAplicaRTM 
                  ? `No aplica para servicio de ${orden.service_type?.toUpperCase()}` 
                  : formData.resultado_revision === "rechazado" 
                  ? "No aplica por rechazo del vehículo" 
                  : "Ej: RTM-2026X"
              }
              disabled={noAplicaRTM || formData.resultado_revision === "rechazado" || orden.estado_orden !== "en_prueba" || !formData.resultado_revision}
              value={noAplicaRTM || formData.resultado_revision === "rechazado" ? "" : formData.consecutivo_rtm}
              onChange={handleChange}
              className="bg-white border-slate-200 font-mono text-xs h-9 disabled:bg-slate-100/80 disabled:text-slate-400 disabled:cursor-not-allowed"
            />
          </div>

        </div>
      </div>

      {/* SECCIÓN DOCUMENTAL: SOPORTES DIGITALES */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 pl-1">
          <FileSearch className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Soportes Digitales de Entrada
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-100/50 rounded-xl border border-slate-200/60">
          <OrderViewPDF orderId={orden.id} tenantId={tenantId} />
          <OrderDownloadPDF orderId={orden.id} tenantId={tenantId} />
        </div>
      </div>

      {/* CONTENEDOR DE ACCIONES DINÁMICO */}
      <div className={`flex flex-col items-center justify-center p-4 rounded-xl border w-full transition-colors duration-200 ${
        orden.estado_orden !== "en_prueba"
          ? "bg-red-50/50 border-red-100/50"     
          : "bg-stone-50/50 border-stone-100/50" 
      }`}>

        {orden.estado_orden !== "en_prueba" ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-100/60 px-4 py-2.5 rounded-lg border border-red-200/80 shadow-xs animate-fade-in select-none text-center">
            <Ban className="h-4 w-4 shrink-0" />
            <span>
              {orden.estado_orden === "anulada" && "Esta orden ya fue anulada"}
              {orden.estado_orden === "finalizada" && "No se pueden modificar ni anular los datos porque la orden ya se encuentra FINALIZADA"}
              {orden.estado_orden === "abierta" && "No se puede realizar el cierre técnico porque todavía no se han ingresado datos de PIN y factura en oficina"}
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            
            {/* Botón Izquierdo: Anular Orden */}
            <div className="w-full sm:w-auto order-2 sm:order-1">
              <CancelOrder
                orden={orden}
                tenantId={tenantId}
                mutation={mutation}
              />
            </div>

            {/* Botón Derecho: Guardar Cierre Técnico */}
            <div className="w-full sm:w-auto order-1 sm:order-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto font-bold h-10 transition-all rounded-lg shadow-sm gap-2 text-xs text-white px-5 ${
                  formData.resultado_revision === "aprobado"
                    ? "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/70"
                    : formData.resultado_revision === "rechazado"
                    ? "bg-slate-800 hover:bg-slate-900 disabled:bg-slate-800/70"
                    : "bg-slate-900 hover:bg-slate-800 disabled:bg-slate-900/70"
                } disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Firmando y subiendo a plataforma RUNT...</span>
                  </>
                ) : formData.resultado_revision === "rechazado" ? (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    <span>Cerrar con Defectos (Rechazado)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Firmar y Emitir Certificado</span>
                  </>
                )}
              </Button>
            </div>

          </div>
        )}
      </div>

      <ZodErrorDialog
        isOpen={showErrorDialog}
        setIsOpen={setShowErrorDialog}
        errors={serverError}
      />
    </form>
  );
}