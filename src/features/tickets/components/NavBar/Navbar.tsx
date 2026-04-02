"use client";

import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { ArrowLeft, Megaphone } from "lucide-react";
import { MobileMenu } from './MobileMenu';
import Link from "next/link";
import { LogoutButton } from "../LogoutButton";
import TenantName from "../TenantName";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface RouteProps {
  href: "/tickets" | "/tickets/new" | "/tickets/users";
  label: string;
}

export const Navbar = () => {
  const pathname = usePathname();

  const routeList: RouteProps[] = [
    { href: "/tickets", label: "Tickets" },
    { href: "/tickets/new", label: "Nuevo Ticket" },
    { href: "/tickets/users", label: "Usuarios" },
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/tickets") {
      return pathname === href || pathname === "/tickets/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="bg-clip-padding backdrop-filter py-4 backdrop-blur-md bg-opacity-0 sticky border-b top-0 z-10 dark:border-b-slate-700 dark:bg-background">
      <div className="flex flex-row justify-end xl:justify-between items-center mx-auto max-w-2/3">
        
        <Link
         prefetch={false}
          href="https://cda-app.com/"
          className="fixed left-8 top-[1.6rem] flex items-center text-sm text-black hover:opacity-70 transition-colors font-medium z-20"
      >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Regresar al Landign Page
      </Link>


        <Link
          prefetch={false}
          rel="noreferrer noopener"
          href="/"
          className="font-bold text-xl hidden xl:flex"
        >
          <TenantName />
        </Link>

        <NavigationMenu className="hidden xl:flex">
          <NavigationMenuList>
            <nav className="hidden xl:flex gap-6">
              {routeList.map((route, i) => {
                const isActive = isActiveRoute(route.href);
                
                return (
                  <Link
                     prefetch={false}
                    href={route.href}
                    key={i}
                    className={cn(
                      // 👇 Base: mismas dimensiones SIEMPRE
                      "h-10 px-4 py-2 inline-flex items-center justify-center",
                      "rounded-md text-[17px] font-bold",
                      "transition-colors duration-200",
                      "border-2", // 👈 Border siempre presente
                      
                      // 👇 Solo cambia el color, no el layout
                      isActive 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-background hover:bg-accent hover:text-accent-foreground border-input"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {route.label}
                  </Link>
                );
              })}
            </nav>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="xl:hidden">
          <MobileMenu routes={routeList} />
        </div>

        <div className="hidden xl:flex items-center gap-4">
          <Megaphone />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};