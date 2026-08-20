"use client";

// ============================================================
// IMPORTACIONES
// ============================================================

// useRef → lo usamos para poder acceder al <input type="file">
// desde JavaScript y abrir el selector de archivos cuando
// el usuario haga clic en nuestro botón o área de carga.
//
// useState → lo usamos para saber si actualmente el usuario
// está arrastrando un archivo sobre el área de carga.
import { useRef, useState } from "react";
import JSZip from "jszip";
// ExcelJS → librería que nos permite leer archivos .xlsx
// directamente en el navegador.
import ExcelJS from "exceljs";

// Button → botón que estás utilizando actualmente en tu proyecto.
import { Button } from "@base-ui/react";
import { useMutation } from "@tanstack/react-query";


// ============================================================
// TIPO DE DATOS DE CADA REGISTRO DEL EXCEL
// ============================================================

// Cada fila del Excel tendrá:
//
// A → Fecha
// B → Placa
// C → Nombre completo
//
// Este type representa exactamente la información que
// queremos sacar de cada fila.
//
// IMPORTANTE:
// La fecha y la placa no se utilizan para hacer la consulta
// a OFAC. Las conservamos porque posteriormente las vamos
// a necesitar para construir el nombre del screenshot.
type PersonaSarlaftMasivo = {
  fecha: string;
  placa: string;
  nombreCompleto: string;
  numeroDocumento: string;
};


type ResultadoSarlaftMasivo = {
  success: boolean;
  hayCoincidencias: boolean;
  resultados: {
    fecha: string;
    placa: string;
    nombreCompleto: string;
    numeroDocumento: string;
    consultaExitosa: boolean;
    coincidencia: boolean;
    screenshot: string | null;
    error?: string;
  }[];
};


type ResultadoSarlaftMasivoCompleto = {
  ofac: ResultadoSarlaftMasivo;
  un: ResultadoSarlaftMasivo;
};










// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function SarlaftMasivo() {

  // ==========================================================
  // REFERENCIA AL INPUT DE ARCHIVO
  // ==========================================================

  // Este ref nos permite acceder directamente al elemento:
  //
  // <input type="file" />
  //
  // ¿Por qué?
  //
  // Porque nosotros no queremos mostrar el input tradicional
  // del navegador. Queremos tener nuestro propio botón/área
  // visual y hacer que ese elemento abra el selector de archivos.
  const inputRef = useRef<HTMLInputElement>(null);


  // ==========================================================
  // ESTADO: ¿EL USUARIO ESTÁ ARRASTRANDO UN ARCHIVO?
  // ==========================================================

  // isDragging será:
  //
  // false → normalmente
  // true  → mientras el usuario esté arrastrando un archivo
  //          sobre nuestra zona de carga.
  //
  // Esto solamente sirve para cambiar visualmente el borde
  // del área de carga.
  const [isDragging, setIsDragging] = useState(false);


    // ==========================================================
  // ESTADO PARA GUARDAR LA RESPUESTA DEL SERVIDOR
  // ==========================================================

  const [resultadoMasivo, setResultadoMasivo] =
  useState<ResultadoSarlaftMasivoCompleto | null>(null);











const sarlaftMasivoMutation = useMutation<
  ResultadoSarlaftMasivoCompleto,
  Error,
  PersonaSarlaftMasivo[]
