"use client";

import AnaliticaPorCantidad from "@/components/dashboard/admin/AnaliticaPorCantidad";
import AnaliticaVehiculosPorTipo from "@/components/dashboard/admin/AnaliticaVehiculosPorTipo";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminAnalyticsData,
  AdminAnalyticsDiaryData,
  AdminContext,
  DayChartItem,
  MonthChartItem,
} from "@/contexts/AdminLoaderContext";
import { useContext } from "react";

export type CompleteDataRTM =
  | (AdminAnalyticsData &
      AdminAnalyticsDiaryData & {
        tasa_rechazo_hoy: number;
        tasa_rechazo_ayer: number;

        total_rtm_mes_actual: number;
        total_rtm_anio_actual: number;

        tasa_rechazo_mes: number;
        tasa_rechazo_anio: number;

        chart_mes_actual: DayChartItem[];
        chart_anio_actual: MonthChartItem[];

        chart_tasa_rechazo_mes: DayChartItem[];
        chart_tasa_rechazo_anio: MonthChartItem[];
      })
  | undefined;

export default function AnaliticaPage() {
  const adminContextReceived = useContext(AdminContext);

  if (!adminContextReceived) {
    return null;
  }

  const {
    analyticsQuery,
    analyticsQueryDiary,
    servicioTipoSeleccionado,
    setServicioTipoSeleccionado,
  } = adminContextReceived.AdminContextValue;

  const { data: analyticsDataDiary } = analyticsQueryDiary;

  const servicios = [
    { label: "RTM", value: "RTM" },
    { label: "Preventiva", value: "preventiva" },
    { label: "Peritaje", value: "peritaje" },
  ];

  const ahora = new Date();

  const fechaColombia = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(ahora);

  const diaActual = Number(
    fechaColombia.find((part) => part.type === "day")?.value,
  );

  const mesActual = Number(
    fechaColombia.find((part) => part.type === "month")?.value,
  );

  const anoActual = Number(
    fechaColombia.find((part) => part.type === "year")?.value,
  );

  // Guardamos el valor en una constante segura (si es undefined, vale 0)
  const totalHoy = analyticsDataDiary?.total_rtm_hoy ?? 0;
  const totalRechazadosHoy = analyticsDataDiary?.total_rtm_rechazados_hoy ?? 0;

  const completeDataRTM: CompleteDataRTM = analyticsQuery.data
    ? {
        ...analyticsQuery?.data,

        total_rtm_hoy: totalHoy,
        total_rtm_rechazados_hoy: totalRechazadosHoy,
        // Tasa Hoy: (Rechazos Hoy / Total Hoy) * 100
        tasa_rechazo_hoy:
          totalHoy > 0
            ? Number(((totalRechazadosHoy / totalHoy) * 100).toFixed(2))
            : 0,

        total_rtm_ayer: analyticsQuery.data.total_rtm_ayer,
        total_rechazado_ayer: analyticsQuery.data.total_rechazado_ayer,
        // Tasa Ayer: (Rechazos Ayer / Total Ayer) * 100
        tasa_rechazo_ayer:
          analyticsQuery.data.total_rtm_ayer > 0
            ? Number(
                (
                  (analyticsQuery.data.total_rechazado_ayer /
                    analyticsQuery.data.total_rtm_ayer) *
                  100
                ).toFixed(2),
              )
            : 0,

        total_rtm_mes_actual: analyticsQuery.data.total_rtm_mes + totalHoy,
        total_rtm_anio_actual: analyticsQuery.data.total_rtm_anio + totalHoy,

        total_rechazado_mes:
          analyticsQuery.data.total_rechazado_mes + totalRechazadosHoy,
        total_rechazado_anio:
          analyticsQuery.data.total_rechazado_anio + totalRechazadosHoy,

        // Tasa Mes: (Acumulado Rechazos Mes / Acumulado Total Mes) * 100
        tasa_rechazo_mes:
          analyticsQuery.data.total_rtm_mes + totalHoy > 0
            ? Number(
                (
                  ((analyticsQuery.data.total_rechazado_mes +
                    totalRechazadosHoy) /
                    (analyticsQuery.data.total_rtm_mes + totalHoy)) *
                  100
                ).toFixed(2),
              )
            : 0,

        // Tasa Año: (Acumulado Rechazos Año / Acumulado Total Año) * 100
        tasa_rechazo_anio:
          analyticsQuery.data.total_rtm_anio + totalHoy > 0
            ? Number(
                (
                  ((analyticsQuery.data.total_rechazado_anio +
                    totalRechazadosHoy) /
                    (analyticsQuery.data.total_rtm_anio + totalHoy)) *
                  100
                ).toFixed(2),
              )
            : 0,

        // =======================================================================
        // 4. ACTUALIZACIÓN DE GRÁFICOS (Cantidades)
        // =======================================================================
        chart_mes_actual:
          analyticsQuery.data.chart_mes?.map((item) => {
            const esHoy =
              Number(item.dia) === diaActual &&
              item.mes === mesActual &&
              item.ano === anoActual;

            if (esHoy) {
              return {
                ...item,
                total: item.total + totalHoy,
              };
            }

            return item;
          }) ?? [],

        chart_anio_actual:
          analyticsQuery.data.chart_anio?.map((item) => {
            const esMesActual =
              item.numero_mes === mesActual && item.ano === anoActual;

            if (esMesActual) {
              return {
                ...item,
                total: item.total + totalHoy,
              };
            }

            return item;
          }) ?? [],

        chart_rechazado_mes:
          analyticsQuery.data.chart_rechazado_mes?.map((item) => {
            const esHoy =
              Number(item.dia) === diaActual &&
              item.mes === mesActual &&
              item.ano === anoActual;

            if (esHoy) {
              return {
                ...item,
                total: item.total + totalRechazadosHoy,
              };
            }

            return item;
          }) ?? [],

        chart_rechazado_anio:
          analyticsQuery.data.chart_rechazado_anio?.map((item) => {
            const esMesActual =
              item.numero_mes === mesActual && item.ano === anoActual;

            if (esMesActual) {
              return {
                ...item,
                total: item.total + totalRechazadosHoy,
              };
            }

            return item;
          }) ?? [],

        // =======================================================================
        // 5. NUEVOS GRÁFICOS DE TASAS DE RECHAZO (Calculados al vuelo)
        // =======================================================================
        // Combinamos el array base del mes con el array de rechazos del mes usando el índice (index)
        chart_tasa_rechazo_mes:
          analyticsQuery.data.chart_mes?.map((item, index) => {
            const rechazoItem =
              analyticsQuery.data.chart_rechazado_mes?.[index];

            const isToday =
              Number(item.dia) === diaActual &&
              item.mes === mesActual &&
              item.ano === anoActual;

            const currentTotal = isToday
              ? (item.total || 0) + totalHoy
              : item.total || 0;

            const currentRechazo = isToday
              ? (rechazoItem?.total || 0) + totalRechazadosHoy
              : rechazoItem?.total || 0;

            return {
              dia: item.dia,
              mes: item.mes,
              ano: item.ano,
              total:
                currentTotal > 0
                  ? Number(((currentRechazo / currentTotal) * 100).toFixed(2))
                  : 0,
            };
          }) ?? [],

        chart_tasa_rechazo_anio:
          analyticsQuery.data.chart_anio?.map((item, index) => {
            const rechazoItem =
              analyticsQuery.data.chart_rechazado_anio?.[index];

            const isThisMonth =
              item.numero_mes === mesActual && item.ano === anoActual;

            const currentTotal = isThisMonth
              ? (item.total || 0) + totalHoy
              : item.total || 0;

            const currentRechazo = isThisMonth
              ? (rechazoItem?.total || 0) + totalRechazadosHoy
              : rechazoItem?.total || 0;

            return {
              mes: item.mes,
              numero_mes: item.numero_mes,
              ano: item.ano,
              total:
                currentTotal > 0
                  ? Number(((currentRechazo / currentTotal) * 100).toFixed(2))
                  : 0,
            };
          }) ?? [],
      }
    : undefined;

  return (
    // section proporciona la raíz semántica. px-4 o px-6 da el margen sutil para que nada toque los bordes.
    <section className="w-full px-6 py-4 flex flex-col gap-6 bg-background">
      {/* header agrupa el bloque de presentación de la página */}
      <header className="w-full border-b border-border pb-4">
        <h1 className="text-3xl font-black tracking-wider text-foreground uppercase select-none drop-shadow-sm">
          Analítica
        </h1>

        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Monitor de rendimiento general y financiero. Supervisa el flujo de
          caja, las tasas de aprobación y el cumplimiento de los tiempos
          normativos (ISO 17020) en tiempo real.
        </p>
      </header>

      <div className="w-full">
        <Select
          items={servicios}
          value={servicioTipoSeleccionado}
          onValueChange={(value) => {
            setServicioTipoSeleccionado(value);
          }}
        >
          <SelectTrigger className="h-16 w-full text-xl font-bold">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-base">Tipo de servicio</SelectLabel>

              {servicios.map((servicio) => (
                <SelectItem key={servicio.value} value={servicio.value}>
                  {servicio.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* 🌟 AQUÍ IRÁ EL CONTENEDOR PRINCIPAL DE LOS GRÁFICOS EN EL SIGUIENTE PASO */}
      <div className="flex flex-col gap-6 w-full">
        <AnaliticaPorCantidad
          titulo="Inspecciones Realizadas"
          descripcion="Volumen total de vehículos que han ingresado a la línea de revisión (Primeras entradas)."
          datos={completeDataRTM}
        />

        <AnaliticaPorCantidad
          titulo="Cantidad RTM Reprobadas"
          descripcion="RTMs reprobadas."
          datos={completeDataRTM}
        />

        <AnaliticaPorCantidad
          titulo="Tasa de Rechazo"
          descripcion="Porcentaje de reprobadas con respecto a todas la placas por primera vez (no se cuentan reinspecciones reprobadas)"
          datos={completeDataRTM}
        />

        <AnaliticaVehiculosPorTipo />
      </div>
    </section>
  );
}
