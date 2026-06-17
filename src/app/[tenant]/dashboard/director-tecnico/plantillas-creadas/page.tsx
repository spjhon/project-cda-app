"use client";

import CreatedTemplatesTable from "@/components/dashboard/director-tecnico/CreatedTemplatesTable";
import { DirectorTecnicoContext } from "@/contexts/DirectorTecnicoLoaderContext";


import { useContext } from "react";

export default function CreatedTemplatesPage() {


  const contextReceived = useContext(DirectorTecnicoContext);
  
  // Extraemos la query y la mutación del contexto
  const templateContext = contextReceived?.DirectorTecnicoContextValue.templateTableData;

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
      onUpdateStatus={(id, is_active) => mutation.updateIsActive({ id, is_active })}
      isUpdating={mutation.isUpdating}
      deleteTemplate={(id, tenantId) => mutation.deleteTemplate({ id, tenantId })}
      isDeletingTemplate={mutation.isDeletingTemplate}
      errorDeletingTemplate={mutation.errorDeletingTemplate}
      resetDeleteMutation={mutation.resetDeleteMutation}
    />
  );
}