
"use client";

import { useState, useContext } from "react";
import { ReceptionistContext } from "@/contexts/ReceptionistLoaderContex";

// UI Components
import { Badge } from "@/components/ui/badge";

// Icons
import {
  RefreshCcw,
  CheckCircle2,
  ShieldCheck,
  SendHorizontal,
} from "lucide-react";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";

import { Button } from "@/components/ui/button";

import TirePressureSection from "@/components/dashboard/recepcionista/TirePressureSection";
import ConditionsSwitchSections from "@/components/dashboard/recepcionista/ConditionsSwitchSections";
import SignatureSection from "@/components/dashboard/recepcionista/SignatureSection";
import { PersonSection } from "@/components/dashboard/recepcionista/PersonSection";
import { Textarea } from "@/components/ui/textarea";

import {
  ServiceType,
  ZodFullFormDataType,
} from "@/lib/zod-schemas/order-schema";
import { createOrderAction } from "@/lib/server-actions/createOrderAction";
import { ZodErrorDialog } from "@/components/dashboard/recepcionista/ZodErrorDialog";
import { $ZodIssue } from "zod/v4/core";
import TemplateSelectionSection from "@/components/dashboard/recepcionista/TemplateSelectionSection";
import PlacaSelectionSection from "@/components/dashboard/recepcionista/PlacaSelectionSection";
import VehicleDataSection from "@/components/dashboard/recepcionista/VehicleDataSection";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


// 🌟 ESTADO INICIAL REUTILIZABLE (Con Return Explícito)
export function getInitialOrderFormData(
  tenantId = "",
  funcionarioId = "",
  currentPlantillaId = "",
  serviceType: ServiceType = "RTM",
): ZodFullFormDataType {
  return {
    id: null,

    // --- DATOS DE CONTROL Y LLAVES EXTERNAS ---
    tenant_id: tenantId,
    funcionario_id: funcionarioId,
    plantilla_id: currentPlantillaId,
    id_reprobado: null,

    // --- DATOS DINÁMICOS DE LA ORDEN (Snapshots) ---
    kilometraje: "",
    es_reinspeccion: false,
    service_type: serviceType,
    estado_orden: "abierta",
    observaciones: "",
    soat_vencimiento_snapshot: "",
    gas_numero_snapshot: "",
    gas_vencimiento_snapshot: "",

    // --- ENTIDAD VEHÍCULO ---
    vehicle: {
      id: null,
      placa: "",
      marca: "",
      linea: "",
      modelo: "",
      color: "",
      tipo_vehiculo: "",
      clase: "",
      combustible: "",
      cilindrada: "",
      blindaje: false,
      capacidad_pasajeros: "",
      es_ensenanza: false,
      tipo_servicio_vehiculo: "",
      propietario_actual_id: null,
      es_extranjero: false,

      // 🆕 NUEVOS CAMPOS DEL RUNT
      soat_vigente_de_acuerdo_al_runt: "",
      fecha_vencimiento_rtm: "",
      organismo_que_expidio_ultima_rtm: "",
      rtm_vigente_de_acuerdo_al_runt: "",
      se_encontro_fecha_vencimiento_rtm: "",
      fecha_matricula: "",
    },

    // --- REGISTRO DE PRESIONES DE LLANTAS ---
    tire_pressures: [
      {
        eje: 1,
        posicion: "centro",
        presion_encontrada: "",
        presion_ajustada: "",
        _requiere_ajuste: false,
      },
      {
        eje: 2,
        posicion: "centro",
        presion_encontrada: "",
        presion_ajustada: "",
        _requiere_ajuste: false,
      },
    ],

    // --- RESULTADOS DE CONDICIONES Y FIRMAS ---
    condition_results: [],
    signatures: [],

    // --- DATOS DE CLIENTE Y PROPIETARIO ---
    customer_data: {
      id: null,
      tipo_documento: "cedula_ciudadania",
      numero_documento: "",
      nombre_completo: "",
      telefono: "",
      correo: "",
      direccion: "",
    },
    owner_data: {
      id: null,
      tipo_documento: "cedula_ciudadania",
      numero_documento: "",
      nombre_completo: "",
      telefono: "",
      correo: "",
      direccion: "",
    },
    is_owner_same_as_customer: false,
  };
}