>({
  mutationFn: async (
    personas: PersonaSarlaftMasivo[],
  ) => {

    // ========================================================
    // 1. CONSULTA MASIVA OFAC
    // ========================================================

    const responseOFAC = await fetch(
      "https://runt-api.cda-app.com/api/scraper/sarlaft/ofac/masivo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(personas),
      },
    );

    if (!responseOFAC.ok) {
      throw new Error(
        `Error HTTP OFAC: ${responseOFAC.status}`,
      );
    }

    const dataOFAC = await responseOFAC.json();

   


    // ========================================================
    // 2. CONSULTA MASIVA NACIONES UNIDAS
    // ========================================================

    const responseUN = await fetch(
      "https://runt-api.cda-app.com/api/scraper/sarlaft/un/masivo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(personas),
      },
    );

    if (!responseUN.ok) {
      throw new Error(
        `Error HTTP Naciones Unidas: ${responseUN.status}`,
      );
    }

    const dataUN = await responseUN.json();

    

    // ========================================================
    // 3. DEVOLVER AMBAS RESPUESTAS
    // ========================================================

    return {
      ofac: dataOFAC,
      un: dataUN,
    };
  },


  // ==========================================================
  // CONSULTAS TERMINADAS CORRECTAMENTE
  // ==========================================================

  onSuccess: async (data) => {
 

  
  // ============================================================
  // CREAR ZIP
  // ============================================================

  const zip = new JSZip();

  // ============================================================
  // FUNCIÓN PARA LIMPIAR LOS NOMBRES DE LOS ARCHIVOS
  // ============================================================

  // Evitamos caracteres que pueden causar problemas
  // en nombres de archivos dentro de Windows.
  const sanitizeFileName = (value: string) => {
    return value
      .replace(/[<>:"/\\|?*]/g, "")
      .replace(/\s+/g, "_")
      .trim();
  };

  // ============================================================
  // AGREGAR SCREENSHOTS DE OFAC
  // ============================================================

  data.ofac.resultados.forEach((item) => {
    // Si la consulta falló, no existe screenshot.
    if (!item.screenshot) {
      return;
    }






    const fecha = item.fecha;
    const placa = sanitizeFileName(item.placa);
    const nombre = sanitizeFileName(item.nombreCompleto);
    const numeroDocumento = item.numeroDocumento;

    const fileName = `${fecha}-${placa}-Evidencia_Sarlaft_OFAC_${nombre}_${numeroDocumento}.jpg`;

    zip.file(
      `OFAC/${fileName}`,
      item.screenshot,
      {
        base64: true,
      },
    );
  });

  // ============================================================
  // AGREGAR SCREENSHOTS DE NACIONES UNIDAS
  // ============================================================

  data.un.resultados.forEach((item) => {
    // Si la consulta falló, no existe screenshot.
    if (!item.screenshot) {
      return;
    }



    const fecha = item.fecha;
    const placa = sanitizeFileName(item.placa);
    const nombre = sanitizeFileName(item.nombreCompleto);
    const numeroDocumento = item.numeroDocumento

    const fileName = `${fecha}-${placa}-Evidencia_Sarlaft_ONU_${nombre}_${numeroDocumento}.jpg`;

    zip.file(
      `Naciones_Unidas/${fileName}`,
      item.screenshot,
      {
        base64: true,
      },
    );
  });

  // ============================================================
  // GENERAR EL ZIP
  // ============================================================

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });

  // ============================================================
  // DESCARGAR EL ZIP
  // ============================================================

  const zipUrl = URL.createObjectURL(zipBlob);

  const link = document.createElement("a");

  link.href = zipUrl;
  link.download = `Evidencias_Sarlaft_Masivo.zip`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  // Liberamos la URL temporal después de la descarga.
  URL.revokeObjectURL(zipUrl);

  // ============================================================
  // GUARDAR RESULTADO EN EL ESTADO
  // ============================================================

  setResultadoMasivo(data);
},

  // ==========================================================
  // ERROR
  // ==========================================================

  onError: (error) => {
    console.error(
      "❌ Error en consulta masiva SARLAFT:",
      error,
    );
  },
});














  // ==========================================================
  // FUNCIÓN PRINCIPAL PARA PROCESAR EL EXCEL
  // ==========================================================

  // Esta función recibe el archivo que seleccionó/arrastró
  // el usuario y se encarga de:
  //
  // 1. Validar que sea .xlsx
  // 2. Leer el archivo
  // 3. Abrirlo con ExcelJS
  // 4. Obtener la primera hoja
  // 5. Recorrer las filas
  // 6. Obtener fecha, placa y nombre
  // 7. Crear nuestro array de personas
  // 8. Mostrarlo en consola
  const processFile = async (file: File) => {

    try {

      // ========================================================
      // VALIDAR EXTENSIÓN DEL ARCHIVO
      // ========================================================

      // Convertimos el nombre del archivo a minúsculas
      // para que funcione tanto:
      //
      // archivo.xlsx
      //
      // como:
      //
      // ARCHIVO.XLSX
      //
      // Si no termina en .xlsx, rechazamos el archivo.
      if (!file.name.toLowerCase().endsWith(".xlsx")) {

        console.error("❌ El archivo debe ser un .xlsx");

        return;
      }


      // ========================================================
      // CONVERTIR EL ARCHIVO A ARRAYBUFFER
      // ========================================================

      // Un archivo seleccionado por el usuario es un objeto File.
      //
      // ExcelJS necesita recibir los bytes del archivo para
      // poder leer el contenido del Excel.
      //
      // arrayBuffer() obtiene esos bytes.
      const arrayBuffer = await file.arrayBuffer();


      // ========================================================
      // CREAR LIBRO DE EXCEL
      // ========================================================

      // Creamos una instancia de ExcelJS.
      //
      // Piensa en "workbook" como:
      //
      // "el archivo Excel completo"
      //
      // que puede contener una o varias hojas.
      const workbook = new ExcelJS.Workbook();


      // ========================================================
      // CARGAR EL ARCHIVO EXCEL
      // ========================================================

      // Aquí realmente le entregamos a ExcelJS
      // el contenido del archivo.
      //
      // Después de esta línea, "workbook" contiene
      // toda la estructura del Excel.
      await workbook.xlsx.load(arrayBuffer);


      // ========================================================
      // OBTENER LA PRIMERA HOJA
      // ========================================================

      // Un Excel puede tener varias hojas:
      //
      // Hoja 1
      // Hoja 2
      // Hoja 3
      //
      // Nosotros solamente necesitamos la primera.
      const worksheet = workbook.worksheets[0];


      // ========================================================
      // VALIDAR QUE EXISTA UNA HOJA
      // ========================================================

      // Por seguridad verificamos que el Excel realmente
      // tenga una hoja.
      if (!worksheet) {

        console.error(
          "❌ El Excel no contiene ninguna hoja."
        );

        return;
      }


      // ========================================================
      // ARRAY DONDE GUARDAREMOS LOS REGISTROS
      // ========================================================

      // Aquí construiremos todos los registros encontrados
      // en el Excel.
      //
      // Al final tendremos algo como:
      //
      // [
      //   {
      //     fecha: "2026-01-15",
      //     placa: "ABC123",
      //     nombreCompleto: "Juan Pérez",
      //     numeroDocumento: "1053782464"
      //   },
      //
      //   {
      //     fecha: "2026-01-16",
      //     placa: "XYZ789",
      //     nombreCompleto: "María González",
      //     numeroDocumento: "1007885223"
      //   }
      // ]
      //
      // Inicialmente está vacío.
      const personas: PersonaSarlaftMasivo[] = [];


      // ========================================================
      // RECORRER TODAS LAS FILAS DEL EXCEL
      // ========================================================

      // eachRow() recorre una fila a la vez.
      //
      // row     → representa la fila actual
      // rowNumber → número de fila dentro del Excel
      //
      // Por ejemplo:
      //
      // fila 1 → encabezados
      // fila 2 → Juan Pérez
      // fila 3 → María González
      // etc.
      worksheet.eachRow((row, rowNumber) => {


       


        // ======================================================
        // OBTENER LOS VALORES DE LAS TRES COLUMNAS
        // ======================================================

        // Excel empieza las columnas en 1.
        //
        // row.getCell(1) → columna A → Fecha
        // row.getCell(2) → columna B → Placa
        // row.getCell(3) → columna C → Nombre completo
        //
        // .value obtiene el contenido de la celda.

       const rawValue = row.getCell(1).value;


        // O si solo quieres la parte de la fecha ("YYYY/MM/DD") de forma segura:
        const fecha = rawValue instanceof Date 
          ? rawValue.toISOString().split('T')[0]
          : String(rawValue || '').trim();

       

        const placa = row.getCell(2).value;

        const nombreCompleto = row.getCell(3).value;

        const numeroDocumento = row.getCell(4).value


        // ======================================================
        // VALIDAR QUE LA FILA TENGA LOS TRES DATOS
        // ======================================================

        // Si falta alguno de los tres campos:
        //
        // fecha
        // placa
        // nombre
        // numeroDocumento
        //
        // ignoramos esa fila.
        //
        // Esto evita mandar registros incompletos.
        if (
          fecha == null ||
          placa == null ||
          nombreCompleto == null ||
          numeroDocumento == null
        ) {
          return;
        }


        // ======================================================
        // GUARDAR EL REGISTRO
        // ======================================================

        // Creamos un objeto con la estructura
        // PersonaSarlaftMasivo y lo agregamos
        // al array "personas".
        personas.push({

          // Convertimos el valor de la celda a string
          // y eliminamos espacios sobrantes al principio
          // y al final.
          fecha: fecha,

          placa: String(placa).trim(),

          nombreCompleto: String(nombreCompleto).trim(),

          numeroDocumento: String(numeroDocumento).trim()

        });

      });


      // ========================================================
      // MOSTRAR RESULTADO EN CONSOLA
      // ========================================================


      /** 
      // Nombre del archivo que cargó el usuario.
      console.log(
        "📄 Archivo:",
        file.name
      );


      // Cantidad total de personas encontradas.
      console.log(
        "📊 Total de registros:",
        personas.length
      );


      // Mostrar todo el array.
      //
      // Aquí podrás revisar que ExcelJS haya leído
      // correctamente las tres columnas.
      console.log(
        "👥 Registros:",
        personas
      );
*/
      // ======================================================
      // ENVIAR LOS REGISTROS AL SERVIDOR
      // ======================================================

      sarlaftMasivoMutation.mutate(personas);



    } catch (error) {

      // ========================================================
      // MANEJO DE ERRORES
      // ========================================================

      // Si ocurre algún problema al leer el Excel,
      // lo mostramos en consola.
      console.error(
        "❌ Error leyendo el Excel:",
        error
      );

    }
  };


  // ============================================================
  // CUANDO EL USUARIO SELECCIONA EL ARCHIVO MANUALMENTE
  // ============================================================

  // Esta función se ejecuta cuando el usuario selecciona
  // un archivo desde el explorador de archivos del sistema.
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {

    // event.target.files contiene los archivos seleccionados.
    //
    // Nosotros solamente queremos el primero.
    const file = event.target.files?.[0];


    // Si efectivamente existe un archivo,
    // lo enviamos a processFile().
    if (file) {
      processFile(file);
    }
  };


  // ============================================================
  // CUANDO EL USUARIO ARRASTRA Y SUELTA EL ARCHIVO
  // ============================================================

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {

    // Por defecto, el navegador puede intentar abrir
    // el archivo cuando lo soltamos.
    //
    // preventDefault() evita ese comportamiento.
    event.preventDefault();


    // Como el archivo ya fue soltado,
    // dejamos de mostrar el estado "dragging".
    setIsDragging(false);


    // Obtenemos el primer archivo que fue soltado.
    const file = event.dataTransfer.files?.[0];


    // Si existe un archivo, lo procesamos.
    if (file) {
      processFile(file);
    }
  };


  // ============================================================
  // INTERFAZ VISUAL DEL COMPONENTE
  // ============================================================

  return (
    <div className="flex flex-col gap-4">


      {/* ======================================================
          ÁREA DE ARRASTRAR Y SOLTAR
          ====================================================== */}

      <div

        // ------------------------------------------------------
        // onDragOver
        // ------------------------------------------------------
        // Se ejecuta mientras el usuario está arrastrando
        // un archivo sobre nuestra zona.
        //
        // preventDefault() es necesario para que el navegador
        // permita soltar el archivo.
        onDragOver={(event) => {

          event.preventDefault();

          setIsDragging(true);

        }}


        // ------------------------------------------------------
        // onDragLeave
        // ------------------------------------------------------
        // Se ejecuta cuando el archivo deja de estar sobre
        // nuestra zona de carga.
        onDragLeave={() => {

          setIsDragging(false);

        }}


        // ------------------------------------------------------
        // onDrop
        // ------------------------------------------------------
        // Se ejecuta cuando el usuario suelta el archivo.
        onDrop={handleDrop}


        // ------------------------------------------------------
        // onClick
        // ------------------------------------------------------
        // Si el usuario hace clic sobre esta zona,
        // abrimos manualmente el selector de archivos.
        //
        // inputRef.current representa nuestro:
        //
        // <input type="file">
        //
        onClick={() => inputRef.current?.click()}


        // ------------------------------------------------------
        // CLASES VISUALES
        // ------------------------------------------------------
        // Cambiamos un poco el aspecto dependiendo
        // de si el usuario está arrastrando un archivo.
        className={`flex min-h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-muted-foreground/50"

        }`}
      >


        {/* ====================================================
            CONTENIDO DE LA ZONA DE CARGA
            ==================================================== */}

        <div>

          <p className="font-medium">
            Arrastra aquí el archivo Excel
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            o haz clic para seleccionarlo
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Columnas: Fecha, Placa, Nombre completo, Numero Documento
          </p>

        </div>


        {/* ====================================================
            INPUT REAL DE ARCHIVO
            ==================================================== */}

        <input

          // Conectamos el input con nuestro useRef.
          ref={inputRef}

          // Indicamos que este input sirve para seleccionar
          // archivos.
          type="file"

          // Solamente mostramos archivos .xlsx
          // en el selector del sistema.
          accept=".xlsx"

          // Cuando se seleccione un archivo,
          // ejecutamos handleFileChange().
          onChange={handleFileChange}

          // Lo ocultamos visualmente porque queremos
          // usar nuestro propio diseño.
          className="hidden"

        />

      </div>


      {/* ======================================================
          BOTÓN PARA ABRIR EL SELECTOR DE ARCHIVOS
          ====================================================== */}

      <Button

        // Evita que el botón intente enviar algún formulario
        // si posteriormente este componente se mete dentro
        // de un <form>.
        type="button"


        // Al hacer clic, utilizamos el mismo input oculto
        // que usamos anteriormente.
        //
        // De esta forma se abre el explorador de archivos.
        onClick={() => inputRef.current?.click()}

      >
        Seleccionar Excel
      </Button>

      {resultadoMasivo && (
        <pre className="max-h-125 overflow-auto rounded-lg border p-4 text-xs">
          {JSON.stringify(
            resultadoMasivo,
            null,
            2,
          )}
        </pre>
      )}


    </div>
  );
}