
"use client";

import { EntryOrderListItem } from "@/types/functions_types";
import { Badge } from "@/components/ui/badge";

import {
  CalendarDays,
  CarFront,
  Fuel,
  Gauge,
  UserRound,
  ShieldCheck,
  GraduationCap,
  Globe,
  Tag,
  Wrench,
} from "lucide-react";

interface SimpleOfficeOrderDetailsProps {
  orden: EntryOrderListItem;
}

// ==========================================
// FORMATO DE DATOS
// ==========================================

function formatLabel(value: string | null | undefined) {
  if (!value) return "No disponible";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "SIN REGISTRO";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date).toUpperCase();
}

// ==========================================
// ESTADOS DE LA ORDEN
// ==========================================

const STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  abierta: {
    label: "Abierta",
    className:
      "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/50 font-semibold tracking-wide shadow-sm transition-colors",
  },
  en_prueba: {
    label: "En Prueba",
    className:
      "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50 font-semibold tracking-wide shadow-sm transition-colors",
  },
  finalizada: {
    label: "Finalizada",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/50 font-semibold tracking-wide shadow-sm transition-colors",
  },
  anulada: {
    label: "Anulada",
    className:
      "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-900/50 font-semibold tracking-wide line-through opacity-90 shadow-sm transition-colors",
  },
};

// ==========================================
// INDICADORES DE CARACTERÍSTICAS
// ==========================================

interface FeatureIndicatorProps {
  label: string;
  value: boolean | null;
  icon: React.ElementType;
}

function FeatureIndicator({
  label,
  value,
  icon: Icon,
}: FeatureIndicatorProps) {
  const isActive = value === true;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-colors ${
        isActive
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-muted/40 text-muted-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />

      <span className="text-xs font-semibold text-center">
        {label}
      </span>

      <span className="text-xs font-bold">
        {value === null ? "Pendiente" : isActive ? "Sí" : "No"}
      </span>
    </div>
  );
}

// ==========================================
// FILA DE INFORMACIÓN DEL VEHÍCULO
// ==========================================

interface VehicleInfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

function VehicleInfoRow({
  icon: Icon,
  label,
  value,
  color,
}: VehicleInfoRowProps) {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${color}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>

        <span className="block truncate text-xs font-semibold text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function SimpleOfficeOrderDetails({
  orden,
}: SimpleOfficeOrderDetailsProps) {
  const rawStatus = orden.estado_orden?.toLowerCase() ?? "";

  const statusConfig = STATUS_MAP[rawStatus] ?? {
    label: rawStatus || "Sin estado",
    className: "bg-muted text-foreground border-border",
  };

  return (
    <div className="bg-muted p-4 rounded-xl border border-border sticky top-0 max-h-[calc(100vh-2rem)] overflow-y-auto space-y-4">

      {/* ========================================== */}
      {/* ENCABEZADO: PLACA Y ESTADO */}
      {/* ========================================== */}

      <div className="flex flex-wrap justify-between items-center border-b border-border pb-3 gap-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Ficha Técnica de Entrada
        </span>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-black bg-foreground text-background px-3 py-1 rounded-md tracking-widest uppercase shadow-sm">
            {orden.placa || "S.P"}
          </span>

          <Badge variant="outline" className={statusConfig.className}>
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* ========================================== */}
      {/* TIPO DE INGRESO Y SOAT */}
      {/* ========================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

        {/* Tipo de ingreso */}

        <div
          className={`p-2.5 rounded-lg border flex flex-col justify-between ${
            orden.es_reinspeccion
              ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
              : "bg-background border-border text-muted-foreground"
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
            Tipo de Ingreso
          </span>

          <span className="text-xs font-extrabold mt-0.5">
            {orden.es_reinspeccion
              ? "⚠️ REINSPECCIÓN (2ª Entrada)"
              : "✅ PRIMERA VEZ"}
          </span>
        </div>

        {/* Vencimiento SOAT */}

        <div className="p-2.5 rounded-lg border bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Vencimiento SOAT
          </span>

          <span className="text-xs font-black mt-0.5">
            {formatDate(orden.soat_vencimiento_snapshot)}
          </span>
        </div>
      </div>

      {/* ========================================== */}
      {/* SERVICIOS */}
      {/* ========================================== */}

      <section className="grid grid-cols-2 gap-2">

        {/* Servicio solicitado */}

        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Wrench className="h-3.5 w-3.5" />
          </div>

          <div className="min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Servicio solicitado
            </span>

            <span className="block truncate text-xs font-bold text-foreground">
              {formatLabel(orden.service_type)}
            </span>
          </div>
        </div>

        {/* Servicio del vehículo */}

        <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <CarFront className="h-3.5 w-3.5" />
          </div>

          <div className="min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Servicio del vehículo
            </span>

            <span className="block truncate text-xs font-bold text-foreground">
              {formatLabel(orden.vehiculo_tipo_servicio_snapshot)}
            </span>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* INFORMACIÓN DEL VEHÍCULO */}
      {/* ========================================== */}

      <section className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <CarFront className="h-4 w-4 text-primary" />
          Información del vehículo
        </h3>

        <div className="rounded-xl border border-border/60 bg-background/50 px-3 divide-y divide-border/60">

          <VehicleInfoRow
            icon={Tag}
            label="Marca"
            value={formatLabel(orden.marca)}
            color="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          />

          <VehicleInfoRow
            icon={CarFront}
            label="Línea"
            value={formatLabel(orden.linea)}
            color="bg-sky-500/10 text-sky-600 dark:text-sky-400"
          />

          <VehicleInfoRow
            icon={Gauge}
            label="Tipo de vehículo"
            value={formatLabel(orden.vehiculo_tipo_snapshot)}
            color="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          />

          <VehicleInfoRow
            icon={Fuel}
            label="Combustible"
            value={formatLabel(orden.vehiculo_combustible_snapshot)}
            color="bg-orange-500/10 text-orange-600 dark:text-orange-400"
          />
        </div>
      </section>

      {/* ========================================== */}
      {/* CARACTERÍSTICAS ESPECIALES */}
      {/* ========================================== */}

      <section className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Características del vehículo
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <FeatureIndicator
  label="Blindaje"
  value={orden.vehiculo_blindaje_snapshot}
  icon={ShieldCheck}
/>

<FeatureIndicator
  label="Enseñanza"
  value={orden.vehiculo_es_ensenanza_snapshot}
  icon={GraduationCap}
/>

<FeatureIndicator
  label="Extranjero"
  value={orden.vehiculo_es_extranjero_snapshot}
  icon={Globe}
/>
        </div>
      </section>

      {/* ========================================== */}
      {/* FUNCIONARIO RESPONSABLE */}
      {/* ========================================== */}

      <div className="flex items-center gap-2 border-t border-border/60 pt-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted-foreground/10 text-muted-foreground">
          <UserRound className="h-3.5 w-3.5" />
        </div>

        <div className="min-w-0">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Funcionario responsable
          </span>

          <span className="block text-xs font-medium text-muted-foreground">
  {orden.funcionario_nombre_snapshot || "No disponible"}
</span>
        </div>
      </div>
    </div>
  );
}
