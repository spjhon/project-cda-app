"use client";

import { AssigneeSelect } from "@/features/tickets/components/AssigneeSelect";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ServiceUser } from "./CreateTicketForm";

export default function AssigneeWrapper({ ticketId, usersData, defaultValue }: { 
  ticketId: string; 
  defaultValue?: string | null; 
  usersData: ServiceUser[];
}) {
  const supabase = createSupabaseBrowserClient();

  const handleUpdate = async (val: string | null) => {
    // Aquí ejecutas la lógica de actualización en Supabase
    console.log("se puso a trabajar la funcion handleupdate")
    const { error } = await supabase
      .from("tickets")
      .update({ assignee: val })
      .eq("id", ticketId);

    if (error) alert("Error al actualizar: " + error.message);
  };

  return (
    <AssigneeSelect
      users={usersData}
      onValueChanged={handleUpdate}
      defaultValue={defaultValue}
    />
  );
}