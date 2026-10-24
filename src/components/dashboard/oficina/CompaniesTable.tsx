"use client";

import { CreateCompanyDialog } from "./CreateCompanyDialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCompanies } from "@/lib/client-actions/fetch_tenant_companies";
import { useState } from "react";
import { GenericConfirmDialog } from "@/components/feedbackDialogs/GenericConfirmDialog";
import { useDeleteCompany } from "@/lib/client-actions/delete_company";

export function CompaniesTable() {
  const deleteCompanyMutation = useDeleteCompany();

  const [selectedCompany, setSelectedCompany] = useState<
    NonNullable<ReturnType<typeof useCompanies>["data"]>[number] | null
  >(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: companies,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useCompanies();

  const renderStatusBadge = () => {
    if (isError) {
      return (
        <Badge
          variant="destructive"
          className="gap-1.5 px-3 py-1 min-w-35 justify-center shadow-sm"
        >
          <AlertCircle className="h-3.5 w-4" />
          Error
        </Badge>
      );
    }

    if (isPending || isFetching) {
      return (
        <Badge
          variant="default"
          className="gap-1.5 px-3 py-1 min-w-35 justify-center shadow-sm"
        >
          <Loader2 className="h-3.5 w-4 animate-spin" />
          {isPending ? "Cargando..." : "Actualizando..."}
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="gap-1.5 px-3 py-1 min-w-35 justify-center shadow-sm border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
      >
        <CheckCircle2 className="h-3.5 w-4" />
        Datos actualizados
      </Badge>
    );
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;

    try {
      await deleteCompanyMutation.mutateAsync({
        companyId: selectedCompany.id,
      });

      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
    } catch {
      // El error se muestra en la descripción del diálogo.
    }
  };

  return (
    <div className="space-y-5 p-6 bg-background rounded-2xl shadow-sm">
      {/* SECCIÓN SUPERIOR */}

      <div className="flex flex-row items-center justify-between gap-3 bg-muted/30 p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
            Empresas registradas
          </span>
        </div>

        <div className="flex items-center gap-3">
          {renderStatusBadge()}

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={Boolean(
              isPending || isFetching || companies === undefined,
            )}
            suppressHydrationWarning
            className="h-9"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isPending || isFetching ? "animate-spin" : ""
              }`}
            />
            Refrescar
          </Button>
        </div>
      </div>

      {/* ACCIONES DE LA TABLA */}

      <div className="flex justify-end">
        <CreateCompanyDialog />
      </div>

      {/* CONTENEDOR DE LA TABLA */}

      <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-foreground h-11 whitespace-nowrap">
                NIT
              </TableHead>
              <TableHead className="font-semibold text-foreground h-11 whitespace-nowrap">
                Nombre
              </TableHead>
              <TableHead className="font-semibold text-foreground h-11 whitespace-nowrap">
                Dirección
              </TableHead>
              <TableHead className="font-semibold text-foreground h-11 whitespace-nowrap">
                Teléfono
              </TableHead>
              <TableHead className="font-semibold text-foreground h-11 whitespace-nowrap">
                Correo electrónico
              </TableHead>
              <TableHead className="font-semibold text-foreground h-11 whitespace-nowrap text-center">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* CARGANDO */}

            {isPending ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="font-medium">Cargando empresas...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              /* ERROR */

              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3 text-destructive">
                    <AlertCircle className="h-8 w-8" />

                    <span className="font-medium">
                      Error al cargar las empresas
                    </span>

                    <p className="text-sm text-muted-foreground">
                      {error.message}
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reintentar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : companies?.length ? (
              /* DATOS CARGADOS */

              companies.map((company) => (
                <TableRow
                  key={company.id}
                  className="hover:bg-muted/50 border-b border-border transition-colors"
                >
                  <TableCell className="py-3 font-medium">
                    {company.nit}
                  </TableCell>

                  <TableCell className="py-3">{company.name}</TableCell>

                  <TableCell className="py-3">
                    {company.address || "—"}
                  </TableCell>

                  <TableCell className="py-3">{company.phone || "—"}</TableCell>

                  <TableCell className="py-3">{company.email || "—"}</TableCell>

                  <TableCell className="py-3 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Eliminar empresa"
                      aria-label={`Eliminar empresa ${company.name}`}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              /* SIN DATOS */

              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground font-medium"
                >
                  No hay empresas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <GenericConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);

          if (!open) {
            setSelectedCompany(null);
          }
        }}
        title="¿Eliminar empresa?"
        description={
          deleteCompanyMutation.isError
            ? `Error al eliminar la empresa: ${deleteCompanyMutation.error.message}`
            : "La empresa dejará de aparecer en los listados activos..."
        }
        itemName={selectedCompany?.name}
        itemDetails={
          selectedCompany ? `NIT: ${selectedCompany.nit}` : undefined
        }
        confirmText="Eliminar empresa"
        onConfirm={handleDeleteCompany}
        isPending={deleteCompanyMutation.isPending}
      />
    </div>
  );
}
