"use client";

import React, { useContext, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  SearchCheck,
  ShieldCheck,
  User,
  UserCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { ZodFullFormDataType } from "@/lib/zod-schemas/order-schema";
import { SearchPersonDialog } from "./SearchPersonDialog";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";

// Opciones de identificación según tu lista
export const ID_DOCUMENT_OPTIONS = [
  { label: "Cédula de Ciudadanía", value: "cedula_ciudadania" },
  { label: "NIT", value: "nit" },
  { label: "Pasaporte", value: "pasaporte" },
  { label: "Cédula de Extranjería", value: "cedula_extranjeria" },
  { label: "Tarjeta de Identidad", value: "tarjeta_identidad" },
  { label: "Registro Civil", value: "registro_civil" },
  { label: "Carnet Diplomático", value: "carnet_diplomatico" },
  { label: "N.N.", value: "nn" },
  { label: "TI2", value: "ti2" },
];

interface PersonSectionProps {
  formData: ZodFullFormDataType;
  setFormData: React.Dispatch<React.SetStateAction<ZodFullFormDataType>>;
  selectedTemplate: boolean;
  hayPlaca: boolean;
}

type SarlaftResult = {
  personType: "customer" | "owner";
  seHizoLaConsulta: boolean;
  coincidencia: boolean;
  mensaje: string;
};

type OFACResult = {
  program: string | null;
  list: string | null;
  score: string | null;
};

type APIResponse = {
  success: boolean;
  coincidencia: boolean;
  message: string;
  resultado: OFACResult | null;
  screenshot: string;
};

export const PersonSection = ({
  formData,
  setFormData,
  selectedTemplate,
  hayPlaca,
}: PersonSectionProps) => {
  const PermissionsContextReceived = useContext(PermissionsContext);

  const { tenantModules = [] } =
    PermissionsContextReceived?.PermissionsContextValue ?? {};

  const activeModules = tenantModules
    .filter((module) => module.is_active && module.is_enabled)
    .map((module) => module.code);

  const [sarlaftResult, setSarlaftResult] = useState<SarlaftResult | null>(
    null,
  );

  const [showSarlaftDialog, setShowSarlaftDialog] = useState(false);

  // Manejador para el Cliente (con lógica de espejo manual)
  const handleCustomerChange = (field: string, value: string | boolean) => {
    const formattedValue =
      field === "nombre_completo" && typeof value === "string"
        ? value.toUpperCase()
        : value;

    setFormData((prev: ZodFullFormDataType) => {
      const newCustomerData = {
        ...prev.customer_data,
        [field]: formattedValue,
      };

      return {
        ...prev,
        customer_data: newCustomerData,
        owner_data: prev.is_owner_same_as_customer
          ? { ...prev.owner_data, [field]: formattedValue }
          : prev.owner_data,
      };
    });
  };

  // Manejador para el Dueño
  const handleOwnerChange = (field: string, value: string | boolean) => {
    const formattedValue =
      field === "nombre_completo" && typeof value === "string"
        ? value.toUpperCase()
        : value;

    setFormData((prev: ZodFullFormDataType) => ({
      ...prev,
      owner_data: {
        ...prev.owner_data,
        [field]: formattedValue,
      },
    }));
  };

  // Manejador del Checkbox (Click en toda el área)
  const toggleSameOwner = () => {
    setFormData((prev: ZodFullFormDataType) => {
      const newState = !prev.is_owner_same_as_customer;

      return {
        ...prev,
        is_owner_same_as_customer: newState,
        // Si newState es true, clona el cliente.
        // Si es false, vacía los campos del propietario.
        owner_data: newState
          ? { ...prev.customer_data }
          : {
              id: null,
              tipo_documento: "cedula_ciudadania",
              numero_documento: "",
              nombre_completo: "",
              telefono: "",
              correo: "",
              direccion: "",
              actividad_economica: "",
              origen_fondos: "",
              es_persona_publicamente_expuesta: false,
              se_hizo_la_consulta: false,
              resultado_consulta_sarlaf_desfavorable: false,
            },
      };
    });
  };










  
  const sarlaftMutation = useMutation({
    mutationFn: async (personType: "customer" | "owner") => {
      // ============================================================
      // 1. OBTENER DATOS SEGÚN EL TIPO DE PERSONA
      // ============================================================

      const numeroDocumento =
        personType === "customer"
          ? formData.customer_data.numero_documento
          : formData.owner_data.numero_documento;

      const nombreCompleto =
        personType === "customer"
          ? formData.customer_data.nombre_completo
          : formData.owner_data.nombre_completo;

      // ============================================================
      // 2. VALIDACIÓN PREVIA
      // ============================================================

      if (!numeroDocumento?.trim() || !nombreCompleto?.trim()) {
        throw new Error(
          personType === "customer"
            ? "Debe ingresar el número de documento y el nombre completo del cliente antes de realizar la consulta SARLAFT."
            : "Debe ingresar el número de documento y el nombre completo del propietario antes de realizar la consulta SARLAFT.",
        );
      }

      // ============================================================
      // 3. SIMULACIÓN DE CONSULTA API
      // ============================================================

      const payload = {
        numeroDocumento,
        nombreCompleto,
      };

      const OFACresponse = await fetch(
        "https://runt-api.cda-app.com/api/scraper/sarlaft/ofac/init",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!OFACresponse.ok) {
        throw new Error(`Error HTTP: ${OFACresponse.status}`);
      }

      const dataOFAC: APIResponse = await OFACresponse.json();

      console.log("Respuesta del scraper OFAC:", dataOFAC);




   const UNresponse = await fetch(
        "https://runt-api.cda-app.com/api/scraper/sarlaft/un/init",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!UNresponse.ok) {
        throw new Error(`Error HTTP: ${UNresponse.status}`);
      }

      const dataUN: APIResponse = await UNresponse.json();

      console.log("Respuesta del scraper UN:", dataUN);


      let seEncontroAlgunaCoincidencia = false;
      let success = true;
const mensaje = `${dataOFAC.message} ${dataUN.message}`;
  
      if (dataOFAC.coincidencia === true || dataUN.coincidencia === true){
        seEncontroAlgunaCoincidencia = true;
        success = false;
      }




      return {
        personType,
        seHizoLaConsulta: true,
        success: success,
        coincidencia: seEncontroAlgunaCoincidencia,
        mensaje: mensaje,
        resultado: dataOFAC.resultado,
        screenshotOFAC: dataOFAC.screenshot,
        screenshotUN: dataUN.screenshot
      };
    },

    // ==============================================================
    // 4. CONSULTA COMPLETADA CORRECTAMENTE
    // ==============================================================

    onSuccess: (result) => {



      setFormData((prev: ZodFullFormDataType) => {
        // ============================================================
        // CASO 1: SE CONSULTÓ EL CLIENTE
        // ============================================================

        if (result.personType === "customer") {
          return {
            ...prev,

            customer_data: {
              ...prev.customer_data,
              se_hizo_la_consulta: true,
              resultado_consulta_sarlaf_desfavorable: result.coincidencia,
            },

            // Si cliente = propietario, ambos representan
            // a la misma persona y la consulta aplica para ambos.
            owner_data: prev.is_owner_same_as_customer
              ? {
                  ...prev.owner_data,
                  se_hizo_la_consulta: true,
                  resultado_consulta_sarlaf_desfavorable: result.coincidencia,
                }
              : prev.owner_data,
          };
        }

        // ============================================================
        // CASO 2: SE CONSULTÓ EL PROPIETARIO
        // ============================================================

        return {
          ...prev,

          owner_data: {
            ...prev.owner_data,
            se_hizo_la_consulta: true,
            resultado_consulta_sarlaf_desfavorable: result.coincidencia,
          },

          // Si cliente = propietario, también actualizamos el cliente.
          customer_data: prev.is_owner_same_as_customer
            ? {
                ...prev.customer_data,
                se_hizo_la_consulta: true,
                resultado_consulta_sarlaf_desfavorable: result.coincidencia,
              }
            : prev.customer_data,
        };
      });





      if (result.personType === "customer") {




        const OFAClink = document.createElement("a");

        OFAClink.href = `data:image/jpeg;base64,${result.screenshotOFAC}`;

        const partsOFAC = new Intl.DateTimeFormat("es-CO", {
          timeZone: "America/Bogota",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).formatToParts(new Date());

        const formattedDateOFAC = `${partsOFAC.find((p) => p.type === "year")?.value}-${partsOFAC.find((p) => p.type === "month")?.value}-${partsOFAC.find((p) => p.type === "day")?.value}`;

        OFAClink.download = `${formattedDateOFAC}-${formData.vehicle.placa}-Evidencia_Sarlaft_OFAC_cliente.jpg`;

        OFAClink.click();


         const UNlink = document.createElement("a");

        UNlink.href = `data:image/jpeg;base64,${result.screenshotOFAC}`;

        const partsUN = new Intl.DateTimeFormat("es-CO", {
          timeZone: "America/Bogota",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).formatToParts(new Date());

        const formattedDateUN = `${partsUN.find((p) => p.type === "year")?.value}-${partsUN.find((p) => p.type === "month")?.value}-${partsUN.find((p) => p.type === "day")?.value}`;

        UNlink.download = `${formattedDateUN}-${formData.vehicle.placa}-Evidencia_Sarlaft_NacionesUnidas_cliente.jpg`;

        UNlink.click();


        
      } else if (result.personType === "owner") {
        const OFAClink = document.createElement("a");

        OFAClink.href = `data:image/jpeg;base64,${result.screenshotOFAC}`;

        const parts = new Intl.DateTimeFormat("es-CO", {
          timeZone: "America/Bogota",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).formatToParts(new Date());

        const formattedDate = `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}-${parts.find((p) => p.type === "day")?.value}`;

        OFAClink.download = `${formattedDate}-${formData.vehicle.placa}-Evidencia_Sarlaft_OFAC_propietario.jpg`;

        OFAClink.click();

        const UNlink = document.createElement("a");

        UNlink.href = `data:image/jpeg;base64,${result.screenshotOFAC}`;

        const partsUN = new Intl.DateTimeFormat("es-CO", {
          timeZone: "America/Bogota",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).formatToParts(new Date());

        const formattedDateUN = `${partsUN.find((p) => p.type === "year")?.value}-${partsUN.find((p) => p.type === "month")?.value}-${partsUN.find((p) => p.type === "day")?.value}`;

        UNlink.download = `${formattedDateUN}-${formData.vehicle.placa}-Evidencia_Sarlaft_NacionesUnidas_propietario.jpg`;

        UNlink.click();
      }

      // ============================================================
      // RESULTADO PARA EL ALERT DIALOG
      // ============================================================

      setSarlaftResult({
        personType: result.personType,
        coincidencia: result.coincidencia,
        seHizoLaConsulta: true,
        mensaje: result.mensaje,
      });

      setShowSarlaftDialog(true);
    },

    // ==============================================================
    // 5. VALIDACIÓN FALLIDA O ERROR DE LA CONSULTA
    // ==============================================================

    onError: (error, personType) => {
      console.error("Error consultando SARLAFT:", error);

      // IMPORTANTE:
      // NO modificamos formData.
      //
      // Por lo tanto:
      // - se_hizo_la_consulta permanece como estaba.
      // - resultado_consulta_sarlaf_desfavorable permanece como estaba.
      //
      // Esto es importante porque una validación fallida NO significa
      // que la persona haya sido consultada.

      setSarlaftResult({
        personType,
        seHizoLaConsulta: false,
        coincidencia: false,
        mensaje:
          error instanceof Error
            ? error.message
            : "No fue posible completar la consulta SARLAFT.",
      });

      setShowSarlaftDialog(true);
    },
  });




















  const isValidationError = sarlaftResult?.seHizoLaConsulta === false;
  const hasCoincidence = sarlaftResult?.coincidencia === true;

  return (
    <fieldset
      className={`mt-2 transition-all duration-500 ${selectedTemplate && hayPlaca ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}
    >
      <div className="border-t border-border pt-8">
        <legend className="text-xs font-bold uppercase text-muted-foreground tracking-widest my-5">
          3. Identificación de Personas
        </legend>

        {/* BOTÓN / CHECKBOX GRANDE CLICKABLE EN CUALQUIER LADO */}
        <div
          onClick={toggleSameOwner}
          className={`flex max-w-100 items-center gap-3 px-5 py-2.5 rounded-xl border-2 cursor-pointer transition-all active:scale-95 select-none my-10 ${
            formData.is_owner_same_as_customer
              ? "bg-primary border-primary text-primary-foreground shadow-xs"
              : "bg-background border-border text-muted-foreground hover:border-muted-foreground/40"
          }`}
        >
          <Checkbox
            checked={formData.is_owner_same_as_customer}
            onCheckedChange={toggleSameOwner}
            className={`h-5 w-5 ${
              formData.is_owner_same_as_customer
                ? "border-background data-[state=checked]:bg-background data-[state=checked]:text-primary"
                : "border-input"
            }`}
          />
          <span className="text-[11px] font-black uppercase tracking-tighter">
            ¿Es el cliente tambien el propietario del vehiculo?
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* --- BLOQUE CLIENTE (PRESENTANTE) --- */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <User className="h-5 w-5 text-primary" />
              <span className="text-[12px] font-black text-foreground uppercase tracking-tight">
                Datos del Cliente{" "}
                <span className="text-muted-foreground/60 font-medium">
                  (Presentante)
                </span>
              </span>
            </div>
            <div className="bg-background border border-border rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex gap-2">
                {/* DISPLAY DOCUMENTO */}
                <div className="flex-1 h-11 rounded-md border border-border bg-muted/40 px-4 flex items-center overflow-hidden">
                  <div className="flex flex-col leading-tight overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground truncate">
                      {ID_DOCUMENT_OPTIONS.find(
                        (d) =>
                          d.value === formData.customer_data.tipo_documento,
                      )?.label || "Tipo documento"}
                    </span>

                    <span className="text-sm font-semibold text-foreground truncate">
                      {formData.customer_data.numero_documento ||
                        "Sin documento"}
                    </span>
                  </div>
                </div>

                {/* BOTÓN */}
                <div className="flex-1">
                  <SearchPersonDialog
                    currentDocumentType={formData.customer_data.tipo_documento}
                    currentDocumentNumber={
                      formData.customer_data.numero_documento
                    }
                    onUpdate={(data) => {
                      setFormData((prev) => {
                        const updatedCustomerData = {
                          ...prev.customer_data,
                          tipo_documento: data.tipo_documento,
                          numero_documento: data.numero_documento,
                          ...(data.foundData ?? {}),
                        };

                        if (prev.is_owner_same_as_customer) {
                          return {
                            ...prev,
                            customer_data: updatedCustomerData,
                            owner_data: {
                              ...prev.owner_data,
                              tipo_documento: data.tipo_documento,
                              numero_documento: data.numero_documento,
                              ...(data.foundData ?? {}),
                            },
                          };
                        }

                        return {
                          ...prev,
                          customer_data: updatedCustomerData,
                        };
                      });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                  Nombre Completo / Razón Social
                </Label>
                <Input
                  disabled={!formData.customer_data.numero_documento}
                  required
                  className="h-11 bg-background"
                  placeholder="NOMBRE COMPLETO DEL CLIENTE"
                  value={formData.customer_data.nombre_completo}
                  onChange={(e) =>
                    handleCustomerChange("nombre_completo", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Teléfono de contacto
                  </Label>
                  <Input
                    disabled={!formData.customer_data.numero_documento}
                    required
                    className="h-11 bg-background"
                    placeholder="Ej: 3101234567"
                    value={formData.customer_data.telefono}
                    onChange={(e) =>
                      handleCustomerChange("telefono", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Correo Electrónico
                  </Label>
                  <Input
                    disabled={!formData.customer_data.numero_documento}
                    required
                    className="h-11 bg-background"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.customer_data.correo}
                    onChange={(e) =>
                      handleCustomerChange("correo", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                  Dirección de Residencia
                </Label>
                <Input
                  disabled={!formData.customer_data.numero_documento}
                  required
                  className="h-11 bg-background"
                  placeholder="Ej: Calle 10 # 20-30"
                  value={formData.customer_data.direccion}
                  onChange={(e) =>
                    handleCustomerChange("direccion", e.target.value)
                  }
                />
              </div>

              {/**JSX DEL SARLAFT DE AQUI PARA ABAJO */}

              {activeModules.includes("sarlaft") && (
                <>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Actividad Económica Cliente
                    </Label>
                    <Input
                      disabled={!formData.customer_data.numero_documento}
                      className="h-11 bg-background"
                      placeholder="Enfermero Profesional"
                      value={formData.customer_data.actividad_economica}
                      onChange={(e) =>
                        handleCustomerChange(
                          "actividad_economica",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Origen Fondos Cliente
                    </Label>
                    <Input
                      disabled={!formData.customer_data.numero_documento}
                      className="h-11 bg-background"
                      placeholder="Salario"
                      value={formData.customer_data.origen_fondos}
                      onChange={(e) =>
                        handleCustomerChange("origen_fondos", e.target.value)
                      }
                    />
                  </div>

                  <FieldLabel
                    htmlFor="pep-switch"
                    className={`rounded-xl border-2 px-5 py-4 cursor-pointer transition-all ${
                      formData.customer_data.es_persona_publicamente_expuesta
                        ? "border-destructive bg-destructive/10"
                        : "border-emerald-500/30 bg-emerald-500/10"
                    }`}
                  >
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle
                          className={
                            formData.customer_data
                              .es_persona_publicamente_expuesta
                              ? "text-destructive"
                              : "text-emerald-600"
                          }
                        >
                          Persona Públicamente Expuesta (PEP)
                        </FieldTitle>

                        <FieldDescription>
                          {formData.customer_data
                            .es_persona_publicamente_expuesta
                            ? "La persona ha sido identificada como públicamente expuesta."
                            : "La persona no está identificada como públicamente expuesta."}
                        </FieldDescription>
                      </FieldContent>

                      <Switch
                        disabled={!formData.customer_data.numero_documento}
                        id="pep-switch"
                        checked={
                          formData.customer_data
                            .es_persona_publicamente_expuesta
                        }
                        onCheckedChange={(checked) =>
                          handleCustomerChange(
                            "es_persona_publicamente_expuesta",
                            checked,
                          )
                        }
                        className="
                      data-[state=checked]:bg-destructive
                      data-[state=unchecked]:bg-emerald-500
                    "
                      />
                    </Field>
                  </FieldLabel>

                  <Button
                    type="button"
                    size="lg"
                    disabled={
                      sarlaftMutation.isPending ||
                      !formData.customer_data.numero_documento
                    }
                    onClick={() => sarlaftMutation.mutate("customer")}
                    className="w-full h-14 gap-3 bg-primary text-primary-foreground font-bold text-base shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl disabled:opacity-70"
                  >
                    {sarlaftMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Consultando listas...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5" />
                        Consultar SARLAFT y Listas Restrictivas
                      </>
                    )}
                  </Button>

                  <AlertDialog
                    open={showSarlaftDialog}
                    onOpenChange={setShowSarlaftDialog}
                  >
                    <AlertDialogContent
                      className={
                        isValidationError
                          ? "border-2 border-amber-500"
                          : hasCoincidence
                            ? "border-2 border-destructive"
                            : "border-2 border-emerald-500"
                      }
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle
                          className={`flex items-center gap-3 text-xl font-black ${
                            isValidationError
                              ? "text-amber-600"
                              : hasCoincidence
                                ? "text-destructive"
                                : "text-emerald-600"
                          }`}
                        >
                          {isValidationError ? (
                            <AlertTriangle className="h-7 w-7" />
                          ) : hasCoincidence ? (
                            <AlertTriangle className="h-7 w-7" />
                          ) : (
                            <SearchCheck className="h-7 w-7" />
                          )}

                          {isValidationError
                            ? "Datos incompletos"
                            : hasCoincidence
                              ? "Consulta SARLAFT desfavorable"
                              : "Consulta SARLAFT favorable"}
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-base leading-relaxed">
                          {isValidationError ? (
                            <>
                              Para realizar la consulta SARLAFT del{" "}
                              <strong>
                                {sarlaftResult?.personType === "customer"
                                  ? "cliente"
                                  : "propietario"}
                              </strong>
                              , debe ingresar primero el{" "}
                              <strong>nombre completo</strong> y el{" "}
                              <strong>número de documento</strong>.
                              <br />
                              <br />
                              <span className="font-semibold text-amber-600">
                                Complete los datos requeridos antes de realizar
                                la consulta.
                              </span>
                            </>
                          ) : hasCoincidence ? (
                            <>
                              Se encontraron{" "}
                              <strong className="text-destructive">
                                coincidencias
                              </strong>{" "}
                              en las listas consultadas para el{" "}
                              <strong>
                                {sarlaftResult?.personType === "customer"
                                  ? "cliente"
                                  : "propietario"}
                              </strong>
                              .
                              <br />
                              <br />
                              <span className="font-semibold">
                                No es posible continuar con el procedimiento de
                                Revisión Técnico-Mecánica (RTM) hasta realizar
                                la revisión correspondiente.
                              </span>
                            </>
                          ) : (
                            <>
                              La consulta realizada para el{" "}
                              <strong>
                                {sarlaftResult?.personType === "customer"
                                  ? "cliente"
                                  : "propietario"}
                              </strong>{" "}
                              no encontró coincidencias en las listas SARLAFT y
                              listas restrictivas.
                              <br />
                              <br />
                              <span className="font-semibold text-emerald-600">
                                Puede continuar con el procedimiento de Revisión
                                Técnico-Mecánica (RTM).
                              </span>
                            </>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogAction
                          onClick={() => setShowSarlaftDialog(false)}
                          className={
                            isValidationError
                              ? "bg-amber-500 text-white hover:bg-amber-600"
                              : hasCoincidence
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }
                        >
                          {isValidationError
                            ? "Entendido"
                            : hasCoincidence
                              ? "Cerrar"
                              : "Continuar con el procedimiento"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>

          {/* --- BLOQUE PROPIETARIO (TARJETA) --- */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" />
                <span className="text-[12px] font-black text-foreground uppercase tracking-tight">
                  Propietario{" "}
                  <span className="text-muted-foreground/60 font-medium">
                    (Tarjeta de Propiedad)
                  </span>
                </span>
              </div>
            </div>

            <div
              className={`transition-all duration-500 ${formData.is_owner_same_as_customer ? "opacity-40 grayscale pointer-events-none" : "opacity-100"}`}
            >
              <div
                className={`bg-background border-2 rounded-2xl p-6 space-y-5 shadow-xs transition-all ${
                  formData.is_owner_same_as_customer
                    ? "border-muted/40"
                    : "border-emerald-500/20 bg-emerald-500/5"
                }`}
              >
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Documento Propietario
                  </Label>

                  <div className="flex gap-2">
                    {/* DISPLAY */}
                    <div
                      className={`flex-1 h-11 rounded-md border px-4 flex items-center overflow-hidden transition-all ${
                        formData.is_owner_same_as_customer
                          ? "bg-muted border-transparent opacity-60"
                          : "bg-background border-border"
                      }`}
                    >
                      <div className="flex flex-col leading-tight overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground truncate">
                          {ID_DOCUMENT_OPTIONS.find(
                            (d) =>
                              d.value === formData.owner_data.tipo_documento,
                          )?.label || "Tipo documento"}
                        </span>

                        <span className="text-sm font-semibold text-foreground truncate">
                          {formData.owner_data.numero_documento ||
                            "Sin documento"}
                        </span>
                      </div>
                    </div>

                    {/* BOTÓN / DIALOG */}
                    <div className="flex-1">
                      <SearchPersonDialog
                        disabled={formData.is_owner_same_as_customer}
                        currentDocumentType={formData.owner_data.tipo_documento}
                        currentDocumentNumber={
                          formData.owner_data.numero_documento
                        }
                        onUpdate={(data) => {
                          setFormData((prev) => ({
                            ...prev,
                            owner_data: {
                              ...prev.owner_data,
                              tipo_documento: data.tipo_documento,
                              numero_documento: data.numero_documento,
                              ...(data.foundData ?? {}),
                            },
                          }));
                        }}
                      />
                    </div>
                  </div>

                  {/* MENSAJE CUANDO ESTÁ SINCRONIZADO */}
                  {formData.is_owner_same_as_customer && (
                    <p className="text-[11px] text-muted-foreground font-medium px-1">
                      El propietario utiliza automáticamente la información del
                      cliente.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Nombre del Propietario
                  </Label>
                  <Input
                    required
                    disabled={
                      formData.is_owner_same_as_customer ||
                      !formData.owner_data.numero_documento
                    }
                    className="h-11 bg-background"
                    placeholder="SEGÚN TARJETA DE PROPIEDAD"
                    value={formData.owner_data.nombre_completo}
                    onChange={(e) =>
                      handleOwnerChange("nombre_completo", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Teléfono Propietario
                    </Label>
                    <Input
                      required
                      disabled={
                        formData.is_owner_same_as_customer ||
                        !formData.owner_data.numero_documento
                      }
                      className="h-11 bg-background"
                      placeholder="Ej: 3101234567"
                      value={formData.owner_data.telefono}
                      onChange={(e) =>
                        handleOwnerChange("telefono", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Correo Propietario
                    </Label>
                    <Input
                      required
                      disabled={
                        formData.is_owner_same_as_customer ||
                        !formData.owner_data.numero_documento
                      }
                      className="h-11 bg-background"
                      placeholder="ejemplo@correo.com"
                      value={formData.owner_data.correo}
                      onChange={(e) =>
                        handleOwnerChange("correo", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Dirección Propietario
                  </Label>
                  <Input
                    required
                    disabled={
                      formData.is_owner_same_as_customer ||
                      !formData.owner_data.numero_documento
                    }
                    className="h-11 bg-background"
                    placeholder="Ej: Calle 10 # 20-30"
                    value={formData.owner_data.direccion}
                    onChange={(e) =>
                      handleOwnerChange("direccion", e.target.value)
                    }
                  />
                </div>

                {/**SARLAFT SECCION DEL PROPIETARIO */}

                {activeModules.includes("sarlaft") && (
                  <>
                    <Button
                      type="button"
                      size="lg"
                      disabled={
                        formData.is_owner_same_as_customer ||
                        sarlaftMutation.isPending ||
                        !formData.owner_data.numero_documento
                      }
                      onClick={() => sarlaftMutation.mutate("owner")}
                      className="w-full h-14 gap-3 bg-primary text-primary-foreground font-bold text-base shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl disabled:opacity-50"
                    >
                      {sarlaftMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Consultando listas...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-5 w-5" />
                          Consultar SARLAFT y Listas Restrictivas
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  );
};
