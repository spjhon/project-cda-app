"use client";

import { useContext, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  FileText,
  Hash,
  Loader2,
  RefreshCw,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
 // DialogClose,
} from "@/components/ui/dialog";
import { EntryOrdersContext } from "@/contexts/EntryOrdersContext";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";



export function TenantCreditsManager() {
  const queryClient = useQueryClient();

  // Contextos
  const entryOrdersCtx = useContext(EntryOrdersContext);
  const permissionsCtx = useContext(PermissionsContext);

  const tenantCredits = entryOrdersCtx?.entryOrdersTableData?.tenantCredits;
  const tenantId = permissionsCtx?.PermissionsContextValue?.tenantObject?.id;

  const data = tenantCredits?.data;
  const isLoading = tenantCredits?.isFetching;
  const isError = tenantCredits?.isError;

  // Estados locales para los inputs
  const [fupasInput, setFupasInput] = useState<string>("");
  const [certificadosInput, setCertificadosInput] = useState<string>("");









  
// Mutación para FUPAS
  const fupasMutation = useMutation({
    mutationFn: async (amountToAdd: number) => {
      if (!tenantId) {
        throw new Error("No se encontró el identificador de la sede (tenantId)");
      }

      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.rpc("update_tenant_credits", {
        p_tenant_id: tenantId,
        p_fupas_delta: amountToAdd,
        p_certificados_delta: 0,
      });

      if (error) {
        if (error.message.includes("tenant_credits_cupo_fupas_check")) {
          throw new Error("El cupo de FUPAs no puede quedar en un valor negativo.");
        }
        throw new Error(error.message || "Error al actualizar el cupo de FUPAs");
      }

      return data;
    },
    onSuccess: () => {
      setFupasInput("");
      queryClient.invalidateQueries({
        queryKey: ["tenant-credits", tenantId],
      });
    },
    onError: (error: Error) => {
      console.error("Error al actualizar FUPAs:", error.message);
      // Aquí puedes agregar un toast si manejas una librería como Sonner o Shadcn Toast
    },
  });

  // Mutación para CERTIFICADOS
  const certificadosMutation = useMutation({
    mutationFn: async (amountToAdd: number) => {
      if (!tenantId) {
        throw new Error("No se encontró el identificador de la sede (tenantId)");
      }

      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.rpc("update_tenant_credits", {
        p_tenant_id: tenantId,
        p_fupas_delta: 0,
        p_certificados_delta: amountToAdd,
      });

      if (error) {
        if (error.message.includes("tenant_credits_cupo_certificados_check")) {
          throw new Error("El cupo de certificados no puede quedar en un valor negativo.");
        }
        throw new Error(error.message || "Error al actualizar los certificados");
      }

      return data;
    },
    onSuccess: () => {
      setCertificadosInput("");
      queryClient.invalidateQueries({
        queryKey: ["tenant-credits", tenantId],
      });
    },
    onError: (error: Error) => {
      console.error("Error al actualizar Certificados:", error.message);
      // Aquí puedes agregar un toast si manejas una librería como Sonner o Shadcn Toast
    },
  });






  // Formateo de fecha
  const formattedDate = data?.updated_at
    ? format(new Date(data.updated_at), "dd MMM yyyy, HH:mm", { locale: es })
    : "Nunca";

  // Validaciones para no superar el límite negativo
  const currentFupas = data?.cupo_fupas || 0;
  const currentCerts = data?.cupo_certificados || 0;

  const fupasValue = parseInt(fupasInput || "0", 10);
  const certsValue = parseInt(certificadosInput || "0", 10);

  const isFupasValid = !isNaN(fupasValue) && currentFupas + fupasValue >= 0;
  const isCertsValid = !isNaN(certsValue) && currentCerts + certsValue >= 0;

  // Render del Trigger del botón (Estado de carga o error)
  const TriggerButton = (
    <Button
      variant="outline"
      className="h-9 px-3 py-1 flex flex-col items-start justify-center gap-0.5 border-border shadow-sm hover:bg-muted bg-background transition-colors"
      disabled={isError}
    >
      { isError ? (
        <div className="flex items-center gap-2 text-destructive text-xs">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Error al cargar</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 font-bold text-[11px] uppercase tracking-wider text-foreground">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3 text-primary" />
              Fupas: {currentFupas}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              Certificados: {currentCerts}
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground font-medium uppercase">
            Ultima Actualización: {formattedDate}
          </span>
        </>
      )}
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger render={TriggerButton} />

      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Gestión de Cupos y Certificados
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ADVERTENCIA PERMANENTE */}
          <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 stroke-amber-600 dark:stroke-amber-400" />
            <AlertTitle className="text-xs font-bold uppercase tracking-wider mb-1">
              Importante: Sincronización con el RUNT
            </AlertTitle>
            <AlertDescription className="text-[11px] leading-relaxed font-medium opacity-90">
              Por favor, mantenga estos números sincronizados estrictamente con
              la página oficial del RUNT. Tenga en cuenta que acciones como
              cancelar solicitudes pueden generar el consumo de un FUPA sin
              llegar a emitir una Revisión Técnico Mecánica (RTM).
            </AlertDescription>
          </Alert>

          {/* TARJETAS DE GESTIÓN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GESTIÓN DE FUPAS */}
            <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Fupas Disponibles Actualmente
                </p>
                <div className="flex items-center gap-2 text-2xl font-black text-foreground">
                  <Hash className="h-6 w-6 text-primary" />
                  {currentFupas}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">
                  Asignar / Restar Fupas
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Ej: 10 o -5"
                    value={fupasInput}
                    onChange={(e) => setFupasInput(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Button
                    size="sm"
                    className="h-9 px-3 shrink-0"
                    disabled={
                      !fupasInput ||
                      !isFupasValid ||
                      fupasMutation.isPending ||
                      fupasValue === 0
                    }
                    onClick={() => fupasMutation.mutate(fupasValue)}
                  >
                    {fupasMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {!isFupasValid && fupasInput && (
                  <p className="text-[10px] text-destructive font-medium">
                    No puedes restar más de los Fupas disponibles.
                  </p>
                )}
              </div>
            </div>

            {/* GESTIÓN DE CERTIFICADOS */}
            <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Certificados Disponibles Actualmente
                </p>
                <div className="flex items-center gap-2 text-2xl font-black text-foreground">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  {currentCerts}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">
                  Asignar / Restar Certificados
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Ej: 10 o -5"
                    value={certificadosInput}
                    onChange={(e) => setCertificadosInput(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Button
                    size="sm"
                    className="h-9 px-3 shrink-0"
                    disabled={
                      !certificadosInput ||
                      !isCertsValid ||
                      certificadosMutation.isPending ||
                      certsValue === 0
                    }
                    onClick={() => certificadosMutation.mutate(certsValue)}
                  >
                    {certificadosMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {!isCertsValid && certificadosInput && (
                  <p className="text-[10px] text-destructive font-medium">
                    No puedes restar más de los certificados disponibles.
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-muted-foreground italic mt-2">
            Última actualización: {formattedDate}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}