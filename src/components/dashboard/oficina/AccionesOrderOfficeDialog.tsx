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
import { MoreHorizontal, FileText, ShieldAlert } from "lucide-react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import OfficeOrderForm from "./OfficeOrderForm";


interface AccionesOrderOfficeDialogProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
  rol: string | undefined;
}

export default function AccionesOrderOfficeDialog({
  orden,
  tenantId,
  rol,
}: AccionesOrderOfficeDialogProps) {
  
  // 🌟 Control 1: Validación estricta perimetral de roles
  if (!rol) {
    console.log("Acción denegada: El rol actual es undefined");
    return null;
  }

  // Filtrado de renderizado: Este componente está optimizado para perfiles de Oficina o Gerencia administrativa
  if (rol !== "oficina" && rol !== "gerente") {
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

      {/* Ajustado a max-w-2xl para garantizar legibilidad de la grilla informativa */}
      <DialogContent className="sm:max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-center sm:text-center flex flex-col items-center">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 justify-center">
            <FileText className="h-5 w-5 text-amber-500" />
            Operaciones de Orden de Entrada
          </DialogTitle>
          
          <DialogDescription className="text-slate-500 text-sm mt-2 max-w-md text-center">
            Panel administrativo de liquidación, carga de certificados y auditoría.
          </DialogDescription>
        </DialogHeader>

        {/* SECCIÓN 1: COMPONENTE INFORMATIVO DE SOLO LECTURA */}
        <div className="mt-2 space-y-3">
          <div className="bg-slate-100/80 p-4 rounded-xl border border-slate-200/60">
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

            {/* Grid Informativo */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
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
                <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 uppercase border border-amber-200">
                  {orden.service_type || "RTM"}
                </span>
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

        {/* SECCIÓN 2: RENDERIZADO DEL FORMULARIO DINÁMICO */}
        <OfficeOrderForm orden={orden} tenantId={tenantId} />

      </DialogContent>
    </Dialog>
  );
}