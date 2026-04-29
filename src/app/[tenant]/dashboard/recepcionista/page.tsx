"use client"

import { ReceptionistContext } from "@/features/dashboard/DataLoaderContex";
import { useContext } from "react";


export default function NewEntryOrder() {

 const contextRecived = useContext(ReceptionistContext);
  const tenantId = contextRecived?.ReceptionistContextValue.tenantObject?.id
  const logo_url = contextRecived?.ReceptionistContextValue.tenantObject?.logo_url
  const user = contextRecived?.ReceptionistContextValue.user;
  const templateTableData = contextRecived?.ReceptionistContextValue.templateTableData;

  
  console.log(templateTableData)


  return (
    <div className="border border-amber-500">NewEntryOrderPage</div>
  )
}
