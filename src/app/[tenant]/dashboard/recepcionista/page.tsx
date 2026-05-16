"use client";

import { useState, useContext, ReactNode } from "react";
import { ReceptionistContext } from "@/features/dashboard/ReceptionistLoaderContex";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Icons
import {
  FileCheck,
  RefreshCcw,
  CheckCircle2,
  FileText,
  Car,
  ClipboardCheck,
  ShieldCheck,
  CalendarDays,
  Hash,
  Search,
  Globe,
  Check,
  X,
  Shield,
  GraduationCap,
  SendHorizontal,

} from "lucide-react";
import { PermissionsContext } from "@/features/dashboard/PermissionsLoaderContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TirePressureSection from "@/features/dashboard/TirePressureSection";
import ConditionsSwitchSections from "@/features/dashboard/ConditionsSwitchSections";
import SignatureSection from "@/features/dashboard/SignatureSection";
import { PersonSection } from "@/features/dashboard/PersonSection";
import { Textarea } from "@/components/ui/textarea";

import {ClaseVehiculoType, CombustibleType, ServiceType, ZodFullFormDataType} from "@/lib/zod-schemas/order-schema";
import { createOrderAction } from "@/lib/server_actions/createOrderAction";
import { ZodErrorDialog } from "@/features/dashboard/ZodErrorDialog";
import { $ZodIssue } from "zod/v4/core";




// El tipo ServiceType es: "rtm" | "preventiva" | "peritaje"
interface ServiceOption {
  id: ServiceType;
  label: string;
  desc: string;
  icon: ReactNode;
}

interface CombustibleOption {
  value: CombustibleType;
  label: string;
}

interface ClaseOption {
  value: ClaseVehiculoType;
  label: string;
}


const SERVICE_TYPES: ServiceOption[] = [
  {
    id: "rtm",
    label: "REVISIÓN TÉCNICO MECÁNICA",
    desc: "Normatividad vigente",
    icon: <ClipboardCheck className="h-5 w-5 text-blue-600" />,
  },
  {
    id: "preventiva",
    label: "PREVENTIVA",
    desc: "Control de seguridad",
    icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
  },
  {
    id: "peritaje",
    label: "PERITAJE",
    desc: "Valoración comercial",
    icon: <Search className="h-5 w-5 text-purple-600" />,
  },
];


export const FUEL_OPTIONS: CombustibleOption[] = [
  { value: "gasolina", label: "Gasolina" },
  { value: "gas_natural_vehicular", label: "Gas Natural Vehicular" },
  { value: "diesel", label: "Diesel" },
  { value: "gas_gasolina", label: "Gas-Gasolina" },
  { value: "hibrido", label: "Híbrido" },
  { value: "electrico", label: "Eléctrico" },
  { value: "etanol", label: "Etanol" },
  { value: "biodiesel", label: "Biodiesel" },
  { value: "hidrogeno", label: "Hidrógeno" },
];


export const CLASE_OPTIONS: ClaseOption[] = [
  { value: "automovil", label: "Automóvil" },
  { value: "bus", label: "Bus" },
  { value: "buseta", label: "Buseta" },
  { value: "camion", label: "Camión" },
  { value: "camioneta", label: "Camioneta" },
  { value: "campero", label: "Campero" },
  { value: "microbus", label: "Microbús" },
  { value: "tractocamion", label: "Tractocamión" },
  { value: "motocicleta", label: "Motocicleta" },
  { value: "motocarro", label: "Motocarro" },
  { value: "mototriciclo", label: "Mototriciclo" },
  { value: "cuatrimoto", label: "Cuatrimoto" },
  { value: "remolque", label: "Remolque" },
  { value: "semiremolque", label: "Semirremolque" },
  { value: "volqueta", label: "Volqueta" },
  { value: "sin_clase", label: "Sin Clase" },
  { value: "maquinaria_construccion_o_minera", label: "Maquinaria de Construcción o Minera" },
  { value: "ciclomotor", label: "Ciclomotor" },
  { value: "tricimoto", label: "Tricimoto" },
  { value: "cuadriciclo", label: "Cuadriciclo" },
];

//FUNCION GENERICA PARA EXTRAER ICONOS CON COLORES PERZONALIZADOS
const getTemplateIcon = (index: number) => {
  const icons = [
    <Car key="car" className="h-5 w-5 text-blue-500" />,
    <ClipboardCheck key="clip" className="h-5 w-5 text-indigo-500" />,
    <ShieldCheck key="shield" className="h-5 w-5 text-slate-500" />,
    <FileText key="file" className="h-5 w-5 text-emerald-500" />,
  ];
  return icons[index % icons.length];
};





