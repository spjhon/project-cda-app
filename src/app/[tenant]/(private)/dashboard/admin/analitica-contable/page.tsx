"use client";

import { useContext } from "react";

import {
  AdminContext,
  AdminContabilidadData,
  AdminContabilidadDiaryData,
} from "@/contexts/AdminLoaderContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CuadroMetricaContable } from "@/components/dashboard/admin/CuadroMetricaContable";
import { usePathname } from "next/navigation";
import { LazyChartOnScroll } from "@/components/dashboard/admin/RenderWhenVisible";
import dynamic from "next/dynamic";
import AnaliticaPagosPorMetodo from "@/components/dashboard/admin/AnaliticaPagosPorMetodo";

// ============================================================
// CONSTANTES (fuera del componente)
// ============================================================

const SERVICIOS = [
  { label: "Todos", value: "__all__" },
  { label: "RTM", value: "RTM" },
  { label: "Preventiva", value: "preventiva" },
  { label: "Preventiva viajero", value: "preventiva_viajero" },
  { label: "Peritaje", value: "peritaje" },
  { label: "Prueba de gases", value: "prueba_gases" },
];

const VALORES_VALIDOS = [
  "RTM",
  "preventiva",
  "preventiva_viajero",
  "peritaje",
  "prueba_gases",
] as const;

// ============================================================
// TIPOS
// ============================================================

export type CompleteDataContabilidad =
  | (AdminContabilidadData &
      AdminContabilidadDiaryData & {
        chart_mes_actual: AdminContabilidadData["chart_mes"];
        chart_anio_actual: AdminContabilidadData["chart_anio"];
        chart_semana_actual: AdminContabilidadData["chart_semana"];
      })
  | undefined;

// ============================================================
// COMPONENTES DINÁMICOS
// ============================================================

const ChartBarMonthContabilidad = dynamic(
  () => import("@/components/dashboard/admin/ChartBarMonthContabilida"),
  { ssr: false },
);

const ChartBarYearContabilidad = dynamic(
  () => import("@/components/dashboard/admin/ChartBarYearContabilidad"),
  { ssr: false },
);

// ============================================================
// COMPONENTE
// ============================================================

