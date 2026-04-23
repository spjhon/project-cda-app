"use client"

import { UserContextData } from "@/app/[tenant]/dashboard/recepcionista/layout";
import { OrderTemplate } from "@/lib/dbFunctions/fetch_orders_templates";
import { TenantFetchResult } from "@/lib/dbFunctions/fetch_tenant_domain_cached";
import { createContext, ReactNode, use } from "react";


// Esta es la forma de los datos que vivirán en el contexto
interface ReceptionistContextType {
  ReceptionistContextValue: {
    tenantObject: TenantFetchResult["data"] | undefined;
    user: UserContextData | null;
    otroValor: string;
    templateTableData: OrderTemplate[] | null;
  };
}




// Tipamos el Contexto (quitamos el 'any')
export const ReceptionistContext = createContext<ReceptionistContextType | null>(null);

interface DataLoaderContext {
  children: ReactNode;
  tenantPromise: Promise<TenantFetchResult | null>;
  userPromise: Promise<UserContextData | null>;
  templateTabelDataPromise: Promise<OrderTemplate[] | null>;
}

export default function DataLoaderContext({tenantPromise, userPromise, templateTabelDataPromise, children}: DataLoaderContext) {

const result = use(tenantPromise);
const user = use(userPromise);
const templateTableData = use(templateTabelDataPromise);



const ReceptionistContextValue = {
  tenantObject: result?.data,
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
