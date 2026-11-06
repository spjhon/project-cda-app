"use client";

import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import { useContext, useState } from "react";
import SimplePlacaSelectionSection from "./SimplePlacaSelectionSection";
import SimpleVehicleDataSection from "./SimpleVehicleDataSection";
import { Button } from "@/components/ui/button";
import { SendHorizontal, ShieldCheck } from "lucide-react";
import { GenericSuccessDialog } from "@/components/feedbackDialogs/GenericSuccessDialog";
import { GenericErrorDialog } from "@/components/feedbackDialogs/GenericErrorDialog";
import { SimpleOrderSchema, simpleOrderSchema } from "@/lib/zod-schemas/validaciones-formularios/simple-order-schema";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";

export const initialOrderFormData = {
  id: "",
  tenant_id: "",
  funcionario_id: "",
  id_reprobado: "",
  es_reinspeccion: false,
  service_type: "RTM",
  estado_orden: "abierta",
  soat_vencimiento_snapshot: "",
  informacion_buscada: false,
  // --- ENTIDAD VEHÍCULO ---
  vehicle: {
    id: "",
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
    es_extranjero: false,
    soat_vigente_de_acuerdo_al_runt: "",
    fecha_vencimiento_rtm: "",
    organismo_que_expidio_ultima_rtm: "",
    rtm_vigente_de_acuerdo_al_runt: "",
    se_encontro_fecha_vencimiento_rtm: "",
    fecha_matricula: "",
  },
};

export type SimpleOrderFormData = typeof initialOrderFormData;

export default function NewSimpleEntryOrderComponent() {
  const PermissionsContextReceived = useContext(PermissionsContext);

  const [formData, setFormData] = useState(initialOrderFormData);
  console.log(formData)
  // Diálogo de éxito
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessages, setSuccessMessages] = useState<
    string | string[] | null
  >(null);

  // Diálogo de error
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string | string[] | null>(
    null,
  );

  const supabaseBrowser = createSupabaseBrowserClient();

  const createSimpleOrderMutation = useMutation({
    mutationFn: async (data: SimpleOrderSchema) => {
      const { data: response, error } = await supabaseBrowser.rpc(
        "create_simple_order", // PLACEHOLDER: nombre del RPC
        {
          p_order_data: data, // PLACEHOLDER: parámetro del RPC
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      return response;
    },

    onSuccess: () => {
      // Reiniciar formulario
      setFormData(initialOrderFormData);

      // Mensaje de éxito
      setSuccessMessages("La orden fue registrada correctamente.");

      // Mostrar diálogo
      setShowSuccessDialog(true);
    },

    onError: (error: Error) => {
      // Mostrar el error recibido
      setErrorMessages(
        error.message || "Ocurrió un error al registrar la orden.",
      );

      setShowErrorDialog(true);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = simpleOrderSchema.safeParse(formData);

    if (!result.success) {
      setErrorMessages(result.error.issues.map((issue) => issue.message));
      setShowErrorDialog(true);
      return;
    }

    console.log(result.success);

    createSimpleOrderMutation.mutate(result.data);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-8 mx-auto space-y-8">
        {/**TITULO SUPERIOR */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Registro de Nuevo Servicio{" "}
            {`${PermissionsContextReceived?.PermissionsContextValue.tenantObject?.name}`}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Complete la informacion del servicio a prestar y el vehiculo. En
            caso de no haber coneccion al RUNT, solo es requerido la marca, lina
            y modelo.
          </p>
        </div>

        {/**El div que contiene todas las secciones del formulario */}
        <div className="flex flex-col gap-6">
          {/**SECCION DE BUSQUEDA DE PLACA */}
          <SimplePlacaSelectionSection
            setFormData={setFormData}
            formData={formData}
          ></SimplePlacaSelectionSection>
        </div>
        {/**SECCION DE DATOS DEL VEHICULO */}
        <SimpleVehicleDataSection
          formData={formData}
          setFormData={setFormData}
        />

        {/**SECCION finalizado de la orden de entrada */}
        <fieldset
          className={`mt-2 transition-all duration-500 ${formData.vehicle.placa ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}
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
              disabled={createSimpleOrderMutation.isPending}
              className="group relative h-16 sm:h-20 w-full max-w-xl bg-slate-900 hover:bg-emerald-600 dark:bg-slate-50 dark:hover:bg-emerald-600 text-white dark:text-slate-950 dark:hover:text-white rounded-2xl shadow-xl transition-all duration-500 hover:scale-[1.01] active:scale-[0.98] overflow-hidden px-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

              <div className="flex items-center justify-between w-full sm:justify-center sm:gap-6">
                <span className="text-sm sm:text-lg md:text-xl font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] truncate">
                  {createSimpleOrderMutation.isPending
                    ? "Procesando..."
                    : "Crear Orden de Entrada"}
                </span>

                <div className="shrink-0 bg-white/10 dark:bg-slate-950/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors ml-2">
                  <SendHorizontal className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </Button>

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

        <GenericSuccessDialog
          isOpen={showSuccessDialog}
          setIsOpen={setShowSuccessDialog}
          headerText="¡Registro exitoso!"
          descriptionText="El servicio fue registrado correctamente."
          messages={successMessages}
        />

        <GenericErrorDialog
          isOpen={showErrorDialog}
          setIsOpen={setShowErrorDialog}
          headerText="Error al registrar el servicio"
          descriptionText="No fue posible completar el registro de la orden."
          errors={errorMessages}
        />
      </form>
    </>
  );
}
