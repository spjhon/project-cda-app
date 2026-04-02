"use server"

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getAuthorNameAction(userId: string) {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data, error } = await supabaseAdmin
    .from("service_users")
    .select("full_name")
    .eq("id", userId)
    .single();

  if (error) {
    console.log("Error fetching author name:", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}