"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

// ==========================================
// TIPOS
// ==========================================

interface GenericErrorDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;

  // Texto del encabezado
  headerText: string;

  // Texto descriptivo debajo del encabezado
  descriptionText: string;

  // Puede ser un error individual o múltiples errores de Zod
  errors: string[] | string | null
}

// ==========================================
// COMPONENTE
// ==========================================

export function GenericErrorDialog({
  isOpen,
  setIsOpen,
  headerText,
  descriptionText,
  errors,
}: GenericErrorDialogProps) {
  // ==========================================
  // SI NO HAY ERRORES, NO RENDERIZAR
  // ==========================================

  if (!errors || (Array.isArray(errors) && errors.length === 0)) {
    return null;
  }

  // ==========================================
  // DETECTAR ERROR STRING
  // ==========================================

  const isStringError = typeof errors === "string";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} disablePointerDismissal>
      <DialogContent className="sm:max-w-137.5 max-h-[85vh] flex flex-col p-0 gap-0">

        {/* ==========================================
            ENCABEZADO
            ========================================== */}

        <DialogHeader className="p-6 pb-4 bg-destructive/5 border-b border-border flex flex-row items-center gap-3 space-y-0">

          <div className="p-2 bg-destructive/10 text-destructive rounded-full shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <div>
            <DialogTitle className="text-lg font-bold text-destructive">
              {headerText}
            </DialogTitle>

            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              {descriptionText}
            </DialogDescription>
          </div>

        </DialogHeader>

        {/* ==========================================
            CUERPO
            ========================================== */}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ==========================================
              ERROR COMO STRING
              ========================================== */}

          {isStringError ? (

            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
              <p className="text-sm font-medium text-destructive whitespace-pre-wrap">
                {errors}
              </p>
            </div>

          ) : (

            /* ==========================================
               MÚLTIPLES ERRORES
               ========================================== */

           errors.map((error, index) => (
            <div key={index}>
                <p>{error}</p>
            </div>
            ))

          )}

        </div>

        {/* ==========================================
            FOOTER
            ========================================== */}

        <DialogFooter className="p-6 pt-4 border-t border-border bg-muted/5">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Entendido
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}