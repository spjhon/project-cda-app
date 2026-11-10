"use client";

import {
  ServiceType,
} from "@/lib/zod-schemas/order-schema";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileCheck,
  Hash,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

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



import { fetchDataWithPlaca } from "@/lib/client-actions/fetch_data_with_placa";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import RuntScraperModal from "../RuntScraperModal";
import { initialOrderFormData, SimpleOrderFormData } from "./NewSimpleEntryOrderComponent";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import { CameraCapture } from "../CameraCapture";



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
    id: "preventiva_viajero",
    label: "PREVENTIVA VIAJERO",
    desc: "Control de seguridad para vehículos de servicio viajero",
    icon: <ShieldCheck className="h-5 w-5 text-teal-600" />,
  },
  {
    id: "peritaje",
    label: "PERITAJE",
    desc: "Valoración comercial",
    icon: <Search className="h-5 w-5 text-purple-600" />,
  },
  {
    id: "prueba_gases",
    label: "PRUEBA DE GASES",
    desc: "Evaluación de emisiones contaminantes",
    icon: <ClipboardCheck className="h-5 w-5 text-orange-600" />,
  },
];

export interface SimplePlacaSelectionSectionProps {
  formData: SimpleOrderFormData;
  setFormData: Dispatch<SetStateAction<SimpleOrderFormData>>;
  cameraResetKey: number; // <-- Añadimos la prop
}

type SearchStatus = "idle" | "loading" | "found" | "not_found" | "error";

