"use client";

import { fetchTenantDataType } from "@/lib/server-actions/fetch_tenant_domain_cached";
import { TenantModuleType } from "@/lib/server-actions/fetch_tenant_modules";
import { get_tenant_roles_type } from "@/types/functions_types";
import { UserContextDataType } from "@/types/internal_types";
import { createContext, ReactNode, use } from "react";

interface PermissionsContextType {
  PermissionsContextValue: {
    tenantObject: fetchTenantDataType["data"] | undefined;
    user: UserContextDataType;
    RolesArray: get_tenant_roles_type;
    tenantModules: TenantModuleType[];
  };
}

interface PermissionsLoaderContextProps {
  tenantPromise: Promise<fetchTenantDataType>;
  userPromise: Promise<UserContextDataType>;
  RolesDataPromise: Promise<get_tenant_roles_type>;
  ModulesDataPromise: Promise<TenantModuleType[]>;
  children: ReactNode;
}

/**Creacion del context con el tipado de que es lo que devuelve y deja listo en el contexto */
export const PermissionsContext = createContext<PermissionsContextType | null>(null);

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
    tenantModules,
  };

  return (
    <PermissionsContext.Provider value={{ PermissionsContextValue }}>
      {children}
    </PermissionsContext.Provider>
  );
}
