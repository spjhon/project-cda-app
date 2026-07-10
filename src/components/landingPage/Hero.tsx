

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import Image from "next/image";

import ImageRecepcionista from "../../../public/landing_page_recepcionista_reziced.png"
import ImageSecretaria from "../../../public/langing_page_secretaria__reziced.png"
import ImageDirectorTecnico from "../../../public/langing_page_diirector_tecnico02__reziced.png"

const Hero = () => {
  return (
    <div className="container flex items-center justify-center overflow-hidden mx-auto my-0 md:my-20">
      <div className="max-w-7xl w-full mx-auto grid lg:grid-cols-2 gap-12 px-6 py-12 lg:py-0">
        <div className="my-auto">
          <Badge className="rounded-full shadow-3xl">
            Version de Lanzamiento v1.0.0
          </Badge>
          <h1 className="mt-6 max-w-[17ch] text-4xl md:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold leading-[1.2]! tracking-tight">
            Organiza tu CDA: desde la orden de entrada hasta las métricas de tu negocio.
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg">
            Gracias a nuestra plataforma,
           la información de tus vehículos, clientes y métricas en un solo lugar.
           Automatiza tus recordatorios y mantén a tus clientes regresando a tu CDA.
           Órdenes de entrada digitales, eficientes y estadísticas en tiempo real.
          </p>
          <div className="mt-12 flex items-center gap-4">
            <Button size="lg" className="rounded-full text-base">
              Contáctanos <ArrowUpRight className="h-5! w-5!" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full text-base shadow-none"
            >
              <CirclePlay className="h-5! w-5!" /> Mira la DEMO
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto p-4">
  
  {/* --- FILA ARRIBA --- */}
  {/* Rectángulo Izquierda (Ocupa 2 columnas) */}
  <div className="md:col-span-2 relative aspect-video md:aspect-2/1 rounded-2xl overflow-hidden border border-border bg-muted">
    <Image
    alt="Recepcionista de CDA uniformado con overol azul recibiendo a un cliente y registrando datos en una tableta digital"
    src={ImageRecepcionista} // 👈 Guarda la imagen generada en tu carpeta public/images/
    fill
    priority
    className="object-cover"
    sizes="(max-w-768px) 100vw, 66vw"
  />
   
  </div>
  
  {/* Espacio Cuadrado Derecha (Ocupa 1 columna) */}
  <div className="hidden md:block aspect-square rounded-2xl border border-dashed border-border/60 bg-muted/10">
    
  </div>


  {/* --- FILA CENTRO --- */}
  {/* 🔑 Imagen Central: Ocupa las 3 columnas completas del grid */}
  <div className="md:col-span-3 relative aspect-video md:aspect-16/7 rounded-2xl overflow-hidden border border-border bg-muted">
    <Image
      alt="Dashboard y estadísticas de administración"
      src={ImageSecretaria}
      fill
      className="object-cover object-center" /* Con object-center forzamos a que el foco sea el medio */
      sizes="100vw"
    />
  </div>


  {/* --- FILA ABAJO --- */}
  {/* Espacio Cuadrado Izquierda (Ocupa 1 columna) */}
  <div className="hidden md:block aspect-square rounded-2xl border border-dashed border-border/60 bg-muted/10">
    {/* ⏹️ Espacio vacío */}
  </div>

  {/* Rectángulo Derecha (Ocupa 2 columnas) */}
  <div className="md:col-span-2 relative aspect-video md:aspect-2/1 rounded-2xl overflow-hidden border border-border bg-muted">
    <Image
    alt="Recepcionista de CDA uniformado con overol azul recibiendo a un cliente y registrando datos en una tableta digital"
    src={ImageDirectorTecnico} // 👈 Guarda la imagen generada en tu carpeta public/images/
    fill
    priority
    className="object-cover shadow-2xl"
    sizes="(max-w-768px) 100vw, 66vw"
  />
    
  </div>

</div>
      </div>
    </div>
  );
};

export default Hero;