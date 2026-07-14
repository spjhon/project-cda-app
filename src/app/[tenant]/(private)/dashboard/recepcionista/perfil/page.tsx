"use client"

import { useContext, useRef, useState } from "react";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";

import Signature, { SignatureCanvasRef } from "@uiw/react-signature/canvas";
import { 
  User, 
  Mail, 
  Building2, 
  Globe, 
  IdCard, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  PenTool,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ReceptionistProfilePage() {
  const canvasRef = useRef<SignatureCanvasRef | null>(null);
  const contextRecived = useContext(PermissionsContext);

 
const [isUpdating, setIsUpdating] = useState(false);
const router = useRouter()
  const tenantData = contextRecived?.PermissionsContextValue.tenantObject;
  const user = contextRecived?.PermissionsContextValue.user;

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  if (!user && !tenantData) {
    return (
      <div className="p-8 space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="flex items-center gap-6 pb-6 border-b">
          <div className="h-20 w-20 bg-muted rounded-full" />
          <div className="space-y-3 flex-1">
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-muted rounded-xl md:col-span-2" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });


const handleSubmitFirma = async () => {
  const canvas = canvasRef.current?.canvas;

  if (!canvas) {
    alert("❌ Error: El área de dibujo no está lista o no se pudo inicializar.");
    return;
  }

  if (!user?.id) {
    alert("❌ Error de autenticación: No se detectó una sesión activa de usuario.");
    return;
  }

  setIsUpdating(true);

  try {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext("2d");

    if (!ctx) throw new Error("No se pudo inicializar el contexto del canvas temporal.");

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const base64 = tempCanvas.toDataURL("image/jpeg", 0.4);

    const supabaseBrowser = createSupabaseBrowserClient();
    // Inyección en Supabase
    const { error } = await supabaseBrowser
      .from("service_users")
      .update({signature_base64: base64})
      .eq("id", user.id);

    if (error) throw error;

    // Alerta de éxito nativa
    alert("✅ Firma registrada con éxito para el cumplimiento de la norma ISO 17020.");
    
  } catch (error: unknown) {
    console.error("Error al registrar la firma:", error);
  
  // Validamos si es una instancia real de Error de JavaScript / Supabase SDK
  if (error instanceof Error) {
    alert(`❌ Error al guardar: ${error.message}`);
  } else {
    // Fallback para errores genéricos o imprevistos
    alert("❌ Error al guardar: Ocurrió un error crítico e inesperado al intentar almacenar la firma.");
  }
  } finally {
    router.refresh()
    setIsUpdating(false)
  }
};


  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">




      {/* BANNER DE BIENVENIDA */}
      <div className="relative overflow-hidden rounded-2xl border bg-linear-to-r from-primary/3 to-primary/1 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
            <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-sm rounded-full">
              <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{user?.name || "Usuario del Sistema"}</h1>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/10 font-medium capitalize">
                  Recepcionista
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Gestionando el control de acceso y documentación técnica vehicular con cumplimiento normativo.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 bg-background border px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground shadow-xs">
            <Calendar className="size-4 text-primary" />
            <span>Sesión activa: {currentDate}</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-primary/2 blur-xl" />
      </div>





      {/* START: GRID PRINCIPAL DE INFORMACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        


        {/* COLUMNA IZQUIERDA: DATOS PERSONALES */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <User className="size-5 text-primary" /> {/*ajustado a size-5*/}
                <CardTitle className="text-base font-semibold">Información del Funcionario</CardTitle>
              </div>
              <CardDescription>Datos de identidad registrados en la plataforma centralizada del CDA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/15">
                  <Mail className="size-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">Correo Electrónico</span>
                    <p className="text-sm font-medium text-foreground truncate">{user?.email || "No registrado"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/15">
                  <ShieldCheck className="size-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">ID Único de Usuario</span>
                    <p className="text-xs font-mono text-foreground tracking-tight truncate">{user?.id || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/15">
                  <IdCard className="size-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">Tipo de Documento</span>
                    <p className="text-sm font-medium text-foreground uppercase">{user?.document_type || "Cédula de Ciudadanía"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/15">
                  <FileCheck2 className="size-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">Número de Identificación</span>
                    <p className="text-sm font-medium text-foreground font-mono">{user?.document_number || "No digitalizado"}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/2 text-amber-800 dark:text-amber-300">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-500" />
                <div className="text-xs space-y-1">
                  <span className="font-semibold">Nota de Cumplimiento Técnico:</span>
                  <p className="text-muted-foreground leading-relaxed">
                    Tu usuario está configurado para estampar tu nombre e identificación en el snapshot de las órdenes de entrada generadas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>




          {/* TARJETAS DE ESTADÍSTICAS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border/60 shadow-xs bg-background">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Órdenes Hoy</span>
                  <p className="text-2xl font-bold tracking-tight">--</p>
                </div>
                <div className="h-8 w-8 bg-primary/5 text-primary flex items-center justify-center rounded-lg">
                  <Clock className="size-4" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-xs bg-background">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Efectividad RUNT</span>
                  <p className="text-2xl font-bold tracking-tight">100%</p>
                </div>
                <div className="h-8 w-8 bg-green-500/5 text-green-600 flex items-center justify-center rounded-lg">
                  <CheckCircle2 className="size-4" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-xs bg-background">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Estado Runt Scraper</span>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1.5 mt-1">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse" /> Activo
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>




        {/* COLUMNA DERECHA: DATOS DEL TENANT / CDA */}
        <div className="space-y-6">
          <Card className="border-border/60 shadow-xs overflow-hidden h-full">
            <div className="h-2 bg-primary" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" /> {/*ajustado a size-5*/}
                <CardTitle className="text-base font-semibold">Organización / Centro</CardTitle>
              </div>
              <CardDescription>Sede y entorno multi-inquilino asignado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col items-center text-center p-4 border border-dashed rounded-xl bg-muted/5 gap-3">
                <Avatar className="h-16 w-16 rounded-xl border bg-background p-1.5 shadow-xs">
                  <AvatarImage src={tenantData?.logo_url || undefined} alt={tenantData?.name || "CDA"} className="object-contain" />
                  <AvatarFallback className="rounded-xl bg-primary/5 text-primary font-bold text-sm">
                    {tenantData?.name ? tenantData.name.substring(0,2).toUpperCase() : "CDA"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-semibold text-foreground tracking-tight">{tenantData?.name || "Nombre del CDA"}</h3>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{tenantData?.id || "ID-TENANT"}</p>
                </div>
              </div>

              <Separator className="bg-border/60" />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Globe className="size-3.5 text-muted-foreground/70" /> Dominio Corporativo
                  </span>
                  <span className="font-semibold text-foreground tracking-tight">{tenantData?.domain || "No configurado"}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-muted-foreground/70" /> Cumplimiento Legal
                  </span>
                  <Badge variant="outline" className="text-[10px] font-semibold border-emerald-500/30 text-emerald-600 bg-emerald-500/5 tracking-wide">
                    ISO 17020
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


      </div> {/* EL GRID SE CIERRA AQUÍ AHORA, LIBERANDO A LA FIRMA */}




      {/* SECCIÓN: REGISTRO DE FIRMA DEL RECEPCIONISTA (AHORA SÍ FULL WIDTH) */}
      <Card className="border-border/60 shadow-xs overflow-hidden bg-background">
        <div className="p-6 border-b border-border/50 bg-muted/2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                <PenTool className="size-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-foreground tracking-tight uppercase">
                  Firma Registrada Recepcionista
                </h3>
                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                  Esta firma digitalizada será incrustada de forma automática en todas las órdenes de entrada para dar cumplimiento a la trazabilidad de la norma ISO 17020.
                </p>
              </div>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => canvasRef.current?.clear()}
              className="h-8 text-destructive hover:bg-destructive/5 text-xs font-bold uppercase self-start md:self-center shrink-0"
            >
              <Trash2 className="size-3.5 mr-1.5" /> Reiniciar Pad
            </Button>
          </div>
        </div>

      <CardContent className="w-full p-6 bg-muted/1">
          {/* Grid de 2 columnas que mantiene tus condiciones de ancho y centrado */}
          <div className="max-w-5xl m-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* ==========================================
                COLUMNA IZQUIERDA: PAD DE DIBUJO (TUS CONDICIONES EXACTAS)
               ========================================== */}
            <div className="max-w-130 w-full m-auto space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                  Área de Captura Horizontal
                </span>
                <span className="text-[10px] font-medium text-muted-foreground/70 italic">
                  Usa el mouse o una pantalla táctil para firmar
                </span>
              </div>

              <div className="max-w-110 w-full m-auto relative rounded-xl border-2 border-dashed border-border bg-card flex items-center justify-center transition-all duration-300 shadow-inner min-h-60">
                <Signature
                  ref={canvasRef}
                  height={200}
                  width={400} // Tu nueva resolución interna fija
                  style={{
                    margin: "auto",
                    width: "100%",
                    maxWidth: "400px",
                    height: "200px",
                    backgroundColor: "transparent",
                  }}
                />
                <div className="absolute bottom-12 left-12 right-12 border-b border-border/60 pointer-events-none" />
              </div>

              <p className="text-[10px] text-center text-muted-foreground/60 font-medium tracking-wide">
                La firma se guardará con un fondo blanco sólido óptimo para la generación de PDFs de órdenes de entrada.
              </p>
            </div>

            {/* ==========================================
                NUEVA COLUMNA DERECHA: SNAPSHOT DE LA FIRMA ACTUAL
               ========================================== */}
            <div className="max-w-130 w-full m-auto space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                  Firma Actual en Base de Datos
                </span>
                <span className="text-[10px] font-medium text-muted-foreground/70">
                  Estado Registrado
                </span>
              </div>

              {/* Mismas condiciones exactas de tamaño que tu Pad (max-w-110 y min-h-60) */}
              <div className="max-w-110 w-full m-auto relative rounded-xl border border-border bg-white flex items-center justify-center shadow-xs min-h-60 select-none overflow-hidden">
                {user?.signature_base64 ? (
                  <div className="w-full max-w-100 h-50 flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={user.signature_base64} 
                      alt="Firma actual del funcionario" 
                      className="w-full h-full object-contain pointer-events-none mix-blend-multiply"
                    />
                  </div>
                ) : (
                  /* Estado vacío si el recepcionista no ha firmado nunca */
                  <div className="text-center p-4 space-y-1.5">
                    <div className="inline-flex p-2.5 bg-muted rounded-full text-muted-foreground/50 mb-1">
                      <PenTool className="size-4" />
                    </div>
                    <p className="text-xs font-bold text-foreground/80 uppercase tracking-tight">Sin Registro</p>
                    <p className="text-[10px] text-muted-foreground/80 max-w-50 m-auto leading-normal">
                      No se detecta firma guardada. Realiza un trazo a la izquierda.
                    </p>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-center text-muted-foreground/60 font-medium tracking-wide">
                Esta es la representación digital que se incrustará bajo la norma ISO 17020.
              </p>
            </div>

          </div>
        </CardContent>
        <Button
                type="button"
                className="m-auto max-w-50 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider px-6 py-5 rounded-xl shadow-md shadow-primary/10 transition-all duration-200 hover:-translate-y-px active:translate-y-px flex items-center gap-2 cursor-pointer"
                onClick={handleSubmitFirma}
              >
                <CheckCircle2 className={`size-4 ${isUpdating ? "animate-spin" : "animate-pulse"}`} />
    {isUpdating ? "Guardando..." : "Registrar Firma"}
              </Button>
      </Card>





    </div>
  );
}