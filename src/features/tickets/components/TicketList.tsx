"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchTenantDataCached } from "@/lib/dbFunctions/fetch_tenant_domain_cached";
import { getTicketsAction } from "@/lib/dbFunctions/fetch_tickets_with_comments";

const statusStyles: Record<string, string> = {
  open: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  done: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  information_missing: "bg-amber-100 text-amber-700 border-amber-200",
};

// 1. Tipado correcto para el estado
interface TicketsState {
  tickets: {
        assignee: string | null;
        assignee_name: string | null;
        created_at: string;
        created_by: string;
        description: string | null;
        id: string;
        status: string;
        tenant_id: string;
        ticket_number: number;
        title: string;
        updated_at: string;
        creator: {
            full_name: string | null;
        };
    }[];
  count: number;
  hasMore: boolean;
}

export function TicketList() {
  const { tenant } = useParams();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  // 2. Inicializamos como null para manejar la carga inicial
  const [fetchedTicketsState, setFetchedTicketsState] = useState<TicketsState | null>(null);

  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search") || "";
  const searchValue = search.trim();
  const pageSanitazed = Math.max(1, Number(page) || 1);

  useEffect(() => {
    async function loadTicketData() {
      setIsLoading(true);
      try {
        const { data: tenantData } = await fetchTenantDataCached(tenant as string);
        if (!tenantData) return;

        const response = await getTicketsAction({
          tenantId: tenantData.id,
          page: pageSanitazed,
          search: searchValue
        });

        if (response.data) {
          setFetchedTicketsState(response.data);
        }
      } catch (error) {
        console.log("Error cargando tickets:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTicketData();
    // 3. AGREGAR DEPENDENCIAS: Para que recargue al cambiar página o búsqueda
  }, [tenant, pageSanitazed, searchValue]);

  const getHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-sm text-gray-600 bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-medium">ID</th>
              <th className="py-3 px-4 font-medium">Titulo</th>
              <th className="py-3 px-4 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
                    <p className="text-sm">Cargando tickets...</p>
                  </div>
                </td>
              </tr>
            ) : fetchedTicketsState?.tickets.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-10 text-center text-gray-500">
                  No se encontraron tickets.
                </td>
              </tr>
            ) : (
              fetchedTicketsState?.tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-gray-500 font-medium">#{ticket.ticket_number}</td>
                  <td className="py-3 px-4">
                    <Link   href={`/tickets/details/${ticket.ticket_number}`} className="text-blue-600 hover:underline font-semibold block">
                      {ticket.title}
                    </Link>
                    <span className="text-xs text-gray-400">por {ticket.creator?.full_name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={`capitalize ${statusStyles[ticket.status] || "bg-gray-100"}`}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 4. PAGINACIÓN: Fuera de la tabla */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-500">
          Total: {fetchedTicketsState?.count || 0}
        </div>
        <div className="flex gap-2">
          {pageSanitazed > 1 && !isLoading &&(
            <Link  href={getHref(pageSanitazed - 1)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm">
              ← Anterior
            </Link>
          )}
          {fetchedTicketsState?.hasMore && !isLoading &&(
            <Link  href={getHref(pageSanitazed + 1)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm">
              Siguiente →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}