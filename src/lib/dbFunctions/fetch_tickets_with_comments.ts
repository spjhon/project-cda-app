
"use server"

import { createSupabaseAdminClient } from "@/lib/supabase/admin";


// Definimos el tipo de retorno para que tu autocompletado sea una maravilla



export async function getTicketsAction({
  tenantId,
  page,
  search,
  pageSize = 6,
}: {
  tenantId: string;
  page: number;
  search: string;
  pageSize?: number;
}) {
  


  const supabase = createSupabaseAdminClient();
  const startingPoint = (page - 1) * pageSize;



  try {
    // Construimos la query base
    let query = supabase
      .from("tickets")
      .select(`
        *,
        creator:service_users!created_by (full_name)
      `, { count: "exact" }) // 'exact' nos da el total de filas filtradas
      .eq("tenant_id", tenantId);

    // Aplicamos el filtro de búsqueda si existe
    if (search.trim()) {
      const filter = `title.ilike.%${search}%,description.ilike.%${search}%`;
      query = query.or(filter);
    }

    // Paginación y orden
    const { data, count, error } = await query
      .range(startingPoint, startingPoint + (pageSize - 1))
      .order("created_at", { ascending: true });

    if (error) {
      return { data: null, error: error };
    }

    const totalCount = count || 0;
    const hasMore = totalCount > page * pageSize;

    return {
      data: {
        tickets: data || [],
        count: totalCount,
        hasMore: hasMore,
      },
      error: null,
    };





  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Error desconocido en el servidor",
    };
  }
}