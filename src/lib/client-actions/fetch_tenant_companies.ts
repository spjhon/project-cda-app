
"use client";

import { useQuery } from "@tanstack/react-query";
//import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "../supabase/client";

import { useContext } from "react";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";

export function useCompanies() {
 // const pathname = usePathname();
  const supabaseBrowser = createSupabaseBrowserClient();

  const permissionscontextRecived = useContext(PermissionsContext);
  const tenantId = permissionscontextRecived?.PermissionsContextValue.tenantObject?.id;

  return useQuery({
    queryKey: ["companies", tenantId],

    queryFn: async () => {

        //await new Promise((resolve) => setTimeout(resolve, 2000));
      const { data, error } = await supabaseBrowser
        .from("tenants_company")
        .select(
          "id, tenant_id, nit, name, address, phone, email, created_at, updated_at, deleted_at",
        )
        .eq("tenant_id", tenantId!)
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (error) {
        console.error(
          "Error al obtener las empresas del tenant:",
          error.message,
        );

        throw new Error(error.message);
      }

      return data;
    },

    staleTime: Infinity,
    refetchOnWindowFocus: false,
    enabled:
      
      !!tenantId,
  });
}
