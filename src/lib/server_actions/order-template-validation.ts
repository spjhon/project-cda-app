"use server"

import { OrderTemplateInput, orderTemplateSchema } from "@/lib/zod-schemas/order-template-schema";
import { createSupabaseServerClient } from "@/lib/supabase/server"; // Tu cliente de servidor


export async function createOrderTemplateAction(formData: OrderTemplateInput) {
  // 1. Validar con Zod
  const validatedFields = orderTemplateSchema.safeParse(formData);

  if (!validatedFields.success) {

    

    return {
      error: "Datos inválidos",
      // .issues devuelve el array de objetos planos que viste en tu consola
    details: validatedFields.error.issues,
    };
  }

  // 2. Si es válido, llamar a Supabase (RPC)
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase.rpc('test_receive_template', { 
  p_data: {
    ...validatedFields.data,
    // Convertimos el objeto Date a un string que Postgres entiende perfectamente
    document_date: validatedFields.data.document_date.toISOString() 
  } 
});

if (error) {
  return { error: "Error en la base de datos", details: error.message };
}

return { success: true, message: data };
}