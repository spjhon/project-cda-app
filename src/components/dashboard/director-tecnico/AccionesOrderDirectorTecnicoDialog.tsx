"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, Receipt, ShieldCheck, ShieldAlert } from "lucide-react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import DirectorTecnicoOrderForm from "./DirectorTecnicoOrderForm";

interface AccionesOrderDirectorTecnicoDialogProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
  rol: string | undefined;
}

export default function AccionesOrderDirectorTecnicoDialog({
  orden,
  tenantId,
  rol,
}: AccionesOrderDirectorTecnicoDialogProps) {
  
  // Control de seguridad perimetral
  if (!rol) {
    console.log("Acción denegada: El rol actual es undefined");
    return null;
  }

  // Filtrado de renderizado exclusivo para el Director Técnico
  if (rol !== "director-tecnico") {
    return null;
  }

  // Formateador de moneda colombiana (COP)
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "$0";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog>
      <DialogTrigger render={(props) => (
        <Button
          {...props}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-slate-900"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir operaciones Director Técnico</span>
        </Button>
      )} />

      {/* 🌟 Ampliado a max-w-5xl o max-w-6xl para dar perfecto soporte a la UI de doble columna */}
      <DialogContent className="sm:max-w-5xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-center flex flex-col items-center border-b border-slate-100 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 justify-center">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Auditoría de Dirección Técnica
          </DialogTitle>
          
          <DialogDescription className="text-slate-500 text-sm mt-1 max-w-md text-center">
            Módulo de revisión técnica y control de calidad ISO 17020 para la validez del servicio.
          </DialogDescription>
        </DialogHeader>

        {/* 🌟 CONTENEDOR PRINCIPAL: Rejilla inteligente de doble columna */}
        {/* En móvil (por defecto) es 1 sola columna. En pantallas grandes (lg) se divide en 2 columnas equilibradas con espacio de 6 unidades */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* ================================================================= */}
          {/* COLUMNA IZQUIERDA: DATOS HISTÓRICOS Y AUDITORÍA DE ENTRADA        */}
          {/* ================================================================= */}
          <div className="space-y-5">
            
            {/* SECCIÓN A: FICHA TÉCNICA DEL VEHÍCULO Y ACTORES */}
            <div className="bg-slate-100/80 p-5 rounded-xl border border-slate-200/60">
              <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-3 mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ficha Técnica de Entrada
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-md tracking-widest uppercase shadow-sm">
                    {orden.placa || "S.P"}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    orden.estado_orden === "anulada" 
                      ? "bg-red-50 text-red-700 border-red-200" 
                      : orden.estado_orden === "en_prueba"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}>
                    {orden.estado_orden?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Grid Informativo Principal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium mb-0.5">Propietario</span>
                  <span className="text-slate-800 font-semibold block truncate">{orden.propietario_nombre || "N/A"}</span>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {orden.propietario_tipo_documento?.toUpperCase()}: {orden.propietario_documento}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-0.5">Cliente / Conductor</span>
                  <span className="text-slate-800 font-semibold block truncate">{orden.cliente_nombre || "N/A"}</span>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {orden.cliente_tipo_documento?.toUpperCase()}: {orden.cliente_documento}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-0.5">Línea del Vehículo</span>
                  <span className="text-slate-800 font-semibold block truncate mt-0.5">
                    {orden.marca?.toUpperCase()} - {orden.linea?.toUpperCase() || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-0.5">Servicio Solicitado</span>
                  <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 uppercase border border-amber-200 w-fit">
                    {orden.service_type || "RTM"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-0.5">¿Es Reinspección?</span>
                  <span className={`font-semibold block mt-0.5 ${orden.es_reinspeccion ? "text-orange-600" : "text-slate-600"}`}>
                    {orden.es_reinspeccion ? "SÍ (Segunda Entrada)" : "NO (Primera Vez)"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-0.5">Kilometraje</span>
                  <span className="text-slate-800 font-semibold block mt-0.5">{orden.kilometraje || "0"} Km</span>
                </div>
              </div>
            </div>

            {/* SECCIÓN B: LIQUIDACIÓN DE OFICINA + VERIFICACIÓN DE SOAT */}
            <div className="bg-emerald-50/40 p-5 rounded-xl border border-emerald-100/80">
              <div className="flex items-center gap-2 border-b border-emerald-100 pb-3 mb-4">
                <Receipt className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Datos de Recaudo y Liquidación de Oficina
                </span>
              </div>

              {/* Grid Informativo de la Oficina */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs mb-1">
                <div>
                  <span className="text-slate-400 block font-medium mb-0.5">Consecutivo Factura</span>
                  <span className="text-slate-800 font-bold block bg-white px-2.5 py-1 rounded border border-slate-200 w-fit font-mono mt-0.5">
                    {orden.oficina_consecutivo_factura || "SIN ASIGNAR"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-0.5">PIN del RUNT</span>
                  <span className="text-slate-800 font-mono font-semibold block mt-1 tracking-wider truncate">
                    {orden.oficina_pin || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-0.5">Valor Recaudado</span>
                  <span className="text-emerald-700 font-bold block text-sm mt-0.5">
                    {formatCurrency(orden.oficina_pago)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-0.5">Método de Pago</span>
                  <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200 uppercase w-fit">
                    {orden.oficina_tipo_pago || "No registrado"}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-400 block font-medium mb-0.5">¿Se compró SOAT también?</span>
                  {orden.se_compro_soat ? (
                    <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase w-fit">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      SÍ (Gestionado en CDA)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase w-fit">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                      NO (Traía póliza externa)
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ================================================================= */}
          {/* COLUMNA DERECHA: FORMULARIO ACTIVO DEL DIRECTOR TÉCNICO           */}
          {/* ================================================================= */}
          <div className="lg:border-l lg:border-slate-100 lg:pl-6">
            <DirectorTecnicoOrderForm orden={orden} tenantId={tenantId} />
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}