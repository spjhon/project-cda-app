
"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  FileText,
  LayoutDashboard,
  Trash2,
} from "lucide-react";

import type { OrderTemplateType } from "@/types/functions_types";
import type { OrderTemplateInput } from "@/lib/zod-schemas/order-template-schema";

import { createOrderTemplateAction } from "@/lib/server-actions/order-template-validation";


import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ConditionDialog from "./ConditionDialog";

type CreateEntryOrderTemplateFormProps = {
  template: OrderTemplateType | null;
  tenantId: string;
  logoUrl: string;
  userId: string;
};

const COMPONENT_TEXT = {
  header: {
    title: "Configuración de plantilla",
    contractTitle: "Contrato base",
  },
  labels: {
    name: "Nombre de la plantilla",
    code: "Código del documento",
    version: "Versión",
    date: "Fecha del documento",
    contract: "Texto base del contrato",
  },
  placeholders: {
    name: "Ej. Plantilla RTM vehículos livianos",
    code: "Ej. F-RTM-001",
    selectDate: "Selecciona una fecha",
    contract: "Escribe aquí el texto base del contrato...",
  },
  hints: {
    contract:
      "Este texto será utilizado como base para generar el documento.",
  },
  conditions: {
    headerTittle: "Condiciones de la plantilla",
  },
  submit: "Guardar plantilla",
};

// Normaliza las firmas recibidas desde la base de datos.

function normalizeSignatures(
  signatures: unknown,
): OrderTemplateInput["signatures"] {
  if (!Array.isArray(signatures)) {
    return [];
  }

  return signatures.map((signature) => {
    const item =
      typeof signature === "object" && signature !== null
        ? (signature as Record<string, unknown>)
        : {};

    const declarations = Array.isArray(item.declarations)
      ? item.declarations.map((declaration) => {
          const declarationItem =
            typeof declaration === "object" &&
            declaration !== null
              ? (declaration as Record<string, unknown>)
              : {};

          return {
            id:
              typeof declarationItem.id === "string"
                ? declarationItem.id
                : undefined,
            texto_declaracion:
              typeof declarationItem.declaration_text === "string"
                ? declarationItem.declaration_text
                : "",
          };
        })
      : [];

    return {
      id: typeof item.id === "string" ? item.id : undefined,
      a_quien_representa:
        typeof item.representative_type === "string"
          ? item.representative_type
          : "Cliente",
      label_firma:
        typeof item.signature_label === "string"
          ? item.signature_label
          : "",
      declarations,
    };
  }) as OrderTemplateInput["signatures"];
}

