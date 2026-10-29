"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"

interface GenericConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void

  title: string
  description: string
  itemName?: string
  itemDetails?: string

  confirmText?: string
  cancelText?: string

  onConfirm: () => void | Promise<void>

  /**
   * Estado de espera de la mutación.
   * Puedes pasar directamente `mutation.isPending`.
   */
  isPending?: boolean

  /**
   * Mensaje de error que provenga de la mutación.
   * Si existe, se muestra entre el detalle del item y los botones.
   */
  error?: string | null
}

export function GenericConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  itemDetails,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  isPending = false,
  error = null,
}: GenericConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending) return
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {(itemName || itemDetails) && (
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            {itemName && (
              <p className="text-sm font-semibold text-foreground">
                {itemName}
              </p>
            )}

            {itemDetails && (
              <p className="mt-1 text-sm text-muted-foreground">
                {itemDetails}
              </p>
            )}
          </div>
        )}

        {/* Mensaje de error proveniente de la mutación */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="leading-snug">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}