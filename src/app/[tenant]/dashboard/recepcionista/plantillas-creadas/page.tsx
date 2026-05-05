"use client";

import CreatedTemplatesTable from "@/features/dashboard/CreatedTemplatesTable";
import { ReceptionistContext } from "@/features/dashboard/ReceptionistLoaderContex";

import { useContext } from "react";

export default function CreatedTemplatesPage() {


  const contextReceived = useContext(ReceptionistContext);
  
  // Extraemos la query y la mutación del contexto
  const templateContext = contextReceived?.ReceptionistContextValue.templateTableData;

  if (!templateContext) return "No hay datos que mostrar desde el contexto templateContext"; // O un skeleton/loader

  const { query, mutation } = templateContext;

  return (
    <CreatedTemplatesTable
      // Datos y estados de la Query
      data={query.data}
      isError={query.isError}
      error={query.error}
      refetch={query.refetch}
      isFetching={query.isFetching}
      isSuccess={query.isSuccess}
      
      // Acciones y estados de la Mutación
      onUpdateStatus={(id, is_active) => mutation.mutate({ id, is_active })}
      isUpdating={mutation.isPending}
    />
  );
}