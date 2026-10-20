"use client"


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyFormData } from "../zod-schemas/validaciones-formularios/companySchema ";
import { createSupabaseBrowserClient } from "../supabase/client";


export function useCreateCompany() {

    
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const supabaseBrowser = createSupabaseBrowserClient();
      const { data: company, error } = await supabaseBrowser.rpc(
        "create_tenant_company",
        {
         p_tenant_id: data.tenant_id,
          p_nit: data.nit,
          p_name: data.name,
          p_address: data.address,
          p_phone: data.phone,
          p_email: data.email,
        },
      );

      if (error) {
        throw error.message;
      }

      return company;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
    },
  });
}
