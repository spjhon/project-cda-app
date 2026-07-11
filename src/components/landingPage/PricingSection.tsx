import { Check, ShieldCheck, Sparkles } from "lucide-react";

export default function PricingSection() {
  const features = [
    "Landing Page institucional bajo el subdominio TUCDA.cda-app.com",
    "Formularios integrados de PQRS (Quejas/Apelaciones)",
    "Apertura de Órdenes de Entrada automatizada con extracción del RUNT",
    "Digitalización e incorporación de la firma del cliente en ventanilla",
    "Trazabilidad inmutable de versiones de la orden (Cumplimiento ISO 17020)",
    "Monitoreo de flujo en pista (Vehículos en prueba vs. finalizados)",
    "4 perfiles de acceso: Recepcionista, Secretaria, Director Técnico y Administrador",
    "Contador automatizado de FUPAS y certificados emitidos",
    "Dashboard de estadísticas de rendimiento y tiempos de ciclo en tiempo real",
    "Motor de alertas por email para fidelización y control de reprobados",
    "Copias de seguridad (Backups) automatizadas todos los días",
    "Soporte técnico prioritario de grado empresarial 24/7",
    "Sin contratos de permanencia: puedes cancelar cuando lo desees",
  ];

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      {/* Efecto de luz ambiental de fondo para modo oscuro */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Encabezado */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Un único plan, control absoluto de tu CDA
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Sin letras chiquitas ni módulos adicionales por pagar. Obtén todo el ecosistema digital diseñado para el blindaje normativo de tu centro.
          </p>
        </div>

        {/* CONTENEDOR DE LA TARJETA DE PRECIO */}
        <div className="bg-card text-card-foreground rounded-2xl border border-border/80 shadow-xl dark:shadow-primary/5 p-8 md:p-12 transition-all duration-300">
          
          <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-start">
            
            {/* COLUMNA IZQUIERDA: PRECIO Y GANCHO (Ocupa 2 de 5 columnas) */}
            <div className="md:col-span-2 flex flex-col justify-between h-full space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-4 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Plan Integral Todo Incluido
                </span>
                
                {/* 🚀 MENSAJE PODEROSO: PRIMER MES GRATIS */}
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-center md:text-left">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    Oferta de Lanzamiento
                  </p>
                  <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    ¡Tu primer mes es GRATIS!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Prueba el software en tu pista sin arriesgar un solo peso.
                  </p>
                </div>

                {/* VISUALIZACIÓN DE PRECIO */}
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50 font-medium">
                    Valor regular: $249.900/mes
                  </span>
                  <div className="flex items-baseline mt-1">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">$179.900</span>
                    <span className="ml-2 text-sm font-semibold text-muted-foreground">/ mes</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    * IVA incluido. Facturación mensual cobrada a partir del segundo mes.
                  </span>
                </div>
              </div>

              {/* Botón de Acción Principal */}
              <button className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-base py-3.5 px-6 rounded-xl transition-colors shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer group">
                Digitalizar mi CDA Ahora
                <ShieldCheck className="w-5 h-5 group-hover:scale-105 transition-transform" />
              </button>
            </div>

            {/* COLUMNA DERECHA: CARACTERÍSTICAS (Ocupa 3 de 5 columnas) */}
            <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-border/60 pt-6 md:pt-0 md:pl-8 lg:pl-12">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
                ¿Qué incluye la plataforma?
              </h3>
              
              <ul className="space-y-3.5">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    {/* Chulo verde consistente */}
                    <div className="mt-0.5 shrink-0 p-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                      <Check className="w-3.5 h-3.5 stroke-3" />
                    </div>
                    <span className="text-muted-foreground leading-snug">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}