export default function NewEntryOrder() {



  const ReceptionistContextReceived = useContext(ReceptionistContext);
  const PermissionsContextReceived = useContext(PermissionsContext);

  const templateTableData = ReceptionistContextReceived?.ReceptionistContextValue.templateTableData;

  //FILTRADO DE LOS TEMPLATES: De los que se reciben desde el context
  const activeTemplates = templateTableData?.query.data?.filter((t) => t.is_active) || [];



  // Estados para controlar el Dialog de errores
  const [showErrorDialog, setShowErrorDialog] = useState(false);
// Estado local para el cargando (reemplaza a isPending de useActionState)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<$ZodIssue[] | null>(null);


  //STATE PRINCIPAL DEL FORMULARIO
  const [formData, setFormData] = useState<ZodFullFormDataType>({
    // --- DATOS DE CONTROL Y LLAVES EXTERNAS ---
    tenant_id:
      PermissionsContextReceived?.PermissionsContextValue.tenantObject?.id ||
      "",
    funcionario_id:
      PermissionsContextReceived?.PermissionsContextValue.user?.id || "",
    plantilla_id: "",

    // --- DATOS DINÁMICOS DE LA ORDEN (Snapshots) ---
    // Estos datos cambian en cada inspección y deben quedar congelados en entry_orders
    kilometraje: "",
    es_reinspeccion: false,
    service_type: "rtm", // Default según tu enum
    estado_orden: "abierta",
    observaciones: "",
    soat_vencimiento_snapshot: "",
    gas_numero_snapshot: "",
    gas_vencimiento_snapshot: "",
    texto_contractual_snapshot: "",

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
        posicion: "izquierda",
        presion_encontrada: "",
        presion_ajustada: "",
        _requiere_ajuste: false,
      },
      {
        eje: 1,
        posicion: "derecha",
        presion_encontrada: "",
        presion_ajustada: "",
        _requiere_ajuste: false,
      },
      {
        eje: 2,
        posicion: "izquierda",
        presion_encontrada: "",
        presion_ajustada: "",
        _requiere_ajuste: false,
      },
      {
        eje: 2,
        posicion: "derecha",
        presion_encontrada: "",
        presion_ajustada: "",
        _requiere_ajuste: false,
      },
    ] ,
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







const fillMockData = () => {
  setFormData(MOCK_DATA as ZodFullFormDataType);
  console.log("Formulario precargado con éxito");
};



const MOCK_DATA = {
  tenant_id: "aaaaaaaa-0000-0000-0000-000000000001",
  funcionario_id: "6800852e-2312-454c-aed8-6cfdc0feca47",
  plantilla_id: "2290a44a-b947-403c-8010-4dd63e28f02c",
  kilometraje: "25336",
  es_reinspeccion: false,
  service_type: "rtm",
  estado_orden: "abierta",
  observaciones: "",
  soat_vencimiento_snapshot: "2026-03-12",
  gas_numero_snapshot: "123456",
  gas_vencimiento_snapshot: "2026-05-13",
  texto_contractual_snapshot: "condicones para la plantilla que debe de enter algo",
  vehicle: {
    id: null,
    placa: "HDC05",
    marca: "SUZUKI",
    linea: "GN-125",
    modelo: "2026",
    color: "ROJO",
    tipo_vehiculo: "motocicleta_4t",
    clase: "motocicleta",
    combustible: "",
    cilindrada: "125",
    blindaje: false,
    capacidad_pasajeros: "2",
    es_ensenanza: true,
    tipo_servicio_vehiculo: "particular",
    propietario_actual_id: null,
    es_extranjero: false,
  },
 
  tire_pressures: [
    { eje: 1, posicion: "centro", presion_encontrada: "30", presion_ajustada: "", _requiere_ajuste: false },
    { eje: 2, posicion: "centro", presion_encontrada: "36", presion_ajustada: "30", _requiere_ajuste: true }
  ],
  condition_results: [
    { template_condition_id: "026eaa3d-50e3-449e-b91d-4d0e988c009a", value: "cumple" }
  ],
  signatures: [
    {
      template_signature_id: "c9711272-1b15-43eb-a0f9-55caa041a40a",
      representative_type: "cliente",
      signature_url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..." // Tu base64 aquí
    }
  ],
  customer_data: {
    id: null,
    tipo_documento: "cedula_ciudadania",
    numero_documento: "1053782464",
    nombre_completo: "JUAN CAMILO PATIÑO ARISTIZABAL",
    telefono: "3215224586",
    correo: "SPJHONGMAIL.COM",
    direccion: "Carrera 25 #17-66"
  },
  owner_data: {
    id: null,
    tipo_documento: "cedula_ciudadania",
    numero_documento: "1053782464",
    nombre_completo: "JUAN CAMILO PATIÑO ARISTIZABAL",
    telefono: "3215224586",
    correo: "SPJHON@GMAIL.COM",
    direccion: "Carrera 25 #17-66"
  },
  is_owner_same_as_customer: true
};





















  //TEMPLATE SELECCIONADO DE ENTRE LOS ACTIVOS: Seleccionar cual de los activos esta tambien seleccionado, se utiliza para saber si renderizar o no el contenido
  const selectedTemplate = activeTemplates.find(
    (t) => t.id === formData.plantilla_id,
  );

  //STATES DEL CUADRO DE DIALOGO
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempPlaca, setTempPlaca] = useState("");






  // MANEJADOR DE SELECCIÓN DE PLANTILLA
  const handleTemplateSelect = (id: string, checked: boolean) => {
    // 1. Buscamos la plantilla completa en el array de activas
    const template = activeTemplates.find((t) => t.id === id);

    setFormData((prev) => {
      // 2. Preparamos los resultados iniciales de condiciones
      const initialConditionResults =
        checked && template?.conditions
          ? template.conditions.map((cond) => ({
              template_condition_id: cond.id,
              value: cond.default_value,
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
  };





  //MANEJADOR DEL SELECT DEL SERVICE TYPE
  const handleServiceTypeChange = (type: ServiceType) => {
    setFormData((prev) => ({ ...prev, service_type: type }));
  };

  // MANEJADORES DEL CUADRO DE DIALOGO

  //abrir cuadro de dialogo
  const handleOpenDialog = () => {
    setTempPlaca(formData.vehicle.placa);
    setDialogOpen(true);
  };

  //Boton cancelar del cuadro de dialogo
  const handleCancelar = () => {
    setTempPlaca("");
    setDialogOpen(false);
  };

  //Funcion para buscar la placa saleccionada
  const handleBuscarPlaca = () => {
    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle, // Mantenemos los demás datos del vehículo (id, marca, etc.)
        placa: tempPlaca.toUpperCase(), // Actualizamos solo la placa
      },
    }));
    setDialogOpen(false);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setServerError(null);

    if (formData.vehicle.placa === "") {
      alert("No hay placa selecionada");
      setIsSubmitting(false);
      return;
    }

    try {
      // Llamas a la Server Action directamente pasándole el objeto
      const { data, error } = await createOrderAction(formData);

      if (error || !data) {
        setServerError(error);
        setShowErrorDialog(true);
        return; // Detenemos la ejecución aquí
      } else {
        // Éxito: Redirigir o limpiar formulario
        alert(data);
      }
    } catch (error: unknown) {
      alert("Ocurrio un error inesperado en la validacion: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };






  //MANEJADOR DEL BOTON DEL RUNT
  const handleRuntQuery = () => {
    // Lógica para consultar RUNT con la placa seleccionada
    console.log("Consultando RUNT para:", formData.vehicle.placa);
  };

  // MANEJADOR DE REINSPECCIÓN
  const handleReinspeccionChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      es_reinspeccion: checked,
    }));
  };









  return (
    <form onSubmit={handleSubmit} className="p-8 mx-auto space-y-8">



<div className="flex justify-end mb-4">
    <button
      type="button"
      onClick={fillMockData}
      className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded shadow-lg transition-all text-xs"
    >
      ⚡ CARGAR PRUEBA (HDC05)
    </button>
  </div>




      {/**TITULO SUPERIOR */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Nueva Orden de Entrada
        </h1>
        <p className="text-slate-500">
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
              className="bg-blue-50 text-blue-700 border-blue-100 animate-pulse gap-1.5 px-3 py-1"
            >
              <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
              Sincronizando base de datos...
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 gap-1.5 px-3 py-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Plantillas Actualizadas
            </Badge>
          )}
        </div>



        {/**SECCION DE SELECCION DE PLANTILLA */}
        <fieldset>
          <legend className="text-xs font-bold uppercase text-slate-400 tracking-widest my-5">
            1. Selección de Plantilla Técnica
          </legend>
          <div className="flex flex-wrap gap-3">
            {activeTemplates.map((template, index) => (
              <Label
                key={template.id}
                className={`group relative flex flex-col gap-3 rounded-xl border p-4 cursor-pointer transition-all hover:border-slate-300 hover:bg-slate-50/50 ${
                  formData.plantilla_id === template.id
                    ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600"
                    : "border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="p-2 bg-white border rounded-lg shadow-sm group-hover:border-blue-200">
                    {getTemplateIcon(index)}
                  </div>
                  {/*#a11 ACTION */}
                  <Checkbox
                    checked={formData.plantilla_id === template.id}
                    onCheckedChange={(checked) =>
                      handleTemplateSelect(template.id, checked === true)
                    }
                    className="h-5 w-5 ml-4 rounded-full border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    {template.template_name}
                  </p>
                  <div className="flex flex-wrap gap-y-1 gap-x-3 pt-1">
                    <span className="flex items-center text-[11px] text-slate-500 gap-1">
                      <Hash className="h-3 w-3" /> Cod: {template.document_code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Version: {template.version}
                    </span>
                  </div>
                </div>
              </Label>
            ))}
          </div>
        </fieldset>


        {/**SECCION DE BUSQUEDA DE PLACA */}
        <fieldset
          className={`mt-2 transition-all duration-500 ${selectedTemplate ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}
        >
          <div className="border-t pt-6">
            <legend className="text-xs font-bold uppercase text-slate-400 tracking-widest my-5">
              2. Datos del Servicio
            </legend>

            <div className="bg-slate-50/80 border rounded-xl p-6 space-y-8">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${selectedTemplate ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-200 text-slate-400"}`}
                >
                  <FileCheck className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">
                    {selectedTemplate
                      ? selectedTemplate.template_name
                      : "Formulario de Inspección"}
                  </h2>
                  <p className="text-sm text-slate-500 font-mono mt-1 flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5" />{" "}
                    {selectedTemplate
                      ? `DOCUMENTO: ${selectedTemplate.document_code}`
                      : "Seleccione una plantilla"}
                  </p>
                </div>
              </div>

              {/**SECCION DE SELECCION DEL TIPO DE SERVICIO */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                    Tipo de Inspección
                  </span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SERVICE_TYPES.map((tipo) => (
                    <Label
                      key={tipo.id}
                      className={`group relative flex flex-col gap-3 rounded-xl border p-4 cursor-pointer transition-all bg-white hover:border-blue-300 ${formData.service_type === tipo.id ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" : "border-slate-200"}`}
                    >
                      <div className="flex justify-between items-center">
                        <div
                          className={`p-2 border rounded-lg ${formData.service_type === tipo.id ? "bg-white border-blue-100" : "bg-slate-50 border-slate-100"}`}
                        >
                          {tipo.icon}
                        </div>
                        {/*#a11 ACTION */}
                        <Checkbox
                          checked={formData.service_type === tipo.id}
                          onCheckedChange={() =>
                            handleServiceTypeChange(tipo.id)
                          }
                          className="h-5 w-5 rounded-full border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 ml-4"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-slate-800 uppercase">
                          {tipo.label}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {tipo.desc}
                        </p>
                      </div>
                    </Label>
                  ))}
                </div>
              </div>

              {/**SECCIÓN DE REINSPECCIÓN */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                    Tipo de Orden
                  </span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      id: "nueva",
                      label: "NUEVA INSPECCIÓN",
                      desc: "Inspección inicial del vehículo",
                      icon: <FileCheck className="h-5 w-5 text-blue-600" />,
                    },
                    {
                      id: "reinspeccion",
                      label: "REINSPECCIÓN",
                      desc: "Revisión posterior a hallazgos",
                      icon: <RefreshCcw className="h-5 w-5 text-amber-600" />,
                    },
                  ].map((tipo) => (
                    <Label
                      key={tipo.id}
                      className={`group relative flex flex-col gap-3 rounded-xl border p-4 cursor-pointer transition-all bg-white hover:border-blue-300 ${
                        (tipo.id === "reinspeccion" &&
                          formData.es_reinspeccion) ||
                        (tipo.id === "nueva" && !formData.es_reinspeccion)
                          ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div
                          className={`p-2 border rounded-lg ${
                            (tipo.id === "reinspeccion" &&
                              formData.es_reinspeccion) ||
                            (tipo.id === "nueva" && !formData.es_reinspeccion)
                              ? "bg-white border-blue-100"
                              : "bg-slate-50 border-slate-100"
                          }`}
                        >
                          {tipo.icon}
                        </div>
                        {/*#a11 ACTION */}
                        <Checkbox
                          checked={
                            tipo.id === "reinspeccion"
                              ? formData.es_reinspeccion
                              : !formData.es_reinspeccion
                          }
                          onCheckedChange={() =>
                            handleReinspeccionChange(tipo.id === "reinspeccion")
                          }
                          className="h-5 w-5 rounded-full border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 ml-4"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-slate-800 uppercase">
                          {tipo.label}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {tipo.desc}
                        </p>
                      </div>
                    </Label>
                  ))}
                </div>
              </div>

              {/* SECCIÓN: Placa del Vehículo */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Botón BUSCAR PLACA */}
                  <div className="md:col-span-8">
                    {/*#a11 ACTION */}
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger
                        render={
                          <Button
                            type="button"
                            onClick={handleOpenDialog}
                            className="w-full h-16 gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-200 text-lg"
                          >
                            <Search className="h-6 w-6" />
                            BUSCAR PLACA
                          </Button>
                        }
                      />

                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-slate-500" />
                            Buscar Vehículo
                          </DialogTitle>
                          <DialogDescription>
                            Ingresa la placa del vehículo para cargar sus datos.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="dialog-placa"
                              className="text-sm font-bold text-slate-700"
                            >
                              Ingresar Placa
                            </Label>
                            {/*#a11 ACTION */}
                            <Input
                            required
                              id="dialog-placa"
                              value={tempPlaca}
                              onChange={(e) =>
                                setTempPlaca(e.target.value.toUpperCase())
                              }
                              placeholder="ABC123"
                              className="h-14 uppercase font-black text-3xl border-slate-300 tracking-[0.2em] bg-white text-center"
                              maxLength={7}
                              autoFocus
                            />
                          </div>
                        </div>

                        <DialogFooter className="gap-3 sm:gap-0">
                          {/*#a11 ACTION */}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelar}
                            className="flex-1 gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancelar
                          </Button>
                          {/*#a11 ACTION */}
                          <Button
                            type="button"
                            onClick={handleBuscarPlaca}
                            className="flex-1 gap-2 bg-slate-900 hover:bg-slate-800"
                          >
                            <Check className="h-4 w-4" />
                            Buscar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Botón ACTUALIZAR DATOS RUNT */}
                  <div className="md:col-span-4">
                    {/*#a11 ACTION */}
                    <Button
                      type="button"
                      onClick={handleRuntQuery}
                      disabled={!formData.vehicle.placa}
                      className={`
                        w-full h-16 gap-2 font-bold rounded-xl transition-all active:scale-95 text-lg
                        ${
                          formData.vehicle.placa
                            ? "bg-[#f57c00] hover:bg-[#e65100] text-white shadow-lg shadow-orange-100 cursor-pointer"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                        }
                      `}
                    >
                      <Globe className="h-5 w-5" />
                      <span className="hidden md:inline">ACTUALIZAR DATOS</span>
                      <span className="md:hidden">RUNT</span>
                    </Button>
                  </div>
                </div>

                {/* Indicador de placa seleccionada */}
                <div
                  className={`
                    flex items-center justify-center gap-3 rounded-xl border-2 p-4 transition-all
                    ${
                      formData.vehicle.placa
                        ? "border-blue-200 bg-blue-50/50"
                        : "border-dashed border-slate-300 bg-slate-50"
                    }
                  `}
                >
                  {formData.vehicle.placa ? (
                    <>
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-100">
                        <Check className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                          Placa Seleccionada
                        </p>
                        <p className="text-2xl font-black text-slate-900 tracking-[0.15em] uppercase">
                          {formData.vehicle.placa}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                        <Search className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-500">
                          No hay placa seleccionada
                        </p>
                        <p className="text-xs text-slate-400">
                          Haz clic en Buscar Placa para comenzar
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </fieldset>


        {/**SECCION DE LAS PERSONAS */}
        <PersonSection formData={formData} setFormData={setFormData} selectedTemplate={selectedTemplate?true:false} hayPlaca={formData.vehicle.placa?true:false}/>


        {/**SECCION DE DATOS DEL VEHICULO */}
        <fieldset
          className={`mt-2 transition-all duration-500 ${selectedTemplate && formData.vehicle.placa ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}
         >
          <div className="border-t pt-6">
            <legend className="text-xs font-bold uppercase text-slate-400 tracking-widest my-5">
              4. Datos del vehiculo
            </legend>

            <div className="bg-slate-50/80 border rounded-xl p-6 space-y-10">
              {/* GRUPO 3.1: Identificación Básica */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Identificación del Vehículo
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Marca</Label>
                    {/*#a11 ACTION */}
                    <Input
                    required
                      placeholder="Ej: Chevrolet"
                      value={formData.vehicle.marca}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicle: {
                            ...prev.vehicle,
                            marca: e.target.value.toUpperCase(),
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Línea</Label>
                    {/*#a11 ACTION */}
                    <Input
                      placeholder="Ej: Spark GT"
                      value={formData.vehicle.linea}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicle: {
                            ...prev.vehicle,
                            linea: e.target.value.toUpperCase(),
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Modelo (Año)
                    </Label>
                    {/*#a11 ACTION */}
                    <Input
                      type="number"
                      min={1900}
                      placeholder="Ej: 2026"
                      value={formData.vehicle.modelo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicle: { 
                            ...prev.vehicle, 
                            modelo: e.target.value 
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Color</Label>
                    {/*#a11 ACTION */}
                    <Input
                      placeholder="Ej: Blanco Galaxia"
                      value={formData.vehicle.color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicle: {
                            ...prev.vehicle,
                            color: e.target.value.toUpperCase(),
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* GRUPO 3.2: Especificaciones Técnicas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Especificaciones Técnicas
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Cilindrada (cc)
                    </Label>
                    {/*#a11 ACTION */}
                    <Input
                      type="number"
                      min={0}
                      placeholder="Ej: 1600"
                      value={formData.vehicle.cilindrada}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicle: {
                            ...prev.vehicle,
                            cilindrada: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Capacidad Pasajeros
                    </Label>
                    {/*#a11 ACTION */}
                    <Input
                      type="number"
                      min={0}
                      placeholder="Ej: 5"
                      value={formData.vehicle.capacidad_pasajeros}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicle: {
                            ...prev.vehicle,
                            capacidad_pasajeros: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Combustible</Label>

                    <Select
                    items={FUEL_OPTIONS}
                      value={formData.vehicle.combustible}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicle: {
                            ...prev.vehicle,
                            combustible: value?value:"gasolina",
                          },
                        }))
                      }
                     >
                      <SelectTrigger className="h-10 w-full bg-background text-left">
                        <SelectValue placeholder="Selecciona combustible" />
                      </SelectTrigger>

                      <SelectContent>
                        
                        
                        {/* Mapeo dinámico */}
                        {FUEL_OPTIONS.map((opcion) => (
                          <SelectItem key={opcion.value} value={opcion.value}>
                            {opcion.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Clase de Vehículo
                    </Label>

                    <Select
                    items={CLASE_OPTIONS}
                      value={formData.vehicle.clase}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicle: {
                            ...prev.vehicle,
                            clase: value?value:"automovil",
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 w-full bg-background text-left">
                        <SelectValue placeholder="Selecciona una clase" />
                      </SelectTrigger>

                      <SelectContent>
                       
                        
                        {CLASE_OPTIONS.map((opcion) => (
                          <SelectItem key={opcion.value} value={opcion.value}>
                            {opcion.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Tipo de Vehículo
                    </Label>
                    {/*#a11 ACTION */}
                    <Select
                      value={formData.vehicle.tipo_vehiculo}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicle: {
                            ...prev.vehicle,
                            tipo_vehiculo: value?value:"",
                          },
                        }))
                      }
                      items={[
                        
                        { label: "Liviano", value: "liviano" },
                        { label: "Pesado", value: "pesado" },
                        { label: "Moto 4T", value: "motocicleta_4t" },
                        { label: "Moto 2T", value: "motocicleta_2t" },
                        { label: "Motocarro 4T", value: "motocarro_4t" },
                        { label: "Motocarro 2T", value: "motocarro_2t" },
                      ]}
                    >
                      <SelectTrigger className="h-10 bg-background w-full">
                        <SelectValue placeholder="Selecciona un tipo"/>
                      </SelectTrigger>

                      <SelectContent>
                       
                        <SelectItem value="liviano">Liviano</SelectItem>
                        <SelectItem value="pesado">Pesado</SelectItem>
                        <SelectItem value="motocicleta_4t">Moto 4T</SelectItem>
                        <SelectItem value="motocicleta_2t">Moto 2T</SelectItem>
                        <SelectItem value="motocarro_4t">
                          Motocarro 4T
                        </SelectItem>
                        <SelectItem value="motocarro_2t">
                          Motocarro 2T
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Tipo de Servicio
                    </Label>

                    <Select
                      value={formData.vehicle.tipo_servicio_vehiculo}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicle: {
                            ...prev.vehicle,
                            tipo_servicio_vehiculo: value?value:"particular",
                          },
                        }))
                      }
                      items={[
                       
                        { label: "Particular", value: "particular" },
                        { label: "Enseñanza", value: "ensenanza" },
                        { label: "Oficial", value: "oficial" },
                        { label: "Público", value: "publico" },
                        { label: "Diplomático", value: "diplomatico" },
                        { label: "Especial", value: "especial" },
                      ]}
                    >
                      <SelectTrigger className="h-10 w-full bg-background">
                        <SelectValue placeholder="Selecciona tipo de servicio" />
                      </SelectTrigger>

                      <SelectContent>
                        
                        <SelectItem value="particular">Particular</SelectItem>
                        <SelectItem value="ensenanza">Enseñanza</SelectItem>
                        <SelectItem value="oficial">Oficial</SelectItem>
                        <SelectItem value="publico">Público</SelectItem>
                        <SelectItem value="diplomatico">Diplomático</SelectItem>
                        <SelectItem value="especial">Especial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* GRUPO 3.3: Snapshots Legales (SOAT y GAS) */}
              <div className="pt-4 border-t border-slate-200">
                <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Documentación y Snapshots de Ley
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" /> Vencimiento
                        SOAT
                      </Label>
                      {/*#a11 ACTION */}
                      <Input
                        type="date"
                        className="border-blue-100 focus:ring-blue-500"
                        value={formData.soat_vencimiento_snapshot || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            soat_vencimiento_snapshot: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" /> Número Certificado Gas
                      </Label>
                      {/*#a11 ACTION */}
                      <Input
                        placeholder="N° de certificado"
                        className="border-emerald-100 focus:ring-emerald-500"
                        value={formData.gas_numero_snapshot}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            gas_numero_snapshot: e.target.value.toUpperCase(),
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" /> Vencimiento Gas
                      </Label>
                      {/*#a11 ACTION */}
                      <Input
                        type="date"
                        className="border-emerald-100 focus:ring-emerald-500"
                        value={formData.gas_vencimiento_snapshot || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            gas_vencimiento_snapshot: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">
                      Kilometraje Actual -Km-
                    </Label>
                    {/*#a11 ACTION */}
                    <Input
                    min={0}
                      type="number"
                      placeholder="000000"
                      className="h-12 text-lg font-mono font-bold"
                      value={formData.kilometraje}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          kilometraje: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes de Estado Especial */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                    Estado Especial
                  </span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: "blindaje",
                      label: "VEHÍCULO BLINDADO",
                      desc: "Protección balística",
                      icon: <Shield className="h-5 w-5 text-amber-600" />,
                      checked: formData.vehicle.blindaje,
                      field: "blindaje" as const,
                    },
                    {
                      id: "ensenanza",
                      label: "VEHÍCULO DE ENSEÑANZA",
                      desc: "Escuelas de conducción",
                      icon: (
                        <GraduationCap className="h-5 w-5 text-emerald-600" />
                      ),
                      checked: formData.vehicle.es_ensenanza,
                      field: "es_ensenanza" as const,
                    },
                    {
                      id: "extranjero",
                      label: "VEHÍCULO EXTRANJERO",
                      desc: "Placa o registro de otro país",
                      icon: <Globe className="h-5 w-5 text-purple-600" />,
                      checked: formData.vehicle.es_extranjero,
                      field: "es_extranjero" as const,
                    },
                  ].map((item) => (
                    <Label
                      key={item.id}
                      className={`group relative flex flex-col gap-3 rounded-xl border p-4 cursor-pointer transition-all bg-white hover:border-blue-300 ${
                        item.checked
                          ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div
                          className={`p-2 border rounded-lg transition-colors ${
                            item.checked
                              ? "bg-white border-blue-100"
                              : "bg-slate-50 border-slate-100"
                          }`}
                        >
                          {item.icon}
                        </div>
                        {/*#a11 ACTION */}
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              vehicle: {
                                ...prev.vehicle,
                                [item.field]: !!checked,
                              },
                            }))
                          }
                          className="h-5 w-5 rounded-full border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 ml-4"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-slate-800 uppercase leading-tight">
                          {item.label}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </Label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </fieldset>



        {/**SECCION DE LAS PRESIONES DEL VEHICULO */}
        <fieldset
          className={`mt-2 transition-all duration-500 ${selectedTemplate && formData.vehicle.placa ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}
         >
          <div className="border-t pt-6">
            <legend className="text-xs font-bold uppercase text-slate-400 tracking-widest my-5">
              5. Presiones
            </legend>

            <TirePressureSection
              tirePressures={formData.tire_pressures}
              setFormData={setFormData}
            />
          </div>
        </fieldset>



        {/**Seccion de las observaciones */}
        <fieldset className={`mt-2 transition-all duration-500 ${selectedTemplate && formData.vehicle.placa ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}>
          <div className="border-t border-slate-100 pt-6">
            <legend className="text-xs font-bold uppercase text-slate-400 tracking-widest my-5">
              
              6. Observaciones Adicionales
            </legend>

            <div className="bg-white p-1">
              <Textarea
                placeholder="Escriba aquí detalles relevantes sobre el estado del vehículo, hallazgos específicos o notas de la inspección..."
                className="min-h-30 resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-400 text-sm leading-relaxed"
                value={formData.observaciones}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, observaciones: e.target.value }))
                }
              />
              <p className="mt-2 text-[10px] text-slate-400 italic font-medium">
                * Estas observaciones quedarán registradas en el reporte final de la orden de entrada.
              </p>
            </div>
          </div>
        </fieldset>

        {/**SECCION DE LAS CONDICIONES A CUMPLIR */}
        <ConditionsSwitchSections
          conditions={selectedTemplate?.conditions}
          results={formData.condition_results}
          setFormData={setFormData}
          selectedTemplate={selectedTemplate?true:false}
          hayPlaca={formData.vehicle.placa?true:false}
        />

        {/**SECCION DE LAS FIRMAS */}

        <SignatureSection
          signatures={selectedTemplate?.signatures}
          contractText={selectedTemplate?.base_contract_text}
          setFormData={setFormData}
          selectedTemplate={selectedTemplate?true:false}
          hayPlaca={formData.vehicle.placa?true:false}
        />


<fieldset className={`mt-2 transition-all duration-500 ${selectedTemplate && formData.vehicle.placa ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}>
  <div className="flex flex-col items-center justify-center p-6 sm:p-10 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
    <div className="p-3 bg-blue-100 rounded-full mb-4">
      <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
    </div>
    
    <div className="text-center max-w-md mb-8">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">
        Finalizar Registro de Orden
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-2">
        Asegúrese de que todos los datos hayan sido capturados correctamente antes de proceder.
      </p>
    </div>

    {/* EL BOTÓN CORREGIDO */}
    <Button 
      type="submit"
      className="group relative h-16 sm:h-20 w-full max-w-xl bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl shadow-xl transition-all duration-500 hover:scale-[1.01] active:scale-[0.98] overflow-hidden px-4"
    >
      {/* Efecto Shimmer mejorado */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
      
      <div className="flex items-center justify-between w-full sm:justify-center sm:gap-6">
        {/* Texto con ajuste de tamaño responsivo */}
        <span className="text-sm sm:text-lg md:text-xl font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] truncate">
          {isSubmitting ? "Procesando..." : "Crear Orden de Entrada"}
        </span>
        
        {/* Contenedor del icono con espacio reservado para la animación */}
        <div className="shrink-0 bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors ml-2">
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
    <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-8 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
      <span className="flex items-center gap-1.5 whitespace-nowrap">
        <div className="h-1 w-1 bg-slate-300 rounded-full" />
        ISO 17020 COMPLIANT
      </span>
      <span className="flex items-center gap-1.5 whitespace-nowrap">
        <div className="h-1 w-1 bg-slate-300 rounded-full" />
        ALMACENAMIENTO EN TIEMPO REAL
      </span>
    </div>
  </div>
</fieldset>



      </div>






    </form>

  );
}