export default function NewEntryOrderComponent() {
  const queryClient = useQueryClient();

  const ReceptionistContextReceived = useContext(ReceptionistContext);
  const PermissionsContextReceived = useContext(PermissionsContext);

  const templateTableData =
    ReceptionistContextReceived?.ReceptionistContextValue.templateTableData;
  //FILTRADO DE LOS TEMPLATES: De los que se reciben desde el context
  const activeTemplates =
    templateTableData?.query.data?.filter((t) => t.is_active) || [];

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Estados para controlar el Dialog de errores
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  // Estado local para el cargando (reemplaza a isPending de useActionState)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<$ZodIssue[] | null | string>(
    null,
  );
  const [signatureKey, setSignatureKey] = useState(0); //este state es para reiniciar el componete de las firmas

  //STATE PRINCIPAL DEL FORMULARIO
  const [formData, setFormData] = useState<ZodFullFormDataType>({
    id: null,
    // --- DATOS DE CONTROL Y LLAVES EXTERNAS ---
    tenant_id:
      PermissionsContextReceived?.PermissionsContextValue.tenantObject?.id ||
      "",
    funcionario_id:
      PermissionsContextReceived?.PermissionsContextValue.user?.id || "",
    plantilla_id: "",

    //Control por si es reinpseccion
    id_reprobado: null,

    // --- DATOS DINÁMICOS DE LA ORDEN (Snapshots) ---
    // Estos datos cambian en cada inspección y deben quedar congelados en entry_orders
    kilometraje: "",
    es_reinspeccion: false,
    service_type: "RTM", // Default según tu enum
    estado_orden: "abierta",
    observaciones: "",
    soat_vencimiento_snapshot: "",
    gas_numero_snapshot: "",
    gas_vencimiento_snapshot: "",

    // --- ENTIDAD VEHÍCULO (Para la tabla public.vehicles) ---
    // La placa vive aquí adentro porque es parte de la identidad del vehículo
    vehicle: {
      id: null, // UUID si el vehículo existe en DB, null si es nuevo
      placa: "",
      marca: "",
      linea: "",
      modelo: "", // integer en tu DB
      color: "",
      tipo_vehiculo: "",
      clase: "",
      combustible: "",
      cilindrada: "", // integer en tu DB
      blindaje: false,
      capacidad_pasajeros: "", // integer en tu DB
      es_ensenanza: false,
      tipo_servicio_vehiculo: "", // Enum: particular, publico, etc.
      propietario_actual_id: null, // Referencia a la tabla personas
      es_extranjero: false,
    },

    // --- REGISTRO DE PRESIONES DE LLANTAS (Detalle de la Orden) ---
    // Array aplanado para facilitar el envío a la tabla entry_order_tire_pressures
    tire_pressures: [
      {
        eje: 1,
        posicion: "centro",
        presion_encontrada: "",
        presion_ajustada: "",

        _requiere_ajuste: false,
      },
      {
        eje: 2,
        posicion: "centro",
        presion_encontrada: "",
        presion_ajustada: "",

        _requiere_ajuste: false,
      },
    ],
    // --- RESULTADOS DE CONDICIONES (Detalle de la Orden) ---
    // Este array se llenará dinámicamente cuando el usuario cargue la plantilla
    condition_results: [],
    signatures: [], // <-- Nueva propiedad
    // Dentro de tu useState inicial:
    customer_data: {
      id: null,
      tipo_documento: "cedula_ciudadania",
      numero_documento: "",
      nombre_completo: "",
      telefono: "",
      correo: "",
      direccion: "",
    },
    owner_data: {
      id: null,
      tipo_documento: "cedula_ciudadania",
      numero_documento: "",
      nombre_completo: "",
      telefono: "",
      correo: "",
      direccion: "",
    },
    is_owner_same_as_customer: false, // Switch maestro
  });

  //console.log(formData)

  //TEMPLATE SELECCIONADO DE ENTRE LOS ACTIVOS: Seleccionar cual de los activos esta tambien seleccionado, se utiliza para saber si renderizar o no el contenido
  const selectedTemplate = activeTemplates.find(
    (t) => t.id === formData.plantilla_id,
  );

  // MANEJADOR DE SELECCIÓN DE PLANTILLA
  const handleTemplateSelect = (id: string, checked: boolean) => {
    if (
      !PermissionsContextReceived?.PermissionsContextValue.user
        ?.signature_base64
    ) {
      setServerError(
        "Error: El inspector no posee una firma registrada, por fa registralo la seccion del perfil",
      );
      setShowErrorDialog(true);
      return;
    }

    // 1. Buscamos la plantilla completa en el array de activas
    const template = activeTemplates.find((t) => t.id === id);

    setFormData((prev) => {
      // 2. Preparamos los resultados iniciales de condiciones
      const initialConditionResults =
        checked && template?.conditions
          ? template.conditions.map((cond) => ({
              template_condition_id: cond.id,
              value: cond.default_value,
              is_especial: cond.is_special,
            }))
          : [];

      // 3. Preparamos la estructura inicial de las firmas
      // Esto es clave: ya dejamos el objeto listo con el ID del template y el tipo de representante
      const initialSignatures =
        checked && template?.signatures
          ? template.signatures.map((sig) => ({
              template_signature_id: sig.id,
              representative_type: sig.representative_type,
              signature_url: "", // Inicia vacío hasta que firmen en el Pad
            }))
          : [];

      return {
        ...prev,
        plantilla_id: checked ? id : "",
        texto_contractual_snapshot: checked
          ? template?.base_contract_text || ""
          : "",

        // Inyectamos las condiciones iniciales
        condition_results: initialConditionResults,

        // Inyectamos la estructura de firmas inicial
        // Si desmarca la plantilla, esto se limpia solo ([])
        signatures: initialSignatures,
      };
    });

    setSignatureKey((prev) => prev + 1);
  };

  // manejador del boton submit del final
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsSubmitting(true);
    setServerError(null);

    if (formData.vehicle.placa === "") {
      alert("No hay placa seleccionada");
      setIsSubmitting(false);
      return;
    }

    // 1. Verificamos si al menos uno de los resultados tiene el valor "no_cumple"
    const tieneCondicionesNoCumplidas = formData.condition_results.some(
      (result) => result.value === "no_cumple",
    );

    // 2. Si encuentra alguna, disparamos el error de inmediato
    if (tieneCondicionesNoCumplidas) {
      setServerError(
        "Error: No se puede enviar la orden de entrada ya que existen condiciones que no se cumplen en la inspección.",
      );
      setShowErrorDialog(true);
      setIsSubmitting(false);
      return;
    }

    try {
      // 🔥 FILTRADO TÉCNICO: Creamos un payload limpio para la Server Action
      // Excluimos todo excepto las condiciones especiales que SÍ cumplen.
      const filteredConditionResults = formData.condition_results.filter(
        (condition) =>
          condition.is_especial === true && condition.value === "cumple",
      );

      // Reensamblamos el objeto para enviarlo purificado
      const payloadToSubmit = {
        ...formData,
        condition_results: filteredConditionResults,
      };

      // Enviamos el payload filtrado a la Server Action
      const { data, error } = await createOrderAction(payloadToSubmit);

      if (error || !data) {
        setServerError(error);
        setShowErrorDialog(true);
        return; // Detenemos la ejecución aquí
      } else {
        // Éxito: Redirigir o limpiar formulario

        setShowSuccessDialog(true);

      setFormData((prev) => ({
  ...prev,

  // --- DATOS DE CONTROL Y LLAVES EXTERNAS ---
  // (Estos NO se limpian porque son fijos: tenant_id, funcionario_id, plantilla_id, id_reprobado)

  // --- DATOS DINÁMICOS DE LA ORDEN (Snapshots) ---
  kilometraje: "",
  es_reinspeccion: false,
  service_type: "RTM",
  estado_orden: "abierta",
  observaciones: "",
  soat_vencimiento_snapshot: "",
  gas_numero_snapshot: "",
  gas_vencimiento_snapshot: "",

  // --- ENTIDAD VEHÍCULO ---
  vehicle: {
    id: null,
    placa: "",
    marca: "",
    linea: "",
    modelo: "",
    color: "",
    tipo_vehiculo: "",
    clase: "",
    combustible: "",
    cilindrada: "",
    blindaje: false,
    capacidad_pasajeros: "",
    es_ensenanza: false,
    tipo_servicio_vehiculo: "",
    propietario_actual_id: null,
    es_extranjero: false,

    // 🆕 NUEVOS CAMPOS DEL RUNT (se limpian)
    soat_vigente_de_acuerdo_al_runt: "",
    fecha_vencimiento_rtm: "",
    organismo_que_expidio_ultima_rtm: "",
    rtm_vigente_de_acuerdo_al_runt: "",
    se_encontro_fecha_vencimiento_rtm: "",
    fecha_matricula: "",
  },

  // --- REGISTRO DE PRESIONES DE LLANTAS ---
  tire_pressures: [
    {
      eje: 1,
      posicion: "centro",
      presion_encontrada: "",
      presion_ajustada: "",
      _requiere_ajuste: false,
    },
    {
      eje: 2,
      posicion: "centro",
      presion_encontrada: "",
      presion_ajustada: "",
      _requiere_ajuste: false,
    },
  ],

  // --- RESULTADOS DE CONDICIONES (se mantienen) ---
  condition_results: prev.condition_results,

  // --- FIRMAS (se resetea la URL) ---
  signatures: prev.signatures.map((sig) => ({
    ...sig,
    signature_url: "",
  })),

  // --- DATOS DE CLIENTE Y PROPIETARIO ---
  customer_data: {
    id: null,
    tipo_documento: "cedula_ciudadania",
    numero_documento: "",
    nombre_completo: "",
    telefono: "",
    correo: "",
    direccion: "",
  },
  owner_data: {
    id: null,
    tipo_documento: "cedula_ciudadania",
    numero_documento: "",
    nombre_completo: "",
    telefono: "",
    correo: "",
    direccion: "",
  },
  is_owner_same_as_customer: false,
}));

        // ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
        setSignatureKey((prev) => prev + 1);
        queryClient.invalidateQueries({ queryKey: ["entry-orders", "list"] });


        /** 
        const supabase = createSupabaseBrowserClient();
        const { data: orderData, error } = await supabase.rpc(
          "fetch_entry_order_by_id",
          {
            p_order_id: data,
            p_tenant_id: PermissionsContextReceived?.PermissionsContextValue.tenantObject?.id || "",
          },
        );

        const orderDataTyped = (orderData as unknown as FetchEntryOrderResult[])?.[0];

        if (error || !orderDataTyped) {
          console.error("Error en RPC:", error);
        }

        console.log("📦 Datos de la orden obtenidos:", orderDataTyped);

        

        const pdfBlob = await pdf(
          <OrderPDF orderData={orderDataTyped ?? undefined} />,
        ).toBlob();

        // Crear una URL en memoria para el Blob
        const url = URL.createObjectURL(pdfBlob);

        // Crear un elemento <a> invisible para forzar la descarga
        const link = document.createElement("a");
        link.href = url;

        // Formateamos el nombre del archivo
        const placa = formData.vehicle.placa
          ? `_${formData.vehicle.placa}`
          : "";
        const fecha = new Date().toISOString().split("T")[0];
        link.download = `Orden_de_Ingreso${placa}_${fecha}.pdf`.replace(
          /\s+/g,
          "_",
        );

        // Disparar clic y limpiar memoria
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
         */
      }

     
    } catch (error: unknown) {
      alert("Ocurrio un error inesperado en la validacion: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-8 mx-auto space-y-8">
        {/**TITULO SUPERIOR */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Nueva Orden de Entrada
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Complete la información del vehículo vinculada a una plantilla
            técnica.
          </p>
        </div>

        {/**El div que contiene todas las secciones del formulario */}
        <div className="flex flex-col gap-6">
          {/**badge de refresco de datos */}
          <div className="flex justify-start">
            {templateTableData?.query.isFetching ? (
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50 animate-pulse gap-1.5 px-3 py-1"
              >
                <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                Sincronizando base de datos...
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50 gap-1.5 px-3 py-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Plantillas Actualizadas
              </Badge>
            )}
          </div>

          {/**SECCION DE SELECCION DE PLANTILLA */}
          <TemplateSelectionSection
            activeTemplates={activeTemplates}
            plantilla_id={formData.plantilla_id}
            handleTemplateSelect={handleTemplateSelect}
          ></TemplateSelectionSection>

          {/**SECCION DE BUSQUEDA DE PLACA */}
          <PlacaSelectionSection
            selectedTemplate={selectedTemplate}
            setFormData={setFormData}
            formData={formData}
            setSignatureKey={setSignatureKey}
          ></PlacaSelectionSection>

          {/**SECCION DE LAS PERSONAS */}
          <PersonSection
            formData={formData}
            setFormData={setFormData}
            selectedTemplate={selectedTemplate ? true : false}
            hayPlaca={formData.vehicle.placa ? true : false}
          />

          {/**SECCION DE DATOS DEL VEHICULO */}
          <VehicleDataSection
            selectedTemplate={selectedTemplate}
            formData={formData}
            setFormData={setFormData}
          />

          {/**SECCION DE LAS PRESIONES DEL VEHICULO */}
          <fieldset
            className={`mt-2 transition-all duration-500 ${selectedTemplate && formData.vehicle.placa ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}
          >
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <legend className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest my-5">
                5. Presiones
              </legend>

              <TirePressureSection
                tirePressures={formData.tire_pressures}
                setFormData={setFormData}
              />
            </div>
          </fieldset>

          {/**Seccion de las observaciones */}
          <fieldset
            className={`mt-2 transition-all duration-500 ${selectedTemplate && formData.vehicle.placa ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}
          >
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <legend className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest my-5">
                6. Observaciones Adicionales
              </legend>

              <div className="bg-transparent p-1">
                <Textarea
                  placeholder="Escriba aquí detalles relevantes sobre el estado del vehículo, hallazgos específicos o notas de la inspección..."
                  className="min-h-30 resize-none border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus-visible:ring-blue-500 text-sm leading-relaxed"
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      observaciones: e.target.value,
                    }))
                  }
                />
                <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 italic font-medium">
                  * Estas observaciones quedarán registradas en el reporte final
                  de la orden de entrada.
                </p>
              </div>
            </div>
          </fieldset>

          {/**SECCION DE LAS CONDICIONES A CUMPLIR */}
          <ConditionsSwitchSections
            conditions={selectedTemplate?.conditions}
            results={formData.condition_results}
            setFormData={setFormData}
            selectedTemplate={selectedTemplate ? true : false}
            hayPlaca={formData.vehicle.placa ? true : false}
          />

          {/**SECCION DE LAS FIRMAS */}
          <SignatureSection
            key={signatureKey}
            signatures={selectedTemplate?.signatures}
            contractText={selectedTemplate?.base_contract_text}
            setFormData={setFormData}
            selectedTemplate={selectedTemplate ? true : false}
            hayPlaca={formData.vehicle.placa ? true : false}
            formData={formData}
          />

          {/**SECCION finalizado de la orden de entrada */}
          <fieldset
            className={`mt-2 transition-all duration-500 ${selectedTemplate && formData.vehicle.placa ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}
          >
            <div className="flex flex-col items-center justify-center p-6 sm:p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/20">
              <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-full mb-4">
                <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="text-center max-w-md mb-8">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 uppercase tracking-tight">
                  Finalizar Registro de Orden
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Asegúrese de que todos los datos hayan sido capturados
                  correctamente antes de proceder.
                </p>
              </div>

              {/* EL BOTÓN CORREGIDO */}
              <Button
                type="submit"
                className="group relative h-16 sm:h-20 w-full max-w-xl bg-slate-900 hover:bg-emerald-600 dark:bg-slate-50 dark:hover:bg-emerald-600 text-white dark:text-slate-950 dark:hover:text-white rounded-2xl shadow-xl transition-all duration-500 hover:scale-[1.01] active:scale-[0.98] overflow-hidden px-4"
              >
                {/* Efecto Shimmer mejorado */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

                <div className="flex items-center justify-between w-full sm:justify-center sm:gap-6">
                  {/* Texto con ajuste de tamaño responsivo */}
                  <span className="text-sm sm:text-lg md:text-xl font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] truncate">
                    {isSubmitting ? "Procesando..." : "Crear Orden de Entrada"}
                  </span>

                  {/* Contenedor del icono con espacio reservado para la animación */}
                  <div className="shrink-0 bg-white/10 dark:bg-slate-950/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors ml-2">
                    <SendHorizontal className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </Button>

              {/* COMPONENTE DEL DIALOG INVOCADO */}
              <ZodErrorDialog
                isOpen={showErrorDialog}
                setIsOpen={setShowErrorDialog}
                errors={serverError}
              />

              {/* Metadata inferior responsiva */}
              <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-8 text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <div className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  ISO 17020 COMPLIANT
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <div className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  ALMACENAMIENTO EN TIEMPO REAL
                </span>
              </div>
            </div>
          </fieldset>
        </div>
      </form>

      {/* 🔥 EL DIÁLOGO CONTROLADO POR ESTADO */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Orden de Entrada Creada!</AlertDialogTitle>
            <AlertDialogDescription>
              La orden de ingreso para el vehículo se ha registrado con éxito en
              el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* Al dar click en Continuar, cerramos el modal cambiando el estado a false */}
            <AlertDialogAction
              onClick={() => {
                setShowSuccessDialog(false); // Cierra el modal

                // 🔥 Sube al principio de la página justo al hacer click
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
