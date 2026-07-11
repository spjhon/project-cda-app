import Image from "next/image";

import Hero from "@/components/landingPage/Hero";
import { HeroVideo } from "@/components/landingPage/HeroVideo";
import { LogoMarquee } from "@/components/landingPage/LogoMarquee";
import { Navbar } from "@/components/landingPage/NavBar/Navbar";
import {
  Activity,
  BellRing,
  CalendarClock,
  CarFront,
  Database,
  FileCheck2,
  Globe,
  LucideIcon,
  Server,
  TabletSmartphone,
} from "lucide-react";
import Link from "next/link";

import ImageRecepcionista from "../../public/landing_page_recepcionista_reziced.png";
import ImageSecretaria from "../../public/langing_page_secretaria__reziced.png";
import ImageDirectorTecnico from "../../public/langing_page_diirector_tecnico02__reziced.png";
import { Footer } from "@/components/landingPage/Footer";
import PricingSection from "@/components/landingPage/PricingSection";
import CTASection from "@/components/landingPage/CTASection";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: CarFront,
    title: "Integración Automatizada RUNT",
    description:
      "Extracción inteligente de datos directamente del portal RUNT. Agiliza la apertura de órdenes de entrada en segundos y elimina por completo los errores de digitación humana.",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: FileCheck2,
    title: "Trazabilidad ISO 17020",
    description:
      "Control inmutable de versiones en cada orden de entrada. El sistema blinda tu CDA registrando cada cambio para garantizar el cumplimiento absoluto ante auditorías de ONAC.",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: TabletSmartphone,
    title: "Recepción 100% Digital",
    description:
      "Captura de firmas de clientes de forma electrónica nativa mediante tabletas. Despídete de los archivos de papel y acelera el flujo de atención en ventanilla.",
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: BellRing,
    title: "Fidelización y Alertas Inteligentes",
    description:
      "Motor de correos electrónicos automáticos para recordar a los clientes su próxima revisión anual y alertar sobre el vencimiento de los 15 días en vehículos reprobados.",
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    icon: Database,
    title: "Bases de Datos Estructuradas",
    description:
      "Gestión centralizada de vehículos, propietarios y clientes. Los datos de tu CDA están aislados de forma segura mediante políticas RLS (Row Level Security) y particionamiento.",
    color: "text-cyan-600 dark:text-cyan-400",
  },
  {
    icon: Globe,
    title: "Marca Blanca y Presencia Web",
    description:
      "Despliegue de una Landing Page comercial exclusiva para tu centro de diagnóstico bajo un subdominio personalizado (tucda.cda-app.com).",
    color: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: CalendarClock,
    title: "PQRS Integrados",
    description:
      "Radicación de quejas o apelaciones desde la Landing Page del CDA, emitiendo notificaciones en tiempo real al Administrador y al Director Técnico.",
    color: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: Activity,
    title: "Monitorización en Tiempo Real",
    description:
      "Dashboard directivo con sincronización instantánea. Controla los tiempos de ciclo, flujo en pistas y estadísticas operativas sin tener que recargar la página.",
    color: "text-yellow-600 dark:text-yellow-400",
  },
  {
    icon: Server,
    title: "Arquitectura de Alto Rendimiento",
    description:
      "Infraestructura backend de grado industrial (RPC-first) en servidores dedicados. Adiós a los 'tiempos de arranque' o caídas del sistema en las horas pico de tu CDA.",
    color: "text-slate-600 dark:text-slate-300",
  },
];
const stats = [
  { label: "Cada integrante tiene su propio perfil", value: "Multi-Perfil" },
  {
    label: "Plataforma personalizada con el logo de tu CDA",
    value: "Logo Propio",
  },
  {
    label: "Tendras tu propio dominio TUCDA.cda-app.com",
    value: "Dominio Propio",
  },
  {
    label: "Datos en tiempo real desde el perfil del administrador",
    value: "Real Time",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar></Navbar>

      <Hero></Hero>

      <section className="container flex items-center justify-center overflow-hidden mx-auto my-0 md:my-20">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 px-6 py-12 lg:py-0">
          {/* 📸 CONTENEDOR IMAGEN:
        `order-last` hace que en móviles se vaya abajo. 
        `lg:order-first` la regresa a la izquierda en pantallas grandes. */}

          {/* 📝 CONTENEDOR TEXTO:
        `order-first` asegura que en móviles sea lo primero que se lea.
        `lg:order-last` lo ubica a la derecha en pantallas grandes. */}
          <div className="my-auto space-y-6 order-first lg:order-last">
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.2]! tracking-tight text-foreground">
              ¿Qué hace exactamente <span className="text-primary">cdApp</span>?
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Es una plataforma web diseñada exclusivamente para
              <strong className="text-foreground font-semibold">
                {" "}
                Centros de Diagnóstico Automotor (CDA) en Colombia{" "}
              </strong>
              con el fin de automatizar y digitalizar el proceso de recepcion y
              la orden de entrada, toma de datos estadisticos en el area de
              secretaria, confirmacion de rtm terminado en el area del director
              tecnico y un abanico de estadisticas y la monitorizacion del
              proceso de cada vehiculo en el perfil de administrador, todo en
              linea para poder ser consultado desde cualquier sitio.
            </p>

            {/* Bloques informativos por roles */}
            <div className="grid gap-4 pt-2">
              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-bold text-foreground">
                  Recepción y Secretaría
                </h4>
                <p className="text-sm text-muted-foreground">
                  Automatiza la apertura de órdenes de entrada y la captura
                  inteligente de datos de vehículos y propietarios de forma
                  ágil.
                </p>
              </div>

              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-bold text-foreground">Dirección Técnica</h4>
                <p className="text-sm text-muted-foreground">
                  Validación y confirmación inmediata de RTM finalizadas para
                  agilizar la liberación del vehículo sin cuellos de botella.
                </p>
              </div>

              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-bold text-foreground">
                  Administración Central
                </h4>
                <p className="text-sm text-muted-foreground">
                  Monitoriza el estado del proceso de cada pista en línea y
                  accede a analíticas avanzadas desde cualquier dispositivo para
                  la toma de decisiones.
                </p>
              </div>
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
            <div className="hidden md:block aspect-square rounded-2xl border border-dashed border-border/60 bg-muted/10"></div>

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
      </section>

      <HeroVideo></HeroVideo>

      <section className="mt-10 mb-20  py-10  border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                {/* El número de la estadística resalta con el color primario del tema */}
                <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
                  {stat.value}
                </div>
                {/* La etiqueta cambia de color de texto automáticamente según el fondo */}
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Encabezado Principal */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Todo lo necesario para una robusta gestión de tus ordenes de entrada y seguimiento del proceso
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
              Una plataforma web segura de extremo a extremo. Desde sistemas de
              autenticación avanzados hasta aislamiento estricto de datos
              mediante seguridad a nivel de filas (RLS).
            </p>
          </div>

          {/* Grilla de Características */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card text-card-foreground p-6 rounded-xl border border-border/60 shadow-xs hover:shadow-md dark:hover:border-border transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Contenedor del Icono */}
                  <div
                    className={`inline-flex p-2 rounded-lg bg-muted mb-4 ${feature.color}`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection></PricingSection>

      <LogoMarquee></LogoMarquee>

      <CTASection></CTASection>

      <Footer></Footer>
    </div>
  );
}
