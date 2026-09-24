
"use client";

import { useContext } from "react";

import { Info } from "lucide-react";

import dynamic from "next/dynamic";

import {
  AdminContext,
  PaymentsByMethodData,
} from "@/contexts/AdminLoaderContext";

import { DateRangePicker } from "../_shared/DateRangePicker";

import { LazyChartOnScroll } from "./RenderWhenVisible";

// ============================================================================
// LAZY LOAD DEL GRÁFICO
// ============================================================================

const ChartBarPagosPorMetodo = dynamic(
  () => import("@/components/dashboard/admin/ChartBarPaymentsporTipo"),
  {
    ssr: false,
  },
);

// ============================================================================
// COMPONENTE
// ============================================================================

export default function AnaliticaPagosPorMetodo() {
  const adminContextReceived = useContext(AdminContext);

  if (!adminContextReceived) {
    return null;
  }

  const {
    paymentsByMethodQuery,
    paymentsByMethodDiaryQuery,
    datePaymentMethodRange,
    setDatePaymentMethodRange,
  } = adminContextReceived.AdminContextValue;

  const datosHistoricos = paymentsByMethodQuery.data;

  const datosDiarios = paymentsByMethodDiaryQuery.data;

  // ==========================================================================
  // FECHA ACTUAL EN COLOMBIA
  // ==========================================================================

  const fechaColombia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
  }).format(new Date());

  // ==========================================================================
  // FECHA FINAL DEL RANGO SELECCIONADO
  // ==========================================================================

  const fechaFinSeleccionada = datePaymentMethodRange?.to
    ? new Intl.DateTimeFormat("en-CA").format(datePaymentMethodRange.to)
    : null;

  // ==========================================================================
  // ¿EL RANGO INCLUYE HOY?
  // ==========================================================================

  const incluyeHoy = fechaFinSeleccionada === fechaColombia;

  // ==========================================================================
  // COMBINACIÓN DE DATOS
  //
  // Los datos históricos no incluyen hoy.
  // Por eso, cuando el rango termina hoy, agregamos los datos diarios.
  // ==========================================================================

  let paymentsByMethod: PaymentsByMethodData | undefined;

  // --------------------------------------------------------------------------
  // No tenemos ningún dato
  // --------------------------------------------------------------------------

  if (!datosHistoricos && !datosDiarios) {
    paymentsByMethod = undefined;

  // --------------------------------------------------------------------------
  // El rango NO incluye hoy.
  // Solamente necesitamos los datos históricos.
  // --------------------------------------------------------------------------

  } else if (!incluyeHoy) {
    paymentsByMethod = datosHistoricos;

  // --------------------------------------------------------------------------
  // El rango incluye hoy pero no tenemos históricos.
  // Usamos únicamente los datos diarios.
  // --------------------------------------------------------------------------

  } else if (!datosHistoricos && datosDiarios) {
    paymentsByMethod = datosDiarios;

  // --------------------------------------------------------------------------
  // No tenemos históricos.
  // --------------------------------------------------------------------------

  } else if (!datosHistoricos) {
    paymentsByMethod = undefined;

  // --------------------------------------------------------------------------
  // Tenemos históricos pero no tenemos datos diarios.
  // --------------------------------------------------------------------------

  } else if (!datosDiarios) {
    paymentsByMethod = datosHistoricos;

  // --------------------------------------------------------------------------
  // Tenemos ambos.
  // Sumamos cada método de pago.
  // --------------------------------------------------------------------------

  } else {
  const metodosPago = Object.keys(
    datosHistoricos,
  ) as Array<keyof PaymentsByMethodData>;

  paymentsByMethod = Object.fromEntries(
    metodosPago.map((metodo) => [
      metodo,
      (datosHistoricos[metodo] ?? 0) +
        (datosDiarios[metodo] ?? 0),
    ]),
  ) as PaymentsByMethodData;
}

  return (
    <section className="w-full rounded-xl border border-border bg-card shadow-sm">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}

      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Cantidad de Pagos por Método
          </h2>

          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" />

            <p>
              Cantidad de pagos realizados según el método utilizado
              durante el rango especificado.
            </p>
          </div>
        </div>

        {/* ================================================================ */}
        {/* SELECTOR DE FECHAS */}
        {/* ================================================================ */}

        <div className="shrink-0">
          <DateRangePicker
            dateRange={datePaymentMethodRange}
            setDateRange={setDatePaymentMethodRange}
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* GRÁFICO */}
      {/* ================================================================== */}

      <div className="overflow-x-auto p-5">
        <LazyChartOnScroll>
          <ChartBarPagosPorMetodo
            paymentsByMethod={paymentsByMethod}
          />
        </LazyChartOnScroll>
      </div>
    </section>
  );
}
