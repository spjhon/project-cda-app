



"use server"

import { createSupabaseServerClient } from "../supabase/server";
import { ZodFullFormDataSchema, ZodFullFormDataType } from "../zod-schemas/order-schema";




export async function createOrderAction(formData: ZodFullFormDataType) {




// 1. Verificamos si al menos uno de los resultados tiene el valor "no_cumple"
const tieneCondicionesNoCumplidas = formData.condition_results.some(
  (result) => result.value === "no_cumple"
);

// 2. Si encuentra alguna, disparamos el error de inmediato
if (tieneCondicionesNoCumplidas) {
  return {
    data: null,
    error: "Error: No se puede enviar la orden de entrada ya que existen condiciones que no se cumplen en la inspección."
  };
}




    // Evaluamos cuál de las condiciones es verdadera (está vacía)
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

  // Si ninguno está vacío, el flujo continúa normalmente hacia el guardado
}



const validatedFields = ZodFullFormDataSchema.safeParse(formData);


if (!validatedFields.success){
    
    return {data: null, error: validatedFields.error.issues}
}



 //Si es válido, llamar a Supabase (RPC)
  const supabaseServer = await createSupabaseServerClient();


  const { data: orderCreatedData, error } = await supabaseServer.rpc('create_full_order', { 
  p_data: validatedFields.data});

  if (error) {
    return { data: null, error: error.message };
  }


console.log("Datos enviados correctamente:")

console.log(validatedFields.data)

return {data: orderCreatedData, error: null}


} 