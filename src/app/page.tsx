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


import { Footer } from "@/components/landingPage/Footer";
import PricingSection from "@/components/landingPage/PricingSection";
import CTASection from "@/components/landingPage/CTASection";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

import hero01 from "../../public/tenantsLanding/cdApp/hero01.webp";
import hero02 from "../../public/tenantsLanding/cdApp/hero02.webp";
import hero03 from "../../public/tenantsLanding/cdApp/hero03.webp";
import hero04 from "../../public/tenantsLanding/cdApp/hero04.webp";
import hero05 from "../../public/tenantsLanding/cdApp/hero05.webp";
import hero06 from "../../public/tenantsLanding/cdApp/hero06.webp";
import hero07 from "../../public/tenantsLanding/cdApp/hero07.webp";
import hero08 from "../../public/tenantsLanding/cdApp/hero08.webp";
import hero09 from "../../public/tenantsLanding/cdApp/hero09.webp";
import hero10 from "../../public/tenantsLanding/cdApp/hero10.webp";
import hero11 from "../../public/tenantsLanding/cdApp/hero11.webp";
import hero12 from "../../public/tenantsLanding/cdApp/hero12.webp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Reemplaza con la URL de producción definitiva de cdApp
const APP_URL = "https://cda-app.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    template: "%s | cdApp",
    default:
      "cdApp - Software de Gestión Integral para CDA e Inspección Vehicular",
  },

  description:
    "Plataforma SaaS para Centros de Diagnóstico Automotor (CDA). Gestión de órdenes de entrada, base de datos de vehículos y propietarios, analítica avanzada, PQRSF automatizado y control de calidad bajo la norma ISO 17020.",

  // SEO Avanzado para Motores de Búsqueda
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
    notranslate: false,
    noimageindex: false,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },

  generator: "Next.js",
  applicationName: "cdApp",
  referrer: "origin-when-cross-origin",

  // Palabras clave exhaustivas cubriendo el core del negocio, la norma técnica y la geografía
  keywords: [
    // Core del Producto (SaaS & Inspección)
    "SaaS para CDA",
    "Software para Centros de Diagnóstico Automotor",
    "Gestión de CDA Colombia",
    "Orden de entrada vehicular",
    "Recepción de vehículos CDA",
    "Expediente digital de vehículos",
    "Analítica para CDA",
    "Dashboard de inspección vehicular",
    "Registro de propietarios y clientes",
    "Pre-revision vehicular",
    "Control de rechazos RTM",
    "Historial técnico de vehículos",

    // Cumplimiento y Normativa (Vital para SEO B2B de este sector)
    "Norma ISO 17020",
    "Organismo de inspección tipo A",
    "ONAC cumplimiento CDA",
    "Software acreditado ONAC",
    "RUNT automatización",
    "Regulación de transporte Colombia",

    // Funcionalidades específicas
    "PQRSF para CDA",
    "Formulario de apelaciones CDA",
    "Peticiones quejas y reclamos inspección",
    "Avisos de rechazo automáticos",
    "Notificaciones por correo RTM",
    "Alertas de vencimiento de revisión",
    "Tenant landing pages",
    "Portal personalizado por CDA",
    "Multi-tenant vehicular software",

    // Ubicación y Contexto de Mercado
    "RTM Colombia",
    "Revisión Técnico-Mecánica",
    "CDA en Bogotá",
    "CDA en Medellín",
    "CDA en Cali",
    "CDA en Barranquilla",
    "CDA en Bucaramanga",
    "CDA en Manizales",
    "Software automotriz Colombia",

    // Stack Tecnológico (Opcional, pero útil si buscas posicionarte ante desarrolladores o partners)
    "Next.js 15",
    "Supabase Postgres",
    "TanStack Query",
    "Tailwind CSS",
    "Coolify VPS Deployment",
  ],

  // Autores y Creadores (Adaptado a tu estructura)
  authors: [
    { name: "Camilo Aristizábal", url: "https://github.com/spjhon" },
    { name: "cdApp Engineering" },
  ],
  creator: "Camilo Aristizábal",
  publisher: "cdApp Colombia",

  // Detección automática de formatos (desactivada en partes críticas para evitar parseos extraños del navegador)
  formatDetection: {
    email: false, // Evita que se confundan correos de rechazo con enlaces de acción planos
    address: true,
    telephone: true,
  },

  // Open Graph (Para cuando compartan la app principal o las landings en WhatsApp, Slack o Facebook)
  openGraph: {
    title: "cdApp - Optimiza tu Centro de Diagnóstico Automotor (CDA)",
    description:
      "Automatiza tus órdenes de entrada, gestiona PQRSF y automatiza avisos de rechazo de forma digital, ágil y conforme a la norma ISO 17020.",
    url: APP_URL,
    type: "website",
    siteName: "cdApp Software",
    locale: "es_CO",
    images: [
      {
        url: `https://lyktizihszlbmzzjrqye.supabase.co/storage/v1/object/public/tenants-public/public/OPENGRAPH.webp`,
        width: 1200,
        height: 630,
        alt: "cdApp - Dashboard de Analítica e Inspección de Vehículos",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "cdApp - Digitalización y Analítica para CDA",
    description:
      "Manejo de flujos de inspección, control de rechazos y notificaciones automáticas en un solo software.",
    site: APP_URL,
    creator: "@cdApp_co", // Reemplaza con tu Twitter/X real de empresa
    images: [
      `https://lyktizihszlbmzzjrqye.supabase.co/storage/v1/object/public/tenants-public/public/OPENGRAPH.webp`,
    ],
  },

  // Categoría de la aplicación para indexación en directorios
  category: "Software de Productividad y Gestión Automotriz",
};

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

      <section className="container mx-auto px-6 py-12 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* ENCABEZADO PRINCIPAL DE LA SECCIÓN */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1 text-sm border-primary/30 text-primary"
            >
              Ecosistema Integral para CDAs
            </Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.2]">
              ¿Qué hace exactamente <span className="text-primary">cdApp</span>?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Una solución web todo en uno diseñada para Centros de Diagnóstico
              Automotor en Colombia. Digitalizamos cada etapa de la inspección
              RTM, garantizando trazabilidad total desde la atracción de
              clientes hasta el control administrativo.
            </p>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* BLOQUE 1: ATRAE Y CONVIERTE (LANDING PAGE + PQAF) */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-8">
            <div className="border-l-4 border-primary pl-4 space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                1. Presencia Digital Comercial y Gestión ISO 17020 (PQAF)
              </h3>
              <p className="text-muted-foreground max-w-3xl">
                Tu CDA obtiene una landing page corporativa optimizada para
                atraer clientes, informar tarifas y cumplir con los
                requerimientos de atención al cliente mediante el módulo de
                Peticiones, Quejas, Apelaciones y Felicitaciones (PQAF).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Landing Page Comercial */}
              <div className="space-y-3">
                <Dialog>
                  {/* Trigger usando un <button> nativo para cumplir con la semántica de Base UI */}
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="relative w-full aspect-16/10 rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Image
                          src={hero01}
                          alt="Landing page pública del CDA con información comercial y agendamiento"
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </button>
                    }
                  />

                  {/* Modal con imagen grande y título visible */}
                  <DialogContent
                    className="p-6 border-border bg-background flex flex-col max-h-[90vh] overflow-hidden gap-4"
                    style={{ maxWidth: "90vw" }}
                  >
                    {/* Encabezado con título visible */}
                    <DialogHeader className="p-0 shrink-0">
                      <DialogTitle className="text-xl font-bold text-foreground">
                        Portal Web Público del CDA
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Página institucional para proyección de marca, servicios
                        y horarios de atención.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Contenedor flexible para contención de la imagen */}
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={hero01}
                        alt="Landing page pública del CDA con información comercial y agendamiento"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                        priority
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <h4 className="font-semibold text-foreground text-base">
                  Portal Web Público del CDA
                </h4>
                <p className="text-sm text-muted-foreground">
                  Página institucional para proyección de marca, servicios y
                  horarios de atención.
                </p>
              </div>

              {/* Formulario PQAF Landing */}
              <div className="space-y-3">
                <Dialog>
                  {/* Trigger usando un <button> nativo para cumplir con la semántica de Base UI */}
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="w-full aspect-16/10 rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Image
                          src={hero02}
                          alt="Formulario de PQAF para clientes en la landing page"
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </button>
                    }
                  />

                  {/* Modal con imagen grande y título visible */}
                  <DialogContent
                    className="p-6 border-border bg-background flex flex-col max-h-[90vh] overflow-hidden gap-4"
                    style={{ maxWidth: "90vw" }}
                  >
                    {/* Encabezado con título visible */}
                    <DialogHeader className="p-0 shrink-0">
                      <DialogTitle className="text-xl font-bold text-foreground">
                        Formulario de PQAF
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Módulo de Peticiones, Quejas, Aclaraciones y
                        Felicitaciones integrado en la landing page.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Contenedor flexible para contención de la imagen */}
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={hero02}
                        alt="Formulario de PQAF para clientes en la landing page"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                        priority
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <h4 className="font-semibold text-foreground text-base">
                  Recepción Pública de PQAF
                </h4>
                <p className="text-sm text-muted-foreground">
                  Formulario dinámico para canalizar Peticiones, Quejas,
                  Apelaciones y Felicitaciones.
                </p>
              </div>

              {/* Dashboard Admin PQAF */}
              <div className="space-y-3">
                <Dialog>
                  {/* Trigger usando un <button> nativo para cumplir con la semántica de Base UI */}
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="w-full aspect-16/10 rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Image
                          src={hero03}
                          alt="Panel de administración para gestión y respuesta de PQAF"
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </button>
                    }
                  />

                  {/* Modal con imagen grande y título visible */}
                  <DialogContent
                    className="p-6 border-border bg-background flex flex-col max-h-[90vh] overflow-hidden gap-4"
                    style={{ maxWidth: "90vw" }}
                  >
                    {/* Encabezado con título visible */}
                    <DialogHeader className="p-0 shrink-0">
                      <DialogTitle className="text-xl font-bold text-foreground">
                        Gestión Interna de PQAF
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Panel de administración para dar respuesta oportuna y
                        seguimiento a las solicitudes registradas.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Contenedor flexible para contención de la imagen */}
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={hero03}
                        alt="Panel de administración para gestión y respuesta de PQAF"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                        priority
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <h4 className="font-semibold text-foreground text-base">
                  Gestión Interna de Calidad
                </h4>
                <p className="text-sm text-muted-foreground">
                  Panel administrativo para dar respuesta oportuna a los
                  requerimientos registrados.
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* BLOQUE 2: ÁREA DE RECEPCIÓN Y SECRETARÍA */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-8">
            <div className="border-l-4 border-primary pl-4 space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                2. Recepción Inteligente y Órdenes de Entrada Digitales
              </h3>
              <p className="text-muted-foreground max-w-3xl">
                Elimina los registros en papel y los errores manuales. Agiliza
                el ingreso de vehículos combinando automatización con el RUNT,
                formularios flexibles y firma digital.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Dashboard Creación Orden */}
              <div className="space-y-3">
                <Dialog>
                  {/* Trigger usando un <button> nativo para cumplir con la semántica de Base UI */}
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="w-full aspect-16/10 rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Image
                          src={hero04}
                          alt="Dashboard de recepción para inicio de órdenes de entrada"
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </button>
                    }
                  />

                  {/* Modal con imagen grande y título visible */}
                  <DialogContent
                    className="p-6 border-border bg-background flex flex-col max-h-[90vh] overflow-hidden gap-4"
                    style={{ maxWidth: "90vw" }}
                  >
                    {/* Encabezado con título visible */}
                    <DialogHeader className="p-0 shrink-0">
                      <DialogTitle className="text-xl font-bold text-foreground">
                        Dashboard de Recepción
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Punto de partida ágil para la apertura e inicio del
                        proceso de recepción vehicular.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Contenedor flexible para contención de la imagen */}
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={hero04}
                        alt="Dashboard de recepción para inicio de órdenes de entrada"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                        priority
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <h4 className="font-semibold text-foreground text-base">
                  Dashboard de Recepción
                </h4>
                <p className="text-sm text-muted-foreground">
                  Punto de partida ágil para la apertura e inicio de recepción
                  vehicular.
                </p>
              </div>

              {/* Extracción RUNT */}
              <div className="space-y-3">
                <Dialog>
                  {/* Trigger usando un <button> nativo para cumplir con la semántica de Base UI */}
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="w-full aspect-16/10 rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Image
                          src={hero05}
                          alt="Extracción automática de datos del vehículo directamente desde RUNT"
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </button>
                    }
                  />

                  {/* Modal con imagen grande y título visible */}
                  <DialogContent
                    className="p-6 border-border bg-background flex flex-col max-h-[90vh] overflow-hidden gap-4"
                    style={{ maxWidth: "90vw" }}
                  >
                    {/* Encabezado con título visible */}
                    <DialogHeader className="p-0 shrink-0">
                      <DialogTitle className="text-xl font-bold text-foreground">
                        Extracción de Datos desde RUNT
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Autocompletado instantáneo de la ficha técnica del
                        vehículo consultando la placa en el sistema RUNT.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Contenedor flexible para contención de la imagen */}
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={hero05}
                        alt="Extracción automática de datos del vehículo directamente desde RUNT"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                        priority
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <h4 className="font-semibold text-foreground text-base">
                  Scraping e Integración RUNT
                </h4>
                <p className="text-sm text-muted-foreground">
                  Autocompletado instantáneo de la ficha técnica del vehículo
                  digitando solo la placa.
                </p>
              </div>

              {/* Separación Cliente / Propietario */}
              <div className="space-y-3">
                <Dialog>
                  {/* Trigger usando un <button> nativo para cumplir con la semántica de Base UI */}
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="w-full aspect-16/10 rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Image
                          src={hero06}
                          alt="Formulario con lógica separada para datos del cliente poseedor y el propietario"
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </button>
                    }
                  />

                  {/* Modal con imagen grande y título visible */}
                  <DialogContent
                    className="p-6 border-border bg-background flex flex-col max-h-[90vh] overflow-hidden gap-4"
                    style={{ maxWidth: "90vw" }}
                  >
                    {/* Encabezado con título visible */}
                    <DialogHeader className="p-0 shrink-0">
                      <DialogTitle className="text-xl font-bold text-foreground">
                        Gestión de Cliente y Propietario
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Formulario con separación clara para la captura de datos
                        del tenedor/poseedor y el propietario del vehículo.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Contenedor flexible para contención de la imagen */}
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={hero06}
                        alt="Formulario con lógica separada para datos del cliente poseedor y el propietario"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                        priority
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <h4 className="font-semibold text-foreground text-base">
                  Desacople Cliente vs Propietario
                </h4>
                <p className="text-sm text-muted-foreground">
                  Diferenciación Clara entre el tenedor/conductor actual y el
                  titular según licencia.
                </p>
              </div>

              {/* Plantillas de Ordenes */}
              <div className="space-y-3">
                <Dialog>
                  {/* Trigger usando un <button> nativo para cumplir con la semántica de Base UI */}
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="w-full aspect-16/10 rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Image
                          src={hero07}
                          alt="Administrador de plantillas preconfiguradas para órdenes de entrada"
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </button>
                    }
                  />

                  {/* Modal con imagen grande y título visible */}
                  <DialogContent
                    className="p-6 border-border bg-background flex flex-col max-h-[90vh] overflow-hidden gap-4"
                    style={{ maxWidth: "90vw" }}
                  >
                    {/* Encabezado con título visible */}
                    <DialogHeader className="p-0 shrink-0">
                      <DialogTitle className="text-xl font-bold text-foreground">
                        Plantillas de Orden de Entrada
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Administrador de plantillas preconfiguradas para
                        agilizar la creación de órdenes según el tipo de
                        servicio.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Contenedor flexible para contención de la imagen */}
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={hero07}
                        alt="Administrador de plantillas preconfiguradas para órdenes de entrada"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                        priority
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <h4 className="font-semibold text-foreground text-base">
                  Plantillas Personalizadas
                </h4>
                <p className="text-sm text-muted-foreground">
                  Configura inventarios previos según el tipo de vehículo
                  (Motos, Livianos, Pesados).
                </p>
              </div>

              {/* Firma Digital */}
              <div className="space-y-3">
                <Dialog>
                  {/* Trigger usando un <button> nativo para cumplir con la semántica de Base UI */}
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="w-full aspect-16/10 rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Image
                          src={hero08}
                          alt="Captura de firma digital del cliente en la orden de entrada"
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </button>
                    }
                  />

                  {/* Modal con imagen grande y título visible */}
                  <DialogContent
                    className="p-6 border-border bg-background flex flex-col max-h-[90vh] overflow-hidden gap-4"
                    style={{ maxWidth: "90vw" }}
                  >
                    {/* Encabezado con título visible */}
                    <DialogHeader className="p-0 shrink-0">
                      <DialogTitle className="text-xl font-bold text-foreground">
                        Firma Digital del Cliente
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Captura de firma manuscrita digital para la validación y
                        autorización de la orden de entrada.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Contenedor flexible para contención de la imagen */}
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={hero08}
                        alt="Captura de firma digital del cliente en la orden de entrada"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                        priority
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <h4 className="font-semibold text-foreground text-base">
                  Firma Digital del Cliente
                </h4>
                <p className="text-sm text-muted-foreground">
                  Aceptación legal del estado del vehículo en pantalla táctil o
                  tableta.
                </p>
              </div>

              {/* Adjunto de Facturación / SOAT */}
              <div className="space-y-3">
                <Dialog>
                  {/* Trigger usando un <button> nativo para cumplir con la semántica de Base UI */}
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="w-full aspect-16/10 rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Image
                          src={hero09}
                          alt="Módulo de secretaría para adjuntar número de factura, valores pagados y venta de SOAT"
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </button>
                    }
                  />

                  {/* Modal con imagen grande y título visible */}
                  <DialogContent
                    className="p-6 border-border bg-background flex flex-col max-h-[90vh] overflow-hidden gap-4"
                    style={{ maxWidth: "90vw" }}
                  >
                    {/* Encabezado con título visible */}
                    <DialogHeader className="p-0 shrink-0">
                      <DialogTitle className="text-xl font-bold text-foreground">
                        Módulo de Secretaría y Facturación
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Registro de número de factura, valores pagados y gestión
                        complementaria para la venta de SOAT.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Contenedor flexible para contención de la imagen */}
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={hero09}
                        alt="Módulo de secretaría para adjuntar número de factura, valores pagados y venta de SOAT"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                        priority
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <h4 className="font-semibold text-foreground text-base">
                  Módulo Financiero de Secretaría
                </h4>
                <p className="text-sm text-muted-foreground">
                  Registro de número de factura, recaudo, métodos de pago y
                  venta cruzada de SOAT.
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* BLOQUE 3: SUPERVISIÓN Y DIRECCIÓN TÉCNICA */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-8">
            <div className="border-l-4 border-primary pl-4 space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                3. Control Operativo y Liberación por Dirección Técnica
              </h3>
              <p className="text-muted-foreground max-w-3xl">
                Monitoreo centralizado del flujo de revisión. Cierra el ciclo
                técnico agilizando la entrega de certificados RTM o informes de
                rechazo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tabla de Ordenes Activas */}
              <div className="space-y-3">
                <Dialog>
                  {/* Trigger usando un <button> nativo manteniendo la proporción aspect-video */}
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="w-full aspect-video rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Image
                          src={hero10}
                          alt="Tabla de seguimiento y administración de ordenes de entrada registradas"
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </button>
                    }
                  />

                  {/* Modal con imagen grande y título visible */}
                  <DialogContent
                    className="p-6 border-border bg-background flex flex-col max-h-[90vh] overflow-hidden gap-4"
                    style={{ maxWidth: "90vw" }}
                  >
                    {/* Encabezado con título visible */}
                    <DialogHeader className="p-0 shrink-0">
                      <DialogTitle className="text-xl font-bold text-foreground">
                        Seguimiento de Órdenes de Entrada
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Tabla administrativa para el monitoreo, filtrado y
                        gestión del estado de cada inspección registrada.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Contenedor flexible para contención de la imagen */}
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={hero10}
                        alt="Tabla de seguimiento y administración de ordenes de entrada registradas"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                        priority
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <h4 className="font-semibold text-foreground text-lg">
                  Monitoreo de Órdenes en Tiempo Real
                </h4>
                <p className="text-sm text-muted-foreground">
                  Vista unificada para rastrear en qué estado se encuentra cada
                  vehículo dentro del circuito del CDA.
                </p>
              </div>

              {/* Módulo Director Técnico */}
              <div className="space-y-3">
                <Dialog>
                  {/* Trigger usando un <button> nativo manteniendo la proporción aspect-video */}
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="w-full aspect-video rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Image
                          src={hero11}
                          alt="Módulo del Director Técnico para dictamen final, FUR y certificado RUNT"
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </button>
                    }
                  />

                  {/* Modal con imagen grande y título visible */}
                  <DialogContent
                    className="p-6 border-border bg-background flex flex-col max-h-[90vh] overflow-hidden gap-4"
                    style={{ maxWidth: "90vw" }}
                  >
                    {/* Encabezado con título visible (shrink-0 para evitar que se colapse) */}
                    <DialogHeader className="p-0 shrink-0">
                      <DialogTitle className="text-xl font-bold text-foreground">
                        Módulo de Director Técnico
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Emisión del dictamen final, generación del Formato Único
                        de Resultados (FUR) y carga del certificado al RUNT.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Contenedor flexible que absorbe el alto restante */}
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={hero11}
                        alt="Módulo del Director Técnico para dictamen final, FUR y certificado RUNT"
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                        priority
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <h4 className="font-semibold text-foreground text-lg">
                  Validación del Director Técnico
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ingreso del dictamen (Aprobado/Rechazado), asignación de
                  consecutivos FUR y registro del certificado RTM emitido.
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* BLOQUE 4: ADMINISTRACIÓN CENTRAL Y ESTADÍSTICAS */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-8">
            <div className="border-l-4 border-primary pl-4 space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                4. Analítica de Negocio y Métricas en Tiempo Real
              </h3>
              <p className="text-muted-foreground max-w-3xl">
                Toma decisiones estratégicas fundamentadas en datos reales.
                Analiza volúmenes de inspección, índices de aprobación vs.
                rechazo y rendimiento general.
              </p>
            </div>

            <Dialog>
              {/* Trigger usando un <button> nativo con proporciones panorámicas responsive */}
              <DialogTrigger
                render={
                  <button
                    type="button"
                    className="w-full aspect-video md:aspect-21/9 rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Image
                      src={hero12}
                      alt="Dashboard gerencial con estadísticas de inspección y tasa de rechazo"
                      className="object-cover"
                      sizes="100vw"
                    />
                  </button>
                }
              />

              {/* Modal con imagen grande y título visible */}
              <DialogContent
                className="p-6 border-border bg-background flex flex-col max-h-[90vh] overflow-hidden gap-4"
                style={{ maxWidth: "90vw" }}
              >
                {/* Encabezado con título visible */}
                <DialogHeader className="p-0 shrink-0">
                  <DialogTitle className="text-xl font-bold text-foreground">
                    Dashboard Gerencial y Métricas
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Panel de analítica e indicadores clave para el seguimiento
                    de la operación, volumen de inspecciones y tasas de rechazo.
                  </DialogDescription>
                </DialogHeader>

                {/* Contenedor flexible para contención de la imagen */}
                <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                  <Image
                    src={hero12}
                    alt="Dashboard gerencial con estadísticas de inspección y tasa de rechazo"
                    className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                    priority
                  />
                </div>
              </DialogContent>
            </Dialog>
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
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Encabezado Principal */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Todo lo necesario para una robusta gestión de tus ordenes de
              entrada y seguimiento del proceso
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
