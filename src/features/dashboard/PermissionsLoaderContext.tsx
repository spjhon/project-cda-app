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

export const PermissionsContext = createContext<RolesContextType | null>(null);

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
