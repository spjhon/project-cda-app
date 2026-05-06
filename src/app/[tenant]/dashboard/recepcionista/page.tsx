"use client";

import { useState, useContext } from "react";
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
  X
} from "lucide-react";
import { PermissionsContext } from "@/features/dashboard/PermissionsLoaderContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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



type TipoVehiculo =
  | "liviano"
  | "pesado"
  | "motocicleta_4t"
  | "motocicleta_2t"
  | "motocarro_4t"
  | "motocarro_2t"
  | null;

type ClaseVehiculo =
  | null
  | "AUTOMÓVIL"
  | "BUS"
  | "BUSETA"
  | "CAMIÓN"
  | "CAMIONETA"
  | "CAMPERO"
  | "MICROBÚS"
  | "TRACTOCAMIÓN"
  | "VOLQUETA"
  | "MOTOCICLETA"
  | "MAQUINARIA AGRÍCOLA"
  | "MAQUINARIA INDUSTRIAL"
  | "SEMIRREMOLQUE"
  | "MOTOCARRO"
  | "REMOLQUE"
  | "SIN CLASE"
  | "MOTOTRICICLO"
  | "CUADRIMOTO"
  | "CICLOMOTOR"
  | "TRICIMOTO"
  | "CUADRICICLO"
  | "MAQUINARIA DE CONSTRUCCIÓN O MINERA"
  | "TRICIMÓVIL";


type Combustible =
  | null
  | "GASOLINA"
  | "GAS NATURAL VEHICULAR"
  | "DIESEL"
  | "GAS-GASOLINA"
  | "HÍBRIDO"
  | "ELÉCTRICO"
  | "ETANOL"
  | "BIODIESEL"
  | "HIDRÓGENO";


type TipoServicioVehiculo =
  | null
  | "PARTICULAR"
  | "ENSEÑANZA"
  | "OFICIAL"
  | "PUBLICO"
  | "DIPLOMATICO"
  | "ESPECIAL";

export default function NewEntryOrder() {

  const ReceptionistContextReceived = useContext(ReceptionistContext);
  const PermissionsContextReceived = useContext(PermissionsContext)

  const templateTableData = ReceptionistContextReceived?.ReceptionistContextValue.templateTableData;


  

  //STATE PRINCIPAL DEL FORMULARIO
  const [formData, setFormData] = useState({
  // --- DATOS DE CONTROL Y LLAVES EXTERNAS ---
  tenant_id: PermissionsContextReceived?.PermissionsContextValue.tenantObject?.id || "",
  funcionario_id: PermissionsContextReceived?.PermissionsContextValue.user?.id || "",
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
    tipo_vehiculo: null as TipoVehiculo,
    clase: null as ClaseVehiculo,
    combustible: null as Combustible,
    cilindrada: "", // integer en tu DB
    blindaje: false,
    capacidad_pasajeros: "", // integer en tu DB
    es_ensenanza: false,
    tipo_servicio_vehiculo: null as TipoServicioVehiculo, // Enum: particular, publico, etc.
    propietario_actual_id: null, // Referencia a la tabla personas
  },

  // --- REFERENCIAS ADICIONALES ---
  // IDs para las relaciones de la orden de entrada
  propietario_id: "", // Persona que figura en la tarjeta de propiedad
  cliente_id: "",     // Persona que trae el vehículo al CDA (quien paga)
});


  //FILTRADO DE LOS TEMPLATES: De los que se reciben desde el context
  const activeTemplates = templateTableData?.query.data?.filter(t => t.is_active) || [];
  //TEMPLATE SELECCIONADO DE ENTRE LOS ACTIVOS: Seleccionar cual de los activos esta tambien seleccionado, se utiliza para saber si renderizar o no el contenido
  const selectedTemplate = activeTemplates.find(t => t.id === formData.plantilla_id);


  //STATES DEL CUADRO DE DIALOGO
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempPlaca, setTempPlaca] = useState("");



  //ESTE ES EL MANEJADOR DEL SELECT: Para saber de entre los templates activos (array) es el que se selecciono en el select y pasarlo al state
  //ojo, hay que cambiar el state tambien de las plantillas, aqui por ahora solo se esta cambiando el texto contractual
  const handleTemplateSelect = (id: string, checked: boolean) => {
    const template = activeTemplates.find(t => t.id === id);
    setFormData(prev => ({
      ...prev,
      plantilla_id: checked ? id : "",
      texto_contractual_snapshot: checked ? (template?.base_contract_text || "") : ""
    }));
  };



  //MANEJADOR DEL SELECT DEL SERVICE TYPE
  const handleServiceTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, service_type: type }));
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
    console.log("Datos a enviar: ")
    console.log(formData)
  }



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

