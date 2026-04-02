"use client";

import {  useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { ServiceUser } from "./CreateTicketForm";





export function AvailabilitySelect({ 
  user_id, 
  is_available,
  setUsersData
}: { 
  user_id: string;
  is_available: boolean;
  setUsersData: React.Dispatch<React.SetStateAction<ServiceUser[]>>
}) {
  
  const supabase = createSupabaseBrowserClient();
  



const [isLoading, setIsLoading] = useState(false);





  const handleStatusChange = async (value: string | null) => {
    if (!value) return;
    setIsLoading(true);
    const newStatus = value === "available";


    try{

 // Llamada DIRECTA a Supabase (Cuesta $0 en Vercel)
    const {data: finaleUpdateAvailability, error: errorUpdateAvailability } = await supabase
    .from("service_users")
    .update({ is_available: newStatus })
    .eq("id", user_id)
    .select() // <--- OBLIGATORIO para recibir la fila actualizada
    .single();

    if(errorUpdateAvailability || !finaleUpdateAvailability){
      console.log("Error actualizando el status.")
      throw new Error("Error actualizando el status.")
    }


      setUsersData((prevUsers) => 
        prevUsers.map((user) => 
          user.id === user_id 
            ? { ...user, is_available: newStatus } // Si es el ID, cambiamos el status
            : user // Si no, lo dejamos igual
        )
      );





    }catch(error){
      const message = error instanceof Error? error.message : "Error actualizando el disponiblidad."
      console.log(message)
    }finally{
      setIsLoading(false);
     
    }



  };

  return (
    <Select 
      onValueChange={handleStatusChange}
      value={is_available ? "available" : "unavailable"}
      disabled={isLoading}
    >
      <SelectTrigger className="w-35">
        <SelectValue placeholder={is_available ? "Disponible" : "No disponible"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="available">Disponible</SelectItem>
          <SelectItem value="unavailable">No disponible</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}