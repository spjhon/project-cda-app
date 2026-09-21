"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface MigrationResult {
  found: number;
  migrated: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export async function migrateServiceUserSignatures(): Promise<{
  data: MigrationResult | null;
  error: string | null;
}> {
  const supabaseAdmin = createSupabaseAdminClient();

  const result: MigrationResult = {
    found: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  try {
    const { data: serviceUsers, error: fetchError } =
      await supabaseAdmin
        .from("service_users")
        .select(
          "id, full_name, signature_base64, signature_path",
        )
        .not("signature_base64", "is", null);

    if (fetchError) {
      throw new Error(
        `No se pudieron consultar las firmas: ${fetchError.message}`,
      );
    }

    result.found = serviceUsers.length;

    for (const serviceUser of serviceUsers) {
      if (serviceUser.signature_path) {
        result.skipped++;
        continue;
      }

      if (!serviceUser.signature_base64) {
        result.skipped++;
        continue;
      }

      try {
        const signatureBase64 =
          serviceUser.signature_base64;

        let base64Data = signatureBase64;

        if (signatureBase64.includes(",")) {
          const [, data] = signatureBase64.split(",", 2);

          if (!data) {
            throw new Error(
              "El Base64 no contiene datos válidos.",
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
            "El Base64 produjo un archivo vacío.",
          );
        }

        const signaturePath =
          `service_users/${serviceUser.id}/signature.jpg`;

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
            `Error subiendo la firma: ${uploadError.message}`,
          );
        }

        const { error: updateError } =
          await supabaseAdmin
            .from("service_users")
            .update({
              signature_path: signaturePath,
            })
            .eq("id", serviceUser.id);

        if (updateError) {
          await supabaseAdmin.storage
            .from("signatures")
            .remove([signaturePath]);

          throw new Error(
            `Error actualizando signature_path: ${updateError.message}`,
          );
        }

        result.migrated++;
      } catch (error: unknown) {
        result.failed++;

        const message =
          error instanceof Error
            ? error.message
            : "Error desconocido.";

        result.errors.push(
          `${serviceUser.id} (${serviceUser.full_name ?? "Sin nombre"}): ${message}`,
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