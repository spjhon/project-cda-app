"use client";

import { ReceptionistContext } from "@/features/dashboard/ReceptionistLoaderContex";
import { PermissionsContext } from "@/features/dashboard/PermissionsLoaderContext";
import CreatedTemplatesTable from "@/features/dashboard/TemplatesTable";
import { OrderTemplate } from "@/lib/dbFunctions/fetch_orders_templates";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";




export default function CreatedTemplatesPage() {

  const queryClient = useQueryClient();

  const contextRecived = useContext(ReceptionistContext);
  const permissionscontextRecived = useContext(PermissionsContext);

  const templateTableData = contextRecived?.ReceptionistContextValue.templateTableData;
  const tenantId = permissionscontextRecived?.PermissionsContextValue.tenantObject?.id;


const [orderBy, setOrderBy] = useState<string>("document_name");
const [orderDir, setOrderDir] = useState<"asc" | "desc">("asc");


  const supabaseBrowser = createSupabaseBrowserClient();

  //Llamado nuevaamente a los datos que llegaron inicialmente por medio de la promesa
  const { data, isFetching, isError, error, refetch, isSuccess } = useQuery({
    queryKey: ["templates", "list", orderBy, orderDir],
    queryFn: async () => {
      console.log("se llamo la funcion de query")
      // LLAMADA DIRECTA A SUPABASE
      const { data, error } = await supabaseBrowser.rpc(
        "fetch_orders_templates",
        {
          p_tenant_id: tenantId ? tenantId : "",
        },
      );

      if (error) throw new Error(error.message);

      


      return (data as unknown as OrderTemplate[]) || [];
    },
    initialData: templateTableData,
    staleTime: 10000,
  });





  //useMutation utilizado para cambiar el state de is_active que esta en un switch en el componente hijo
  const { mutate, isPending: isUpdating } = useMutation({
    mutationFn: async ({id, is_active}: {id: string;is_active: boolean}) => {

      const { error } = await supabaseBrowser
        .from("order_template") // Asegúrate de que este sea el nombre de tu tabla
        .update({ is_active })
        .eq("id", id);

      if (error) throw new Error(error.message);
      return { id, is_active };
    },


    // Al tener éxito, invalidamos la cache para que useQuery vuelva a pedir los datos
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", "list"] });
    },

    onError: (err) => {
      console.error("Error al actualizar:", err);
      // Aquí podrías disparar un toast de error
    },


  });

/**

  const sortedData = [...(data)].sort((a, b) => {
        // 1. Obtenemos los valores originales
        const rawA = a[orderBy as keyof OrderTemplate];
        const rawB = b[orderBy as keyof OrderTemplate];

        // 2. Normalizamos: Si es null o undefined, lo convertimos en string vacío
        // Usamos String() para que booleanos, números y nulls se puedan comparar como texto
        const valueA = rawA ?? ""; 
        const valueB = rawB ?? "";

        // 3. Comparación segura
        if (valueA < valueB) return orderDir === "asc" ? -1 : 1;
        if (valueA > valueB) return orderDir === "asc" ? 1 : -1;
        return 0;
      });

 */
  return (
    <CreatedTemplatesTable
      data={data}
      isError={isError}
      error={error}
      refetch={refetch}
      isFetching={isFetching}
      isSuccess={isSuccess}
      onUpdateStatus={(id, is_active) => mutate({ id, is_active })} // Pasamos la función al hij
      isUpdating={isUpdating}

      // NUEVAS PROPS DE ORDENAMIENTO
  orderBy={orderBy}
  setOrderBy={setOrderBy}
  orderDir={orderDir}
  setOrderDir={setOrderDir}
    ></CreatedTemplatesTable>
  );
}
