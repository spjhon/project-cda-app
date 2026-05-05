import { CurrentYear } from "@/features/LandingPage/CurrentYear";
import { Hero } from "@/features/LandingPage/Hero";
import { HeroVideo } from "@/features/LandingPage/HeroVideo";
import { LogoMarquee } from "@/features/LandingPage/LogoMarquee";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Clock,
  Cloud,
  Database,
  DatabaseZap,
  FileCode2,
  Computer,
  Globe,
  LayoutTemplate,
  FileUser,
  LucideIcon,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";




interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export default function Home() {
  
  // Definimos los tenants para iterarlos fácilmente
  const tenants = ["fullmotos", "viterbocaldas", "tecnofresno", "autobig"];

  // En local usamos nuestro dominio base con el puerto
  // En producción podrías cambiar esto por process.env.NEXT_PUBLIC_ROOT_DOMAIN
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

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

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-4">
            {/* Lado Izquierdo: Logo */}
            <div className="shrink-0 min-w-fit">
              <span className="text-xl md:text-2xl font-bold bg-linear-to-r from-blue-600 to-primary-500 bg-clip-text text-transparent whitespace-nowrap">
                SupaSass
              </span>
            </div>

            {/* Lado Derecho: Links comprimibles */}
            <div className="flex items-center gap-3 sm:gap-6 md:gap-8 overflow-hidden">
              <Link
                
                href="#features"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap transition-colors"
              >
                Especificaciones
              </Link>

              <Link
                
                href="https://github.com/spjhon/Book-Building-Production-Grade-with-Supabase"
                className="inline-flex items-center gap-2 text-sm font-medium text-black hover:opacity-70 transition-all whitespace-nowrap"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Computer className="w-4 h-4" />
                <span>GitHub</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      

      <Hero></Hero>

      <Link
              
              href="/not-found"
              
              className="px-8 py-4 rounded-xl bg-background text-foreground font-bold hover:bg-secondary transition-all shadow-xl hover:-translate-y-1 active:scale-95"
            >
              Ver Perfil de LinkedIn
            </Link>

      {/* Sección de Selección de Organización */}
      <section className="my-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Escoge una{" "}
              <span className="bg-linear-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                ORGANIZACIÓN
              </span>
            </h2>
            <p className="mt-4 text-gray-500">
              Accede directamente al portal de la empresa, cada organizacion
              tiene un espacio de trabajo propio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tenants.map((tenant) => (
             
                <Link
                  
                  key={tenant}
                  href={`http://${tenant}.${rootDomain}/auth/login`}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20"
                >
                  {/* Decoración sutil de fondo al hacer hover */}
                  <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />

                  <div className="relative flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Globe className="h-6 w-6" />
                    </div>

                    <h3 className="text-lg font-bold capitalize text-gray-900 group-hover:text-primary transition-colors">
                      {tenant}
                    </h3>

                    <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                      Ir al portal
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </Link>
            
            ))}
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
                <Suspense fallback={<span className="animate-pulse bg-slate-200 rounded px-2 text-transparent">0000</span>}>
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
