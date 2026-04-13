"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, TicketPlus } from "lucide-react";

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


const DATA = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avataricon.jpg",
  },
};

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
              {/* Item: Nueva orden de entrada */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<div className="w-full" />}
                  className="h-20"
                  isActive={isActive("/dashboard/recepcionista")}
                >
                  <Link
                    href="/dashboard/recepcionista"
                    className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 
                      ${
                        isActive("/dashboard/recepcionista")
                          ? "border-primary/40 bg-sidebar-accent shadow-sm"
                          : "border-transparent hover:border-border hover:bg-sidebar-accent"
                      }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors 
                      ${
                        isActive("/dashboard/recepcionista")
                          ? "border-primary/40 bg-primary/10"
                          : "bg-background shadow-xs group-hover:border-primary/40 group-hover:bg-primary/5"
                      }`}
                    >
                      <LayoutDashboard
                        className={`size-4.5 transition-colors 
                        ${isActive("/dashboard/recepcionista") ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="leading-none">
                        Nueva Orden de Entrada
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Crear Una Nueva Orden de Entrada
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Item: Órdenes de Entrada */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<div className="w-full" />}
                  className="h-20"
                  isActive={isActive(
                    "/dashboard/recepcionista/ordenes-de-entrada",
                  )}
                >
                  <Link
                    href="/dashboard/recepcionista/ordenes-de-entrada"
                    className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 
                      ${
                        isActive("/dashboard/recepcionista/ordenes-de-entrada")
                          ? "border-primary/40 bg-sidebar-accent shadow-sm"
                          : "border-transparent hover:border-border hover:bg-sidebar-accent"
                      }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors 
                      ${
                        isActive("/dashboard/recepcionista/ordenes-de-entrada")
                          ? "border-primary/40 bg-primary/10"
                          : "bg-background shadow-xs group-hover:border-primary/40 group-hover:bg-primary/5"
                      }`}
                    >
                      <TicketPlus
                        className={`size-4.5 transition-colors 
                        ${isActive("/dashboard/recepcionista/ordenes-de-entrada") ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="leading-none">Órdenes de Entrada</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Listado de Ordenes de Entrada
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <LogoutButton ></LogoutButton>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          SaaS CDA - v1.0
        </span>
      </SidebarFooter>
    </Sidebar>
  );
}
