"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { fetchServiceUsersCached} from "@/lib/dbFunctions/get_service_users_with_tenant_cached";

import TicketComments, { TicketComment } from "../../../../../features/tickets/components/ticketComment";
import DeleteButton from "@/features/tickets/components/DeleteButton";
import AssigneeWrapper from "@/features/tickets/components/AssigneeWrapper";
import TicketStatusSelect from "@/features/tickets/components/TicketStatusSelect";
import { Badge } from "@/components/ui/badge";
import { ServiceUser } from "@/features/tickets/components/CreateTicketForm";
import { getAuthorNameAction } from "@/lib/dbFunctions/fetch_autor_name_ticket";
import { fetchTenantData } from "@/lib/dbFunctions/fetch_tenant_domain_cached";

const statusStyles: Record<string, string> = {
  open: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100/80",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100/80",
  done: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80",
  cancelled: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100/80",
  information_missing: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100/80",
};

// --- INTERFACES ---




interface Ticket {
  id: string;
  ticket_number: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  created_by: string;
  assignee: string | null;
  tenant_id: string;
  comments: TicketComment[];
}

interface PageData {
  ticket: Ticket;
  tenantData: { id: string; name: string; domain: string };
  autorName: { full_name: string | null };
  serviceUserId: string;
  usersData: ServiceUser[];
}





/**
 * 
 * @returns The table tickets
 */
export default function TicketDetailPage() {



  const params = useParams();
  const supabase = createSupabaseBrowserClient();

  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PageData | null>(null);
  const [currentStatus, setCurrentStatus] = useState("");



  useEffect(() => {
    async function loadAllData() {

      try {

        setIsLoading(true);


        const slugId = params.slugId as string;
        const tenant = params.tenant as string;



        // 1. Tenant Data
        const { data: tenantData, error: tError } = await fetchTenantData(tenant);
        if (tError || !tenantData) throw new Error("No se pudo encontrar el Tenant.");

        // 2. Ticket con comentarios
        const { data: ticket, error: ticketError } = await supabase
          .from("tickets")
          .select("*, comments (*, comment_attachments (*) )")
          .order("created_at", { ascending: true, foreignTable: "comments" })
          .eq("ticket_number", Number(slugId))
          .eq("tenant_id", tenantData.id)
          .single();

        if (ticketError || !ticket) throw new Error("Ticket no encontrado.");
        

        // 3. Autor (Action), Sesión y Usuarios (RPC Action) en paralelo
        const [autorRes, sessionRes, usersRes] = await Promise.all([
          getAuthorNameAction(ticket.created_by), // <-- Ahora usamos la Server Action
          supabase.auth.getUser(),
          fetchServiceUsersCached(tenantData.id)
        ]);

        // Verificamos errores de la Action de autor
        if (autorRes.error) {
          console.warn("No se pudo obtener el nombre del autor por RLS, usando fallback.");
          
        }

        // Validamos que exista el usuario de sesión antes de seguir
        const user = sessionRes.data?.user;
        if (!user) {
          throw new Error("No se encontró una sesión activa.");
        }

                // 4. Usuario actual logueado
        // (Seguimos necesitando su ID para saber si es el dueño y mostrar el botón de borrar)
        const { data: sUser } = await supabase
          .from("service_users")
          .select("id")
          .eq("auth_user_id", sessionRes.data.user.id)
          .single();

        setData({
          ticket: ticket as Ticket,
          tenantData,
          autorName: autorRes.data || { full_name: "Usuario del Sistema" }, // Fallback si falla
          serviceUserId: sUser?.id || "",
          usersData: usersRes.data || [],
        });


        setCurrentStatus(ticket.status)

      } catch (err: unknown) {
        // We check if it is an instance of Error (most common)
        if (err instanceof Error) {
          console.log("Error detectado:", err.message);
          setError(err.message);
        } 
        //Handling for cases where it is not an object Error (e.g., throw "string")
        else {
          const defaultMessage = "Error desconocido extrayendo datos para la tabla tickets";
          console.log(defaultMessage, err);
          setError(defaultMessage);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadAllData();
  }, [params.slugId, params.tenant, supabase]);

  // Pantalla de Carga
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Cargando detalles del ticket...</p>
      </div>
    );
  }

  // Pantalla de Error
  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-6 border-2 border-red-100 bg-red-50 rounded-2xl flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-red-900">¡Ups! Algo salió mal</h2>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { ticket, tenantData, autorName, serviceUserId, usersData } = data;
  const isAuthor = serviceUserId === ticket.created_by;
  const dateString = new Date(ticket.created_at).toLocaleString("es-ES");

  return (
    <div className="max-w-4xl mx-auto mt-16 px-4 mb-20 animate-in fade-in duration-500">
      <div className="mb-8 space-y-1">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Ticket <span className="text-slate-400 font-light">#{params.slugId}</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">Gestión de detalles y trazabilidad.</p>
      </div>

      <article className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <header className="p-8 pb-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${statusStyles[currentStatus] || "bg-slate-100"}`}>
                {currentStatus.replace('_', ' ')}
              </Badge>

              {isAuthor && (
                <TicketStatusSelect
                  user_id={ticket.created_by}
                  currentStatus={currentStatus}
                  setCurrentStatus={setCurrentStatus}
                  ticket_id={ticket.id}
                />
              )}

              <time className="text-xs font-medium text-slate-400 uppercase tracking-wider">{dateString}</time>
            </div>

            <div className="flex items-center gap-2">
              <AssigneeWrapper 
                ticketId={ticket.id} 
                usersData={usersData} 
                defaultValue={ticket.assignee} 
              />
              {isAuthor && (
                <div className="pl-2 border-l border-slate-200">
                  <DeleteButton ticketId={ticket.id} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{ticket.title}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Creado por</span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                <div className="w-4 h-4 rounded-full bg-slate-300" /> 
                {autorName.full_name}
              </span>
            </div>
          </div>
        </header>

        <section className="p-8 pt-6 prose prose-slate max-w-none border-t border-slate-100">
          <p className="text-slate-700 text-[16px] leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </section>

        <footer className="bg-slate-50/50 p-8 border-t border-slate-100">
          <TicketComments 
            ticket_id={ticket.id} 
            comments={ticket.comments} 
            tenant_id={tenantData.id} 
            tenantName={params.tenant as string}
          />
        </footer>
      </article>
    </div>
  );
}