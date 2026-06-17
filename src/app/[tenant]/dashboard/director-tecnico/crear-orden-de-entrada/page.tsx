"use client";


import { useContext, useState } from "react";
import { CalendarIcon, LayoutDashboard, FileText, Trash2, } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { createOrderTemplateAction } from "@/lib/server-actions/order-template-validation";
import { OrderTemplateInput } from "@/lib/zod-schemas/order-template-schema";

import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import ConditionDialog from "@/components/dashboard/recepcionista/ConditionDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { OrderTemplateSignature } from "@/lib/server-actions/fetch_orders_templates";
import { DirectorTecnicoContext } from "@/contexts/DirectorTecnicoLoaderContext";




// ==========================================
// FUNCIÓN DE NORMALIZACIÓN INDEPENDIENTE
// ==========================================
/**
 * Adapta la estructura de firmas de la base de datos al formato
 * requerido por el esquema de Zod e inputs del formulario.
 */
function normalizeSignatures(dbSignatures: OrderTemplateSignature[]) {
  if (!dbSignatures || !Array.isArray(dbSignatures)) return [];

  return dbSignatures.map((sig) => ({
    // Mapeo: representative_type ➡️ a_quien_representa
    a_quien_representa: sig.representative_type || "",
    
    // Mapeo: signature_label ➡️ label_firma
    label_firma: sig.signature_label || "",
    
    // Mapeo de declaraciones internas
    declarations: Array.isArray(sig.declarations)
      ? sig.declarations.map((dec) => ({
          // Mapeo: Asegura que caiga en texto_declaracion
          texto_declaracion: dec.declaration_text || "",
        }))
      : [],
  }));
}










// Centralización de textos
const COMPONENT_TEXT = {
  header: {
    title: "Configuración de la Plantilla",
    contractTitle: "Condiciones Contractuales (Snapshot Legal)",
  },
  labels: {
    name: "Nombre de la Plantilla",
    code: "Código Documento (SGC)",
    version: "Versión",
    date: "Fecha del Documento",
    active: "Plantilla Activa",
    contract: "Texto del Contrato / Términos y Condiciones",
    service_type: "Tipo de servicio (RTM, preventiva, peritaje, otros)",
  },
  placeholders: {
    name: "Ej: Orden de entrada, Orden de peritaje",
    code: "F-01-REC",
    selectVehicle: "Seleccione tipo",
    selectDate: "Seleccionar fecha",
    contract:
      "Pegue aquí el texto legal que el cliente debe firmar al entregar el vehículo...",
  },
  hints: {
    active: "Permitir su uso en nuevas órdenes.",
    contract:
      "* Este texto se copiará como una captura inmutable en cada orden generada.",
  },
  submit: "Crear Formulario",
  conditions: {
    headerTittle: "Ítems y Condiciones de la Inspección",
    buttonNewItem: "+ Agregar Ítem",
  },
};





