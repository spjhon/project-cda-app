"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Ban, Loader2, Save } from "lucide-react";
import { EntryOrderListItem, EntryOrderPaymentDetail } from "@/lib/server-actions/fetch_entry_orders_list";
import OrderViewPDF from "../_shared/pdfs/OrderViewPDF";
import OrderDownloadPDF from "../_shared/pdfs/OrderDownloadPDF";
import { $ZodIssue } from "zod/v4/core";
import { insertOficinaData } from "@/lib/client-actions/insert_oficina_data";
import { ZodErrorDialog } from "../recepcionista/ZodErrorDialog";
import { useQueryClient } from "@tanstack/react-query";
import CancelOrder from "../_shared/CancelOrder";
import { useOrderRate } from "@/lib/client-actions/fetch_entry_order_rate";
import OrderPayments from "./OrderPayments";


export interface OfficeFormState {
  oficina_pin: string;
  oficina_consecutivo_factura: string;
  se_compro_soat: boolean;
}



interface OfficeOrderFormProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
}

export default function OfficeOrderForm({
  orden,
  tenantId,
}: OfficeOrderFormProps) {
  const queryClient = useQueryClient();

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<$ZodIssue[] | null | string>(
    null,
  );

  const [formData, setFormData] = useState<OfficeFormState>({
    oficina_pin: orden.oficina_pin || "",
    oficina_consecutivo_factura: orden.oficina_consecutivo_factura || "",
    se_compro_soat: orden.se_compro_soat || false,
  });


 

const [payments, setPayments] = useState<EntryOrderPaymentDetail[]>(
  orden.payments ?? []
);



  const {
    data: orderRate,
    isLoading: isLoadingOrderRate,
    isFetching: isFetchingOrderRate,
    error: orderRateError,
    isError: isOrderRateError,
  } = useOrderRate({
    orderId: orden.id,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, se_compro_soat: checked }));
  };





