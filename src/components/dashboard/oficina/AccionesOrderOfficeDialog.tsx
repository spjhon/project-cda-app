"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import OfficeOrderForm from "./OfficeOrderForm";
import { UseMutateFunction } from "@tanstack/react-query";

interface AccionesOrderOfficeDialogProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
  rol: string | undefined;
  
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccionesOrderOfficeDialog({
  orden,
  tenantId,
  rol,
  
  open,
  onOpenChange,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
        {/* Encabezado Principal */}
        <DialogHeader className="text-center sm:text-center flex flex-col items-center border-b border-border pb-4 mb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground justify-center">
            <FileText className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            Operaciones de Orden de Entrada
          </DialogTitle>

          <DialogDescription className="text-muted-foreground text-sm mt-1 max-w-md text-center">
            Panel administrativo de liquidación, carga de certificados y auditoría.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* COLUMNA IZQUIERDA */}
          <div className="md:col-span-5 h-full">
            <div className="bg-muted p-4 rounded-xl border border-border sticky top-0 max-h-[calc(100vh-2rem)] overflow-y-auto">
              {/* Encabezado: Placa y Estado */}
              <div className="flex flex-wrap justify-between items-center border-b border-border pb-2 mb-3 gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ficha Técnica de Entrada
                </span>

                <div className="flex gap-2 items-center">
                  <span className="text-xs font-black bg-foreground text-background px-3 py-1 rounded-md tracking-widest uppercase shadow-sm">
                    {orden.placa || "S.P"}
                  </span>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      orden.estado_orden === "anulada"
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-primary/10 text-primary border-primary/20"
                    }`}
                  >
                    {orden.estado_orden?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Bloques Especiales / Alert-style (Reinspección y SOAT) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {/* Indicador Reinspección */}
                <div
                  className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                    orden.es_reinspeccion
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    Tipo de Ingreso
                  </span>
                  <span className="text-xs font-extrabold mt-0.5">
                    {orden.es_reinspeccion ? "⚠️ REINSPECCIÓN (2ª Entrada)" : "✅ PRIMERA VEZ"}
                  </span>
                </div>

                {/* Vencimiento SOAT */}
                <div className="p-2.5 rounded-lg border bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    Vencimiento SOAT
                  </span>
                  <span className="text-xs font-black mt-0.5">
                    {orden.soat_vencimiento_snapshot
                      ? new Date(orden.soat_vencimiento_snapshot).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "SIN REGISTRO"}
                  </span>
                </div>
              </div>

              {/* Grid Principal de Datos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-y-3.5 gap-x-4 text-xs">
                {/* PROPIETARIO */}
                <div className="bg-background/50 p-2.5 rounded-lg border border-border/60">
                  <span className="text-muted-foreground block font-bold text-[10px] uppercase tracking-wider mb-1">
                    Propietario
                  </span>
                  <span className="text-foreground font-semibold block truncate">
                    {orden.propietario_nombre || "N/A"}
                  </span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {orden.propietario_tipo_documento?.toUpperCase()}: {orden.propietario_documento}
                  </span>

                  {/* Contacto Propietario */}
                  <div className="mt-1.5 pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground space-y-0.5">
                    {orden.propietario_telefono && (
                      <div className="truncate">📞 {orden.propietario_telefono}</div>
                    )}
                    {orden.propietario_email && (
                      <div className="truncate">✉️ {orden.propietario_email}</div>
                    )}
                    {orden.propietario_direccion && (
                      <div className="truncate">📍 {orden.propietario_direccion}</div>
                    )}
                  </div>
                </div>

                {/* CLIENTE / CONDUCTOR */}
                <div className="bg-background/50 p-2.5 rounded-lg border border-border/60">
                  <span className="text-muted-foreground block font-bold text-[10px] uppercase tracking-wider mb-1">
                    Cliente / Conductor
                  </span>
                  <span className="text-foreground font-semibold block truncate">
                    {orden.cliente_nombre || "N/A"}
                  </span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {orden.cliente_tipo_documento?.toUpperCase()}: {orden.cliente_documento}
                  </span>

                  {/* Contacto Cliente */}
                  <div className="mt-1.5 pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground space-y-0.5">
                    {orden.cliente_telefono && (
                      <div className="truncate">📞 {orden.cliente_telefono}</div>
                    )}
                    {orden.cliente_email && (
                      <div className="truncate">✉️ {orden.cliente_email}</div>
                    )}
                    {orden.cliente_direccion && (
                      <div className="truncate">📍 {orden.cliente_direccion}</div>
                    )}
                  </div>
                </div>

                {/* DETALLES VEHÍCULO */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground block font-medium">Línea del Vehículo</span>
                    <span className="text-foreground font-semibold block truncate">
                      {orden.marca?.toUpperCase()} - {orden.linea?.toUpperCase() || "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block font-medium">Kilometraje</span>
                    <span className="text-foreground font-semibold block">
                      {orden.kilometraje || "0"} Km
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block font-medium">Servicio Solicitado</span>
                  <div className="mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase border border-amber-500/20">
                      {orden.service_type || "RTM"}
                    </span>
                  </div>
                </div>

                {/* PRESIONES DE LLANTAS (Con Scroll) */}
                <div className="mt-2 pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                      Presiones de Llantas
                    </span>
                    <span className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                      {orden.presiones_llantas?.length || 0} Registradas
                    </span>
                  </div>

                  {orden.presiones_llantas && orden.presiones_llantas.length > 0 ? (
                    <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                      {orden.presiones_llantas.map((tire) => (
                        <div
                          key={tire.id || `${tire.eje}-${tire.posicion}`}
                          className="flex items-center justify-between p-1.5 rounded bg-background border border-border/50 text-[11px]"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground capitalize">
                              Eje {tire.eje} - {tire.posicion.replace(/_/g, " ")}
                            </span>
                          </div>

                          <div className="flex gap-2 font-mono text-[10px]">
                            <span className="text-muted-foreground">
                              Enc: <strong className="text-foreground">{tire.presion_encontrada ?? "-"}</strong> PSI
                            </span>
                            <span className="text-muted-foreground">
                              Ajust: <strong className="text-foreground">{tire.presion_ajustada ?? "-"}</strong> PSI
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">
                      No se registraron presiones de llantas.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="md:col-span-7 border-t md:border-t-0 md:border-l border-border md:pl-6 pt-4 md:pt-0">
            <OfficeOrderForm
              orden={orden}
              tenantId={tenantId}
              
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}