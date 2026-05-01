"use client";

import { OrderTemplate } from "@/lib/dbFunctions/fetch_orders_templates";

import { createContext, ReactNode, use } from "react";

// Esta es la forma de los datos que vivirán en el contexto
interface ReceptionistContextType {
  ReceptionistContextValue: {
    templateTableData: OrderTemplate[] | null;
  };
}

// Tipamos el Contexto (quitamos el 'any')
export const ReceptionistContext =
  createContext<ReceptionistContextType | null>(null);

interface ReceptionistLoaderContext {
  children: ReactNode;

  templateTabelDataPromise: Promise<OrderTemplate[] | null>;
}

export default function ReceptionistLoaderContext({
  templateTabelDataPromise,
  children,
}: ReceptionistLoaderContext) {
  const templateTableData = use(templateTabelDataPromise);

  const ReceptionistContextValue = {
    templateTableData: templateTableData,
  };

  return (
    <ReceptionistContext.Provider value={{ ReceptionistContextValue }}>
      {children}
    </ReceptionistContext.Provider>
  );
}
