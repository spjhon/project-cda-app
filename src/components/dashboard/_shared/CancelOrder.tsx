"use client";

import { useState } from "react";
import { UseMutateFunction } from "@tanstack/react-query";
import { EntryOrderListItem } from "@/lib/server-actions/fetch_entry_orders_list";
import { Ban, Loader2 } from "lucide-react";
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

interface CancelOrderProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
  mutation: {
    cancelOrder: UseMutateFunction<
      string,
      Error,
      { id: string; tenantId: string },
      unknown
    >;
    isCancelingOrder: boolean;
    errorCancelingOrder: Error | null;
    resetCancelError: () => void;
  };
}

export default function CancelOrder({
  orden,
  tenantId,
  mutation,
}: CancelOrderProps) {
  const [open, setOpen] = useState(false);
  const { cancelOrder, isCancelingOrder } = mutation;

  const handleConfirmCancel = () => {
    if (!tenantId) return;

    cancelOrder(
      { id: orden.id, tenantId },
      {
        onSuccess: () => {
          setOpen(false); // Cerramos el modal solo si la mutación fue exitosa en Supabase
        },
      },
    );
  };


  return (
    <>
      {/* 3. Cuadro de Diálogo para la Anulación (AlertDialog) */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
          render={
            <Button
              variant="destructive"
              size="lg"
              className="w-full sm:w-auto px-6 font-bold bg-destructive hover:bg-destructive/90 active:bg-destructive/80 text-destructive-foreground gap-2 transition-colors shadow-sm"
              title="Anular orden"
              disabled={isCancelingOrder}
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
        ></AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-foreground">
              ¿Está seguro de anular esta orden de entrada?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm block mt-2 text-muted-foreground">
              {/* Primer bloque de texto usando un span */}
              <span className="block mb-3">
                Esta acción aplicará un <strong>Soft Delete</strong> sobre la
                orden con placa{" "}
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded font-semibold text-muted-foreground">
                  {orden.placa}
                </span>
                .
              </span>

              {/* Bloque de advertencia de la norma, usando span estilizado como contenedor */}
              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-sm border border-amber-200 dark:border-amber-900/50 block text-left">
                ⚠️ El estado cambiará a <strong>ANULADA</strong>. Aunque se
                ocultará de los flujos activos, el registro se conservará
                internamente por trazabilidad técnica bajo la norma ISO 17020.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelingOrder}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Evita que Shadcn cierre el modal antes de que termine el proceso asíncrono
                e.stopPropagation();
                handleConfirmCancel();
              }}
              disabled={isCancelingOrder}
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
    </>
  );
}
