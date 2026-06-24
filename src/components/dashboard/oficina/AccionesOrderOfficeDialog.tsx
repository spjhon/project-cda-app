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
import { MoreHorizontal, FileText } from "lucide-react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import OfficeOrderForm from "./OfficeOrderForm";
import { UseMutateFunction } from "@tanstack/react-query";


interface AccionesOrderOfficeDialogProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
  rol: string | undefined;
  mutation: {
    cancelOrder: UseMutateFunction<string, Error, { id: string; tenantId: string; }, unknown>;
    isCancelingOrder: boolean;
    errorCancelingOrder: Error | null;
    resetCancelError: () => void;
  };
}

export default function AccionesOrderOfficeDialog({
  orden,
  tenantId,
  rol,
  mutation,
}: AccionesOrderOfficeDialogProps) {
  
  // 🌟 Control 1: Validación estricta perimetral de roles
  if (!rol) {
    console.log("Acción denegada: El rol actual es undefined");
    return null;
  }

  // Filtrado de renderizado: Este componente está optimizado para perfiles de Oficina
  if (rol !== "oficina") {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger render={
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-slate-900"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir operaciones oficina</span>
        </Button>
      }>
        
      </DialogTrigger>

      {/* 🛠️ CAMBIO 1: Ampliado a max-w-4xl para dar espacio al layout de dos columnas */}
      <DialogContent className="sm:max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
        
        {/* Encabezado Principal */}
        <DialogHeader className="text-center sm:text-center flex flex-col items-center border-b border-slate-100 pb-4 mb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 justify-center">
            <FileText className="h-5 w-5 text-amber-500" />
            Operaciones de Orden de Entrada
          </DialogTitle>
          
          <DialogDescription className="text-slate-500 text-sm mt-1 max-w-md text-center">
            Panel administrativo de liquidación, carga de certificados y auditoría.
          </DialogDescription>
        </DialogHeader>

        {/* 🛠️ CAMBIO 2: Contenedor Grid Principal (Dos columnas en pantallas grandes, apilado en móvil) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* COLUMNA IZQUIERDA: SECCIÓN 1 - COMPONENTE INFORMATIVO (Ocupa 5 de 12 columnas) */}
          <div className="md:col-span-5 h-full">
            <div className="bg-slate-100/80 p-4 rounded-xl border border-slate-200/60 sticky top-0">
              <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-2 mb-3 gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ficha Técnica de Entrada
                </span>
                <div className="flex gap-2">
                  <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-md tracking-widest uppercase">
                    {orden.placa || "S.P"}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    orden.estado_orden === "anulada" 
                      ? "bg-red-50 text-red-700 border-red-200" 
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {orden.estado_orden?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Grid Informativo de la Ficha Técnica */}
              {/* 🛠️ Ajustado a grid-cols-1 y 2 para adaptarse mejor a la barra lateral estrecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-y-3.5 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Propietario</span>
                  <span className="text-slate-800 font-semibold block truncate">{orden.propietario_nombre || "N/A"}</span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {orden.propietario_tipo_documento?.toUpperCase()}: {orden.propietario_documento}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Cliente/Conductor</span>
                  <span className="text-slate-800 font-semibold block truncate">{orden.cliente_nombre || "N/A"}</span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {orden.cliente_tipo_documento?.toUpperCase()}: {orden.cliente_documento}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Línea del Vehículo</span>
                  <span className="text-slate-800 font-semibold block truncate">
                    {orden.marca?.toUpperCase()} - {orden.linea?.toUpperCase() || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Servicio Solicitado</span>
                  <div className="mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 uppercase border border-amber-200">
                      {orden.service_type || "RTM"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">¿Es Reinspección?</span>
                  <span className={`font-semibold block ${orden.es_reinspeccion ? "text-orange-600" : "text-slate-600"}`}>
                    {orden.es_reinspeccion ? "SÍ (Segunda Entrada)" : "NO (Primera Vez)"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Kilometraje</span>
                  <span className="text-slate-800 font-semibold block">{orden.kilometraje || "0"} Km</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: SECCIÓN 2 - FORMULARIO DINÁMICO (Ocupa 7 de 12 columnas) */}
          <div className="md:col-span-7 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
            <OfficeOrderForm orden={orden} tenantId={tenantId} mutation={mutation}/>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}