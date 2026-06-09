"use server"

import { OrderTemplateInput, orderTemplateSchema } from "@/lib/zod-schemas/order-template-schema";
import { createSupabaseServerClient } from "@/lib/supabase/server"; // Tu cliente de servidor


export async function createOrderTemplateAction(formData: OrderTemplateInput) {
  // 1. Validar con Zod
  const validatedFields = orderTemplateSchema.safeParse(formData);

  if (!validatedFields.success) {

    

    return {
      data: null,
      // .issues devuelve el array de objetos planos que viste en tu consola
    error: "Error en la validacon de zod",
    };
  }

  // 2. Si es válido, llamar a Supabase (RPC)
  const supabase = await createSupabaseServerClient()
  
 

  const { error } = await supabase.rpc('create_full_order_template', { 
  p_data: {
    ...validatedFields.data,
    // Convertimos el objeto Date a un string que Postgres entiende perfectamente
    document_date: validatedFields.data.document_date.toISOString() 
  } 
  });

  if (error) {
    return { data: null, error: error.message };
  }

  
  return { data: "Plantilla creada correctamente", error: null };




}