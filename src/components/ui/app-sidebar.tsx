"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ClipboardList, FilePenLine, FileStack, LucideIcon, PlusCircle, UserCog} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogoutButton } from "@/components/dashboard/recepcionista/LogoutButton";
import { useContext } from "react";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import { Separator } from "./separator";


interface NavItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

interface AppSidebarProps {
  rol: string; // 👈 Aquí declaramos que NAV_DATA es el array
}




interface NavItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const NavRecepcionista: NavItem[] = [
  {
    title: "Nueva Orden de Entrada",
    description: "Crear una nueva orden de entrada",
    href: "/dashboard/recepcionista",
    icon: PlusCircle, // ✨ Limpio, directo, invita a la acción
  },
  {
    title: "Órdenes de Entrada",
    description: "Listado de órdenes de entrada",
    href: "/dashboard/recepcionista/ordenes-de-entrada",
    icon: FileStack, // ✨ Da la sensación de un archivo digital con múltiples órdenes
  },
  
  {
    title: "Mi Perfil", // 🔥 NUEVO MÓDULO
    description: "Gestionar tu cuenta, firma y credenciales",
    href: "/dashboard/recepcionista/perfil",
    icon: UserCog, // Queda impecable con el contenedor dinámico del sidebar
  },
];



const NavOficina: NavItem[] = [
  
  {
    title: "Órdenes de Entrada",
    description: "Listado de órdenes de entrada",
    href: "/dashboard/oficina",
    icon: FileStack, // ✨ Da la sensación de un archivo digital con múltiples órdenes
  },
  
  {
    title: "Mi Perfil", // 🔥 NUEVO MÓDULO
    description: "Gestionar tu cuenta, firma y credenciales",
    href: "/dashboard/oficina/perfil",
    icon: UserCog, // Queda impecable con el contenedor dinámico del sidebar
  },
];


const NavDirectorTecnico: NavItem[] = [
  
  {
    title: "Órdenes de Entrada",
    description: "Listado de órdenes de entrada",
    href: "/dashboard/director-tecnico",
    icon: FileStack, // ✨ Da la sensación de un archivo digital con múltiples órdenes
  },
  {
    title: "Nueva Plantilla Orden de Entrada", // Ojo: podrías renombrarlo a "Editor de Órdenes" para diferenciarlo de la primera
    description: "Creación y edición de órdenes de entrada",
    href: "/dashboard/director-tecnico/crear-orden-de-entrada",
    icon: FilePenLine, // ✨ El lápiz sobre el documento grita "creación / edición"
  },
  {
    title: "Plantillas Creadas",
    description: "Listado de plantillas creadas",
    href: "/dashboard/director-tecnico/plantillas-creadas",
    icon: ClipboardList, // ✨ Representa fielmente los formatos de inspección ISO
  },
  
  {
    title: "Mi Perfil", // 🔥 NUEVO MÓDULO
    description: "Gestionar tu cuenta, firma y credenciales",
    href: "/dashboard/director-tecnico/perfil",
    icon: UserCog, // Queda impecable con el contenedor dinámico del sidebar
  },
];


export function AppSidebar({ rol }: AppSidebarProps) {


let NAV_DATA = NavOficina; // Valor por defecto
  
  switch (rol) {
    case "recepcionista":
      NAV_DATA = NavRecepcionista;
      break;
    case "oficina":
      NAV_DATA = NavOficina;
      break;
    case "director-tecnico":
      NAV_DATA = NavDirectorTecnico;
      break;
  }

const contextRecived = useContext(PermissionsContext);


  const tenantData = contextRecived?.PermissionsContextValue.tenantObject
  const user = contextRecived?.PermissionsContextValue.user;




  const pathname = usePathname();

  // Función para verificar si la ruta está activa
  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="flex flex-col gap-2.5 px-4 py-3 border-b border-sidebar-border/50">
        {/* Funciones helper internas para las iniciales */}
        {(() => {
          const getTenantInitials = (name?: string) => {
            if (!name) return "CDA";
            return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
          };

          const getUserInitials = (name?: string) => {
            if (!name) return "U";
            return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
          };

          return (
            <>
              {/* BLOQUE 1: DATOS DEL TENANT (CDA / ORGANIZACIÓN) */}
              <div className="flex items-center gap-3 group/tenant">
                <Avatar className="h-9 w-9 rounded-lg border border-border/60 shadow-xs bg-background transition-transform duration-200 group-hover/tenant:scale-102">
                  <AvatarImage 
                    src={tenantData?.logo_url || undefined} 
                    alt={tenantData?.name || "Organización"} 
                    className="object-contain p-1"
                  />
                  <AvatarFallback className="rounded-lg bg-primary/5 text-primary text-xs font-bold">
                    {getTenantInitials(tenantData?.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold text-sm text-foreground tracking-tight">
                    {tenantData?.name || "Cargando CDA..."}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground/90 font-normal tracking-wideACL">
                    {tenantData?.domain || "cda-sistema.com"}
                  </span>
                </div>
              </div>

              {/* Separador minimalista estilo Shadcn */}
              <Separator className="bg-sidebar-border/60 my-0.5" />

              {/* BLOQUE 2: DATOS DEL USUARIO LOGUEADO */}
              <div className="flex items-center gap-3 px-0.5 opacity-85 hover:opacity-100 transition-opacity duration-200">
                <Avatar className="h-7 w-7 rounded-full border border-sidebar-border bg-sidebar-accent">
                  <AvatarFallback className="rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                    {getUserInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="grid flex-1 text-left leading-none space-y-0.5">
                  <span className="truncate text-xs font-medium text-sidebar-foreground">
                    {user?.name || "Usuario Activo"}
                  </span>
                  {user?.email && (
                    <span className="truncate text-[10px] text-muted-foreground font-normal">
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recepcionista</SidebarGroupLabel>

          <SidebarGroupContent className="flex flex-col gap-2 px-2">
            <SidebarMenu>
              {NAV_DATA.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      // 🔥 Fusiona el botón directamente con el Link
                      isActive={active}
                      className={`group relative h-20 w-full justify-start gap-4 rounded-xl px-4 py-3 transition-all duration-300 ease-out
                        ${
                          active
                            ? "bg-primary/4 font-medium text-primary shadow-xs before:absolute before:left-0 before:top-1/4 before:h-1/2 before:w-1.5 before:rounded-r-full before:bg-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                    >
                      <Link prefetch={true} href={item.href} className="flex w-full items-center gap-4">
                        {/* Contenedor del Icono - Estilizado pero espacioso */}
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ease-out
                            ${
                              active
                                ? "border-primary/20 bg-primary/10 text-primary scale-102"
                                : "border-transparent bg-muted/40 text-muted-foreground group-hover:bg-sidebar-accent-foreground/5 group-hover:text-sidebar-accent-foreground group-hover:scale-105"
                            }`}
                        >
                          <Icon className="size-5 transition-transform duration-300 ease-out group-hover:rotate-1" />
                        </div>

                        {/* Bloque de Textos con el espaciado original */}
                        <div className="flex flex-col text-left space-y-0.5">
                          <span className="text-sm font-semibold tracking-tight leading-none">
                            {item.title}
                          </span>
                          {item.description && (
                            <span 
                              className={`text-[11px] font-normal tracking-wide leading-relaxed transition-colors duration-300
                                ${active ? "text-primary/70" : "text-muted-foreground/80 group-hover:text-sidebar-accent-foreground/70"}`}
                            >
                              {item.description}
                            </span>
                          )}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <LogoutButton />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          SaaS CDA - v1.0
        </span>
      </SidebarFooter>
    </Sidebar>
  );
}