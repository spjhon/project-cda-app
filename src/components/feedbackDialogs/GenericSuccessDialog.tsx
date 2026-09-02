
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
import { CheckCircle2 } from "lucide-react";

// ==========================================
// TIPOS
// ==========================================

interface GenericSuccessDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;

  // Texto principal del encabezado
  headerText: string;

  // Texto descriptivo debajo del encabezado
  descriptionText: string;

  // Puede ser un mensaje individual o múltiples mensajes
  messages: string | string[] | null;
}

// ==========================================
// COMPONENTE
// ==========================================

export function GenericSuccessDialog({
  isOpen,
  setIsOpen,
  headerText,
  descriptionText,
  messages,
}: GenericSuccessDialogProps) {
  // ==========================================
  // SI NO HAY MENSAJES, NO RENDERIZAR
  // ==========================================

  if (
    !messages ||
    (Array.isArray(messages) && messages.length === 0)
  ) {
    return null;
  }

  // ==========================================
  // DETECTAR MENSAJE STRING
  // ==========================================

  const isStringMessage = typeof messages === "string";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogContent className="sm:max-w-137.5 max-h-[85vh] flex flex-col p-0 gap-0">

        {/* ==========================================
            ENCABEZADO
            ========================================== */}

        <DialogHeader className="p-6 pb-4 bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-900 flex flex-row items-center gap-3 space-y-0">

          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div>
            <DialogTitle className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
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
              MENSAJE COMO STRING
              ========================================== */}

          {isStringMessage ? (

            <div className="p-4 border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap">
                {messages}
              </p>
            </div>

          ) : (

            /* ==========================================
               MÚLTIPLES MENSAJES
               ========================================== */

            messages.map((message, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border border-border rounded-lg bg-card"
              >
                <div className="space-y-1 w-full">
                  <p className="text-sm font-medium text-foreground">
                    {message}
                  </p>
                </div>
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
