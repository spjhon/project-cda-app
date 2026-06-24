"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ban, Loader2, Save } from "lucide-react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import OrderViewPDF from "../_shared/pdfs/OrderViewPDF";
import OrderDownloadPDF from "../_shared/pdfs/OrderDownloadPDF";
import { $ZodIssue } from "zod/v4/core";
import { insertOficinaData } from "@/lib/server-actions/insert_oficina_data";
import { TipoPago } from "@/lib/zod-schemas/oficinaInfo-schema";
import { ZodErrorDialog } from "../recepcionista/ZodErrorDialog";
import { UseMutateFunction, useQueryClient } from "@tanstack/react-query";
import CancelOrder from "../_shared/CancelOrder";

export interface OfficeFormState {
  oficina_pin: string;
  oficina_pago: number;
  oficina_consecutivo_factura: string;
  oficina_tipo_pago: TipoPago;
  oficina_num_aprobacion?: string; // 🌟 Agregado campo para número de aprobación
  se_compro_soat: boolean;
}

interface OfficeOrderFormProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
  mutation: {
    cancelOrder: UseMutateFunction<string, Error, { id: string; tenantId: string; }, unknown>;
    isCancelingOrder: boolean;
    errorCancelingOrder: Error | null;
    resetCancelError: () => void;
  };
}

const SELECT_METODO_PAGO = [
  { label: "Efectivo", value: "efectivo" },
  { label: "Tarjeta Débito", value: "tarjeta_debito" },
  { label: "Tarjeta Crédito", value: "tarjeta_credito" },
  { label: "Sistecredito", value: "sistecredito" },
  { label: "Addi", value: "addi" },
  { label: "Transferencia", value: "transferencia" },
  { label: "QR", value: "qr" },
];

