"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TipoPago } from "@/lib/zod-schemas/oficinaInfo-schema";
import { EntryOrderPaymentDetail } from "@/lib/server-actions/fetch_entry_orders_list";


interface OrderPaymentsProps {
  payments: EntryOrderPaymentDetail[];
  setPayments: React.Dispatch<React.SetStateAction<EntryOrderPaymentDetail[]>>;
  disabled?: boolean;
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

const MAX_PAYMENTS = 7;

export default function OrderPayments({
  payments,
  setPayments,
  disabled = false,
}: OrderPaymentsProps) {
  const addPayment = () => {
    if (payments.length >= MAX_PAYMENTS) return;

    setPayments((prev) => [
      ...prev,
      {
        id: "",
    payment_method: null,
    monto_bruto: 0,
    num_comprobante: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
      },
    ]);
  };

  const removePayment = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePayment = (
    index: number,
    field: keyof EntryOrderPaymentDetail,
    value: string | number,
  ) => {
    setPayments((prev) =>
      prev.map((payment, i) =>
        i === index
          ? {
              ...payment,
              [field]: value,
            }
          : payment,
      ),
    );
  };

 const requiresReceipt = (paymentMethod: TipoPago | null) =>
  paymentMethod === "tarjeta_debito" ||
  paymentMethod === "tarjeta_credito";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-foreground text-xs font-semibold">
          Métodos de Pago
        </Label>

        <span className="text-[11px] text-muted-foreground">
          {payments.length}/{MAX_PAYMENTS}
        </span>
      </div>

      {payments.map((payment, index) => (
        <div
          key={index}
          className="relative rounded-lg border border-border bg-background p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">
              PAGO {index + 1}
            </span>

            <button
              type="button"
              onClick={() => removePayment(index)}
              disabled={disabled}
              className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={`Eliminar pago ${index + 1}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-semibold">
                Método de Pago
              </Label>

              <Select
                items={SELECT_METODO_PAGO}
                value={payment.payment_method}
                onValueChange={(value) =>
                  updatePayment(index, "payment_method", value || "")
                }
                disabled={disabled}
              >
                <SelectTrigger className="bg-background h-10 text-xs">
                  <SelectValue placeholder="Seleccione método" />
                </SelectTrigger>

                <SelectContent alignItemWithTrigger={false}>
                  {SELECT_METODO_PAGO.map((metodo) => (
                    <SelectItem
                      key={metodo.value}
                      value={metodo.value}
                      className="text-xs"
                    >
                      {metodo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-semibold">
                Valor Recaudado ($)
              </Label>

              <Input
                type="number"
                min="0"
                placeholder="0"
                value={payment.monto_bruto === 0 ? "" : payment.monto_bruto}
                onChange={(e) =>
                  updatePayment(
                    index,
                    "monto_bruto",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                className="bg-background h-10 text-xs"
                disabled={disabled}
              />
            </div>
          </div>

          {requiresReceipt(payment.payment_method) && (
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-semibold">
                N° Aprobación / Voucher
                <span className="text-destructive ml-1">*</span>
              </Label>

              <Input
                placeholder="Ingrese los dígitos"
                required
                value={payment.num_comprobante || ""}
                onChange={(e) =>
                  updatePayment(index, "num_comprobante", e.target.value)
                }
                className="bg-background h-10 text-xs"
                disabled={disabled}
              />
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addPayment}
        disabled={disabled || payments.length >= MAX_PAYMENTS}
        className="w-full h-9 flex items-center justify-center gap-2 rounded-md border border-dashed border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        {payments.length >= MAX_PAYMENTS
          ? "Máximo de 7 pagos alcanzado"
          : "Agregar método de pago"}
      </button>
    </div>
  );
}