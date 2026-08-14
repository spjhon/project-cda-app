"use client";

import { UserContextData } from "@/app/[tenant]/(private)/dashboard/layout";
import { TenantFetchResult } from "@/lib/server-actions/fetch_tenant_domain_cached";
import { TenantModule } from "@/lib/server-actions/fetch_tenant_modules";
import { createContext, ReactNode, use } from "react";

interface RolesContextType {
  PermissionsContextValue: {
    tenantObject: TenantFetchResult["data"] | undefined;
    user: UserContextData;
    RolesArray: string[];
    tenantModules: TenantModule[]
  };
}

interface PermissionsLoaderContextProps {
  tenantPromise: Promise<TenantFetchResult>;
  userPromise: Promise<UserContextData>;
  RolesDataPromise: Promise<string[]>;
ModulesDataPromise: Promise<TenantModule[]>;
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
ModulesDataPromise,
  children,
}: PermissionsLoaderContextProps) {
  const RolesData = use(RolesDataPromise);
  const user = use(userPromise);
  const tenantData = use(tenantPromise);
  const tenantModules = use(ModulesDataPromise);

  const PermissionsContextValue = {
    tenantObject: tenantData?.data,
    user: user,
    RolesArray: RolesData,
    tenantModules
  };

  return (
    <PermissionsContext.Provider value={{ PermissionsContextValue }}>
      {children}
    </PermissionsContext.Provider>
  );
}
