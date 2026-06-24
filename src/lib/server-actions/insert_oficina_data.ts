"use server"

import { createSupabaseServerClient } from "../supabase/server";
import { officeOrderSchema, OfficeOrderInput } from "@/lib/zod-schemas/oficinaInfo-schema";

interface UpdateOfficeOrderArgs {
  orderId: string;
  formData: OfficeOrderInput;
}

export async function insertOficinaData({ orderId, formData }: UpdateOfficeOrderArgs) {

  if (!orderId || orderId === "") {
      return { 
        data: null, 
        error: "Error: No hay una orden de entrada valida" 
      };
    }

if (formData.oficina_consecutivo_factura.trim() === "") {
      return { 
        data: null, 
        error: "Error: No hay consecutivo de factura" 
      };
    }


if (formData.oficina_pago === 0) {
      return { 
        data: null, 
        error: "Error: No hay un pago registrado" 
      };
    }
    

if (formData.oficina_pin.trim() === "") {
      return { 
        data: null, 
        error: "Error: No se ha registrado un pin" 
      };
    }

if (formData.oficina_tipo_pago === null) {
      return { 
        data: null, 
        error: "Error: No hay un tipo de pago" 
      };
    }


// 🌟 VALIDADOR COMPLEMENTARIO: EXIGIR NÚMERO DE APROBACIÓN PARA TARJETAS
  const requiereTarjeta = formData.oficina_tipo_pago === "tarjeta_debito" || formData.oficina_tipo_pago === "tarjeta_credito";


  if (requiereTarjeta && (!formData.oficina_num_aprobacion || formData.oficina_num_aprobacion.trim() === "")) {
    return {
      data: null,
      error: "Error: Las transacciones con tarjeta requieren el número de aprobación / voucher."
    };
  }

//await new Promise((resolve) => setTimeout(resolve, 5000));


  // 2. Validación estricta con el Zod Schema
  const validatedFields = officeOrderSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { 
      data: null, 
      error: validatedFields.error.issues 
    };
  }

  // 3. Inicialización del cliente de Supabase con sesión del servidor
  const supabaseServer = await createSupabaseServerClient();





  // 4. Invocación segura mediante RPC-first pasando el payload tipado a Postgres
  const { data: officeUpdatedData, error } = await supabaseServer.rpc('update_office_order_data', {
    p_order_id: orderId,
    p_pin: validatedFields.data.oficina_pin,
    p_pago: validatedFields.data.oficina_pago,
    p_consecutivo_factura: validatedFields.data.oficina_consecutivo_factura,
    p_tipo_pago: validatedFields.data.oficina_tipo_pago,
    p_se_compro_soat: validatedFields.data.se_compro_soat,
    p_num_aprobacion: validatedFields.data.oficina_num_aprobacion // 🌟 PASADO AL RPC
  });

  // 5. Gestión de errores provenientes del motor de base de datos
  if (error) {
    return { 
      data: null, 
      error: error.message 
    };
  }



  // 6. Trazabilidad e impresión limpia en los logs de la consola del servidor
  console.log("Datos de liquidación de oficina actualizados correctamente:");
  console.log(`Orden ID: ${orderId}`);
 

  return { 
    data: `Exito: ${officeUpdatedData}` , 
    error: null
  };
}