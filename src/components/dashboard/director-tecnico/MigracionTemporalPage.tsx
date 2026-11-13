"use client";

import { useState } from "react";
import { Workbook } from "exceljs";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { Json } from "../../../../supabase/types/database.types";

// Tipo para una fila del Excel (las llaves son los headers)
type ExcelRow = Record<string, string | number | boolean | null | undefined>;

// Define esta interfaz arriba del componente (o en un archivo de tipos)
interface MigracionResult {
  success: boolean;
  ordenes_insertadas: number;
  pagos_insertados: number;
}

function parseFechaExcel(
  fechaTexto: string | number | null | undefined,
): string | null {
  if (!fechaTexto) return null;

  const texto = String(fechaTexto).toUpperCase().trim();
  // Ejemplo: "10 NOVIEMBRE"

  // Diccionario de meses en español
  const meses: Record<string, number> = {
    ENERO: 0,
    FEBRERO: 1,
    MARZO: 2,
    ABRIL: 3,
    MAYO: 4,
    JUNIO: 5,
    JULIO: 6,
    AGOSTO: 7,
    SEPTIEMBRE: 8,
    OCTUBRE: 9,
    NOVIEMBRE: 10,
    DICIEMBRE: 11,
  };

  // Separamos por espacios: ["10", "NOVIEMBRE"]
  const partes = texto.split(/\s+/);
  if (partes.length < 2) return null;

  const dia = parseInt(partes[0], 10);
  const mesNombre = partes[1];
  const mes = meses[mesNombre];

  if (isNaN(dia) || mes === undefined) return null;

  // Construimos la fecha con el año 2026 (o el año que necesites)
  const anio = 2026;
  const fecha = new Date(Date.UTC(anio, mes, dia, 12, 0, 0)); // 12:00:00 UTC

  // Validamos que la fecha sea real (ej. 31 de febrero no existe)
  if (fecha.getDate() !== dia || fecha.getMonth() !== mes) {
    return null;
  }

  // Devolvemos en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ) para Supabase
  return fecha.toISOString();
}

