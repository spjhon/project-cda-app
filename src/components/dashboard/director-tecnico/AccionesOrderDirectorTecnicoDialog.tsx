"use client";

import React, { useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  
  Receipt,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  
} from "lucide-react";
import DirectorTecnicoOrderForm from "./DirectorTecnicoOrderForm";
import { EntryOrderListItem } from "@/types/functions_types";
import { EntryOrderTechnicalSheet } from "./EntryOrderTechnicalSheet";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import SimpleEntryOrderTechnicalSheet from "./SimpleEntryOrderTechnicalSheet";


interface AccionesOrderDirectorTecnicoDialogProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
  rol: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccionesOrderDirectorTecnicoDialog({
  orden,
  tenantId,
  rol,
  open,
  onOpenChange,
}: AccionesOrderDirectorTecnicoDialogProps) {


const contextRecived = useContext(PermissionsContext);

const tenantModules =
  contextRecived?.PermissionsContextValue.tenantModules;

const hasFullInfoModule = tenantModules?.some(
  (module) =>
    module.code === "full_info_module" &&
    module.is_active &&
    module.is_enabled
);


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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-center flex flex-col items-center border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground justify-center">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Auditoría de Dirección Técnica
          </DialogTitle>

          <DialogDescription className="text-muted-foreground text-sm mt-1 max-w-md text-center">
            Módulo de revisión técnica y control de calidad ISO 17020 para la
            validez del servicio.
          </DialogDescription>
        </DialogHeader>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* COLUMNA IZQUIERDA */}




          <div className="space-y-5">
            {/* SECCIÓN A: FICHA TÉCNICA DEL VEHÍCULO Y ACTORES */}



{hasFullInfoModule ? (
  <EntryOrderTechnicalSheet orden={orden} />
) : (
  <SimpleEntryOrderTechnicalSheet orden={orden} />
)}





            {/* SECCIÓN B: LIQUIDACIÓN DE OFICINA + VERIFICACIÓN DE SOAT */}
            <div className="bg-emerald-500/5 p-5 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-2 border-b border-emerald-100 pb-3 mb-4">
                <Receipt className="h-4 w-4 text-emerald-600" />

                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Datos de Recaudo y Liquidación de Oficina
                </span>
              </div>

              {/* Grid Informativo de la Oficina */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs mb-1">
                {/* CONSECUTIVO FACTURA */}
                <div>
                  <span className="text-muted-foreground block font-medium mb-0.5">
                    Consecutivo Factura
                  </span>

                  <span className="text-foreground font-bold block bg-background px-2.5 py-1 rounded border border-border w-fit font-mono mt-0.5">
                    {orden.oficina_consecutivo_factura || "SIN ASIGNAR"}
                  </span>
                </div>

                {/* PIN RUNT */}
                <div>
                  <span className="text-muted-foreground block font-medium mb-0.5">
                    PIN del RUNT
                  </span>

                  <span className="text-foreground font-mono font-semibold block mt-1 tracking-wider truncate">
                    {orden.oficina_pin || "N/A"}
                  </span>
                </div>

                {/* VALOR RECAUDADO */}
                <div>
                  <span className="text-muted-foreground block font-medium mb-0.5">
                    Valor Recaudado
                  </span>

                  <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-sm mt-0.5">
                    {formatCurrency(orden.rate_price_snapshot)}
                  </span>
                </div>

                {/* PAGOS */}
                <div>
                  <span className="text-muted-foreground block font-medium mb-0.5">
                    Pagos Registrados
                  </span>

                  <span className="text-foreground font-bold block mt-1">
                    {orden.payments.length}
                    {orden.payments.length === 1 ? " pago" : " pagos"}
                  </span>
                </div>

                {/* DETALLE DE PAGOS */}
                <div className="col-span-2 space-y-2">
                  <span className="text-muted-foreground block font-medium mb-0.5">
                    Detalle de Pagos
                  </span>

                  {orden.payments.length === 0 ? (
                    <div className="bg-background/60 p-2.5 rounded-lg border border-border text-muted-foreground text-[11px]">
                      No hay pagos registrados.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orden.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="bg-background/60 p-2.5 rounded-lg border border-border flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {payment.payment_method === "tarjeta_debito" ||
                            payment.payment_method === "tarjeta_credito" ? (
                              <CreditCard className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Receipt className="h-4 w-4 text-emerald-600 shrink-0" />
                            )}

                            <div className="min-w-0">
                              <span className="text-foreground font-semibold text-xs block uppercase">
                                {payment.payment_method?.replaceAll(
                                  "_",
                                  " ",
                                ) || "Sin método"}
                              </span>

                              {payment.num_comprobante && (
                                <span className="text-muted-foreground font-mono text-[10px] block">
                                  Comprobante: {payment.num_comprobante}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs whitespace-nowrap">
                            {formatCurrency(payment.monto_bruto)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SOAT */}
                <div className="col-span-2">
                  <span className="text-muted-foreground block font-medium mb-0.5">
                    ¿Se compró SOAT también?
                  </span>

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










          {/* COLUMNA DERECHA */}
          <div className="lg:border-l lg:border-border lg:pl-6">
            <DirectorTecnicoOrderForm
              orden={orden}
              tenantId={tenantId}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}