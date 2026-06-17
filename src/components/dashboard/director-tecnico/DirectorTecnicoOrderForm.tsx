"use client";

import React, { useState } from "react";
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
import { Loader2, ShieldCheck, ShieldAlert, FileSearch } from "lucide-react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import OrderViewPDF from "../_shared/pdfs/OrderViewPDF";
import OrderDownloadPDF from "../_shared/pdfs/OrderDownloadPDF";
import { $ZodIssue } from "zod/v4/core";

import { ZodErrorDialog } from "../recepcionista/ZodErrorDialog";
import { useQueryClient } from "@tanstack/react-query";
import { insertDirectorTecnicoData } from "@/lib/server-actions/insert_director_tecnico_data";



export type ResultadoRevision = "aprobado" | "rechazado" | null;


export interface DirectorTecnicoFormState {
  resultado_revision: ResultadoRevision;
  consecutivo_rtm: string;
  consecutivo_fur: string;
}



interface DirectorTecnicoOrderFormProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
}


const SELECT_RESULTADO = [
  { label: "Aprobado (Emitir Certificado)", value: "aprobado" },
  { label: "Rechazado (Formato de Defectos)", value: "rechazado" },
];



export default function DirectorTecnicoOrderForm({
  orden,
  tenantId,
}: DirectorTecnicoOrderFormProps) {



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
  });

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

    if (formData.resultado_revision === "aprobado" && formData.consecutivo_rtm.trim() === "") {
      alert("Si la revisión es APROBADA, debe ingresar el consecutivo del certificado RTM");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await insertDirectorTecnicoData({
        orderId: orden.id,
        formData: formData,
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
      
      {/* 🌟 SECCIÓN DEL FORMULARIO: Adaptada dinámicamente según el dictamen técnico */}
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

        {/* 🌟 Ajustado a grid-cols-1 en pantallas medianas (md:grid-cols-1) porque ya está dentro de una columna del layout global */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Select: Resultado de la Revisión */}
          <div className="space-y-1.5">
            <Label htmlFor="resultado_revision" className="text-slate-700 font-semibold text-xs">
              Resultado Final de la Inspección
            </Label>
            <Select
              value={formData.resultado_revision || ""}
              onValueChange={(value) => handleSelectChange(value as "aprobado" | "rechazado")}
            >
              <SelectTrigger id="resultado_revision" className="bg-white border-slate-200 font-medium text-xs h-9">
                <SelectValue placeholder="Seleccione el dictamen final" />
              </SelectTrigger>
              <SelectContent>
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
              className="bg-white border-slate-200 font-mono text-xs h-9"
            />
          </div>

          {/* Input: Consecutivo RTM */}
          <div className="space-y-1.5">
            <Label 
              htmlFor="consecutivo_rtm" 
              className={`text-slate-700 font-medium text-xs ${
                formData.resultado_revision === "aprobado" ? "after:content-['_*_'] after:text-red-500" : ""
              }`}
            >
              Consecutivo Certificado RTM
            </Label>
            <Input
              id="consecutivo_rtm"
              name="consecutivo_rtm"
              placeholder={formData.resultado_revision === "rechazado" ? "No aplica por rechazo del vehículo" : "Ej: RTM-2026X"}
              disabled={formData.resultado_revision === "rechazado"}
              value={formData.resultado_revision === "rechazado" ? "" : formData.consecutivo_rtm}
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

      {/* 🌟 BOTÓN DE ACCIÓN PRINCIPAL: Cambia de estilo de acuerdo al dictamen */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className={`w-full font-bold h-10 transition-all rounded-lg shadow-sm gap-2 text-xs text-white ${
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

      {/* MODAL PARA ERRORES DE VALIDACIÓN ZOD */}
      <ZodErrorDialog
        isOpen={showErrorDialog}
        setIsOpen={setShowErrorDialog}
        errors={serverError}
      />
    </form>
  );
}