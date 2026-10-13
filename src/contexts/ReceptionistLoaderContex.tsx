
"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { createContext, ReactNode, useContext } from "react";
import { PermissionsContext } from "./PermissionsLoaderContext";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { OrderTemplateType } from "@/types/functions_types";

// --------------------------------------------
// TIPOS DEL CONTEXTO
// --------------------------------------------

export interface ReceptionistContextType {
  ReceptionistContextValue: {
    rol: string;
    templateQuery: UseQueryResult<OrderTemplateType[], Error>;
  };
}

export const ReceptionistContext = createContext<ReceptionistContextType | null>(null);

interface ReceptionistLoaderContextProps {
  children: ReactNode;
  rol: string;
}

// --------------------------------------------
// PROVIDER
// --------------------------------------------

export default function ReceptionistLoaderContext({
  rol,
  children,
}: ReceptionistLoaderContextProps) {
  const permissionsContextReceived = useContext(PermissionsContext);

  const tenantId =
    permissionsContextReceived?.PermissionsContextValue.tenantObject?.id;

  const pathname = usePathname();

  const supabaseBrowser = createSupabaseBrowserClient();







  // --------------------------------------------
  // TANSTACK QUERY: TEMPLATES
  // --------------------------------------------

  const templateQuery = useQuery<OrderTemplateType[], Error>({
    queryKey: ["templates", "list", tenantId],

    queryFn: async () => {
      if (!tenantId) {
        throw new Error("No se encontró el ID del tenant.");
      }

      console.log("Se ejecutó la consulta de templates");

      const { data, error } = await supabaseBrowser.rpc(
        "fetch_orders_templates",
        {
          p_tenant_id: tenantId,
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      return (data as unknown as OrderTemplateType[]) ?? [];
    },

    enabled: pathname === "/dashboard/recepcionista",
    staleTime: Infinity,
    refetchInterval: pathname === "/dashboard/recepcionista" ? 20000 : false,
    refetchOnWindowFocus: false,
  });









  // --------------------------------------------
  // VALOR DEL CONTEXTO
  // --------------------------------------------

  const ReceptionistContextValue: ReceptionistContextType = {
    ReceptionistContextValue: {
      rol,
      templateQuery
    },
  };

  return (
    <ReceptionistContext.Provider value={ReceptionistContextValue}>
      {children}
    </ReceptionistContext.Provider>
  );
}
