"use server";

import { randomUUID } from "crypto";
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





let orderCreatedData: string | null = null;
let firmaSnapshotCreated = false;
const uploadedSignaturePaths: string[] = [];


try {
  const { data, error: orderError } =
    await supabaseServer.rpc("create_full_order", {
      p_data: validatedFields.data,
    });


    orderCreatedData = data;

  // ============================================================
  // SI FALLA LA CREACIÓN DE LA ORDEN, NO CONTINUAMOS
  // ============================================================

  if (orderError ) {
    throw new Error(
      `No se pudo crear la orden de entrada: ${orderError.message}`,
    );
  }

  if (!orderCreatedData ) {
    throw new Error(
      `No se pudo crear la orden de entrada. No existe el id de la nueva orden de entrada`,
    );
  }

  console.log("✅ Datos de la orden enviados correctamente.");

  // Guardamos el path por si posteriormente necesitamos eliminar
  // la imagen durante la limpieza del catch.
  const funcionarioFirmaSnapshotPath = `entry_orders/${orderCreatedData}/firma_inspector.jpeg`;

  // ============================================================
  // CREAR SNAPSHOT DE LA FIRMA DEL FUNCIONARIO
  // ============================================================

  const { data: funcionarioData, error: funcionarioError } =
    await supabaseServer
      .from("service_users")
      .select("signature_path")
      .eq("id", validatedFields.data.funcionario_id)
      .single();

  if (funcionarioError) {
    throw new Error(
      `No se pudo obtener la firma del funcionario: ${funcionarioError.message}`,
    );
  }

  if (!funcionarioData?.signature_path) {
    throw new Error(
      "El funcionario no tiene una firma registrada. No se puede crear la orden.",
    );
  }

  // ============================================================
  // DESCARGAR FIRMA ACTUAL DEL FUNCIONARIO
  // ============================================================

  const { data: firmaData, error: firmaDownloadError } =
    await supabaseServer.storage
      .from("signatures")
      .download(funcionarioData.signature_path);

  if (firmaDownloadError || !firmaData) {
    throw new Error(
      `No se pudo obtener la imagen de la firma del funcionario: ${
        firmaDownloadError?.message ?? "Archivo no encontrado."
      }`,
    );
  }

  // ============================================================
  // SUBIR SNAPSHOT A LA ORDEN
  // ============================================================

  const { error: firmaUploadError } = await supabaseServer.storage
    .from("signatures")
    .upload(funcionarioFirmaSnapshotPath, firmaData, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (firmaUploadError) {
    throw new Error(
      `No se pudo guardar el snapshot de la firma del funcionario: ${firmaUploadError.message}`,
    );
  }

  

firmaSnapshotCreated = true;

  // ============================================================
  // GUARDAR PATH DEL SNAPSHOT EN LA ORDEN
  // ============================================================

  const { error: firmaPathUpdateError } = await supabaseServer
    .from("entry_orders")
    .update({
      funcionario_firma_path_snapshot: funcionarioFirmaSnapshotPath,
    })
    .eq("id", orderCreatedData);

  if (firmaPathUpdateError) {
    throw new Error(
      `La firma fue almacenada, pero no se pudo guardar su ruta en la orden: ${firmaPathUpdateError.message}`,
    );
  }





// =========================================================================
// FIRMAS DE LA ORDEN
// =========================================================================

for (const firma of validatedFields.data.signatures ?? []) {
  const orderSignatureId = randomUUID();

  const signaturePath = `entry_orders/${orderCreatedData}/${orderSignatureId}.jpeg`;

  const [metadata, base64Data] = firma.signature_url.split(",");

  if (!metadata || !base64Data) {
    throw new Error(
      "Una de las firmas de la orden tiene un formato Base64 inválido.",
    );
  }

  const mimeType = metadata.match(/^data:(.*);base64$/)?.[1];

  if (mimeType !== "image/jpeg") {
    throw new Error(
      `La firma ${orderSignatureId} no está en formato JPEG.`,
    );
  }

  const signatureBuffer = Buffer.from(base64Data, "base64");

  const { error: signatureUploadError } =
    await supabaseServer.storage
      .from("signatures")
      .upload(signaturePath, signatureBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

  if (signatureUploadError) {
    throw new Error(
      `No se pudo almacenar una firma de la orden: ${signatureUploadError.message}`,
    );
  }

  uploadedSignaturePaths.push(signaturePath);

  const { error: signatureInsertError } =
    await supabaseServer
      .from("order_signatures")
      .insert({
        id: orderSignatureId,
        tenant_id: validatedFields.data.tenant_id,
        entry_order_id: orderCreatedData,
        template_signature_id: firma.template_signature_id,
        
        signature_path: signaturePath,
      });

  if (signatureInsertError) {
    throw new Error(
      `No se pudo registrar la firma de la orden en la base de datos: ${signatureInsertError.message}`,
    );
  }
}






















  // ============================================================
  // SARLAFT
  // ============================================================

  if (activeModules.includes("sarlaft")) {
    const { data: sarlaftData, error: sarlaftError } =
      await supabaseServer.rpc("create_sarlaft_evidence", {
        p_entry_order_id: orderCreatedData,

        // CLIENTE
        // ========================================================
        p_customer_actividad_economica:
          formData.customer_data.actividad_economica,

        p_customer_origen_fondos:
          formData.customer_data.origen_fondos,

        p_customer_es_persona_publicamente_expuesta:
          formData.customer_data
            .es_persona_publicamente_expuesta,

        // PROPIETARIO
        // ========================================================
        p_owner_actividad_economica:
          formData.owner_data.actividad_economica,

        p_owner_origen_fondos:
          formData.owner_data.origen_fondos,

        p_owner_es_persona_publicamente_expuesta:
          formData.owner_data
            .es_persona_publicamente_expuesta,
      });

    if (sarlaftError) {
      throw new Error(
        `Se creó la orden pero falló el registro SARLAFT: ${sarlaftError.message}`,
      );
    }

    console.log(
      "✅ Evidencia SARLAFT creada:",
      sarlaftData,
    );
  }

  // ============================================================
  // TODO CORRECTO
  // ============================================================

  return {
    data: orderCreatedData,
    error: null,
  };
} catch (error: unknown) {
  console.error("❌ Error creando la orden:", error);

// ============================================================
  // LIMPIEZA de las firmas
  // ============================================================

  if (uploadedSignaturePaths.length > 0) {
  const { error: deleteOrderSignaturesError } =
    await supabaseServer.storage
      .from("signatures")
      .remove(uploadedSignaturePaths);

  if (deleteOrderSignaturesError) {
    console.error(
      "❌ No se pudieron eliminar las firmas de la orden:",
      deleteOrderSignaturesError.message,
    );
  }
}

  // ============================================================
  // LIMPIEZA DE STORAGE
  // ============================================================

  if (orderCreatedData && firmaSnapshotCreated) {
  const funcionarioFirmaSnapshotPath =
    `entry_orders/${orderCreatedData}/firma_inspector.jpeg`;

  const { error: deleteSignatureError } =
    await supabaseServer.storage
      .from("signatures")
      .remove([funcionarioFirmaSnapshotPath]);

  if (deleteSignatureError) {
    console.error(
      "❌ No se pudo eliminar la firma del funcionario:",
      deleteSignatureError.message,
    );
  }
}

  // ============================================================
  // LIMPIEZA DE LA ORDEN
  // ============================================================

  if (orderCreatedData) {
    const { error: deleteOrderError } =
      await supabaseServer
        .from("entry_orders")
        .delete()
        .eq("id", orderCreatedData);

    if (deleteOrderError) {
      console.error(
        "❌ No se pudo eliminar la orden creada:",
        deleteOrderError.message,
      );

      return {
        data: null,
        error: `Ocurrió un error después de crear la orden y no fue posible realizar la limpieza automáticamente. Error original: ${
          error instanceof Error
            ? error.message
            : "Error desconocido."
        }. Error al eliminar la orden: ${deleteOrderError.message}`,
      };
    }
  }

  // ============================================================
  // ERROR ORIGINAL
  // ============================================================

  if (error instanceof Error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: null,
    error: "Ocurrió un error inesperado al crear la orden.",
  };
}






}
