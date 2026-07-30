import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


import desktopImage from "../../../public/tenantsLanding/cdApp/desktop.webp"

import mobileImage from "../../../public/tenantsLanding/cdApp/mobile.webp"

const Hero = () => {
  return (
    <section className="container flex items-center justify-center overflow-hidden mx-auto my-0 md:mt-25 md:mb-40">
      <div className="max-w-7xl w-full mx-auto grid lg:grid-cols-2 gap-12 px-6 py-12 lg:py-0 items-center">
        
       {/* Columna Izquierda: Copys y CTAs */}
<div className="my-auto">
  <Badge className="rounded-full shadow-3xl">
    Versión de Lanzamiento v1.0.0
  </Badge>
  
  <h1 className="mt-6 max-w-[17ch] text-4xl md:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold leading-[1.2]! tracking-tight">
    Organiza tu CDA: desde la orden de entrada hasta las métricas de tu negocio.
  </h1>
  
  <p className="mt-6 max-w-[60ch] text-lg text-muted-foreground">
    Gracias a nuestra plataforma, la información de tus vehículos, clientes y métricas en un solo lugar. Automatiza tus recordatorios y mantén a tus clientes regresando a tu CDA. Órdenes de entrada digitales, eficientes y estadísticas en tiempo real.
  </p>
  
  {/* Sección de Botones Ajustada */}
  <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
    {/* Botón Principal (WhatsApp CTA) */}
    <Button 
     
      size="lg" 
      className="rounded-full text-base font-semibold px-7 h-12 shadow-sm transition-transform active:scale-95 bg-[#25D366] hover:bg-[#20bd5a] text-white border-none"
    >
      <Link
        href="https://wa.me/573215224583?text=Hola,%20me%20gustaría%20recibir%20más%20información%20sobre%20cdApp%20para%20mi%20CDA"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2"
      >
        <span>Contáctanos</span>
        <ArrowUpRight className="h-5 w-5" />
      </Link>
    </Button>

    {/* Botón Secundario (Demo) */}
    <Button
     
      variant="outline"
      size="lg"
      className="rounded-full text-base font-medium px-7 h-12 shadow-none border-border hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <Link
        href="https://demo.cda-app.com/auth/login"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2"
      >
        <CirclePlay className="h-5 w-5 text-primary" />
        <span>Visita Nuestra Demo En Línea</span>
      </Link>
    </Button>
  </div>
</div>

        {/* Columna Derecha: Composición de Imágenes (Desktop + Mobile) */}
        <div className="relative w-full py-12 flex items-center justify-center">
          
          {/* 1. Imagen Horizontal (Desktop - 1488x545) */}
          <div className="relative w-full aspect-[1488/545] rounded-2xl overflow-hidden border border-border bg-muted">
            <Image
              alt="Interfaz operativa de cdApp mostrando la monitorización en tiempo real de las pistas de inspección del CDA"
              src={desktopImage}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* 2. Imagen Vertical (Mobile - 1536x1024 / Sobresale arriba y abajo sin sombra) */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-2 sm:right-2 md:right-4 h-[125%] aspect-[1024/1536] max-h-[520px] rounded-xl overflow-hidden z-10 hover:scale-[1.02]">
            <Image
              alt="Vista previa de la app móvil para CDA"
              src={mobileImage}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 40vw, 25vw"
            />
          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;