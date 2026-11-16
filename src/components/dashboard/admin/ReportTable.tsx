"use client";

import { useContext } from "react";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AdminContext } from "@/contexts/AdminLoaderContext"; // ajusta la ruta
import DiaryReportTable from "./DiaryReportTable";
import MonthReportTable from "./MonthReportTable";

// ============================================================
// CONSTANTES
// ============================================================

const MESES = [
  { label: "Enero", value: 1 },
  { label: "Febrero", value: 2 },
  { label: "Marzo", value: 3 },
  { label: "Abril", value: 4 },
  { label: "Mayo", value: 5 },
  { label: "Junio", value: 6 },
  { label: "Julio", value: 7 },
  { label: "Agosto", value: 8 },
  { label: "Septiembre", value: 9 },
  { label: "Octubre", value: 10 },
  { label: "Noviembre", value: 11 },
  { label: "Diciembre", value: 12 },
];

const ANOS = [
  { label: "2024", value: 2024 },
  { label: "2025", value: 2025 },
  { label: "2026", value: 2026 },
  { label: "2027", value: 2027 },
  { label: "2028", value: 2028 },
];

const SERVICIOS = [
  { label: "Todos", value: "__all__" },
  { label: "RTM", value: "RTM" },
  { label: "Preventiva", value: "preventiva" },
  { label: "Preventiva viajero", value: "preventiva_viajero" },
  { label: "Peritaje", value: "peritaje" },
  { label: "Prueba de gases", value: "prueba_gases" },
];

// ============================================================
// COMPONENTE
// ============================================================

export default function ReportTable() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("ReportTable debe usarse dentro de AdminContext.Provider");
  }

  const {
    mesContabilidadSeleccionado,
    setMesContabilidadSeleccionado,
    anoContabilidadSeleccionado,
    setAnoContabilidadSeleccionado,
    servicioTipoContabilidadSeleccionado,
    setServicioTipoContabilidadSeleccionado,
    reportesDesglosePrecioQuery,
  } = context.AdminContextValue;

  const { data, isFetching, isError, error, refetch } =
    reportesDesglosePrecioQuery;

  // Normalizamos el servicio para el Select
  const servicioSelectValue = servicioTipoContabilidadSeleccionado ?? "__all__";

  // ============================================================
  // BADGE DE ESTADO
  // ============================================================
  const renderStatusBadge = () => {
    if (isError) {
      return (
        <Badge
          variant="destructive"
          className="gap-1.5 px-3 py-1 min-w-35 justify-center shadow-sm"
        >
          <AlertCircle className="h-3.5 w-4" />
          Error
        </Badge>
      );
    }

    if (isFetching) {
      return (
        <Badge
          variant="default"
          className="gap-1.5 px-3 py-1 min-w-35 justify-center shadow-sm"
        >
          <Loader2 className="h-3.5 w-4 animate-spin" />
          Actualizando...
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="gap-1.5 px-3 py-1 min-w-35 justify-center shadow-sm border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
      >
        <CheckCircle2 className="h-3.5 w-4" />
        Datos actualizados
      </Badge>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="space-y-5 p-6 bg-background rounded-2xl shadow-sm">
      {/* ======================================================
          SECCIÓN SUPERIOR: filtros + badge + refrescar
          ====================================================== */}
      <div className="flex flex-col gap-3 bg-muted/30 p-4 rounded-xl border border-border shadow-sm">
        <div className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <span className="text-sm font-semibold text-muted-foreground">
            Desglose de precios
          </span>

          <div className="flex items-center gap-3">
            {renderStatusBadge()}

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching || data === undefined}
              className="h-9"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
              />
              Refrescar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Mes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Mes
            </label>
            <Select
              items={MESES}
              value={mesContabilidadSeleccionado}
              onValueChange={(value) =>
                setMesContabilidadSeleccionado(Number(value))
              }
            >
              <SelectTrigger className="w-full bg-background h-9 text-xs">
                <SelectValue placeholder="Seleccione mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Mes</SelectLabel>
                  {MESES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Año */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Año
            </label>
            <Select
              items={ANOS}
              value={anoContabilidadSeleccionado}
              onValueChange={(value) =>
                setAnoContabilidadSeleccionado(Number(value))
              }
            >
              <SelectTrigger className="w-full bg-background h-9 text-xs">
                <SelectValue placeholder="Seleccione año" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Año</SelectLabel>
                  {ANOS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Servicio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Tipo de servicio
            </label>
            <Select
              items={SERVICIOS}
              value={servicioSelectValue}
              onValueChange={(value) => {
                if (value === "__all__") {
                  setServicioTipoContabilidadSeleccionado(null);
                  return;
                }

                // Validamos que sea un valor del enum
                const valoresValidos = [
                  "RTM",
                  "preventiva",
                  "preventiva_viajero",
                  "peritaje",
                  "prueba_gases",
                ] as const;

                if (
                  valoresValidos.includes(
                    value as (typeof valoresValidos)[number],
                  )
                ) {
                  setServicioTipoContabilidadSeleccionado(
                    value as (typeof valoresValidos)[number],
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
        </div>
      </div>

      {/* ======================================================
          ESTADO: cargando
          ====================================================== */}
      {isFetching && !data && (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="font-medium">Cargando desglose...</span>
        </div>
      )}

      {/* ======================================================
          ESTADO: error
          ====================================================== */}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <span className="font-medium">Error al cargar el desglose</span>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      )}

      {/* ======================================================
          TABLAS (solo si hay datos)
          ====================================================== */}
      {data && (
        <div className="space-y-8">
          {/* ==================================================
              TABLA MENSUAL (días del mes)
              ================================================== */}
          <DiaryReportTable
            data={data.chart_mes}
            mesLabel={
              MESES.find((m) => m.value === mesContabilidadSeleccionado)
                ?.label ?? ""
            }
            ano={anoContabilidadSeleccionado}
          />

          {/* ==================================================
              TABLA ANUAL (meses del año)
              ================================================== */}

          <MonthReportTable
            data={data.chart_anio}
            ano={anoContabilidadSeleccionado}
          />
        </div>
      )}
    </div>
  );
}
