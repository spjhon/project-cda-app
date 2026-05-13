"use client";

import { UserContextData } from "@/app/[tenant]/dashboard/layout";
import { TenantFetchResult } from "@/lib/dbFunctions/fetch_tenant_domain_cached";
import { createContext, ReactNode, use } from "react";

interface RolesContextType {
  PermissionsContextValue: {
    tenantObject: TenantFetchResult["data"] | undefined;
    user: UserContextData | null;
    RolesArray: string[];
  };
}

interface PermissionsLoaderContextProps {
  tenantPromise: Promise<TenantFetchResult>;
  userPromise: Promise<UserContextData>;
  RolesDataPromise: Promise<string[]>;

  children: ReactNode;
}

/**Creacion del context con el tipado de que es lo que devuelve y deja listo en el contexto */
export const PermissionsContext = createContext<RolesContextType | null>(null);

/**
 * 
 * @param param0 Entran las tres promesas que se crean desde el layout y los children que no se van a renderizar sino hasta que se resuelvan las promesas
 * @returns Retorna el provider del context que se creo aqui para que los componentes cliente que esten en children tengan acceso al context PermissionsContextValue
 */
export default function PermissionsLoaderContext({
  tenantPromise,
  userPromise,
  RolesDataPromise,

  children,
}: PermissionsLoaderContextProps) {
  const RolesData = use(RolesDataPromise);
  const user = use(userPromise);
  const tenantData = use(tenantPromise);

  const PermissionsContextValue = {
    tenantObject: tenantData?.data,
    user: user,
    RolesArray: RolesData,
  };

  return (
    <PermissionsContext.Provider value={{ PermissionsContextValue }}>
      {children}
    </PermissionsContext.Provider>
  );
}
