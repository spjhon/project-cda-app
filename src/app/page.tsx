import Image from "next/image";
import { CurrentYear } from "@/components/landingPage/CurrentYear";
import Hero from "@/components/landingPage/Hero";
import { HeroVideo } from "@/components/landingPage/HeroVideo";
import { LogoMarquee } from "@/components/landingPage/LogoMarquee";
import { Navbar } from "@/components/landingPage/NavBar/Navbar";
import {
  AlertTriangle,
  Boxes,
  Clock,
  Cloud,
  Database,
  DatabaseZap,
  FileCode2,
  Computer,
  LayoutTemplate,
  FileUser,
  LucideIcon,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import ImageRecepcionista from "../../public/landing_page_recepcionista_reziced.png";
import ImageSecretaria from "../../public/langing_page_secretaria__reziced.png";
import ImageDirectorTecnico from "../../public/langing_page_diirector_tecnico02__reziced.png";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  // --- Tus originales traducidos ---
  {
    icon: Shield,
    title: "Autenticación Robusta",
    description:
      "Inicio de sesión seguro con email/contraseña y proveedores como Google.",
    color: "text-green-600",
  },
  {
    icon: Database,
    title: "Gestión de Archivos",
    description:
      "Almacenamiento integrado con Supabase Storage, descargas seguras y permisos.",
    color: "text-orange-600",
  },

  {
    icon: Clock,
    title: "Gestión de Tickets",
    description: "Sistema dashboard con comentarios en tiempo real",
    color: "text-teal-600",
  },

  {
    icon: Boxes,
    title: "Arquitectura Multi-Tenant",
    description:
      "Aislamiento total por organización mediante subdominios o rutas dinámicas.",
    color: "text-fuchsia-600",
  },
  {
    icon: LayoutTemplate,
    title: "Layout Responsivo Pro",
    description: "Se adapta a mobiles y pantallas de escritorio",
    color: "text-cyan-600",
  },
  {
    icon: FileCode2,
    title: "Menú Móvil Animado",
    description:
      "Drawer de shadcn con trigger de hamburguesa animado mediante CSS.",
    color: "text-orange-500",
  },

  {
    icon: AlertTriangle,
    title: "Manejo de Errores 404",
    description:
      "Páginas de error personalizadas y estilizadas con el sistema de temas de shadcn.",
    color: "text-red-700",
  },
  {
    icon: Zap, // Importa 'Zap' de lucide-react
    title: "Arquitectura RPC-First",
    description:
      "Comunicación eficiente entre cliente y servidor mediante llamadas a procedimientos remotos, centralizando la lógica de negocio.",
    color: "text-yellow-600",
  },
  {
    icon: Server, // Importa 'Server' de lucide-react
    title: "Renderizado SSR Optimizado",
    description:
      "Uso avanzado de Server-Side Rendering con Next.js para garantizar velocidad de carga y SEO superior en rutas dinámicas.",
    color: "text-indigo-500",
  },
  {
    icon: DatabaseZap, // Importa 'DatabaseZap' o 'Table2' de lucide-react
    title: "Esquema SQL Profesional",
    description:
      "Arquitectura de base de datos relacional en PostgreSQL con políticas de seguridad RLS y tipado estricto mediante esquemas.",
    color: "text-blue-700",
  },
  {
    icon: Cloud, // Importa 'Cloud' de lucide-react
    title: "Despliegue en Netlify",
    description:
      "Infraestructura escalable desplegada globalmente con soporte nativo para funciones Edge y tiempos de respuesta mínimos.",
    color: "text-cyan-500",
  },
];

const stats = [
  { label: "Maxima Velcidad", value: "SSR - SSG" },
  { label: "Solo un viaje al servidor", value: "RPC" },
  { label: "Login Sin Contraseña", value: "Google Auth" },
  { label: "Un dominio, muchas organizaciones", value: "Multi-Tenant" },
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
                Centros de Diagnóstico Automotor (CDA) en Colombia {" "}
              </strong>
               con el fin de automatizar y digitalizar el proceso de recepcion
              y la orden de entrada, toma de datos estadisticos en el area de
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

      <section className="my-20 bg-linear-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">
              Todo lo necesario para robustes en multi organización
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Una Web App segura. Desde un sistema de autenticacion robusto
              hasta seguridad a nivel de base de datos RLS.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LogoMarquee></LogoMarquee>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            ¿Listo para escalar tu próximo proyecto SaaS?
          </h2>
          <p className="mt-4 text-xl opacity-90">
            Actualmente estoy abierto a nuevas oportunidades y retos técnicos.
            Si buscas a alguien que entienda el Full-Stack de verdad, hablemos.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://www.linkedin.com/in/aristizabaljuan/"
              target="_blank"
              className="px-8 py-4 rounded-xl bg-background text-foreground font-bold hover:bg-secondary transition-all shadow-xl hover:-translate-y-1 active:scale-95"
            >
              Ver Perfil de LinkedIn
            </Link>

            <Link
              href="https://github.com/spjhon"
              target="_blank"
              className="px-8 py-4 rounded-xl border-2 border-primary-foreground text-primary-foreground font-bold hover:bg-primary-foreground/10 transition-all active:scale-95"
            >
              Explorar GitHub
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Prodcuto</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Especificaciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/spjhon/Book-Building-Production-Grade-with-Supabase"
                    className="inline-flex items-center gap-2 text-sm font-medium text-black hover:opacity-70 transition-all whitespace-nowrap"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Computer className="w-4 h-4" />
                    <span>GitHub</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Recursos</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="https://github.com/spjhon/Book-Building-Production-Grade-with-Supabase"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Documentación
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              href="https://www.linkedin.com/in/aristizabaljuan/"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto inline-flex items-center gap-2 text-sm font-medium text-black hover:opacity-70 transition-all group"
            >
              <FileUser className="w-4 h-4 text-[#0A66C2] group-hover:scale-110 transition-transform" />
              <span>
                {" "}
                <Suspense
                  fallback={
                    <span className="animate-pulse bg-slate-200 rounded px-2 text-transparent">
                      0000
                    </span>
                  }
                >
                  <CurrentYear />
                </Suspense>
                {" Juan Camilo Patiño Aristizabal. Código de libre uso."}
              </span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
