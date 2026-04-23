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
  Eye,
  Download
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import OrderTemplatePDFComponent from "./pdfs/OrderTemplatePDFComponent";
import { OrderTemplate as OrderTemplateType } from "@/lib/dbFunctions/fetch_orders_templates";


interface CreatedTemplatesTableProps {
  data: OrderTemplateType[] | null | undefined;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
  isSuccess: boolean;
}

export default function CreatedTemplatesTable({ data, isError, error, refetch, isFetching, isSuccess }: CreatedTemplatesTableProps) {
  

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

  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden m-5">
      {/* Cabecera de la tabla con el Badge de Estado */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Listado de Plantillas
        </h2>
        <div>{renderStatusBadge()}</div>
      </div>
      <Table>
        <TableHeader className="hidden md:table-header-group bg-slate-50/50">
          <TableRow>
            <TableHead className="font-bold text-slate-700">Código</TableHead>
            <TableHead className="font-bold text-slate-700">Nombre de Plantilla</TableHead>
            <TableHead className="w-[15%] font-bold text-slate-700">Tipo de Servicio</TableHead>
            <TableHead className="font-bold text-center text-slate-700">Versión</TableHead>
            <TableHead className="font-bold text-slate-700">Estado</TableHead>
            <TableHead className="text-right font-bold text-slate-700">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="flex flex-col md:table-row-group">
          {data.map((template) => (
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

              {/* AGREGAR ESTA CELDA COMPLETA */}
              <TableCell className="md:table-cell py-2 md:py-4">
                <span className="md:hidden block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                  Tipo de Servicio
                </span>
                <div className="text-sm text-slate-500 italic">
                  {template.service_type || "No especificado"}
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



              {/* Estado de la plantilla */}
              <TableCell className="md:table-cell py-2 md:py-4">
                <span className="md:hidden block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                  Estado
                </span>
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
              </TableCell>

              {/* Celda: Acciones */}
              <TableCell className="md:table-cell py-2 md:py-4 text-right">
                <div className="flex items-center justify-end gap-2 mt-3 md:mt-0">
                  
                  {/* Botón Ver (Ojo) */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                    title="Ver documento"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {/* Botón Descargar */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                    title="Descargar PDF"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  {/* Botón Editar */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                    title="Editar plantilla"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  
                  {/* Botón Eliminar */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <OrderTemplatePDFComponent></OrderTemplatePDFComponent>
    </div>
     
  );
}