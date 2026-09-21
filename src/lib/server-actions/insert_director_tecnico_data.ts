"use server";

import { DirectorTecnicoFormState } from "@/components/dashboard/director-tecnico/DirectorTecnicoOrderForm";
import { createSupabaseServerClient } from "../supabase/server";
import { directorTecnicoOrderSchema } from "@/lib/zod-schemas/directorTecnico-schema";
import { ServiceType } from "../zod-schemas/order-schema";

interface UpdateDirectorTecnicoOrderArgs {
  orderId: string;
  formData: DirectorTecnicoFormState;
  serviceType: ServiceType;
}

// Interface para el retorno del RPC
interface UpdateOrderResult {
  id: string;
  message: string;
}

export async function insertDirectorTecnicoData({
  orderId,
  formData,
  serviceType,
}: UpdateDirectorTecnicoOrderArgs) {
  // ============================================================
  // 1. VALIDACIONES BÁSICAS PREVIAS
  // ============================================================

  if (!orderId || orderId === "") {
    return {
      data: null,
      error: "Error: No hay una orden de entrada válida",
    };
  }

  if (!formData.resultado_revision) {
    return {
      data: null,
      error: "Error: No se ha seleccionado el resultado final de la revisión",
    };
  }

  if (formData.consecutivo_fur.trim() === "") {
    return {
      data: null,
      error: "Error: El consecutivo del FUR es obligatorio",
    };
  }

  // Regla de negocio explícita previa a Zod
  if (
    formData.resultado_revision === "aprobado" &&
    (!formData.consecutivo_rtm ||
      formData.consecutivo_rtm.trim() === "") &&
    serviceType !== "preventiva" &&
    serviceType !== "peritaje"
  ) {
    return {
      data: null,
      error: "Error: Si la revisión es APROBADA, debe ingresar el consecutivo RTM",
    };
  }

  const dataToValidate = {
    ...formData,
    serviceType: serviceType,
  };

  // ============================================================
  // 2. VALIDACIÓN ESTRICTA CON ZOD
  // ============================================================

  const validatedFields =
    directorTecnicoOrderSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.issues,
    };
  }

  // ============================================================
  // 3. EXTRACCIÓN LIMPIA DE LA DATA VALIDADA
  // ============================================================

  const {
    resultado_revision,
    consecutivo_fur,
    consecutivo_rtm,
  } = validatedFields.data;

  // Si fue rechazado por defectos, el certificado RTM
  // obligatoriamente viaja como NULL a Postgres.
  const rtmFinal =
    resultado_revision === "rechazado"
      ? null
      : consecutivo_rtm;

  // ============================================================
  // 4. CLIENTE SUPABASE SERVER
  // ============================================================

  const supabaseServer = await createSupabaseServerClient();

  // ============================================================
  // VARIABLES PARA LIMPIEZA
  // ============================================================

  const directorTecnicoFirmaSnapshotPath =
    `entry_orders/${orderId}/firma_director_tecnico.jpeg`;

  let directorTecnicoFirmaSnapshotCreated = false;

  try {
    // ============================================================
    // 5. VALIDAR QUE EXISTA LA RUTA DE LA FIRMA ORIGINAL
    // ============================================================

    if (!formData.director_tecnico_firma_path_snapshot) {
      throw new Error(
        "El director técnico no tiene una ruta de firma registrada.",
      );
    }

    // ============================================================
    // 6. DESCARGAR FIRMA ACTUAL DEL DIRECTOR TÉCNICO
    // ============================================================

    const {
      data: firmaData,
      error: firmaDownloadError,
    } = await supabaseServer.storage
      .from("signatures")
      .download(
        formData.director_tecnico_firma_path_snapshot,
      );

    if (firmaDownloadError || !firmaData) {
      throw new Error(
        `No se pudo obtener la imagen de la firma del director técnico: ${
          firmaDownloadError?.message ??
          "Archivo no encontrado."
        }`,
      );
    }

    // ============================================================
    // 7. SUBIR SNAPSHOT DE LA FIRMA A LA ORDEN
    // ============================================================

    const {
      error: firmaUploadError,
    } = await supabaseServer.storage
      .from("signatures")
      .upload(
        directorTecnicoFirmaSnapshotPath,
        firmaData,
        {
          contentType: "image/jpeg",
          upsert: true,
        },
      );

    if (firmaUploadError) {
      throw new Error(
        `No se pudo guardar el snapshot de la firma del director técnico: ${firmaUploadError.message}`,
      );
    }

    directorTecnicoFirmaSnapshotCreated = true;

    console.log(
      "✅ Snapshot de firma del director técnico almacenado:",
      directorTecnicoFirmaSnapshotPath,
    );

    // ============================================================
    // 8. INVOCACIÓN SEGURA MEDIANTE RPC-FIRST
    // ============================================================

    const {
      data: dtUpdatedData,
      error,
    } = await supabaseServer.rpc(
      "update_director_tecnico_order",
      {
        p_order_id: orderId,
        p_resultado_revision: resultado_revision,
        p_consecutivo_fur: consecutivo_fur,
        p_consecutivo_rtm: rtmFinal ?? "",

        p_director_tecnico_tipo_documento_snapshot:
          formData.director_tecnico_tipo_documento_snapshot ?? "",

        p_director_tecnico_numero_documento_snapshot:
          formData.director_tecnico_numero_documento_snapshot ?? "",

        p_director_tecnico_nombre_snapshot:
          formData.director_tecnico_nombre_snapshot ?? "",

        // IMPORTANTE:
        // Guardamos la ruta del SNAPSHOT creado para esta orden.
        p_director_tecnico_firma_path_snapshot:
          directorTecnicoFirmaSnapshotPath,
      },
    );

    // ============================================================
    // 9. SI FALLA EL RPC, LANZAMOS ERROR
    // ============================================================

    if (error) {
      throw new Error(
        `No se pudo actualizar la orden con el cierre técnico: ${error.message}`,
      );
    }

    // ============================================================
    // 10. VALIDAR QUE EL RPC RETORNÓ DATOS
    // ============================================================

    if (!dtUpdatedData) {
      throw new Error(
        "No se recibió respuesta del servidor después de actualizar la orden.",
      );
    }

    // ============================================================
    // 11. CASTEO DEL RESULTADO DEL RPC
    // ============================================================

    const result =
      dtUpdatedData as unknown as UpdateOrderResult;

    // ============================================================
    // 12. TRAZABILIDAD
    // ============================================================

    console.log(
      "✅ Cierre técnico ISO 17020 actualizado correctamente:",
    );

    console.log(
      `📦 Orden ID: ${result.id} | Dictamen: ${resultado_revision.toUpperCase()} | FUR: ${consecutivo_fur}`,
    );

    console.log(
      `📝 Mensaje: ${result.message}`,
    );

    console.log(
      `✍️ Firma del director técnico: ${directorTecnicoFirmaSnapshotPath}`,
    );

    // ============================================================
    // 13. RETORNO EXITOSO
    // ============================================================

    return {
      data: {
        id: result.id,
        message: result.message,
      },
      error: null,
    };
  } catch (error: unknown) {
    // ============================================================
    // ERROR GENERAL
    // ============================================================

    console.error(
      "❌ Error durante el cierre técnico:",
      error,
    );

    // ============================================================
    // LIMPIEZA DEL SNAPSHOT DE FIRMA
    //
    // Si la firma alcanzó a subirse pero después falló
    // el RPC u otra operación, eliminamos el archivo.
    // ============================================================

    if (directorTecnicoFirmaSnapshotCreated) {
      const {
        error: deleteSignatureError,
      } = await supabaseServer.storage
        .from("signatures")
        .remove([
          directorTecnicoFirmaSnapshotPath,
        ]);

      if (deleteSignatureError) {
        console.error(
          "❌ No se pudo eliminar el snapshot de la firma del director técnico:",
          deleteSignatureError.message,
        );
      } else {
        console.log(
          "🧹 Snapshot de firma eliminado correctamente después del error.",
        );
      }
    }

    // ============================================================
    // ERROR PARA EL CLIENTE
    // ============================================================

    if (error instanceof Error) {
      return {
        data: null,
        error: error.message,
      };
    }

    return {
      data: null,
      error:
        "Ocurrió un error inesperado durante el cierre técnico.",
    };
  }
}