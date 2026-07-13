import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import Link from "next/link";
import Image, { StaticImageData } from "next/image";


import { RouteProps } from "../FullmotosLandingPage";

interface MobileMenuProps {
  routes: RouteProps[];
  logo: StaticImageData;
  currentTenant: string;
}

export function MobileMenu({ routes, logo, currentTenant }: MobileMenuProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild className="p-4">
        <Button variant="outline" className="border-black">
          Menu
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        {/* Subí el max-w a md para que las dos columnas respiren bien */}
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle></DrawerTitle>
            <Link
              prefetch={true}
              rel="noreferrer noopener"
              href="/"
              className="flex items-center justify-center"
            >
              <Image
                src={logo}
                alt="CDA Logo"
                priority
                className="w-auto h-25 rounded-2xl object-contain dark:brightness-110" 
              />
            </Link>
          </DrawerHeader>

          {/* Menú de navegación en dos columnas alineado a la izquierda */}
          <div className="p-6 pb-0">
            <NavigationMenu className="mx-auto my-4 max-w-full">
              <NavigationMenuList className="grid grid-cols-2 gap-3 w-full justify-start items-stretch space-x-0">
                {routes.map((route: RouteProps, i) => (
                  <DrawerClose asChild key={i}>
                    <Link
                      prefetch={true}
                      rel="noreferrer noopener"
                      href={route.href}
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        className="text-[14px] font-bold border-black p-3 bg-card w-full justify-start text-left h-auto"
                      >
                        {route.label}
                      </Button>
                    </Link>
                  </DrawerClose>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <DrawerFooter className="my-6">
            <DrawerClose asChild>
              <Button variant="default">Cerrar</Button>
            </DrawerClose>

            <Link
              prefetch={true}
              href={ `https://${currentTenant}.cda-app.com/auth/login`}
             
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex"
            >
              <Button variant="default" className="w-full">
                Entrada Corporativa
              </Button>
            </Link>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
