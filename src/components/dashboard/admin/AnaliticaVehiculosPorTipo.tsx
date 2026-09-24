"use client";

import { useContext } from "react";
import { Info } from "lucide-react";
import dynamic from "next/dynamic";

import {
  AdminContext,
  VehiclesByTypeData,
} from "@/contexts/AdminLoaderContext";

import { DateRangePicker } from "../_shared/DateRangePicker";
import { LazyChartOnScroll } from "./RenderWhenVisible";

const ChartBarVehiculosPorTipo = dynamic(
  () => import("./ChartBarVehiculosPorTipo"),
  {
    ssr: false,
  },
);

export default function AnaliticaVehiculosPorTipo() {
  const adminContextReceived = useContext(AdminContext);

  if (!adminContextReceived) {
    return null;
  }

  const {
    vehiclesByTypeQuery,
    vehiclesByTypeDiaryQuery,
    dateVehicleTypeRange,
    setDateVehicleTypeRange,
  } = adminContextReceived.AdminContextValue;

  const datosHistoricos = vehiclesByTypeQuery.data;
  const datosDiarios = vehiclesByTypeDiaryQuery.data;

  const fechaColombia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
  }).format(new Date());

  const fechaFinSeleccionada = dateVehicleTypeRange?.to
    ? new Intl.DateTimeFormat("en-CA").format(dateVehicleTypeRange.to)
    : null;

  const incluyeHoy = fechaFinSeleccionada === fechaColombia;

  let vehiclesByType: VehiclesByTypeData | undefined;

  // No hay ningún dato
  if (!datosHistoricos && !datosDiarios) {
    vehiclesByType = undefined;

    // El rango NO incluye hoy
  } else if (!incluyeHoy) {
    vehiclesByType = datosHistoricos;

    // El rango incluye hoy, pero no hay históricos
  } else if (!datosHistoricos && datosDiarios) {
    vehiclesByType = datosDiarios;

    // El rango incluye hoy, pero tampoco tenemos históricos
  } else if (!datosHistoricos) {
    vehiclesByType = undefined;

    // Tenemos históricos pero no datos de hoy
  } else if (!datosDiarios) {
    vehiclesByType = datosHistoricos;

    // Tenemos ambos datos
  } else {
    vehiclesByType = Object.fromEntries(
      Object.keys(datosHistoricos).map((tipo) => [
        tipo,
        (datosHistoricos[tipo] ?? 0) + (datosDiarios[tipo] ?? 0),
      ]),
    ) as VehiclesByTypeData;
  }



  return (
    <section className="w-full rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Cantidad RTM por Tipo de Vehículo
          </h2>

          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" />

            <p>
              Cantidad de revisiones técnico-mecánicas en el rango especificado.
            </p>
          </div>
        </div>

        {/* Selector de fechas */}
        <div className="shrink-0">
          <DateRangePicker
            dateRange={dateVehicleTypeRange}
            setDateRange={setDateVehicleTypeRange}
          />
        </div>
      </div>

      {/* Gráfico */}
      {/* Gráfico */}
      <div className="overflow-x-auto p-5">
        <LazyChartOnScroll>
          <ChartBarVehiculosPorTipo
            vehiclesByType={vehiclesByType}
          />
        </LazyChartOnScroll>
      </div>
    </section>
  );
}