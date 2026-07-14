import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import Image from "next/image";

import ImageAdmin from "../../../public/langing_page_admin.webp";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="container flex items-center justify-center overflow-hidden mx-auto my-0 md:mt-25 md:mb-40">
      <div className="max-w-7xl w-full mx-auto grid lg:grid-cols-2 gap-12 px-6 py-12 lg:py-0">
        
        <div className="my-auto">
          <Badge className="rounded-full shadow-3xl">
            Version de Lanzamiento v1.0.0
          </Badge>
          <h1 className="mt-6 max-w-[17ch] text-4xl md:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold leading-[1.2]! tracking-tight">
            Organiza tu CDA: desde la orden de entrada hasta las métricas de tu
            negocio.
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg">
            Gracias a nuestra plataforma, la información de tus vehículos,
            clientes y métricas en un solo lugar. Automatiza tus recordatorios y
            mantén a tus clientes regresando a tu CDA. Órdenes de entrada
            digitales, eficientes y estadísticas en tiempo real.
          </p>
          <div className="mt-12 flex items-center gap-4">
            <Button size="lg" className="rounded-full text-base">
              Contáctanos <ArrowUpRight className="h-5! w-5!" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full text-base shadow-none w-40"
             
            >
              <Link href="https://demo.cda-app.com/auth/login"
              className="flex justify-center items-center gap-2"
              >
                <CirclePlay className="h-5 w-5" /> {/* Nota: quité el ! para evitar problemas de compilación si no usas Tailwind v4, pero puedes dejar "h-5! w-5!" si ya lo tienes configurado */}
                Mira la DEMO
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative w-full aspect-4/5 md:aspect-3/4 max-h-150 rounded-2xl overflow-hidden border border-border bg-muted shadow-xl ">
          <Image
            alt="Interfaz operativa de cdApp mostrando la monitorización en tiempo real de las pistas de inspección del CDA"
            src={ImageAdmin}
            fill
            className="object-cover"
            sizes="(max-w-1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