const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  e.stopPropagation();

  setIsSubmitting(true);
  setServerError(null);

  if (formData.oficina_consecutivo_factura.trim() === "") {
    alert("No se ha colocado un consecutivo de factura");
    setIsSubmitting(false);
    return;
  }

  if (formData.oficina_pin.trim() === "" && orden.service_type === "RTM") {
    alert("No se ha ingresado un pin");
    setIsSubmitting(false);
    return;
  }

  if (
    payments.length === 0 ||
    payments.some(
      (payment) =>
        !payment.payment_method ||
        payment.monto_bruto <= 0,
    )
  ) {
    alert(
      "Debe registrar al menos un método de pago y todos los pagos deben tener un valor mayor a $0.",
    );
    setIsSubmitting(false);
    return;
  }

  if (!orderRate) {
    alert("No se ha podido obtener la tarifa de la orden.");
    setIsSubmitting(false);
    return;
  }

  try {
    const { data, error } = await insertOficinaData({
      orderId: orden.id,
      formData: formData,
      payments: payments,
      vehicleServiceRateId: orderRate.rateId,
      ratePriceSnapshot: orderRate.totalPrice,
      service_type: orden.service_type
    });

    if (error || !data) {
      setServerError(error);
      setShowErrorDialog(true);
      return;
    }

    alert(data);

    queryClient.invalidateQueries({
      queryKey: ["entry-orders", "list"],
    });
  } catch (error: unknown) {
    alert(
      "Ocurrio un error inesperado en la validacion: " + error,
    );
  } finally {
    setIsSubmitting(false);
  }
};










  const totalPayments = payments.reduce(
    (total, payment) => total + (Number(payment.monto_bruto) || 0),
    0,
  );

  const totalToPay = orderRate?.totalPrice ?? 0;

  const paymentMatches = totalPayments === totalToPay;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* SECCIÓN 2: INFORMACIÓN MODIFICABLE (FORMULARIO) */}
      <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-4">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block border-b border-border pb-1.5">
          Datos de Facturación y Operación
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Input PIN */}
          <div className="space-y-1.5">
            <Label
              htmlFor="oficina_pin"
              className="text-foreground text-xs font-semibold"
            >
              PIN RUNT / Operación
            </Label>

            <Input
              id="oficina_pin"
              name="oficina_pin"
              placeholder="Ingrese el PIN asignado"
              value={formData.oficina_pin}
              onChange={handleChange}
              className="bg-background h-10 text-xs"
              disabled={
                orden.estado_orden === "finalizada" ||
                orden.estado_orden === "anulada" ||
                orden.es_reinspeccion ||
                orden.service_type !== "RTM"
              }
            />
          </div>

          {/* Input Consecutivo Factura */}
          <div className="space-y-1.5">
            <Label
              htmlFor="oficina_consecutivo_factura"
              className="text-foreground text-xs font-semibold"
            >
              Consecutivo Factura
            </Label>

            <Input
              id="oficina_consecutivo_factura"
              name="oficina_consecutivo_factura"
              placeholder="Ej: FE-1042"
              value={formData.oficina_consecutivo_factura}
              onChange={handleChange}
              className="bg-background h-10 text-xs"
              disabled={
                orden.estado_orden === "finalizada" ||
                orden.estado_orden === "anulada" ||
                orden.es_reinspeccion
              }
            />
          </div>

          {/* Valor a pagar */}
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs font-semibold">
              VALOR A PAGAR
            </Label>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md h-10 flex items-center px-3">
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                $
                {orderRateError
                  ? " No hay precio"
                  : isLoadingOrderRate || isFetchingOrderRate
                    ? " Cargando Rate"
                    : orderRate?.totalPrice?.toLocaleString("es-CO")}
              </span>
            </div>
            {orderRateError && (
  <p className="text-xs font-medium text-red-600 dark:text-red-400">
    No hay precio configurado para este vehículo
  </p>
)}
          </div>

          {/* Total ingresado */}
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs font-semibold">
              TOTAL INGRESADO
            </Label>

            <div
              className={`rounded-md h-10 flex items-center px-3 border ${
                paymentMatches
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
              }`}
            >
              <span
                className={`text-sm font-bold ${
                  paymentMatches
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                ${totalPayments.toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          {/* Métodos de pago */}
          <div className="sm:col-span-2">
            <OrderPayments
              payments={payments}
              setPayments={setPayments}
              disabled={
                orden.estado_orden === "finalizada" ||
                orden.estado_orden === "anulada" ||
                orden.es_reinspeccion
              }
            />
          </div>
        </div>

        {/* Switch con fondo condicional dinámico */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-200 mt-1 ${
            formData.se_compro_soat
              ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-amber-950/60 dark:border-amber-700/80 dark:text-amber-100"
              : "bg-background border-border"
          }`}
        >
          <div className="space-y-0.5 pr-2">
            <Label
              htmlFor="se_compro_soat"
              className={`text-xs font-bold transition-colors ${
                formData.se_compro_soat
                  ? "text-emerald-950 dark:text-amber-100"
                  : "text-foreground"
              }`}
            >
              ¿Se gestionó SOAT en el CDA?
            </Label>

            <p
              className={`text-[11px] leading-tight transition-colors ${
                formData.se_compro_soat
                  ? "text-emerald-700 dark:text-amber-300/80"
                  : "text-muted-foreground"
              }`}
            >
              Active si el cliente adquirió la póliza aquí.
            </p>
          </div>

          <Switch
            id="se_compro_soat"
            checked={formData.se_compro_soat}
            onCheckedChange={handleSwitchChange}
            disabled={
              orden.estado_orden === "finalizada" ||
              orden.estado_orden === "anulada" ||
              orden.es_reinspeccion
            }
          />
        </div>
      </div>

      {/* DOCUMENTOS */}
      <div className="flex flex-col gap-1.5 text-center">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Visor de Documentos Públicos
        </span>

        <div className="flex items-center justify-center gap-3 p-2.5 bg-muted rounded-xl border border-border">
          <OrderViewPDF orderId={orden.id} tenantId={tenantId} />
          <OrderDownloadPDF orderId={orden.id} tenantId={tenantId} />
        </div>
      </div>

      {/* BOTONES */}
      <div
        className={`flex flex-col items-center justify-center p-4 rounded-xl border w-full transition-colors duration-200 ${
          orden.estado_orden === "finalizada" ||
          orden.estado_orden === "anulada"
            ? "bg-destructive/5 border-destructive/20"
            : "bg-muted/30 border-border"
        }`}
      >
        {orden.estado_orden === "finalizada" ||
        orden.estado_orden === "anulada" ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-destructive bg-destructive/10 px-4 py-2 rounded-lg border border-destructive/20 shadow-xs animate-fade-in select-none text-center">
            <Ban className="h-4 w-4 shrink-0" />

            <span>
              {orden.estado_orden === "anulada"
                ? "Esta orden ya fue anulada"
                : "No se pueden modificar ni anular los datos porque la orden ya se encuentra FINALIZADA"}
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <div className="w-full sm:w-auto order-2 sm:order-1">
              <CancelOrder orden={orden} tenantId={tenantId} />
            </div>

            <div className="w-full sm:w-auto order-1 sm:order-2">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  (orden.estado_orden === "en_prueba" &&
                    orden.es_reinspeccion) ||
                  isOrderRateError || isLoadingOrderRate || isFetchingOrderRate
                }
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/70 disabled:cursor-not-allowed text-white font-bold h-10 text-xs transition-all rounded-lg shadow-sm gap-2 px-5"
              >
               {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Procesando pago...</span>
                  </>
                ) : isLoadingOrderRate || isFetchingOrderRate ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Consultando precio...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Confirmar Información de Pago</span>
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
