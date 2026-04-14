"use client"

import { Button} from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu"
import { RouteProps } from "./Navbar"
import Link from "next/link"
import TenantName from "../TenantName"
import { Megaphone } from "lucide-react"
import { LogoutButton } from "../LogoutButton"
import { useState } from "react"
import { usePathname } from "next/navigation" // 👈 Importar
import { cn } from "@/lib/utils" // 👈 Importar

interface MobileMenuProps {
  routes: RouteProps[];
}

export function MobileMenu({ routes }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // 👈 Obtener ruta actual

  // 👇 Helper para detectar ruta activa
  const isActiveRoute = (href: string) => {
    if (href === "/tickets") {
      return pathname === href || pathname === "/tickets/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild className="xl:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 hover:bg-transparent focus-visible:ring-0 z-20"
        >
          <div className="flex flex-col justify-center items-center">
            <span
              className={`bg-black block transition-all duration-300 ease-out 
              h-0.5 w-6 rounded-sm ${
                isOpen ? "rotate-45 translate-y-1" : "-translate-y-1"
              }`}
            ></span>
            <span
              className={`bg-black block transition-all duration-300 ease-out 
              h-0.5 w-6 rounded-sm my-0.5 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            ></span>
            <span
              className={`bg-black block transition-all duration-300 ease-out 
              h-0.5 w-6 rounded-sm ${
                isOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"
              }`}
            ></span>
          </div>
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>
              <Link
                
                href="/"
                onClick={() => setIsOpen(false)}
              >
                <TenantName />
              </Link>
            </DrawerTitle>
            <DrawerDescription>Menu</DrawerDescription>
          </DrawerHeader>

          <div className="flex justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <nav className="flex flex-col gap-4 my-6 w-60">
                  {routes.map((route, i) => {
                    const isActive = isActiveRoute(route.href); // 👈 Verificar activo
                    
                    return (
                      <DrawerClose asChild key={i}>
                        <Link
                         
                          href={route.href}
                          className={cn(
                            // 👇 Dimensiones fijas SIEMPRE
                            "h-12 px-4 py-2 w-full",
                            "inline-flex items-center justify-center",
                            "rounded-md text-[17px] font-bold",
                            "transition-colors duration-200",
                            "border-2", // 👈 Borde siempre presente
                            
                            // 👇 Solo cambia colores, no layout
                            isActive
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-accent hover:text-accent-foreground border-input"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {route.label}
                        </Link>
                      </DrawerClose>
                    );
                  })}
                </nav>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <DrawerFooter className="gap-4">
            <div className="flex items-center justify-center gap-4 py-2">
              <Megaphone className="text-black" />
              <LogoutButton />
            </div>
            <DrawerClose asChild>
              <Button variant="default" className="w-full">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}