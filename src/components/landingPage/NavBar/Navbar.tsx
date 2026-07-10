

//Importacion del dropdown para el cambio de tema
import { ModeToggle } from "./mode-toggle";
import Image from "next/image"; // 🔑 Importamos el componente de Next.js
//Importacion de los componentes de shadcn
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";


import { Megaphone } from "lucide-react";

import LogoDark from "../../../../public/logo_dark_transparente_resize_cropped.png"
import LogoLight from "../../../../public/logo_light_transparente_resize_cropped.png"

//Importacion de iconos de radix y lucide
import { Button } from "@/components/ui/button";

import { MobileMenu } from './MobileMenu';
import Link from "next/link";





//Props para la barra de navegacion
export interface RouteProps {
  href: "/" | "/about";
  label: string;
}



export const Navbar = () => {



  const routeList: RouteProps[] = [
    {
    href: "/",
    label: "Home",
  },
  {
    href: "/about",
    label: "Acerca de",
  },
  
  
  
];
  
  return (
    <header className="bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-0 sticky border-b top-0 z-40 ">
      <div className="container flex flex-row justify-between items-center mx-auto relative h-13">

        <Link
  rel="noreferrer noopener"
  href="/"
  className="ml-2 flex items-center"
>
  {/* ☀️ LOGO PARA MODO CLARO: Se muestra por defecto, se oculta en modo oscuro */}
  <Image
    src={LogoLight}
    alt="cdApp Logo"
    priority // 🏎️ Le da prioridad de carga por estar en el Navbar (LCP optimization)
    className="block dark:hidden w-auto h-8" // Ajusta h-8 (altura) según necesites tu diseño
  />

  {/* 🌙 LOGO PARA MODO OSCURO: Se oculta por defecto, se muestra en modo oscuro */}
  <Image
    src={LogoDark}
    alt="cdApp Logo"
    priority
    className="hidden dark:block w-auto h-8" // Mismas dimensiones para que no salte el layout
  />
</Link>

        <NavigationMenu className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <NavigationMenuList className="">
            {/* desktop */}
            <nav className="hidden xl:flex gap-6">
              {routeList.map((route: RouteProps, i) => (
                <Link
                  rel="noreferrer noopener"
                  href={route.href}
                  key={i}
                  
                >
                  <Button  variant="outline" className={"text-[17px] font-bold! border-black p-4 bg-card"} >
                  {route.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </NavigationMenuList>
        </NavigationMenu>

        
            
        <div className="hidden xl:flex gap-2 items-center">
            <a
              rel="noreferrer noopener"
              href="https://wa.me/573215224583"
              target="_blank"
              className={` flex items-center justify-center gap-2`}
              aria-label="Contactar por WhatsApp"
            >
              <Button variant="outline" className={"border border-black p-4"}>
              <Megaphone></Megaphone>
              <span className="text-sm font-bold">Redes Sociales</span>
              </Button>
            </a>

            <ModeToggle />
          

        </div>

        <MobileMenu routes = {routeList} />

      </div>
    </header>
  );
};