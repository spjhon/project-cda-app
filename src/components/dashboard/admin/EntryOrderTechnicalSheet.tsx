"use client";

import { Car, User } from "lucide-react";

import { EntryOrderListItem } from "@/types/functions_types";

// ============================================================
// Props
// ============================================================

interface EntryOrderTechnicalSheetProps {
  orden: EntryOrderListItem;
}

// ============================================================
// Componente
// ============================================================

export default function EntryOrderTechnicalSheet({
  orden,
}: EntryOrderTechnicalSheetProps) {
  return (
    <div className="flex flex-col w-full gap-5">
      {/* BLOQUE 1: DATOS DEL VEHÍCULO */}
      <div className="flex flex-col bg-muted/30 p-4 rounded-xl border border-border/60 gap-3">
        <div className="flex flex-row justify-between items-center border-b border-border pb-2">
          <div className="flex items-center gap-1.5">
            <Car className="h-4 w-4 text-muted-foreground" />

            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Especificaciones del Vehículo
            </span>
          </div>

          <span className="text-xs font-black bg-primary text-primary-foreground px-2.5 py-1 rounded tracking-widest uppercase shadow-sm font-mono">
            {orden.placa || "SIN PLACA"}
          </span>
        </div>

        <div className="flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-400 font-medium">Línea:</span>

            <span className="text-foreground font-semibold uppercase">
              {orden.marca} - {orden.linea || "N/A"}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-400 font-medium">Clasificación:</span>

            <span className="text-foreground font-medium capitalize">
              {orden.vehiculo_tipo_snapshot} /{" "}
              {orden.vehiculo_tipo_servicio_snapshot}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-400 font-medium">
              Kilometraje en Entrada:
            </span>

            <span className="text-foreground font-semibold">
              {orden.kilometraje ? `${orden.kilometraje} Km` : "0 Km"}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-slate-400 font-medium">
              Tipo de Servicio:
            </span>

            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-amber-200">
              {orden.service_type || "RTM"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">
              ¿Es Reinspección?
            </span>

            <span
              className={`font-bold ${
                orden.es_reinspeccion ? "text-orange-600" : "text-slate-600"
              }`}
            >
              {orden.es_reinspeccion
                ? "SÍ (Reprobado previo)"
                : "NO (Primera Entrada)"}
            </span>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: PROPIETARIO Y CONDUCTOR */}
      <div className="flex flex-col bg-muted/30 p-4 rounded-xl border border-border/60 gap-4">
        <div className="flex items-center gap-1.5 border-b border-border pb-2">
          <User className="h-4 w-4 text-muted-foreground" />

          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Actores Vinculados
          </span>
        </div>

        {/* Propietario */}
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-slate-400 font-medium text-[11px]">
            Propietario del Vehículo
          </span>

          <span className="text-foreground font-bold">
            {orden.propietario_nombre || "N/A"}
          </span>

          <span className="text-muted-foreground text-[10px] uppercase">
            {orden.propietario_tipo_documento}:{" "}
            {orden.propietario_documento || "N/A"}
          </span>

          {orden.propietario_telefono && (
            <span className="text-muted-foreground text-[10px]">
              Teléfono: {orden.propietario_telefono}
            </span>
          )}

          {orden.propietario_email && (
            <span className="text-muted-foreground text-[10px] truncate">
              Correo: {orden.propietario_email}
            </span>
          )}

          {orden.propietario_direccion && (
            <span className="text-muted-foreground text-[10px] truncate">
              Dirección: {orden.propietario_direccion}
            </span>
          )}
        </div>

        {/* Conductor / Cliente */}
        <div className="flex flex-col gap-1 text-xs border-t border-border/60 pt-3">
          <span className="text-slate-400 font-medium text-[11px]">
            Cliente / Conductor Presentante
          </span>

          <span className="text-foreground font-bold">
            {orden.cliente_nombre || "N/A"}
          </span>

          <span className="text-muted-foreground text-[10px] uppercase">
            {orden.cliente_tipo_documento}:{" "}
            {orden.cliente_documento || "N/A"}
          </span>

          {orden.cliente_telefono && (
            <span className="text-muted-foreground text-[10px]">
              Teléfono: {orden.cliente_telefono}
            </span>
          )}

          {orden.cliente_email && (
            <span className="text-muted-foreground text-[10px] truncate">
              Correo: {orden.cliente_email}
            </span>
          )}

          {orden.cliente_direccion && (
            <span className="text-muted-foreground text-[10px] truncate">
              Dirección: {orden.cliente_direccion}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}