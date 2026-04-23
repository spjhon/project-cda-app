"use client"



import { ReceptionistContext } from "@/features/dashboard/DataLoaderContex";
import CreatedTemplatesTable from "@/features/dashboard/TemplatesTable";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";


export default function CreatedTemplatesPage() {


const contextRecived = useContext(ReceptionistContext);

const templateTableData = contextRecived?.ReceptionistContextValue.templateTableData;
const tenantId = contextRecived?.ReceptionistContextValue.tenantObject?.id;






const supabaseBrowser = createSupabaseBrowserClient();

const {data, isFetching, isError, error, refetch, isSuccess} = useQuery({
    queryKey: ['templates', 'list'],
    queryFn: async () => {
      // LLAMADA DIRECTA A SUPABASE
      const { data, error } = await supabaseBrowser.rpc("fetch_orders_templates", {
        p_tenant_id: tenantId? tenantId : "",
      });

      if (error) throw new Error(error.message);


      
      return data;
    },
    initialData: templateTableData,
    staleTime: 10000,
  });




  

  return (
    <CreatedTemplatesTable data={data} isError={isError} error={error} refetch={refetch} isFetching={isFetching} isSuccess={isSuccess}></CreatedTemplatesTable>
  )
}
