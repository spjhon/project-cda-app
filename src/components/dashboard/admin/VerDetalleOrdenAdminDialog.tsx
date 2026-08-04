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
import { 
  Eye, 
  Receipt, 
  ShieldCheck, 
  ShieldAlert, 
  CreditCard, 
  User, 
  Car, 
  Binary, 
  Calendar,
  FileSearch
} from "lucide-react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import OrderViewPDF from "../_shared/pdfs/OrderViewPDF";
import OrderDownloadPDF from "../_shared/pdfs/OrderDownloadPDF";

// 1. Agregamos las props opcionales/requeridas para el control de apertura
interface VerDetalleOrdenAdminDialogProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function VerDetalleOrdenAdminDialog({
  orden,
  tenantId,
  open,
  onOpenChange,
}: VerDetalleOrdenAdminDialogProps) {

  // Formateador estándar de moneda colombiana (COP)
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "$0";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Formateador estándar para fechas legibles
  const formatFecha = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Condicional para saber si pagó con tarjeta bancaria
  const esPagoTarjeta = orden.oficina_tipo_pago === "tarjeta_debito" || orden.oficina_tipo_pago === "tarjeta_credito";

  return (
    // 2. Conectamos las props de control al Dialog
    <Dialog open={open} onOpenChange={onOpenChange}>
      
      {/* 3. Solo mostramos el Trigger si NO estamos controlando el estado de forma exclusiva desde el padre */}
      {open === undefined && (
        <DialogTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-slate-600 border-border hover:bg-muted/30"
            >
              <Eye className="h-4 w-4" />
              <span>Ver Detalles</span>
            </Button>
          }
        />
      )}

      {/* Contenedor del Dialog optimizado para lectura cómoda */}
      <DialogContent className="sm:max-w-4xl p-6 overflow-y-auto max-h-[90vh] bg-background">
        
        {/* ENCABEZADO PRINCIPAL */}
        <DialogHeader className="flex flex-col items-center border-b border-slate-100 pb-4 text-center">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-950">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Auditoría General de Orden de Entrada
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1">
            Consola centralizada de solo lectura para la verificación de datos históricos e ISO 17020.
          </DialogDescription>
        </DialogHeader>

        {/* CONTENEDOR DE INFORMACIÓN CON FLEXBOX RESPONSIVO */}
        <div className="flex flex-col lg:flex-row gap-6 mt-5 items-start">
          
          {/* ================================================================= */}
          {/* COLUMNA IZQUIERDA: DATOS DEL VEHÍCULO Y ACTORES                 */}
          {/* ================================================================= */}
          <div className="flex flex-col w-full lg:w-1/2 gap-5">
            
            {/* BLOQUE 1: DATOS DEL VEHÍCULO */}
            <div className="flex flex-col bg-muted/30 p-4 rounded-xl border border-border/60 gap-3">
              <div className="flex flex-row justify-between items-center border-b border-border pb-2">
                <div className="flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Especificaciones del Vehículo</span>
                </div>
                <span className="text-xs font-black bg-primary text-primary-foreground px-2.5 py-1 rounded tracking-widest uppercase shadow-sm font-mono">
                  {orden.placa || "SIN PLACA"}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-medium">Línea:</span>
                  <span className="text-foreground font-semibold uppercase">{orden.marca} - {orden.linea || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-medium">Clasificación:</span>
                  <span className="text-foreground font-medium capitalize">{orden.vehiculo_tipo_snapshot} / {orden.vehiculo_tipo_servicio_snapshot}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-medium">Kilometraje en Entrada:</span>
                  <span className="text-foreground font-semibold">{orden.kilometraje ? `${orden.kilometraje} Km` : "0 Km"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-medium">Tipo de Servicio:</span>
                  <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-amber-200">
                    {orden.service_type || "RTM"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">¿Es Reinspección?</span>
                  <span className={`font-bold ${orden.es_reinspeccion ? "text-orange-600" : "text-slate-600"}`}>
                    {orden.es_reinspeccion ? "SÍ (Reprobado previo)" : "NO (Primera Entrada)"}
                  </span>
                </div>
              </div>
            </div>

            {/* BLOQUE 2: PROPIETARIO Y CONDUCTOR */}
            <div className="flex flex-col bg-muted/30 p-4 rounded-xl border border-border/60 gap-4">
              <div className="flex items-center gap-1.5 border-b border-border pb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Actores Vinculados</span>
              </div>

              {/* Propietario */}
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-slate-400 font-medium text-[11px]">Propietario del Vehículo</span>
                <span className="text-foreground font-bold">{orden.propietario_nombre || "N/A"}</span>
                <span className="text-muted-foreground text-[10px] uppercase">{orden.propietario_tipo_documento}: {orden.propietario_documento || "N/A"}</span>
              </div>

              {/* Conductor / Cliente */}
              <div className="flex flex-col gap-1 text-xs border-t border-border/60 pt-3">
                <span className="text-slate-400 font-medium text-[11px]">Cliente / Conductor Presentante</span>
                <span className="text-foreground font-bold">{orden.cliente_nombre || "N/A"}</span>
                <span className="text-muted-foreground text-[10px] uppercase">{orden.cliente_tipo_documento}: {orden.cliente_documento || "N/A"}</span>
              </div>
            </div>

          </div>

          {/* ================================================================= */}
          {/* COLUMNA DERECHA: RECAUDO, CIERRE ISO Y DOCUMENTAL                */}
          {/* ================================================================= */}
          <div className="flex flex-col w-full lg:w-1/2 gap-5">
            
            {/* BLOQUE 3: RECAUDO Y CAJA */}
            <div className="flex flex-col bg-muted/30 p-4 rounded-xl border border-border/60 gap-3">
              <div className="flex items-center gap-1.5 border-b border-border pb-2">
                <Receipt className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Liquidación Financiera de Oficina
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">Factura de Venta:</span>
                  <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                    {orden.oficina_consecutivo_factura || "SIN RECAUDO"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">PIN asignado RUNT:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {orden.oficina_pin || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">Valor Bruto Recaudado:</span>
                  <span className="text-emerald-600 font-bold text-sm">
                    {formatCurrency(orden.oficina_pago)}
                  </span>
                </div>

                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">Forma de Pago:</span>
                  <span className="text-foreground font-medium uppercase">
                    {orden.oficina_tipo_pago?.replace("_", " ") || "No registrado"}
                  </span>
                </div>

                {/* Voucher de aprobación si fue tarjeta */}
                {esPagoTarjeta && (
                  <div className="flex flex-row items-center gap-2 bg-muted/40 p-2 rounded-lg border border-border">
                    <CreditCard className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[9px] font-medium uppercase">
                        Código Aprobación Voucher
                      </span>
                      <span className="text-foreground font-mono font-bold text-xs">
                        {orden.oficina_num_aprobacion || "PENDIENTE"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-muted-foreground font-medium">
                    Estado Venta SOAT Complementario:
                  </span>

                  {orden.se_compro_soat ? (
                    <span className="flex items-center gap-1 w-fit bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-emerald-200">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      SOAT Vendido en CDA
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 w-fit bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-border">
                      <ShieldAlert className="h-3 w-3" />
                      Póliza Externa del Cliente
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* BLOQUE 4: CIERRE TÉCNICO (ISO 17020) */}
            <div className="flex flex-col bg-muted/30 p-4 rounded-xl border border-border/60 gap-3">
              <div className="flex items-center gap-1.5 border-b border-border pb-2">
                <Binary className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Cierre Técnico y Consecutivos RUNT
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">Dictamen de Revisión:</span>

                  {orden.resultado_revision ? (
                    <span
                      className={`font-black uppercase px-2 py-0.5 rounded text-[10px] border ${
                        orden.resultado_revision === "aprobado"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      {orden.resultado_revision}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic bg-muted px-1.5 py-0.5 rounded">
                      Pendiente de Firma DT
                    </span>
                  )}
                </div>

                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">Consecutivo FUR (RUNT):</span>
                  <span className="font-mono text-foreground font-bold">
                    {orden.consecutivo_fur || "SIN ASIGNAR"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">Consecutivo Certificado RTM:</span>
                  <span className="font-mono text-foreground font-bold">
                    {orden.consecutivo_rtm || "N/A (Reprobada o Preventiva)"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Fecha Recepción Orden:</span>
                  <span className="text-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {formatFecha(orden.fecha)}
                  </span>
                </div>
              </div>
            </div>

            {/* BLOQUE 5: SOPORTES DIGITALES */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 pl-1">
                <FileSearch className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Soportes Digitales de Entrada
                </span>
              </div>

              <div className="flex flex-row gap-2 p-2 bg-muted/40 rounded-xl border border-border w-full">
                <div className="flex-1">
                  <OrderViewPDF orderId={orden.id} tenantId={tenantId} />
                </div>

                <div className="flex-1">
                  <OrderDownloadPDF orderId={orden.id} tenantId={tenantId} />
                </div>
              </div>
            </div>

          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}