export default function MigracionTemporalPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const supabase = createSupabaseBrowserClient();

  //funcion que detecta cuando el input cambia (osea que el usuario ha subido un archivo) y manda al state el archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      // Limpiamos el input para permitir seleccionar el mismo archivo otra vez
      e.target.value = "";
    }
  };

  const procesarExcel = async () => {
    if (!file) return;
    setIsProcessing(true);
    setLogs([]);

    try {
      // 1. Leer el archivo con exceljs
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new Workbook();
      await workbook.xlsx.load(arrayBuffer);

      // 2. Tomar la primera hoja
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error("El archivo no tiene hojas.");
      }

      // 3. Convertir a un array de objetos (usando la primera fila como headers)
      const rows: ExcelRow[] = [];
      const headers: string[] = [];

      // Obtenemos los headers (fila 1)
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber] = String(cell.value ?? "").trim();
      });

      // Iteramos desde la fila 2
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Saltamos headers

        const rowData: ExcelRow = {};
        let hasData = false; // 👈 Bandera para saber si la fila tiene algún dato

        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber];
          if (!header) return;

          const value = cell.value;

          // Si la celda tiene un valor (no es null/undefined/string vacío), marcamos hasData
          if (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
          ) {
            hasData = true;
          }

          rowData[header] = value as ExcelRow[string];
        });

        // 👇 Solo agregamos la fila si tiene al menos un dato
        if (hasData) {
          rows.push(rowData);
        }
      });

      // 4. Construir el array de payloads (sin insertar todavía)
      const payloads: Record<string, unknown>[] = [];

      let etapa = "preparación de datos";

      // 👇 EL TRY/CATCH AHORA ENVUELVE TODO EL BUCLE (no cada fila)
      try {
        for (const [index, row] of rows.entries()) {
          // --------------------------------------------------------
          // 1. VALIDACIONES BÁSICAS
          // --------------------------------------------------------

          const fechaParseada = parseFechaExcel(String(row["FECHA"] ?? ""));

          // 👇 Si no hay fecha, significa que llegamos al final de los datos reales
          if (!fechaParseada) {
            setLogs((prev) => [
              ...prev,
              `🏁 Fila ${index + 2}: Sin fecha. Se asume fin de los datos. Deteniendo lectura.`,
            ]);
            break; // 👈 Detiene el bucle por completo
          }

          const placa = String(row["PLACA"] ?? "")
            .trim()
            .toUpperCase();
          if (!placa) {
            throw new Error(`Fila ${index + 2}: La placa está vacía.`);
          }

          const pinRaw = String(row["PIN"] ?? "").trim();
          const pinLimpio =
            pinRaw === "0" || pinRaw === "" || pinRaw === "undefined"
              ? null
              : pinRaw;

          const tipoVehiculoRaw = String(row["TIPO DE VEHICULO"] ?? "").trim();

          if (!tipoVehiculoRaw) {
            throw new Error(`Fila ${index + 2}: TIPO DE VEHICULO vacío.`);
          }

          const tipoVehiculo = tipoVehiculoRaw.toLowerCase();

          // Validamos que sea exactamente "liviano" o "pesado"
          if (tipoVehiculo !== "liviano" && tipoVehiculo !== "pesado") {
            throw new Error(
              `Fila ${index + 2}: TIPO DE VEHICULO inválido "${tipoVehiculoRaw}". Debe ser "liviano" o "pesado".`,
            );
          }

          const tipoInspeccionRaw = String(
            row["TIPO DE INSPECCION"] ?? "",
          ).trim();

          if (!tipoInspeccionRaw) {
            throw new Error(`Fila ${index + 2}: TIPO DE INSPECCION vacío.`);
          }

          const tipoInspeccion = tipoInspeccionRaw.toUpperCase();

          let serviceType: "RTM" | "preventiva" | "prueba_gases";
          let esReinspeccion: boolean;

          if (tipoInspeccion === "CERTIFICACION") {
            serviceType = "RTM";
            esReinspeccion = false;
          } else if (tipoInspeccion === "REINSPECCION") {
            serviceType = "RTM";
            esReinspeccion = true;
          } else if (tipoInspeccion === "PREVENTIVA") {
            serviceType = "preventiva";
            esReinspeccion = false;
          } else if (tipoInspeccion === "SOLO GASES") {
            serviceType = "prueba_gases";
            esReinspeccion = false;
          } else {
            throw new Error(
              `Fila ${index + 2}: TIPO DE INSPECCION inválido "${tipoInspeccionRaw}". Debe ser CERTIFICACION, REINSPECCION, SOLO GASES o PREVENTIVA.`,
            );
          }

          const servicioRaw = String(row["SERVICIO"] ?? "").trim();

          if (!servicioRaw) {
            throw new Error(`Fila ${index + 2}: SERVICIO vacío.`);
          }

          const servicioUpper = servicioRaw.toUpperCase();

          let tipoServicioVehiculo: "particular" | "publico";

          if (servicioUpper === "PARTICULAR") {
            tipoServicioVehiculo = "particular";
          } else if (servicioUpper === "PUBLICO") {
            tipoServicioVehiculo = "publico"; // 👈 Sin tilde
          } else {
            throw new Error(
              `Fila ${index + 2}: SERVICIO inválido "${servicioRaw}". Debe ser PARTICULAR o PUBLICO.`,
            );
          }

          let fur = String(row["FUR"] ?? "").trim();

          if (!fur) {
            throw new Error(`Fila ${index + 2}: El FUR está vacío.`);
          }

          // Si es preventiva, nos aseguramos de que el FUR empiece con "PR"
          if (serviceType === "preventiva") {
            // Si ya empieza con PR (sin importar mayúsculas), lo dejamos igual
            if (!fur.toUpperCase().startsWith("PR")) {
              fur = `PR${fur}`;
            } else {
              // Si ya tiene PR, lo normalizamos a mayúsculas para consistencia
              fur = fur.toUpperCase();
            }
          }

          const valorRaw = row["VALOR DE LA REVISION"];
          let valorNumerico = 0;
          if (typeof valorRaw === "string") {
            const limpio = valorRaw
              .replace(/\$/g, "")
              .replace(/\./g, "")
              .replace(",", ".")
              .trim();
            valorNumerico = parseFloat(limpio) || 0;
          } else if (typeof valorRaw === "number") {
            valorNumerico = valorRaw;
          }
          const valorFinal = esReinspeccion ? 0 : valorNumerico;

          const payments = [
            {
              payment_method: "efectivo" as const,
              monto_bruto: valorFinal,
              num_comprobante: null,
            },
          ];

          const empresaRaw = String(row["EMPRESA"] ?? "").trim();

          // Si la celda está vacía, guardamos null (no es un error, hay órdenes sin empresa)
          const companyNameSnapshot = empresaRaw === "" ? null : empresaRaw;

          const solicitudRuntRaw = String(row["SOLICITUD RUNT"] ?? "").trim();

          let consecutivoRtm: string | null = null;

          if (solicitudRuntRaw && solicitudRuntRaw !== "0") {
            // Si es reinspección, le agregamos la "A" al principio
            consecutivoRtm = esReinspeccion
              ? `A${solicitudRuntRaw}`
              : solicitudRuntRaw;
          }

          const resultadoRaw = String(row["RESULTADO INSPECCION"] ?? "").trim();

          if (!resultadoRaw) {
            throw new Error(`Fila ${index + 2}: RESULTADO INSPECCION vacío.`);
          }

          const resultadoUpper = resultadoRaw.toUpperCase();

          let resultadoRevision: "aprobado" | "rechazado";

          if (
            resultadoUpper === "APROBADO" ||
            resultadoUpper === "PREVENTIVA"
          ) {
            resultadoRevision = "aprobado";
          } else if (resultadoUpper === "RECHAZADO") {
            resultadoRevision = "rechazado";
          } else {
            throw new Error(
              `Fila ${index + 2}: RESULTADO INSPECCION inválido "${resultadoRaw}". Debe ser APROBADO, PREVENTIVA o RECHAZADO.`,
            );
          }

          // --------------------------------------------------------
          // 3. CONSTRUIR EL PAYLOAD
          // --------------------------------------------------------
          const payload = {
            tenant_id: "dddddddd-0000-0000-0000-000000000004", // 👈 Placeholder
            funcionario_id: "a7cdf37c-6a98-4da8-8d7e-c0f6c6e1da7a", // 👈 Placeholder
            fecha: fechaParseada,
            consecutivo_fur: fur,
            vehiculo_placa_snapshot: placa,
            vehiculo_marca_snapshot: "N/A",
            vehiculo_linea_snapshot: "N/A",
            vehiculo_tipo_snapshot: tipoVehiculo,
            vehiculo_tipo_servicio_snapshot: tipoServicioVehiculo,
            vehiculo_blindaje_snapshot: false,
            vehiculo_es_ensenanza_snapshot: false,
            vehiculo_es_extranjero_snapshot: false,
            es_reinspeccion: esReinspeccion,
            service_type: serviceType,
            estado_orden: "finalizada",
            oficina_pin: pinLimpio,
            rate_price_snapshot: valorFinal,
            payments: payments,
            resultado_revision: resultadoRevision,
            consecutivo_rtm: consecutivoRtm,
            company_name_snapshot: companyNameSnapshot,
            funcionario_tipo_documento_snapshot: "cedula_ciudadania",
            funcionario_numero_documento_snapshot: "1118549824",
            funcionario_nombre_snapshot: "Lorena Naranjo Sanchez",
          };

          payloads.push(payload);
        }

        // --------------------------------------------------------
        // 5. LOG DE ÉXITO (solo si el bucle terminó sin errores)
        // --------------------------------------------------------
        setLogs((prev) => [
          ...prev,
          `✅ Todos los payloads preparados correctamente: ${payloads.length}`,
        ]);

        // --------------------------------------------------------
        // 6. AQUÍ IRÍA LA LLAMADA A LA RPC
        // --------------------------------------------------------
        etapa = "ejecución de la RPC";

        const { data, error } = await supabase.rpc("migrar_ordenes_autobig", {
          p_data: payloads as unknown as Json,
        });

        if (error) throw error;

        console.log("✅ Migración completada:", data);

        const result = data as unknown as MigracionResult;
        setLogs((prev) => [
          ...prev,
          `✅ Órdenes insertadas: ${result.ordenes_insertadas}`,
          `✅ Pagos insertados: ${result.pagos_insertados}`,
        ]);

        // --------------------------------------------------------
        // 6. ENSAYO: VER LOS PAYLOADS EN CONSOLA
        // --------------------------------------------------------
        console.log("🚀 Payloads preparados para la migración:", payloads);
        console.log(`📦 Total de payloads: ${payloads.length}`);

        // Mostramos una muestra del primer payload (para no llenar la consola)
        if (payloads.length > 0) {
          console.log("🔍 Muestra del primer payload:", payloads[0]);
        }
      } catch (error: unknown) {
        console.error(`❌ Error durante ${etapa}:`, error);

        let errorMessage = "Error desconocido";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "object" && error !== null) {
          const supabaseError = error as {
            message?: string;
            details?: string;
            hint?: string;
            code?: string;
          };

          errorMessage = [
            supabaseError.message,
            supabaseError.details,
            supabaseError.hint,
            supabaseError.code ? `Código: ${supabaseError.code}` : null,
          ]
            .filter(Boolean)
            .join(" | ");
        }

        setLogs((prev) => [
          ...prev,
          `❌ Error durante ${etapa}: ${errorMessage}`,
          `📦 Payloads preparados antes del fallo: ${payloads.length}`,
        ]);

        setIsProcessing(false);
        return;
      }

      // --------------------------------------------------------
      // 5. LOG FINAL (antes de la RPC)
      // --------------------------------------------------------
      setLogs((prev) => [
        ...prev,
        `\n--- PREPARACIÓN FINALIZADA ---`,
        `✅ Payloads listos: ${payloads.length}`,
        `📦 Total de filas del Excel: ${rows.length}`,
      ]);

      setLogs((prev) => [
        ...prev,
        `\n--- FIN ---`,
        `✅ Total preparados: ${payloads.length}`,
        `📦 Total de filas del Excel: ${rows.length}`,
      ]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido en la migración";

      setLogs((prev) => [...prev, `❌ Error general: ${errorMessage}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Migración Temporal de Órdenes</h1>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="block w-full border p-2 rounded"
      />

      <Button
        onClick={procesarExcel}
        disabled={!file || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
          </>
        ) : (
          "Iniciar Migración"
        )}
      </Button>

      <div className="bg-black text-green-400 p-4 rounded h-96 overflow-y-auto font-mono text-xs">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}
