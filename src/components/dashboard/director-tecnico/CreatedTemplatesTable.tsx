"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit3, 
  Trash2, 
  FileText, 
  AlertCircle, 
  RefreshCcw, 
  CheckCircle2,
  Loader2,
  
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


import { OrderTemplate, OrderTemplate as OrderTemplateType } from "@/lib/server-actions/fetch_orders_templates";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import OrderViewPDF from "@/components/dashboard/_shared/pdfs/OrderViewPDF";
import OrderDownloadPDF from "@/components/dashboard/_shared/pdfs/OrderDownloadPDF";
import { useRouter } from "next/navigation";



const SELECT_ORDENADO_POR = [
  { label: "Codigo", value: "document_code" },
  { label: "Nombre", value: "document_name" },
  { label: "Tipo de Servicio", value: "service_type" },
  { label: "Fecha", value: "document_date" },
  { label: "Estado", value: "is_active" },

];

const SELECT_ORDEN = [
  { label: "Ascendente", value: "asc" },
  { label: "Descendente", value: "desc" },
 
];


interface CreatedTemplatesTableProps {
  data: OrderTemplateType[] | null | undefined;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
  isSuccess: boolean;
  onUpdateStatus: (id: string, is_active: boolean) => void;
  isUpdating: boolean;

  deleteTemplate: (id: string, tenantId: string) => void
  isDeletingTemplate: boolean;
  errorDeletingTemplate: Error | null;
   resetDeleteMutation: () => void;
}