export default function OfficeOrderForm({
  orden,
  tenantId,
  mutation,
}: OfficeOrderFormProps) {

  const queryClient = useQueryClient();

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<$ZodIssue[] | null | string>(null);

  const [formData, setFormData] = useState<OfficeFormState>({
    oficina_pin: orden.oficina_pin || "",
    oficina_pago: orden.oficina_pago ? Number(orden.oficina_pago) : 0,
    oficina_consecutivo_factura: orden.oficina_consecutivo_factura || "",
    oficina_tipo_pago: (orden.oficina_tipo_pago as TipoPago) || null,
    oficina_num_aprobacion: orden.oficina_num_aprobacion || "", // 🌟 Mapeo inicial
    se_compro_soat: orden.se_compro_soat || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleSelectChange = (value: TipoPago) => {
    setFormData((prev) => ({ 
      ...prev, 
      oficina_tipo_pago: value,
      // Si cambia a otro método que no sea tarjeta, limpiamos el número de aprobación de forma preventiva
      ...(value !== "tarjeta_debito" && value !== "tarjeta_credito" ? { oficina_num_aprobacion: "" } : {})
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, se_compro_soat: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setServerError(null);

    if (formData.oficina_consecutivo_factura.trim() === "") {
      alert("No se ha colocado un consecutivo de factura");
      setIsSubmitting(false);
      return;
    }

    if (formData.oficina_pago === 0) {
      alert("No se ha colocado un precio pagado");
      setIsSubmitting(false);
      return;
    }

    if (formData.oficina_pin.trim() === "") {
      alert("No se ha ingresado un pin");
      setIsSubmitting(false);
      return;
    }

    if (formData.oficina_tipo_pago === null) {
      alert("No se ha ingresado un tipo de pago");
      setIsSubmitting(false);
      return;
    }

    // 🌟 VALIDACIÓN ADICIONAL PARA TARJETAS
    const esTarjeta = formData.oficina_tipo_pago === "tarjeta_debito" || formData.oficina_tipo_pago === "tarjeta_credito";
    if (esTarjeta && (!formData.oficina_num_aprobacion || formData.oficina_num_aprobacion.trim() === "")) {
      alert("Por favor, ingrese el número de aprobación de la transacción con tarjeta");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await insertOficinaData({
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
      alert("Ocurrio un error inesperado en la validacion: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Variable de control para modular el renderizado condicional del nuevo input
  const mostrarNumAprobacion = formData.oficina_tipo_pago === "tarjeta_debito" || formData.oficina_tipo_pago === "tarjeta_credito";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* SECCIÓN 2: INFORMACIÓN MODIFICABLE (FORMULARIO) */}
      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-200 pb-1.5">
          Datos de Facturación y Operación
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Input PIN */}
          <div className="space-y-1.5">
            <Label htmlFor="oficina_pin" className="text-slate-700 text-xs font-semibold">
              PIN RUNT / Operación
            </Label>
            <Input
              id="oficina_pin"
              name="oficina_pin"
              placeholder="Ingrese el PIN asignado"
              value={formData.oficina_pin}
              onChange={handleChange}
              className="bg-white h-10 text-xs"
              disabled={orden.estado_orden === "finalizada" || orden.estado_orden === "anulada" || orden.es_reinspeccion}
            />
          </div>

          {/* Input Consecutivo Factura */}
          <div className="space-y-1.5">
            <Label htmlFor="oficina_consecutivo_factura" className="text-slate-700 text-xs font-semibold">
              Consecutivo Factura
            </Label>
            <Input
              id="oficina_consecutivo_factura"
              name="oficina_consecutivo_factura"
              placeholder="Ej: FE-1042"
              value={formData.oficina_consecutivo_factura}
              onChange={handleChange}
              className="bg-white h-10 text-xs"
              disabled={orden.estado_orden === "finalizada" || orden.estado_orden === "anulada"  || orden.es_reinspeccion}
            />
          </div>

          {/* Input Valor Pagado */}
          <div className="space-y-1.5">
            <Label htmlFor="oficina_pago" className="text-slate-700 text-xs font-semibold">
              Valor Recaudado ($)
            </Label>
            <Input
              id="oficina_pago"
              name="oficina_pago"
              type="number"
              min="0"
              placeholder="0.00"
              value={formData.oficina_pago === 0 ? "" : formData.oficina_pago}
              onChange={handleChange}
              className="bg-white h-10 text-xs"
              disabled={orden.estado_orden === "finalizada" || orden.estado_orden === "anulada"  || orden.es_reinspeccion}
            />
          </div>

          {/* Select Tipo de Pago */}
          <div className="space-y-1.5">
            <Label htmlFor="oficina_tipo_pago" className="text-slate-700 text-xs font-semibold">
              Método de Pago
            </Label>
            <Select
              items={SELECT_METODO_PAGO}
              value={formData.oficina_tipo_pago}
              onValueChange={(value) => handleSelectChange(value || "efectivo")}
              disabled={orden.estado_orden === "finalizada" || orden.estado_orden === "anulada"  || orden.es_reinspeccion}
            >
              <SelectTrigger id="oficina_tipo_pago" className="bg-white h-10 text-xs">
                <SelectValue placeholder="Seleccione método" />
              </SelectTrigger>
              <SelectContent>
                {SELECT_METODO_PAGO.map((metodo) => (
                  <SelectItem key={metodo.value} value={metodo.value} className="text-xs">
                    {metodo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 🌟 NUEVO INPUT: NÚMERO DE APROBACIÓN REPOSITORIO TARJETAS */}
          <div className="space-y-1.5">
            <Label 
              htmlFor="oficina_num_aprobacion" 
              className="text-slate-700 text-xs font-semibold"
            >
              N° Aprobación / Voucher Tarjeta {mostrarNumAprobacion && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="oficina_num_aprobacion"
              name="oficina_num_aprobacion"
              placeholder={
                mostrarNumAprobacion 
                  ? "Ingrese los dígitos" 
                  : "Solo para Tarjetas"
              }
              value={formData.oficina_num_aprobacion}
              onChange={handleChange}
              required={mostrarNumAprobacion}
             
              disabled={orden.estado_orden === "finalizada" || orden.estado_orden === "anulada" || !mostrarNumAprobacion  || orden.es_reinspeccion}
              className="bg-white h-10 text-xs"
            />
          </div>
        </div>

        {/* Switch Control Ventas SOAT */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 mt-1">
          <div className="space-y-0.5 pr-2">
            <Label htmlFor="se_compro_soat" className="text-xs font-bold text-slate-800">
              ¿Se gestionó SOAT en el CDA?
            </Label>
            <p className="text-[11px] text-slate-500 leading-tight">
              Active si el cliente adquirió la póliza aquí.
            </p>
          </div>
          <Switch
            id="se_compro_soat"
            checked={formData.se_compro_soat}
            onCheckedChange={handleSwitchChange}
            disabled={orden.estado_orden === "finalizada" || orden.estado_orden === "anulada"  || orden.es_reinspeccion}
          />
        </div>
      </div>

      {/* SECCIÓN 3: DOCUMENTACIÓN PDF */}
      <div className="flex flex-col gap-1.5 text-center">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Visor de Documentos Públicos
        </span>
        <div className="flex items-center justify-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
          <OrderViewPDF orderId={orden.id} tenantId={tenantId} />
          <OrderDownloadPDF orderId={orden.id} tenantId={tenantId} />
        </div>
      </div>

      {/* SECCIÓN 4: CONTENEDOR DE ACCIONES Y BOTONES */}
      <div className={`flex flex-col items-center justify-center p-4 rounded-xl border w-full transition-colors duration-200 ${
        orden.estado_orden === "finalizada" || orden.estado_orden === "anulada"
          ? "bg-red-50/50 border-red-100/50"    
          : "bg-stone-50/50 border-stone-100/50" 
      }`}>

        {orden.estado_orden === "finalizada" || orden.estado_orden === "anulada" ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-100/60 px-4 py-2 rounded-lg border border-red-200/80 shadow-xs animate-fade-in select-none text-center">
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
              <CancelOrder
                orden={orden}
                tenantId={tenantId}
                mutation={mutation}
              />
            </div>

            <div className="w-full sm:w-auto order-1 sm:order-2">
              <Button
                type="submit"
                disabled={isSubmitting || (orden.estado_orden === "en_prueba" && orden.es_reinspeccion )}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/70 disabled:cursor-not-allowed text-white font-bold h-10 text-xs transition-all rounded-lg shadow-sm gap-2 px-5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Procesando pago...</span>
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