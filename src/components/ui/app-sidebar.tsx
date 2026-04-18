"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, TicketPlus, LucideIcon } from "lucide-react";

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
import { LogoutButton } from "@/features/tickets/components/LogoutButton";

// Estructura de datos para el usuario y navegación
const DATA = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avataricon.jpg",
  },
};

interface NavItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const NAV_DATA: NavItem[] = [
  {
    title: "Nueva Orden de Entrada",
    description: "Crear Una Nueva Orden de Entrada",
    href: "/dashboard/recepcionista",
    icon: LayoutDashboard,
  },
  {
    title: "Órdenes de Entrada",
    description: "Listado de Ordenes de Entrada",
    href: "/dashboard/recepcionista/ordenes-de-entrada",
    icon: TicketPlus,
  },
  {
    title: "Nueva Orden de Entrada",
    description: "Creacion y edicion de ordenes de entrada",
    href: "/dashboard/recepcionista/crear-orden-de-entrada",
    icon: TicketPlus,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  // Función para verificar si la ruta está activa
  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex flex-row gap-3">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={DATA.user.avatar} alt={DATA.user.name} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{DATA.user.name}</span>
            <span className="truncate text-xs">{DATA.user.email}</span>
          </div>
        </div>
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
                      render={<div className="w-full" />}
                      className="h-20"
                      isActive={active}
                    >
                      <Link
                        href={item.href}
                        className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 
                          ${
                            active
                              ? "border-primary/40 bg-sidebar-accent shadow-sm"
                              : "border-transparent hover:border-border hover:bg-sidebar-accent"
                          }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors 
                          ${
                            active
                              ? "border-primary/40 bg-primary/10"
                              : "bg-background shadow-xs group-hover:border-primary/40 group-hover:bg-primary/5"
                          }`}
                        >
                          <Icon
                            className={`size-4.5 transition-colors 
                            ${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="leading-none">{item.title}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {item.description}
                          </span>
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