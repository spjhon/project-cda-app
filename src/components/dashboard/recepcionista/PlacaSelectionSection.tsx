"use client";

import {
  ServiceType,
  ZodFullFormDataType,
} from "@/lib/zod-schemas/order-schema";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileCheck,
  Globe,
  Hash,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { OrderTemplate } from "@/lib/server-actions/fetch_orders_templates";

import { fetchDataWithPlaca } from "@/lib/server-actions/fetch_data_with_placa";
import { getInitialOrderFormData } from "@/app/[tenant]/dashboard/recepcionista/page";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface ServiceOption {
  id: ServiceType;
  label: string;
  desc: string;
  icon: ReactNode;
}

const SERVICE_TYPES: ServiceOption[] = [
  {
    id: "RTM",
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

export interface PlacaSelectionSectionProps {
  selectedTemplate: OrderTemplate | undefined;
  formData: ZodFullFormDataType;
  setFormData: Dispatch<SetStateAction<ZodFullFormDataType>>;
   setSignatureKey: Dispatch<SetStateAction<number>>;
}

type SearchStatus = | "idle" | "loading" | "found" | "not_found" | "error";










export default function PlacaSelectionSection({selectedTemplate, setFormData, formData, setSignatureKey}: PlacaSelectionSectionProps) {

  
  // DIALOG STATES
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [tempPlaca, setTempPlaca] = useState("");
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [message, setMessage] = useState("");
  const [isNewVehicle, setIsNewVehicle] = useState<boolean | null>(null);



  // SERVICE TYPE
  const handleServiceTypeChange = (type: ServiceType) => {

const initialData = getInitialOrderFormData(formData.tenant_id, formData.funcionario_id, formData.plantilla_id, formData.service_type);


    setFormData((prev) => ({
      ...prev,
     ...initialData,
      service_type: type,
      es_reinspeccion: type === "peritaje" ? false : prev.es_reinspeccion,
      condition_results: prev.condition_results,
      signatures: prev.signatures.map((sig) => ({ ...sig, signature_url: "" })) // Reseteamos la URL a vacío,
    }));

// ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
        setSignatureKey((prev) => prev + 1);


  };




  // REINSPECCIÓN
  const handleReinspeccionChange = (checked: boolean) => {

  const initialData = getInitialOrderFormData(formData.tenant_id, formData.funcionario_id, formData.plantilla_id, formData.service_type);



    setFormData((prev) => ({
      ...prev,
       ...initialData,
      es_reinspeccion: checked,
      condition_results: prev.condition_results,
      signatures: prev.signatures.map((sig) => ({ ...sig, signature_url: "" })) // Reseteamos la URL a vacío,
    }));

    // ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
        setSignatureKey((prev) => prev + 1);
  };




  // ABRIR DIALOG
  const handleOpenChange = (open: boolean) => {

    setDialogOpen(open);

    if (open) {
      setTempPlaca(formData.vehicle.placa || "");
      setSearchStatus("idle");
      setMessage("");
    }

  };






  // BUSCAR PLACA
  
  const handleBuscarPlaca = async () => {




    const placaLimpia = tempPlaca.trim().toUpperCase();

    if (!placaLimpia) return;

    const tenantId = formData.tenant_id;
    setSearchStatus("loading");
    setMessage("");




    if (!formData.es_reinspeccion && formData.service_type === "RTM"){

      try{
        const initialData = getInitialOrderFormData(formData.tenant_id, formData.funcionario_id, formData.plantilla_id, formData.service_type);
        // Inicializamos el cliente de Supabase del lado del navegador
        const supabaseBrowser = createSupabaseBrowserClient();

        // Llamamos directamente al RPC usando el SDK de frontend
        const { data: RTMcheckInfo, error: ErrorRTMcheckInfo } = await supabaseBrowser.rpc(
          "check_rtm_primera_vez_eligibility",
          {
            p_placa: placaLimpia,
            p_tenant_id: tenantId,
          }
        );

         // Si hubo un error de red o de permisos (ej. error 403 o de sintaxis)
        if (ErrorRTMcheckInfo) {
          console.error("Error en RPC de Supabase:", ErrorRTMcheckInfo);
          setSearchStatus("error");
          setMessage(`Error de comunicación: ${ErrorRTMcheckInfo.message}`);
          setFormData((prev) => ({
            ...prev,
            ...initialData,
          
          condition_results: prev.condition_results,
      signatures: prev.signatures.map((sig) => ({ ...sig, signature_url: "" })) // Reseteamos la URL a vacío,
          }));
          // ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
        setSignatureKey((prev) => prev + 1);
          return;
        }





        // Si la lógica de Postgres determinó que NO aplica a reinspección
        if (!RTMcheckInfo) {
          setSearchStatus("error");
          setMessage("No hay datos que mostrar"); // Imprime el motivo exacto que programamos en SQL
          setFormData((prev) => ({
            ...prev,
            ...initialData,
         
           condition_results: prev.condition_results,
      signatures: prev.signatures.map((sig) => ({ ...sig, signature_url: "" })) // Reseteamos la URL a vacío,
          }));
          // ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
        setSignatureKey((prev) => prev + 1);
          return; // 🛑 Frenamos el flujo aquí mismo
        }


        if (!RTMcheckInfo[0].puede_primera_vez){
          setSearchStatus("error");
           setMessage(RTMcheckInfo[0].motivo);
           setFormData((prev) => ({
            ...prev,
            ...initialData,
            
             condition_results: prev.condition_results,
     signatures: prev.signatures.map((sig) => ({ ...sig, signature_url: "" })) // Reseteamos la URL a vacío,
          }));
          // ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
        setSignatureKey((prev) => prev + 1);
           return;
        }

      }catch{

      }finally{

      }

    


    }



    if (formData.es_reinspeccion && formData.service_type === "preventiva"){

      try {
        // Inicializamos el cliente de Supabase del lado del navegador
        const supabaseBrowser = createSupabaseBrowserClient();

        // Llamamos directamente al RPC usando el SDK de frontend
        const { data: rpcData, error: rpcError } = await supabaseBrowser.rpc(
          "check_preventiva_reinspection_eligibility",
          {
            p_placa: placaLimpia,
            p_tenant_id: tenantId,
          }
        );

       
        const initialData = getInitialOrderFormData(formData.tenant_id, formData.funcionario_id, formData.plantilla_id, formData.service_type);

        // Si hubo un error de red o de permisos (ej. error 403 o de sintaxis)
        if (rpcError) {
          console.error("Error en RPC de Supabase:", rpcError);
          setSearchStatus("error");
          setMessage(`Error de comunicación: ${rpcError.message}`);
          setFormData((prev) => ({
            ...prev,
            ...initialData,
          es_reinspeccion: true,
          service_type: "preventiva",
          condition_results: prev.condition_results,
      signatures: prev.signatures.map((sig) => ({ ...sig, signature_url: "" })) // Reseteamos la URL a vacío,
          }));

          // ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
        setSignatureKey((prev) => prev + 1);
          return;
        }

        // Si la lógica de Postgres determinó que NO aplica a reinspección
        if (!rpcData) {
          setSearchStatus("error");
          setMessage("No hay datos que mostrar"); // Imprime el motivo exacto que programamos en SQL
          setFormData((prev) => ({
            ...prev,
            ...initialData,
          es_reinspeccion: true,
           service_type: "preventiva",
           condition_results: prev.condition_results,
      signatures: prev.signatures.map((sig) => ({ ...sig, signature_url: "" })) // Reseteamos la URL a vacío,
          }));
          // ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
        setSignatureKey((prev) => prev + 1);
          return; // 🛑 Frenamos el flujo aquí mismo
        }

      

        if (!rpcData[0].merece_reinspeccion){
          setSearchStatus("error");
           setMessage(rpcData[0].motivo);
           setFormData((prev) => ({
            ...prev,
            ...initialData,
            es_reinspeccion: true,
             service_type: "preventiva",
             condition_results: prev.condition_results,
     signatures: prev.signatures.map((sig) => ({ ...sig, signature_url: "" })) // Reseteamos la URL a vacío,
          }));
          // ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
        setSignatureKey((prev) => prev + 1);
           return;
        }

        // Si Postgres dio luz verde, inyectamos el 'id_reprobado' en el estado
        setFormData((prev) => ({
          ...prev,
          id_reprobado: rpcData[0].id_reprobado,
        }));
        

      } catch (err) {
        console.error("Error inesperado en el cliente:", err);
        setSearchStatus("error");
        setMessage("Ocurrió un error inesperado al validar la reinspección.");
        return;
      }

    }





if (formData.es_reinspeccion && formData.service_type === "RTM"){

  

      try {
        // Inicializamos el cliente de Supabase del lado del navegador
        const supabaseBrowser = createSupabaseBrowserClient();

        // Llamamos directamente al RPC usando el SDK de frontend
        const { data: rpcData, error: rpcError } = await supabaseBrowser.rpc(
          "check_rtm_reinspection_eligibility",
          {
            p_placa: placaLimpia,
            p_tenant_id: tenantId,
          }
        );

        
       
       
        const initialData = getInitialOrderFormData(formData.tenant_id, formData.funcionario_id, formData.plantilla_id, formData.service_type);

        // Si hubo un error de red o de permisos (ej. error 403 o de sintaxis)
        if (rpcError) {
          console.error("Error en RPC de Supabase:", rpcError);
          setSearchStatus("error");
          setMessage(`Error de comunicación: ${rpcError.message}`);
          setFormData((prev) => ({
            ...prev,
            ...initialData,
          es_reinspeccion: true,
          service_type: "RTM",
          condition_results: prev.condition_results,
          signatures: prev.signatures.map((sig) => ({ ...sig, signature_url: "" })) // Reseteamos la URL a vacío,
          }));
          // ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
          setSignatureKey((prev) => prev + 1);
          return;
        }

        // Si la lógica de Postgres determinó que NO aplica a reinspección
        if (!rpcData) {
          setSearchStatus("error");
          setMessage("No hay datos que mostrar"); // Imprime el motivo exacto que programamos en SQL
          setFormData((prev) => ({
            ...prev,
            ...initialData,
          es_reinspeccion: true,
           service_type: "RTM",
           condition_results: prev.condition_results,
      signatures: prev.signatures.map((sig) => ({ ...sig, signature_url: "" })) // Reseteamos la URL a vacío,
          }));
          // ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
        setSignatureKey((prev) => prev + 1);
          return; // 🛑 Frenamos el flujo aquí mismo
        }

      

        if (!rpcData[0].merece_reinspeccion){
          setSearchStatus("error");
           setMessage(rpcData[0].motivo);
           setFormData((prev) => ({
            ...prev,
            ...initialData,
            es_reinspeccion: true,
             service_type: "RTM",
             condition_results: prev.condition_results,
      signatures: prev.signatures.map((sig) => ({ ...sig, signature_url: "" })) // Reseteamos la URL a vacío,
          }));
          // ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
        setSignatureKey((prev) => prev + 1);
           return;
        }

        // Si Postgres dio luz verde, inyectamos el 'id_reprobado' en el estado
        setFormData((prev) => ({
          ...prev,
          id_reprobado: rpcData[0].id_reprobado,
          
        }));
        
       

      } catch (err) {
        console.error("Error inesperado en el cliente:", err);
        setSearchStatus("error");
        setMessage("Ocurrió un error inesperado al validar la reinspección de RTM.");
        return;
      }




}





    try {
      const { data, error, found } = await fetchDataWithPlaca(placaLimpia, tenantId);

      if (error) {
        setSearchStatus("error");
        setMessage(typeof error === "string"? error : error.message);
        return;
      }

      

      // ACTUALIZA LA PLACA SIEMPRE
      setFormData((prev) => ({
        ...prev,
       
        vehicle: {
          ...prev.vehicle,
          placa: placaLimpia,
        },
        condition_results: prev.condition_results,
      signatures: prev.signatures.map((sig) => ({ ...sig, signature_url: "" })) // Reseteamos la URL a vacío,
      }));

      // ⚡ FORZAMOS EL BORRADO DEL ESTADO INTERNO DE LAS FIRMAS
        setSignatureKey((prev) => prev + 1);




      if (found) {
        
        setIsNewVehicle(false);
        setSearchStatus("found");
        setMessage("Vehículo encontrado correctamente en la base de datos.");


        setFormData((prev) => {
          // 1. Extraemos los flags para trabajar más cómodo
          const isOwnerSame = data?.is_owner_same_as_customer ?? false;
          

          return {
            ...prev,
            // Seteamos el flag calculado por el RPC
            is_owner_same_as_customer: isOwnerSame,

            // 🚗 SECCIÓN: VEHÍCULO
            vehicle: {
              ...prev.vehicle,
              placa: placaLimpia, // Forzamos la placa que se buscó con éxito
              blindaje: data?.vehicle?.blindaje ?? prev.vehicle?.blindaje ?? false,
              capacidad_pasajeros: data?.vehicle?.capacidad_pasajeros.toString() ?? prev.vehicle?.capacidad_pasajeros ?? "",
              cilindrada: data?.vehicle?.cilindrada.toString() ?? prev.vehicle?.cilindrada ?? "",
              clase: data?.vehicle?.clase ?? prev.vehicle?.clase ?? "",
              color: data?.vehicle?.color ?? prev.vehicle?.color ?? "",
              combustible: data?.vehicle?.combustible ?? prev.vehicle?.combustible ?? "",
              es_ensenanza: data?.vehicle?.es_ensenanza ?? prev.vehicle?.es_ensenanza ?? false,
              es_extranjero: data?.vehicle?.es_extranjero ?? prev.vehicle?.es_extranjero ?? false,
              linea: data?.vehicle?.linea ?? prev.vehicle?.linea ?? "",
              marca: data?.vehicle?.marca ?? prev.vehicle?.marca ?? "",
              modelo: data?.vehicle?.modelo.toString() ?? prev.vehicle?.modelo ?? "",
              propietario_actual_id: data?.vehicle?.propietario_actual_id ?? prev.vehicle?.propietario_actual_id ?? null,
              tipo_servicio_vehiculo: data?.vehicle?.tipo_servicio_vehiculo ?? prev.vehicle?.tipo_servicio_vehiculo ?? "",
              tipo_vehiculo: data?.vehicle?.tipo_vehiculo ?? prev.vehicle?.tipo_vehiculo ?? "",
            },

            // 👤 SECCIÓN: PROPIETARIO (OWNER)
            owner_data: {
              ...prev.owner_data,
              id: data?.owner_data?.id ?? prev.owner_data?.id ?? null,
              tipo_documento: data?.owner_data?.tipo_documento ?? prev.owner_data?.tipo_documento ?? "cedula_ciudadania",
              numero_documento: data?.owner_data?.numero_documento ?? prev.owner_data?.numero_documento ?? "",
              nombre_completo: data?.owner_data?.nombre_completo ?? prev.owner_data?.nombre_completo ?? "",
              telefono: data?.owner_data?.telefono ?? prev.owner_data?.telefono ?? "",
              correo: data?.owner_data?.correo ?? prev.owner_data?.correo ?? "",
              direccion: data?.owner_data?.direccion ?? prev.owner_data?.direccion ?? "",
            },

            // 🤝 SECCIÓN NUEVA: CLIENTE HISTÓRICO (CUSTOMER)
            customer_data: {
              ...prev.customer_data,
              id: data?.customer_data?.id ?? prev.customer_data?.id ?? null,
              tipo_documento: data?.customer_data?.tipo_documento ?? prev.customer_data?.tipo_documento ?? "cedula_ciudadania",
              numero_documento: data?.customer_data?.numero_documento ?? prev.customer_data?.numero_documento ?? "",
              nombre_completo: data?.customer_data?.nombre_completo ?? prev.customer_data?.nombre_completo ?? "",
              telefono: data?.customer_data?.telefono ?? prev.customer_data?.telefono ?? "",
              correo: data?.customer_data?.correo ?? prev.customer_data?.correo ?? "",
              direccion: data?.customer_data?.direccion ?? prev.customer_data?.direccion ?? "",
            },
            
          };
        });
        




      } else {
        setIsNewVehicle(true);
        setSearchStatus("not_found");
        setMessage("No se encontraron registros previos. Puedes continuar con el registro manual.");
      }


    } catch (error) {

      console.log(error);
      setSearchStatus("error");
      setMessage("Ocurrió un error al consultar la información.");

    }


  };








  // ACEPTAR
  const handleAccept = () => {

    setDialogOpen(false);
    setSearchStatus("idle");
    setMessage("");

  };




  // RUNT
  const handleRuntQuery = () => {

    console.log(
      "Consultando RUNT para:",
      formData.vehicle.placa
    );

  };



  return (
    <fieldset
      className={`mt-2 transition-all duration-500 ${
        selectedTemplate
          ? "opacity-100"
          : "opacity-40 pointer-events-none translate-y-4"
      }`}
     >
      <div className="border-t pt-6">
        <legend className="text-xs font-bold uppercase text-slate-400 tracking-widest my-5">
          2. Datos del Servicio
        </legend>

        <div className="bg-slate-50/80 border rounded-xl p-6 space-y-8">
          {/* HEADER */}
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full ${
                selectedTemplate
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-slate-200 text-slate-400"
              }`}
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
                <Hash className="h-3.5 w-3.5" />

                {selectedTemplate
                  ? `DOCUMENTO: ${selectedTemplate.document_code}`
                  : "Seleccione una plantilla"}
              </p>
            </div>
          </div>

          {/* TIPO SERVICIO */}
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
                  className={`group relative flex flex-col gap-3 rounded-xl border p-4 cursor-pointer transition-all bg-white hover:border-blue-300 ${
                    formData.service_type === tipo.id
                      ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div
                      className={`p-2 border rounded-lg ${
                        formData.service_type === tipo.id
                          ? "bg-white border-blue-100"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      {tipo.icon}
                    </div>

                    <Checkbox
                      checked={
                        formData.service_type === tipo.id
                      }
                      onCheckedChange={() =>
                        handleServiceTypeChange(
                          tipo.id
                        )
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

          {/* REINSPECCIÓN */}
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
                  icon: (
                    <FileCheck className="h-5 w-5 text-blue-600" />
                  ),
                },

                {
                  id: "reinspeccion",
                  label: "REINSPECCIÓN",
                  desc: "Revisión posterior a hallazgos",
                  icon: (
                    <RefreshCcw className="h-5 w-5 text-amber-600" />
                  ),
                },
              ].map((tipo) => (
                <Label
                  key={tipo.id}
                  className={`group relative flex flex-col gap-3 rounded-xl border p-4 cursor-pointer transition-all bg-white hover:border-blue-300 ${
                    (tipo.id === "reinspeccion" &&
                      formData.es_reinspeccion) ||
                    (tipo.id === "nueva" &&
                      !formData.es_reinspeccion)
                      ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div
                      className={`p-2 border rounded-lg ${
                        (tipo.id ===
                          "reinspeccion" &&
                          formData.es_reinspeccion) ||
                        (tipo.id === "nueva" &&
                          !formData.es_reinspeccion)
                          ? "bg-white border-blue-100"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      {tipo.icon}
                    </div>

                    <Checkbox
                      disabled={formData.service_type === "peritaje" && tipo.id === "reinspeccion"}
                      checked={
                        tipo.id === "reinspeccion"
                          ? formData.es_reinspeccion
                          : !formData.es_reinspeccion
                      }
                      onCheckedChange={() =>
                        handleReinspeccionChange(
                          tipo.id ===  "reinspeccion"
                        )
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

          {/* PLACA */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* BUSCAR */}
              <div className="md:col-span-8">
                
                <Dialog
                  open={dialogOpen}
                  onOpenChange={handleOpenChange}
                 >
                  <DialogTrigger
                    render={
                      <Button
                        type="button"
                        className="w-full h-16 gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-200 text-lg"
                      >
                        <Search className="h-6 w-6" />

                        
                        {formData.es_reinspeccion?"BUSCAR PLACA PARA REINSPECCION":"BUSCAR PLACA"}
                      </Button>
                    }
                  />

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-slate-500" />

                       

                        {formData.es_reinspeccion?"Buscar Reinspeccion":"Buscar Vehículo"}
                      </DialogTitle>

                      <DialogDescription>
                        Ingresa la placa del vehículo
                        para consultar información.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 pt-2">
                      {/* INPUT */}
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">
                          Ingresar Placa
                        </Label>

                        <Input
                          value={tempPlaca}
                          onChange={(e) =>
                            setTempPlaca(
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="ABC123"
                          className="h-14 uppercase font-black text-3xl border-slate-300 tracking-[0.2em] bg-white text-center"
                          maxLength={7}
                          autoFocus
                        />
                      </div>

                      {/* BOTÓN BUSCAR */}
                      <Button
                        type="button"
                        onClick={handleBuscarPlaca}
                        disabled={
                          searchStatus ===
                            "loading" ||
                          !tempPlaca.trim()
                        }
                        className="w-full h-12 gap-2 bg-slate-900 hover:bg-slate-800"
                      >
                        {searchStatus ===
                        "loading" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />

                            Buscando...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4" />

                            Buscar
                          </>
                        )}
                      </Button>

                      {/* RESULTADOS */}
                      {searchStatus !== "idle" && (
                        <div className="border rounded-xl p-4 bg-slate-50 space-y-4">
                          {searchStatus ===
                            "loading" && (
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <Loader2 className="h-4 w-4 animate-spin" />

                              Consultando información...
                            </div>
                          )}

                          {searchStatus ===
                            "found" && (
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 text-sm text-emerald-700">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />

                                <span>{message}</span>
                              </div>

                              <Button
                                type="button"
                                onClick={
                                  handleAccept
                                }
                                className="w-full"
                              >
                                Aceptar
                              </Button>
                            </div>
                          )}

                          {searchStatus ===
                            "not_found" && (
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 text-sm text-amber-700">
                                <AlertTriangle className="h-5 w-5 shrink-0" />

                                <span>{message}</span>
                              </div>

                              <Button
                                type="button"
                                onClick={
                                  handleAccept
                                }
                                className="w-full"
                              >
                                Aceptar
                              </Button>
                            </div>
                          )}

                          {searchStatus ===
                            "error" && (
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 text-sm text-red-700">
                                <XCircle className="h-5 w-5 shrink-0" />

                                <span>{message}</span>
                              </div>

                              <Button
                                type="button"
                                onClick={
                                  handleAccept
                                }
                                className="w-full"
                              >
                                Aceptar
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
               



              </div>

              {/* RUNT */}
              <div className="md:col-span-4">
                <Button
                  type="button"
                  onClick={handleRuntQuery}
                  disabled={
                    !formData.vehicle.placa
                  }
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

                  <span className="hidden md:inline">
                    ACTUALIZAR DATOS
                  </span>

                  <span className="md:hidden">
                    RUNT
                  </span>
                </Button>
              </div>
            </div>

            {/* ESTADO PLACA */}
            {/* Indicador de placa seleccionada */}
            <div
              className={`
                rounded-2xl border-2 p-6 transition-all
                ${
                  formData.vehicle.placa
                    ? "border-blue-200 bg-blue-50/60"
                    : "border-dashed border-slate-300 bg-slate-50"
                }
              `}
             >
              {formData.vehicle.placa ? (
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    Placa Seleccionada
                  </span>

                  <div className="bg-white border-2 border-blue-200 rounded-2xl px-8 py-4 shadow-sm">
                    <span className="font-black tracking-[0.25em] text-5xl md:text-6xl text-slate-900">
                      {formData.vehicle.placa}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-2 text-xs font-semibold rounded-full px-4 py-2 border ${
                      isNewVehicle
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}
                  >
                    {isNewVehicle ? (
                      <>
                        <AlertTriangle className="h-4 w-4 animate-pulse" />
                        Vehículo nuevo
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Vehículo encontrado
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 text-sm font-medium text-slate-400">
                  No hay placa seleccionada
                </div>
              )}
            </div>



          </div>
        </div>
      </div>
    </fieldset>
  );
}