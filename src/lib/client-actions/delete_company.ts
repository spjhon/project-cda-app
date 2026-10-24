"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "../supabase/client";


type DeleteCompanyParams = {
  companyId: string;
};

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId }: DeleteCompanyParams) => {
      const supabaseBrowser = createSupabaseBrowserClient();

      const { data, error } = await supabaseBrowser
        .from("tenants_company")
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq("id", companyId)
        .is("deleted_at", null)
        .select("id")
        .maybeSingle();

      if (error) {
        throw new Error(`Error al eliminar la empresa: ${error.message}`);
      }

      if (!data) {
        throw new Error(
          "No se encontró la empresa, ya fue eliminada o no tienes permisos para modificarla.",
        );
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
    },
  });
}