"use client"

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function useCreateImageLink(path?: string | null) {
  return useQuery({
    queryKey: ["create-image-link", path],

    queryFn: async () => {
      if (!path) return null;

      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.storage
        .from("signatures")
        .createSignedUrl(path, 60 * 60);

      if (error) {
        throw error;
      }

      return data.signedUrl;
    },

    enabled: !!path,

    // La URL dura 1 hora, así que no necesitamos
    // solicitar otra inmediatamente.
    staleTime: 1000 * 60 * 50,
  });
}