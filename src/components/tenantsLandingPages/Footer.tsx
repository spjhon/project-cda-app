import Link from "next/link";
import { Suspense } from "react";

import Image from "next/image";
import logo from "../../../public/tenantsLanding/fullmotosla25/fullmotos_logo.jpg"
import DynamicYear from "../landingPage/DynamicYear";

export function Footer() {
  const navegación = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "#servicios" },
    { name: "Tarifas", href: "#precios" },
    { name: "Instalaciones", href: "#fotosSede" },
    { name: "Preguntas Frecuentes", href: "#preguntasFrecuentes" }
  ];

  return (
    <footer className="w-full px-6 md:px-12 bg-white dark:bg-[#051923] border-t border-[#006494]/10 dark:border-white/5 transition-colors duration-300">
      
      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-10 py-12">
        
        {/* COLUMNA 1: LOGO E INFO DEL CDA */}
        <div className="flex flex-col max-w-md space-y-4">
          <div className="w-fit">
            <Link prefetch={true} href="/" className="flex items-center">
              <Image
                src={logo}
                alt="CDA Fullmotos la 25 Logo"
                priority
                className="block dark:hidden w-auto h-20 object-contain rounded-2xl"
              />
              <Image
                src={logo}
                alt="CDA Fullmotos la 25 Logo"
                priority
                className="hidden dark:block w-auto h-20 object-contain rounded-2xl"
              />
            </Link>
          </div>

          <p className="text-sm font-normal text-[#003554]/70 dark:text-white/60 leading-relaxed">
            CDA especializado en la Revisión Técnico-Mecánica y de Emisiones Contaminantes para motocicletas 2 y 4 tiempos en Manizales. Comprometidos con tu seguridad vial.
          </p>
          
          <div className="space-y-1.5 text-sm text-[#003554]/80 dark:text-white/70">
            <p><span className="font-bold text-[#051923] dark:text-[#00a6fb]">Dirección:</span> Calle 25, Manizales, Caldas</p>
            <p><span className="font-bold text-[#051923] dark:text-[#00a6fb]">Celular / WhatsApp:</span> +57 323 330 3659</p>
          </div>
        </div>

        {/* COLUMNA 2: NAVEGACIÓN */}
        <div className="flex flex-col sm:min-w-37.5">
          <span className="text-xs font-black tracking-wider uppercase text-[#051923] dark:text-[#00a6fb] mb-4">
            Enlaces
          </span>
          <div className="flex flex-col space-y-2.5">
            {navegación.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-sm font-medium text-[#003554]/70 dark:text-white/60 hover:text-[#00a6fb] dark:hover:text-[#00a6fb] transition-colors w-fit"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* COLUMNA 3: REDES SOCIALES */}
        <div className="flex flex-col sm:min-w-37.5">
          <span className="text-xs font-black tracking-wider uppercase text-[#051923] dark:text-[#00a6fb] mb-4">
            Síguenos en
          </span>
          <div className="flex items-center space-x-5 text-[#003554]/60 dark:text-white/50">
            <a
              href="https://wa.me/573233303659"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00a6fb] transition-colors"
              aria-label="WhatsApp"
            >
              <WhatsApp size={22} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00a6fb] transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={22} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00a6fb] transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={22} />
            </a>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="py-8 text-xs font-medium text-center text-[#003554]/50 dark:text-white/40 border-t border-[#006494]/10 dark:border-white/5">
        Copyright ©{" "}
        <Suspense fallback={<span>2026</span>}>
          <DynamicYear />
        </Suspense>{" "}
        CDA Fullmotos la 25. Hecho con ♥ por Juan Aristizabal.
      </div>
    </footer>
  );
}

const WhatsApp = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const Facebook = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
  </svg>
);

const Instagram = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm6.44-3.77a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />
  </svg>
);