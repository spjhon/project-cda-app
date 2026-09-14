"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

import { VehicleRate } from "@/lib/client-actions/fetch_rates"

// ==========================================
// DIALOG: ELIMINAR TARIFA
// ==========================================

interface DeleteRateDialogProps {
  rate: VehicleRate
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteRateDialog({
  rate,
  open,
  onOpenChange,
}: DeleteRateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Eliminar tarifa?</DialogTitle>

          <DialogDescription>
            ¿Está seguro de que desea eliminar esta tarifa?
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-sm font-semibold text-foreground">
            {rate.service_type}
          </p>

          <p className="text-sm text-muted-foreground mt-1">
            {rate.base_price.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            })}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              // TODO: ejecutar mutación de eliminación
              onOpenChange(false)
            }}
          >
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}