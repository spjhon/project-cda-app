"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { $ZodIssue } from "zod/v4/core";

interface ZodErrorDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  errors: $ZodIssue[] | null | string;
}

export function ZodErrorDialog({ isOpen, setIsOpen, errors }: ZodErrorDialogProps) {
  
  // Si no hay errores, no renderizamos nada
  if (!errors || errors.length === 0) return null;

  // 1. Detectamos de forma segura si es un string directo (Ej: error de Supabase, Red, base de datos)
  const isStringError = typeof errors === "string";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-137.5 max-h-[85vh] flex flex-col p-0 gap-0">
        
        {/* Encabezado dinámico */}
        <DialogHeader className="p-6 pb-4 bg-destructive/5 border-b flex flex-row items-center gap-3 space-y-0">
          <div className="p-2 bg-destructive/10 text-destructive rounded-full">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-destructive">
              {isStringError ? "Error del Sistema" : "Errores de Validación"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              {isStringError
                ? "Ocurrió un problema inesperado al procesar la solicitud."
                : `Se encontraron ${errors.length} inconsistencias antes de procesar el ingreso.`
              }
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Cuerpo del Dialog */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isStringError ? (
            /* ✅ RENDER EN CASO DE STRING SIMPLE */
            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
              <p className="text-sm font-medium text-destructive whitespace-pre-wrap">
                {errors}
              </p>
            </div>
          ) : (
            /* ✅ RENDER EN CASO DE ARRAY DE VALIDACIÓN DE ZOD */
            errors.map((err, index) => {
              const readablePath =
                Array.isArray(err.path) && err.path.length > 0
                  ? err.path.join(" ➔ ")
                  : "General";

              const readableMessage =
                typeof err.message === "string"
                  ? err.message
                  : "Error de validación";

              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded">
                      {readablePath}
                    </span>
                    <p className="text-sm font-medium pt-1">{readableMessage}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer fijo */}
        <DialogFooter className="p-6 pt-4 border-t bg-muted/5">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Entendido, corregir datos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}