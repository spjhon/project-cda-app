"use client";

import React, { useContext } from "react";
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
  Binary,
  Calendar,
  FileSearch,
} from "lucide-react";
import OrderViewPDF from "../_shared/pdfs/OrderViewPDF";
import OrderDownloadPDF from "../_shared/pdfs/OrderDownloadPDF";
import { EntryOrderListItem } from "@/types/functions_types";
import EntryOrderTechnicalSheet from "./EntryOrderTechnicalSheet";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import SimpleOfficeOrderDetails from "../oficina/SimpleOfficeOrderDetails";


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


// ==========================================
  // VALIDACIÓN DEL MÓDULO
  // ==========================================
const permissionsContext = useContext(PermissionsContext);
  const tenantModules =
    permissionsContext?.PermissionsContextValue.tenantModules ?? [];

  const hasFullInfoModule = tenantModules.some(
    (module) => module.code === "full_info_module" && module.is_enabled,
  );





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
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Solo mostramos el Trigger si el estado NO es controlado desde el padre */}
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
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Auditoría General de Orden de Entrada
          </DialogTitle>

          <DialogDescription className="text-muted-foreground text-sm mt-1">
            Consola centralizada de solo lectura para la verificación de datos
            históricos e ISO 17020.
          </DialogDescription>
        </DialogHeader>

        {/* CONTENEDOR DE INFORMACIÓN */}
        <div className="flex flex-col lg:flex-row gap-6 mt-5 items-start">
          {/* ================================================================
              COLUMNA IZQUIERDA: DATOS DEL VEHÍCULO Y ACTORES
              ================================================================ */}
          <div className="w-full lg:w-1/2">
  


{hasFullInfoModule ? (
              <EntryOrderTechnicalSheet orden={orden} />
            ) : (
              <SimpleOfficeOrderDetails orden={orden} />
            )}



</div>

          {/* ================================================================
              COLUMNA DERECHA: RECAUDO, CIERRE ISO Y DOCUMENTAL
              ================================================================ */}
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
                {/* Factura */}
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">
                    Factura de Venta:
                  </span>

                  <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                    {orden.oficina_consecutivo_factura || "SIN RECAUDO"}
                  </span>
                </div>

                {/* PIN RUNT */}
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">
                    PIN asignado RUNT:
                  </span>

                  <span className="font-mono font-semibold text-foreground">
                    {orden.oficina_pin || "N/A"}
                  </span>
                </div>

                {/* VALOR TOTAL DEL RATE */}
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">
                    Valor Bruto Recaudado:
                  </span>

                  <span className="text-emerald-600 font-bold text-sm">
                    {formatCurrency(orden.rate_price_snapshot)}
                  </span>
                </div>

                {/* PAGOS */}
                <div className="flex flex-col gap-2 pt-1">
                  <span className="text-muted-foreground font-medium">
                    Detalle de Pagos:
                  </span>

                  {orden.payments.length === 0 ? (
                    <span className="text-muted-foreground italic bg-muted px-2 py-1 rounded">
                      No hay pagos registrados
                    </span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {orden.payments.map((payment) => {
                        const esTarjeta =
                          payment.payment_method === "tarjeta_debito" ||
                          payment.payment_method === "tarjeta_credito";

                        return (
                          <div
                            key={payment.id}
                            className="bg-muted/40 p-2.5 rounded-lg border border-border"
                          >
                            <div className="flex justify-between items-center gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                {esTarjeta ? (
                                  <CreditCard className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <Receipt className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                )}

                                <span className="text-foreground font-bold uppercase text-[10px]">
                                  {payment.payment_method?.replaceAll(
                                    "_",
                                    " ",
                                  ) || "No registrado"}
                                </span>
                              </div>

                              <span className="text-emerald-600 font-bold text-xs whitespace-nowrap">
                                {formatCurrency(payment.monto_bruto)}
                              </span>
                            </div>

                            {/* Comprobante */}
                            {payment.num_comprobante && (
                              <div className="mt-1.5 flex items-center gap-1.5 pl-5">
                                <span className="text-muted-foreground text-[9px] uppercase">
                                  Comprobante:
                                </span>

                                <span className="text-foreground font-mono font-bold text-[10px]">
                                  {payment.num_comprobante}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SOAT */}
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
                {/* Dictamen */}
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">
                    Dictamen de Revisión:
                  </span>

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

                {/* FUR */}
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">
                    Consecutivo FUR (RUNT):
                  </span>

                  <span className="font-mono text-foreground font-bold">
                    {orden.consecutivo_fur || "SIN ASIGNAR"}
                  </span>
                </div>

                {/* RTM */}
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground font-medium">
                    Consecutivo Certificado RTM:
                  </span>

                  <span className="font-mono text-foreground font-bold">
                    {orden.consecutivo_rtm || "N/A (Reprobada o Preventiva)"}
                  </span>
                </div>

                {/* Fecha */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">
                    Fecha Recepción Orden:
                  </span>

                  <span className="text-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {formatFecha(orden.fecha)}
                  </span>
                </div>
              </div>
            </div>

            {/* BLOQUE 5: SOPORTES DIGITALES */}
          
           

            {/* DOCUMENTOS */}
                 {hasFullInfoModule && (
                   <div className="flex flex-col gap-1.5 text-center">
                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                       Visor de Documentos Públicos
                     </span>
           
                     <div className="flex items-center justify-center gap-3 p-2.5 bg-muted rounded-xl border border-border">
                       <OrderViewPDF orderId={orden.id} tenantId={tenantId} />
                       <OrderDownloadPDF orderId={orden.id} tenantId={tenantId} />
                     </div>
                   </div>
                 )}
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}