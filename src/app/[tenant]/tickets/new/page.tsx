import CreateTicketForm from "@/features/tickets/components/CreateTicketForm";

/** 
export const revalidate = 31536000;

export async function generateStaticParams() {
  //el cache component sirve solo si se saben todos los params, si no se saben hay que dejar la pagina completamente estatica
  return [{ tenant: 'fullmotos' }, { tenant: 'tecnofresno' }];
}
*/



/**
export async function generateStaticParams() {
  //el cache component sirve solo si se saben todos los params, si no se saben hay que dejar la pagina completamente estatica
  return [];
}
 */

export default function CreateTicketPage() {
  /**
'use cache'
  cacheLife('max')
  */

  /**
  const { data: serviceUsersFromSpecificTenant, error: errorUsersFromSpecificTenant } = await supabaseServer.rpc("get_service_users_with_tenant", { target_tenant_id: tenantData.id });

    // Manejo de error limpio
    if (!serviceUsersFromSpecificTenant || errorUsersFromSpecificTenant){
      redirect(`/error?type=Error trallendo informacion del tenant`);
    }
 */

  return (
    // Contenedor principal con diseño de tarjeta
    <div className="max-w-xl mx-auto">
      <article className="mt-20 mx-5 bg-white shadow-lg border border-black rounded-xs p-8 ">
        <h3 className="text-2xl font-bold text-gray-900">
          Crear un nuevo ticket
        </h3>

        {/* Manejo del formulario */}

        <CreateTicketForm />
      </article>
    </div>
  );
}
