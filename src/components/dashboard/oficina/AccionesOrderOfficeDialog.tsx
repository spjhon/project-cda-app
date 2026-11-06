"use client";

import { useContext } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FileText } from "lucide-react";

import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";

import OfficeOrderForm from "./OfficeOrderForm";
import OfficeOrderDetails from "./OfficeOrderDetails";
import SimpleOfficeOrderDetails from "./SimpleOfficeOrderDetails";

import { EntryOrderListItem } from "@/types/functions_types";

interface AccionesOrderOfficeDialogProps {
  orden: EntryOrderListItem;
  tenantId: string | undefined;
  rol: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccionesOrderOfficeDialog({
  orden,
  tenantId,
  rol,
  open,
  onOpenChange,
}: AccionesOrderOfficeDialogProps) {
  const permissionsContext = useContext(PermissionsContext);
  // ==========================================
  // VALIDACIÓN DEL ROL
  // ==========================================

  if (!rol) {
    console.log("Acción denegada: El rol actual es undefined");
    return null;
  }

  // Este componente está destinado exclusivamente al perfil de oficina.
  if (rol !== "oficina") {
    return null;
  }

  // ==========================================
  // VALIDACIÓN DEL MÓDULO
  // ==========================================

  const tenantModules =
    permissionsContext?.PermissionsContextValue.tenantModules ?? [];

  const hasFullInfoModule = tenantModules.some(
    (module) => module.code === "full_info_module" && module.is_enabled,
  );

  // ==========================================
  // RENDERIZADO
  // ==========================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl p-6 overflow-y-auto max-h-[90vh]">
        {/* ========================================== */}
        {/* ENCABEZADO PRINCIPAL */}
        {/* ========================================== */}

        <DialogHeader className="text-center sm:text-center flex flex-col items-center border-b border-border pb-4 mb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground justify-center">
            <FileText className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            Operaciones de Orden de Entrada
          </DialogTitle>

          <DialogDescription className="text-muted-foreground text-sm mt-1 max-w-md text-center">
            Panel administrativo de liquidación, carga de certificados y
            auditoría.
          </DialogDescription>
        </DialogHeader>

        {/* ========================================== */}
        {/* CONTENIDO PRINCIPAL */}
        {/* ========================================== */}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* ========================================== */}
          {/* COLUMNA IZQUIERDA */}
          {/* ========================================== */}

          <div className="md:col-span-5 h-full">
            {hasFullInfoModule ? (
              <OfficeOrderDetails orden={orden} />
            ) : (
              <SimpleOfficeOrderDetails orden={orden} />
            )}
          </div>

          {/* ========================================== */}
          {/* COLUMNA DERECHA */}
          {/* ========================================== */}

          <div className="md:col-span-7 border-t md:border-t-0 md:border-l border-border md:pl-6 pt-4 md:pt-0">
            <OfficeOrderForm orden={orden} tenantId={tenantId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
