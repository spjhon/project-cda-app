"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { migrateEntryOrderSignatures } from "@/lib/server-actions/migrateEntryOrderSignatures";


export function MigrateEntryOrderSignaturesButton() {
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigration = async () => {
    setIsMigrating(true);

    try {
      const { data, error } =
        await migrateEntryOrderSignatures();

      if (error) {
        console.error(
          "❌ Error en la migración:",
          error,
        );

        alert(error);
        return;
      }

      console.log(
        "✅ Migración de firmas de entry_orders:",
        data,
      );

      alert(
        `Migración completada.\n\n` +
          `FUNCIONARIOS\n` +
          `Encontradas: ${data?.funcionarioFound ?? 0}\n` +
          `Migradas: ${data?.funcionarioMigrated ?? 0}\n` +
          `Omitidas: ${data?.funcionarioSkipped ?? 0}\n` +
          `Errores: ${data?.funcionarioFailed ?? 0}\n\n` +
          `DIRECTORES TÉCNICOS\n` +
          `Encontradas: ${data?.directorFound ?? 0}\n` +
          `Migradas: ${data?.directorMigrated ?? 0}\n` +
          `Omitidas: ${data?.directorSkipped ?? 0}\n` +
          `Errores: ${data?.directorFailed ?? 0}`,
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