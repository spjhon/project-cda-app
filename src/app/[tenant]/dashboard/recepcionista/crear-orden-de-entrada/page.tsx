"use client";



import React, { useContext, useState } from "react";
import { CalendarIcon, LayoutDashboard, FileText } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { createOrderTemplateAction } from "@/lib/server_actions/order-template-validation";
import { OrderTemplateInput } from "@/lib/zod-schemas/order-template-schema";

import { PermissionsContext } from "@/features/dashboard/PermissionsLoaderContext";

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

const TIPO_DE_SERVICIO = [
  { label: "RTM", value: "RTM" },
  { label: "Preventiva", value: "preventiva" },
  { label: "Peritaje", value: "peritaje" },
  { label: "Otros", value: "otros" },
];

const APLICA_O_NO_APLICA_LABELS = [
  { label: "Cumple", value: "cumple" },
  { label: "No Cumple", value: "no_cumple" },
  { label: "No Aplica", value: "no_aplica" },
];

export default function NewOrderTemplateForm() {

  const contextRecived = useContext(PermissionsContext);


  const tenantId = contextRecived?.PermissionsContextValue.tenantObject?.id
  const logo_url = contextRecived?.PermissionsContextValue.tenantObject?.logo_url
  

  const user = contextRecived?.PermissionsContextValue.user;


  //ESTE ES EL STATE QUE MANEJA TODA LA INFORMACIN DEL FORM
  const [formData, setFormData] = useState<OrderTemplateInput>({
    tenant_id: tenantId || "",
    template_name: "",
    version: 1,
    is_active: true,
    document_date: new Date(),
    document_code: "",
    logo_url: logo_url || "",
    base_contract_text: "",
    created_by: user?.id || "",
    // Agregamos el array de condiciones aquí
    conditions: [
      {
        label: "",
        is_special: false,
        special_condition_label: "",
        default_value: "no_aplica",
        
      },
    ],
    signatures: [
      {
        a_quien_representa: "cliente", // 'cliente', 'recepcionista', 'dt'
        label_firma: "Firma del Cliente",
        declarations: [
          { texto_declaracion: ""},
        ],
      },
    ],
  });
  



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      

  

  // Llamamos a la Server Action pasándole nuestro estado
  const result = await createOrderTemplateAction(formData);

  if (result.error) {
    console.log("❌ Falló la validación:", result.details);
    // TypeScript ahora sabe que result.details es un array de ZodIssue
    
    
    alert("Error en la informacion, fallo en la validacion, no se enviaron los datos")
  } else {
    console.log("✅ ¡Validación exitosa!:", result.message);
    alert("Todo bien, los datos son válidos.");
  }

    console.log("Datos capturados.");
  };




  //FUNCIONES PARA CREAR, EDITAR O ELIMINAR UNA CONDICION AGREGADA
  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [
        ...formData.conditions,
        {
          label: "",
          is_special: false,
          special_condition_label: "",
          default_value: "no_aplica",
          
        },
      ],
    });
  };

  const updateCondition = (
    index: number,
    field: string,
    value: string | boolean,
  ) => {
    const newConditions = [...formData.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setFormData({ ...formData, conditions: newConditions });
  };

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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border p-3 bg-muted/20">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">
                  {COMPONENT_TEXT.labels.active}
                </Label>
                <p className="text-[12px] text-muted-foreground">
                  {COMPONENT_TEXT.hints.active}
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
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
              className="flex-1 min-h-[350px] resize-none border-input focus-visible:ring-primary bg-background"
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




      {/* SECCIÓN DE CONDICIONES: Integrada en formData */}

      <Card className="mt-6 border-border bg-card text-card-foreground shadow-none rounded-lg">
        <CardHeader className="border-b border-border mb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <LayoutDashboard className="size-5 text-primary" />
            {COMPONENT_TEXT.conditions.headerTittle}
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCondition}
          >
            {COMPONENT_TEXT.conditions.buttonNewItem}
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-4">
            {formData.conditions.map((item, index) => (
              <Card
                key={index}
                className="border-border bg-background shadow-none rounded-lg overflow-hidden relative"
              >
                {/* Botón para eliminar condición */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => removeCondition(index)}
                >
                  ✕
                </Button>

                <CardContent className="p-5 space-y-4">
                  {/* Título de la sección */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-primary">
                      Condición o preparación de ingreso
                    </Label>
                    <Textarea
                      placeholder="Describa qué debe cumplir el vehículo (ej: traerlo limpio, sin carga, etc.)"
                      className="min-h-[90px] resize-none border-input bg-muted/5 focus-visible:ring-primary"
                      value={item.label}
                      onChange={(e) =>
                        updateCondition(index, "label", e.target.value)
                      }
                    />
                  </div>

                  {/* Controles: Valor Inicial y Switch Especial */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Valor Inicial por defecto
                      </Label>
                      <Select
                        items={APLICA_O_NO_APLICA_LABELS}
                        value={item.default_value}
                        onValueChange={(val) =>
                          updateCondition(
                            index,
                            "default_value",
                            val ? val : "",
                          )
                        }
                      >
                        <SelectTrigger className="h-10 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Fruits</SelectLabel>
                            {APLICA_O_NO_APLICA_LABELS.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end pb-2">
                      <div className="flex items-center gap-3 p-2 rounded-md border border-dashed border-border w-full">
                        <Switch
                          id={`special-${index}`}
                          checked={item.is_special}
                          onCheckedChange={(checked) =>
                            updateCondition(index, "is_special", checked)
                          }
                        />
                        <div className="grid gap-0.5">
                          <Label
                            htmlFor={`special-${index}`}
                            className="cursor-pointer font-medium"
                          >
                            ¿Es una condición especial?
                          </Label>
                          <p className="text-[11px] text-muted-foreground">
                            Habilita un campo de texto adicional en la orden.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campo de Aplicación Especial: Solo visible si is_special es true */}
                  {item.is_special && (
                    <div className="space-y-2 pt-2 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                      <Label className="text-sm font-bold flex items-center gap-2">
                        ¿A qué vehículo se le aplica esta condición especial?
                      </Label>
                      <Input
                        placeholder="Ejemplo: Solo a vehículos 4x4 o solo a motocicletas con freno de disco"
                        className="h-10 bg-primary/5 border-primary/20 focus-visible:ring-primary"
                        value={item.special_condition_label || ""}
                        onChange={(e) =>
                          updateCondition(
                            index,
                            "special_condition_label",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Estado vacío con diseño consistente */}
            {formData.conditions.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-xl text-muted-foreground bg-muted/5">
                <p className="text-sm">
                  No has definido condiciones para el ingreso de vehículos.
                </p>
                <Button
                  type="button"
                  variant="link"
                  onClick={addCondition}
                  className="mt-2 text-primary font-bold"
                >
                  Agregar la primera condición
                </Button>
              </div>
            )}
          </div>

          {formData.conditions.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg text-muted-foreground">
              No hay condiciones agregadas. Haz clic en -Agregar Ítem- para
              comenzar.
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
                        className="min-h-[70px] text-sm resize-none border-none focus-visible:ring-0 p-0 shadow-none bg-transparent"
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
