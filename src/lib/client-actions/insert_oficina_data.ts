"use client";

import {
  officeOrderSchema,
 
} from "@/lib/zod-schemas/oficinaInfo-schema";

import { createSupabaseBrowserClient } from "../supabase/client";
import { EntryOrderPaymentDetail } from "../server-actions/fetch_entry_orders_list";
import { Database } from "../../../supabase/types/database.types";
import { OfficeFormState } from "@/components/dashboard/oficina/OfficeOrderForm";


interface UpdateOfficeOrderArgs {
  orderId: string;
  formData: OfficeFormState;
  payments: EntryOrderPaymentDetail[];
  vehicleServiceRateId: string;
  ratePriceSnapshot: number;
  service_type: Database["public"]["Enums"]["service_type_enum"];
}

export async function insertOficinaData({
  orderId,
  formData,
  payments,
  vehicleServiceRateId,
  ratePriceSnapshot,
  service_type
}: UpdateOfficeOrderArgs) {
  if (!orderId || orderId === "") {
    return {
      data: null,
      error: "Error: No hay una orden de entrada valida",
    };
  }

  if (formData.oficina_consecutivo_factura.trim() === "" ) {
    return {
      data: null,
      error: "Error: No hay consecutivo de factura",
    };
  }

  if (formData.oficina_pin.trim() === "" && service_type === "RTM") {
    return {
      data: null,
      error: "Error: No se ha registrado un pin",
    };
  }

  if (!vehicleServiceRateId) {
    return {
      data: null,
      error: "Error: No se ha seleccionado una tarifa",
    };
  }

  if (ratePriceSnapshot < 0) {
    return {
      data: null,
      error: "Error: El valor de la tarifa no es válido",
    };
  }

  const invalidPayment = payments.some(
    (payment) =>
      !payment.payment_method||
      payment.monto_bruto <= 0,
  );

  if (invalidPayment) {
    return {
      data: null,
      error:
        "Error: Todos los pagos deben tener un método seleccionado y un valor mayor a $0.",
    };
  }

  const cardWithoutVoucher = payments.some(
    (payment) =>
      (payment.payment_method === "tarjeta_debito" ||
        payment.payment_method === "tarjeta_credito") &&
      !payment.num_comprobante?.trim(),
  );

  if (cardWithoutVoucher) {
    return {
      data: null,
      error:
        "Error: Los pagos con tarjeta débito o crédito requieren un número de voucher o comprobante.",
    };
  }

  // Validación estricta con Zod
  const validatedFields = officeOrderSchema.safeParse({
  ...formData,
  service_type,
});

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.issues,
    };
  }

  // Inicialización del cliente de Supabase
  const supabaseBrowser = createSupabaseBrowserClient();

  // Invocación del RPC
  const { data: officeUpdatedData, error } =
    await supabaseBrowser.rpc("update_office_order_data", {
      p_order_id: orderId,
      p_pin: formData.oficina_pin,
      p_consecutivo_factura:
        validatedFields.data.oficina_consecutivo_factura,
      p_se_compro_soat:
        validatedFields.data.se_compro_soat,
      p_vehicle_service_rate_id: vehicleServiceRateId,
      p_rate_price_snapshot: ratePriceSnapshot,
       p_payments: payments.map((payment) => ({
      paymentMethod: payment.payment_method,
      amount: payment.monto_bruto,
      receiptNumber: payment.num_comprobante ?? null,
    })),
    });

  // Gestión de errores provenientes de PostgreSQL
  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  console.log(
    "Datos de liquidación de oficina actualizados correctamente:",
  );
  console.log(`Orden ID: ${orderId}`);

  return {
    data: `Exito: ${officeUpdatedData}`,
    error: null,
  };
}