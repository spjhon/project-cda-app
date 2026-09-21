"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { migrateOrderSignatures } from "@/lib/server-actions/migrateOrderSignatures";


export function MigrateOrderSignaturesButton() {
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigration = async () => {
    setIsMigrating(true);

    try {
      const { data, error } =
        await migrateOrderSignatures();

      if (error) {
        console.error(
          "❌ Error en la migración:",
          error,
        );

        alert(error);
        return;
      }

      console.log(
        "✅ Migración de order_signatures:",
        data,
      );

      alert(
        `Migración completada.\n\n` +
          `Encontradas: ${data?.found ?? 0}\n` +
          `Migradas: ${data?.migrated ?? 0}\n` +
          `Omitidas: ${data?.skipped ?? 0}\n` +
          `Errores: ${data?.failed ?? 0}`,
      );

      if (data?.errors.length) {
        console.error(
          "❌ Detalle de errores:",
          data.errors,
        );
      }
    } catch (error) {
      console.error(
        "❌ Error inesperado durante la migración:",
        error,
      );

      alert(
        "Ocurrió un error inesperado durante la migración.",
      );
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleMigration}
      disabled={isMigrating}
    >
      {isMigrating
        ? "Migrando firmas..."
        : "Migrar firmas de órdenes"}
    </Button>
  );
}