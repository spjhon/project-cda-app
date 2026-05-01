"use client"

import { ReceptionistContext } from "@/features/dashboard/ReceptionistLoaderContex";
import { PermissionsContext } from "@/features/dashboard/PermissionsLoaderContext";
import { useContext } from "react";


export default function NewEntryOrder() {

 const contextRecived = useContext(ReceptionistContext);
 const permissionscontextRecived = useContext(PermissionsContext);
  const tenantId = permissionscontextRecived?.PermissionsContextValue.tenantObject?.id
  const logo_url = permissionscontextRecived?.PermissionsContextValue.tenantObject?.logo_url
  const user = permissionscontextRecived?.PermissionsContextValue.user;
  const templateTableData = contextRecived?.ReceptionistContextValue.templateTableData;

  
 


  return (
    <div className="border border-amber-500">NewEntryOrderPage</div>
  )
}
