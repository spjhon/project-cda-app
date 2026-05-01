"use client"



import { AssigneeSelect } from "@/features/tickets/components/AssigneeSelect";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import { Database } from "../../../../supabase/types/database.types";

import { useParams, useRouter } from "next/navigation";

import { fetchServiceUsersCached } from "@/lib/dbFunctions/get_service_users_with_tenant_cached";

import { Button } from "@/components/ui/button";
import { Loader2, TicketPlus } from "lucide-react";
import { fetchTenantData } from "@/lib/dbFunctions/fetch_tenant_domain_cached";

export type ServiceUser = Database['public']['Tables']['service_users']['Row'];
export type TenantSummary = Pick<Database['public']['Tables']['tenants']['Row'], 'id' | 'name' | 'domain'>;



export default function CreateTicketForm() {


 const router = useRouter()

const { tenant } = useParams();

const [tenantData, setTenantData] = useState<TenantSummary | null>(null);
const [usersData, setUsersData] = useState<ServiceUser[]>([]);
  


useEffect(() => {
    async function loadTenantData() {
      try {
        console.log("Cargando información del tenant para:", tenant);
        
        // Llamada a la promesa desde el cliente
        const { data: tenantData, error: errorTenantData } = await fetchTenantData(tenant as string);

        if (errorTenantData || !tenantData) {
          console.log("Error al traer información del tenant:", errorTenantData);
          router.push(`/error?type=Error trayendo informacion del tenant`);
          return;
        }

        

        const {data: usersFetched, error: usersError} = await fetchServiceUsersCached(tenantData.id)

        if (usersError || !usersFetched) {
          console.log("Error trallendo informacion de los usuarios", usersError?.message);
          router.push(`/error?type=Error trayendo informacion del tenant`);
          return;
        }


       setTenantData(tenantData)
        setUsersData(usersFetched);

      } catch (err) {

        console.log("Error inesperado:", err);
        router.push(`/error?type=Error inesperado en el cliente`);

      } finally {
        setIsLoading(false);
      }


    }

    loadTenantData();
  }, [tenant, router]); // Solo se ejecuta al montar o si el tenant cambia









 // 1. Inicialización de referencias con tipos de HTML
  const ticketTitleRef = useRef<HTMLInputElement>(null);
  const ticketDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();
  
  const [assignee, setAssignee] = useState<string | null>(null);



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>){

    
    event.preventDefault();
  

    const title = ticketTitleRef.current?.value || "";
    const description = ticketDescriptionRef.current?.value || "";
    

    if (title.trim().length > 4 && description.trim().length > 9) {

      // Usamos async/await para manejar la respuesta de forma lineal
      console.log(assignee)
      const {error } = await supabase
      .from("tickets")
      //ojo, aqui se presenta el error debito a que created_by se va a insertar por medio de un trigger
      .insert({title, description, tenant_id: tenantData?.id, assignee } as never)
      .select()
      .single();

      // Manejo de error limpio
      if (error) {
        setIsLoading(false);
        alert("No se puedo crear el ticket " + error.message + " "+ error.code);
        console.log("Error detallado:", error.message);
        return; // Detenemos la ejecución aquí
      }


      // Éxito (Si llegamos aquí, es porque no hubo error)
      alert("Ticket creado correctamente");
      // Limpiar referencias manualmente
        if (ticketTitleRef.current) ticketTitleRef.current.value = "";
        if (ticketDescriptionRef.current) ticketDescriptionRef.current.value = "";
      
        setAssignee(null); // Resetear el select
        setIsLoading(false);
      
    }else{
      
      alert("Un título debe tener al menos 5 caracteres y una descripción debe contener al menos 10");
    }



  }





  return (
    <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Campo de Título */}
        <div className="flex flex-col space-y-2">
          <label className="">Titulo</label>
          <input
            ref={ticketTitleRef}
            disabled={isLoading}
            placeholder="Escribe un titulo"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Campo de Descripción */}
        <div className="flex flex-col space-y-2">
          <label className="">Descripcion</label>
          <textarea
            ref={ticketDescriptionRef}
            placeholder="Adiciona una descripcion"
            disabled={isLoading}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>


        {/* Botón de Envío */}
        <div className="flex flex-col space-y-2">
          <label className="">Asignar Usuario</label>
          
          
            <AssigneeSelect 
              users={usersData} 
              onValueChanged={(val) => setAssignee(val)} 
            />
       
          
        </div>



        {/* Botón de Envío */}
        <Button
      type="submit"
      disabled={isLoading}
      // Usamos "default" para que tome el color primario del tema actual
      variant="default" 
      size="lg"
      className="w-full mt-4 font-semibold py-6 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Creando ticket...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <TicketPlus className="h-5 w-5" />
          <span>Crear el ticket ahora</span>
        </div>
      )}
    </Button>
      </form>
  )
}


