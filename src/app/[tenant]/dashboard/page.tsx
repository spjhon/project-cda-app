"use client"

import { PermissionsContext } from "@/features/dashboard/PermissionsLoaderContext";
import Link from "next/link";
import { useContext } from "react";


export default function DashboardPage() {

const permissionscontextRecived = useContext(PermissionsContext);

const roles = permissionscontextRecived?.PermissionsContextValue

console.log( roles)

  return (
    <div>
      DashboardPage
      <div className="m-2">
        Estos son los permisos otorgados al usuario en este tenant
      </div>
      <Link
      href="/dashboard/recepcionista"
      >
      Link a recepcionista
      </Link>
    </div>
  )
}
