
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

interface SimpleEntryOrderTechnicalSheetProps {
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
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  },
  en_prueba: {
    label: "En prueba",
    className:
      "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  finalizada: {
    label: "Finalizada",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  },
  anulada: {
    label: "Anulada",
    className:
      "bg-rose-100 text-rose-800 border-rose-300 line-through dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
  },
};

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

interface CompactInfoProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}

function CompactInfo({
  icon: Icon,
  label,
  value,
  color = "bg-muted text-muted-foreground",
}: CompactInfoProps) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${color}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>

        <span className="block truncate text-xs font-semibold text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}

interface CompactFeatureProps {
  label: string;
  value: boolean | null;
  icon: React.ElementType;
}

function CompactFeature({
  label,
  value,
  icon: Icon,
}: CompactFeatureProps) {
  const isActive = value === true;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 min-w-0 ${
        value === null
          ? "border-border bg-muted/40 text-muted-foreground"
          : isActive
            ? "border-primary/30 bg-primary/5 text-primary"
            : "border-border bg-background text-muted-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />

      <div className="min-w-0">
        <span className="block text-[9px] font-bold truncate">
          {label}
        </span>

        <span className="block text-[10px] font-semibold">
          {value === null ? "Pendiente" : isActive ? "Sí" : "No"}
        </span>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function SimpleEntryOrderTechnicalSheet({
  orden,
}: SimpleEntryOrderTechnicalSheetProps) {
  const rawStatus = orden.estado_orden?.toLowerCase() ?? "";

  const statusConfig = STATUS_MAP[rawStatus] ?? {
    label: rawStatus || "Sin estado",
    className: "bg-muted text-foreground border-border",
  };

  return (
    <div className="rounded-xl border border-border bg-muted/50 p-3 space-y-3">

      {/* ========================================== */}
      {/* ENCABEZADO */}
      {/* ========================================== */}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <CarFront className="h-4 w-4 text-primary" />

          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Ficha técnica de entrada
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-foreground px-2.5 py-1 font-mono text-xs font-black tracking-wider text-background">
            {orden.placa || "S.P"}
          </span>

          <Badge
            variant="outline"
            className={`text-[10px] ${statusConfig.className}`}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* ========================================== */}
      {/* INGRESO Y SOAT */}
      {/* ========================================== */}

      <div className="grid grid-cols-2 gap-2">
        <div
          className={`rounded-lg border p-2 ${
            orden.es_reinspeccion
              ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : "border-border bg-background text-muted-foreground"
          }`}
        >
          <span className="block text-[9px] font-bold uppercase tracking-wider opacity-80">
            Tipo de ingreso
          </span>

          <span className="mt-0.5 block text-[11px] font-extrabold">
            {orden.es_reinspeccion
              ? "⚠ Reinspección (2ª entrada)"
              : "✓ Primera vez"}
          </span>
        </div>

        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2 text-blue-700 dark:text-blue-400">
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider opacity-80">
            <CalendarDays className="h-3 w-3" />
            Vencimiento SOAT
          </span>

          <span className="mt-0.5 block text-[11px] font-extrabold">
            {formatDate(orden.soat_vencimiento_snapshot)}
          </span>
        </div>
      </div>

      {/* ========================================== */}
      {/* SERVICIOS */}
      {/* ========================================== */}

      <div className="grid grid-cols-2 gap-2">
        <CompactInfo
          icon={Wrench}
          label="Servicio solicitado"
          value={formatLabel(orden.service_type)}
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />

        <CompactInfo
          icon={CarFront}
          label="Servicio del vehículo"
          value={formatLabel(orden.vehiculo_tipo_servicio_snapshot)}
          color="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
        />
      </div>

      {/* ========================================== */}
      {/* INFORMACIÓN DEL VEHÍCULO */}
      {/* ========================================== */}

      <section className="space-y-2">
        <h3 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <CarFront className="h-3.5 w-3.5 text-primary" />
          Información del vehículo
        </h3>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg border border-border/60 bg-background/50 p-2.5">
          <CompactInfo
            icon={Tag}
            label="Marca"
            value={formatLabel(orden.marca)}
            color="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          />

          <CompactInfo
            icon={CarFront}
            label="Línea"
            value={formatLabel(orden.linea)}
            color="bg-sky-500/10 text-sky-600 dark:text-sky-400"
          />

          <CompactInfo
            icon={Gauge}
            label="Tipo de vehículo"
            value={formatLabel(orden.vehiculo_tipo_snapshot)}
            color="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          />

          <CompactInfo
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

      <section className="space-y-2">
        <h3 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Características especiales
        </h3>

        <div className="grid grid-cols-3 gap-1.5">
          <CompactFeature
            label="Blindaje"
            value={orden.vehiculo_blindaje_snapshot}
            icon={ShieldCheck}
          />

          <CompactFeature
            label="Enseñanza"
            value={orden.vehiculo_es_ensenanza_snapshot}
            icon={GraduationCap}
          />

          <CompactFeature
            label="Extranjero"
            value={orden.vehiculo_es_extranjero_snapshot}
            icon={Globe}
          />
        </div>
      </section>

      {/* ========================================== */}
      {/* FUNCIONARIO RESPONSABLE */}
      {/* ========================================== */}

      <div className="flex items-center gap-2 border-t border-border/60 pt-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted-foreground/10 text-muted-foreground">
          <UserRound className="h-3.5 w-3.5" />
        </div>

        <div className="min-w-0">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Funcionario responsable
          </span>

          <span className="block truncate text-xs font-semibold text-foreground">
            {orden.funcionario_nombre_snapshot || "No disponible"}
          </span>
        </div>
      </div>
    </div>
  );
}