export default function NewOrderTemplateForm() {
 

const searchParams = useSearchParams()


 const queryClient = useQueryClient();

  const contextRecived = useContext(PermissionsContext);
  const contextRecivedDirectorTecnico = useContext(DirectorTecnicoContext);

  const tenantId = contextRecived?.PermissionsContextValue.tenantObject?.id;
  const logo_url = contextRecived?.PermissionsContextValue.tenantObject?.logo_url;
  const user = contextRecived?.PermissionsContextValue.user;


 const templateId = searchParams.get('templateId')



const  currentTemplate = contextRecivedDirectorTecnico?.DirectorTecnicoContextValue.templateTableData.query.data?.find(
  (template) => template.id === templateId
);






  //ESTE ES EL STATE QUE MANEJA TODA LA INFORMACIN DEL FORM
  const [formData, setFormData] = useState<OrderTemplateInput>( {
      id: "",
      tenant_id: tenantId || "",
      template_name: "",
      version: 1,
      is_active: false,
      document_date: new Date(),
      document_code: "",
      logo_url: logo_url || "",
      base_contract_text: "",
      created_by: user?.id || "",
      conditions: [],
      signatures: [],
    
  });

 


// =================================================================
  // GUARDIA DE SINCRONIZACIÓN (Sustituto de useEffect sin romper el flujo)
  // =================================================================
  // Guardamos en una variable si el formulario está mostrando datos de edición o está vacío
  const isFormShowingTemplateId = formData.id === currentTemplate?.id;

  // Si la URL tiene un templateId pero el estado actual NO coincide con los datos de ese template...
  if (currentTemplate && !isFormShowingTemplateId) {
    // Forzamos síncronamente la actualización del estado con la nueva plantilla
    setFormData({
      id: currentTemplate.id,
      tenant_id: tenantId || "",
      template_name: currentTemplate.template_name || "",
      version: currentTemplate.version ?? 1,
      is_active: false,
      document_date: currentTemplate.document_date ? new Date(currentTemplate.document_date) : new Date(),
      document_code: currentTemplate.document_code || "",
      logo_url: logo_url || "",
      base_contract_text: currentTemplate.base_contract_text || "",
      created_by: user?.id || "",
      conditions: currentTemplate.conditions || [],
      signatures: normalizeSignatures(currentTemplate.signatures),
    });
  } 
  // Si la URL NO tiene templateId (es nueva) pero el estado actual todavía tiene datos guardados de antes...
  else if (!templateId && formData.id !== "") {
    // Limpiamos el estado para que vuelva a quedar en blanco
    setFormData({
      id: "",
      tenant_id: tenantId || "",
      template_name: "",
      version: 1,
      is_active: false,
      document_date: new Date(),
      document_code: "",
      logo_url: logo_url || "",
      base_contract_text: "",
      created_by: user?.id || "",
      conditions: [],
      signatures: [],
    });
  }












  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Llamamos a la Server Action pasándole nuestro estado
    const {data: createTemplateData, error} = await createOrderTemplateAction(formData);

    if (error || !createTemplateData) {
      console.log("❌ Falló la validación");
      // TypeScript ahora sabe que result.details es un array de ZodIssue

      alert(
        `Error al crear la plantilla, ${error}`,
      );
    } else {
      queryClient.invalidateQueries({ queryKey: ["templates", "list"] });
      console.log("✅ ¡Validación exitosa!");
      alert("Plantilla creada correctamente");
    }

    console.log("Datos capturados.");
  };






  //FUNCIONES PARA CREAR, EDITAR O ELIMINAR UNA CONDICION AGREGADA

  const removeCondition = (index: number) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index),
    });
  };

  //FUNCIONES PARA CREAR, EDITAR O ELIMINAR UNA DELCARACION PARA LA FIRMA
  const addSignature = () => {
    setFormData({
      ...formData,
      signatures: [
        ...formData.signatures,
        { a_quien_representa: "otros", label_firma: "", declarations: [] },
      ],
    });
  };

  const addDeclaration = (sigIndex: number) => {
    const newSignatures = [...formData.signatures];
    newSignatures[sigIndex].declarations.push({
      texto_declaracion: "",
    });
    setFormData({ ...formData, signatures: newSignatures });
  };

  const updateSignature = (
    sigIndex: number,
    field: string,
    value: string | boolean,
  ) => {
    const newSignatures = [...formData.signatures];
    newSignatures[sigIndex] = { ...newSignatures[sigIndex], [field]: value };
    setFormData({ ...formData, signatures: newSignatures });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* SECCION DE CONFIGURACION DE PLANTILLA */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* COLUMNA IZQUIERDA: Configuración */}
        <Card className="flex-1 border-border bg-card text-card-foreground shadow-none rounded-lg">
          <CardHeader className="border-b border-border mb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
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
                  setFormData({ ...formData, template_name: e.target.value })
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
                    setFormData({ ...formData, document_code: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="version">{COMPONENT_TEXT.labels.version}</Label>
                <Input
                  id="version"
                  type="number"
                  min={1}
                  // Usamos un string vacío como fallback para que el input
                  // se vea limpio mientras el usuario borra y escribe
                  value={isNaN(formData.version) ? "" : formData.version}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      // Si el usuario borra todo, guardamos NaN (o 0),
                      // pero si hay texto, lo convertimos a número
                      version: val === "" ? NaN : parseInt(val),
                    });
                  }}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{COMPONENT_TEXT.labels.date}</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "inline-flex items-center justify-start rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full",
                    !formData.document_date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {formData.document_date ? (
                    format(formData.document_date, "PPP")
                  ) : (
                    <span>{COMPONENT_TEXT.placeholders.selectDate}</span>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-border">
                  <Calendar
                    mode="single"
                    selected={formData.document_date}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, document_date: date })
                    }
                    
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* COLUMNA DERECHA: Contrato */}
        <Card className="flex-[1.5] border-border bg-card text-card-foreground shadow-none rounded-lg flex flex-col">
          <CardHeader className="border-b border-border mb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              {COMPONENT_TEXT.header.contractTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-2">
            <Label htmlFor="base_contract_text">
              {COMPONENT_TEXT.labels.contract}
            </Label>
            <Textarea
              id="base_contract_text"
              placeholder={COMPONENT_TEXT.placeholders.contract}
              className="flex-1 min-h-87.5 resize-none border-input focus-visible:ring-primary bg-background"
              value={formData.base_contract_text}
              onChange={(e) =>
                setFormData({ ...formData, base_contract_text: e.target.value })
              }
            />
            <p className="text-[11px] text-muted-foreground italic">
              {COMPONENT_TEXT.hints.contract}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN DE CONDICIONES EN FORMATO TABLA */}
      <Card className="mt-6 border-border shadow-none rounded-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/30 flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <LayoutDashboard className="size-5 text-primary" />
            {COMPONENT_TEXT.conditions.headerTittle}
          </CardTitle>

          {/* El diálogo ahora maneja la creación */}
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
                      <div className="flex flex-col gap-1 w-full min-w-0">
                        <span className="font-medium text-sm block whitespace-normal wrap-break-word">
                          {item.label}
                        </span>
                        {item.is_special && (
                          <span className="text-[10px] text-primary font-bold uppercase tracking-tight block wrap-break-word">
                            Aplica a: {item.special_condition_label}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize font-medium"
                      >
                        {item.default_value.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.is_special ? (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] uppercase">
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
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeCondition(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-background">
              <LayoutDashboard className="size-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm italic">
                No hay condiciones definidas para este template.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECCION DE CONFIGURACION DE LA FIRMA */}
      <Card className="mt-6 border-border bg-card text-card-foreground shadow-none rounded-lg">
        <CardHeader className="border-b border-border mb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
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
          {formData.signatures.map((sig, sigIndex) => (
            <div
              key={sigIndex}
              className="p-5 rounded-xl border border-border bg-muted/10 relative space-y-4"
            >
              {/* Botón Eliminar Bloque */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  const newSigs = formData.signatures.filter(
                    (_, i) => i !== sigIndex,
                  );
                  setFormData({ ...formData, signatures: newSigs });
                }}
              >
                ✕
              </Button>

              {/* Configuración de la Firma: Dos Inputs Abiertos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-bold text-muted-foreground">
                    ¿A quién representa?
                  </Label>
                  <Input
                    placeholder="Ej: Cliente, Director Técnico, Perito..."
                    className="h-10 bg-background"
                    value={sig.a_quien_representa}
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
                  <Label className="text-[11px] uppercase font-bold text-muted-foreground">
                    Etiqueta debajo de la línea de firma
                  </Label>
                  <Input
                    placeholder="Ej: Firma del Propietario o Poseedor"
                    className="h-10 bg-background"
                    value={sig.label_firma}
                    onChange={(e) =>
                      updateSignature(sigIndex, "label_firma", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Sección de Declaraciones (Obligatorias por defecto) */}
              <div className="space-y-3 pl-4 border-l-2 border-primary/30">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-primary/80">
                    Textos legales y declaraciones (Aceptación obligatoria):
                  </h4>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-primary h-auto p-0 font-bold"
                    onClick={() => addDeclaration(sigIndex)}
                  >
                    + Añadir Declaración
                  </Button>
                </div>

                {sig.declarations.map((dec, decIndex) => (
                  <div
                    key={decIndex}
                    className="group relative flex gap-3 bg-background p-3 rounded-lg border border-border shadow-sm animate-in fade-in slide-in-from-left-2 duration-200"
                  >
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Escriba aquí el texto legal que debe ser aceptado..."
                        className="min-h-17.5 text-sm resize-none border-none focus-visible:ring-0 p-0 shadow-none bg-transparent"
                        value={dec.texto_declaracion}
                        onChange={(e) => {
                          const newSigs = [...formData.signatures];
                          newSigs[sigIndex].declarations[
                            decIndex
                          ].texto_declaracion = e.target.value;
                          setFormData({ ...formData, signatures: newSigs });
                        }}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const newSigs = [...formData.signatures];
                        newSigs[sigIndex].declarations = newSigs[
                          sigIndex
                        ].declarations.filter((_, i) => i !== decIndex);
                        setFormData({ ...formData, signatures: newSigs });
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {formData.signatures.length === 0 && (
            <div className="text-center py-10 bg-muted/5 border-2 border-dashed rounded-xl border-border">
              <p className="text-muted-foreground text-sm">
                No hay firmas configuradas para esta plantilla.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BOTON DE ENVIO DE DATOS */}
      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          type="submit"
          className="px-10 font-bold transition-all active:scale-95 shadow-none"
        >
          {COMPONENT_TEXT.submit}
        </Button>
      </div>
    </form>
  );
}
