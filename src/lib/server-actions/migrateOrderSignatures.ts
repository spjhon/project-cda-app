"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface MigrationResult {
  found: number;
  migrated: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export async function migrateOrderSignatures(): Promise<{
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
    const { data: orderSignatures, error: fetchError } =
      await supabaseAdmin
        .from("order_signatures")
        .select(
          "id, entry_order_id, signature_url, signature_path",
        )
        .not("signature_url", "is", null);

    if (fetchError) {
      throw new Error(
        `No se pudieron consultar las firmas de las órdenes: ${fetchError.message}`,
      );
    }

    result.found = orderSignatures.length;

    for (const orderSignature of orderSignatures) {
      if (orderSignature.signature_path) {
        result.skipped++;
        continue;
      }

      if (!orderSignature.signature_url) {
        result.skipped++;
        continue;
      }

      const signaturePath =
        `entry_orders/${orderSignature.entry_order_id}/${orderSignature.id}.jpeg`;

      try {
        let base64Data =
          orderSignature.signature_url;

        if (base64Data.includes(",")) {
          const [, data] = base64Data.split(",", 2);

          if (!data) {
            throw new Error(
              "El Base64 de la firma no contiene datos válidos.",
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
            .from("order_signatures")
            .update({
              signature_path: signaturePath,
            })
            .eq("id", orderSignature.id);

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
          `Firma ${orderSignature.id} - orden ${orderSignature.entry_order_id}: ${message}`,
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