export default function CreateEntryOrderTemplateForm({
  template,
  tenantId,
  logoUrl,
  userId,
}: CreateEntryOrderTemplateFormProps) {
  const queryClient = useQueryClient();

  console.log("estas es el template completo: ", template)

  // El padre entrega la plantilla lista.
  // Este estado se inicializa una sola vez al montar el componente.
  const [formData, setFormData] = useState<OrderTemplateInput>(() => ({
    id: template?.id ?? "",
    tenant_id: tenantId,
    template_name: template?.template_name ?? "",
    version: template?.version ?? 1,
    is_active: template?.is_active ?? false,
    document_date: template?.document_date
      ? new Date(template.document_date)
      : new Date(),
    document_code: template?.document_code ?? "",
    logo_url: logoUrl,
    base_contract_text: template?.base_contract_text ?? "",
    created_by: userId,
    conditions: template?.conditions ?? [],
    signatures: normalizeSignatures(template?.signatures ?? []),
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: createTemplateData, error } =
      await createOrderTemplateAction(formData);

    if (error || !createTemplateData) {
      console.error("Falló la validación:", error);

      alert(`Error al guardar la plantilla: ${error ?? "Error desconocido"}`);
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["templates", "list"],
    });

    console.log("Validación exitosa");
    alert("Plantilla guardada correctamente");
  };






  // Elimina una condición.
  const removeCondition = (index: number) => {
    setFormData((previous) => ({
      ...previous,
      conditions: previous.conditions.filter((_, i) => i !== index),
    }));
  };






  // Agrega un bloque de firma.
  const addSignature = () => {
    setFormData((previous) => ({
      ...previous,
      signatures: [
        ...previous.signatures,
        {
          a_quien_representa: "Cliente",
          label_firma: "",
          declarations: [],
        },
      ],
    }));
  };






  // Agrega una declaración a un bloque de firma.
  const addDeclaration = (sigIndex: number) => {
    setFormData((previous) => ({
      ...previous,
      signatures: previous.signatures.map((signature, index) =>
        index === sigIndex
          ? {
              ...signature,
              declarations: [
                ...signature.declarations,
                { texto_declaracion: "" },
              ],
            }
          : signature,
      ),
    }));
  };






  // Actualiza un campo de la firma.
  const updateSignature = (
    sigIndex: number,
    field: "a_quien_representa" | "label_firma",
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      signatures: previous.signatures.map((signature, index) =>
        index === sigIndex
          ? { ...signature, [field]: value }
          : signature,
      ),
    }));
  };






  // Elimina un bloque de firma.
  const removeSignature = (sigIndex: number) => {
    setFormData((previous) => ({
      ...previous,
      signatures: previous.signatures.filter(
        (_, index) => index !== sigIndex,
      ),
    }));
  };




  // Actualiza el texto de una declaración.
  const updateDeclaration = (
    sigIndex: number,
    decIndex: number,
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      signatures: previous.signatures.map((signature, index) =>
        index === sigIndex
          ? {
              ...signature,
              declarations: signature.declarations.map(
                (declaration, declarationIndex) =>
                  declarationIndex === decIndex
                    ? { ...declaration, texto_declaracion: value }
                    : declaration,
              ),
            }
          : signature,
      ),
    }));
  };





  // Elimina una declaración.
  const removeDeclaration = (
    sigIndex: number,
    decIndex: number,
  ) => {
    setFormData((previous) => ({
      ...previous,
      signatures: previous.signatures.map((signature, index) =>
        index === sigIndex
          ? {
              ...signature,
              declarations: signature.declarations.filter(
                (_, declarationIndex) =>
                  declarationIndex !== decIndex,
              ),
            }
          : signature,
      ),
    }));
  };







  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* CONFIGURACIÓN DE PLANTILLA */}
      <div className="flex flex-col items-stretch gap-6 lg:flex-row">
        <Card className="flex-1 rounded-lg border-border bg-card text-card-foreground shadow-none">
          <CardHeader className="mb-4 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <LayoutDashboard className="size-5 text-primary" />
              {COMPONENT_TEXT.header.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="template_name">
                {COMPONENT_TEXT.labels.name}
              </Label>

              <Input
                id="template_name"
                placeholder={COMPONENT_TEXT.placeholders.name}
                value={formData.template_name}
                onChange={(e) =>
                  setFormData((previous) => ({
                    ...previous,
                    template_name: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="document_code">
                  {COMPONENT_TEXT.labels.code}
                </Label>

                <Input
                  id="document_code"
                  placeholder={COMPONENT_TEXT.placeholders.code}
                  value={formData.document_code}
                  onChange={(e) =>
                    setFormData((previous) => ({
                      ...previous,
                      document_code: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="version">
                  {COMPONENT_TEXT.labels.version}
                </Label>

                <Input
                  id="version"
                  type="number"
                  min={1}
                  value={Number.isNaN(formData.version) ? "" : formData.version}
                  onChange={(e) => {
                    const value = e.target.value;

                    setFormData((previous) => ({
                      ...previous,
                      version: value === "" ? NaN : Number.parseInt(value, 10),
                    }));
                  }}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{COMPONENT_TEXT.labels.date}</Label>

              <Popover>
                <PopoverTrigger
                  type="button"
                  className={cn(
                    "inline-flex w-full items-center justify-start rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    !formData.document_date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4 text-primary" />

                  {formData.document_date ? (
                    format(formData.document_date, "PPP", { locale: es })
                  ) : (
                    <span>{COMPONENT_TEXT.placeholders.selectDate}</span>
                  )}
                </PopoverTrigger>

                <PopoverContent className="w-auto border-border p-0">
                  <Calendar
                    mode="single"
                    selected={formData.document_date}
                    onSelect={(date) => {
                      if (date) {
                        setFormData((previous) => ({
                          ...previous,
                          document_date: date,
                        }));
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* CONTRATO BASE */}
        <Card className="flex flex-col rounded-lg border-border bg-card text-card-foreground shadow-none lg:flex-[1.5]">
          <CardHeader className="mb-4 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="size-5 text-primary" />
              {COMPONENT_TEXT.header.contractTitle}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-2">
            <Label htmlFor="base_contract_text">
              {COMPONENT_TEXT.labels.contract}
            </Label>

            <Textarea
              id="base_contract_text"
              placeholder={COMPONENT_TEXT.placeholders.contract}
              className="min-h-87.5 flex-1 resize-none border-input bg-background focus-visible:ring-primary"
              value={formData.base_contract_text}
              onChange={(e) =>
                setFormData((previous) => ({
                  ...previous,
                  base_contract_text: e.target.value,
                }))
              }
            />

            <p className="text-[11px] italic text-muted-foreground">
              {COMPONENT_TEXT.hints.contract}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CONDICIONES */}
      <Card className="mt-6 overflow-hidden rounded-lg border-border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <LayoutDashboard className="size-5 text-primary" />
            {COMPONENT_TEXT.conditions.headerTittle}
          </CardTitle>

          <ConditionDialog setFormData={setFormData} />
        </CardHeader>

        <CardContent className="p-0">
          {formData.conditions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="w-[50%]">Condición</TableHead>
                  <TableHead>Valor Inicial</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {formData.conditions.map((item, index) => (
                  <TableRow key={index} className="group">
                    <TableCell className="max-w-75 md:max-w-100">
                      <div className="flex w-full min-w-0 flex-col gap-1">
                        <span className="block whitespace-normal text-sm font-medium wrap-break-word">
                          {item.label}
                        </span>

                        {item.is_special && (
                          <span className="block text-[10px] font-bold uppercase tracking-tight text-primary wrap-break-word">
                            Aplica a: {item.special_condition_label}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-medium capitalize"
                      >
                        {item.default_value.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {item.is_special ? (
                        <Badge className="border-amber-200 bg-amber-100 text-[10px] uppercase text-amber-700 hover:bg-amber-100">
                          Especial
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase text-slate-500"
                        >
                          Estándar
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive transition-opacity"
                        onClick={() => removeCondition(index)}
                        aria-label="Eliminar condición"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="bg-background py-12 text-center text-muted-foreground">
              <LayoutDashboard className="mx-auto mb-3 size-10 opacity-20" />
              <p className="text-sm italic">
                No hay condiciones definidas para esta plantilla.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FIRMAS Y DECLARACIONES */}
      <Card className="mt-6 rounded-lg border-border bg-card text-card-foreground shadow-none">
        <CardHeader className="mb-4 flex flex-row items-center justify-between border-b border-border">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="size-5 text-primary" />
            Configuración de Firmas y Declaraciones Legales
          </CardTitle>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSignature}
          >
            + Agregar Bloque de Firma
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {formData.signatures.map((signature, sigIndex) => (
            <div
              key={sigIndex}
              className="relative space-y-4 rounded-xl border border-border bg-muted/10 p-5"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => removeSignature(sigIndex)}
                aria-label="Eliminar bloque de firma"
              >
                ✕
              </Button>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase text-muted-foreground">
                    ¿A quién representa?
                  </Label>

                  <Input
                    placeholder="Ej: Cliente, Director Técnico, Perito..."
                    className="h-10 bg-background"
                    value={signature.a_quien_representa}
                    onChange={(e) =>
                      updateSignature(
                        sigIndex,
                        "a_quien_representa",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase text-muted-foreground">
                    Etiqueta debajo de la línea de firma
                  </Label>

                  <Input
                    placeholder="Ej: Firma del Propietario o Poseedor"
                    className="h-10 bg-background"
                    value={signature.label_firma}
                    onChange={(e) =>
                      updateSignature(
                        sigIndex,
                        "label_firma",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-3 border-l-2 border-primary/30 pl-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-primary/80">
                    Textos legales y declaraciones (Aceptación obligatoria):
                  </h4>

                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 font-bold text-primary"
                    onClick={() => addDeclaration(sigIndex)}
                  >
                    + Añadir Declaración
                  </Button>
                </div>

                {signature.declarations.map((declaration, decIndex) => (
                  <div
                    key={decIndex}
                    className="group relative flex gap-3 rounded-lg border border-border bg-background p-3 shadow-sm"
                  >
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Escriba aquí el texto legal que debe ser aceptado..."
                        className="min-h-17.5 resize-none border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                        value={declaration.texto_declaracion}
                        onChange={(e) =>
                          updateDeclaration(
                            sigIndex,
                            decIndex,
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() =>
                        removeDeclaration(sigIndex, decIndex)
                      }
                      aria-label="Eliminar declaración"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {formData.signatures.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/5 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No hay firmas configuradas para esta plantilla.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GUARDAR */}
      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          type="submit"
          className="px-10 font-bold shadow-none transition-all active:scale-95"
        >
          {COMPONENT_TEXT.submit}
        </Button>
      </div>
    </form>
  );
}
