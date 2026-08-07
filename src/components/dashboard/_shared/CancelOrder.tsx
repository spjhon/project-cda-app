"use client";

import { useContext, useState } from "react";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import { Ban, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Componentes de Shadcn/UI para el cuadro de diálogo
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EntryOrdersContext } from "@/contexts/EntryOrdersContext";

interface CancelOrderProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
}

export default function CancelOrder({ orden, tenantId }: CancelOrderProps) {
  const EntryOrdersContextRecived = useContext(EntryOrdersContext);
  const { mutation } = EntryOrdersContextRecived?.entryOrdersTableData || {};

  const [open, setOpen] = useState(false);

  const {
    cancelOrder,
    isCancelingOrder,
    errorCancelingOrder,
    resetCancelError,
  } = mutation || {};

  // Evalúa si la orden localmente ya no es anulable para deshabilitar el trigger de entrada
  const isOrderNonCancelable =
    orden.estado_orden === "finalizada" || orden.estado_orden === "anulada";

  const handleOpenChange = (isOpen: boolean) => {
    // Al cerrar el modal, reseteamos el estado de error de la mutación si existe
    if (!isOpen && resetCancelError) {
      resetCancelError();
    }
    setOpen(isOpen);
  };

  const handleConfirmCancel = () => {
    if (!tenantId || !cancelOrder) return;

    // Si había un error de un intento previo, lo limpiamos
    if (resetCancelError) resetCancelError();

    cancelOrder(
      { id: orden.id, tenantId },
      {
        onSuccess: () => {
          setOpen(false); // Cerramos el modal solo si fue exitosa en Supabase
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive"
            size="lg"
            className="w-full sm:w-auto px-6 font-bold bg-destructive hover:bg-destructive/90 active:bg-destructive/80 text-destructive-foreground gap-2 transition-colors shadow-sm"
            title="Anular orden"
            disabled={isCancelingOrder || isOrderNonCancelable}
          >
            {isCancelingOrder ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-destructive-foreground" />
                <span>Anulando Orden...</span>
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 text-destructive-foreground" />
                <span>Anular Orden</span>
              </>
            )}
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold text-foreground">
            ¿Está seguro de anular esta orden de entrada?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm block mt-2 text-muted-foreground">
            {/* Primer bloque de texto */}
            <span className="block mb-3">
              Esta acción aplicará un <strong>Soft Delete</strong> sobre la orden
              con placa{" "}
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded font-semibold text-muted-foreground">
                {orden.placa}
              </span>
              .
            </span>

            {/* Bloque de advertencia de la norma */}
            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-sm border border-amber-200 dark:border-amber-900/50 block text-left">
              ⚠️ El estado cambiará a <strong>ANULADA</strong>. Aunque se
              ocultará de los flujos activos, el registro se conservará
              internamente por trazabilidad técnica bajo la norma ISO 17020.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* 🌟 BLOQUE DE ERROR: Muestra la excepción lanzada por Supabase o la consulta */}
        {errorCancelingOrder && (
          <div className="flex items-start gap-2 p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">
                No se pudo completar la acción
              </span>
              <span>{errorCancelingOrder.message}</span>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCancelingOrder}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Evita que Shadcn cierre el modal antes del callback
              e.stopPropagation();
              handleConfirmCancel();
            }}
            disabled={isCancelingOrder || !cancelOrder}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium"
          >
            {isCancelingOrder ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Anulando...
              </>
            ) : (
              "Sí, anular orden"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}