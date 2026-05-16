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
  errors: $ZodIssue[] | null;
}

export function ZodErrorDialog({isOpen, setIsOpen, errors}: ZodErrorDialogProps) {


  

  if (!errors || errors.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>

      <DialogContent className="sm:max-w-137.5 max-h-[85vh] flex flex-col p-0 gap-0">
        {/* Encabezado fijo */}
        <DialogHeader className="p-6 pb-4 bg-destructive/5 border-b flex flex-row items-center gap-3 space-y-0">
          <div className="p-2 bg-destructive/10 text-destructive rounded-full">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-destructive">
              Errores de Validación (Zod)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Se encontraron {errors.length} inconsistencias antes de procesar
              el ingreso.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Cuerpo con Scroll si hay muchos errores */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errors.map((err, index) => {
            // 1. Forzamos a que el path sea un string limpio (ej: "vehicle ➔ combustible")
            // Si err.path no existe por alguna razón, dejamos "General"
            const readablePath =
              Array.isArray(err.path) && err.path.length > 0
                ? err.path.join(" ➔ ")
                : "General";

            // 2. Nos aseguramos de que el message sea un string puro
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
                  {/* ✅ CORRECTO: readablePath es un string, no un objeto */}
                  <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded">
                    {readablePath}
                  </span>

                  {/* ✅ CORRECTO: readableMessage es un string */}
                  <p className="text-sm font-medium pt-1">{readableMessage}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer fijo */}
        <DialogFooter>
        {/* 👇 El hijo es el que ejecuta la función pasándole el false */}
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Entendido, corregir datos
        </Button>
      </DialogFooter>
      </DialogContent>

			
    </Dialog>
  );
}
