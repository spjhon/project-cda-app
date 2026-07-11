import Link from "next/link";
import Image from "next/image";
import { MessageCircle, PlayCircle } from "lucide-react";

// Tus importaciones de los logos
import LogoDark from "../../../public/logo_dark_transparente_croped.png";
import LogoLight from "../../../public/logo_light_transparente_croped.png";

export default function CTASection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Detalle geométrico sutil de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* COLUMNA IZQUIERDA: EL LOGO GIGANTE DINÁMICO */}
          <div className="flex justify-center md:justify-end order-2 md:order-1">
            <div className="relative w-full max-w-70 sm:max-w-sm lg:max-w-md aspect-square flex items-center justify-center">
              
              {/* 
                ⚠️ LÓGICA INVERTIDA POR EL FONDO bg-primary 
                Como el fondo primario suele ser oscuro en modo claro, usamos LogoDark.
                Si en tu tema el bg-primary no cambia (ej. siempre es azul oscuro), 
                puedes dejar solo el logo que sea de color blanco y quitar las clases dark.
              */}
              
              {/* Logo para Modo Claro (Se muestra sobre fondo bg-primary oscuro) */}
              <Image 
                src={LogoDark} 
                alt="cdApp Logo"
                fill
                className="object-contain drop-shadow-2xl block dark:hidden" 
                sizes="(max-w-768px) 280px, 450px"
              />

              {/* Logo para Modo Oscuro (Se muestra sobre fondo bg-primary claro) */}
              <Image 
                src={LogoLight} 
                alt="cdApp Logo"
                fill
                className="object-contain drop-shadow-2xl hidden dark:block" 
                sizes="(max-w-768px) 280px, 450px"
              />

            </div>
          </div>

          {/* COLUMNA DERECHA: TEXTO Y BOTONES (CTA) */}
          <div className="text-center md:text-left order-1 md:order-2 space-y-6 lg:space-y-8">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl leading-tight">
              Lleva la operación de tu CDA al siguiente nivel normativo
            </h2>
            
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto md:mx-0 leading-relaxed">
              Deja atrás los sistemas obsoletos, las caídas en horas pico y los riesgos en auditorías ISO 17020. Implementa cdApp y automatiza desde hoy mismo.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
              
              <Link
                href="https://wa.me/573215224583?text=Hola,%20estoy%20interesado%20en%20una%20demostración%20de%20cdApp%20para%20mi%20CDA."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-background text-foreground font-bold hover:bg-muted transition-all shadow-xl hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2.5 text-base"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600 fill-emerald-600/10" />
                Hablar por WhatsApp
              </Link>

              <Link
                href="/demo"
                className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-primary-foreground text-primary-foreground font-bold hover:bg-primary-foreground/10 transition-all hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2.5 text-base"
              >
                <PlayCircle className="w-5 h-5" />
                Probar Demo
              </Link>
              
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}