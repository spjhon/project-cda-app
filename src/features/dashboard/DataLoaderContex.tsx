"use client"

import { createContext, ReactNode, use } from "react";

export const ReceptionistContext = createContext<any>(undefined);

interface DataLoaderContext {
  children: ReactNode;
  tenantPromise: Promise<any>;
  userPromise: Promise<any>;
  templateTabelDataPromise: Promise<any>;
}

export default function DataLoaderContext({tenantPromise, userPromise, templateTabelDataPromise, children}: DataLoaderContext) {

const result = use(tenantPromise);
const user = use(userPromise);
const templateTableData = use(templateTabelDataPromise);



const ReceptionistContextValue = {
  tenantObject: result.data,
  user: user,
  otroValor: "saludos desde el context",
  templateTableData: templateTableData
} 



  return (
    <ReceptionistContext.Provider value={{ ReceptionistContextValue }}>
    {children}
    </ReceptionistContext.Provider>
  )
}
