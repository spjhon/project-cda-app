"use client"

import { Fragment } from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { LogoutButton } from "../tickets/components/LogoutButton"

export default function HeaderSidebar() {
  const pathname = usePathname()
  
  // Dividimos la ruta y quitamos los espacios vacíos
  // Ejemplo: "/dashboard/recepcionista" -> ["dashboard", "recepcionista"]
  const segments = pathname.split("/").filter((item) => item !== "")

  return (
    <div className="flex flex-row justify-between items-center">
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-5 my-auto"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const href = `/${segments.slice(0, index + 1).join("/")}`
            const isLast = index === segments.length - 1
            
            // Formateamos el texto: quitamos guiones y ponemos mayúscula inicial
            const title = segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

            return (
              <Fragment key={href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>

    
    <LogoutButton ></LogoutButton>
    

    </div>
  )
}