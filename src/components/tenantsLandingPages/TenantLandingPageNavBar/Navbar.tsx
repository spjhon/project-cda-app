//Importacion del dropdown para el cambio de tema
import { ModeToggle } from "./mode-toggle";
import Image, { StaticImageData } from "next/image"; // 🔑 Importamos el componente de Next.js

//Importacion de iconos de radix y lucide
import { Button } from "@/components/ui/button";

import { MobileMenu } from "./MobileMenu";
import Link from "next/link";
import { RouteProps } from "../FullmotosLandingPage";

interface NavBarProps {
  routeList: RouteProps[];
  logo: StaticImageData;
}

export const Navbar = ({ routeList, logo }: NavBarProps) => {
  return (
    <header className="bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-0 sticky border-b top-0 z-40 ">
      <div className="container flex flex-row justify-between items-center mx-auto px-3 relative h-15 md:h-20">
        <Link
          prefetch={true}
          rel="noreferrer noopener"
          href="/"
          className="ml-2 flex items-center"
        >
          {/* ☀️ LOGO PARA MODO CLARO: Se muestra por defecto, se oculta en modo oscuro */}
          <Image
            src={logo}
            alt="cdApp Logo"
            priority // 🏎️ Le da prioridad de carga por estar en el Navbar (LCP optimization)
            className="block dark:hidden w-auto h-15 md:h-20 rounded-xl" // Ajusta h-8 (altura) según necesites tu diseño
          />

          {/* 🌙 LOGO PARA MODO OSCURO: Se oculta por defecto, se muestra en modo oscuro */}
          <Image
            src={logo}
            alt="cdApp Logo"
            priority
            className="hidden dark:block w-auto h-15 md:h-20 rounded-xl" // Mismas dimensiones para que no salte el layout
          />
        </Link>

        <MobileMenu routes={routeList} />

        <div className="flex gap-4 items-center">
          <div className="flex items-center justify-center gap-4 py-2">
            {/* WhatsApp */}
            <a
              rel="noreferrer noopener"
              href="https://wa.me/573233303659"
              target="_blank"
              className="flex items-center justify-center"
              aria-label="Contactar por WhatsApp"
            >
              <Button
                variant="outline"
                className="border border-black p-3 bg-card hover:bg-[#00a6fb]/10"
              >
                <WhatsApp size={20} />
              </Button>
            </a>

            {/* Facebook */}
            <a
              rel="noreferrer noopener"
              href="https://facebook.com"
              target="_blank"
              className="flex items-center justify-center"
              aria-label="Ir a Facebook"
            >
              <Button
                variant="outline"
                className="border border-black p-3 bg-card hover:bg-[#00a6fb]/10"
              >
                <Facebook size={20} />
              </Button>
            </a>

            {/* Instagram */}
            <a
              rel="noreferrer noopener"
              href="https://instagram.com"
              target="_blank"
              className="flex items-center justify-center"
              aria-label="Ir a Instagram"
            >
              <Button
                variant="outline"
                className="border border-black p-3 bg-card hover:bg-[#00a6fb]/10"
              >
                <Instagram size={20} />
              </Button>
            </a>
          </div>

          <ModeToggle />
        </div>

        
         
          
      </div>
    </header>
  );
};

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
