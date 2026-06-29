"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogoutButton } from "./LogoutButton";

export default function HeaderSidebar() {
  const pathname = usePathname();

  // 1. Dividimos la ruta completa
  const allSegments = pathname.split("/").filter((item) => item !== "");

  // 2. Pre-calculamos toda la información para no romper los enlaces originales (href)
  const breadcrumbItems = allSegments.map((segment, index) => {
    const href = `/${allSegments.slice(0, index + 1).join("/")}`;
    const title = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return { href, title };
  });

  // 3. 🌟 FILTRO CLAVE: Nos quedamos estrictamente con los últimos dos elementos
  const visibleItems = breadcrumbItems.slice(-2);

  return (
    <div className="flex flex-row justify-between items-center border bg-white">
      <header className="flex flex-wrap h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-5 my-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {visibleItems.map((item, index) => {
              // Comprobamos si es el último basándonos en la lista visible
              const isLast = index === visibleItems.length - 1;

              return (
                <Fragment key={item.href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{item.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {/* Si hay dos elementos y es el primero, metemos el separador */}
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <LogoutButton />
    </div>
  );
}