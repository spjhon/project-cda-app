import Link from "next/link";
import { Suspense } from "react";
import DynamicYear from "./DynamicYear";
import Image from "next/image";
import LogoDark from "../../../public/logo_dark_transparente_resize_cropped.png";
import LogoLight from "../../../public/logo_light_transparente_resize_cropped.png";

export function Footer() {
  const navigation = [
    { name: "Soluciones", href: "#soluciones", external: false },
    { name: "Planes y Tarifas", href: "#pricing", external: false },
    { name: "Conócenos", href: "https://cda-app.com/about", external: true, prefetch: true },
    { name: "Visita Nuestra DEMO", href: "https://demo.cda-app.com/auth/login", external: true },
  ];

  return (
    <div className="w-full px-12">
      {/* CONTENEDOR PRINCIPAL REESTRUCTURADO CON FLEXBOX */}
      <div className="flex flex-col lg:flex-row max-w-7xl justify-between gap-10 pt-10 mx-auto mt-5 border-t border-gray-100 dark:border-trueGray-700">
        
        {/* COLUMNA 1: LOGO E INFO */}
        <div className="flex flex-col max-w-md">
          <div className="w-fit">
            <Link
              prefetch={true}
              rel="noreferrer noopener"
              href="/"
              className="flex items-center"
            >
              {/* ☀️ LOGO MODO CLARO */}
              <Image
                src={LogoLight}
                alt="cdApp Logo"
                priority
                className="block dark:hidden w-auto h-8"
              />

              {/* 🌙 LOGO MODO OSCURO */}
              <Image
                src={LogoDark}
                alt="cdApp Logo"
                priority
                className="hidden dark:block w-auto h-8"
              />
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Ecosistema integral para la administración, gestión de calidad y blindaje normativo de CDAs bajo la norma ISO 17020.
          </p>
          
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">E-mail:</span> spjhon@gmail.com</p>
            <p><span className="font-medium text-foreground">Cel:</span> +57 321 522 4583</p>
          </div>
        </div>

        {/* COLUMNA 2: NAVEGACIÓN */}
        <div className="flex flex-col min-w-37.5">
          <span className="text-sm font-semibold tracking-wider uppercase text-foreground mb-3">
            Enlaces
          </span>
          <div className="flex flex-col space-y-2">
            {navigation.map((item, index) =>
              item.external ? (
                <a
                  key={index}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={index}
                  href={item.href}
                  prefetch={item.prefetch}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </div>

        {/* COLUMNA 3: REDES SOCIALES */}
        <div className="flex flex-col min-w-37.5">
          <span className="text-sm font-semibold tracking-wider uppercase text-foreground mb-3">
            Síguenos en
          </span>
          <div className="flex items-center space-x-4">
            {/* WHATSAPP */}
            <a
              href="https://wa.me/573215224583"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="sr-only">WhatsApp</span>
              <WhatsApp size={20} />
            </a>

            {/* FACEBOOK */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="sr-only">Facebook</span>
              <Facebook size={20} />
            </a>

            {/* INSTAGRAM */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="sr-only">Instagram</span>
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* COPYRIGHT CON SUSPENSE */}
      <div className="py-10 mt-8 text-sm text-center text-gray-600 dark:text-gray-400 border-t border-gray-100/50 dark:border-trueGray-700/50">
        Copyright ©{" "}
        <Suspense fallback={<span>2026</span>}>
          <DynamicYear />
        </Suspense>{" "}
        . Hecho con ♥ por Juan Aristizabal
      </div>
    </div>
  );
}

const WhatsApp = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
  >
    <path
      fill="currentColor"
      d="M10 0C4.477 0 0 4.477 0 10c0 2.187.705 4.215 1.904 5.861L.658 19.577l3.843-1.228A9.953 9.953 0 0010 20c5.523 0 10-4.477 10-10S15.523 0 10 0zm5.821 14.121c-.241.682-1.199 1.246-1.963 1.411-.523.111-1.205.199-3.503-.753-2.581-1.069-6.165-4.878-6.165-7.413 0-1.29.744-2.793 2.045-2.793.626 0 .764.012.97.506.241.582.829 2.017.899 2.164.289.603-.294.956-.717 1.481-.135.158-.288.329-.117.623.17.288.758 1.246 1.622 2.015 1.116.994 2.021 1.311 2.345 1.446.241.1.529.077.705-.111.223-.241.5-.641.782-1.035.199-.282.452-.317.717-.217.179.062 2.454 1.118 2.55 1.287.071.123.071.706-.17 1.388z"
    />
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