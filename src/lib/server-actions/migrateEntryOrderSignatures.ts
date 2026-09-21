"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface MigrationResult {
  funcionarioFound: number;
  funcionarioMigrated: number;
  funcionarioSkipped: number;
  funcionarioFailed: number;

  directorFound: number;
  directorMigrated: number;
  directorSkipped: number;
  directorFailed: number;

  errors: string[];
}

export async function migrateEntryOrderSignatures(): Promise<{
  data: MigrationResult | null;
  error: string | null;
}> {
  const supabaseAdmin = createSupabaseAdminClient();

  const result: MigrationResult = {
    funcionarioFound: 0,
    funcionarioMigrated: 0,
    funcionarioSkipped: 0,
    funcionarioFailed: 0,

    directorFound: 0,
    directorMigrated: 0,
    directorSkipped: 0,
    directorFailed: 0,

    errors: [],
  };

  try {
    // ==========================================
    // 1. FIRMAS DEL FUNCIONARIO
    // ==========================================

    const { data: funcionarioOrders, error: funcionarioFetchError } =
      await supabaseAdmin
        .from("entry_orders")
        .select(
          "id, consecutivo, funcionario_firma_base64_snapshot, funcionario_firma_path_snapshot",
        )
        .not("funcionario_firma_base64_snapshot", "is", null);

    if (funcionarioFetchError) {
      throw new Error(
        `No se pudieron consultar las firmas de funcionarios: ${funcionarioFetchError.message}`,
      );
    }

    result.funcionarioFound = funcionarioOrders.length;

    for (const order of funcionarioOrders) {
      if (order.funcionario_firma_path_snapshot) {
        result.funcionarioSkipped++;
        continue;
      }

      if (!order.funcionario_firma_base64_snapshot) {
        result.funcionarioSkipped++;
        continue;
      }

      const signaturePath =
        `entry_orders/${order.id}/firma_inspector.jpeg`;

      try {
        let base64Data =
          order.funcionario_firma_base64_snapshot;

        if (base64Data.includes(",")) {
          const [, data] = base64Data.split(",", 2);

          if (!data) {
            throw new Error(
              "El Base64 del funcionario no contiene datos válidos.",
            );
          }

          base64Data = data;
        }

        const signatureBuffer = Buffer.from(
          base64Data,
          "base64",
        );

        if (signatureBuffer.length === 0) {
          throw new Error(
            "El Base64 del funcionario produjo un archivo vacío.",
          );
        }

        const { error: uploadError } =
          await supabaseAdmin.storage
            .from("signatures")
            .upload(
              signaturePath,
              signatureBuffer,
              {
                contentType: "image/jpeg",
                upsert: false,
              },
            );

        if (uploadError) {
          throw new Error(
            `Error subiendo la firma del funcionario: ${uploadError.message}`,
          );
        }

        const { error: updateError } =
          await supabaseAdmin
            .from("entry_orders")
            .update({
              funcionario_firma_path_snapshot:
                signaturePath,
            })
            .eq("id", order.id);

        if (updateError) {
          await supabaseAdmin.storage
            .from("signatures")
            .remove([signaturePath]);

          throw new Error(
            `Error actualizando funcionario_firma_path_snapshot: ${updateError.message}`,
          );
        }

        result.funcionarioMigrated++;
      } catch (error: unknown) {
        result.funcionarioFailed++;

        const message =
          error instanceof Error
            ? error.message
            : "Error desconocido.";

        result.errors.push(
          `Funcionario - orden ${order.id} (${order.consecutivo}): ${message}`,
        );
      }
    }

    // ==========================================
    // 2. FIRMAS DEL DIRECTOR TÉCNICO
    // ==========================================

    const { data: directorOrders, error: directorFetchError } =
      await supabaseAdmin
        .from("entry_orders")
        .select(
          "id, consecutivo, director_tecnico_firma_base64_snapshot, director_tecnico_firma_path_snapshot",
        )
        .not("director_tecnico_firma_base64_snapshot", "is", null);

    if (directorFetchError) {
      throw new Error(
        `No se pudieron consultar las firmas de directores técnicos: ${directorFetchError.message}`,
      );
    }

    result.directorFound = directorOrders.length;

    for (const order of directorOrders) {
      if (order.director_tecnico_firma_path_snapshot) {
        result.directorSkipped++;
        continue;
      }

      if (!order.director_tecnico_firma_base64_snapshot) {
        result.directorSkipped++;
        continue;
      }

      const signaturePath =
        `entry_orders/${order.id}/firma_director_tecnico.jpeg`;

      try {
        let base64Data =
          order.director_tecnico_firma_base64_snapshot;

        if (base64Data.includes(",")) {
          const [, data] = base64Data.split(",", 2);

          if (!data) {
            throw new Error(
              "El Base64 del director técnico no contiene datos válidos.",
            );
          }

          base64Data = data;
        }

        const signatureBuffer = Buffer.from(
          base64Data,
          "base64",
        );

        if (signatureBuffer.length === 0) {
          throw new Error(
            "El Base64 del director técnico produjo un archivo vacío.",
          );
        }

        const { error: uploadError } =
          await supabaseAdmin.storage
            .from("signatures")
            .upload(
              signaturePath,
              signatureBuffer,
              {
                contentType: "image/jpeg",
                upsert: false,
              },
            );

        if (uploadError) {
          throw new Error(
            `Error subiendo la firma del director técnico: ${uploadError.message}`,
          );
        }

        const { error: updateError } =
          await supabaseAdmin
            .from("entry_orders")
            .update({
              director_tecnico_firma_path_snapshot:
                signaturePath,
            })
            .eq("id", order.id);

        if (updateError) {
          await supabaseAdmin.storage
            .from("signatures")
            .remove([signaturePath]);

          throw new Error(
            `Error actualizando director_tecnico_firma_path_snapshot: ${updateError.message}`,
          );
        }

        result.directorMigrated++;
      } catch (error: unknown) {
        result.directorFailed++;

        const message =
          error instanceof Error
            ? error.message
            : "Error desconocido.";

        result.errors.push(
          `Director técnico - orden ${order.id} (${order.consecutivo}): ${message}`,
        );
      }
    }

    return {
      data: result,
      error: null,
    };
  } catch (error: unknown) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado durante la migración.",
    };
  }
}