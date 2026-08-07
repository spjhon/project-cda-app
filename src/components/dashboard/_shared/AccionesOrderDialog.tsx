import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Ban } from "lucide-react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import OrderViewPDF from "./pdfs/OrderViewPDF";
import OrderDownloadPDF from "./pdfs/OrderDownloadPDF";
import CancelOrder from "./CancelOrder";
import { UseMutateFunction } from "@tanstack/react-query";
import AccionesOrderOfficeDialog from "../oficina/AccionesOrderOfficeDialog";
import AccionesOrderDirectorTecnicoDialog from "../director-tecnico/AccionesOrderDirectorTecnicoDialog";
import VerDetalleOrdenAdminDialog from "../admin/VerDetalleOrdenAdminDialog";

interface AccionesOrderDialogProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
  rol: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccionesOrderDialog({
  orden,
  tenantId,
  rol,
  open,
  onOpenChange,
}: AccionesOrderDialogProps) {
  // 🌟 Control 1: Si el rol es undefined, no se expone ninguna acción
  if (!rol) {
    console.log("Acción denegada: El rol actual es undefined");
    return null;
  }

  // 🌟 Tratamiento para RECEPCIONISTA
  if (rol === "recepcionista") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* Sin DialogTrigger: el botón vive ahora en la celda de la tabla */}
        
        <DialogContent className="sm:max-w-xl p-6 border-border bg-background">
          <DialogHeader className="text-center sm:text-center flex flex-col items-center">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground justify-center">
              <FileText className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              Operaciones de Orden de Entrada
            </DialogTitle>

            <DialogDescription className="text-muted-foreground text-sm mt-3 max-w-md text-center leading-relaxed">
              Gestión de documentos públicos y estado operativo para la placa:
              <span className="block mt-2 text-lg font-black text-foreground bg-muted px-4 py-1.5 rounded-md border border-border tracking-wider w-fit mx-auto shadow-xs">
                {orden.placa?.toUpperCase()}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Sección PDF */}
            <div className="flex flex-col gap-2.5 text-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Documentación PDF
              </span>
              <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50 w-full">
                <OrderViewPDF orderId={orden.id} tenantId={tenantId} />
                <OrderDownloadPDF orderId={orden.id} tenantId={tenantId} />
              </div>
            </div>

            {/* Sección Control de Estado */}
            <div className="flex flex-col gap-2.5 text-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Control de Estado
              </span>
              <div
                className={`flex items-center justify-center p-4 rounded-xl border w-full transition-colors duration-200 ${
                  orden.estado_orden === "abierta"
                    ? "bg-muted/30 border-border/40"
                    : "bg-destructive/5 border-destructive/20"
                }`}
              >
                {orden.estado_orden !== "abierta" ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-destructive bg-destructive/10 px-5 py-2.5 rounded-lg border border-destructive/20 shadow-xs animate-fade-in select-none">
                    <Ban className="h-4 w-4 shrink-0 text-destructive" />
                    <span>
                      {orden.estado_orden === "anulada"
                        ? "Esta orden ya fue anulada"
                        : `No se puede anular la orden porque se encuentra en estado '${orden.estado_orden.replace("_", " ")}'`}
                    </span>
                  </div>
                ) : (
                  <CancelOrder
                    orden={orden}
                    tenantId={tenantId}
                 
                  />
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 🌟 Tratamiento para OFICINA
  if (rol === "oficina") {
    return (
      <AccionesOrderOfficeDialog
        orden={orden}
        tenantId={tenantId}
        rol={rol}
       
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

  // 🌟 Tratamiento para DIRECTOR TÉCNICO
  if (rol === "director-tecnico") {
    return (
      <AccionesOrderDirectorTecnicoDialog
        orden={orden}
        tenantId={tenantId}
        rol={rol}
        
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

  // 🌟 Tratamiento para ADMIN
  if (rol === "admin") {
    return (
      <VerDetalleOrdenAdminDialog
        orden={orden}
        tenantId={tenantId}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

  return null;
}