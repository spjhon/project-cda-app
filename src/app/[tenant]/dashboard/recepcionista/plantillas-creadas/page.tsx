"use client"



import { ReceptionistContext } from "@/features/dashboard/DataLoaderContex";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";


export default function CreatedTemplatesPage() {


const contextRecived = useContext(ReceptionistContext);

const templateTableData = contextRecived.ReceptionistContextValue.templateTableData;

const tenantId = contextRecived.ReceptionistContextValue.tenantObject?.id;

console.log(templateTableData)

const supabaseBrowser = createSupabaseBrowserClient();

const {data, isFetching } = useQuery({
    queryKey: ['templates', 'list'],
    queryFn: async () => {
      // LLAMADA DIRECTA A SUPABASE
      const { data, error } = await supabaseBrowser.rpc("fetch_orders_templates", {
        p_tenant_id: tenantId,
      });

      if (error) throw new Error(error.message);
      return data;
    },
    initialData: templateTableData,
    staleTime: 10000,
  });

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Lista de Plantillas</h2>
      
      {/* Mostramos un indicador pequeño cuando se está revalidando en background */}
      {isFetching && <p className="text-xs text-blue-500">Actualizando datos...</p>}

      <ul className="mt-4 space-y-2">
        {/* Como ahora 'data' es un Array, lo mapeamos */}
        {Array.isArray(data) ? data.map((template) => (
          <li key={template.id} className="p-2 border rounded shadow-sm">
            {template.template_name} - <span className="text-gray-500">v{template.version}</span>
          </li>
        )) : (
          <p>No hay plantillas o el formato es incorrecto.</p>
        )}
      </ul>
    </div>
  )
}