export default function CreatedTemplatesTable({ 
  //Comandos para el pooling de los templates de la tabla
  data, 
  isError, 
  error, 
  refetch, 
  isFetching, 
  isSuccess, 
  //Comandos para el is_active
  onUpdateStatus, 
  isUpdating,
  //Comandos para la eliminacion de un template
  deleteTemplate,
  isDeletingTemplate, 
errorDeletingTemplate,
 resetDeleteMutation
}: CreatedTemplatesTableProps) {
  


const router = useRouter();


const [orderBy, setOrderBy] = useState<string>("document_date");
const [orderDir, setOrderDir] = useState<"asc" | "desc">("desc");






 const sortedData = [...(data ?? [])].sort((a, b) => {
        // 1. Obtenemos los valores originales
        const rawA = a[orderBy as keyof OrderTemplate];
        const rawB = b[orderBy as keyof OrderTemplate];

        // 2. Normalizamos: Si es null o undefined, lo convertimos en string vacío
        // Usamos String() para que booleanos, números y nulls se puedan comparar como texto
        const valueA = rawA ?? ""; 
        const valueB = rawB ?? "";

        // 3. Comparación segura
        if (valueA < valueB) return orderDir === "asc" ? -1 : 1;
        if (valueA > valueB) return orderDir === "asc" ? 1 : -1;
        return 0;
      });













      


// Renderizado del Badge de Estado de Sincronización
  const renderStatusBadge = () => {
    if (isError) {
      return (
        <Badge variant="destructive" className="gap-1.5 px-3 py-1 animate-pulse">
          <AlertCircle className="h-3.5 w-3.5" />
          Error de Sincronización
        </Badge>
      );
    }
    if (isFetching) {
      return (
        <Badge variant="default" className="gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Actualizando datos...
        </Badge>
      );
    }
    if (isSuccess) {
      return (
        <Badge variant="outline" className="gap-1.5 px-3 py-1 border-green-500 text-green-700 bg-green-50">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Datos Actualizados
        </Badge>
      );
    }
    return null;
  };



  // 1. BLOQUE DE ERROR
  if (isError) {
    return (
      <Alert variant="destructive" className="my-4 bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-bold">Error de conexión</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <p>
            No pudimos sincronizar las plantillas: {error?.message || "Error desconocido de Supabase"}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="w-fit bg-white hover:bg-red-100 border-red-200 text-red-700"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reintentar ahora
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // 2. ESTADO VACÍO
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg bg-slate-50/50">
        <FileText className="h-10 w-10 text-slate-300 mb-2" />
        <p className="text-slate-500 font-medium">No hay plantillas creadas aún.</p>
      </div>
    );
  }


if (errorDeletingTemplate) {
  return (
    <Alert variant="destructive" className="my-4 bg-red-50 border-red-200 animate-in fade-in-50 duration-200">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="font-bold text-red-800">Operación de borrado rechazada</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 mt-1 text-red-700">
        <p className="text-sm leading-relaxed">
          {errorDeletingTemplate?.message || "No se pudo eliminar la plantilla debido a un error inesperado de seguridad."}
        </p>
        
        {/* Botón de acción opcional por si quiere forzar el reintento manualmente con el mismo ID */}
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isDeletingTemplate}
          onClick={() => {
            // Aquí puedes quemar el reintento si guardas el ID fallido en un estado, 
            // o simplemente usar este botón para limpiar el estado del error
            resetDeleteMutation() // Elimina el banner de error de la pantalla de inmediato
          }}
          className="w-fit bg-white hover:bg-red-100 border-red-200 text-red-700 font-medium shadow-xs transition-colors"
        >
          {isDeletingTemplate ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Entendido
        </Button>
      </AlertDescription>
    </Alert>
  );
}



  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden m-5">
      {/* Cabecera de la tabla con el Badge de Estado */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Listado de Plantillas
        </h2>
        <div>{renderStatusBadge()}</div>


        <div className="flex flex-wrap items-center gap-4 px-5 mt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500">Ordenar por Columna</label>
            <Select items={SELECT_ORDENADO_POR} value={orderBy} onValueChange={(value) => setOrderBy(value?value:"")}>
              <SelectTrigger className="w-45 h-9">
                <SelectValue placeholder="Columna" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="document_code">Código</SelectItem>
                <SelectItem value="document_name">Nombre</SelectItem>
                <SelectItem value="service_type">Tipo de Servicio</SelectItem>
                <SelectItem value="document_date">Fecha</SelectItem>
                <SelectItem value="is_active">Estado</SelectItem>
                
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500">Orden</label>
            <Select items={SELECT_ORDEN} value={orderDir} onValueChange={(v) => setOrderDir(v?v:"asc")}>
              <SelectTrigger className="w-37.5 h-9">
                <SelectValue placeholder="Dirección" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="asc">Ascendente</SelectItem>
                <SelectItem value="desc">Descendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>




      </div>
      <Table>
        <TableHeader className="hidden md:table-header-group bg-slate-50/50">
          <TableRow>
            <TableHead className="font-bold text-slate-700">Código</TableHead>
            <TableHead className="font-bold text-slate-700">Nombre de Plantilla</TableHead>
            <TableHead className="font-bold text-center text-slate-700">Versión</TableHead>
            <TableHead className="font-bold text-center text-slate-700">Fecha Documento</TableHead>
            <TableHead className="font-bold text-slate-700">Estado</TableHead>
            <TableHead className="text-right font-bold text-slate-700">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="flex flex-col md:table-row-group">
          {sortedData.map((template) => (
            <TableRow 
              key={template.id} 
              className="flex flex-col md:table-row p-4 md:p-0 hover:bg-slate-50/80 transition-colors border-b"
            >


              {/* 1. Celda: Código de Documento (NUEVA POSICIÓN) */}
              <TableCell className="md:table-cell py-2 md:py-4">
                <span className="md:hidden block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                  Código
                </span>
                <div className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                  {template.document_code}
                </div>
              </TableCell>



              {/* Celda: Nombre */}
              <TableCell className="md:table-cell py-2 md:py-4">
                <span className="md:hidden block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                  Nombre de Plantilla
                </span>
                <div className="font-semibold text-slate-900">
                  {template.template_name}
                </div>
              </TableCell>


              {/* Celda: Versión */}
              <TableCell className="md:table-cell py-2 md:py-4 text-left md:text-center">
                <span className="md:hidden block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                  Versión
                </span>
                <Badge variant="secondary" className="font-mono bg-slate-100 text-slate-700">
                  v{template.version}
                </Badge>
              </TableCell>

              {/* Celda: Versión */}
              <TableCell className="md:table-cell py-2 md:py-4 text-left md:text-center">
                <span className="md:hidden block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                  Fecha Documento
                </span>
                <Badge variant="secondary" className="font-mono bg-slate-100 text-slate-700">
                  v{template.document_date}
                </Badge>
              </TableCell>


              {/* Estado de la plantilla */}
              <TableCell className="md:table-cell py-2 md:py-4">
                {/* Etiqueta para móvil */}
                <span className="md:hidden block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                  Estado
                </span>

                {/* Contenedor Flex para alinear verticalmente */}
                <div className="flex flex-col items-start md:items-center gap-2">
                  <Badge 
                    variant={template.is_active ? "outline" : "destructive"} 
                    className={`
                      capitalize 
                      ${template.is_active 
                        ? "border-emerald-500 text-emerald-700 bg-emerald-50" 
                        : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                      }
                    `}
                  >
                    {template.is_active ? "Activo" : "Inactivo"}
                  </Badge>

                  <Switch
                    id={`is_active-${template.id}`} // ID único por fila
                    checked={template.is_active}
                    onCheckedChange={(checked) => {

                      // 1. Si se intenta desactivar, pasa directo sin problema
                      if (!checked) {
                        onUpdateStatus(template.id, false);
                        return;
                      }




                  // 2. Si se intenta ACTIVAR, validamos duplicados en memoria local
                      const yaExisteActivaConMismoCodigo = data?.some(
                        (t) => 
                          t.document_code === template.document_code && 
                          t.is_active === true && 
                          t.id !== template.id // Asegura que no se compare consigo misma
                      );

                      if (yaExisteActivaConMismoCodigo) {
                        // Opción rápida de feedback (Abajo te muestro cómo hacerlo más profesional)
                        alert(
                          `Error: Ya existe una plantilla activa con el código "${template.document_code}". Desactívala primero.`
                        );
                        return; // 🛑 Bloqueamos la petición, no llamamos a onUpdateStatus
                      }

                      // 3. Si está libre, se dispara la mutación a Supabase normalmente
                      onUpdateStatus(template.id, true);





                    }}
                    disabled={isUpdating || isFetching}

                    // Si usas shadcn, recuerda que el Switch suele ser pequeño, 
                    // podrías añadirle un transform scale si lo quieres más visual
                    className={"data-checked:bg-emerald-500! data-unchecked:bg-red-500!" }
                  />
                </div>
              </TableCell>

              {/* Celda: Acciones */}
              <TableCell className="md:table-cell py-2 md:py-4 text-right">
                <div className="flex items-center justify-end gap-2 mt-3 md:mt-0">
                  
                 <OrderViewPDF templateData={template}></OrderViewPDF>

                  <OrderDownloadPDF templateData={template}></OrderDownloadPDF>


                  

                

                  {/* Botón Editar */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                    title="Editar plantilla"
                    onClick={() => {
                      // Redirige a la misma página o layout agregando el query string seguro
                      router.push(`/dashboard/director-tecnico/crear-orden-de-entrada?templateId=${template.id}`);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  


                  {/* Botón Eliminar */}
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50"
                    title="Eliminar"
                    // 1. Deshabilitamos el botón de inmediato si otra plantilla o esta misma se está borrando
                    disabled={isDeletingTemplate} 
                    // 2. Disparamos la acción pasando el ID de la plantilla actual
                    onClick={() => deleteTemplate(template.id, template.tenant_id)} 
                  >
                    {/* 3. Renderizado condicional: si está cargando, mostramos un spinner animado */}
                    {isDeletingTemplate ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>


                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      
      
    </div>
     
  );
}