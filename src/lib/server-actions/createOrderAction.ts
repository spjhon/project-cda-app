"use server";

import { createSupabaseServerClient } from "../supabase/server";
import {
  ZodFullFormDataSchema,
  ZodFullFormDataType,
} from "../zod-schemas/order-schema";

export async function createOrderAction(
  formData: ZodFullFormDataType,
  activeModules: string[],
) {
  // Normalizamos clase y combustible para comparar sin problemas de mayúsculas o tildes
  const claseVehiculo =
    formData.vehicle.clase?.toString().toLowerCase().trim() || "";
  const combustibleVehiculo =
    formData.vehicle.combustible
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
    "motocicleta",
  ];

  const combustiblesPermitidos = ["gasolina", "electrico"];

  // Evaluamos cuál de las condiciones es verdadera
  switch (true) {
    case formData.vehicle.combustible === "":
      return {
        data: null,
        error: "Error: El tipo de combustible del vehículo es obligatorio.",
      };

    case formData.vehicle.clase === "":
      return {
        data: null,
        error:
          "Error: La clase del vehículo (Liviano, Pesado, Moto, etc.) no está presente.",
      };

    case formData.vehicle.tipo_vehiculo === "":
      return {
        data: null,
        error: "Error: El tipo de vehículo no ha sido seleccionado.",
      };

    case formData.vehicle.tipo_servicio_vehiculo === "":
      return {
        data: null,
        error:
          "Error: El tipo de servicio (Público, Particular, etc.) es requerido.",
      };

    // Validar que solo sea Gasolina o Eléctrico
    case clasesSoloGasolinaOElectrico.includes(claseVehiculo) &&
      !combustiblesPermitidos.includes(combustibleVehiculo):
      return {
        data: null,
        error: `Error: Vehículos de clase '${formData.vehicle.clase}' solo pueden registrar combustible Gasolina o Eléctrico. Es posible que la motocicleta se encuentre en el RUNT como Diesel o un combustible diferente de gasolina y electrico, si es asi dar aviso al DIRECTOR TECNICO inmediatamente.`,
      };

    // Si ninguno está vacío/inválido, el flujo continúa normalmente hacia el guardado
  }









  if (activeModules.includes("sarlaft")) {



    // Ejecutar validaciones SARLAFT

    // ============================================================
    // VALIDACIONES SARLAFT / DATOS DEL CLIENTE Y PROPIETARIO
    // ============================================================

    // -------------------------
    // CLIENTE
    // -------------------------

    if (formData.customer_data.origen_fondos.trim() === "") {
      return {
        data: null,
        error: "Error: El origen de fondos del cliente es obligatorio.",
      };
    }

    if (formData.customer_data.actividad_economica.trim() === "") {
      return {
        data: null,
        error: "Error: La actividad económica del cliente es obligatoria.",
      };
    }

    if (formData.customer_data.es_persona_publicamente_expuesta === true) {
      return {
        data: null,
        error:
          "Error: El cliente está registrado como Persona Expuesta Políticamente (PEP) y no puede continuar con el procedimiento de RTM.",
      };
    }

    if (formData.customer_data.se_hizo_la_consulta === false) {
      return {
        data: null,
        error:
          "Error: No se ha realizado la consulta SARLAFT del cliente. Debe realizar la consulta antes de continuar con el procedimiento de RTM.",
      };
    }

    if (
      formData.customer_data.resultado_consulta_sarlaf_desfavorable === true
    ) {
      return {
        data: null,
        error:
          "Error: La consulta SARLAFT del cliente presentó coincidencias desfavorables. No es posible continuar con el procedimiento de RTM.",
      };
    }

    // -------------------------
    // PROPIETARIO
    // -------------------------

    

    if (formData.owner_data.se_hizo_la_consulta === false) {
      return {
        data: null,
        error:
          "Error: No se ha realizado la consulta SARLAFT del propietario. Debe realizar la consulta antes de continuar con el procedimiento de RTM.",
      };
    }

    if (formData.owner_data.resultado_consulta_sarlaf_desfavorable === true) {
      return {
        data: null,
        error:
          "Error: La consulta SARLAFT del propietario presentó coincidencias desfavorables. No es posible continuar con el procedimiento de RTM.",
      };
    }

  }

  const validatedFields = ZodFullFormDataSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { data: null, error: validatedFields.error.issues };
  }

  // Si es válido, llamar a Supabase (RPC)
  const supabaseServer = await createSupabaseServerClient();

  const { data: orderCreatedData, error } = await supabaseServer.rpc(
    "create_full_order",
    {
      p_data: validatedFields.data,
    },
  );

  if (error) {
    return { data: null, error: error.message };
  }

  console.log("Datos enviados correctamente:");



if (activeModules.includes("sarlaft")) {
  const { data: sarlaftData, error: sarlaftError } = await supabaseServer.rpc("create_sarlaft_evidence", { 
    
      p_entry_order_id: orderCreatedData,

  
      // CLIENTE
      // ========================================================
      p_customer_actividad_economica: formData.customer_data.actividad_economica,

      p_customer_origen_fondos: formData.customer_data.origen_fondos,

      p_customer_es_persona_publicamente_expuesta: formData.customer_data.es_persona_publicamente_expuesta,

      // ========================================================
      // PROPIETARIO
      // ========================================================
      p_owner_actividad_economica: formData.owner_data.actividad_economica,

      p_owner_origen_fondos: formData.owner_data.origen_fondos,

      p_owner_es_persona_publicamente_expuesta: formData.owner_data.es_persona_publicamente_expuesta,
    });

  if (sarlaftError) {
    console.error(
      "❌ Error creando evidencia SARLAFT:",
      sarlaftError.message,
    );

    return {
      data: null,
      error: `Se creo la orden de entrada pero no se guardaron los datos sarlaft, favor comunicarse con servico tecnico de cdApp: ${sarlaftError.message}`,
    };
  }

  console.log("✅ Evidencia SARLAFT creada:", sarlaftData);
}





  return { data: orderCreatedData, error: null };
}
