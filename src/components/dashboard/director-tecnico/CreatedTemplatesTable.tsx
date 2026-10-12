
"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";

import { DirectorTecnicoContext } from "@/contexts/DirectorTecnicoLoaderContext";
import type { OrderTemplateType } from "@/types/functions_types";

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
import { Switch } from "@/components/ui/switch";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Edit3,
  Trash2,
  FileText,
  AlertCircle,
  RefreshCcw,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import OrderViewPDF from "@/components/dashboard/_shared/pdfs/OrderViewPDF";
import OrderDownloadPDF from "@/components/dashboard/_shared/pdfs/OrderDownloadPDF";

const SELECT_ORDENADO_POR = [
  { label: "Código", value: "document_code" },
  { label: "Nombre", value: "template_name" },
  { label: "Tipo de Servicio", value: "service_type" },
  { label: "Fecha", value: "document_date" },
  { label: "Estado", value: "is_active" },
];

const SELECT_ORDEN = [
  { label: "Ascendente", value: "asc" },
  { label: "Descendente", value: "desc" },
];

export default function CreatedTemplatesTable() {
  const router = useRouter();

  // Query y mutaciones desde el contexto.
  const contextReceived = useContext(DirectorTecnicoContext);

  const templateContext =
    contextReceived?.DirectorTecnicoContextValue.templateTableData;

  const templateQuery = templateContext?.templateQuery;
  const mutation = templateContext?.mutation;

  const [orderBy, setOrderBy] = useState<string>("document_date");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("desc");

  if (!templateQuery || !mutation) {
    return (
      <div className="m-5 rounded-md border p-6 text-sm text-muted-foreground">
        No se encontró el contexto de Director Técnico.
      </div>
    );
  }

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
    isSuccess,
  } = templateQuery;

  const {
    updateIsActive,
    isUpdating,
    deleteTemplate,
    isDeletingTemplate,
    errorDeletingTemplate,
    resetDeleteMutation,
  } = mutation;

  // Ordenamiento local.
  const sortedData = [...(data ?? [])].sort((a, b) => {
    const rawA = a[orderBy as keyof OrderTemplateType];
    const rawB = b[orderBy as keyof OrderTemplateType];

    const valueA = String(rawA ?? "");
    const valueB = String(rawB ?? "");

    const comparison = valueA.localeCompare(valueB, undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return orderDir === "asc" ? comparison : -comparison;
  });

  // Estado de sincronización.
  const renderStatusBadge = () => {
    if (isError) {
      return (
        <Badge variant="destructive" className="gap-1.5 px-3 py-1">
          <AlertCircle className="h-3.5 w-3.5" />
          Error de sincronización
        </Badge>
      );
    }

    if (isFetching && !isPending) {
      return (
        <Badge className="gap-1.5 px-3 py-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Actualizando datos...
        </Badge>
      );
    }

    if (isSuccess) {
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Datos actualizados
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className="m-5 overflow-hidden rounded-md border bg-card shadow-sm">
      {/* Cabecera y filtros: visibles durante la carga. */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Listado de Plantillas
        </h2>

        <div>{renderStatusBadge()}</div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Select para ordenar por columna. */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">
              Ordenar por columna
            </label>

            <Select
              items={SELECT_ORDENADO_POR}
              value={orderBy}
              onValueChange={(value) => {
                if (value) setOrderBy(value);
              }}
            >
              <SelectTrigger className="h-9 w-45">
                <SelectValue placeholder="Columna" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Columnas</SelectLabel>

                  {SELECT_ORDENADO_POR.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Select para dirección del ordenamiento. */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">
              Orden
            </label>

            <Select
              items={SELECT_ORDEN}
              value={orderDir}
              onValueChange={(value) => {
                if (value === "asc" || value === "desc") {
                  setOrderDir(value);
                }
              }}
            >
              <SelectTrigger className="h-9 w-37.5">
                <SelectValue placeholder="Dirección" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Dirección del orden</SelectLabel>

                  {SELECT_ORDEN.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabla: los encabezados no dependen de la carga de datos. */}
      <Table>
        <TableHeader className="hidden bg-muted/30 md:table-header-group">
          <TableRow>
            <TableHead className="font-bold text-foreground">
              Código
            </TableHead>
            <TableHead className="font-bold text-foreground">
              Nombre de Plantilla
            </TableHead>
            <TableHead className="text-center font-bold text-foreground">
              Versión
            </TableHead>
            <TableHead className="text-center font-bold text-foreground">
              Fecha Documento
            </TableHead>
            <TableHead className="font-bold text-foreground">
              Estado
            </TableHead>
            <TableHead className="text-right font-bold text-foreground">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="flex flex-col md:table-row-group">
          {/* Spinner solo durante la carga inicial. */}
          {isPending && (
            <TableRow>
              <TableCell colSpan={6} className="h-40 text-center">
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span>Cargando plantillas...</span>
                </div>
              </TableCell>
            </TableRow>
          )}

          {/* Error sin datos disponibles. */}
          {isError && (!data || data.length === 0) && (
            <TableRow>
              <TableCell colSpan={6}>
                <Alert variant="destructive" className="my-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error de conexión</AlertTitle>

                  <AlertDescription className="flex flex-col gap-3">
                    <p>
                      No pudimos sincronizar las plantillas:{" "}
                      {error?.message || "Error desconocido de Supabase"}
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      className="w-fit"
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Reintentar ahora
                    </Button>
                  </AlertDescription>
                </Alert>
              </TableCell>
            </TableRow>
          )}

          {/* Error de actualización: conserva los datos anteriores. */}
          {isError && data && data.length > 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Alert variant="destructive" className="my-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    No se pudieron actualizar los datos
                  </AlertTitle>

                  <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                    <span>
                      {error?.message || "Error de sincronización"}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Reintentar
                    </Button>
                  </AlertDescription>
                </Alert>
              </TableCell>
            </TableRow>
          )}

          {/* Error de la mutación de borrado. */}
          {errorDeletingTemplate && (
            <TableRow>
              <TableCell colSpan={6}>
                <Alert variant="destructive" className="my-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    Operación de borrado rechazada
                  </AlertTitle>

                  <AlertDescription className="flex flex-col gap-3">
                    <p>
                      {errorDeletingTemplate.message ||
                        "No se pudo eliminar la plantilla debido a un error inesperado de seguridad."}
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDeletingTemplate}
                      onClick={resetDeleteMutation}
                      className="w-fit"
                    >
                      {isDeletingTemplate ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Entendido
                    </Button>
                  </AlertDescription>
                </Alert>
              </TableCell>
            </TableRow>
          )}

          {/* Estado vacío. */}
          {!isPending &&
            !isError &&
            (!data || data.length === 0) && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex min-h-40 flex-col items-center justify-center gap-2 p-8 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <p className="font-medium text-muted-foreground">
                      No hay plantillas creadas aún.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

          {/* Filas: no se reemplazan durante el refetch. */}
          {!isPending &&
            sortedData.map((template) => (
              <TableRow
                key={template.id}
                className="flex flex-col border-b p-4 transition-colors hover:bg-muted/50 md:table-row md:p-0"
              >
                <TableCell className="py-2 md:py-4">
                  <span className="mb-1 block text-[10px] font-extrabold uppercase text-muted-foreground md:hidden">
                    Código
                  </span>

                  <div className="w-fit rounded bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">
                    {template.document_code}
                  </div>
                </TableCell>

                <TableCell className="py-2 md:py-4">
                  <span className="mb-1 block text-[10px] font-extrabold uppercase text-muted-foreground md:hidden">
                    Nombre de Plantilla
                  </span>

                  <div className="font-semibold text-foreground">
                    {template.template_name}
                  </div>
                </TableCell>

                <TableCell className="py-2 text-left md:py-4 md:text-center">
                  <span className="mb-1 block text-[10px] font-extrabold uppercase text-muted-foreground md:hidden">
                    Versión
                  </span>

                  <Badge variant="secondary" className="font-mono">
                    v{template.version}
                  </Badge>
                </TableCell>

                <TableCell className="py-2 text-left md:py-4 md:text-center">
                  <span className="mb-1 block text-[10px] font-extrabold uppercase text-muted-foreground md:hidden">
                    Fecha Documento
                  </span>

                  <Badge variant="secondary" className="font-mono">
                    {template.document_date}
                  </Badge>
                </TableCell>

                <TableCell className="py-2 md:py-4">
                  <span className="mb-1 block text-[10px] font-extrabold uppercase text-muted-foreground md:hidden">
                    Estado
                  </span>

                  <div className="flex flex-col items-start gap-2 md:items-center">
                    <Badge
                      variant={template.is_active ? "outline" : "destructive"}
                      className={
                        template.is_active
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-destructive/20 bg-destructive/10 text-destructive"
                      }
                    >
                      {template.is_active ? "Activo" : "Inactivo"}
                    </Badge>

                    <Switch
                      id={`is_active-${template.id}`}
                      checked={template.is_active}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          updateIsActive({
                            id: template.id,
                            is_active: false,
                          });
                          return;
                        }

                        const yaExisteActivaConMismoCodigo = data?.some(
                          (t) =>
                            t.document_code === template.document_code &&
                            t.is_active === true &&
                            t.id !== template.id,
                        );

                        if (yaExisteActivaConMismoCodigo) {
                          alert(
                            `Error: Ya existe una plantilla activa con el código "${template.document_code}". Desactívala primero.`,
                          );
                          return;
                        }

                        updateIsActive({
                          id: template.id,
                          is_active: true,
                        });
                      }}
                      disabled={isUpdating || isFetching}
                      className="data-checked:bg-emerald-500! data-unchecked:bg-red-500!"
                    />
                  </div>
                </TableCell>

                <TableCell className="py-2 text-right md:py-4">
                  <div className="mt-3 flex items-center justify-end gap-2 md:mt-0">
                    <OrderViewPDF templateData={template} />
                    <OrderDownloadPDF templateData={template} />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      title="Editar plantilla"
                      onClick={() => {
                        router.push(
                          `/dashboard/director-tecnico/crear-orden-de-entrada?templateId=${template.id}`,
                        );
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Eliminar"
                      disabled={isDeletingTemplate}
                      onClick={() =>
                        deleteTemplate({
                          id: template.id,
                          tenantId: template.tenant_id,
                        })
                      }
                    >
                      {isDeletingTemplate ? (
                        <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
