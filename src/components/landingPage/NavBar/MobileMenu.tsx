

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
 
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu"

import {RouteProps} from "./Navbar"
import Link from "next/link"
import Image from "next/image"; // 🔑 Importamos el componente de Next.js

import LogoDark from "../../../../public/logo_dark_transparente_resize_cropped.png"
import LogoLight from "../../../../public/logo_light_transparente_resize_cropped.png"
import { ModeToggle } from "./mode-toggle"


interface MobileMenuProps {
  routes: RouteProps[];
}


export function MobileMenu({routes}: MobileMenuProps) {
 

  

  return (
    <Drawer>



      <DrawerTrigger asChild className=" p-4">
        <Button variant="outline" className={"border-black"}>Menu</Button>
      </DrawerTrigger>


      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">

          <DrawerHeader>
            <DrawerTitle></DrawerTitle>
            <Link
            prefetch={true}
              rel="noreferrer noopener"
              href="/"
              className="flex items-center justify-center"
            >
              {/* ☀️ LOGO PARA MODO CLARO: Se muestra por defecto, se oculta en modo oscuro */}
              <Image
                src={LogoLight}
                alt="cdApp Logo"
                priority // 🏎️ Le da prioridad de carga por estar en el Navbar (LCP optimization)
                className="block dark:hidden w-auto h-15" // Ajusta h-8 (altura) según necesites tu diseño
              />
            
              {/* 🌙 LOGO PARA MODO OSCURO: Se oculta por defecto, se muestra en modo oscuro */}
              <Image
                src={LogoDark}
                alt="cdApp Logo"
                priority
                className="hidden dark:block w-auto h-15" // Mismas dimensiones para que no salte el layout
              />
            </Link>
          </DrawerHeader>

          {/* mobile */}
          <div className="p-4 pb-0">
            <NavigationMenu className="mx-auto my-10">

              <NavigationMenuList className="flex flex-col items-center w-full justify-center gap-6">
         
              {routes.map((route: RouteProps, i) => (
                <DrawerClose asChild key={i}>
                <Link
                prefetch={true}
                  rel="noreferrer noopener"
                  href={route.href}
                
                  
                >
                  <Button  variant="outline" className={"text-[17px] font-bold! border-black p-4 bg-card"} >
                  {route.label}
                  </Button>
                </Link>
                </DrawerClose>
              ))}
           
              </NavigationMenuList>
              
            </NavigationMenu>
          </div>


          <DrawerFooter className="my-10">
           
              
            <DrawerClose asChild>
              <Button variant="default">Cerrar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>



      
    </Drawer>
  )
}
