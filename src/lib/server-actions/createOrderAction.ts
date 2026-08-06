"use server"

import { createSupabaseServerClient } from "../supabase/server";
import { ZodFullFormDataSchema, ZodFullFormDataType } from "../zod-schemas/order-schema";

export async function createOrderAction(formData: ZodFullFormDataType) {

  // Normalizamos clase y combustible para comparar sin problemas de mayúsculas o tildes
  const claseVehiculo = formData.vehicle.clase?.toString().toLowerCase().trim() || "";
  const combustibleVehiculo = formData.vehicle.combustible
    ?.toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes para evaluar 'electrico' sin problema
    .trim() || "";

  const clasesSoloGasolinaOElectrico = [
    "ciclomotor",
    "tricimoto",
    "cuadriciclo",
    "mototriciclo",
    "motocicleta"
  ];

  const combustiblesPermitidos = ["gasolina", "electrico"];

  // Evaluamos cuál de las condiciones es verdadera
  switch (true) {
    case formData.vehicle.combustible === "":
      return { 
        data: null, 
        error: "Error: El tipo de combustible del vehículo es obligatorio." 
      };

    case formData.vehicle.clase === "":
      return { 
        data: null, 
        error: "Error: La clase del vehículo (Liviano, Pesado, Moto, etc.) no está presente." 
      };

    case formData.vehicle.tipo_vehiculo === "":
      return { 
        data: null, 
        error: "Error: El tipo de vehículo no ha sido seleccionado." 
      };

    case formData.vehicle.tipo_servicio_vehiculo === "":
      return { 
        data: null, 
        error: "Error: El tipo de servicio (Público, Particular, etc.) es requerido." 
      };

    // Validar que solo sea Gasolina o Eléctrico
    case clasesSoloGasolinaOElectrico.includes(claseVehiculo) && !combustiblesPermitidos.includes(combustibleVehiculo):
      return {
        data: null,
        error: `Error: Vehículos de clase '${formData.vehicle.clase}' solo pueden registrar combustible Gasolina o Eléctrico. Es posible que la motocicleta se encuentre en el RUNT como Diesel o un combustible diferente de gasolina y electrico, si es asi dar aviso al DIRECTOR TECNICO inmediatamente.`
      };

    // Si ninguno está vacío/inválido, el flujo continúa normalmente hacia el guardado
  }

  const validatedFields = ZodFullFormDataSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { data: null, error: validatedFields.error.issues };
  }

  // Si es válido, llamar a Supabase (RPC)
  const supabaseServer = await createSupabaseServerClient();

  const { data: orderCreatedData, error } = await supabaseServer.rpc('create_full_order', { 
    p_data: validatedFields.data
  });

  if (error) {
    return { data: null, error: error.message };
  }

  console.log("Datos enviados correctamente:");

  return { data: orderCreatedData, error: null };
}