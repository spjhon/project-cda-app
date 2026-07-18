
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  User,
  Mail,
  Phone,
  FileText,
  Clock,
  RefreshCw,
  Eye,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Reutilizamos los tipos que ya tienes mapeados
interface PQAFData {
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  placa: string | null | undefined;
  description: string;
  requirement_type: "peticion" | "queja" | "apelacion" | "felicitacion";
  status:
    | "pendiente"
    | "en_revision"
    | "resuelto"
    | "nueva_revision"
    | "finalizado";
  created_at: string;
  updated_at: string | null;
}

interface DetallesPQAFDialogProps {
  pqaf: PQAFData;
  
}

// Mapas de estilos y textos para Badges
const typeConfig = {
  peticion: {
    label: "Petición",
    variant: "default" as const,
    className: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  queja: { label: "Queja", variant: "destructive" as const, className: "" },
  apelacion: {
    label: "Apelación",
    variant: "default" as const,
    className: "bg-purple-500 hover:bg-purple-600 text-white",
  },
  felicitacion: {
    label: "Felicitación",
    variant: "default" as const,
    className: "bg-emerald-500 hover:bg-emerald-600 text-white",
  },
};

const statusConfig = {
  pendiente: {
    label: "Pendiente",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
  },
  en_revision: {
    label: "En Revisión",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
  },
  nueva_revision: {
    label: "Nueva Revisión",
    className:
      "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200",
  },
  resuelto: {
    label: "Resuelto",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200",
  },
  finalizado: {
    label: "Finalizado",
    className:
      "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200",
  },
};

export default function DetallesPQAFDialog({
  pqaf,
  
}: DetallesPQAFDialogProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy - hh:mm a", {
        locale: es,
      });
    } catch {
      return dateString;
    }
  };

  const currentType = typeConfig[pqaf.requirement_type] || {
    label: pqaf.requirement_type,
    className: "",
  };
  const currentStatus = statusConfig[pqaf.status] || {
    label: pqaf.status,
    className: "",
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="gap-1.5 h-8">
            <Eye className="h-4 w-4 text-primary" />
            <span>Detalles</span>
          </Button>
        }
      ></DialogTrigger>

      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border border-border shadow-lg">
        {/* Encabezado con Badges */}
        <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/20">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge className={currentType.className}>{currentType.label}</Badge>
            <Badge variant="outline" className={currentStatus.className}>
              {currentStatus.label}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
            Detalles del Requerimiento
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Información completa registrada por el usuario.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Grid de Información del Remitente */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Información del Remitente
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/60">
              <div className="flex items-start gap-2.5">
                <User className="h-4 w-4 text-muted-500 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-500 block">Nombre</span>
                  <span className="text-sm font-medium text-foreground">
                    {pqaf.sender_name}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-muted-500 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-500 block">
                    Correo Electrónico
                  </span>
                  <span className="text-sm font-medium text-foreground break-all">
                    {pqaf.sender_email}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-muted-500 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-500 block">
                    Teléfono de Contacto
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {pqaf.sender_phone}
                  </span>
                </div>
              </div>

              {/* Manejo dinámico y visual de la Placa Opcional */}
              <div className="flex items-start gap-2.5">
                <FileText className="h-4 w-4 text-muted-500 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-500 block">
                    Placa del Vehículo
                  </span>
                  {pqaf.placa && pqaf.placa.trim() !== "" ? (
                    <span className="inline-block uppercase tracking-wider bg-yellow-400/20 text-yellow-800 dark:text-yellow-400 px-2 py-0.5 rounded text-xs font-bold border border-yellow-400/30">
                      {pqaf.placa}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-400 italic font-normal">
                      No asociada
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sección de la Descripción */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Descripción o Motivo
            </h4>
            <div className="p-4 bg-background border border-border rounded-xl shadow-inner max-h-50 overflow-y-auto">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {pqaf.description || "Sin descripción proporcionada."}
              </p>
            </div>
          </div>

          {/* Tiempos e Historial de modificación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Creado: <strong>{formatDate(pqaf.created_at)}</strong>
              </span>
            </div>

            {pqaf.updated_at && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>
                  Modificado: <strong>{formatDate(pqaf.updated_at)}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
