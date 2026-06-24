import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, Ban, } from "lucide-react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import OrderViewPDF from "./pdfs/OrderViewPDF";
import OrderDownloadPDF from "./pdfs/OrderDownloadPDF";
import CancelOrder from "./CancelOrder";
import { UseMutateFunction } from "@tanstack/react-query";
import AccionesOrderOfficeDialog from "../oficina/AccionesOrderOfficeDialog";
import AccionesOrderDirectorTecnicoDialog from "../director-tecnico/AccionesOrderDirectorTecnicoDialog";

interface AccionesOrderDialogProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
  mutation: {
    cancelOrder: UseMutateFunction<string, Error, { id: string; tenantId: string; }, unknown>;
    isCancelingOrder: boolean;
    errorCancelingOrder: Error | null;
    resetCancelError: () => void;
  };
  rol: string | undefined;
}

export default function AccionesOrderDialog({
  orden,
  tenantId,
  mutation,
  rol,
}: AccionesOrderDialogProps) {
  // 🌟 Control 1: Si el rol es undefined, no se expone ninguna acción por seguridad
  if (!rol) {
    console.log("Acción denegada: El rol actual es undefined");
    return null;
  }

  // 🌟 Tratamiento para RECEPCIONISTA
  if (rol === "recepcionista") {
    return (
      <Dialog>
        {/* Botón disparador del diálogo usando la sintaxis render de Base UI */}
        <DialogTrigger
          render={(props) => (
            <Button
              {...props}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-900"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir acciones</span>
            </Button>
          )}
        />

        {/* Ventana flotante del Diálogo - Ajustado a un tamaño más grande (max-w-xl) */}
        <DialogContent className="sm:max-w-xl p-6">
          <DialogHeader className="text-center sm:text-center flex flex-col items-center">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 justify-center">
              <FileText className="h-5 w-5 text-amber-500" />
              Operaciones de Orden de Entrada
            </DialogTitle>
            
            {/* Descripción más grande, centrada y placa súper llamativa */}
            <DialogDescription className="text-slate-500 text-sm mt-3 max-w-md text-center leading-relaxed">
              Gestión de documentos públicos y estado operativo para la placa:
              <span className="block mt-2 text-lg font-black text-slate-900 bg-slate-100 px-4 py-1.5 rounded-md border border-slate-200 tracking-wider w-fit mx-auto shadow-xs">
                {orden.placa?.toUpperCase()}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Grid de acciones requeridas para Recepción con contenidos centrados */}
          <div className="grid gap-6 py-4">
            
            {/* Sección PDF: Centrada */}
            <div className="flex flex-col gap-2.5 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Documentación PDF
              </span>
              <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 w-full">
                <OrderViewPDF orderId={orden.id} tenantId={tenantId} />
                <OrderDownloadPDF orderId={orden.id} tenantId={tenantId} />
              </div>
            </div>

            {/* Sección Anular o Mensaje de Anulada: Centrada */}
            <div className="flex flex-col gap-2.5 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Control de Estado
            </span>
           {/* CONTENEDOR DINÁMICO: Ajusta su fondo/borde según si está bloqueado o permitido */}
              <div className={`flex items-center justify-center p-4 rounded-xl border w-full transition-colors duration-200 ${
                orden.estado_orden === "abierta" 
                  ? "bg-stone-50/50 border-stone-100/50" // Fondo neutro si está abierta
                  : "bg-red-50/50 border-red-100/50"    // Fondo de advertencia si no se puede anular
              }`}>

                {orden.estado_orden !== "abierta" ? (
                  /* CASO DE BLOQUEO: Cualquier estado diferente a 'abierta' (en_prueba, finalizada, anulada) */
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-100/60 px-5 py-2.5 rounded-lg border border-red-200 shadow-xs animate-fade-in select-none">
                    <Ban className="h-4 w-4 shrink-0" />
                    <span>
                      {orden.estado_orden === "anulada" 
                        ? "Esta orden ya fue anulada" 
                        : `No se puede anular la orden porque se encuentra en estado '${orden.estado_orden.replace('_', ' ')}'`}
                    </span>
                  </div>
                ) : (
                  /* CASO PERMITIDO: La orden está estrictamente 'abierta' */
                  <CancelOrder
                    orden={orden}
                    tenantId={tenantId}
                    mutation={mutation}
                  />
                )}

              </div>
            </div>
            
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  // 🌟 Espacio reservado para los siguientes roles (oficina, gerente, etc.)
  // Por ahora, si no es recepcionista no muestra nada hasta que los programemos.

  // 🌟 Tratamiento para OFICINA
  if (rol === "oficina") {
    return (
      <AccionesOrderOfficeDialog 
        orden={orden} 
        tenantId={tenantId} 
        rol={rol} 
        mutation={mutation}
      />
    );
  }


  if (rol === "director-tecnico") {
    return (
      <AccionesOrderDirectorTecnicoDialog 
        orden={orden} 
        tenantId={tenantId} 
        rol={rol} 
        mutation={mutation}
      />
    );
  }
  return null;
}