/**
 * 
 */
console.log("Datos del state actual cada vez que alguino de sus integrantes lo cambia")
console.log(formData)


  return (
    <form onSubmit={handleSubmit} className="p-8 mx-auto space-y-8">

      {/**TITULO SUPERIOR */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nueva Orden de Entrada</h1>
        <p className="text-slate-500">Complete la información del vehículo vinculada a una plantilla técnica.</p>
      </div>

 

      {/**El div que contiene todas las secciones del formulario */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-start">
          {templateTableData?.query.isFetching ? (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 animate-pulse gap-1.5 px-3 py-1">
              <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
              Sincronizando base de datos...
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5 px-3 py-1">
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
                  formData.plantilla_id === template.id ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600" : "border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="p-2 bg-white border rounded-lg shadow-sm group-hover:border-blue-200">
                    {getTemplateIcon(index)}
                  </div>
                  {/*#a11 ACTION */}
                  <Checkbox
                    checked={formData.plantilla_id === template.id}
                    onCheckedChange={(checked) => handleTemplateSelect(template.id, checked === true)}
                    className="h-5 w-5 ml-4 rounded-full border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">{template.template_name}</p>
                  <div className="flex flex-wrap gap-y-1 gap-x-3 pt-1">
                    <span className="flex items-center text-[11px] text-slate-500 gap-1"><Hash className="h-3 w-3" /> Cod: {template.document_code}</span>
                    <span className="text-[11px] text-slate-400 font-medium">Version: {template.version}</span>
                  </div>
                </div>
              </Label>
            ))}
          </div>
        </fieldset>




        {/**SECCION DE BUSQUEDA DE PLACA */}
        <div className={`mt-2 transition-all duration-500 ${selectedTemplate ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}>
          <div className="border-t pt-6">

            <legend className="text-xs font-bold uppercase text-slate-400 tracking-widest my-5">
              2. Datos del Servicio
            </legend>

            <div className="bg-slate-50/80 border rounded-xl p-6 space-y-8">

              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${selectedTemplate ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-200 text-slate-400"}`}>
                  <FileCheck className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">
                    {selectedTemplate ? selectedTemplate.template_name : "Formulario de Inspección"}
                  </h2>
                  <p className="text-sm text-slate-500 font-mono mt-1 flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5" /> {selectedTemplate ? `DOCUMENTO: ${selectedTemplate.document_code}` : "Seleccione una plantilla"}
                  </p>
                </div>
              </div>



              {/**SECCION DE SELECCION DEL TIPO DE SERVICIO */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Tipo de Inspección</span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "rtm", label: "REVISIÓN TÉCNICO MECÁNICA", desc: "Normatividad vigente", icon: <ClipboardCheck className="h-5 w-5 text-blue-600" /> },
                    { id: "preventiva", label: "PREVENTIVA", desc: "Control de seguridad", icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> },
                    { id: "peritaje", label: "PERITAJE", desc: "Valoración comercial", icon: <Search className="h-5 w-5 text-purple-600" /> }
                  ].map((tipo) => (
                    <Label
                      key={tipo.id}
                      className={`group relative flex flex-col gap-3 rounded-xl border p-4 cursor-pointer transition-all bg-white hover:border-blue-300 ${formData.service_type === tipo.id ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" : "border-slate-200"}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className={`p-2 border rounded-lg ${formData.service_type === tipo.id ? "bg-white border-blue-100" : "bg-slate-50 border-slate-100"}`}>{tipo.icon}</div>
                        {/*#a11 ACTION */}
                        <Checkbox
                          checked={formData.service_type === tipo.id}
                          onCheckedChange={() => handleServiceTypeChange(tipo.id)}
                          className="h-5 w-5 rounded-full border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 ml-4"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-slate-800 uppercase">{tipo.label}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{tipo.desc}</p>
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
                        (tipo.id === "reinspeccion" && formData.es_reinspeccion) ||
                        (tipo.id === "nueva" && !formData.es_reinspeccion)
                          ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div
                          className={`p-2 border rounded-lg ${
                            (tipo.id === "reinspeccion" && formData.es_reinspeccion) ||
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
                        <p className="text-[10px] text-slate-500 font-medium">{tipo.desc}</p>
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
                              id="dialog-placa"
                              value={tempPlaca}
                              onChange={(e) => setTempPlaca(e.target.value.toUpperCase())}
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
        </div>





        {/**SECCION DE DATOS DEL VEHICULO */}
        <div className={`mt-2 transition-all duration-500 ${selectedTemplate && formData.vehicle.placa ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}>
          <div className="border-t pt-6">

            <legend className="text-xs font-bold uppercase text-slate-400 tracking-widest my-5">
              3. Datos del vehiculo
            </legend>

            <div className="bg-slate-50/80 border rounded-xl p-6 space-y-10">

            {/* GRUPO 3.1: Identificación Básica */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Identificación del Vehículo</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Marca</Label>
                  {/*#a11 ACTION */}
                  <Input 
                    placeholder="Ej: Chevrolet"
                    value={formData.vehicle.marca}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicle: { ...prev.vehicle, marca: e.target.value.toUpperCase() }}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Línea</Label>
                  {/*#a11 ACTION */}
                  <Input 
                    placeholder="Ej: Spark GT"
                    value={formData.vehicle.linea}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicle: { ...prev.vehicle, linea: e.target.value.toUpperCase() }}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Modelo (Año)</Label>
                  {/*#a11 ACTION */}
                  <Input 
                    type="number"
                    min={1900}
                    placeholder="Ej: 2026"
                    value={formData.vehicle.modelo}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicle: { ...prev.vehicle, modelo: e.target.value }}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Color</Label>
                  {/*#a11 ACTION */}
                  <Input 
                    placeholder="Ej: Blanco Galaxia"
                    value={formData.vehicle.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicle: { ...prev.vehicle, color: e.target.value.toUpperCase() }}))}
                  />
                </div>
              </div>
            </div>

            {/* GRUPO 3.2: Especificaciones Técnicas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Especificaciones Técnicas</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Cilindrada (cc)</Label>
                  {/*#a11 ACTION */}
                  <Input 
                    type="number"
                    min={0}
                    placeholder="Ej: 1600"
                    value={formData.vehicle.cilindrada}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicle: { ...prev.vehicle, cilindrada: e.target.value }}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Capacidad Pasajeros</Label>
                  {/*#a11 ACTION */}
                  <Input 
                    type="number"
                    min={0}
                    placeholder="Ej: 5"
                    value={formData.vehicle.capacidad_pasajeros}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicle: { ...prev.vehicle, capacidad_pasajeros: e.target.value }}))}
                  />
                </div>
                





                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Combustible</Label>

                  <Select
                    value={formData.vehicle.combustible}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        vehicle: {
                          ...prev.vehicle,
                          combustible: value,
                        },
                      }))
                    }
                    items={[
                      { label: "Escoje Combustible", value: null },
                      { label: "Gasolina", value: "GASOLINA" },
                      { label: "Gas Natural Vehicular", value: "GAS NATURAL VEHICULAR" },
                      { label: "Diesel", value: "DIESEL" },
                      { label: "Gas-Gasolina", value: "GAS-GASOLINA" },
                      { label: "Híbrido", value: "HÍBRIDO" },
                      { label: "Eléctrico", value: "ELÉCTRICO" },
                      { label: "Etanol", value: "ETANOL" },
                      { label: "Biodiesel", value: "BIODIESEL" },
                      { label: "Hidrógeno", value: "HIDRÓGENO" },
                    ]}
                  >
                    <SelectTrigger className="h-10 w-full bg-background">
                      <SelectValue placeholder="Selecciona combustible" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value={null}>Escoje Combustible</SelectItem>
                      <SelectItem value="GASOLINA">Gasolina</SelectItem>
                      <SelectItem value="GAS NATURAL VEHICULAR">Gas Natural Vehicular</SelectItem>
                      <SelectItem value="DIESEL">Diesel</SelectItem>
                      <SelectItem value="GAS-GASOLINA">Gas-Gasolina</SelectItem>
                      <SelectItem value="HÍBRIDO">Híbrido</SelectItem>
                      <SelectItem value="ELÉCTRICO">Eléctrico</SelectItem>
                      <SelectItem value="ETANOL">Etanol</SelectItem>
                      <SelectItem value="BIODIESEL">Biodiesel</SelectItem>
                      <SelectItem value="HIDRÓGENO">Hidrógeno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                



                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Clase de Vehículo</Label>

                  <Select
                    value={formData.vehicle.clase}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        vehicle: {
                          ...prev.vehicle,
                          clase: value,
                        },
                      }))
                    }
                    items={[
                      { label: "Escoje Clase", value: null },
                      { label: "Automóvil", value: "AUTOMÓVIL" },
                      { label: "Bus", value: "BUS" },
                      { label: "Buseta", value: "BUSETA" },
                      { label: "Camión", value: "CAMIÓN" },
                      { label: "Camioneta", value: "CAMIONETA" },
                      { label: "Campero", value: "CAMPERO" },
                      { label: "Microbús", value: "MICROBÚS" },
                      { label: "Tractocamión", value: "TRACTOCAMIÓN" },
                      { label: "Volqueta", value: "VOLQUETA" },
                      { label: "Motocicleta", value: "MOTOCICLETA" },
                      { label: "Maquinaria Agrícola", value: "MAQUINARIA AGRÍCOLA" },
                      { label: "Maquinaria Industrial", value: "MAQUINARIA INDUSTRIAL" },
                      { label: "Semirremolque", value: "SEMIRREMOLQUE" },
                      { label: "Motocarro", value: "MOTOCARRO" },
                      { label: "Remolque", value: "REMOLQUE" },
                      { label: "Sin Clase", value: "SIN CLASE" },
                      { label: "Mototriciclo", value: "MOTOTRICICLO" },
                      { label: "Cuadrimoto", value: "CUADRIMOTO" },
                      { label: "Ciclomotor", value: "CICLOMOTOR" },
                      { label: "Tricimoto", value: "TRICIMOTO" },
                      { label: "Cuadriciclo", value: "CUADRICICLO" },
                      { label: "Maquinaria de Construcción o Minera", value: "MAQUINARIA DE CONSTRUCCIÓN O MINERA" },
                      { label: "Tricimóvil", value: "TRICIMÓVIL" },
                    ]}
                  >
                    <SelectTrigger className="h-10 bg-background w-full">
                      <SelectValue placeholder="Selecciona una clase" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value={null}>Escoje Clase</SelectItem>
                      <SelectItem value="AUTOMÓVIL">Automóvil</SelectItem>
                      <SelectItem value="BUS">Bus</SelectItem>
                      <SelectItem value="BUSETA">Buseta</SelectItem>
                      <SelectItem value="CAMIÓN">Camión</SelectItem>
                      <SelectItem value="CAMIONETA">Camioneta</SelectItem>
                      <SelectItem value="CAMPERO">Campero</SelectItem>
                      <SelectItem value="MICROBÚS">Microbús</SelectItem>
                      <SelectItem value="TRACTOCAMIÓN">Tractocamión</SelectItem>
                      <SelectItem value="VOLQUETA">Volqueta</SelectItem>
                      <SelectItem value="MOTOCICLETA">Motocicleta</SelectItem>
                      <SelectItem value="MAQUINARIA AGRÍCOLA">Maquinaria Agrícola</SelectItem>
                      <SelectItem value="MAQUINARIA INDUSTRIAL">Maquinaria Industrial</SelectItem>
                      <SelectItem value="SEMIRREMOLQUE">Semirremolque</SelectItem>
                      <SelectItem value="MOTOCARRO">Motocarro</SelectItem>
                      <SelectItem value="REMOLQUE">Remolque</SelectItem>
                      <SelectItem value="SIN CLASE">Sin Clase</SelectItem>
                      <SelectItem value="MOTOTRICICLO">Mototriciclo</SelectItem>
                      <SelectItem value="CUADRIMOTO">Cuadrimoto</SelectItem>
                      <SelectItem value="CICLOMOTOR">Ciclomotor</SelectItem>
                      <SelectItem value="TRICIMOTO">Tricimoto</SelectItem>
                      <SelectItem value="CUADRICICLO">Cuadriciclo</SelectItem>
                      <SelectItem value="MAQUINARIA DE CONSTRUCCIÓN O MINERA">
                        Maquinaria de Construcción o Minera
                      </SelectItem>
                      <SelectItem value="TRICIMÓVIL">Tricimóvil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>






                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Tipo de Vehículo</Label>
                  {/*#a11 ACTION */}
                  <Select
                  value={formData.vehicle.tipo_vehiculo}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicle: {
                        ...prev.vehicle,
                        tipo_vehiculo: value,
                      },
                    }))
                  }
                  items={
                    [
                      { label: "Escoje Tipo", value: null },
                      { label: "Liviano", value: "liviano" },
                      { label: "Pesado", value: "pesado" },
                      { label: "Moto 4T", value: "motocicleta_4t" },
                      { label: "Moto 2T", value: "motocicleta_2t" },
                      { label: "Motocarro 4T", value: "motocarro_4t" },
                      { label: "Motocarro 2T", value: "motocarro_2t" },
                    ]
                  }
                  >
                  <SelectTrigger className="h-10 bg-background w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={null}>Escoje Tipo</SelectItem>
                    <SelectItem value="liviano">Liviano</SelectItem>
                    <SelectItem value="pesado">Pesado</SelectItem>
                    <SelectItem value="motocicleta_4t">Moto 4T</SelectItem>
                    <SelectItem value="motocicleta_2t">Moto 2T</SelectItem>
                    <SelectItem value="motocarro_4t">Motocarr 4T</SelectItem>
                    <SelectItem value="motocarro_2t">Motocarro 2T</SelectItem>
                  </SelectContent>

                  </Select>

                </div>



                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Tipo de Servicio</Label>

                  <Select
                    value={formData.vehicle.tipo_servicio_vehiculo}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        vehicle: {
                          ...prev.vehicle,
                          tipo_servicio_vehiculo: value,
                        },
                      }))
                    }
                    items={[
                      { label: "Escoje Tipo de Servicio", value: null },
                      { label: "Particular", value: "PARTICULAR" },
                      { label: "Enseñanza", value: "ENSEÑANZA" },
                      { label: "Oficial", value: "OFICIAL" },
                      { label: "Público", value: "PUBLICO" },
                      { label: "Diplomático", value: "DIPLOMATICO" },
                      { label: "Especial", value: "ESPECIAL" },
                    ]}
                  >
                    <SelectTrigger className="h-10 w-full bg-background">
                      <SelectValue placeholder="Selecciona tipo de servicio" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value={null}>Escoje Tipo de Servicio</SelectItem>
                      <SelectItem value="PARTICULAR">Particular</SelectItem>
                      <SelectItem value="ENSEÑANZA">Enseñanza</SelectItem>
                      <SelectItem value="OFICIAL">Oficial</SelectItem>
                      <SelectItem value="PUBLICO">Público</SelectItem>
                      <SelectItem value="DIPLOMATICO">Diplomático</SelectItem>
                      <SelectItem value="ESPECIAL">Especial</SelectItem>
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
                  <h3 className="text-sm font-bold text-slate-800">Documentación y Snapshots de Ley</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" /> Vencimiento SOAT
                    </Label>
                    {/*#a11 ACTION */}
                    <Input 
                      type="date"
                      className="border-blue-100 focus:ring-blue-500"
                      value={formData.soat_vencimiento_snapshot || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, soat_vencimiento_snapshot: e.target.value}))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, gas_numero_snapshot: e.target.value.toUpperCase() }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, gas_vencimiento_snapshot: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Kilometraje Actual</Label>
                  <div className="relative">
                    {/*#a11 ACTION */}
                    <Input 
                      type="number"
                      placeholder="000000"
                      className="h-12 text-lg font-mono font-bold pl-10"
                      value={formData.kilometraje}
                      onChange={(e) => setFormData(prev => ({ ...prev, kilometraje: e.target.value }))}
                    />
                    <RefreshCcw className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  </div>
                </div>


                


              </div>
            </div>

            {/* Checkboxes de Estado Especial */}
            <div className="flex flex-wrap gap-6 pt-2">
              <Label className="flex items-center gap-3 cursor-pointer group">
                {/*#a11 ACTION */}
                <Checkbox 
                  checked={formData.vehicle.blindaje}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, vehicle: { ...prev.vehicle, blindaje: !!checked }}))}
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Vehículo Blindado</span>
                </div>
              </Label>

              <Label className="flex items-center gap-3 cursor-pointer group">
                {/*#a11 ACTION */}
                <Checkbox 
                  checked={formData.vehicle.es_ensenanza}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, vehicle: { ...prev.vehicle, es_ensenanza: !!checked }}))}
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Vehículo de Enseñanza</span>
                </div>
              </Label>
            </div>
          </div>


          </div>
        </div>













      </div>
    </form>
  );
}