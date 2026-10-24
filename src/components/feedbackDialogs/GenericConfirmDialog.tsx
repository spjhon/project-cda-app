
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

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

  isPending?: boolean
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

          <DialogDescription>
            {description}
          </DialogDescription>
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
            {isPending ? "Procesando..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
