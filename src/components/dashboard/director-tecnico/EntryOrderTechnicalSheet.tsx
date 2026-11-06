
import { EntryOrderListItem } from "@/types/functions_types";
import {
  FileText,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";



interface EntryOrderTechnicalSheetProps {
  orden: EntryOrderListItem;
}

export function EntryOrderTechnicalSheet({
  orden,
}: EntryOrderTechnicalSheetProps) {
  return (
    <div className="bg-muted/50 p-5 rounded-xl border border-border">
      {/* ENCABEZADO */}
      <div className="flex flex-wrap justify-between items-center border-b border-border pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />

          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Ficha Técnica de Entrada
          </span>
        </div>

        <div className="flex gap-2">
          <span className="text-xs font-black bg-primary text-primary-foreground px-3 py-1 rounded-md tracking-widest uppercase shadow-sm">
            {orden.placa || "S.P"}
          </span>

          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              orden.estado_orden === "anulada"
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : orden.estado_orden === "en_prueba"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted text-foreground border-border"
            }`}
          >
            {orden.estado_orden?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* GRID INFORMATIVO PRINCIPAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
        {/* PROPIETARIO */}
        <div className="space-y-1 bg-background/50 p-3 rounded-lg border border-border/60">
          <span className="text-muted-foreground block font-bold text-[11px] uppercase tracking-wider border-b border-border/40 pb-1">
            Propietario
          </span>

          <span className="text-foreground font-bold block truncate text-sm">
            {orden.propietario_nombre || "N/A"}
          </span>

          <span className="text-[10px] text-muted-foreground block truncate">
            {orden.propietario_tipo_documento?.toUpperCase()}:{" "}
            {orden.propietario_documento || "N/A"}
          </span>

          <div className="pt-1.5 space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0 text-emerald-600" />
              <span className="truncate">
                {orden.propietario_telefono || "Sin teléfono"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0 text-amber-600" />
              <span className="truncate">
                {orden.propietario_email || "Sin correo"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 text-sky-600" />
              <span className="truncate">
                {orden.propietario_direccion || "Sin dirección"}
              </span>
            </div>
          </div>
        </div>

        {/* CLIENTE / CONDUCTOR */}
        <div className="space-y-1 bg-background/50 p-3 rounded-lg border border-border/60">
          <span className="text-muted-foreground block font-bold text-[11px] uppercase tracking-wider border-b border-border/40 pb-1">
            Cliente / Conductor
          </span>

          <span className="text-foreground font-bold block truncate text-sm">
            {orden.cliente_nombre || "N/A"}
          </span>

          <span className="text-[10px] text-muted-foreground block truncate">
            {orden.cliente_tipo_documento?.toUpperCase()}:{" "}
            {orden.cliente_documento || "N/A"}
          </span>

          <div className="pt-1.5 space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0 text-emerald-600" />
              <span className="truncate">
                {orden.cliente_telefono || "Sin teléfono"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0 text-amber-600" />
              <span className="truncate">
                {orden.cliente_email || "Sin correo"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 text-sky-600" />
              <span className="truncate">
                {orden.cliente_direccion || "Sin dirección"}
              </span>
            </div>
          </div>
        </div>

        {/* OTROS DATOS VEHICULARES */}
        <div>
          <span className="text-muted-foreground block font-medium mb-0.5">
            Línea del Vehículo
          </span>

          <span className="text-foreground font-semibold block truncate mt-0.5">
            {orden.marca?.toUpperCase()} -{" "}
            {orden.linea?.toUpperCase() || "N/A"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground block font-medium mb-0.5">
            Servicio Solicitado
          </span>

          <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 uppercase border border-amber-200 w-fit">
            {orden.service_type || "RTM"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground block font-medium mb-0.5">
            ¿Es Reinspección?
          </span>

          <span
            className={`font-semibold block mt-0.5 ${
              orden.es_reinspeccion
                ? "text-orange-600"
                : "text-muted-foreground"
            }`}
          >
            {orden.es_reinspeccion
              ? "SÍ (Segunda Entrada)"
              : "NO (Primera Vez)"}
          </span>
        </div>

        <div>
          <span className="text-muted-foreground block font-medium mb-0.5">
            Kilometraje
          </span>

          <span className="text-foreground font-semibold block mt-0.5">
            {orden.kilometraje || "0"} Km
          </span>
        </div>
      </div>
    </div>
  );
}
