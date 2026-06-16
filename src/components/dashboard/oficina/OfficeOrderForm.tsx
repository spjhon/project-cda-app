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
import { Loader2, Save } from "lucide-react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import OrderViewPDF from "../_shared/pdfs/OrderViewPDF";
import OrderDownloadPDF from "../_shared/pdfs/OrderDownloadPDF";
import { $ZodIssue } from "zod/v4/core";
import { insertOficinaData } from "@/lib/server-actions/insert_oficina_data";
import { TipoPago } from "@/lib/zod-schemas/oficinaInfo-schema";
import { ZodErrorDialog } from "../recepcionista/ZodErrorDialog";
import { useQueryClient } from "@tanstack/react-query";

export interface OfficeFormState {
  oficina_pin: string;
  oficina_pago: number;
  oficina_consecutivo_factura: string;
  oficina_tipo_pago: TipoPago;
  se_compro_soat: boolean;
}

interface OfficeOrderFormProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
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
}: OfficeOrderFormProps) {

const queryClient = useQueryClient();


  // Estados para controlar el Dialog de errores
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  // Estado local para el cargando (reemplaza a isPending de useActionState)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<$ZodIssue[] | null | string>(
    null,
  );

  // 🌟 Inicializamos el estado como un objeto estructurado mapeando datos existentes si vienen de Postgres
  const [formData, setFormData] = useState<OfficeFormState>({
    oficina_pin: orden.oficina_pin || "",
    oficina_pago: orden.oficina_pago ? Number(orden.oficina_pago) : 0,
    oficina_consecutivo_factura: orden.oficina_consecutivo_factura || "",
    oficina_tipo_pago: (orden.oficina_tipo_pago as TipoPago) || null,
    se_compro_soat: orden.se_compro_soat || false,
  });

  // Manejador genérico para Inputs de Texto / Número
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  // Manejador para el Select (Shadcn utiliza strings nativos en onValueChange)
  const handleSelectChange = (value: TipoPago) => {
    setFormData((prev) => ({ ...prev, oficina_tipo_pago: value }));
  };

  // Manejador para el Switch de Radix/Shadcn
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, se_compro_soat: checked }));
  };

  // Handler de envío (Por ahora solo Console Log estructurado)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setServerError(null);

    if (formData.oficina_consecutivo_factura.trim() === "") {
      alert("No se ha colocalo un consecutivo de factura");
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

    try {
      const { data, error } = await insertOficinaData({
        orderId: orden.id,
        formData: formData,
      });


      if (error || !data) {
        setServerError(error);
        setShowErrorDialog(true);
        return; // Detenemos la ejecución aquí
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECCIÓN 2: INFORMACIÓN MODIFICABLE (FORMULARIO) */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-200 pb-1.5">
          Datos de Facturación y Operación
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Input PIN */}
          <div className="space-y-1.5">
            <Label htmlFor="oficina_pin" className="text-slate-700 font-medium">
              PIN RUNT / Operación
            </Label>
            <Input
              id="oficina_pin"
              name="oficina_pin"
              placeholder="Ingrese el PIN asignado"
              value={formData.oficina_pin}
              onChange={handleChange}
              className="bg-white"
            />
          </div>

          {/* Input Consecutivo Factura */}
          <div className="space-y-1.5">
            <Label
              htmlFor="oficina_consecutivo_factura"
              className="text-slate-700 font-medium"
            >
              Consecutivo Factura
            </Label>
            <Input
              id="oficina_consecutivo_factura"
              name="oficina_consecutivo_factura"
              placeholder="Ej: FE-1042"
              value={formData.oficina_consecutivo_factura}
              onChange={handleChange}
              className="bg-white"
            />
          </div>

          {/* Input Valor Pagado */}
          <div className="space-y-1.5">
            <Label
              htmlFor="oficina_pago"
              className="text-slate-700 font-medium"
            >
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
              className="bg-white"
            />
          </div>

          {/* Select Tipo de Pago */}
          <div className="space-y-1.5">
            <Label
              htmlFor="oficina_tipo_pago"
              className="text-slate-700 font-medium"
            >
              Método de Pago
            </Label>
            <Select
              items={SELECT_METODO_PAGO}
              value={formData.oficina_tipo_pago}
              onValueChange={(value) => handleSelectChange(value || "efectivo")}
            >
              <SelectTrigger id="oficina_tipo_pago" className="bg-white">
                <SelectValue placeholder="Seleccione método" />
              </SelectTrigger>
              <SelectContent>
                {SELECT_METODO_PAGO.map((metodo) => (
                  <SelectItem key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Switch Control Ventas SOAT */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 mt-2">
          <div className="space-y-0.5">
            <Label
              htmlFor="se_compro_soat"
              className="text-sm font-semibold text-slate-800"
            >
              ¿Se gestionó SOAT en el CDA?
            </Label>
            <p className="text-xs text-slate-500">
              Active si el cliente adquirió la póliza aquí.
            </p>
          </div>
          <Switch
            id="se_compro_soat"
            checked={formData.se_compro_soat}
            onCheckedChange={handleSwitchChange}
          />
        </div>
      </div>

      {/* SECCIÓN 3: DOCUMENTACIÓN PDF */}
      <div className="flex flex-col gap-2 text-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Visor de Documentos Públicos
        </span>
        <div className="flex items-center justify-center gap-3 p-3 bg-slate-100/60 rounded-xl border border-slate-200">
          <OrderViewPDF orderId={orden.id} tenantId={tenantId} />
          <OrderDownloadPDF orderId={orden.id} tenantId={tenantId} />
        </div>
      </div>

      {/* SECCIÓN 4: BOTÓN ACCIÓN PRINCIPAL */}
      <Button
        type="submit"
        disabled={isSubmitting} // 🌟 Se deshabilita automáticamente mientras envía
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/70 disabled:cursor-not-allowed text-white font-bold h-11 transition-all rounded-lg shadow-sm gap-2 mt-4"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Procesando pago...</span>
          </>
        ) : (
          <>
            <Save className="h-5 w-5" />
            <span>Confirmar Información de Pago</span>
          </>
        )}
      </Button>

      {/* COMPONENTE DEL DIALOG INVOCADO */}
      <ZodErrorDialog
        isOpen={showErrorDialog}
        setIsOpen={setShowErrorDialog}
        errors={serverError}
      />
    </form>
  );
}