export default function AnaliticaContablePage() {
  const pathname = usePathname();
  const adminContextReceived = useContext(AdminContext);

  if (!adminContextReceived) {
    return null;
  }

  // 👇 Extraer TODO lo que necesitas del context ANTES de usarlo
  const {
    analyticsContabilidadQuery,
    analyticsContabilidadQueryDiary,
    mesContabilidadSeleccionado,
    anoContabilidadSeleccionado,
    servicioTipoContabilidadSeleccionado,
    setMesContabilidadSeleccionado,
    setServicioTipoContabilidadSeleccionado,
  } = adminContextReceived.AdminContextValue;

  // 👇 Derivar el valor del Select (null → "__all__")
  const servicioSelectValue = servicioTipoContabilidadSeleccionado ?? "__all__";

  const { data: analyticsContabilidadDataDiary } = analyticsContabilidadQueryDiary;

  // ============================================================
  // Fechas de Colombia
  // ============================================================
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

  const totalHoy = analyticsContabilidadDataDiary?.total_recaudado_hoy ?? 0;

  // ============================================================
  // Datos completos (con hoy sumado)
  // ============================================================
  const completeDataContabilidad: CompleteDataContabilidad =
    analyticsContabilidadQuery.data
      ? {
          ...analyticsContabilidadQuery.data,

          total_recaudado_hoy: totalHoy,

          total_recaudado_semana:
            analyticsContabilidadQuery.data.total_recaudado_semana + totalHoy,

          total_recaudado_mes:
            analyticsContabilidadQuery.data.total_recaudado_mes + totalHoy,

          total_recaudado_anio:
            analyticsContabilidadQuery.data.total_recaudado_anio + totalHoy,

          chart_mes_actual:
            analyticsContabilidadQuery.data.chart_mes?.map((item) => {
              const esHoy =
                Number(item.dia) === diaActual &&
                item.mes === mesActual &&
                item.ano === anoActual;

              if (esHoy) {
                return { ...item, total: item.total + totalHoy };
              }
              return item;
            }) ?? [],

          chart_anio_actual:
            analyticsContabilidadQuery.data.chart_anio?.map((item) => {
              const esMesActual =
                item.numero_mes === mesActual && item.ano === anoActual;

              if (esMesActual) {
                return { ...item, total: item.total + totalHoy };
              }
              return item;
            }) ?? [],

          chart_semana_actual:
            analyticsContabilidadQuery.data.chart_semana?.map((item) => {
              const esHoy =
                item.fecha ===
                new Intl.DateTimeFormat("en-CA", {
                  timeZone: "America/Bogota",
                }).format(ahora);

              if (esHoy) {
                return { ...item, total: item.total + totalHoy };
              }
              return item;
            }) ?? [],
        }
      : undefined;

  const isLoadingContabilidad =
    analyticsContabilidadQuery.isLoading ||
    analyticsContabilidadQueryDiary.isLoading;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <section
      className="w-full px-6 py-4 flex flex-col gap-6 bg-background"
      key={pathname}
    >
      <header className="w-full border-b border-border pb-4">
        <h1 className="text-3xl font-black tracking-wider text-foreground uppercase select-none drop-shadow-sm">
          Analítica contable
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Consulta el recaudo y comportamiento financiero del Centro de
          Diagnóstico Automotor.
        </p>
      </header>

      {/* 👇 SELECT DE SERVICIO (ahora sí, con las variables definidas) */}
      <div className="w-full">
        <Select
          items={SERVICIOS}
          value={servicioSelectValue}
          onValueChange={(value) => {
            if (value === "__all__") {
              setServicioTipoContabilidadSeleccionado(null);
              return;
            }

            if (
              VALORES_VALIDOS.includes(
                value as (typeof VALORES_VALIDOS)[number],
              )
            ) {
              setServicioTipoContabilidadSeleccionado(
                value as (typeof VALORES_VALIDOS)[number],
              );
            }
          }}
        >
          <SelectTrigger className="w-full bg-background h-9 text-xs">
            <SelectValue placeholder="Seleccione servicio" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Servicio</SelectLabel>
              {SERVICIOS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 w-full">
        <CuadroMetricaContable
          label="Recaudado hoy"
          valor={completeDataContabilidad?.total_recaudado_hoy ?? 0}
          esPrimario
          isLoading={isLoadingContabilidad}
        />
        <CuadroMetricaContable
          label="Recaudado ayer"
          valor={completeDataContabilidad?.total_recaudado_ayer ?? 0}
          isLoading={isLoadingContabilidad}
        />
        <CuadroMetricaContable
          label="Recaudado semana"
          valor={completeDataContabilidad?.total_recaudado_semana ?? 0}
          isLoading={isLoadingContabilidad}
        />
        <CuadroMetricaContable
          label="Recaudado mes"
          valor={completeDataContabilidad?.total_recaudado_mes ?? 0}
          isLoading={isLoadingContabilidad}
        />
        <CuadroMetricaContable
          label="Recaudado año"
          valor={completeDataContabilidad?.total_recaudado_anio ?? 0}
          isLoading={isLoadingContabilidad}
        />
      </div>

      {/* GRÁFICOS */}
      <div className="mt-6 w-full">
        <LazyChartOnScroll>
          <ChartBarMonthContabilidad
            chartMonthData={completeDataContabilidad?.chart_mes_actual}
            mesSeleccionado={mesContabilidadSeleccionado}
            anoSeleccionado={anoContabilidadSeleccionado}
            setMesSeleccionado={setMesContabilidadSeleccionado}
            isLoading={isLoadingContabilidad}
          />
        </LazyChartOnScroll>
      </div>

      <div className="mt-6 w-full">
        <LazyChartOnScroll>
          <ChartBarYearContabilidad
            chartYearData={completeDataContabilidad?.chart_anio_actual}
          />
        </LazyChartOnScroll>
      </div>

      <AnaliticaPagosPorMetodo />
    </section>
  );
}