export default function SimplePlacaSelectionSection({
  setFormData,
  formData,
   cameraResetKey,
}: SimplePlacaSelectionSectionProps) {

const PermissionsContextReceived = useContext(PermissionsContext);

    const tenant_id = PermissionsContextReceived?.PermissionsContextValue.tenantObject?.id ?? "";
  const user_id =
    PermissionsContextReceived?.PermissionsContextValue.user.id ?? "";

  // DIALOG STATES
  const [dialogOpen, setDialogOpen] = useState(false);

  const [tempPlaca, setTempPlaca] = useState("");
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [message, setMessage] = useState("");
  const [isNewVehicle, setIsNewVehicle] = useState<boolean | null>(null);




// SERVICE TYPE
const handleServiceTypeChange = (type: string) => {
  // 1. Definimos los servicios que NO permiten reinspección
  const serviciosSinReinspeccion = ["preventiva_viajero", "peritaje", "prueba_gases"];
  
  // 2. Evaluamos si el servicio seleccionado está en esa lista
  const apagarReinspeccion = serviciosSinReinspeccion.includes(type);

  setFormData((prev) => ({
    ...prev, // Mantenemos todo lo que el usuario ya había escrito (como la placa)
    service_type: type, // Cambiamos el tipo de servicio
    
    // 3. Lógica de reinspección:
    // Si el nuevo servicio está en la lista negra, lo apagamos (false).
    // Si no (es RTM o Preventiva), mantenemos lo que ya estaba (prev.es_reinspeccion)
    es_reinspeccion: apagarReinspeccion ? false : prev.es_reinspeccion, 
  }));
};





const handleReinspeccionChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev, // Mantiene el servicio seleccionado (Preventiva, RTM, etc.)
      es_reinspeccion: checked, // Solo cambia el estado del check
    }));
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

   
    setSearchStatus("loading");
    setMessage("");

    if (!formData.es_reinspeccion && formData.service_type === "RTM") {
      try {
        
        // Inicializamos el cliente de Supabase del lado del navegador
        const supabaseBrowser = createSupabaseBrowserClient();

        // Llamamos directamente al RPC usando el SDK de frontend
        const { data: RTMcheckInfo, error: ErrorRTMcheckInfo } =
          await supabaseBrowser.rpc("check_rtm_primera_vez_eligibility", {
            p_placa: placaLimpia,
            p_tenant_id: tenant_id,
          });

        // Si hubo un error de red o de permisos (ej. error 403 o de sintaxis)
        if (ErrorRTMcheckInfo) {
          console.error("Error en RPC de Supabase:", ErrorRTMcheckInfo);
          setSearchStatus("error");
          setMessage(`Error de comunicación: ${ErrorRTMcheckInfo.message}`);
          setFormData((prev) => ({
            ...prev,
            ...initialOrderFormData,
          }));
          return;
        }

        // Si la lógica de Postgres determinó que NO aplica a reinspección
        if (!RTMcheckInfo) {
          setSearchStatus("error");
          setMessage("No hay datos que mostrar"); // Imprime el motivo exacto que programamos en SQL
          setFormData((prev) => ({
            ...prev,
            ...initialOrderFormData,
          }));
          return; // 🛑 Frenamos el flujo aquí mismo
        }

        if (!RTMcheckInfo[0].puede_primera_vez) {
          setSearchStatus("error");
          setMessage(RTMcheckInfo[0].motivo);
          setFormData((prev) => ({
            ...prev,
            ...initialOrderFormData,
          }));
          return;
        }
      } catch {
      } finally {
      }
    }

    if (formData.es_reinspeccion && formData.service_type === "preventiva") {
      try {
        // Inicializamos el cliente de Supabase del lado del navegador
        const supabaseBrowser = createSupabaseBrowserClient();

        // Llamamos directamente al RPC usando el SDK de frontend
        const { data: rpcData, error: rpcError } = await supabaseBrowser.rpc(
          "check_preventiva_reinspection_eligibility",
          {
            p_placa: placaLimpia,
            p_tenant_id: tenant_id,
          },
        );


        // Si hubo un error de red o de permisos (ej. error 403 o de sintaxis)
        if (rpcError) {
          console.error("Error en RPC de Supabase:", rpcError);
          setSearchStatus("error");
          setMessage(`Error de comunicación: ${rpcError.message}`);
          setFormData((prev) => ({
            ...prev,
            ...initialOrderFormData,
            es_reinspeccion: true,
            service_type: "preventiva",
          }));
          return;
        }

        // Si la lógica de Postgres determinó que NO aplica a reinspección
        if (!rpcData) {
          setSearchStatus("error");
          setMessage("No hay datos que mostrar"); // Imprime el motivo exacto que programamos en SQL
          setFormData((prev) => ({
            ...prev,
            ...initialOrderFormData,
            es_reinspeccion: true,
            service_type: "preventiva",
          }));
          return; // 🛑 Frenamos el flujo aquí mismo
        }

        if (!rpcData[0].merece_reinspeccion) {
          setSearchStatus("error");
          setMessage(rpcData[0].motivo);
          setFormData((prev) => ({
            ...prev,
            ...initialOrderFormData,
            es_reinspeccion: true,
            service_type: "preventiva",
          }));
          
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

    if (formData.es_reinspeccion && formData.service_type === "RTM") {
      try {
        // Inicializamos el cliente de Supabase del lado del navegador
        const supabaseBrowser = createSupabaseBrowserClient();

        // Llamamos directamente al RPC usando el SDK de frontend
        const { data: rpcData, error: rpcError } = await supabaseBrowser.rpc(
          "check_rtm_reinspection_eligibility",
          {
            p_placa: placaLimpia,
            p_tenant_id: tenant_id,
          },
        );

       

        // Si hubo un error de red o de permisos (ej. error 403 o de sintaxis)
        if (rpcError) {
          console.error("Error en RPC de Supabase:", rpcError);
          setSearchStatus("error");
          setMessage(`Error de comunicación: ${rpcError.message}`);
          setFormData((prev) => ({
            ...prev,
            ...initialOrderFormData,
            es_reinspeccion: true,
            service_type: "RTM",
          }));
          return;
        }

        // Si la lógica de Postgres determinó que NO aplica a reinspección
        if (!rpcData) {
          setSearchStatus("error");
          setMessage("No hay datos que mostrar"); // Imprime el motivo exacto que programamos en SQL
          setFormData((prev) => ({
            ...prev,
            ...initialOrderFormData,
            es_reinspeccion: true,
            service_type: "RTM",
          }));
          return; // 🛑 Frenamos el flujo aquí mismo
        }

        if (!rpcData[0].merece_reinspeccion) {
          setSearchStatus("error");
          setMessage(rpcData[0].motivo);
          setFormData((prev) => ({
            ...prev,
            ...initialOrderFormData,
            es_reinspeccion: true,
            service_type: "RTM",
          }));
          return;
        }

        console.log("ESTE ES EL ID_REPROBADO: ", rpcData[0].id_reprobado)

        // Si Postgres dio luz verde, inyectamos el 'id_reprobado' en el estado
        setFormData((prev) => ({
          
          ...prev,
          id_reprobado: rpcData[0].id_reprobado,
        }));



      } catch (err) {
        console.error("Error inesperado en el cliente:", err);
        setSearchStatus("error");
        setMessage(
          "Ocurrió un error inesperado al validar la reinspección de RTM.",
        );
        return;
      }
    }

    try {
      const { data, error, found } = await fetchDataWithPlaca(
        placaLimpia,
        tenant_id,
      );

      if (error) {
        setSearchStatus("error");
        setMessage(typeof error === "string" ? error : error.message);
        return;
      }


    

    

      if (found) {
        setIsNewVehicle(false);
        setSearchStatus("found");
        setMessage("Vehículo encontrado correctamente en la base de datos.");

        setFormData((prev) => {
          return {
            ...prev,
            informacion_buscada: true,
            tenant_id: tenant_id,
          funcionario_id: user_id,
            // 🚗 SECCIÓN: VEHÍCULO
            vehicle: {
              ...prev.vehicle,
              placa: placaLimpia, // Forzamos la placa que se buscó con éxito
              blindaje:
                data?.vehicle?.blindaje ?? prev.vehicle?.blindaje ?? false,
              capacidad_pasajeros:
                data?.vehicle?.capacidad_pasajeros.toString() ??
                prev.vehicle?.capacidad_pasajeros ??
                "",
              cilindrada:
                data?.vehicle?.cilindrada.toString() ??
                prev.vehicle?.cilindrada ??
                "",
              clase: data?.vehicle?.clase ?? prev.vehicle?.clase ?? "",
              color: data?.vehicle?.color ?? prev.vehicle?.color ?? "",
              combustible:
                data?.vehicle?.combustible ?? prev.vehicle?.combustible ?? "",
              es_ensenanza:
                data?.vehicle?.es_ensenanza ??
                prev.vehicle?.es_ensenanza ??
                false,
              es_extranjero:
                data?.vehicle?.es_extranjero ??
                prev.vehicle?.es_extranjero ??
                false,
              linea: data?.vehicle?.linea ?? prev.vehicle?.linea ?? "",
              marca: data?.vehicle?.marca ?? prev.vehicle?.marca ?? "",
              modelo:
                data?.vehicle?.modelo.toString() ?? prev.vehicle?.modelo ?? "",
              
              tipo_servicio_vehiculo:
                data?.vehicle?.tipo_servicio_vehiculo ??
                prev.vehicle?.tipo_servicio_vehiculo ??
                "",
              tipo_vehiculo:
                data?.vehicle?.tipo_vehiculo ??
                prev.vehicle?.tipo_vehiculo ??
                "",
            },

          };
        });
      } else {
        
        setIsNewVehicle(true);
        setSearchStatus("not_found");
        setMessage(
          "No se encontraron registros previos. Puedes continuar con el registro manual.",
        );
        setFormData((prev) => ({
          ...prev,
          ...initialOrderFormData,
          id_reprobado: prev.id_reprobado,
          informacion_buscada: false,
          tenant_id: tenant_id,
          funcionario_id: user_id,
          service_type: prev.service_type,
          es_reinspeccion: prev.es_reinspeccion,

        
          vehicle: {
            ...initialOrderFormData.vehicle,
            placa: placaLimpia,
          },
        }));
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

  return (
    <fieldset
    
    >
      <div className="border-t pt-6">
        <legend className="text-xs font-bold uppercase text-muted-foreground tracking-widest my-5">
          1. Datos del Servicio
        </legend>

        <div className="p-6 space-y-8">
          {/* HEADER */}
          <div className="flex items-center gap-4">
            <div
              
            >
              <FileCheck className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight leading-none">
                Formulario de Inspeccion
              </h2>

              <p className="text-sm text-muted-foreground font-mono mt-1 flex items-center gap-2">
                <Hash className="h-3.5 w-3.5" />

                Selecciona una plantilla
              </p>
            </div>
          </div>

          {/* TIPO SERVICIO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-muted"></div>

              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
                Tipo de Inspección
              </span>

              <div className="h-px flex-1 bg-muted"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SERVICE_TYPES.map((tipo) => (
                <Label
                  key={tipo.id}
                  className={`group relative flex flex-col gap-3 rounded-xl  border-2 p-4 cursor-pointer transition-all bg-card hover:bg-accent ${
                    formData.service_type === tipo.id
                      ? "border-primary bg-accent"
                      : "border-border"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    {tipo.icon}

                    <Checkbox
                      checked={formData.service_type === tipo.id}
                      onCheckedChange={() => handleServiceTypeChange(tipo.id)}
                      className="h-5 w-5 rounded-full border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary ml-4"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black text-foreground uppercase">
                      {tipo.label}
                    </p>

                    <p className="text-[10px] text-muted-foreground font-medium">
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
              <div className="h-px flex-1 bg-muted"></div>

              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
                Tipo de Orden
              </span>

              <div className="h-px flex-1 bg-muted"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  id: "nueva",
                  label: "NUEVA INSPECCIÓN",
                  desc: "Inspección inicial del vehículo",
                  icon: <FileCheck className="h-5 w-5 text-primary" />,
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
                  className={`group relative rounded-xl flex flex-col gap-3 border-2 p-4 cursor-pointer transition-all bg-card hover:bg-accent ${
                    (tipo.id === "reinspeccion" && formData.es_reinspeccion) ||
                    (tipo.id === "nueva" && !formData.es_reinspeccion)
                      ? "border-primary bg-accent"
                      : "border-border"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    {tipo.icon}

                    <Checkbox
                      disabled={
                        formData.service_type !== "RTM" && 
                        formData.service_type !== "preventiva" && 
                        tipo.id === "reinspeccion"
                      }
                      checked={
                        tipo.id === "reinspeccion"
                          ? formData.es_reinspeccion
                          : !formData.es_reinspeccion
                      }
                      onCheckedChange={() =>
                        handleReinspeccionChange(tipo.id === "reinspeccion")
                      }
                      className="h-5 w-5 rounded-full border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary ml-4"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black text-foreground uppercase">
                      {tipo.label}
                    </p>

                    <p className="text-[10px] text-muted-foreground font-medium">
                      {tipo.desc}
                    </p>
                  </div>
                </Label>
              ))}
            </div>
          </div>

          {/* AQUÍ VA EL NUEVO COMPONENTE DE CÁMARA */}
              <div className="md:col-span-12 mb-2">
  <CameraCapture 
  key={cameraResetKey}
    formData={formData} 
    setFormData={setFormData} 
  />
</div>

          {/* PLACA */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* BUSCAR */}
              <div className="md:col-span-8">
                <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
                  <DialogTrigger
                    render={
                      <Button
                        type="button"
                        className="w-full h-16 gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all active:scale-95 cursor-pointer text-lg"
                      >
                        <Search className="h-6 w-6" />

                        {formData.es_reinspeccion
                          ? "BUSCAR PLACA PARA REINSPECCION"
                          : "BUSCAR PLACA"}
                      </Button>
                    }
                  />

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-muted-foreground" />

                        {formData.es_reinspeccion
                          ? "Buscar Reinspeccion"
                          : "Buscar Vehículo"}
                      </DialogTitle>

                      <DialogDescription>
                        Ingresa la placa del vehículo para consultar
                        información.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 pt-2">
                      {/* INPUT */}
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-foreground">
                          Ingresar Placa
                        </Label>

                        <Input
                          value={tempPlaca}
                          onChange={(e) =>
                            setTempPlaca(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!tempPlaca.trim()) return;

                              // Aquí ejecutas la función/acción que deseas disparar
                              handleBuscarPlaca();
                            }
                          }}
                          placeholder="ABC123"
                          className="h-14 uppercase font-black text-3xl border-border tracking-[0.2em] bg-card text-center"
                          maxLength={6}
                          minLength={5}
                          autoFocus
                        />
                      </div>

                       

                      {/* BOTÓN BUSCAR */}
                      <Button
                        type="button"
                        onClick={handleBuscarPlaca}
                        disabled={
                          searchStatus === "loading" || !tempPlaca.trim()
                        }
                        className="w-full h-12 gap-2 bg-primary hover:bg-primary/90"
                      >
                        {searchStatus === "loading" ? (
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
                        <div className="border rounded-xl p-4 bg-muted space-y-4">
                          {searchStatus === "loading" && (
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Consultando información...
                            </div>
                          )}

                          {searchStatus === "found" && (
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 text-sm text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />

                                <span>{message}</span>
                              </div>

                              <Button
                                type="button"
                                onClick={handleAccept}
                                className="w-full"
                              >
                                Aceptar
                              </Button>
                            </div>
                          )}

                          {searchStatus === "not_found" && (
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 text-sm text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-5 w-5 shrink-0" />

                                <span>{message}</span>
                              </div>

                              <Button
                                type="button"
                                onClick={handleAccept}
                                className="w-full"
                              >
                                Aceptar
                              </Button>
                            </div>
                          )}

                          {searchStatus === "error" && (
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 text-sm text-destructive">
                                <XCircle className="h-5 w-5 shrink-0" />

                                <span>{message}</span>
                              </div>

                              <Button
                                type="button"
                                onClick={handleAccept}
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
                <RuntScraperModal
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>
            </div>
            {/* ESTADO PLACA */}
            {/* Indicador de placa seleccionada */}
            <div
              className={`
                rounded-2xl border-2 p-6 transition-all
                ${
                  formData.vehicle.placa
                    ? "border-primary/30 bg-primary/10"
                    : "border-dashed border-border bg-muted"
                }
              `}
            >
              {formData.vehicle.placa ? (
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Placa Seleccionada
                  </span>

                  <div className="bg-card border-2 border-primary/30 rounded-2xl px-8 py-4 shadow-sm">
                    <span className="font-black tracking-[0.25em] text-3xl md:text-6xl text-foreground">
                      {formData.vehicle.placa}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-2 text-xs font-semibold rounded-full px-4 py-2 border ${
                      isNewVehicle
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
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
                <div className="flex items-center justify-center py-6 text-sm font-medium text-muted-foreground">
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
